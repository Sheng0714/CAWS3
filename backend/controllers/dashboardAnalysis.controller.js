const fs = require("fs/promises");
const path = require("path");
const axios = require("axios");

const DEFAULT_OPENAI_MODEL = process.env.OPENAI_DASHBOARD_MODEL || "gpt-4o";
const DEFAULT_RAGFLOW_API_SERVER = process.env.RAGFLOW_API_SERVER || "https://wu-ragflow.zeabur.app";
const DEFAULT_RAGFLOW_AGENT_ID =
  process.env.RAGFLOW_DASHBOARD_AGENT_ID || "927247da462711f18b61a61716fb138a";
const DEFAULT_RAGFLOW_API_KEY =
  process.env.RAGFLOW_API_KEY || "ragflow-E5MjJlMmFlMWMxMTExZjFiZjJkYTYxNz";

const TARGET_CLASS_CODE = "1142B";
const TARGET_FILE_PATH_CANDIDATES = [
  path.resolve(__dirname, "../../frontend/src/contexts/1142B.txt"),
  path.resolve(process.cwd(), "../frontend/src/contexts/1142B.txt"),
  path.resolve(process.cwd(), "frontend/src/contexts/1142B.txt"),
  path.resolve(process.cwd(), "1142B.txt"),
  path.resolve(__dirname, "../1142B.txt"),
];

let cachedMtimeMs = null;
let cachedSignature = null;
let cachedAnalysis = null;

const normalizeWhitespace = (input) => {
  return String(input || "").replace(/\s+/g, " ").trim();
};

const normalizeGroupId = (value) => {
  const groupId = String(value || "").trim().toUpperCase();
  return /^G\d+$/.test(groupId) ? groupId : "";
};

const toNonNegativeInteger = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.round(num));
};

const sanitizeClientEntries = (entriesInput) => {
  if (!Array.isArray(entriesInput)) return [];

  return entriesInput
    .map((item, index) => {
      const groupId = normalizeGroupId(item?.groupId);
      const text = normalizeWhitespace(typeof item?.text === "string" ? item.text : "");
      if (!groupId || !text) return null;

      return {
        id: `${groupId}-client-${index + 1}`,
        groupId,
        text: text.slice(0, 280),
      };
    })
    .filter(Boolean);
};

const parseEntriesFromText = (rawText) => {
  const text = String(rawText || "");
  const pattern = /\(([^()\r\n]{0,800}?G(\d+)\s*)\)/g;
  const matches = [...text.matchAll(pattern)];

  return matches.map((match, index) => {
    const markerText = normalizeWhitespace(match[1]);
    const groupNumber = match[2];
    const groupId = `G${groupNumber}`;
    const markerStart = match.index || 0;
    const snippetStart = Math.max(0, markerStart - 260);
    const snippet = normalizeWhitespace(text.slice(snippetStart, markerStart));

    const topicText = normalizeWhitespace(
      markerText.replace(/\bby\b[\s\S]*$/i, "").replace(/\bG\d+\s*$/i, "")
    );

    return {
      id: `${groupId}-${index + 1}`,
      groupId,
      text: normalizeWhitespace(`${topicText} ${snippet.slice(-220)}`),
    };
  });
};

const readSourceTextFromCandidates = async () => {
  let lastPathError = null;
  for (const candidatePath of TARGET_FILE_PATH_CANDIDATES) {
    try {
      const stat = await fs.stat(candidatePath);
      const content = await fs.readFile(candidatePath, "utf8");
      return { content, mtimeMs: stat.mtimeMs };
    } catch (error) {
      lastPathError = error;
    }
  }

  throw lastPathError || new Error("Failed to locate 1142B source text.");
};

const heuristicLabel = (entryText) => {
  const normalized = String(entryText || "").toLowerCase();

  if (
    /(evidence|new information|study|source|citation|according to|from|link|http|https|research|data|paper)/.test(
      normalized
    )
  ) {
    return "evidence";
  }

  if (
    /(disagree|cannot explain|can not explain|not|weak|weaken|risk|reduce|loss|problem|hallucination|lazy|over dependence|privacy)/.test(
      normalized
    )
  ) {
    return "oppose";
  }

  return "support";
};

