import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar_Student";
import StudentLeftSidebar from "./StudentLeftSidebar";
import backIcon from "../assets/back.png";
import { fetchEssayFromNotion } from "../services/essayNotificationService";

import ICON1 from "../assets/新聊天.png";
import ICON2 from "../assets/歷史紀錄2.png";
import cawsOwl from "../assets/去背.png";

const getIsCompletedEntry = () =>
  localStorage.getItem("isCompletedActivityEntry") === "true";
const WRITING_ANALYSIS_PREFILL_KEY = "writingAnalysisPrefillPrompt";
const convertEditorHtmlToPlainText = (htmlContent) => {
  if (!htmlContent) return "";

  const htmlWithLineBreaks = String(htmlContent)
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*\/(p|div|h[1-6]|li|tr)\s*>/gi, "\n")
    .replace(/<\s*li\b[^>]*>/gi, "- ");

  const tempElement = document.createElement("div");
  tempElement.innerHTML = htmlWithLineBreaks;

  return (tempElement.textContent || tempElement.innerText || "")
    .replace(/\u00a0/g, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};
const resolveWritingAnalysisPrefillPrompt = async () => {
  const studentName =
    localStorage.getItem("name") ||
    localStorage.getItem("username") ||
    localStorage.getItem("userName") ||
    "";
  const className = localStorage.getItem("activityTitle") || "";
  const theme = localStorage.getItem("groupName") || "";

  let essayHtmlFromDb = "";
  if (studentName && className && theme) {
    try {
      const notionData = await fetchEssayFromNotion({ studentName, className, theme });
      essayHtmlFromDb = notionData?.essayContent || "";
    } catch (error) {
      if (error?.code !== "NOT_FOUND") {
        console.error("Failed to fetch essay from DB before writing analysis chat:", error);
      }
    }
  }

  const localEssayHtml = localStorage.getItem("editorData") || localStorage.getItem("essayData") || "";
  return convertEditorHtmlToPlainText(essayHtmlFromDb || localEssayHtml);
};

export default function Studentfuntion() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCompletedEntry, setIsCompletedEntry] = useState(getIsCompletedEntry);
  const [isPreparingStartNewChat, setIsPreparingStartNewChat] = useState(false);
  const chatbotEntryMode =
    location.state?.chatbotEntryMode || sessionStorage.getItem("chatbotEntryMode") || "unknown";

  const refreshCompletedEntryState = useCallback(() => {
    setIsCompletedEntry(getIsCompletedEntry());
  }, []);

  useEffect(() => {
    refreshCompletedEntryState();
    window.addEventListener("focus", refreshCompletedEntryState);
    window.addEventListener("storage", refreshCompletedEntryState);

    return () => {
      window.removeEventListener("focus", refreshCompletedEntryState);
      window.removeEventListener("storage", refreshCompletedEntryState);
    };
  }, [refreshCompletedEntryState]);

  const actionButtonStyle = {
    width: "228px",
    height: "73px",
    background: "rgba(204, 149, 101, 0.3)",
    border: "1.5px solid #000000",
    borderRadius: "10px",
    fontSize: "26px",
    fontWeight: 700,
    color: "#111111",
    cursor: "pointer",
  };
  const startNewChatLocked = isCompletedEntry;
  const handleStartNewChat = async () => {
    if (startNewChatLocked || isPreparingStartNewChat) return;

    setIsPreparingStartNewChat(true);
    try {
      if (chatbotEntryMode === "writing_analysis") {
        const prefillPrompt = await resolveWritingAnalysisPrefillPrompt();
        if (prefillPrompt) {
          sessionStorage.setItem(WRITING_ANALYSIS_PREFILL_KEY, prefillPrompt);
        } else {
          sessionStorage.removeItem(WRITING_ANALYSIS_PREFILL_KEY);
        }
      }

      navigate("/Newchat", { state: { chatbotEntryMode } });
    } finally {
      setIsPreparingStartNewChat(false);
    }
  };

  useEffect(() => {
    const hasWritingAnalysisPrefill = Boolean(
      sessionStorage.getItem(WRITING_ANALYSIS_PREFILL_KEY)?.trim()
    );

    if (chatbotEntryMode !== "writing_analysis") return;
    if (!hasWritingAnalysisPrefill) return;
    if (startNewChatLocked) return;

    navigate("/Newchat", { state: { chatbotEntryMode }, replace: true });
  }, [chatbotEntryMode, navigate, startNewChatLocked]);

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
              width: "170px",
              height: "170px",
              objectFit: "contain",
            }}
          />

          <div
            style={{
              background: "rgba(105, 83, 83, 0.1)",
              border: "1.5px solid #000000",
              borderRadius: "16px",
              padding: "16px 20px",
              height: "155px",
              width: "900px",
              maxWidth: "100%",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              color: "#1e293b",
              fontSize: "25px",
              lineHeight: 1.45,
              textAlign: "left",
            }}
          >
            <p style={{ margin: 0, fontWeight: 700 }}>
              This mode organizes the arguments and evidence from your KF discussion.
            </p>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #dbe3ef",
            borderRadius: "20px",
            boxShadow: "0 10px 25px rgba(30, 41, 59, 0.08)",
            padding: "40px 20px",
            minHeight: "420px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: "64px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "18px",
              }}
            >
              <img
                src={ICON1}
                alt="Start New Chat"
                style={{ width: "110px", height: "110px", objectFit: "contain" }}
              />
              <button
                type="button"
                onClick={handleStartNewChat}
                disabled={startNewChatLocked || isPreparingStartNewChat}
                style={{
                  ...actionButtonStyle,
                  background: startNewChatLocked || isPreparingStartNewChat
                    ? "rgba(148, 163, 184, 0.35)"
                    : actionButtonStyle.background,
                  color: startNewChatLocked || isPreparingStartNewChat ? "#64748b" : actionButtonStyle.color,
                  cursor: startNewChatLocked || isPreparingStartNewChat ? "not-allowed" : "pointer",
                  pointerEvents: startNewChatLocked || isPreparingStartNewChat ? "none" : "auto",
                }}
              >
                Start New Chat
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "18px",
              }}
            >
              <img
                src={ICON2}
                alt="Chat History"
                style={{ width: "110px", height: "110px", objectFit: "contain" }}
              />
              <button
                type="button"
                onClick={() => navigate("/Chathistory", { state: { chatbotEntryMode } })}
                style={actionButtonStyle}
              >
                Chat History
              </button>
            </div>
          </div>
        </div>

      </div>
        </div>
      </div>
    </div>
  );
}
