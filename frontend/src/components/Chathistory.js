import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar_Student";
import StudentLeftSidebar from "./StudentLeftSidebar";
import RagflowMarkdown from "./RagflowMarkdown";
import config from "../config.json";
import url from "../url.json";
import cawsOwl from "../assets/去背.png";
import sendIcon from "../assets/發送.png";
import backIcon from "../assets/back.png";
import {
  buildRagflowHistoryTitle,
  buildRagflowScopeFromStorage,
  buildRagflowScopeUserId,
  formatRagflowDate,
  syncKfSummaryFromAssistantReply,
  syncWritingOutlineFromAssistantReply,
} from "../utils/ragflowChatHistory";

const RAGFLOW_API_KEY = "ragflow-E5MjJlMmFlMWMxMTExZjFiZjJkYTYxNz";
const RAGFLOW_API_SERVER = "https://wu-ragflow.zeabur.app";
const RAGFLOW_CHAT_ID = "daa6b1a01c0e11f195efa61716fb138a";
const WRITING_ASSISTANT_AGENT_ID = "857a20ee1c1911f18f96a61716fb138a";
const WRITING_ANALYSIS_AGENT_ID = "8d9b9b861c1911f1a4fea61716fb138a";

const CHATBOT_MODE_CONFIG = {
  kf_analysis: {
    title: "KF Analysis",
    description: "This mode organizes the arguments and evidence from your KF discussion.",
    sourceType: "chat",
    targetId: RAGFLOW_CHAT_ID,
  },
  writing_assistant: {
    title: "Writing Assistant",
    description: "This mode helps you build a writing outline from your KF discussion.",
    sourceType: "agent",
    targetId: WRITING_ASSISTANT_AGENT_ID,
  },
  writing_analysis: {
    title: "Writing Analysis",
    description: "This mode provides feedback and suggestions to improve your writing.",
    sourceType: "agent",
    targetId: WRITING_ANALYSIS_AGENT_ID,
  },
};

