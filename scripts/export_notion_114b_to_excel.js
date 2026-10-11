const path = require("path");
const { Client } = require("../backend/node_modules/@notionhq/client");
const XLSX = require("../backend/node_modules/xlsx");

const NOTION_API_KEY =
  process.env.NOTION_API_KEY || "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";
const NOTION_DATABASE_ID =
  process.env.NOTION_DATABASE_ID || "1f534b62aded8081bfb0d8c7cbdeb64c";

const TARGET_CLASS = process.env.TARGET_CLASS || "114B";
const TARGET_THEME =
  process.env.TARGET_THEME || "Should nuclear power be used to solve the power shortage in Taiwan?";
const EXCEL_PATH =
  process.env.EXCEL_PATH ||
  "q:/\u8ad6\u6587\u9032\u5ea6/\u6536\u8cc7\u6599\u5b78\u751f\u8cc7\u6599/1141B.xlsx";
const TEMPLATE_EXCEL_PATH = process.env.TEMPLATE_EXCEL_PATH || "";
const TARGET_SHEET = "B";

const FIELD_STUDENT_NAME = "\u5b78\u751f\u59d3\u540d";
const FIELD_CLASS = "\u73ed\u7d1a";
const FIELD_THEME = "\u4e3b\u984c";
const FIELD_ESSAY = "\u8b70\u8ad6\u6587\u5167\u5bb9";

const notion = new Client({ auth: NOTION_API_KEY });

const normalizeLookup = (value) => String(value ?? "").replace(/\u3000/g, " ").trim();

const htmlEntityMap = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": "\"",
  "&#39;": "'",
  "&apos;": "'",
  "&rsquo;": "'",
  "&lsquo;": "'",
  "&rdquo;": "\"",
  "&ldquo;": "\"",
  "&hellip;": "...",
  "&mdash;": "-",
  "&ndash;": "-",
  "&middot;": " ",
  "&bull;": " ",
};

function decodeHtmlEntities(input) {
  let text = String(input ?? "");
  text = text.replace(/&#(\d+);/g, (m, code) => {
    const n = Number(code);
    return Number.isNaN(n) ? m : String.fromCodePoint(n);
  });
  text = text.replace(/&#x([0-9a-fA-F]+);/g, (m, code) => {
    const n = Number.parseInt(code, 16);
    return Number.isNaN(n) ? m : String.fromCodePoint(n);
  });
  for (const [entity, value] of Object.entries(htmlEntityMap)) {
    text = text.replace(new RegExp(entity, "g"), value);
  }
  text = text.replace(/&[a-zA-Z][a-zA-Z0-9]+;/g, " ");
  return text;
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

function cleanEssayContent(input) {
  let text = String(input ?? "");
  text = decodeEscapedUnicode(text);
  text = decodeHtmlEntities(text);
  text = text.replace(/<\s*br\s*\/?>/gi, "\n");
  text = text.replace(/<\/\s*(p|div|li|h1|h2|h3|h4|h5|h6)\s*>/gi, "\n");
  text = text.replace(/<[^>]*>/g, " ");
  text = decodeHtmlEntities(text);
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, "");
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  text = text
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n");
  text = text.replace(/\n{3,}/g, "\n\n").trim();
  return text;
}

function getPlainTextByProperty(prop) {
  if (!prop || typeof prop !== "object") return "";
  if (Array.isArray(prop.title)) {
    return prop.title.map((item) => item?.plain_text || item?.text?.content || "").join("");
  }
  if (Array.isArray(prop.rich_text)) {
    return prop.rich_text.map((item) => item?.plain_text || item?.text?.content || "").join("");
  }
  if (typeof prop.select?.name === "string") return prop.select.name;
  if (typeof prop.status?.name === "string") return prop.status.name;
  if (typeof prop.number === "number") return String(prop.number);
  if (prop.checkbox === true || prop.checkbox === false) return String(prop.checkbox);
  if (typeof prop.url === "string") return prop.url;
  if (typeof prop.email === "string") return prop.email;
  if (typeof prop.phone_number === "string") return prop.phone_number;
  if (prop.date?.start) return String(prop.date.start);
  return "";
}

function toTimestamp(value) {
  const t = new Date(value || 0).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function pickBestPageForStudent(candidates) {
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const enriched = candidates.map((page) => {
    const props = page?.properties || {};
    const essayRaw = getPlainTextByProperty(props[FIELD_ESSAY]);
    const essayClean = cleanEssayContent(essayRaw);
    return {
      page,
      essayClean,
      hasEssay: essayClean.length > 0,
      editedTs: toTimestamp(page?.last_edited_time || page?.created_time),
      createdTs: toTimestamp(page?.created_time),
    };
  });
  enriched.sort((a, b) => {
    if (a.hasEssay !== b.hasEssay) return a.hasEssay ? -1 : 1;
    if (a.editedTs !== b.editedTs) return b.editedTs - a.editedTs;
    return b.createdTs - a.createdTs;
  });
  return enriched[0] || null;
}

async function queryAllByClassAndTheme() {
  const filter = {
    and: [
      { property: FIELD_CLASS, rich_text: { equals: TARGET_CLASS } },
      { property: FIELD_THEME, rich_text: { equals: TARGET_THEME } },
    ],
  };
  const rows = [];
  let cursor = undefined;
  while (true) {
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      filter,
      page_size: 100,
      start_cursor: cursor,
    });
    rows.push(...(response.results || []));
    if (!response.has_more || !response.next_cursor) break;
    cursor = response.next_cursor;
  }
  return rows;
}

