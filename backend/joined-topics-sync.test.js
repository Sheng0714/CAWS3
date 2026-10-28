const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const title = (value) => ({ title: [{ text: { content: value } }] });
const richText = (value) => ({ rich_text: [{ text: { content: value } }] });
const readText = (property) => (property?.title || property?.rich_text || []).map((part) => part.text.content).join('');
const theme = 'Should nuclear energy be part of a country’s future energy mix? Why or why not?';
const student = { id: '42', name: '學生' };
const membership = (topic = theme, extra = {}) => ({
    ActivityGroup: { Activity: { id: '1', title: '1151 Reading and Writing', userId: '7', ...extra }, Group: { id: '2', groupName: topic } },
});

function loadHandler(options = {}) {
    const pages = options.pages || [];
    const calls = { query: [], create: [], update: [], retrieve: [], sql: [] };
    let failTheme = options.failTheme;
    let failChatUpdate = options.failChatUpdate;
    const notion = {
        databases: { async query(request) {
            calls.query.push(request);
            if (options.notionQueryError) throw new Error('Notion unavailable');
            if (failTheme && request.filter.and.some((condition) => condition.property === '主題' && condition.rich_text.equals === failTheme)) {
                failTheme = null;
                throw Object.assign(new Error('Temporary Notion failure'), { code: 'service_unavailable' });
            }
            const matches = pages.filter((page) => request.filter.and.every((condition) => {
                const value = readText(page.properties[condition.property]);
                const comparison = condition.title || condition.rich_text;
                return comparison.is_empty ? !value : value === comparison.equals;
            }));
            const offset = Number(request.start_cursor) || 0;
            const next = offset + request.page_size;
            return { results: matches.slice(offset, next), has_more: matches.length > next, next_cursor: matches.length > next ? String(next) : null };
        } },
        pages: {
            async create(request) {
                calls.create.push(request);
                const page = { id: `page-${pages.length}`, properties: request.properties };
                pages.push(page);
                return page;
            },
            async update(request) {
                calls.update.push(request);
                if (request.properties['聊天歷史紀錄'] && failChatUpdate) {
                    failChatUpdate = false;
                    throw new Error('Temporary Notion write failure');
                }
                const page = pages.find((entry) => entry.id === request.page_id);
                Object.assign(page.properties, request.properties);
                return page;
            },
            async retrieve(request) {
                calls.retrieve.push(request);
                if (options.beforeVerify) await options.beforeVerify();
                const page = pages.find((entry) => entry.id === request.page_id);
                if (options.failChatReadBack && page.properties['聊天歷史紀錄']) {
                    return { ...page, properties: { ...page.properties, '聊天歷史紀錄': richText('[]') } };
                }
                return page;
            },
        },
    };
    const syncModule = { exports: {} };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'notion-student-topics.js'), 'utf8'), {
        module: syncModule,
        process: { env: options.missingConfig ? {} : { NOTION_API_KEY: 'test-key', NOTION_DATABASE_ID: 'test-database' } },
        require(name) {
            assert.equal(name, '@notionhq/client');
            return { Client: function () { return notion; } };
        },
    });
    const controller = {};
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'controllers/activity.controller.js'), 'utf8'), {
        exports: controller,
        console: { warn() {} },
        require(name) {
            if (name === '../notion-student-topics') return syncModule.exports;
            if (name === 'nanoid') return { customAlphabet() {} };
            assert.equal(name, '../models');
            return { Activity: {}, Group: {}, ActivityGroup: {}, UserActivityGroup: {
                async findAll(query) {
                    calls.sql.push(query);
                    if (options.sqlError) throw new Error('Database unavailable');
                    return options.memberships || [membership()];
                },
            } };
        },
    });
    async function request(userId = '42') {
        const response = {
            headers: {},
            set(headers) { Object.assign(this.headers, headers); return this; },
            status(code) { this.statusCode = code; return this; },
            send(body) { this.body = body; return this; },
        };
        await controller.getJoinedActivitiesByUserId({ user: { dataValues: student }, params: { userId } }, response);
        return response;
    }
    async function requestChat(body, userId = '42') {
        const response = {
            statusCode: 200,
            status(code) { this.statusCode = code; return this; },
            json(value) { this.body = value; return this; },
        };
        await controller.saveJoinedChatHistory({ user: { dataValues: student }, params: { userId }, body }, response);
        return response;
    }
    async function readChat(query = { activityId: '1', groupId: '2' }, userId = '42', handler = controller.getJoinedChatHistory) {
        const response = {
            statusCode: 200, headers: {},
            status(code) { this.statusCode = code; return this; },
            set(name, value) { this.headers[name] = value; return this; },
            json(value) { this.body = value; return this; },
        };
        await handler({ user: { dataValues: student }, params: { userId }, query }, response);
        return response;
    }
    return {
        request, requestChat, readChat, calls, pages, joinedScopes: syncModule.exports.joinedScopes,
        readScope: (query, userId) => readChat(query, userId, controller.getJoinedWritingScope),
    };
}

