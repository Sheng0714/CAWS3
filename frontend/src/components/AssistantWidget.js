import React, { useEffect, useMemo, useRef, useState } from "react";
import RagflowMarkdown from "./RagflowMarkdown";
import assistantIcon from "../assets/Assistant.png";
import owlAbout from "../assets/\u8c93\u982d\u9df9about.png";
import clearIcon from "../assets/Clear.png";
import closeIcon from "../assets/XXX.png";
import sendIcon from "../assets/\u767c\u9001.png";
import {
  buildRagflowScopeFromStorage,
  buildRagflowScopeUserId,
} from "../utils/ragflowChatHistory";

const RAGFLOW_API_KEY = "ragflow-E5MjJlMmFlMWMxMTExZjFiZjJkYTYxNz";
const RAGFLOW_API_SERVER = "https://wu-ragflow.zeabur.app";
const ASSISTANT_AGENT_ID = "b266ba3443c111f18aa1a61716fb138a";
const OPENING_TEXT = "Hello, I\u2019m your CAWS Assistant. Feel free to ask me anything!";
const ASSISTANT_HINT_TEXT = "If you have any questions about how to use it, feel free to ask me!";
const QUICK_QUESTIONS = [
  "What can this platform help me with?",
  "Why is the chatbots responding slowly?",
  "Where can I check my writing progress/history?",
  "What tasks should I complete before finishing my writing?",
];
const LAUNCHER_SIZE = 80;
const LAUNCHER_MARGIN = 20;
const LAUNCHER_VIEWPORT_MARGIN = 12;
const PANEL_WIDTH = 360;
const PANEL_HEIGHT = 520;
const PANEL_LEFT_OFFSET = LAUNCHER_SIZE - PANEL_WIDTH;
const PANEL_TOP_OFFSET = 22 - PANEL_HEIGHT;
const DRAG_THRESHOLD = 4;

const parseAgentAnswer = (payload) =>
  payload?.data?.data?.content || payload?.data?.answer || payload?.answer || "";

const buildOpeningMessage = () => ({
  id: "assistant-opening",
  role: "assistant",
  content: OPENING_TEXT,
});

const getDefaultLauncherPosition = () => {
  if (typeof window === "undefined") {
    return { x: LAUNCHER_MARGIN, y: LAUNCHER_MARGIN };
  }
  return {
    x: Math.max(
      LAUNCHER_VIEWPORT_MARGIN,
      window.innerWidth - LAUNCHER_SIZE - LAUNCHER_MARGIN
    ),
    y: Math.max(
      LAUNCHER_VIEWPORT_MARGIN,
      window.innerHeight - LAUNCHER_SIZE - LAUNCHER_MARGIN
    ),
  };
};

const clampLauncherPosition = (position) => {
  if (typeof window === "undefined") return position;
  const maxX = Math.max(
    LAUNCHER_VIEWPORT_MARGIN,
    window.innerWidth - LAUNCHER_SIZE - LAUNCHER_VIEWPORT_MARGIN
  );
  const maxY = Math.max(
    LAUNCHER_VIEWPORT_MARGIN,
    window.innerHeight - LAUNCHER_SIZE - LAUNCHER_VIEWPORT_MARGIN
  );
  return {
    x: Math.min(Math.max(position.x, LAUNCHER_VIEWPORT_MARGIN), maxX),
    y: Math.min(Math.max(position.y, LAUNCHER_VIEWPORT_MARGIN), maxY),
  };
};

