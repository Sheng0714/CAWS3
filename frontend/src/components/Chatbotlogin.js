import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar_Student";
import backIcon from "../assets/back.png";

import ICON1 from "../assets/新聊天.png";
import ICON2 from "../assets/歷史紀錄2.png";
import cawsOwl from "../assets/去背.png";

const getIsCompletedEntry = () =>
  localStorage.getItem("isCompletedActivityEntry") === "true";

export default function Studentfuntion() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCompletedEntry, setIsCompletedEntry] = useState(getIsCompletedEntry);
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
              background: "#ffffff",
              border: "1px solid #e2e8f0",
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
                onClick={() => {
                  if (startNewChatLocked) return;
                  navigate("/Newchat", { state: { chatbotEntryMode } });
                }}
                disabled={startNewChatLocked}
                style={{
                  ...actionButtonStyle,
                  background: startNewChatLocked
                    ? "rgba(148, 163, 184, 0.35)"
                    : actionButtonStyle.background,
                  color: startNewChatLocked ? "#64748b" : actionButtonStyle.color,
                  cursor: startNewChatLocked ? "not-allowed" : "pointer",
                  pointerEvents: startNewChatLocked ? "none" : "auto",
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
  );
}