test('writing scope reads the logged-in student and current class/topic by IDs without accessing Notion', async () => {
    const { readScope, calls } = loadHandler();
    const response = await readScope({ activityId: '1', groupId: '2', studentName: 'Wrong student', className: 'Stale class', theme: 'Stale topic' });
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.deepEqual({ ...response.body.data }, { studentName: student.name, className: '1151 Reading and Writing', theme });
    assert.equal(response.headers['Cache-Control'], 'no-store');
    assert.equal(calls.sql[0].where.UserId, student.id);
    assert.equal(calls.query.length + calls.create.length + calls.update.length, 0);
});

test('writing scope rejects missing selection, another student and an unjoined topic', async () => {
    const { readScope, calls } = loadHandler();
    assert.equal((await readScope(undefined, '99')).statusCode, 403);
    assert.equal((await readScope({})).statusCode, 400);
    assert.equal((await readScope({ activityId: '1' })).statusCode, 400);
    assert.equal(calls.sql.length, 0);
    assert.equal((await readScope({ activityId: '1', groupId: '999' })).statusCode, 403);
    assert.equal(calls.query.length, 0);
});

test('writing scope can resolve an exact stored class/topic and reports database failures', async () => {
    const { readScope } = loadHandler();
    const response = await readScope({ className: ' 1151 Reading and Writing ', theme });
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.theme, theme);
    const failed = loadHandler({ sqlError: true });
    assert.equal((await failed.readScope()).statusCode, 502);
});

test('the original class-list request fills the account row, includes old topics and is safe to repeat', async () => {
    const accountPage = { id: 'account', properties: {
        '學生姓名': title(student.name), '班級': richText(''), '主題': richText(''),
        '帳號': richText('existing-account'), '密碼': richText('existing-password'), '論文內容': richText('existing-writing'),
    } };
    const memberships = [membership(), membership(), membership('Previous topic', { endDate: '2020-01-01' })];
    const { request, calls, pages } = loadHandler({ pages: [accountPage], memberships });
    const response = await request();
    assert.equal(response.statusCode, 200);
    assert.equal(response.body, memberships);
    assert.equal(calls.sql[0].where.UserId, student.id);
    assert.equal(response.headers['X-Notion-Sync-Status'], 'success');
    assert.equal(response.headers['X-Notion-Synced-Count'], '2');
    assert.equal(response.headers['Cache-Control'], 'no-store');
    assert.equal(readText(accountPage.properties['班級']), '1151 Reading and Writing');
    assert.equal(readText(accountPage.properties['主題']), theme);
    assert.equal(readText(accountPage.properties['密碼']), 'existing-password');
    assert.equal(readText(accountPage.properties['論文內容']), 'existing-writing');
    assert.equal(calls.update.length, 1);
    assert.equal(calls.create.length, 1);
    assert.equal(calls.retrieve.length, 2);
    await request();
    assert.equal(pages.length, 2);
    assert.equal(calls.create.length, 1);
    assert.equal(calls.update.length, 1);
});

