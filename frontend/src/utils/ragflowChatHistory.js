import axios from "axios";
import { saveChatHistoryToNotion } from '../services/chatHistoryService';

const RAGFLOW_CHAT_HISTORY_KEY = "ragflow_chat_history_v1";
const WRITING_OUTLINE_TRIGGER_TEXT = "\u81ea\u52d5\u532f\u5165";
export const RAGFLOW_TOOLKIT_STORAGE_EVENT = "ragflow-toolkit-storage-updated";
export const notionApiBases = [
  process.env.REACT_APP_NOTION_API_BASE_URL,
  "/notion-api",
  "/api/notion",
  "http://localhost:4000",
  "http://140.115.126.27:4000",
].filter(Boolean);
const TOOLKIT_SYNC_FIELDS = ["kfSummaryContent", "outlineContent", "notesContent"];

const notifyToolkitStorageUpdated = (key, value) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(RAGFLOW_TOOLKIT_STORAGE_EVENT, {
      detail: {
        key,
        value,
      },
    })
  );
};

const safeParse = (rawValue) => {
  if (!rawValue) return [];
  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeScope = (scopeInput = {}) => ({
  activityId: scopeInput?.activityId ? String(scopeInput.activityId) : "",
  groupId: scopeInput?.groupId ? String(scopeInput.groupId) : "",
  className: typeof scopeInput?.className === "string" ? scopeInput.className.trim() : "",
  topicName: typeof scopeInput?.topicName === "string" ? scopeInput.topicName.trim() : "",
});

const normalizeToolkitScope = (scopeInput = {}) => ({
  studentName:
    typeof scopeInput?.studentName === "string" ? scopeInput.studentName.trim() : "",
  className:
    typeof scopeInput?.className === "string" ? scopeInput.className.trim() : "",
  topicName:
    typeof scopeInput?.topicName === "string" ? scopeInput.topicName.trim() : "",
});

const getRagflowCurrentUserToken = () => {
  const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
  if (userId) return `uid_${String(userId)}`;

  const email = sessionStorage.getItem("email") || localStorage.getItem("email");
  if (typeof email === "string" && email.trim()) {
    return `email_${email.trim().toLowerCase()}`;
  }

  const name = sessionStorage.getItem("name") || localStorage.getItem("name");
  if (typeof name === "string" && name.trim()) {
    return `name_${name.trim().toLowerCase()}`;
  }

  return "anonymous";
};

const isSameScope = (sessionScopeInput, targetScopeInput) => {
  const sessionScope = normalizeScope(sessionScopeInput);
  const targetScope = normalizeScope(targetScopeInput);

  const targetHasIds = Boolean(targetScope.activityId || targetScope.groupId);
  if (targetHasIds) {
    return (
      sessionScope.activityId === targetScope.activityId &&
      sessionScope.groupId === targetScope.groupId
    );
  }

  const targetHasNames = Boolean(targetScope.className || targetScope.topicName);
  if (targetHasNames) {
    return (
      sessionScope.className === targetScope.className &&
      sessionScope.topicName === targetScope.topicName
    );
  }

  return true;
};

export const buildRagflowScopeFromStorage = () => {
  const activityId = sessionStorage.getItem("activityId") || localStorage.getItem("activityId") || "";
  const groupId = sessionStorage.getItem("groupId") || localStorage.getItem("groupId") || "";
  const className = localStorage.getItem("activityTitle") || "";
  const topicName = localStorage.getItem("groupName") || "";

  return normalizeScope({ activityId, groupId, className, topicName });
};

export const buildToolkitScopeFromStorage = () => {
  if (typeof window === "undefined") {
    return normalizeToolkitScope({});
  }

  const studentName =
    localStorage.getItem("name") ||
    localStorage.getItem("username") ||
    localStorage.getItem("userName") ||
    localStorage.getItem("selectedStudentName") ||
    "";
  const className =
    localStorage.getItem("activityTitle") ||
    localStorage.getItem("selectedClassName") ||
    "";
  const topicName =
    localStorage.getItem("groupName") ||
    localStorage.getItem("selectedTopicName") ||
    localStorage.getItem("theme") ||
    "";

  return normalizeToolkitScope({ studentName, className, topicName });
};

export const buildToolkitStorageKey = (baseKey, scopeInput = {}) => {
  const normalizedBaseKey = typeof baseKey === "string" ? baseKey.trim() : "";
  if (!normalizedBaseKey) return "";

  const scope = normalizeToolkitScope(scopeInput);
  return `${normalizedBaseKey}::${encodeURIComponent(scope.studentName || "")}::${encodeURIComponent(
    scope.className || ""
  )}::${encodeURIComponent(scope.topicName || "")}`;
};

export const readToolkitContentByScope = (baseKey, scopeInput) => {
  if (typeof window === "undefined") return "";

  const normalizedBaseKey = typeof baseKey === "string" ? baseKey.trim() : "";
  if (!normalizedBaseKey) return "";

  const resolvedScope = normalizeToolkitScope(scopeInput || buildToolkitScopeFromStorage());
  const scopedKey = buildToolkitStorageKey(normalizedBaseKey, resolvedScope);
  const scopedValue = localStorage.getItem(scopedKey);
  if (scopedValue !== null) return scopedValue;

  const hasExplicitScope = Boolean(
    resolvedScope.studentName || resolvedScope.className || resolvedScope.topicName
  );
  if (hasExplicitScope) return "";

  return localStorage.getItem(normalizedBaseKey) || "";
};

export const writeToolkitContentByScope = (baseKey, value, scopeInput) => {
  if (typeof window === "undefined") return "";

  const normalizedBaseKey = typeof baseKey === "string" ? baseKey.trim() : "";
  if (!normalizedBaseKey) return "";

  const normalizedValue = typeof value === "string" ? value : "";
  const resolvedScope = scopeInput || buildToolkitScopeFromStorage();
  const scopedKey = buildToolkitStorageKey(normalizedBaseKey, resolvedScope);

  localStorage.setItem(scopedKey, normalizedValue);
  localStorage.setItem(normalizedBaseKey, normalizedValue);

  notifyToolkitStorageUpdated(scopedKey, normalizedValue);
  notifyToolkitStorageUpdated(normalizedBaseKey, normalizedValue);

  return scopedKey;
};

export const readPendingToolkitSnapshot = (scopeInput) => {
  const scope = normalizeToolkitScope(scopeInput);
  try {
    const value = JSON.parse(localStorage.getItem(buildToolkitStorageKey("toolkitPendingSync", scope)));
    const content = Object.fromEntries(
      TOOLKIT_SYNC_FIELDS.filter((field) => typeof value?.[field] === "string")
        .map((field) => [field, value[field]])
    );
    return Object.keys(content).length ? { scopeInput: scope, ...content } : null;
  } catch {
    return null;
  }
};

export const savePendingToolkitSnapshot = (payload) => {
  const scope = normalizeToolkitScope(payload.scopeInput);
  if (!scope.studentName || !scope.className || !scope.topicName) {
    throw new Error("A student, class and topic are required to save the toolkit content.");
  }
  const content = Object.fromEntries(
    TOOLKIT_SYNC_FIELDS.filter((field) => typeof payload[field] === "string")
      .map((field) => [field, payload[field]])
  );
  const pending = { ...readPendingToolkitSnapshot(scope), ...content, scopeInput: scope };
  const key = buildToolkitStorageKey("toolkitPendingSync", scope);
  localStorage.setItem(key, JSON.stringify(pending));
  notifyToolkitStorageUpdated(key, JSON.stringify(pending));
  return pending;
};

export const clearSavedToolkitSnapshot = (payload) => {
  const pending = readPendingToolkitSnapshot(payload.scopeInput);
  if (!pending) return;
  for (const field of TOOLKIT_SYNC_FIELDS) {
    if (typeof payload[field] === "string" && pending[field] === payload[field]) {
      delete pending[field];
    }
  }
  const key = buildToolkitStorageKey("toolkitPendingSync", payload.scopeInput);
  if (TOOLKIT_SYNC_FIELDS.some((field) => typeof pending[field] === "string")) {
    localStorage.setItem(key, JSON.stringify(pending));
  } else {
    localStorage.removeItem(key);
  }
  notifyToolkitStorageUpdated(key, localStorage.getItem(key) || "");
};

export const buildRagflowScopeUserId = (scopeInput) => {
  const scope = normalizeScope(scopeInput);
  const userToken = encodeURIComponent(getRagflowCurrentUserToken());
  const activityToken =
    scope.activityId || (scope.className ? encodeURIComponent(scope.className) : "activity");
  const groupToken =
    scope.groupId || (scope.topicName ? encodeURIComponent(scope.topicName) : "group");
  return `caws_user_${userToken}__scope_${activityToken}__${groupToken}`;
};

export const getAllRagflowChatSessions = () => {
  const raw = localStorage.getItem(RAGFLOW_CHAT_HISTORY_KEY);
  const sessions = safeParse(raw);
  return sessions.sort((a, b) => (b?.updatedAt || 0) - (a?.updatedAt || 0));
};

export const getRagflowChatSessionsByMode = (chatbotEntryMode) => {
  return getAllRagflowChatSessions().filter(
    (session) => session?.chatbotEntryMode === chatbotEntryMode
  );
};

export const getRagflowChatSessionsByModeAndScope = (chatbotEntryMode, scopeInput) => {
  return getAllRagflowChatSessions().filter(
    (session) =>
      session?.chatbotEntryMode === chatbotEntryMode && isSameScope(session?.scope, scopeInput)
  );
};

export const getScopedRagflowChatHistoryPayload = (
  scopeInput,
  { maxSessions = 10, maxMessagesPerSession = 30 } = {}
) => {
  const targetScope = normalizeScope(scopeInput || {});
  const sessionLimit = Number.isFinite(maxSessions) ? Math.max(1, maxSessions) : 10;
  const messageLimit = Number.isFinite(maxMessagesPerSession)
    ? Math.max(1, maxMessagesPerSession)
    : 30;

  return getAllRagflowChatSessions()
    .filter((session) => isSameScope(session?.scope, targetScope))
    .slice(0, sessionLimit)
    .map((session) => {
      const normalizedMessages = Array.isArray(session?.messages) ? session.messages : [];
      return {
        sessionId: session?.sessionId || "",
        messages: normalizedMessages.slice(-messageLimit).map((message) => ({
          role: message?.role === "assistant" ? "assistant" : "user",
          content: typeof message?.content === "string" ? message.content : "",
          created_at:
            Number.isFinite(Number(message?.createdAt)) && Number(message?.createdAt) > 0
              ? new Date(Number(message.createdAt)).toISOString()
              : "",
        })),
      };
    });
};

export const upsertRagflowChatSession = (sessionInput) => {
  if (!sessionInput?.sessionId) return;

  const sessions = getAllRagflowChatSessions();
  const now = Date.now();
  const nextSession = {
    sessionId: sessionInput.sessionId,
    ...(typeof sessionInput.name === 'string' ? { name: sessionInput.name } : {}),
    userToken: getRagflowCurrentUserToken(),
    chatbotEntryMode: sessionInput.chatbotEntryMode || "unknown",
    modeTitle: sessionInput.modeTitle || "",
    sourceType: sessionInput.sourceType || "",
    targetId: sessionInput.targetId || "",
    scope: normalizeScope(sessionInput.scope),
    createdAt: sessionInput.createdAt || now,
    updatedAt: sessionInput.updatedAt || now,
    messages: Array.isArray(sessionInput.messages) ? sessionInput.messages : [],
  };

  const targetIndex = sessions.findIndex((session) => session?.sessionId === nextSession.sessionId);
  if (targetIndex >= 0) {
    const existing = sessions[targetIndex];
    const keepExistingMessages = existing.userToken === nextSession.userToken &&
      Array.isArray(existing.messages) && existing.messages.length > nextSession.messages.length;
    sessions[targetIndex] = {
      ...existing,
      ...nextSession,
      scope:
        nextSession.scope.activityId ||
        nextSession.scope.groupId ||
        nextSession.scope.className ||
        nextSession.scope.topicName
          ? nextSession.scope
          : normalizeScope(existing?.scope),
      createdAt: existing?.createdAt || nextSession.createdAt,
      messages: keepExistingMessages ? existing.messages : nextSession.messages,
      updatedAt: keepExistingMessages ? existing.updatedAt : nextSession.updatedAt || now,
    };
  } else {
    sessions.push(nextSession);
  }

  localStorage.setItem(RAGFLOW_CHAT_HISTORY_KEY, JSON.stringify(sessions));
  return targetIndex >= 0 ? sessions[targetIndex] : nextSession;
};

export const syncRagflowChatHistoryToNotion = async (scopeInput) => {
  const scope = normalizeScope(scopeInput);
  if (!(scope.activityId && scope.groupId) && !(scope.className && scope.topicName)) {
    throw new Error('A class and topic are required to save chat history.');
  }
  const userToken = getRagflowCurrentUserToken();
  const sessions = getAllRagflowChatSessions()
    .filter((session) => session.userToken === userToken && isSameScope(session.scope, scope))
    .filter((session) => Array.isArray(session.messages) && session.messages.length > 0)
    .map((session) => ({
      sessionId: session.sessionId,
      ...(typeof session.name === 'string' ? { name: session.name } : {}),
      sourceType: session.sourceType,
      targetId: session.targetId,
      createdAt: session.createdAt,
      chatbotEntryMode: session.chatbotEntryMode,
      modeTitle: session.modeTitle,
      updatedAt: session.updatedAt,
      messages: session.messages.map((message) => ({
        ...(message.id ? { id: String(message.id) } : {}),
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: typeof message.content === 'string' ? message.content : '',
        created_at: Number.isFinite(Number(message.createdAt)) && Number(message.createdAt) > 0
          ? new Date(Number(message.createdAt)).toISOString() : '',
      })),
    }));
  if (!sessions.length) return null;
  return saveChatHistoryToNotion({ scope, sessions });
};

export const buildRagflowHistoryTitle = (session) => {
  if (!session || !Array.isArray(session.messages)) {
    return "New Chat";
  }

  const extractFirstTwoWords = (content) => {
    if (typeof content !== "string") return "";
    const normalized = content
      .replace(/^[\s\d\-*.,:;()[\]{}"'`~!?]+/, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!normalized) return "";

    const words = normalized.split(" ").filter(Boolean);
    if (words.length === 0) return "";
    if (words.length === 1) return words[0];
    return `${words[0]} ${words[1]}`;
  };

  for (let i = session.messages.length - 1; i >= 0; i -= 1) {
    const message = session.messages[i];
    if (message?.role === "user" && typeof message?.content === "string" && message.content.trim()) {
      const title = extractFirstTwoWords(message.content);
      if (title) return title;
    }
  }

  for (let i = session.messages.length - 1; i >= 0; i -= 1) {
    const message = session.messages[i];
    if (message?.role === "assistant" && typeof message?.content === "string" && message.content.trim()) {
      const title = extractFirstTwoWords(message.content);
      if (title) return title;
    }
  }

  return "New Chat";
};

export const formatRagflowDate = (value) => {
  const timestamp = typeof value === "number" ? value : Date.parse(value || "");
  if (!Number.isFinite(timestamp)) return "-";
  return new Date(timestamp).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const syncKfSummaryFromAssistantReply = (chatbotEntryMode, assistantReply, scopeInput) => {
  if (chatbotEntryMode !== "kf_analysis") return false;
  if (typeof assistantReply !== "string") return false;

  const normalizedReply = assistantReply.trim();
  // RAGFLOW can change the closing sentence or respond entirely in English.
  // A completed summary has arguments on both sides and supporting evidence.
  const plainReply = normalizedReply.replace(/\r/g, "").replace(/[*_#`]/g, "");
  const sectionNames = [
    "(?:supporting|supportive|pro)\\s+arguments?|贊成論點|支持論點",
    "(?:opposing|opposition|con)\\s+arguments?|反對論點",
    "evidence|證據",
  ];
  const sections = sectionNames.map((name) => plainReply.match(new RegExp(
    `(?:^|\\n)[ \\t]*(?:[-•]|\\d+[.)])?[ \\t]*(?:${name})(?:[ \\t]*[（(][^\\n）)]*[）)])?[ \\t]*(?:[:：]|(?=\\n|$))`,
    "im"
  )));
  const hasSummarySections = sections.every((section) => {
    if (!section) return false;
    const start = section.index + section[0].length;
    const nextSection = sections.filter((other) => other && other.index >= start)
      .sort((left, right) => left.index - right.index)[0];
    return plainReply.slice(start, nextSection?.index ?? plainReply.length)
      .replace(/[\s\d.():：\-•]/g, "").length > 0;
  });
  const hasCompletionNotice = /已經足夠|討論(?:已)?足夠|(?:KF\s*討論)?摘要已(?:自動)?匯入|(?:discussion|information)\s+is\s+(?:now\s+)?(?:sufficient|enough)/i.test(normalizedReply);
  if (!hasSummarySections && !hasCompletionNotice) return false;

  writeToolkitContentByScope("kfAnalysisData", normalizedReply, scopeInput);
  return true;
};

export const syncWritingOutlineFromAssistantReply = (
  chatbotEntryMode,
  assistantReply,
  scopeInput
) => {
  if (chatbotEntryMode !== "writing_assistant") return false;
  if (typeof assistantReply !== "string") return false;

  const normalizedReply = assistantReply.trim();
  if (!normalizedReply.includes(WRITING_OUTLINE_TRIGGER_TEXT)) return false;

  writeToolkitContentByScope("outlineData", normalizedReply, scopeInput);
  return true;
};

export const syncToolkitSnapshotToNotion = async ({
  scopeInput,
  kfSummaryContent,
  outlineContent,
  notesContent,
} = {}) => {
  if (typeof window === "undefined") return false;

  const scope = normalizeToolkitScope(scopeInput || buildToolkitScopeFromStorage());
  if (!scope.studentName || !scope.className || !scope.topicName) {
    throw new Error("A student, class and topic are required to save the toolkit content.");
  }

  // Only patch the fields supplied by the caller. Browser caches may be empty
  // or stale, especially when opening a chat before the sidebar has loaded.
  const content = {
    ...(typeof kfSummaryContent === "string" ? { kfAnalysisContent: kfSummaryContent } : {}),
    ...(typeof outlineContent === "string" ? { outlineContent } : {}),
    ...(typeof notesContent === "string" ? { noteContent: notesContent } : {}),
  };
  if (!Object.keys(content).length) return false;

  const token = localStorage.getItem("jwtToken");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let lastError = null;

  for (const base of notionApiBases) {
    const normalizedBase = base.replace(/\/+$/, "");
    const requestUrl = `${normalizedBase}/api/update-note`;

    try {
      const response = await axios.patch(
        requestUrl,
        {
          studentName: scope.studentName,
          className: scope.className,
          theme: scope.topicName,
          ...content,
        },
        {
          timeout: 15000,
          headers,
        }
      );
      if (response?.data?.success !== true) {
        throw new Error("Notion did not confirm saving the toolkit content.");
      }
      clearSavedToolkitSnapshot({ scopeInput: scope, kfSummaryContent, outlineContent, notesContent });
      return true;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Sync toolkit snapshot to Notion failed");
};
