import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRef } from "react";
import axios from "axios";
import Navbar from "./Navbar_Student";
import config from "../config.json";
import url from "../url.json";

import cawsOwl from "../assets/去背.png";

const RAGFLOW_API_KEY = "ragflow-E5MjJlMmFlMWMxMTExZjFiZjJkYTYxNz";
const RAGFLOW_API_SERVER = "https://wu-ragflow.zeabur.app";
const RAGFLOW_CHAT_ID = "daa6b1a01c0e11f195efa61716fb138a";
const WRITING_ASSISTANT_AGENT_ID = "857a20ee1c1911f18f96a61716fb138a";
const WRITING_ANALYSIS_AGENT_ID = "8d9b9b861c1911f1a4fea61716fb138a";

const CHATBOT_MODE_CONFIG = {
  kf_analysis: {
    title: "KF Analysis",
    description:
      "Hi! I'm the CAWS Bot. This mode organizes the arguments and evidence from your KF discussion.",
    sourceType: "chat",
    targetId: RAGFLOW_CHAT_ID,
  },
  writing_assistant: {
    title: "Writing Assistant",
    description:
      "Hi! I'm the CAWS Bot. This mode helps you build a writing outline from your KF discussion.",
    sourceType: "agent",
    targetId: WRITING_ASSISTANT_AGENT_ID,
  },
  writing_analysis: {
    title: "Writing Analysis",
    description:
      "Hi! I'm the CAWS Bot. This mode provides feedback and suggestions to improve your writing.",
    sourceType: "agent",
    targetId: WRITING_ANALYSIS_AGENT_ID,
  },
};