const buildCountsFromLabelMap = (entries, labelById) => {
  const byGroup = {};

  entries.forEach((entry) => {
    const groupId = entry.groupId;
    if (!byGroup[groupId]) {
      byGroup[groupId] = { support: 0, oppose: 0, evidence: 0 };
    }

    const label = labelById[entry.id] || heuristicLabel(entry.text);
    byGroup[groupId][label] += 1;
  });

  return Object.keys(byGroup)
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))
    .map((groupId) => ({
      groupId,
      counts: byGroup[groupId],
    }));
};

const buildGroupsFromHeuristic = (entries) => {
  const labelById = {};
  entries.forEach((entry) => {
    labelById[entry.id] = heuristicLabel(entry.text);
  });
  return buildCountsFromLabelMap(entries, labelById);
};

const extractJsonText = (rawText) => {
  const text = String(rawText || "").trim();
  if (!text) return "";

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const objectLike = text.match(/\{[\s\S]*\}/);
  if (objectLike?.[0]) return objectLike[0];

  const arrayLike = text.match(/\[[\s\S]*\]/);
  if (arrayLike?.[0]) return arrayLike[0];

  return "";
};

const parseClassifierOutput = (outputText) => {
  const jsonText = extractJsonText(outputText);
  if (!jsonText) return null;

  try {
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
};

const normalizeLabel = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (["support", "pro", "agree", "贊成", "支持"].includes(normalized)) return "support";
  if (["oppose", "con", "disagree", "反對"].includes(normalized)) return "oppose";
  if (["evidence", "proof", "證據", "佐證"].includes(normalized)) return "evidence";
  return "";
};

const extractLabelMapFromParsed = (parsed) => {
  if (!parsed || !Array.isArray(parsed?.groups)) return {};
  const labelById = {};

  parsed.groups.forEach((group) => {
    const classifications = Array.isArray(group?.classifications) ? group.classifications : [];
    classifications.forEach((item) => {
      const id = typeof item?.id === "string" ? item.id : "";
      const label = normalizeLabel(item?.label);
      if (id && label) {
        labelById[id] = label;
      }
    });
  });

  return labelById;
};

const extractCountsByGroupFromParsed = (parsed) => {
  const groupsArray = Array.isArray(parsed?.groups)
    ? parsed.groups
    : Array.isArray(parsed)
      ? parsed
      : [];

  const byGroup = {};

  groupsArray.forEach((group) => {
    const groupId = normalizeGroupId(group?.groupId || group?.group || group?.id);
    if (!groupId) return;

    const countsInput = group?.counts || group;
    byGroup[groupId] = {
      support: toNonNegativeInteger(
        countsInput?.support ?? countsInput?.pro ?? countsInput?.agree ?? countsInput?.["贊成論點"]
      ),
      oppose: toNonNegativeInteger(
        countsInput?.oppose ?? countsInput?.con ?? countsInput?.disagree ?? countsInput?.["反對論點"]
      ),
      evidence: toNonNegativeInteger(
        countsInput?.evidence ?? countsInput?.proof ?? countsInput?.["證據"] ?? countsInput?.["佐證"]
      ),
    };
  });

  if (Object.keys(byGroup).length > 0) return byGroup;

  if (parsed && typeof parsed === "object") {
    Object.keys(parsed).forEach((key) => {
      const groupId = normalizeGroupId(key);
      if (!groupId) return;
      const value = parsed[key] || {};
      byGroup[groupId] = {
        support: toNonNegativeInteger(value?.support ?? value?.["贊成論點"]),
        oppose: toNonNegativeInteger(value?.oppose ?? value?.["反對論點"]),
        evidence: toNonNegativeInteger(value?.evidence ?? value?.["證據"]),
      };
    });
  }

  return byGroup;
};

