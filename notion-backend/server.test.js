const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

function loadLoginHandler(existingPage = null, emptyPages = []) {
    const routes = new Map();
    let corsOptions;
    const calls = { create: [], update: [], query: [] };
    const schema = {
        '學生姓名': { type: 'title' },
        '班級': { type: 'rich_text' },
        '主題': { type: 'rich_text' },
        '登入次數': { type: 'number' },
        '登入日期統計': { type: 'rich_text' },
    };
    const validateProperties = (properties) => {
        for (const [name, value] of Object.entries(properties)) {
            assert.ok(schema[name], `Unknown Notion property: ${name}`);
            assert.ok(schema[name].type in value, `Wrong Notion property type: ${name}`);
        }
    };
    const notion = {
        databases: {
            async retrieve() { return { properties: schema }; },
            async query(request) {
                calls.query.push(request);
                if (request.filter.and.some((filter) => filter.rich_text?.is_empty)) {
                    return { results: emptyPages, has_more: false };
                }
                return { results: existingPage ? [existingPage] : [] };
            },
        },
        pages: {
            async create(request) {
                validateProperties(request.properties);
                calls.create.push(request);
                return { id: 'new-page' };
            },
            async update(request) {
                validateProperties(request.properties);
                calls.update.push(request);
                return { id: request.page_id };
            },
        },
    };
    const app = {
        use() {}, options() {}, get() {}, patch() {}, listen() {},
        post(route, handler) { routes.set(route, handler); },
    };
    const express = Object.assign(() => app, { json() {}, urlencoded() {} });
    vm.runInNewContext(serverSource, {
        require(name) {
            if (name === 'express') return express;
            if (name === 'cors') return (options) => { corsOptions = options; };
            if (name === '@notionhq/client') return { Client: function () { return notion; } };
            throw new Error(`Unexpected dependency: ${name}`);
        },
        process: { env: { NOTION_DATABASE_ID: 'test-database' } },
        console: { log() {}, warn() {}, error() {} },
    }, { filename: 'server.js' });

    const request = async (route, body) => {
        const response = {
            statusCode: 200,
            status(code) { this.statusCode = code; return this; },
            json(value) { this.body = value; return this; },
        };
        await routes.get(route)({ body }, response);
        return response;
    };
    return {
        calls,
        enter: (body) => request('/api/increment-login-count', body),
        ensureTopic: (body) => request('/api/ensure-student-topic', body),
        isOriginAllowed(origin) {
            let result;
            corsOptions.origin(origin, (error, allowed) => { result = !error && allowed; });
            return result;
        },
    };
}

test('first entry saves the student, class and topic using the Notion schema names', async () => {
    const { calls, enter } = loadLoginHandler();
    const response = await enter({ studentName: ' 測試學生 ', className: ' 1142B ', theme: ' AI 學習 ' });

    assert.equal(response.statusCode, 200, JSON.stringify(response.body));
    assert.equal(response.body.success, true);
    assert.equal(calls.create.length, 1);
    const { parent, properties } = calls.create[0];
    assert.equal(parent.database_id, 'test-database');
    assert.equal(properties['學生姓名'].title[0].text.content, '測試學生');
    assert.equal(properties['班級'].rich_text[0].text.content, '1142B');
    assert.equal(properties['主題'].rich_text[0].text.content, 'AI 學習');
    assert.equal(properties['登入次數'].number, 1);
    assert.equal(Object.values(JSON.parse(properties['登入日期統計'].rich_text[0].text.content))[0], 1);
    assert.equal(calls.update.length, 0);
});

test('an existing student record increments the count without replacing its content', async () => {
    const { calls, enter } = loadLoginHandler({
        id: 'existing-page',
        properties: { '登入次數': { type: 'number', number: 3 } },
    });
    const response = await enter({ studentName: '測試學生', className: '1142B', theme: 'AI 學習' });

    assert.equal(response.statusCode, 200, JSON.stringify(response.body));
    assert.equal(calls.create.length, 0);
    assert.equal(calls.update.length, 1);
    assert.equal(calls.update[0].page_id, 'existing-page');
    assert.equal(calls.update[0].properties['登入次數'].number, 4);
    assert.deepEqual(Object.keys(calls.update[0].properties).sort(), ['登入次數', '登入日期統計'].sort());
    assert.deepEqual(Array.from(calls.query[0].filter.and, (filter) => filter.property), ['學生姓名', '班級', '主題']);
});