export default function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAssistantHint, setShowAssistantHint] = useState(false);
  const [hintWordCount, setHintWordCount] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState(() => [buildOpeningMessage()]);
  const [input, setInput] = useState("");
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [launcherPosition, setLauncherPosition] = useState(() =>
    getDefaultLauncherPosition()
  );
  const [isDraggingLauncher, setIsDraggingLauncher] = useState(false);
  const dragStateRef = useRef({
    isDragging: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
  });
  const bottomRef = useRef(null);

  const scopeUserId = useMemo(() => {
    const scope = buildRagflowScopeFromStorage();
    return buildRagflowScopeUserId(scope);
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isSending, isOpen]);

  useEffect(() => {
    let hideHintTimerId;
    const showHintBriefly = () => {
      setShowAssistantHint(true);
      setHintWordCount(0);
      hideHintTimerId = setTimeout(() => {
        setShowAssistantHint(false);
      }, 10000);
    };

    showHintBriefly();
    const hintIntervalId = setInterval(showHintBriefly, 20000);

    return () => {
      clearInterval(hintIntervalId);
      if (hideHintTimerId) {
        clearTimeout(hideHintTimerId);
      }
    };
  }, []);

  useEffect(() => {
    if (!showAssistantHint) {
      setHintWordCount(0);
      return undefined;
    }

    const hintWords = ASSISTANT_HINT_TEXT.split(" ");
    const typingTimerId = setInterval(() => {
      setHintWordCount((currentCount) => {
        if (currentCount >= hintWords.length) {
          clearInterval(typingTimerId);
          return currentCount;
        }
        return currentCount + 1;
      });
    }, 260);

    return () => {
      clearInterval(typingTimerId);
    };
  }, [showAssistantHint]);

  useEffect(() => {
    const handleResize = () => {
      setLauncherPosition((currentPosition) =>
        clampLauncherPosition(currentPosition)
      );
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isDraggingLauncher) return undefined;

    const updateLauncherPositionFromPointer = (clientX, clientY) => {
      if (!dragStateRef.current.isDragging) return;
      const deltaX = clientX - dragStateRef.current.startX;
      const deltaY = clientY - dragStateRef.current.startY;

      if (
        !dragStateRef.current.hasMoved &&
        (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD)
      ) {
        dragStateRef.current.hasMoved = true;
      }

      setLauncherPosition(
        clampLauncherPosition({
          x: dragStateRef.current.baseX + deltaX,
          y: dragStateRef.current.baseY + deltaY,
        })
      );
    };

    const handleLauncherMouseMove = (event) => {
      updateLauncherPositionFromPointer(event.clientX, event.clientY);
    };

    const handleLauncherTouchMove = (event) => {
      if (!event.touches?.length) return;
      event.preventDefault();
      const touch = event.touches[0];
      updateLauncherPositionFromPointer(touch.clientX, touch.clientY);
    };

    const handleLauncherMouseUp = () => {
      dragStateRef.current.isDragging = false;
      setIsDraggingLauncher(false);
    };

    const handleLauncherTouchEnd = () => {
      dragStateRef.current.isDragging = false;
      setIsDraggingLauncher(false);
    };

    window.addEventListener("mousemove", handleLauncherMouseMove);
    window.addEventListener("mouseup", handleLauncherMouseUp);
    window.addEventListener("touchmove", handleLauncherTouchMove, { passive: false });
    window.addEventListener("touchend", handleLauncherTouchEnd);
    window.addEventListener("touchcancel", handleLauncherTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleLauncherMouseMove);
      window.removeEventListener("mouseup", handleLauncherMouseUp);
      window.removeEventListener("touchmove", handleLauncherTouchMove);
      window.removeEventListener("touchend", handleLauncherTouchEnd);
      window.removeEventListener("touchcancel", handleLauncherTouchEnd);
    };
  }, [isDraggingLauncher]);

  const createSession = async () => {
    if (isCreatingSession || sessionId) return sessionId;

    setIsCreatingSession(true);
    setError("");
    try {
      const createUrl = `${RAGFLOW_API_SERVER}/api/v1/agents/${ASSISTANT_AGENT_ID}/sessions?user_id=${encodeURIComponent(scopeUserId)}`;
      const response = await fetch(createUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RAGFLOW_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Assistant" }),
      });

      const payload = await response.json();
      if (!response.ok || payload?.code !== 0) {
        throw new Error(payload?.message || `HTTP ${response.status}`);
      }

      const nextSessionId =
        payload?.data?.id || payload?.data?.session_id || payload?.id || payload?.session_id || "";
      if (!nextSessionId) {
        throw new Error("Session id missing.");
      }

      setSessionId(nextSessionId);
      return nextSessionId;
    } catch (sessionError) {
      setError(`Create session failed: ${sessionError?.message || "unknown error"}`);
      return "";
    } finally {
      setIsCreatingSession(false);
    }
  };

  const sendMessage = async (questionOverride) => {
    const question =
      typeof questionOverride === "string" ? questionOverride.trim() : input.trim();
    if (!question || isSending) return;

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = await createSession();
      if (!currentSessionId) return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    if (typeof questionOverride !== "string") {
      setInput("");
    }
    setError("");
    setIsSending(true);

    try {
      const response = await fetch(
        `${RAGFLOW_API_SERVER}/api/v1/agents/${ASSISTANT_AGENT_ID}/completions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RAGFLOW_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
            session_id: currentSessionId,
            stream: false,
          }),
        }
      );

      const payload = await response.json();
      if (!response.ok || payload?.code !== 0) {
        throw new Error(payload?.message || `HTTP ${response.status}`);
      }

      const answer = parseAgentAnswer(payload);
      const assistantMessage = {
        id: payload?.data?.id || `assistant-${Date.now()}`,
        role: "assistant",
        content: answer || "",
      };
      setMessages([...nextMessages, assistantMessage]);
    } catch (sendError) {
      setError(`Reply failed: ${sendError?.message || "unknown error"}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpen = async () => {
    setIsOpen(true);
    if (!sessionId) {
      await createSession();
    }
  };

  const handleLauncherMouseDown = (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragStateRef.current = {
      isDragging: true,
      hasMoved: false,
      startX: event.clientX,
      startY: event.clientY,
      baseX: launcherPosition.x,
      baseY: launcherPosition.y,
    };
    setIsDraggingLauncher(true);
  };

  const handleLauncherTouchStart = (event) => {
    if (!event.touches?.length) return;
    const touch = event.touches[0];
    dragStateRef.current = {
      isDragging: true,
      hasMoved: false,
      startX: touch.clientX,
      startY: touch.clientY,
      baseX: launcherPosition.x,
      baseY: launcherPosition.y,
    };
    setIsDraggingLauncher(true);
  };

  const handleLauncherClick = async () => {
    if (dragStateRef.current.hasMoved) {
      dragStateRef.current.hasMoved = false;
      return;
    }
    await handleOpen();
  };

  const handleClearChat = () => {
    if (isCreatingSession || isSending) return;
    setMessages([buildOpeningMessage()]);
    setInput("");
    setError("");
    setSessionId("");
  };

  return (
    <>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            left: `${launcherPosition.x + PANEL_LEFT_OFFSET}px`,
            top: `${launcherPosition.y + PANEL_TOP_OFFSET}px`,
            width: "360px",
            height: "520px",
            background: "#ffffff",
            border: "1px solid #d1d5db",
            borderRadius: "16px",
            boxShadow: "0 12px 28px rgba(15, 23, 42, 0.18)",
            zIndex: 1600,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img
                src={owlAbout}
                alt="Assistant Owl"
                style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "50%" }}
              />
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>Assistant</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                type="button"
                onClick={handleClearChat}
                aria-label="clear-assistant-chat"
                disabled={isCreatingSession || isSending}
                style={{
                  width: "30px",
                  height: "30px",
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  cursor: isCreatingSession || isSending ? "not-allowed" : "pointer",
                  opacity: isCreatingSession || isSending ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img src={clearIcon} alt="Clear" style={{ width: "22px", height: "22px", objectFit: "contain" }} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="close-assistant"
                style={{
                  width: "30px",
                  height: "30px",
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img src={closeIcon} alt="Close" style={{ width: "22px", height: "22px", objectFit: "contain" }} />
              </button>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              padding: "12px",
              overflowY: "auto",
              background: "#f8fafc",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: "flex",
                  justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    border: "1px solid #d1d5db",
                    borderRadius: "10px",
                    background: message.role === "user" ? "#dbeafe" : "#ffffff",
                    padding: "9px 11px",
                    fontSize: "15px",
                    lineHeight: 1.5,
                    color: "#0f172a",
                    wordBreak: "break-word",
                  }}
                >
                  {message.role === "assistant" ? (
                    <RagflowMarkdown content={message.content || ""} />
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}
            {messages.length === 1 && messages[0]?.id === "assistant-opening" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginTop: "2px",
                }}
              >
                {QUICK_QUESTIONS.map((question) => (
                  <div
                    key={question}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "#ffffff",
                      border: "1px solid #d1d5db",
                      borderRadius: "10px",
                      padding: "8px 8px 8px 10px",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        fontSize: "14px",
                        lineHeight: 1.4,
                        color: "#0f172a",
                        wordBreak: "break-word",
                      }}
                    >
                      {question}
                    </div>
                    <button
                      type="button"
                      onClick={() => sendMessage(question)}
                      disabled={isCreatingSession || isSending}
                      style={{
                        width: "28px",
                        height: "28px",
                        border: "none",
                        background: "transparent",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: isCreatingSession || isSending ? "not-allowed" : "pointer",
                        opacity: isCreatingSession || isSending ? 0.5 : 1,
                      }}
                    >
                      <img
                        src={sendIcon}
                        alt="Send quick question"
                        style={{ width: "24px", height: "24px", objectFit: "contain" }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {(isCreatingSession || isSending) && (
              <div
                style={{
                  fontSize: "13px",
                  color: "#475569",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 50 50" aria-hidden="true">
                  <circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray="90 150"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 25 25"
                      to="360 25 25"
                      dur="0.9s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
                <span>{isCreatingSession ? "Creating session..." : "I am thinking..."}</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div
            style={{
              borderTop: "1px solid #d1d5db",
              padding: "10px",
              background: "#ffffff",
            }}
          >
            {error && (
              <div style={{ marginBottom: "8px", color: "#b91c1c", fontSize: "13px" }}>{error}</div>
            )}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask Assistant..."
                rows={2}
                style={{
                  flex: 1,
                  resize: "none",
                  minHeight: "40px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  padding: "9px 10px",
                  fontSize: "15px",
                  lineHeight: 1.35,
                  fontFamily: "inherit",
                }}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!input.trim() || isCreatingSession || isSending}
                style={{
                  minWidth: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  cursor:
                    !input.trim() || isCreatingSession || isSending ? "not-allowed" : "pointer",
                  opacity: !input.trim() || isCreatingSession || isSending ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img src={sendIcon} alt="Send" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          position: "fixed",
          left: `${launcherPosition.x}px`,
          top: `${launcherPosition.y}px`,
          zIndex: 1600,
          width: `${LAUNCHER_SIZE}px`,
          height: `${LAUNCHER_SIZE}px`,
          userSelect: "none",
        }}
      >
        {showAssistantHint && (
          <div
            style={{
              position: "absolute",
              right: "90px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "280px",
              maxWidth: "min(280px, calc(100vw - 140px))",
              padding: "8px 10px",
              borderRadius: "10px",
              border: "1px solid #000000",
              background: "#ffffff",
              boxShadow: "0 8px 18px rgba(15, 23, 42, 0.12)",
              color: "#0f172a",
              fontSize: "14px",
              lineHeight: 1.4,
            }}
          >
            {ASSISTANT_HINT_TEXT.split(" ").slice(0, hintWordCount).join(" ")}
            <div
              style={{
                position: "absolute",
                top: "50%",
                right: "-6px",
                width: "10px",
                height: "10px",
                background: "#ffffff",
                borderRight: "1px solid #000000",
                borderBottom: "1px solid #000000",
                transform: "translateY(-50%) rotate(-45deg)",
              }}
            />
          </div>
        )}
        <button
          type="button"
          onMouseDown={handleLauncherMouseDown}
          onTouchStart={handleLauncherTouchStart}
          onClick={handleLauncherClick}
          aria-label="open-assistant"
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            border: "1px solid #d1d5db",
            background: "#ffffff",
            padding: 0,
            overflow: "hidden",
            boxShadow: "0 8px 18px rgba(15, 23, 42, 0.18)",
            cursor: isDraggingLauncher ? "grabbing" : "grab",
            touchAction: "none",
          }}
        >
          <img
            src={assistantIcon}
            alt="Assistant"
            style={{ width: "80px", height: "80px", objectFit: "cover", display: "block" }}
          />
        </button>
      </div>
    </>
  );
}
