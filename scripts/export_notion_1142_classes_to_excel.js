const fs = require("fs");
const path = require("path");
const { Client } = require("../backend/node_modules/@notionhq/client");
const XLSX = require("../backend/node_modules/xlsx");

const DEFAULT_CLASSES = ["1142B", "1142C", "1142H"];
const DEFAULT_OUTPUT_DIR = path.join(process.cwd(), "exports", "notion-1142");
const REQUIRED_HEADERS = ["姓名", "學號", "信箱", "班級", "主題", "聊天歷史紀錄"];
const EXCEL_CELL_LIMIT = 32767;
const SAFE_CELL_LIMIT = 32000;

const FIELD_ALIASES = {
  name: ["姓名", "學生姓名", "Name", "Student Name", "studentName"],
  studentId: ["學號", "學生學號", "Student ID", "StudentID", "studentId", "Student Id", "帳號", "Account", "ID"],
  email: ["信箱", "電子信箱", "電子郵件", "Email", "E-mail", "Mail", "email"],
  className: ["班級", "Class", "Class Name", "className"],
  theme: ["主題", "題目", "Theme", "Topic", "topicName"],
  chatHistory: ["聊天歷史紀錄", "聊天歷史", "對話紀錄", "Chat History", "chatHistory"],
};

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex < 1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function loadProjectEnvFiles() {
  [
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), "backend", ".env"),
    path.join(process.cwd(), "frontend", ".env"),
    path.join(process.cwd(), "notion-backend", ".env"),
  ].forEach(loadEnvFile);
}

const normalizeLookup = (value) =>
  String(value ?? "")
    .replace(/\u3000/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeKey = (value) => normalizeLookup(value).toLowerCase();

function getExistingScriptDefault(envName) {
  const scriptPath = path.join(__dirname, "export_notion_114b_to_excel.js");
  if (!fs.existsSync(scriptPath)) return "";

  const source = fs.readFileSync(scriptPath, "utf8");
  const escapedEnvName = envName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`process\\.env\\.${escapedEnvName}\\s*\\|\\|\\s*"([^"]+)"`));
  return match?.[1] || "";
}

function resolveNotionConfig() {
  const apiKey = process.env.NOTION_API_KEY || getExistingScriptDefault("NOTION_API_KEY");
  const databaseId = process.env.NOTION_DATABASE_ID || getExistingScriptDefault("NOTION_DATABASE_ID");

  if (!apiKey || !databaseId) {
    throw new Error("Missing NOTION_API_KEY or NOTION_DATABASE_ID.");
  }

  return { apiKey, databaseId };
}

function richTextToPlainText(items) {
  return Array.isArray(items)
    ? items.map((item) => item?.plain_text || item?.text?.content || "").join("")
    : "";
}

function getPlainTextByProperty(prop) {
  if (!prop || typeof prop !== "object") return "";

  switch (prop.type) {
    case "title":
      return richTextToPlainText(prop.title);
    case "rich_text":
      return richTextToPlainText(prop.rich_text);
    case "select":
      return prop.select?.name || "";
    case "multi_select":
      return Array.isArray(prop.multi_select) ? prop.multi_select.map((item) => item?.name || "").filter(Boolean).join(", ") : "";
    case "status":
      return prop.status?.name || "";
    case "number":
      return prop.number === null || prop.number === undefined ? "" : String(prop.number);
    case "email":
      return prop.email || "";
    case "phone_number":
      return prop.phone_number || "";
    case "url":
      return prop.url || "";
    case "date":
      return prop.date?.start ? `${prop.date.start}${prop.date.end ? ` - ${prop.date.end}` : ""}` : "";
    case "checkbox":
      return prop.checkbox === true ? "true" : prop.checkbox === false ? "false" : "";
    case "people":
      return Array.isArray(prop.people) ? prop.people.map((person) => person?.name || person?.id || "").filter(Boolean).join(", ") : "";
    case "formula":
      return getPlainTextFromFormula(prop.formula);
    case "rollup":
      return getPlainTextFromRollup(prop.rollup);
    case "created_time":
      return prop.created_time || "";
    case "last_edited_time":
      return prop.last_edited_time || "";
    default:
      break;
  }

  if (Array.isArray(prop.title)) return richTextToPlainText(prop.title);
  if (Array.isArray(prop.rich_text)) return richTextToPlainText(prop.rich_text);
  if (typeof prop.email === "string") return prop.email;
  if (typeof prop.url === "string") return prop.url;
  if (typeof prop.number === "number") return String(prop.number);
  return "";
}