test('the class-list response waits for Notion read-back verification', async () => {
    let finishVerification;
    const verification = new Promise((resolve) => { finishVerification = resolve; });
    const { request, calls } = loadHandler({ beforeVerify: () => verification });
    let replied = false;
    const pending = request().then((response) => { replied = true; return response; });
    while (!calls.retrieve.length) await new Promise((resolve) => setImmediate(resolve));
    assert.equal(replied, false);
    finishVerification();
    assert.equal((await pending).headers['X-Notion-Sync-Status'], 'success');
});

test('a failed topic preserves the loaded class list, continues other topics, and is retried on the next load', async () => {
    const memberships = [membership('Temporary failure'), membership('Other topic')];
    const { request, pages } = loadHandler({ memberships, failTheme: 'Temporary failure' });
    const first = await request();
    assert.equal(first.statusCode, 200);
    assert.equal(first.body, memberships);
    assert.equal(first.headers['X-Notion-Sync-Status'], 'failed');
    assert.equal(first.headers['X-Notion-Failed-Count'], '1');
    assert.equal(first.headers['X-Notion-Synced-Count'], '1');
    const retry = await request();
    assert.equal(retry.headers['X-Notion-Sync-Status'], 'success');
    assert.equal(pages.length, 2);
});

test('concurrent page loads cannot duplicate topics or overwrite the reused account row', async () => {
    const page = { id: 'account', properties: { '學生姓名': title(student.name), '班級': richText(''), '主題': richText('') } };
    const { request, calls, pages } = loadHandler({ pages: [page], memberships: [membership(), membership('Other topic')] });
    const responses = await Promise.all([request(), request(), request()]);
    assert.ok(responses.every((response) => response.headers['X-Notion-Sync-Status'] === 'success'));
    assert.equal(pages.length, 2);
    assert.equal(calls.update.length, 1);
    assert.equal(calls.create.length, 1);
});

test('missing Notion configuration is reported without hiding the joined classes', async () => {
    const { request, calls } = loadHandler({ missingConfig: true });
    const response = await request();
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.length, 1);
    assert.equal(response.headers['X-Notion-Sync-Status'], 'failed');
    assert.equal(calls.query.length, 0);
});

test('another student cannot trigger a class read or Notion write', async () => {
    const { request, calls } = loadHandler();
    assert.equal((await request('99')).statusCode, 403);
    assert.equal(calls.sql.length, 0);
    assert.equal(calls.query.length, 0);
});

test('a failed class database read cannot create a Notion record', async () => {
    const { request, calls } = loadHandler({ sqlError: true });
    assert.equal((await request()).statusCode, 400);
    assert.equal(calls.query.length, 0);
});

test('scope extraction skips teacher ownership and empty topics, and normalizes duplicate names', () => {
    const { joinedScopes } = loadHandler();
    const scopes = joinedScopes(student, [membership(), membership(theme + '　'), membership('Teacher topic', { userId: '42' }), membership(''), null]);
    assert.equal(scopes.length, 1);
    assert.equal(scopes[0].studentName, student.name);
    assert.equal(scopes[0].theme, theme);
});

const chatSession = (sessionId = 'session-1', contents = ['Question', 'Answer']) => ({
    sessionId, chatbotEntryMode: 'kf_analysis', modeTitle: 'KF Analysis', updatedAt: 100,
    messages: contents.map((content, index) => ({ role: index % 2 ? 'assistant' : 'user', content, created_at: '2026-10-22T12:00:00Z' })),
});
const chatRequest = (chatHistory = [chatSession()]) => ({ activityId: '1', groupId: '2', chatHistory });
const chatPage = (history = []) => ({ id: 'student-topic', properties: {
    '學生姓名': title(student.name), '班級': richText('1151 Reading and Writing'), '主題': richText(theme),
    '聊天歷史紀錄': richText(JSON.stringify(history)), '論文內容': richText('Keep this essay'), '密碼': richText('Keep this password'),
} });
const savedHistory = (page) => JSON.parse(readText(page.properties['聊天歷史紀錄']));

