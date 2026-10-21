const { Client } = require('@notionhq/client');

const normalize = (value) => String(value ?? '').replace(/\u3000/g, ' ').trim();
const readText = (property) =>
    (property?.title || property?.rich_text || []).map((item) => item.plain_text ?? item.text?.content ?? '').join('');

// Serialize a student's writes so two page loads cannot reuse the same blank row.
const studentWrites = new Map();
function saveScopeToNotion(notion, databaseId, scope) {
    return queueStudentWrite(databaseId, scope.studentName, () => writeScope(notion, databaseId, scope));
}

function queueStudentWrite(databaseId, studentName, operation) {
    const key = JSON.stringify([databaseId, studentName]);
    const previous = studentWrites.get(key) || Promise.resolve();
    const request = previous.catch(() => {}).then(operation);
    studentWrites.set(key, request);
    return request.finally(() => {
        if (studentWrites.get(key) === request) studentWrites.delete(key);
    });
}

async function writeScope(notion, databaseId, scope) {
    const identity = {
        '學生姓名': { title: [{ text: { content: scope.studentName } }] },
        '班級': { rich_text: [{ text: { content: scope.className } }] },
        '主題': { rich_text: [{ text: { content: scope.theme } }] },
    };
    const exact = await notion.databases.query({
        database_id: databaseId,
        filter: { and: [
            { property: '學生姓名', title: { equals: scope.studentName } },
            { property: '班級', rich_text: { equals: scope.className } },
            { property: '主題', rich_text: { equals: scope.theme } },
        ] },
        page_size: 1,
    });
    let page = exact.results[0];
    const result = { created: false, updated: false };
    if (!page) {
        const empty = await notion.databases.query({
            database_id: databaseId,
            filter: { and: [
                { property: '學生姓名', title: { equals: scope.studentName } },
                { property: '班級', rich_text: { is_empty: true } },
                { property: '主題', rich_text: { is_empty: true } },
            ] },
            page_size: 2,
        });
        if (empty.results.length === 1 && !empty.has_more) {
            page = await notion.pages.update({
                page_id: empty.results[0].id,
                properties: { '班級': identity['班級'], '主題': identity['主題'] },
            });
            result.updated = true;
        } else {
            page = await notion.pages.create({ parent: { database_id: databaseId }, properties: identity });
            result.created = true;
        }
    }
    const verified = await notion.pages.retrieve({ page_id: page.id });
    for (const [field, expected] of [['學生姓名', scope.studentName], ['班級', scope.className], ['主題', scope.theme]]) {
        if (normalize(readText(verified.properties?.[field])) !== expected) {
            throw new Error(`Notion read-back verification failed: ${field}`);
        }
    }
    return { ...result, pageId: page.id };
}

function joinedScopes(user, memberships) {
    const scopes = new Map();
    for (const membership of memberships) {
        const activity = membership?.ActivityGroup?.Activity;
        const group = membership?.ActivityGroup?.Group;
        // Teachers are automatically enrolled in the classes they create.
        if (activity?.userId != null && String(activity.userId) === String(user.id)) continue;
        const className = normalize(activity?.title);
        const theme = normalize(group?.groupName);
        if (!className || !theme) continue;
        const scope = { studentName: normalize(user.name), className, theme };
        scopes.set(JSON.stringify([className, theme]), scope);
    }
    return [...scopes.values()];
}

let notionClient;
function getNotionClient() {
    if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
        throw Object.assign(new Error('Notion is not configured.'), { status: 503 });
    }
    if (!notionClient) {
        notionClient = new Client({ auth: process.env.NOTION_API_KEY, timeoutMs: 15000, maxRetries: 1, logLevel: 'error' });
    }
    return notionClient;
}

async function syncJoinedTopicsToNotion(user, memberships) {
    const scopes = joinedScopes(user, memberships);
    const result = { status: 'success', total: scopes.length, synced: 0, failed: 0 };
    if (scopes.length === 0) return result;
    if (!normalize(user.name) || !process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
        return { ...result, status: 'failed', failed: scopes.length, error: 'missing_notion_configuration_or_student_name' };
    }
    const notion = getNotionClient();
    for (const scope of scopes) {
        try {
            await saveScopeToNotion(notion, process.env.NOTION_DATABASE_ID, scope);
            result.synced += 1;
        } catch (error) {
            result.status = 'failed';
            result.failed += 1;
            result.error = error.code || 'notion_write_or_verification_failed';
        }
    }
    return result;
}

