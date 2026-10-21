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
    ActivityGroup: { Activity: { title: '1151 Reading and Writing', userId: '7', ...extra }, Group: { groupName: topic } },
});

function loadHandler(options = {}) {
    const pages = options.pages || [];
    const calls = { query: [], create: [], update: [], retrieve: [], sql: [] };
    let failTheme = options.failTheme;
    const notion = {
        databases: { async query(request) {
            calls.query.push(request);
            if (failTheme && request.filter.and.some((condition) => condition.property === '主題' && condition.rich_text.equals === failTheme)) {
                failTheme = null;
                throw Object.assign(new Error('Temporary Notion failure'), { code: 'service_unavailable' });
            }
            const matches = pages.filter((page) => request.filter.and.every((condition) => {
                const value = readText(page.properties[condition.property]);
                const comparison = condition.title || condition.rich_text;
                return comparison.is_empty ? !value : value === comparison.equals;
            }));
            return { results: matches.slice(0, request.page_size), has_more: matches.length > request.page_size };
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
                const page = pages.find((entry) => entry.id === request.page_id);
                Object.assign(page.properties, request.properties);
                return page;
            },
            async retrieve(request) {
                calls.retrieve.push(request);
                if (options.beforeVerify) await options.beforeVerify();
                return pages.find((entry) => entry.id === request.page_id);
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
    return { request, calls, pages, joinedScopes: syncModule.exports.joinedScopes };
}

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