function getPlainTextFromFormula(formula) {
  if (!formula || typeof formula !== "object") return "";
  if (typeof formula.string === "string") return formula.string;
  if (typeof formula.number === "number") return String(formula.number);
  if (typeof formula.boolean === "boolean") return String(formula.boolean);
  if (formula.date?.start) return `${formula.date.start}${formula.date.end ? ` - ${formula.date.end}` : ""}`;
  return "";
}

function getPlainTextFromRollup(rollup) {
  if (!rollup || typeof rollup !== "object") return "";
  if (typeof rollup.number === "number") return String(rollup.number);
  if (typeof rollup.date?.start === "string") return `${rollup.date.start}${rollup.date.end ? ` - ${rollup.date.end}` : ""}`;
  if (Array.isArray(rollup.array)) return rollup.array.map(getPlainTextByProperty).filter(Boolean).join(", ");
  return "";
}

function getPropertyValue(properties, aliases) {
  const directNamesByKey = new Map(Object.keys(properties || {}).map((name) => [normalizeKey(name), name]));

  for (const alias of aliases) {
    const directName = directNamesByKey.get(normalizeKey(alias));
    if (!directName) continue;
    const value = normalizeLookup(getPlainTextByProperty(properties[directName]));
    if (value) return value;
  }

  for (const [propertyName, prop] of Object.entries(properties || {})) {
    const normalizedPropertyName = normalizeKey(propertyName);
    if (!aliases.some((alias) => normalizedPropertyName.includes(normalizeKey(alias)))) continue;
    const value = normalizeLookup(getPlainTextByProperty(prop));
    if (value) return value;
  }

  return "";
}

const htmlEntityMap = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&rsquo;": "'",
  "&lsquo;": "'",
  "&rdquo;": '"',
  "&ldquo;": '"',
  "&hellip;": "...",
  "&mdash;": "-",
  "&ndash;": "-",
  "&middot;": " ",
  "&bull;": " ",
};

function decodeHtmlEntities(input) {
  let text = String(input ?? "");
  text = text.replace(/&#(\d+);/g, (match, code) => {
    const value = Number(code);
    return Number.isNaN(value) ? match : String.fromCodePoint(value);
  });
  text = text.replace(/&#x([0-9a-fA-F]+);/g, (match, code) => {
    const value = Number.parseInt(code, 16);
    return Number.isNaN(value) ? match : String.fromCodePoint(value);
  });
  for (const [entity, value] of Object.entries(htmlEntityMap)) {
    text = text.replace(new RegExp(entity, "g"), value);
  }
  return text.replace(/&[a-zA-Z][a-zA-Z0-9]+;/g, " ");
}

function decodeEscapedUnicode(input) {
  const raw = String(input ?? "");
  if (!/\\u[0-9a-fA-F]{4}/.test(raw) && !/\\n|\\t|\\r/.test(raw)) return raw;
  try {
    return JSON.parse(`"${raw.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`);
  } catch {
    return raw;
  }
}

function cleanText(input) {
  let text = String(input ?? "");
  text = decodeEscapedUnicode(text);
  text = decodeHtmlEntities(text);
  text = text.replace(/<\s*br\s*\/?>/gi, "\n");
  text = text.replace(/<\/\s*(p|div|li|h1|h2|h3|h4|h5|h6)\s*>/gi, "\n");
  text = text.replace(/<[^>]*>/g, " ");
  text = decodeHtmlEntities(text);
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, "");
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return text
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function tryParseJson(rawText) {
  const candidates = [String(rawText ?? ""), cleanText(rawText)];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next normalized candidate.
    }
  }
  return null;
}

function formatTimestamp(value) {
  const timestamp = typeof value === "number" ? value : Date.parse(value || "");
  if (!Number.isFinite(timestamp)) return "";
  return new Date(timestamp).toISOString();
}

function formatChatHistory(rawText) {
  const parsed = tryParseJson(rawText);
  if (!parsed) return cleanText(rawText);

  if (Array.isArray(parsed)) {
    return parsed.map((session, index) => formatChatSession(session, index)).filter(Boolean).join("\n\n");
  }

  return JSON.stringify(parsed, null, 2);
}

function formatChatSession(session, index) {
  if (Array.isArray(session)) {
    return [`Session ${index + 1}`, ...session.map((message, messageIndex) => formatMessage(message, messageIndex)).filter(Boolean)].join("\n");
  }

  if (!session || typeof session !== "object") return cleanText(session);

  const headerParts = [`Session ${index + 1}`];
  if (session.sessionId) headerParts.push(String(session.sessionId));
  if (session.modeTitle || session.chatbotEntryMode) headerParts.push(String(session.modeTitle || session.chatbotEntryMode));

  const messages = Array.isArray(session.messages) ? session.messages : [];
  if (!messages.length) return `${headerParts.join(" | ")}\n${JSON.stringify(session, null, 2)}`;

  return [headerParts.join(" | "), ...messages.map((message, messageIndex) => formatMessage(message, messageIndex)).filter(Boolean)].join("\n");
}