function normalizeChatHistory(history) {
    if (!Array.isArray(history)) throw Object.assign(new Error('chatHistory must be an array.'), { status: 400 });
    return history.map((session) => {
        if (!session || typeof session.sessionId !== 'string' || !session.sessionId.trim() || !Array.isArray(session.messages)) {
            throw Object.assign(new Error('Each chat session requires sessionId and messages.'), { status: 400 });
        }
        const messages = session.messages.map((message) => {
            if (!['user', 'assistant'].includes(message?.role) || typeof message.content !== 'string') {
                throw Object.assign(new Error('Each chat message requires a role and text content.'), { status: 400 });
            }
            return {
                ...(typeof message.id === 'string' ? { id: message.id } : {}),
                role: message.role,
                content: message.content,
                created_at: typeof message.created_at === 'string' ? message.created_at : '',
            };
        });
        return {
            sessionId: session.sessionId.trim(),
            ...(typeof session.name === 'string' ? { name: session.name } : {}),
            ...(typeof session.sourceType === 'string' ? { sourceType: session.sourceType } : {}),
            ...(typeof session.targetId === 'string' ? { targetId: session.targetId } : {}),
            ...(Number(session.createdAt) > 0 ? { createdAt: Number(session.createdAt) } : {}),
            chatbotEntryMode: typeof session.chatbotEntryMode === 'string' ? session.chatbotEntryMode : 'unknown',
            modeTitle: typeof session.modeTitle === 'string' ? session.modeTitle : '',
            updatedAt: Number(session.updatedAt) || 0,
            messages,
        };
    });
}

function mergeChatHistory(existing, incoming) {
    const sessions = new Map(existing.map((session) => [session.sessionId || session.id, session]));
    if (sessions.has(undefined) || sessions.has('')) throw new Error('Existing chat history contains an unidentified session.');
    for (const session of incoming) {
        const previous = sessions.get(session.sessionId);
        const previousLength = Array.isArray(previous?.messages) ? previous.messages.length : 0;
        // Requests contain full session snapshots. A delayed shorter snapshot must not erase newer turns.
        if (!previous || session.messages.length > previousLength ||
            (session.messages.length === previousLength && session.updatedAt >= (Number(previous.updatedAt) || 0))) {
            sessions.set(session.sessionId, { ...previous, ...session });
        }
    }
    return [...sessions.values()];
}

function chatHistoryRichText(history) {
    const serialized = JSON.stringify(history);
    const richText = [];
    for (let start = 0; start < serialized.length;) {
        let end = Math.min(start + 2000, serialized.length);
        if (end < serialized.length && /[\uD800-\uDBFF]/.test(serialized[end - 1])) end -= 1;
        richText.push({ text: { content: serialized.slice(start, end) } });
        start = end;
    }
    if (richText.length > 100) {
        throw Object.assign(new Error('Chat history exceeds the Notion field size limit; the saved history was kept.'), { status: 413 });
    }
    return { serialized, richText };
}

async function saveChatHistoryToNotion(scope, history) {
    const incoming = normalizeChatHistory(history);
    if (!normalize(scope.studentName)) throw Object.assign(new Error('Student name is required.'), { status: 400 });
    const notion = getNotionClient();
    const databaseId = process.env.NOTION_DATABASE_ID;
    return queueStudentWrite(databaseId, scope.studentName, async () => {
        const { pageId } = await writeScope(notion, databaseId, scope);
        const page = await notion.pages.retrieve({ page_id: pageId });
        const existingText = readText(page.properties?.['聊天歷史紀錄']);
        const existing = existingText ? JSON.parse(existingText) : [];
        if (!Array.isArray(existing)) throw new Error('Existing chat history is not a session list.');
        const merged = mergeChatHistory(existing, incoming);
        const { serialized, richText } = chatHistoryRichText(merged);
        if (serialized !== existingText) {
            await notion.pages.update({ page_id: pageId, properties: { '聊天歷史紀錄': { rich_text: richText } } });
            const verified = await notion.pages.retrieve({ page_id: pageId });
            if (readText(verified.properties?.['聊天歷史紀錄']) !== serialized) {
                throw new Error('Notion chat history read-back verification failed.');
            }
        }
        return { pageId, sessionCount: merged.length };
    });
}

async function getChatHistoryFromNotion(scope) {
    const notion = getNotionClient();
    let history = [];
    let cursor;
    do {
        const response = await notion.databases.query({
            database_id: process.env.NOTION_DATABASE_ID,
            filter: { and: [
                { property: '學生姓名', title: { equals: scope.studentName } },
                { property: '班級', rich_text: { equals: scope.className } },
                { property: '主題', rich_text: { equals: scope.theme } },
            ] },
            page_size: 100,
            ...(cursor ? { start_cursor: cursor } : {}),
        });
        for (const page of response.results) {
            const text = readText(page.properties?.['聊天歷史紀錄']);
            const sessions = text.trim() ? JSON.parse(text) : [];
            if (!Array.isArray(sessions) || sessions.some((session) =>
                !session || !(session.sessionId || session.id) || !Array.isArray(session.messages))) {
                throw new Error('Stored chat history is not a valid session list.');
            }
            history = mergeChatHistory(history, sessions.map((session) => ({
                ...session,
                sessionId: String(session.sessionId || session.id),
                updatedAt: Number(session.updatedAt) || Date.parse(page.last_edited_time) || 0,
            })));
        }
        cursor = response.has_more ? response.next_cursor : undefined;
    } while (cursor);
    return history;
}

module.exports = { saveScopeToNotion, joinedScopes, syncJoinedTopicsToNotion, saveChatHistoryToNotion, getChatHistoryFromNotion, normalizeChatHistory, mergeChatHistory, chatHistoryRichText };