test('chat history uses authenticated identity and database class/topic, updating only the chat field', async () => {
    const page = chatPage();
    const { requestChat, calls } = loadHandler({ pages: [page] });
    const response = await requestChat({ ...chatRequest(), studentName: 'Wrong student', className: 'Wrong class', theme: 'Wrong topic' });
    assert.equal(response.statusCode, 200, JSON.stringify(response.body));
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.pageId, page.id);
    assert.equal(savedHistory(page)[0].messages[1].content, 'Answer');
    assert.deepEqual(Object.keys(calls.update[0].properties), ['聊天歷史紀錄']);
    assert.equal(readText(page.properties['論文內容']), 'Keep this essay');
    assert.equal(readText(page.properties['密碼']), 'Keep this password');
    assert.equal(calls.create.length, 0);
});

test('chat snapshots merge sessions across modes without duplication or stale-history truncation', async () => {
    const page = chatPage([chatSession('old-session')]);
    const { requestChat, calls } = loadHandler({ pages: [page] });
    const completed = chatSession('session-1', ['Question', 'Answer', 'Follow-up', 'More help']);
    await requestChat(chatRequest([completed]));
    const writes = calls.update.length;
    await requestChat(chatRequest([completed]));
    assert.equal(calls.update.length, writes);
    await requestChat(chatRequest([chatSession()]));
    assert.equal(savedHistory(page).length, 2);
    assert.equal(savedHistory(page).find((session) => session.sessionId === 'session-1').messages.length, 4);
    await requestChat(chatRequest([{ ...chatSession('analysis-session'), chatbotEntryMode: 'writing_analysis' }]));
    assert.equal(savedHistory(page).length, 3);
});

test('concurrent chat requests preserve both sessions', async () => {
    const page = chatPage();
    const { requestChat } = loadHandler({ pages: [page] });
    await Promise.all([requestChat(chatRequest([chatSession('first')])), requestChat(chatRequest([chatSession('second')]))]);
    assert.equal(savedHistory(page).length, 2);
});

test('chat history rejects another user and an unjoined topic before accessing Notion', async () => {
    const { requestChat, calls } = loadHandler();
    assert.equal((await requestChat(chatRequest(), '99')).statusCode, 403);
    assert.equal(calls.sql.length, 0);
    assert.equal((await requestChat({ ...chatRequest(), groupId: '999' })).statusCode, 403);
    assert.equal(calls.query.length, 0);
});

test('invalid chat data is rejected before database reads or writes', async () => {
    const { requestChat, calls } = loadHandler();
    assert.equal((await requestChat(chatRequest('bad history'))).statusCode, 400);
    assert.equal((await requestChat(chatRequest([{ sessionId: 'invalid', messages: [{ role: 'system', content: 'wrong' }] }]))).statusCode, 400);
    assert.equal(calls.sql.length, 0);
    assert.equal(calls.query.length, 0);
});

test('a Notion failure is reported and the same request can be retried without duplicate sessions', async () => {
    const page = chatPage();
    const { requestChat } = loadHandler({ pages: [page], failChatUpdate: true });
    assert.equal((await requestChat(chatRequest())).statusCode, 502);
    assert.equal(savedHistory(page).length, 0);
    assert.equal((await requestChat(chatRequest())).statusCode, 200);
    assert.equal(savedHistory(page).length, 1);
});

test('long conversations split into valid Notion text chunks without clipping Unicode or messages', async () => {
    const page = chatPage();
    const { requestChat, calls } = loadHandler({ pages: [page] });
    const messages = Array.from({ length: 45 }, (_, index) => `Turn ${index} ${'😀'.repeat(70)}`);
    assert.equal((await requestChat(chatRequest([chatSession('long-session', messages)]))).statusCode, 200);
    const chunks = calls.update[0].properties['聊天歷史紀錄'].rich_text;
    assert.ok(chunks.length > 1);
    assert.ok(chunks.every((chunk) => chunk.text.content.length <= 2000 && !/[\uD800-\uDBFF]$/.test(chunk.text.content)));
    assert.deepEqual(savedHistory(page)[0].messages.map((message) => message.content), messages);
});