function formatMessage(message, messageIndex) {
  if (!message || typeof message !== "object") return cleanText(message);

  const role = message.role === "assistant" ? "assistant" : "user";
  const time = message.created_at || formatTimestamp(message.createdAt);
  const prefix = [messageIndex + 1, time, role].filter(Boolean).join(" | ");
  return `${prefix}: ${cleanText(message.content || "")}`;
}

function toExcelCell(value, truncateTracker) {
  const text = String(value ?? "");
  if (text.length <= EXCEL_CELL_LIMIT) return text;

  if (truncateTracker) truncateTracker.count += 1;
  return `${text.slice(0, SAFE_CELL_LIMIT)}\n[內容超過 Excel 單格上限，已截斷]`;
}

function splitIntoExcelCells(value) {
  const text = String(value ?? "");
  if (!text) return [""];

  const chunks = [];
  for (let index = 0; index < text.length; index += SAFE_CELL_LIMIT) {
    chunks.push(text.slice(index, index + SAFE_CELL_LIMIT));
  }
  return chunks.length ? chunks : [""];
}

async function queryAllNotionRows(notion, databaseId) {
  const rows = [];
  let startCursor;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
      start_cursor: startCursor,
    });
    rows.push(...(response.results || []));
    startCursor = response.has_more ? response.next_cursor : undefined;
  } while (startCursor);

  return rows;
}

function extractRecord(page) {
  const properties = page?.properties || {};
  const rawChatHistory = getPropertyValue(properties, FIELD_ALIASES.chatHistory);
  return {
    pageId: page?.id || "",
    createdTime: page?.created_time || "",
    lastEditedTime: page?.last_edited_time || "",
    name: getPropertyValue(properties, FIELD_ALIASES.name),
    studentId: getPropertyValue(properties, FIELD_ALIASES.studentId),
    email: getPropertyValue(properties, FIELD_ALIASES.email),
    className: getPropertyValue(properties, FIELD_ALIASES.className),
    theme: getPropertyValue(properties, FIELD_ALIASES.theme),
    rawChatHistory,
    chatHistory: formatChatHistory(rawChatHistory),
  };
}

function chooseFirstNonEmpty(records, fieldName) {
  return records.find((record) => normalizeLookup(record[fieldName]))?.[fieldName] || "";
}