export default function Studentfuntion() {
  const navigate = useNavigate();
  const location = useLocation();
  const [className, setClassName] = useState(localStorage.getItem("activityTitle") || "");
  const [topicName, setTopicName] = useState(localStorage.getItem("groupName") || "");
  const [ragflowSessionId, setRagflowSessionId] = useState("");
  const [isCreatingRagflowSession, setIsCreatingRagflowSession] = useState(false);
  const [isRagflowSending, setIsRagflowSending] = useState(false);
  const [ragflowError, setRagflowError] = useState("");
  const [ragflowMessages, setRagflowMessages] = useState([]);
  const [ragflowInput, setRagflowInput] = useState("");
  const hasTriedCreateSessionRef = useRef(false);
  const chatBottomRef = useRef(null);

  const chatbotEntryMode =
    location.state?.chatbotEntryMode || sessionStorage.getItem("chatbotEntryMode") || "unknown";
  const activeModeConfig = CHATBOT_MODE_CONFIG[chatbotEntryMode];
  const isSupportedEntry = Boolean(activeModeConfig);

  const buildRagflowApiUrl = (apiName) => {
    if (!activeModeConfig) return "";
    const resource = activeModeConfig.sourceType === "agent" ? "agents" : "chats";
    return `${RAGFLOW_API_SERVER}/api/v1/${resource}/${activeModeConfig.targetId}/${apiName}`;
  };

  const parseRagflowSessionMessages = (payload) => {
    if (!activeModeConfig) return [];

    const rawMessages =
      activeModeConfig.sourceType === "agent" ? payload?.data?.message : payload?.data?.messages;

    if (!Array.isArray(rawMessages)) return [];

    return rawMessages
      .map((message, index) => ({
        id: `session-init-${index}-${Date.now()}`,
        role: message?.role === "user" ? "user" : "assistant",
        content: typeof message?.content === "string" ? message.content : "",
      }))
      .filter((message) => message.content.trim());
  };

  const parseRagflowCompletion = (payload) => {
    const answer =
      activeModeConfig?.sourceType === "agent"
        ? payload?.data?.data?.content || payload?.data?.answer || payload?.answer || ""
        : payload?.data?.answer || payload?.answer || "";

    return {
      id: payload?.data?.id || payload?.data?.message_id || `assistant-${Date.now()}`,
      answer: typeof answer === "string" ? answer : "",
    };
  };

  useEffect(() => {
    const activityId = sessionStorage.getItem("activityId") || localStorage.getItem("activityId");
    const groupIdRaw = sessionStorage.getItem("groupId") || localStorage.getItem("groupId");

    if (!activityId) return;

    const fetchClassAndTopic = async () => {
      try {
        const response = await axios.get(
          `${url.backendHost + config[6].enterActivity}/${activityId}`
        );

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
    hasTriedCreateSessionRef.current = false;
    setRagflowSessionId("");
    setRagflowMessages([]);
    setRagflowInput("");
    setRagflowError("");
  }, [chatbotEntryMode]);

  useEffect(() => {
    if (!isSupportedEntry || hasTriedCreateSessionRef.current) {
      return;
    }

    hasTriedCreateSessionRef.current = true;
    let isCancelled = false;

    const createRagflowSession = async () => {
      setIsCreatingRagflowSession(true);
      setRagflowError("");
      setRagflowMessages([]);

      try {
        const response = await fetch(buildRagflowApiUrl("sessions"), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RAGFLOW_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: `${activeModeConfig.title} session` }),
        });

        const payload = await response.json();
        if (!response.ok || payload?.code !== 0) {
          throw new Error(payload?.message || `HTTP ${response.status}`);
        }

        const newSessionId =
          payload?.data?.id || payload?.data?.session_id || payload?.id || payload?.session_id;

        if (!newSessionId) {
          throw new Error("RAGFLOW session id missing in response.");
        }

        if (!isCancelled) {
          const initialMessages = parseRagflowSessionMessages(payload);
          setRagflowSessionId(newSessionId);
          setRagflowMessages(initialMessages);
          sessionStorage.setItem("ragflowSessionId", newSessionId);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to create RAGFLOW chat session:", error);
          setRagflowError(`RAGFLOW new chat failed: ${error?.message || "unknown error"}`);
        }
      } finally {
        if (!isCancelled) {
          setIsCreatingRagflowSession(false);
        }
      }
    };

    createRagflowSession();

    return () => {
      isCancelled = true;
    };
  }, [isSupportedEntry, activeModeConfig]);

  const requestRagflowCompletion = async (question, sessionId) => {
    if (!isSupportedEntry) {
      throw new Error("Unsupported chatbot mode.");
    }

    const response = await fetch(buildRagflowApiUrl("completions"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RAGFLOW_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        session_id: sessionId,
        stream: false,
      }),
    });

    const payload = await response.json();
    if (!response.ok || payload?.code !== 0) {
      throw new Error(payload?.message || `HTTP ${response.status}`);
    }

    return parseRagflowCompletion(payload);
  };

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [ragflowMessages, isRagflowSending]);

  const sendRagflowMessage = async () => {
    const question = ragflowInput.trim();
    if (!question || !ragflowSessionId || isRagflowSending) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
    };

    setRagflowInput("");
    setRagflowError("");
    setRagflowMessages((prev) => [...prev, userMessage]);
    setIsRagflowSending(true);

    try {
      const completion = await requestRagflowCompletion(question, ragflowSessionId);
      const answer = completion.answer || "";
      setRagflowMessages((prev) => [
        ...prev,
        {
          id: completion.id || `assistant-${Date.now()}`,
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (error) {
      console.error("Failed to send RAGFLOW message:", error);
      setRagflowError(`RAGFLOW reply failed: ${error?.message || "unknown error"}`);
    } finally {
      setIsRagflowSending(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ece8e5" }}>
      <Navbar />

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
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "16px 20px",
              maxWidth: "520px",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              color: "#1e293b",
              fontSize: "25px",
              lineHeight: 1.45,
              textAlign: "left",
            }}
          >
            <p style={{ margin: 0 }}>
              {activeModeConfig?.description ||
                "Hi! I'm the CAWS Bot. Please select a chatbot mode and start a new chat."}
            </p>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            background: "#ffffff",
            border: "1px solid #dbe3ef",
            borderRadius: "20px",
            minHeight: "420px",
            padding: "28px 24px",
            boxShadow: "0 10px 25px rgba(30, 41, 59, 0.08)",
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              width: "120px",
              height: "42px",
              background: "rgba(204, 149, 101, 0.3)",
              border: "1.5px solid #000000",
              borderRadius: "10px",
              fontSize: "18px",
              fontWeight: 700,
              color: "#111111",
              cursor: "pointer",
            }}
          >
            BACK
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              flexWrap: "wrap",
              paddingRight: "140px",
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
            New Chat ({activeModeConfig?.title || "Unknown Mode"}):
          </p>

          {!isSupportedEntry && (
            <p style={{ marginTop: 0, color: "#b91c1c", fontSize: "16px" }}>
              Unsupported chatbot mode. Please go back and enter from KF Analysis, Writing Assistant,
              or Writing Analysis.
            </p>
          )}

          {isSupportedEntry && isCreatingRagflowSession && (
            <p style={{ marginTop: 0, color: "#334155", fontSize: "16px" }}>
              Creating a new RAGFLOW chat session...
            </p>
          )}

          {isSupportedEntry && ragflowError && (
            <p style={{ marginTop: 0, color: "#b91c1c", fontSize: "16px" }}>{ragflowError}</p>
          )}

          {isSupportedEntry && ragflowSessionId && (
            <p style={{ marginTop: 0, color: "#334155", fontSize: "16px" }}>
              Session ID: {ragflowSessionId}
            </p>
          )}

          {isSupportedEntry && ragflowSessionId && (
            <div
              style={{
                width: "100%",
                minHeight: "520px",
                border: "1px solid #d1d5db",
                borderRadius: "12px",
                marginTop: "8px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minHeight: "420px",
                  maxHeight: "520px",
                  overflowY: "auto",
                  padding: "16px",
                  background: "#f8fafc",
                }}
              >
                {ragflowMessages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      display: "flex",
                      justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "78%",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.5,
                        fontSize: "15px",
                        background: message.role === "user" ? "#dbeafe" : "#ffffff",
                        border: "1px solid #d1d5db",
                        color: "#0f172a",
                      }}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isRagflowSending && (
                  <p style={{ margin: 0, color: "#475569", fontSize: "14px" }}>
                    RAGFLOW is replying...
                  </p>
                )}
                <div ref={chatBottomRef} />
              </div>

              <div
                style={{
                  borderTop: "1px solid #d1d5db",
                  padding: "12px",
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-end",
                }}
              >
                <textarea
                  value={ragflowInput}
                  onChange={(event) => setRagflowInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendRagflowMessage();
                    }
                  }}
                  placeholder="Ask RAGFLOW..."
                  rows={2}
                  style={{
                    flex: 1,
                    resize: "vertical",
                    minHeight: "42px",
                    maxHeight: "160px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    padding: "10px 12px",
                    fontSize: "14px",
                    lineHeight: 1.4,
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="button"
                  onClick={sendRagflowMessage}
                  disabled={isRagflowSending || !ragflowInput.trim()}
                  style={{
                    width: "90px",
                    height: "42px",
                    borderRadius: "10px",
                    border: "1.5px solid #0f172a",
                    background: isRagflowSending || !ragflowInput.trim() ? "#e2e8f0" : "#bfdbfe",
                    color: "#0f172a",
                    fontWeight: 700,
                    cursor: isRagflowSending || !ragflowInput.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
