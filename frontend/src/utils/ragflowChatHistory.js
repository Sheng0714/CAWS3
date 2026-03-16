const RAGFLOW_CHAT_HISTORY_KEY = "ragflow_chat_history_v1";
const KF_SUMMARY_TRIGGER_TEXT = "\u5df2\u7d93\u8db3\u5920";
const WRITING_OUTLINE_TRIGGER_TEXT = "\u81ea\u52d5\u532f\u5165";

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

const getRagflowCurrentUserToken = () => {
  const userId = sessionStorage.getItem("userId") || localStorage.getItem("userId");
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

export const upsertRagflowChatSession = (sessionInput) => {
  if (!sessionInput?.sessionId) return;

  const sessions = getAllRagflowChatSessions();
  const now = Date.now();
  const nextSession = {
    sessionId: sessionInput.sessionId,
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
      updatedAt: nextSession.updatedAt || now,
    };
  } else {
    sessions.push(nextSession);
  }

  localStorage.setItem(RAGFLOW_CHAT_HISTORY_KEY, JSON.stringify(sessions));
};

export const buildRagflowHistoryTitle = (session) => {
  if (!session || !Array.isArray(session.messages)) {
    return "New Chat";
  }

  for (let i = session.messages.length - 1; i >= 0; i -= 1) {
    const message = session.messages[i];
    if (message?.role === "user" && typeof message?.content === "string" && message.content.trim()) {
      return message.content.trim();
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

export const syncKfSummaryFromAssistantReply = (chatbotEntryMode, assistantReply) => {
  if (chatbotEntryMode !== "kf_analysis") return false;
  if (typeof assistantReply !== "string") return false;

  const normalizedReply = assistantReply.trim();
  if (!normalizedReply.includes(KF_SUMMARY_TRIGGER_TEXT)) return false;

  // Keep only the latest imported summary for Writing Area.
  localStorage.removeItem("kfAnalysisData");
  localStorage.setItem("kfAnalysisData", normalizedReply);
  return true;
};

export const syncWritingOutlineFromAssistantReply = (chatbotEntryMode, assistantReply) => {
  if (chatbotEntryMode !== "writing_assistant") return false;
  if (typeof assistantReply !== "string") return false;

  const normalizedReply = assistantReply.trim();
  if (!normalizedReply.includes(WRITING_OUTLINE_TRIGGER_TEXT)) return false;

  // Keep only the latest imported outline for Writing Area.
  localStorage.removeItem("outlineData");
  localStorage.setItem("outlineData", normalizedReply);
  return true;
};