const sortGroupIds = (groupIds) => {
  return [...new Set(groupIds)]
    .filter(Boolean)
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
};

const buildGroupsFromCountMap = (entries, countMap) => {
  const groupIdsFromEntries = entries.map((entry) => entry.groupId);
  const groupIdsFromMap = Object.keys(countMap || {});
  const orderedGroupIds = sortGroupIds([...groupIdsFromEntries, ...groupIdsFromMap]);

  return orderedGroupIds.map((groupId) => {
    const counts = countMap?.[groupId] || {};
    return {
      groupId,
      counts: {
        support: toNonNegativeInteger(counts.support),
        oppose: toNonNegativeInteger(counts.oppose),
        evidence: toNonNegativeInteger(counts.evidence),
      },
    };
  });
};

const buildRagflowQuestion = ({ entries, sourceText }) => {
  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.groupId]) acc[entry.groupId] = [];
    acc[entry.groupId].push(entry.text);
    return acc;
  }, {});

  const groups = sortGroupIds(Object.keys(groupedEntries)).map((groupId) => ({
    groupId,
    entries: groupedEntries[groupId].map((text, index) => ({
      idx: index + 1,
      text,
    })),
  }));

  const sections = [
    "請你擔任論點分類器，針對每個組別統計三種數量：support(贊成論點)、oppose(反對論點)、evidence(證據)。",
    "你必須回傳 JSON，且只能回傳 JSON，不要加說明文字。",
    '格式如下：{"groups":[{"groupId":"G1","counts":{"support":0,"oppose":0,"evidence":0}}]}',
    "我會同時提供原始文本與萃取後資料。若有衝突，以原始文本為準。",
    "萃取後資料如下：",
    JSON.stringify({ groups }, null, 2),
  ];

  if (typeof sourceText === "string" && sourceText.trim()) {
    sections.push("原始文本（1142B.txt）如下：");
    sections.push(sourceText.trim());
  }

  return sections.join("\n");
};

const buildRagflowFinalAggregationPrompt = () => {
  return [
    "你已收到 1142B.txt 的完整內容（分段）。",
    "請依照該完整內容統計每組 support(贊成論點)、oppose(反對論點)、evidence(證據)。",
    "只回傳 JSON，不要任何額外文字。",
    '格式：{"groups":[{"groupId":"G1","counts":{"support":0,"oppose":0,"evidence":0}}]}',
  ].join("\n");
};

const splitTextIntoChunks = (text, maxChunkLength = 1500) => {
  const raw = String(text || "").trim();
  if (!raw) return [];
  if (raw.length <= maxChunkLength) return [raw];

  const lines = raw.split(/\r?\n/);
  const chunks = [];
  let buffer = "";

  lines.forEach((line) => {
    const nextLine = `${line}\n`;
    if ((buffer + nextLine).length > maxChunkLength && buffer.trim()) {
      chunks.push(buffer.trim());
      buffer = nextLine;
    } else {
      buffer += nextLine;
    }
  });

  if (buffer.trim()) {
    chunks.push(buffer.trim());
  }

  return chunks;
};

