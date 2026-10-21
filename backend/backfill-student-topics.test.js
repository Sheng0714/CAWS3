const assert = require('node:assert/strict');
const test = require('node:test');
const { uniqueScopes, parseFormalExport, backfillScopes, saveScopeToNotion } = require('./backfill-student-topics');

test('membership scopes are normalized, deduplicated and keep separate topics', () => {
    assert.deepEqual(uniqueScopes([
        { studentName: ' 學生 ', className: '1142B', theme: 'AI 學習　' },
        { studentName: '學生', className: '1142B', theme: 'AI 學習' },
        { studentName: '學生', className: '1142B', theme: '其他主題' },
        { studentName: '', className: '1142B', theme: '其他主題' },
    ]), [
        { studentName: '學生', className: '1142B', theme: 'AI 學習' },
        { studentName: '學生', className: '1142B', theme: '其他主題' },
    ]);
});

test('dry-run reports eligible scopes without writing', async () => {
    const result = await backfillScopes([{}], () => { throw new Error('Unexpected write'); });
    assert.equal(result.mode, 'dry-run');
    assert.equal(result.total, 1);
    assert.equal(result.updated + result.created, 0);
});

test('formal website exports retain the real class/topic and deduplicate repeated memberships', () => {
    const row = { studentName: '學生', className: '1151 Reading and Writing', theme: 'Should nuclear energy be part of a country’s future energy mix? Why or why not?' };
    assert.deepEqual(parseFormalExport({ format: 'formal-student-topics-v1', sourceOrigin: 'http://210.240.193.193', records: [row, row] }), [row]);
    assert.throws(() => parseFormalExport({ format: 'formal-student-topics-v1', sourceOrigin: 'http://localhost', records: [row] }), /formal website/);
    assert.throws(() => parseFormalExport({ format: 'formal-student-topics-v1', sourceOrigin: 'http://210.240.193.193', records: [{ ...row, theme: '' }] }), /incomplete/);
});

test('apply reports newly created, filled and existing records separately', async () => {
    const responses = [{ created: true }, { updated: true }, { created: false, updated: false }];
    const result = await backfillScopes([{}, {}, {}], async () => responses.shift(), true);
    assert.deepEqual(result, { mode: 'apply', total: 3, created: 1, updated: 1, unchanged: 1, failed: 0 });
});

const scope = { studentName: '學生', className: '1142B', theme: 'AI 學習' };
const title = (value) => ({ title: [{ text: { content: value } }] });
const richText = (value) => ({ rich_text: [{ text: { content: value } }] });
const text = (property) => (property?.title || property?.rich_text || []).map((item) => item.text.content).join('');

function fakeNotion(initialPages = []) {
    const pages = initialPages;
    const calls = { create: [], update: [], retrieve: [] };
    return {
        calls,
        databases: {
            async query({ filter, page_size }) {
                const matches = pages.filter((page) => filter.and.every((condition) => {
                    const value = text(page.properties[condition.property]);
                    const comparison = condition.title || condition.rich_text;
                    return comparison.is_empty ? value === '' : value === comparison.equals;
                }));
                return { results: matches.slice(0, page_size), has_more: matches.length > page_size };
            },
        },
        pages: {
            async create(request) {
                calls.create.push(request);
                const page = { id: `new-${pages.length}`, properties: request.properties };
                pages.push(page);
                return page;
            },
            async update(request) {
                calls.update.push(request);
                const page = pages.find((entry) => entry.id === request.page_id);
                Object.assign(page.properties, request.properties);
                return page;
            },
            async retrieve({ page_id }) {
                calls.retrieve.push(page_id);
                return pages.find((entry) => entry.id === page_id);
            },
        },
    };
}

test('direct Notion sync fills an existing blank account record and verifies the saved fields', async () => {
    const page = { id: 'account-page', properties: {
        '學生姓名': title('學生'), '班級': richText(''), '主題': richText(''),
        '帳號': richText('existing-account'), '筆記區': richText('existing-notes'),
    } };
    const notion = fakeNotion([page]);
    const result = await saveScopeToNotion(notion, 'database', scope);

    assert.deepEqual(result, { created: false, updated: true, pageId: 'account-page' });
    assert.deepEqual(Object.keys(notion.calls.update[0].properties).sort(), ['班級', '主題'].sort());
    assert.equal(text(page.properties['帳號']), 'existing-account');
    assert.equal(text(page.properties['筆記區']), 'existing-notes');
    assert.deepEqual(notion.calls.retrieve, ['account-page']);
});

test('direct Notion sync creates a missing record and a second run leaves it unchanged', async () => {
    const notion = fakeNotion();
    const first = await saveScopeToNotion(notion, 'database', scope);
    const second = await saveScopeToNotion(notion, 'database', scope);

    assert.equal(first.created, true);
    assert.equal(second.created, false);
    assert.equal(second.updated, false);
    assert.equal(notion.calls.create.length, 1);
    assert.equal(notion.calls.update.length, 0);
    assert.equal(notion.calls.retrieve.length, 2);
});

test('a direct write is not counted as successful when the saved fields cannot be verified', async () => {
    const notion = fakeNotion();
    notion.pages.retrieve = async () => ({ properties: { '學生姓名': title('學生'), '班級': richText('wrong-class') } });
    await assert.rejects(saveScopeToNotion(notion, 'database', scope), /read-back verification failed/);
});
