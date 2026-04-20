import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar_Student";
import StudentLeftSidebar from "./StudentLeftSidebar";
import backIcon from "../assets/back.png";

import number1 from "../assets/數字1.png";
import number2 from "../assets/數字2.png";
import number3 from "../assets/數字3.png";
import number4 from "../assets/數字4.png";

import feature1 from "../assets/學生功能1.png";
import feature2 from "../assets/學生功能2.png";
import feature3 from "../assets/學生功能3.png";
import feature4 from "../assets/學生功能4.png";
import cawsOwl from "../assets/揮手.gif";

const cardData = [
  {
    id: 1,
    numberImage: number1,
    featureImage: feature1,
    title: "KF Argumentation",
    description: [
      "If you haven't started the discussion yet, select this.",
      "Discuss with your group members in KF.",
    ],
  },
  {
    id: 2,
    numberImage: number2,
    featureImage: feature2,
    title: "Chatbots",
    description: [
      "KF Analysis Chatbot",
      "Writing Assistant Chatbot",
      "Writing Analysis Chatbot",
    ],
  },
  {
    id: 3,
    numberImage: number3,
    featureImage: feature3,
    title: "Writing Area",
    description: [
      "Select this after discussing with the CAWS BOT.",
      "Start writing your argumentative essay.",
    ],
  },
  {
    id: 4,
    numberImage: number4,
    featureImage: feature4,
    title: "Scoring & Feedback",
    description: ["Check your teacher's feedback and scores."],
  },
];

const buildSubmitLockKey = (studentName, className, theme) =>
  `submitLocked::${encodeURIComponent(studentName || "")}::${encodeURIComponent(
    className || ""
  )}::${encodeURIComponent(theme || "")}`;

const getScoringUnlocked = () => {
  const studentName =
    localStorage.getItem("name") ||
    localStorage.getItem("username") ||
    localStorage.getItem("userName") ||
    "";
  const className = localStorage.getItem("activityTitle") || "";
  const theme = localStorage.getItem("groupName") || "";
  if (!studentName || !className || !theme) return false;

  const scopedSubmitLockKey = buildSubmitLockKey(studentName, className, theme);
  return localStorage.getItem(scopedSubmitLockKey) === "true";
};

const getIsCompletedEntry = () =>
  localStorage.getItem("isCompletedActivityEntry") === "true";