const callRagflowAgentClassifier = async (entries, options = {}) => {
  const apiServer = String(options.apiServer || DEFAULT_RAGFLOW_API_SERVER).replace(/\/+$/, "");
  const apiKey = String(options.apiKey || DEFAULT_RAGFLOW_API_KEY).trim();
  const agentId = String(options.agentId || DEFAULT_RAGFLOW_AGENT_ID).trim();
  const userId = String(options.userId || "dashboard_1142B_classifier").trim();
  const sourceText = typeof options.sourceText === "string" ? options.sourceText : "";

  if (!apiServer) throw new Error("RAGFLOW_API_SERVER is not configured.");
  if (!apiKey) throw new Error("RAGFLOW_API_KEY is not configured.");
  if (!agentId) throw new Error("RAGFLOW classifier agent id is missing.");

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const sendCompletion = async (questionText) => {
    const completionResponse = await axios.post(
      `${apiServer}/api/v1/agents/${agentId}/completions`,
      {
        question: questionText,
        session_id: sessionId,
        stream: false,
      },
      { headers, timeout: 120000 }
    );

    const completionPayload = completionResponse?.data || {};
    if (completionPayload?.code !== 0) {
      throw new Error(completionPayload?.message || "RAGFLOW completion failed.");
    }

    return completionPayload;
  };

  const createSessionResponse = await axios.post(
    `${apiServer}/api/v1/agents/${agentId}/sessions?user_id=${encodeURIComponent(userId)}`,
    { name: `Dashboard-${TARGET_CLASS_CODE}-${Date.now()}` },
    { headers, timeout: 45000 }
  );

  const createPayload = createSessionResponse?.data || {};
  if (createPayload?.code !== 0) {
    throw new Error(createPayload?.message || "Failed to create RAGFLOW session.");
  }

  const sessionId =
    createPayload?.data?.id ||
    createPayload?.data?.session_id ||
    createPayload?.id ||
    createPayload?.session_id;

  if (!sessionId) {
    throw new Error("RAGFLOW session id missing in create response.");
  }

  let completionPayload = null;
  try {
    completionPayload = await sendCompletion(buildRagflowQuestion({ entries, sourceText }));
  } catch (error) {
    if (error?.response?.status !== 413) {
      throw error;
    }

    const chunks = splitTextIntoChunks(sourceText, 1500);
    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i];
      const feedChunkPrompt = [
        `這是 1142B.txt 的第 ${i + 1}/${chunks.length} 段原文。`,
        "請先記住這段內容，僅回覆 OK。",
        chunk,
      ].join("\n");
      await sendCompletion(feedChunkPrompt);
    }

    const finalPrompt = buildRagflowFinalAggregationPrompt();
    completionPayload = await sendCompletion(finalPrompt);
  }

  const answerText =
    completionPayload?.data?.data?.content ||
    completionPayload?.data?.answer ||
    completionPayload?.answer ||
    "";

  if (!String(answerText || "").trim()) {
    throw new Error("RAGFLOW returned empty classification content.");
  }

  const parsed = parseClassifierOutput(answerText);
  if (!parsed) {
    throw new Error("RAGFLOW response is not valid JSON.");
  }

  const labelById = extractLabelMapFromParsed(parsed);
  if (Object.keys(labelById).length > 0) {
    return {
      groups: buildCountsFromLabelMap(entries, labelById),
      model: `ragflow-agent:${agentId}`,
      raw: parsed,
      agentReply: String(answerText || "").trim(),
      sessionId,
    };
  }

  const countMap = extractCountsByGroupFromParsed(parsed);
  if (Object.keys(countMap).length > 0) {
    return {
      groups: buildGroupsFromCountMap(entries, countMap),
      model: `ragflow-agent:${agentId}`,
      raw: parsed,
      agentReply: String(answerText || "").trim(),
      sessionId,
    };
  }

  throw new Error("RAGFLOW JSON format is unsupported.");
};

const classifyWithOpenAI = async (entries, openaiApiKey) => {
  const grouped = entries.reduce((acc, entry) => {
    if (!acc[entry.groupId]) acc[entry.groupId] = [];
    acc[entry.groupId].push({ id: entry.id, text: entry.text });
    return acc;
  }, {});

  const payload = sortGroupIds(Object.keys(grouped)).map((groupId) => ({
    groupId,
    entries: grouped[groupId],
  }));

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: DEFAULT_OPENAI_MODEL,
      temperature: 0,
      max_tokens: 12000,
      messages: [
        {
          role: "system",
          content:
            "You are a strict argument classifier. For each entry, choose exactly one label from: support, oppose, evidence. Return JSON only.",
        },
        {
          role: "user",
          content: JSON.stringify(
            {
              task: "Classify each entry and keep the same id/groupId.",
              output_schema: {
                groups: [
                  {
                    groupId: "G1",
                    classifications: [{ id: "G1-1", label: "support" }],
                  },
                ],
              },
              groups: payload,
            },
            null,
            2
          ),
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 120000,
    }
  );

  const content = response?.data?.choices?.[0]?.message?.content || "";
  const parsed = parseClassifierOutput(content);
  if (!parsed) {
    throw new Error("OpenAI response does not contain valid JSON.");
  }

  const labelById = extractLabelMapFromParsed(parsed);
  if (Object.keys(labelById).length === 0) {
    throw new Error("OpenAI response missing classifications.");
  }

  return {
    groups: buildCountsFromLabelMap(entries, labelById),
    model: DEFAULT_OPENAI_MODEL,
    raw: parsed,
  };
};