test('a missing class or topic is rejected before accessing Notion', async () => {
    for (const missingKey of ['studentName', 'className', 'theme']) {
        const { calls, enter } = loadLoginHandler();
        const response = await enter({ studentName: '測試學生', className: '1142B', theme: 'AI 學習', [missingKey]: ' ' });

        assert.equal(response.statusCode, 400);
        assert.equal(response.body.success, false);
        assert.equal(calls.query.length + calls.create.length + calls.update.length, 0);
    }
});

test('joining a topic saves the class/topic fields without counting a login', async () => {
    const { calls, ensureTopic } = loadLoginHandler();
    const response = await ensureTopic({ studentName: ' 測試學生 ', className: ' 1142B ', theme: ' AI 學習 ' });

    assert.equal(response.statusCode, 200, JSON.stringify(response.body));
    assert.equal(response.body.data.created, true);
    assert.equal(calls.create.length, 1);
    const { properties } = calls.create[0];
    assert.equal(properties['學生姓名'].title[0].text.content, '測試學生');
    assert.equal(properties['班級'].rich_text[0].text.content, '1142B');
    assert.equal(properties['主題'].rich_text[0].text.content, 'AI 學習');
    assert.deepEqual(Object.keys(properties).sort(), ['學生姓名', '班級', '主題'].sort());
    const filters = calls.query[0].filter.and;
    assert.deepEqual(Array.from(filters, (filter) => filter.property), ['學生姓名', '班級', '主題']);
    assert.equal(filters[0].title.equals, '測試學生');
    assert.equal(filters[1].rich_text.equals, '1142B');
    assert.equal(filters[2].rich_text.equals, 'AI 學習');
});

test('joining an existing class/topic preserves its writing content and avoids another page', async () => {
    const { calls, ensureTopic } = loadLoginHandler({ id: 'existing-page', properties: {} });
    const response = await ensureTopic({ studentName: '測試學生', className: '1142B', theme: 'AI 學習' });

    assert.equal(response.statusCode, 200, JSON.stringify(response.body));
    assert.equal(response.body.data.created, false);
    assert.equal(response.body.data.pageId, 'existing-page');
    assert.equal(calls.create.length, 0);
    assert.equal(calls.update.length, 0);
});

test('joining with missing scope fields does not create a Notion record', async () => {
    for (const missingKey of ['studentName', 'className', 'theme']) {
        const { calls, ensureTopic } = loadLoginHandler();
        const response = await ensureTopic({ studentName: '測試學生', className: '1142B', theme: 'AI 學習', [missingKey]: ' ' });

        assert.equal(response.statusCode, 400);
        assert.equal(calls.query.length + calls.create.length + calls.update.length, 0);
    }
});

test('backfilling a unique blank student record fills its class/topic and keeps its account fields', async () => {
    const { calls, ensureTopic } = loadLoginHandler(null, [{ id: 'student-account-page' }]);
    const response = await ensureTopic({ studentName: '測試學生', className: '1142B', theme: 'AI 學習' });

    assert.equal(response.statusCode, 200, JSON.stringify(response.body));
    assert.equal(response.body.data.created, false);
    assert.equal(response.body.data.updated, true);
    assert.equal(response.body.data.pageId, 'student-account-page');
    assert.equal(calls.create.length, 0);
    assert.equal(calls.update.length, 1);
    const properties = calls.update[0].properties;
    assert.deepEqual(Object.keys(properties).sort(), ['班級', '主題'].sort());
    assert.equal(properties['班級'].rich_text[0].text.content, '1142B');
    assert.equal(properties['主題'].rich_text[0].text.content, 'AI 學習');
});

test('ambiguous blank student records are left intact', async () => {
    const { calls, ensureTopic } = loadLoginHandler(null, [{ id: 'first-account' }, { id: 'second-account' }]);
    const response = await ensureTopic({ studentName: '測試學生', className: '1142B', theme: 'AI 學習' });

    assert.equal(response.statusCode, 200, JSON.stringify(response.body));
    assert.equal(response.body.data.created, true);
    assert.equal(calls.update.length, 0);
    assert.equal(calls.create.length, 1);
});

test('the current production origin is allowed and unrelated origins remain blocked', () => {
    const { isOriginAllowed } = loadLoginHandler();
    for (const origin of ['http://210.240.193.193', 'https://210.240.193.193', 'http://210.240.193.193:3000']) {
        assert.equal(isOriginAllowed(origin), true);
    }
    assert.equal(isOriginAllowed('http://unrelated.example'), false);
});
