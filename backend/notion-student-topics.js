const { Client } = require('@notionhq/client');

const normalize = (value) => String(value ?? '').replace(/\u3000/g, ' ').trim();
const readText = (property) =>
    (property?.title || property?.rich_text || []).map((item) => item.plain_text ?? item.text?.content ?? '').join('');

// Serialize a student's writes so two page loads cannot reuse the same blank row.
const studentWrites = new Map();
function saveScopeToNotion(notion, databaseId, scope) {
    const key = JSON.stringify([databaseId, scope.studentName]);
    const previous = studentWrites.get(key) || Promise.resolve();
    const request = previous.catch(() => {}).then(() => writeScope(notion, databaseId, scope));
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
async function syncJoinedTopicsToNotion(user, memberships) {
    const scopes = joinedScopes(user, memberships);
    const result = { status: 'success', total: scopes.length, synced: 0, failed: 0 };
    if (scopes.length === 0) return result;
    if (!normalize(user.name) || !process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
        return { ...result, status: 'failed', failed: scopes.length, error: 'missing_notion_configuration_or_student_name' };
    }
    if (!notionClient) {
        notionClient = new Client({ auth: process.env.NOTION_API_KEY, timeoutMs: 15000, maxRetries: 1, logLevel: 'error' });
    }
    for (const scope of scopes) {
        try {
            await saveScopeToNotion(notionClient, process.env.NOTION_DATABASE_ID, scope);
            result.synced += 1;
        } catch (error) {
            result.status = 'failed';
            result.failed += 1;
            result.error = error.code || 'notion_write_or_verification_failed';
        }
    }
    return result;
}

module.exports = { saveScopeToNotion, joinedScopes, syncJoinedTopicsToNotion };