exports.getArgumentBreakdown = async (req, res) => {
  const classCode = String(req.query?.classCode || req.body?.classCode || "").trim();
  if (classCode !== TARGET_CLASS_CODE) {
    return res.status(400).send({
      message: `Only ${TARGET_CLASS_CODE} is supported by this endpoint.`,
    });
  }

  try {
    const classifier = String(req.body?.classifier || req.query?.classifier || "ragflow_agent").trim();
    const clientEntries = sanitizeClientEntries(req.body?.entries);
    const sourceText = typeof req.body?.sourceText === "string" ? req.body.sourceText : "";
    const normalizedSourceText = sourceText.trim();

    let rawText = "";
    let sourceMtimeMs = null;
    let entries = [];

    if (clientEntries.length > 0) {
      entries = clientEntries;
    }

    if (entries.length === 0 && normalizedSourceText) {
      rawText = normalizedSourceText;
    } else if (entries.length === 0) {
      const loaded = await readSourceTextFromCandidates();
      rawText = loaded.content;
      sourceMtimeMs = loaded.mtimeMs;
    }

    if (classifier === "ragflow_agent" && !normalizedSourceText && !rawText) {
      const loaded = await readSourceTextFromCandidates();
      rawText = loaded.content;
      sourceMtimeMs = loaded.mtimeMs;
    }

    if (entries.length === 0) {
      entries = parseEntriesFromText(rawText);
    }

    if (entries.length === 0) {
      return res.status(400).send({ message: "No entries found in 1142B.txt." });
    }

    const requestedAgentId = String(req.body?.agentId || req.query?.agentId || DEFAULT_RAGFLOW_AGENT_ID).trim();
    const cacheSignature = `${classifier}|${requestedAgentId}`;
    if (
      sourceMtimeMs !== null &&
      cachedAnalysis &&
      cachedMtimeMs === sourceMtimeMs &&
      cachedSignature === cacheSignature
    ) {
      return res.status(200).send(cachedAnalysis);
    }

    let classificationResult = null;

    if (classifier === "ragflow_agent") {
      classificationResult = await callRagflowAgentClassifier(entries, {
        agentId: requestedAgentId,
        sourceText: normalizedSourceText || rawText,
      });
    } else if (classifier === "openai") {
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        return res.status(500).send({
          message: "OPENAI_API_KEY is not configured.",
          detail: "Set OPENAI_API_KEY in backend/.env and restart backend server.",
        });
      }
      classificationResult = await classifyWithOpenAI(entries, openaiApiKey);
    } else {
      throw new Error(`Unsupported classifier: ${classifier}`);
    }

    const result = {
      classCode: TARGET_CLASS_CODE,
      classifier,
      model: classificationResult.model,
      agentId: classifier === "ragflow_agent" ? requestedAgentId : undefined,
      ragflowSessionId: classificationResult.sessionId,
      agentReply: classificationResult.agentReply,
      groups: classificationResult.groups,
      totalEntries: entries.length,
      generatedAt: new Date().toISOString(),
    };

    if (sourceMtimeMs !== null) {
      cachedAnalysis = result;
      cachedMtimeMs = sourceMtimeMs;
      cachedSignature = cacheSignature;
    }

    return res.status(200).send(result);
  } catch (error) {
    const status = error?.response?.status || 500;
    const detail =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.message;

    return res.status(status).send({
      message: "Failed to generate argument breakdown for 1142B.",
      detail,
    });
  }
};