function groupPagesByStudentName(pages) {
  const map = new Map();
  for (const page of pages) {
    const props = page?.properties || {};
    const studentName = normalizeLookup(getPlainTextByProperty(props[FIELD_STUDENT_NAME]));
    if (!studentName) continue;
    if (!map.has(studentName)) map.set(studentName, []);
    map.get(studentName).push(page);
  }
  return map;
}

async function main() {
  try {
    const pages = await queryAllByClassAndTheme();
    const pagesByStudent = groupPagesByStudentName(pages);
    const selectedByStudent = new Map();

    for (const [studentName, candidates] of pagesByStudent.entries()) {
      const best = pickBestPageForStudent(candidates);
      selectedByStudent.set(studentName, best);
    }

    const essayMap = new Map();
    for (const [studentName, selected] of selectedByStudent.entries()) {
      const essay = selected?.essayClean || "";
      essayMap.set(studentName, essay);
    }

    let workbook;
    let sheetName = TARGET_SHEET;
    let rows = [];
    let createdFromNotion = false;

    if (require("fs").existsSync(EXCEL_PATH)) {
      workbook = XLSX.readFile(EXCEL_PATH);
      sheetName = workbook.Sheets[TARGET_SHEET] ? TARGET_SHEET : workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
    } else {
      workbook = XLSX.utils.book_new();
      const headers = ["Name", "Student ID", "", "\u73ed\u7d1a", "\u4e3b\u984c", "\u8b70\u8ad6\u6587\u5167\u5bb9"];
      rows = [headers];

      if (TEMPLATE_EXCEL_PATH && require("fs").existsSync(TEMPLATE_EXCEL_PATH)) {
        const templateWb = XLSX.readFile(TEMPLATE_EXCEL_PATH);
        const templateSheetName = templateWb.Sheets[TARGET_SHEET]
          ? TARGET_SHEET
          : templateWb.SheetNames[0];
        const templateRows = XLSX.utils.sheet_to_json(templateWb.Sheets[templateSheetName], {
          header: 1,
          defval: "",
        });
        if (Array.isArray(templateRows) && templateRows.length > 0) {
          rows[0] = templateRows[0];
        }
      }

      const notionNames = [...essayMap.keys()].sort((a, b) => a.localeCompare(b, "zh-Hant"));
      for (const name of notionNames) {
        rows.push([name, "", "", TARGET_CLASS, TARGET_THEME, essayMap.get(name) || ""]);
      }
      createdFromNotion = true;
    }

    const excelNames = new Set();
    let filledCount = 0;

    for (let i = 1; i < rows.length; i += 1) {
      const row = rows[i];
      const studentName = normalizeLookup(row[0]);
      if (!studentName) continue;
      excelNames.add(studentName);
      const essay = essayMap.get(studentName) || "";
      row[3] = TARGET_CLASS;
      row[4] = TARGET_THEME;
      row[5] = essay;
      if (essay) filledCount += 1;
    }

    const outputSheet = XLSX.utils.aoa_to_sheet(rows);
    if (workbook.Sheets[sheetName]) {
      workbook.Sheets[sheetName] = outputSheet;
    } else {
      XLSX.utils.book_append_sheet(workbook, outputSheet, sheetName);
    }
    XLSX.writeFile(workbook, EXCEL_PATH);

    const missingInNotion = [...excelNames].filter((name) => !essayMap.has(name));
    const extraNotionNames = [...essayMap.keys()].filter((name) => !excelNames.has(name));
    const blankAfterSelection = [...excelNames].filter((name) => !normalizeLookup(essayMap.get(name)));

    console.log(`Target class: ${TARGET_CLASS}`);
    console.log(`Target theme: ${TARGET_THEME}`);
    console.log(`Notion rows (raw): ${pages.length}`);
    console.log(`Notion students (all): ${pagesByStudent.size}`);
    console.log(`Notion students (selected): ${selectedByStudent.size}`);
    console.log(`Excel rows filled: ${filledCount}`);
    console.log(`Created workbook from Notion rows: ${createdFromNotion ? "yes" : "no"}`);
    console.log(`Excel names missing in Notion: ${missingInNotion.length}`);
    if (missingInNotion.length) console.log(`Missing names: ${missingInNotion.join(", ")}`);
    console.log(`Extra Notion names not in Excel: ${extraNotionNames.length}`);
    if (extraNotionNames.length) console.log(`Extra names: ${extraNotionNames.join(", ")}`);
    console.log(`Excel names still blank after scanning all duplicate pages: ${blankAfterSelection.length}`);
    if (blankAfterSelection.length) console.log(`Still blank names: ${blankAfterSelection.join(", ")}`);
    console.log(`Updated sheet: ${sheetName}`);
    console.log(`Updated file: ${path.resolve(EXCEL_PATH)}`);
  } catch (error) {
    console.error("Export failed:", error?.message || error);
    process.exit(1);
  }
}

main();