export default function Studentfuntion() {
  const navigate = useNavigate();
  const [isScoringUnlocked, setIsScoringUnlocked] = useState(getScoringUnlocked);
  const [isCompletedEntry, setIsCompletedEntry] = useState(getIsCompletedEntry);
  const [showScoringLockTooltip, setShowScoringLockTooltip] = useState(false);
  const scoringLockedTooltip =
    "Please submit your argumentative essay in the Writing Area first!!!";

  const refreshScoringUnlockState = useCallback(() => {
    setIsScoringUnlocked(getScoringUnlocked());
  }, []);

  const refreshCompletedEntryState = useCallback(() => {
    setIsCompletedEntry(getIsCompletedEntry());
  }, []);

  const isCompletedLockedCard = useCallback(
    (cardId) => isCompletedEntry && (cardId === 1 || cardId === 3),
    [isCompletedEntry]
  );

  useEffect(() => {
    refreshScoringUnlockState();
    refreshCompletedEntryState();
    window.addEventListener("focus", refreshScoringUnlockState);
    window.addEventListener("focus", refreshCompletedEntryState);
    window.addEventListener("storage", refreshScoringUnlockState);
    window.addEventListener("storage", refreshCompletedEntryState);

    return () => {
      window.removeEventListener("focus", refreshScoringUnlockState);
      window.removeEventListener("focus", refreshCompletedEntryState);
      window.removeEventListener("storage", refreshScoringUnlockState);
      window.removeEventListener("storage", refreshCompletedEntryState);
    };
  }, [refreshCompletedEntryState, refreshScoringUnlockState]);

  const handleEnterClick = (id) => {
    if (isCompletedLockedCard(id)) return;

    if (id === 1) {
      // navigate("https://kf6.nccu.edu.tw/");
       window.open("https://kf6.nccu.edu.tw/", "_blank", "noopener,noreferrer");
      return;
    }
    if (id === 2) {
      navigate("/Chatbot");
    }
    if (id === 3) {
      navigate("/writing_area");
    }
    if (id === 4) {
      navigate("/freebackstudent");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <StudentLeftSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0px 20px 40px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "20px",
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
              width: "150px",
              height: "150px",
              objectFit: "contain",
            }}
          />

          <div
            style={{
              background: "rgba(105, 83, 83, 0.1)",
              border: "1.5px solid #000000",
              borderRadius: "16px",
              marginTop: "10px",
              padding: "12px 20px",
              width: "900px",
              maxWidth: "100%",
              // margin: "0 auto",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              color: "#1e293b",
              fontSize: "25px",
              lineHeight: 1.45,
              textAlign: "left",
            }}
          >
            <p style={{ margin: 0, fontWeight: 700 }}>Hi! I'm your CAWS Bot.</p>
            <p style={{ margin: 0, fontWeight: 700 }}>These are the <strong><span style={{ fontSize: "36px" }}>4</span></strong> main functions of CAWS. Please select one of the followings.
</p>
            
          </div>
        </div>

        <div
          style={{
            borderRadius: "24px",
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
              alignItems: "stretch",
              justifyItems: "center",
            }}
          >
            {cardData.map((card) => {
              const isScoringCard = card.id === 4;
              const isScoringLocked = isScoringCard && !isScoringUnlocked;
              const isCompletedLocked = isCompletedLockedCard(card.id);
              const isEnterLocked = isScoringLocked || isCompletedLocked;

              return (
              <div
                key={card.id}
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "300px",
                  minHeight: "310px",
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1.5px solid #000000",
                  boxShadow: "0 10px 25px rgba(30, 41, 59, 0.08)",
                  padding: "18px 16px 16px",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  src={card.numberImage}
                  alt={`number-${card.id}`}
                  style={{
                    width: "40px",
                    height: "40px",
                    position: "absolute",
                    top: "16px",
                    left: "16px",
                    objectFit: "contain",
                  }}
                />

                <img
                  src={card.featureImage}
                  alt={card.title}
                  style={{
                    width: "142px",
                    height: "142px",
                    objectFit: "contain",
                    marginTop: "34px",
                    marginBottom: "18px",
                  }}
                />

                <h2
                  style={{
                    margin: "0 0 6px",
                    padding: "10px 0",
                    fontSize: "20px",
                    lineHeight: 1.3,
                    height: "72px",
                    color: "#0f172a",
                    textAlign: "center",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {card.title}
                </h2>

                <div
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                  }}
                >
                  {card.description.map((line) => (
                    <p
                      key={line}
                      style={{
                        margin: "2px 0",
                        fontSize: "16px",
                        lineHeight: 1.6,
                        color: "#334155",
                        textAlign: "center",
                        width: "100%",
                      }}
                    >
                      {line}
                    </p>
                  ))}
                </div>

                {/* Original ENTER block for all cards (kept for future use):
                <div
                  onMouseEnter={() => {
                    if (isScoringLocked) setShowScoringLockTooltip(true);
                  }}
                  onMouseLeave={() => setShowScoringLockTooltip(false)}
                  onFocus={() => {
                    if (isScoringLocked) setShowScoringLockTooltip(true);
                  }}
                  onBlur={() => setShowScoringLockTooltip(false)}
                  style={{
                    marginTop: "auto",
                    display: "inline-flex",
                    position: "relative",
                    cursor: isEnterLocked ? "not-allowed" : "pointer",
                  }}
                >
                  {isScoringLocked && showScoringLockTooltip && (
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        bottom: "calc(100% + 10px)",
                        transform: "translateX(-50%)",
                        maxWidth: "360px",
                        minWidth: "300px",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        background: "rgba(15, 23, 42, 0.95)",
                        color: "#ffffff",
                        fontSize: "18px",
                        lineHeight: 1.35,
                        textAlign: "center",
                        zIndex: 10,
                        pointerEvents: "none",
                        boxShadow: "0 8px 18px rgba(0, 0, 0, 0.25)",
                      }}
                    >
                      {scoringLockedTooltip}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleEnterClick(card.id)}
                    disabled={isEnterLocked}
                    style={{
                      width: "140px",
                      height: "44px",
                      background: isEnterLocked
                        ? "rgba(148, 163, 184, 0.35)"
                        : "rgba(204, 149, 101, 0.3)",
                      border: "1.5px solid #000000",
                      borderRadius: "10px",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: isEnterLocked ? "#64748b" : "#111111",
                      cursor: isEnterLocked ? "not-allowed" : "pointer",
                      pointerEvents: isEnterLocked ? "none" : "auto",
                    }}
                  >
                    ENTER
                  </button>
                </div>
                */}

                {card.id === 1 && (
                  <div
                    onMouseEnter={() => {
                      if (isScoringLocked) setShowScoringLockTooltip(true);
                    }}
                    onMouseLeave={() => setShowScoringLockTooltip(false)}
                    onFocus={() => {
                      if (isScoringLocked) setShowScoringLockTooltip(true);
                    }}
                    onBlur={() => setShowScoringLockTooltip(false)}
                    style={{
                      marginTop: "auto",
                      display: "inline-flex",
                      position: "relative",
                      cursor: isEnterLocked ? "not-allowed" : "pointer",
                    }}
                  >
                    {isScoringLocked && showScoringLockTooltip && (
                      <div
                        style={{
                          position: "absolute",
                          left: "50%",
                          bottom: "calc(100% + 10px)",
                          transform: "translateX(-50%)",
                          maxWidth: "360px",
                          minWidth: "300px",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          background: "rgba(15, 23, 42, 0.95)",
                          color: "#ffffff",
                          fontSize: "18px",
                          lineHeight: 1.35,
                          textAlign: "center",
                          zIndex: 10,
                          pointerEvents: "none",
                          boxShadow: "0 8px 18px rgba(0, 0, 0, 0.25)",
                        }}
                      >
                        {scoringLockedTooltip}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleEnterClick(card.id)}
                      disabled={isEnterLocked}
                      style={{
                        width: "140px",
                        height: "44px",
                        background: isEnterLocked
                          ? "rgba(148, 163, 184, 0.35)"
                          : "rgba(204, 149, 101, 0.3)",
                        border: "1.5px solid #000000",
                        borderRadius: "10px",
                        fontSize: "18px",
                        fontWeight: 700,
                        color: isEnterLocked ? "#64748b" : "#111111",
                        cursor: isEnterLocked ? "not-allowed" : "pointer",
                        pointerEvents: isEnterLocked ? "none" : "auto",
                      }}
                    >
                      ENTER
                    </button>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>

      </div>
        </div>
      </div>
    </div>
  );
}



