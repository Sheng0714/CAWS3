const path = require("path");
const { Client } = require("../backend/node_modules/@notionhq/client");
const XLSX = require("../backend/node_modules/xlsx");

const NOTION_API_KEY = process.env.NOTION_API_KEY || "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";
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || "1f534b62aded8081bfb0d8c7cbdeb64c";

const TARGET_CLASS = "114B";
const TARGET_THEME = "Should nuclear power be used to solve the power shortage in Taiwan?";
const EXCEL_PATH = "q:/論文進度/收資料學生資料/1141B.xlsx";
const TARGET_SHEET = "B";

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
  text = text.replace(/&#(\d+);/g, (_, code) => {
    const n = Number(code);
    return Number.isNaN(n) ? _ : String.fromCodePoint(n);
  });
  text = text.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => {
    const n = Number.parseInt(code, 16);
    return Number.isNaN(n) ? _ : String.fromCodePoint(n);
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

async function queryAllByClassAndTheme() {
  const filter = {
    and: [
      { property: "班級", rich_text: { equals: TARGET_CLASS } },
      { property: "主題", rich_text: { equals: TARGET_THEME } },
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

function dedupeByLatestStudentName(pages) {
  const map = new Map();
  for (const page of pages) {
    const props = page?.properties || {};
    const name = normalizeLookup(getPlainTextByProperty(props["學生姓名"]));
    if (!name) continue;
    const current = map.get(name);
    if (!current) {
      map.set(name, page);
      continue;
    }
    const currentTs = new Date(current?.last_edited_time || current?.created_time || 0).getTime();
    const incomingTs = new Date(page?.last_edited_time || page?.created_time || 0).getTime();
    if (incomingTs >= currentTs) map.set(name, page);
  }
  return map;
}

function main() {
  return queryAllByClassAndTheme()
    .then((pages) => {
      const latestByName = dedupeByLatestStudentName(pages);
      const essayMap = new Map();

      for (const [studentName, page] of latestByName.entries()) {
        const props = page?.properties || {};
        const essayRaw = getPlainTextByProperty(props["議論文內容"]);
        const cleaned = cleanEssayContent(essayRaw);
        essayMap.set(studentName, cleaned);
      }

      const workbook = XLSX.readFile(EXCEL_PATH);
      const sheetName = workbook.Sheets[TARGET_SHEET] ? TARGET_SHEET : workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

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

      const extraNotionNames = [...essayMap.keys()].filter((name) => !excelNames.has(name));
      const missingInNotion = [...excelNames].filter((name) => !essayMap.has(name));

      workbook.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(rows);
      XLSX.writeFile(workbook, EXCEL_PATH);

      console.log(`Notion rows (raw): ${pages.length}`);
      console.log(`Notion students (deduped): ${essayMap.size}`);
      console.log(`Excel rows filled: ${filledCount}`);
      console.log(`Missing in Notion for Excel names: ${missingInNotion.length}`);
      if (missingInNotion.length) {
        console.log(`Missing names: ${missingInNotion.join(", ")}`);
      }
      console.log(`Extra Notion names not in Excel: ${extraNotionNames.length}`);
      if (extraNotionNames.length) {
        console.log(`Extra names: ${extraNotionNames.join(", ")}`);
      }
      console.log(`Updated sheet: ${sheetName}`);
      console.log(`Updated file: ${path.resolve(EXCEL_PATH)}`);
    })
    .catch((error) => {
      console.error("Export failed:", error?.message || error);
      process.exit(1);
    });
}

main();
