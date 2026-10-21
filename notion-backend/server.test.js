const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

function loadLoginHandler(existingPage = null) {
    const routes = new Map();
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
            if (name === 'cors') return () => {};
            if (name === '@notionhq/client') return { Client: function () { return notion; } };
            throw new Error(`Unexpected dependency: ${name}`);
        },
        process: { env: { NOTION_DATABASE_ID: 'test-database' } },
        console: { log() {}, warn() {}, error() {} },
    }, { filename: 'server.js' });

    return {
        calls,
        async enter(body) {
            const response = {
                statusCode: 200,
                status(code) { this.statusCode = code; return this; },
                json(value) { this.body = value; return this; },
            };
            await routes.get('/api/increment-login-count')({ body }, response);
            return response;
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