function toTimeValue(value) {
  const timestamp = Date.parse(value || "");
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function mergeRecords(records, fallbackClassName) {
  const newestFirst = [...records].sort((a, b) => toTimeValue(b.lastEditedTime || b.createdTime) - toTimeValue(a.lastEditedTime || a.createdTime));
  const bestChatFirst = [...records].sort((a, b) => {
    const aHasChat = normalizeLookup(a.chatHistory) ? 1 : 0;
    const bHasChat = normalizeLookup(b.chatHistory) ? 1 : 0;
    if (aHasChat !== bHasChat) return bHasChat - aHasChat;
    if ((a.chatHistory || "").length !== (b.chatHistory || "").length) return (b.chatHistory || "").length - (a.chatHistory || "").length;
    return toTimeValue(b.lastEditedTime || b.createdTime) - toTimeValue(a.lastEditedTime || a.createdTime);
  });

  return {
    name: chooseFirstNonEmpty(newestFirst, "name"),
    studentId: chooseFirstNonEmpty(newestFirst, "studentId"),
    email: chooseFirstNonEmpty(newestFirst, "email"),
    className: chooseFirstNonEmpty(newestFirst, "className") || fallbackClassName,
    theme: chooseFirstNonEmpty(newestFirst, "theme"),
    chatHistory: chooseFirstNonEmpty(bestChatFirst, "chatHistory"),
    pageCount: records.length,
  };
}

function groupRecords(records) {
  const groups = new Map();
  for (const record of records) {
    const personKey = normalizeKey(record.studentId) || normalizeKey(record.email) || normalizeKey(record.name) || record.pageId;
    const themeKey = normalizeKey(record.theme) || "no-theme";
    const key = `${personKey}::${themeKey}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }
  return groups;
}

function sortExportRows(rows) {
  return rows.sort((a, b) => {
    const nameCompare = String(a.name || "").localeCompare(String(b.name || ""), "zh-Hant");
    if (nameCompare) return nameCompare;
    const idCompare = String(a.studentId || "").localeCompare(String(b.studentId || ""), "zh-Hant");
    if (idCompare) return idCompare;
    return String(a.theme || "").localeCompare(String(b.theme || ""), "zh-Hant");
  });
}

function writeWorkbook({ className, rows, outputDir }) {
  fs.mkdirSync(outputDir, { recursive: true });

  const truncateTracker = { count: 0 };
  const rowsWithChatChunks = rows.map((record) => ({
    ...record,
    chatHistoryChunks: splitIntoExcelCells(record.chatHistory),
  }));
  const maxChatChunks = Math.max(1, ...rowsWithChatChunks.map((record) => record.chatHistoryChunks.length));
  const headers = [
    ...REQUIRED_HEADERS,
    ...Array.from({ length: maxChatChunks - 1 }, (_, index) => `聊天歷史紀錄_${index + 2}`),
  ];
  const sheetRows = [
    headers,
    ...rowsWithChatChunks.map((record) => [
      toExcelCell(record.name, truncateTracker),
      toExcelCell(record.studentId, truncateTracker),
      toExcelCell(record.email, truncateTracker),
      toExcelCell(record.className || className, truncateTracker),
      toExcelCell(record.theme, truncateTracker),
      ...Array.from({ length: maxChatChunks }, (_, index) => record.chatHistoryChunks[index] || ""),
    ]),
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
  worksheet["!cols"] = [
    { wch: 16 },
    { wch: 16 },
    { wch: 28 },
    { wch: 12 },
    { wch: 52 },
    ...Array.from({ length: maxChatChunks }, () => ({ wch: 100 })),
  ];
  XLSX.utils.book_append_sheet(workbook, worksheet, "資料");

  const outputPath = path.join(outputDir, `${className}.xlsx`);
  XLSX.writeFile(workbook, outputPath);
  return {
    outputPath,
    truncatedCells: truncateTracker.count,
    splitChatRows: rowsWithChatChunks.filter((record) => record.chatHistoryChunks.length > 1).length,
    maxChatChunks,
  };
}

function parseClasses() {
  const raw = process.env.CLASSES || DEFAULT_CLASSES.join(",");
  return raw
    .split(",")
    .map((item) => normalizeLookup(item))
    .filter(Boolean);
}

function summarizeMissingFields(rows) {
  const fields = [
    ["姓名", "name"],
    ["學號", "studentId"],
    ["信箱", "email"],
    ["主題", "theme"],
    ["聊天歷史紀錄", "chatHistory"],
  ];

  return fields
    .map(([label, field]) => `${label}:${rows.filter((row) => !normalizeLookup(row[field])).length}`)
    .join(", ");
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const outputDir = process.env.OUTPUT_DIR ? path.resolve(process.env.OUTPUT_DIR) : DEFAULT_OUTPUT_DIR;
  const classNames = parseClasses();
  const classKeys = new Set(classNames.map(normalizeKey));
  loadProjectEnvFiles();
  const { apiKey, databaseId } = resolveNotionConfig();
  const notion = new Client({ auth: apiKey });

  const database = await notion.databases.retrieve({ database_id: databaseId });
  const propertySummary = Object.entries(database.properties || {})
    .map(([name, property]) => `${name}:${property.type}`)
    .join(", ");
  console.log(`Database properties: ${propertySummary}`);

  const pages = await queryAllNotionRows(notion, databaseId);
  const extractedRecords = pages.map(extractRecord).filter((record) => classKeys.has(normalizeKey(record.className)));
  console.log(`Fetched Notion pages: ${pages.length}`);
  console.log(`Matched target-class pages: ${extractedRecords.length}`);

  for (const className of classNames) {
    const classRecords = extractedRecords.filter((record) => normalizeKey(record.className) === normalizeKey(className));
    const grouped = groupRecords(classRecords);
    const exportRows = sortExportRows([...grouped.values()].map((records) => mergeRecords(records, className)));

    console.log(`${className}: pages=${classRecords.length}, rows=${exportRows.length}, missing={${summarizeMissingFields(exportRows)}}`);
    if (dryRun) continue;

    const result = writeWorkbook({ className, rows: exportRows, outputDir });
    console.log(
      `${className}: wrote ${result.outputPath}, splitChatRows=${result.splitChatRows}, chatColumns=${result.maxChatChunks}${result.truncatedCells ? `, truncatedCells=${result.truncatedCells}` : ""}`
    );
  }
}

main().catch((error) => {
  console.error("Export failed:", error?.message || error);
  process.exit(1);
});