test('oversized history returns an explicit error and keeps the saved history intact', async () => {
    const page = chatPage([chatSession('old-session')]);
    const { requestChat, calls } = loadHandler({ pages: [page] });
    const response = await requestChat(chatRequest([chatSession('too-long', ['x'.repeat(200000)])]));
    assert.equal(response.statusCode, 413);
    assert.equal(calls.update.length, 0);
    assert.equal(savedHistory(page)[0].sessionId, 'old-session');
});

test('unreadable existing history is preserved and a failed read-back cannot report success', async () => {
    const invalid = chatPage();
    invalid.properties['聊天歷史紀錄'] = richText('Keep existing unreadable history');
    const first = loadHandler({ pages: [invalid] });
    assert.equal((await first.requestChat(chatRequest())).statusCode, 502);
    assert.equal(first.calls.update.length, 0);
    const second = loadHandler({ pages: [chatPage()], failChatReadBack: true });
    assert.equal((await second.requestChat(chatRequest())).statusCode, 502);
});

test('history reads the authenticated student/class/topic from Notion and returns only chat data', async () => {
    const page = chatPage([chatSession('stored-only')]);
    const anotherStudent = chatPage([chatSession('other-student')]);
    anotherStudent.properties['學生姓名'] = title('Another student');
    const anotherTopic = chatPage([chatSession('other-topic')]);
    anotherTopic.properties['主題'] = richText('Another topic');
    const { readChat, calls } = loadHandler({ pages: [page, anotherStudent, anotherTopic] });
    const response = await readChat({ activityId: '1', groupId: '2', studentName: 'Another student' });
    assert.equal(response.statusCode, 200, JSON.stringify(response.body));
    assert.equal(response.body.data.chatHistory.length, 1);
    assert.equal(response.body.data.chatHistory[0].sessionId, 'stored-only');
    assert.deepEqual(Object.keys(response.body.data), ['chatHistory']);
    assert.equal(response.headers['Cache-Control'], 'no-store');
    assert.equal(calls.query[0].filter.and[0].title.equals, student.name);
    assert.equal(calls.create.length + calls.update.length, 0);
});

test('empty history returns an empty list without creating or updating Notion records', async () => {
    const { readChat, calls } = loadHandler();
    const response = await readChat();
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.chatHistory.length, 0);
    assert.equal(calls.create.length + calls.update.length, 0);
});

test('history reads merge paginated matching records and preserve the longest duplicate session', async () => {
    const pages = Array.from({ length: 101 }, (_, index) => chatPage([chatSession(`session-${index}`)]));
    pages[0].properties['聊天歷史紀錄'] = richText(JSON.stringify([chatSession('session-1', ['Question', 'Answer', 'Follow-up', 'New answer'])]));
    const { readChat, calls } = loadHandler({ pages });
    const response = await readChat();
    assert.equal(response.body.data.chatHistory.length, 100);
    assert.equal(response.body.data.chatHistory.find((session) => session.sessionId === 'session-1').messages.length, 4);
    assert.equal(calls.query.length, 2);
    assert.equal(calls.create.length + calls.update.length, 0);
});

test('history reads reject another user, an unjoined topic and missing scope', async () => {
    const { readChat, calls } = loadHandler();
    assert.equal((await readChat(undefined, '99')).statusCode, 403);
    assert.equal(calls.sql.length, 0);
    assert.equal((await readChat({ activityId: '1', groupId: '999' })).statusCode, 403);
    assert.equal((await readChat({})).statusCode, 400);
    assert.equal(calls.query.length, 0);
});

test('Notion read failures and corrupt stored JSON return an error instead of an empty history', async () => {
    assert.equal((await loadHandler({ missingConfig: true }).readChat()).statusCode, 503);
    assert.equal((await loadHandler({ notionQueryError: true }).readChat()).statusCode, 502);
    const page = chatPage();
    page.properties['聊天歷史紀錄'] = richText('Invalid saved JSON');
    const { readChat, calls } = loadHandler({ pages: [page] });
    assert.equal((await readChat()).statusCode, 502);
    assert.equal(calls.create.length + calls.update.length, 0);
});
