const fs = require('node:fs');
const path = require('node:path');
const { saveScopeToNotion } = require('./notion-student-topics');

const normalize = (value) => String(value ?? '').replace(/\u3000/g, ' ').trim();

function uniqueScopes(rows) {
    const scopes = new Map();
    for (const row of rows) {
        const scope = Object.fromEntries(['studentName', 'className', 'theme'].map((key) => [key, normalize(row[key])]));
        if (Object.values(scope).some((value) => !value)) continue;
        scopes.set(JSON.stringify(Object.values(scope)), scope);
    }
    return [...scopes.values()];
}

function parseFormalExport(data) {
    if (data?.format !== 'formal-student-topics-v1' || !Array.isArray(data.records)) {
        throw new Error('Expected a formal-student-topics.json website export.');
    }
    const source = new URL(data.sourceOrigin);
    if (source.hostname !== '210.240.193.193' || !['http:', 'https:'].includes(source.protocol)) {
        throw new Error('The export must come from the formal website 210.240.193.193.');
    }
    for (const row of data.records) {
        if (!row || ['studentName', 'className', 'theme'].some((key) => typeof row[key] !== 'string' || !normalize(row[key]))) {
            throw new Error('The export contains an incomplete student/class/topic record.');
        }
    }
    return uniqueScopes(data.records);
}

async function backfillScopes(scopes, saveScope, apply = false) {
    const result = { mode: apply ? 'apply' : 'dry-run', total: scopes.length, created: 0, updated: 0, unchanged: 0, failed: 0 };
    if (!apply) return result;
    for (const [index, scope] of scopes.entries()) {
        try {
            const saved = await saveScope(scope);
            if (saved.created) result.created += 1;
            else if (saved.updated) result.updated += 1;
            else result.unchanged += 1;
        } catch (error) {
            result.failed += 1;
            console.error(JSON.stringify({ scopeIndex: index + 1, error: error.message }));
        }
    }
    return result;
}

async function readPostgresScopes() {
    const { Client: PgClient } = require('pg');
    const databaseConfig = require('./config/db.config');
    const postgres = new PgClient({
        host: process.env.SOURCE_DB_HOST || databaseConfig.HOST,
        port: Number(process.env.SOURCE_DB_PORT || databaseConfig.port || 5432),
        user: databaseConfig.USER,
        password: databaseConfig.PASSWORD,
        database: databaseConfig.DB,
        connectionTimeoutMillis: 10000,
        statement_timeout: 15000,
    });
    try {
        await postgres.connect();
        await postgres.query('BEGIN READ ONLY');
        const memberships = await postgres.query(`
            SELECT DISTINCT u.name AS "studentName", a.title AS "className", g."groupName" AS theme
            FROM "UserActivityGroups" membership
            JOIN "Users" u ON u.id = membership."UserId"
            JOIN "ActivityGroups" link ON link.id = membership."ActivityGroupId"
            JOIN "Activities" a ON a.id = link."ActivityId"
            JOIN "Groups" g ON g.id = link."GroupId"
            WHERE a."userId" IS DISTINCT FROM u.id
            ORDER BY u.name, a.title, g."groupName"
        `);
        await postgres.query('ROLLBACK');
        return uniqueScopes(memberships.rows);
    } finally {
        await postgres.end();
    }
}

async function main() {
    const dotenv = require('dotenv');
    for (const envPath of [path.join(__dirname, '.env'), path.join(__dirname, '../frontend/.env')]) {
        if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
    }
    for (const name of ['NOTION_API_KEY', 'NOTION_DATABASE_ID']) {
        if (!process.env[name]) throw new Error(`Missing configuration: ${name}`);
    }
    const { Client: NotionClient } = require('@notionhq/client');
    const apply = process.argv.includes('--apply');
    const inputIndex = process.argv.indexOf('--input');
    const inputFile = inputIndex >= 0 ? process.argv[inputIndex + 1] : null;
    if (inputIndex >= 0 && (!inputFile || inputFile.startsWith('--'))) throw new Error('Missing JSON file after --input.');
    const notion = new NotionClient({ auth: process.env.NOTION_API_KEY, timeoutMs: 15000, logLevel: 'error' });
    const schema = await notion.databases.retrieve({ database_id: process.env.NOTION_DATABASE_ID });
    for (const [field, type] of [['學生姓名', 'title'], ['班級', 'rich_text'], ['主題', 'rich_text']]) {
        if (schema.properties?.[field]?.type !== type) throw new Error(`Unexpected Notion field: ${field}`);
    }

    let scopes;
    if (inputFile) {
        scopes = parseFormalExport(JSON.parse(fs.readFileSync(inputFile, 'utf8').replace(/^\uFEFF/, '')));
    } else {
        scopes = await readPostgresScopes();
    }
    const result = await backfillScopes(scopes,
        (scope) => saveScopeToNotion(notion, process.env.NOTION_DATABASE_ID, scope), apply);
    console.log(JSON.stringify({ source: inputFile ? 'formal-website-export' : 'postgresql', ...result }));
    if (result.failed > 0) process.exitCode = 1;
}

module.exports = { uniqueScopes, parseFormalExport, backfillScopes, saveScopeToNotion };
if (require.main === module) main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