const normalizeTimestamp = (...values) => {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric < 1e12 ? numeric * 1000 : numeric;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Date.parse(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return Date.now();
};

const normalizeMessageContent = (message) => {
  if (typeof message?.content === "string") {
    return message.content;
  }

  if (typeof message?.answer === "string") {
    return message.answer;
  }

  if (typeof message?.data?.content === "string") {
    return message.data.content;
  }

  return "";
};

const normalizeRagflowSession = (rawSession, defaults) => {
  const sessionId = rawSession?.id || rawSession?.session_id || "";
  const createdAt = normalizeTimestamp(rawSession?.create_time, rawSession?.create_date);
  const updatedAt = normalizeTimestamp(
    rawSession?.update_time,
    rawSession?.update_date,
    rawSession?.modify_time,
    rawSession?.modify_date,
    createdAt
  );

  const sourceMessages = Array.isArray(rawSession?.messages)
    ? rawSession.messages
    : Array.isArray(rawSession?.message)
      ? rawSession.message
      : [];

  const messages = sourceMessages
    .map((message, index) => ({
      id:
        message?.id ||
        message?.message_id ||
        `${sessionId || "session"}-msg-${index}-${normalizeTimestamp(message?.create_time)}`,
      role: message?.role === "user" ? "user" : "assistant",
      content: normalizeMessageContent(message),
      createdAt: normalizeTimestamp(message?.create_time, message?.create_date, updatedAt),
    }))
    .filter((message) => message.content.trim());

  return {
    sessionId,
    chatbotEntryMode: defaults.chatbotEntryMode,
    modeTitle: defaults.modeTitle,
    sourceType: defaults.sourceType,
    targetId: defaults.targetId,
    createdAt,
    updatedAt,
    name: typeof rawSession?.name === "string" ? rawSession.name : "",
    messages,
  };
};

export default function Studentfuntion() {
  const navigate = useNavigate();
  const location = useLocation();
  const [className, setClassName] = useState(localStorage.getItem("activityTitle") || "");
  const [topicName, setTopicName] = useState(localStorage.getItem("groupName") || "");
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [historyInput, setHistoryInput] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [historyLoadError, setHistoryLoadError] = useState("");
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isHistorySending, setIsHistorySending] = useState(false);
  const historyBottomRef = useRef(null);

  const chatbotEntryMode =
    location.state?.chatbotEntryMode || sessionStorage.getItem("chatbotEntryMode") || "unknown";
  const activeModeConfig = CHATBOT_MODE_CONFIG[chatbotEntryMode];
  const isSupportedEntry = Boolean(activeModeConfig);

  const historyScope = useMemo(() => {
    const baseScope = buildRagflowScopeFromStorage();
    return {
      ...baseScope,
      className: className || baseScope.className,
      topicName: topicName || baseScope.topicName,
    };
  }, [className, topicName]);

  const scopeUserId = useMemo(() => buildRagflowScopeUserId(historyScope), [historyScope]);

  const buildSessionsUrl = useCallback(() => {
    if (!activeModeConfig) {
      return "";
    }

    const searchParams = new URLSearchParams({
      page: "1",
      page_size: "100",
      orderby: "update_time",
      desc: "true",
      user_id: scopeUserId,
    });

    if (activeModeConfig.sourceType === "agent") {
      searchParams.set("dsl", "false");
      return `${RAGFLOW_API_SERVER}/api/v1/agents/${activeModeConfig.targetId}/sessions?${searchParams.toString()}`;
    }

    return `${RAGFLOW_API_SERVER}/api/v1/chats/${activeModeConfig.targetId}/sessions?${searchParams.toString()}`;
  }, [activeModeConfig, scopeUserId]);

  const buildCompletionUrl = (session) => {
    const sourceType = session?.sourceType || activeModeConfig?.sourceType;
    const targetId = session?.targetId || activeModeConfig?.targetId;

    if (!sourceType || !targetId) {
      throw new Error("Session source type or target id is missing.");
    }

    const resource = sourceType === "agent" ? "agents" : "chats";
    return `${RAGFLOW_API_SERVER}/api/v1/${resource}/${targetId}/completions`;
  };

  const parseCompletionAnswer = (payload, sourceType) => {
    if (sourceType === "agent") {
      return payload?.data?.data?.content || payload?.data?.answer || payload?.answer || "";
    }
    return payload?.data?.answer || payload?.answer || "";
  };

  const fetchHistorySessionsFromApi = useCallback(async () => {
    if (!isSupportedEntry || !activeModeConfig) {
      return [];
    }

    const response = await fetch(buildSessionsUrl(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${RAGFLOW_API_KEY}`,
      },
    });

    const payload = await response.json();
    if (!response.ok || payload?.code !== 0) {
      throw new Error(payload?.message || `HTTP ${response.status}`);
    }

    const list = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.data?.records)
        ? payload.data.records
        : Array.isArray(payload?.data?.sessions)
          ? payload.data.sessions
          : [];

    return list
      .map((session) =>
        normalizeRagflowSession(session, {
          chatbotEntryMode,
          modeTitle: activeModeConfig.title,
          sourceType: activeModeConfig.sourceType,
          targetId: activeModeConfig.targetId,
        })
      )
      .filter((session) => session.sessionId)
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }, [activeModeConfig, buildSessionsUrl, chatbotEntryMode, isSupportedEntry]);

  const loadHistory = useCallback(
    async ({ focusSessionId, fallbackSession } = {}) => {
      if (!isSupportedEntry) {
        setSessions([]);
        setSelectedSession(null);
        return [];
      }

      setIsHistoryLoading(true);
      setHistoryLoadError("");

      try {
        const nextSessions = await fetchHistorySessionsFromApi();
        setSessions(nextSessions);

        if (focusSessionId) {
          const focused = nextSessions.find((session) => session.sessionId === focusSessionId);
          setSelectedSession(focused || fallbackSession || null);
        }

        return nextSessions;
      } catch (error) {
        console.error("Failed to load RAGFLOW history:", error);
        setHistoryLoadError(`RAGFLOW history load failed: ${error?.message || "unknown error"}`);
        if (focusSessionId) {
          setSelectedSession(fallbackSession || null);
        }
        return [];
      } finally {
        setIsHistoryLoading(false);
      }
    },
    [fetchHistorySessionsFromApi, isSupportedEntry]
  );

  useEffect(() => {
    const activityId = sessionStorage.getItem("activityId") || localStorage.getItem("activityId");
    const groupIdRaw = sessionStorage.getItem("groupId") || localStorage.getItem("groupId");

    if (!activityId) return;

    const fetchClassAndTopic = async () => {
      try {
        const response = await axios.get(`${url.backendHost + config[6].enterActivity}/${activityId}`);

        const activityData = response.data;
        const resolvedClassName = activityData?.title || "";

        let resolvedTopicName = "";
        if (groupIdRaw) {
          const groupIdNum = Number(groupIdRaw);
          const group = activityData?.Groups?.find(
            (item) => item.id === groupIdNum || item.groupId === groupIdNum
          );
          resolvedTopicName = group?.groupName || "";
        }

        setClassName(resolvedClassName);
        setTopicName(resolvedTopicName);

        if (resolvedClassName) {
          localStorage.setItem("activityTitle", resolvedClassName);
        }
        if (resolvedTopicName) {
          localStorage.setItem("groupName", resolvedTopicName);
        }
      } catch (error) {
        console.error("Failed to fetch class/topic:", error);
      }
    };

    fetchClassAndTopic();
  }, []);

  useEffect(() => {
    setSelectedSession(null);
    setHistoryInput("");
    setHistoryError("");
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (historyBottomRef.current) {
      historyBottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [selectedSession, isHistorySending]);

  const sendHistoryMessage = async () => {
    const question = historyInput.trim();
    if (!selectedSession || !question || isHistorySending) {
      return;
    }

    const now = Date.now();
    const userMessage = {
      id: `history-user-${now}`,
      role: "user",
      content: question,
      createdAt: now,
    };

    const optimisticSession = {
      ...selectedSession,
      chatbotEntryMode: selectedSession.chatbotEntryMode || chatbotEntryMode,
      sourceType: selectedSession.sourceType || activeModeConfig?.sourceType,
      targetId: selectedSession.targetId || activeModeConfig?.targetId,
      messages: [...(selectedSession.messages || []), userMessage],
      updatedAt: now,
    };

    setSelectedSession(optimisticSession);
    setHistoryInput("");
    setHistoryError("");
    setIsHistorySending(true);

    try {
      const response = await fetch(buildCompletionUrl(optimisticSession), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RAGFLOW_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          session_id: optimisticSession.sessionId,
          stream: false,
        }),
      });

      const payload = await response.json();
      if (!response.ok || payload?.code !== 0) {
        throw new Error(payload?.message || `HTTP ${response.status}`);
      }

      const answer = parseCompletionAnswer(payload, optimisticSession.sourceType);
      const toolkitScope = {
        studentName:
          localStorage.getItem("name") ||
          localStorage.getItem("username") ||
          localStorage.getItem("userName") ||
          "",
        className: historyScope.className || className || "",
        topicName: historyScope.topicName || topicName || "",
      };
      syncKfSummaryFromAssistantReply(chatbotEntryMode, answer, toolkitScope);
      syncWritingOutlineFromAssistantReply(chatbotEntryMode, answer, toolkitScope);
      const assistantMessage = {
        id: payload?.data?.id || payload?.data?.message_id || `history-assistant-${Date.now()}`,
        role: "assistant",
        content: answer,
        createdAt: Date.now(),
      };

      const completedSession = {
        ...optimisticSession,
        messages: [...optimisticSession.messages, assistantMessage],
        updatedAt: Date.now(),
      };

      setSelectedSession(completedSession);
      await loadHistory({
        focusSessionId: completedSession.sessionId,
        fallbackSession: completedSession,
      });
    } catch (error) {
      console.error("Failed to continue chat from history:", error);
      setHistoryError(`RAGFLOW reply failed: ${error?.message || "unknown error"}`);
    } finally {
      setIsHistorySending(false);
    }
  };

  const historyCards = useMemo(() => {
    return sessions.map((session) => ({
      ...session,
      displayTitle: buildRagflowHistoryTitle(session),
      displayDate: formatRagflowDate(session.createdAt),
    }));
  }, [sessions]);

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <StudentLeftSidebar activeMenuKey="chatbot" />
        <div style={{ flex: 1, minWidth: 0 }}>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 20px 56px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "32px",
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
          >
            <img src={backIcon} alt="Back" width={35} height={35} />
          </button>

          <img
            src={cawsOwl}
            alt="CAWS owl"
            style={{
              width: "130px",
              height: "130px",
              objectFit: "contain",
            }}
          />

          <div
            style={{
              background: "rgba(105, 83, 83, 0.1)",
              border: "1.5px solid #000000",
              borderRadius: "16px",
              padding: "16px 20px",
              maxWidth: "560px",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              color: "#1e293b",
              fontSize: "22px",
              lineHeight: 1.45,
              textAlign: "left",
            }}
          >
            <p style={{ margin: 0 }}>
              {activeModeConfig?.description ||
                "Please go back and enter from KF Analysis, Writing Assistant, or Writing Analysis."}
            </p>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #dbe3ef",
            borderRadius: "20px",
            minHeight: "420px",
            padding: "28px 24px",
            boxShadow: "0 10px 25px rgba(30, 41, 59, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              班級：{className || "---"}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              主題：{topicName || "---"}
            </p>
          </div>

          <div
            style={{
              marginTop: "16px",
              borderBottom: "1.5px solid #d1d5db",
              width: "100%",
            }}
          />

          <p
            style={{
              marginTop: "16px",
              marginBottom: "12px",
              fontSize: "22px",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Your Chat History ({activeModeConfig?.title || "Unknown Mode"}):
          </p>

          {!isSupportedEntry && (
            <p style={{ marginTop: 0, color: "#b91c1c", fontSize: "16px" }}>
              Unsupported chatbot mode. Please go back and enter from KF Analysis, Writing Assistant,
              or Writing Analysis.
            </p>
          )}

          {isSupportedEntry && isHistoryLoading && (
            <p style={{ marginTop: 0, color: "#334155", fontSize: "16px" }}>
              Loading RAGFLOW history...
            </p>
          )}

          {isSupportedEntry && historyLoadError && (
            <p style={{ marginTop: 0, color: "#b91c1c", fontSize: "16px" }}>{historyLoadError}</p>
          )}

          {isSupportedEntry && !isHistoryLoading && historyCards.length === 0 && !historyLoadError && (
            <p style={{ marginTop: 0, color: "#475569", fontSize: "16px" }}>No chat history yet.</p>
          )}

          {isSupportedEntry && historyCards.length > 0 && (
            <div
              style={{
                marginTop: "8px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "12px",
              }}
            >
              {historyCards.map((session) => (
                <button
                  key={session.sessionId}
                  type="button"
                  onClick={() => {
                    setSelectedSession(session);
                    setHistoryInput("");
                    setHistoryError("");
                  }}
                  style={{
                    textAlign: "left",
                    border: "1px solid #d1d5db",
                    borderRadius: "12px",
                    background: "#f8fafc",
                    padding: "12px 14px",
                    cursor: "pointer",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontSize: "16px",
                      lineHeight: 1.4,
                      color: "#0f172a",
                      fontWeight: 700,
                      wordBreak: "break-word",
                    }}
                  >
                    {session.displayTitle}
                  </p>
                  <p style={{ margin: 0, fontSize: "14px", color: "#475569" }}>
                    創建日期：{session.displayDate}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
        </div>
      </div>

      {selectedSession && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            zIndex: 1200,
          }}
        >
          <div
            style={{
              width: "min(880px, 100%)",
              maxHeight: "90vh",
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #d1d5db",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                  {buildRagflowHistoryTitle(selectedSession)}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#475569" }}>
                  創建日期：{formatRagflowDate(selectedSession.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedSession(null);
                  setHistoryInput("");
                  setHistoryError("");
                }}
                style={{
                  width: "100px",
                  height: "38px",
                  background: "rgba(204, 149, 101, 0.3)",
                  border: "1.5px solid #000000",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#111111",
                  cursor: "pointer",
                }}
              >
                CLOSE
              </button>
            </div>

            <div
              style={{
                flex: 1,
                padding: "16px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                background: "#f8fafc",
              }}
            >
              {(selectedSession.messages || []).map((message, index) => (
                <div
                  key={message.id || `${message.role}-${message.createdAt || index}`}
                  style={{
                    display: "flex",
                    justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      border: "1px solid #d1d5db",
                      borderRadius: "10px",
                      background: message.role === "user" ? "#dbeafe" : "#ffffff",
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        lineHeight: 1.5,
                        color: "#0f172a",
                        wordBreak: "break-word",
                      }}
                    >
                      <RagflowMarkdown content={message.content || ""} />
                    </div>
                  </div>
                </div>
              ))}
              {isHistorySending && (
                <p style={{ margin: 0, color: "#475569", fontSize: "14px" }}>I am thinking...</p>
              )}
              <div ref={historyBottomRef} />
            </div>

            <div
              style={{
                borderTop: "1px solid #d1d5db",
                padding: "12px",
                background: "#ffffff",
              }}
            >
              {historyError && (
                <p style={{ margin: "0 0 8px", color: "#b91c1c", fontSize: "14px" }}>{historyError}</p>
              )}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <textarea
                  value={historyInput}
                  onChange={(event) => setHistoryInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendHistoryMessage();
                    }
                  }}
                  placeholder="Please enter the content you would like to ask."
                  rows={2}
                  style={{
                    flex: 1,
                    resize: "vertical",
                    minHeight: "42px",
                    maxHeight: "140px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    padding: "10px 12px",
                    fontSize: "18px",
                    lineHeight: 1.4,
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="button"
                  onClick={sendHistoryMessage}
                  disabled={isHistorySending || !historyInput.trim()}
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isHistorySending || !historyInput.trim() ? "not-allowed" : "pointer",
                    opacity: isHistorySending || !historyInput.trim() ? 0.4 : 1,
                  }}
                >
                  <img src={sendIcon} alt="Send" style={{ width: "40px", height: "40px", objectFit: "contain" }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
