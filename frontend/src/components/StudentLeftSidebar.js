import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RagflowMarkdown from "./RagflowMarkdown";
import WritingStageStepper from "./WritingStageStepper";
import {
  RAGFLOW_TOOLKIT_STORAGE_EVENT,
  buildToolkitScopeFromStorage,
  readToolkitContentByScope,
  writeToolkitContentByScope,
} from "../utils/ragflowChatHistory";

import HamburgerLineIcon from "../assets/橫線.png";
import LeftArrowIcon from "../assets/左箭頭.png";
import StudentFeature1Icon from "../assets/學生功能1.png";
import StudentFeature2Icon from "../assets/學生功能2.png";
import StudentFeature3Icon from "../assets/學生功能3.png";
import StudentFeature4Icon from "../assets/學生功能4.png";
import KFSummaryIcon from "../assets/KFSummary.png";
import WritingOutlineIcon from "../assets/WritingOutline.png";
import NotesAreaIcon from "../assets/NotesArea.png";
import ExpandIcon from "../assets/展開.png";
import CopyIcon from "../assets/複製.png";
import HomeIcon from "../assets/home.png";
import AboutIcon from "../assets/about.png";
import ManualIcon from "../assets/manual.png";
import LogoutIcon from "../assets/logout.png";
import ChatbotModeIcon1 from "../assets/首頁1.png";
import ChatbotModeIcon2 from "../assets/首頁2.png";
import ChatbotModeIcon3 from "../assets/首頁3.png";
import AvatarIcon from "../assets/頭像.png";

const createChatbotModeAction = (chatbotEntryMode) => (navigate) => {
  sessionStorage.setItem("chatbotEntryMode", chatbotEntryMode);
  navigate("/Chatbotlogin", { state: { chatbotEntryMode } });
};

const SIDEBAR_PRIMARY_MENUS = [
  {
    key: "kf-argument",
    icon: StudentFeature1Icon,
    label: "KF Argumentation",
    action: () => window.open("https://kf6.nccu.edu.tw/", "_blank", "noopener,noreferrer"),
  },
  // {
  //   key: "chatbot",
  //   icon: StudentFeature2Icon,
  //   label: "Chatbots",
  //   children: [
  //     {
  //       key: "chatbot-kf-analysis",
  //       label: "KF Analysis",
  //       icon: ChatbotModeIcon1,
  //       action: createChatbotModeAction("kf_analysis"),
  //     },
  //     {
  //       key: "chatbot-writing-assistant",
  //       label: "Writing Assistant",
  //       icon: ChatbotModeIcon2,
  //       action: createChatbotModeAction("writing_assistant"),
  //     },
  //     {
  //       key: "chatbot-writing-analysis",
  //       label: "Writing Analysis",
  //       icon: ChatbotModeIcon3,
  //       action: createChatbotModeAction("writing_analysis"),
  //     },
  //   ],
  // },
  // {
  //   key: "writing-area",
  //   icon: StudentFeature3Icon,
  //   label: "Writing Area",
  //   action: (navigate) => navigate("/writing_area"),
  // },
  {
    key: "scoring",
    icon: StudentFeature4Icon,
    label: "Scoring & Feedback",
    action: (navigate) => navigate("/freebackstudent"),
  },
];

const SIDEBAR_SECONDARY_MENUS = [
  { key: "home", icon: HomeIcon, label: "home", action: (navigate) => navigate("/home") },
  { key: "about", icon: AboutIcon, label: "about", action: (navigate) => navigate("/About_student") },
  { key: "manual", icon: ManualIcon, label: "manual", action: (navigate) => navigate("/manual") },
];

const SIDEBAR_TOOLKIT_MENUS = [
  { key: "kf-summary", icon: KFSummaryIcon, label: "KF Summary", action: (navigate) => navigate("/writing_area") },
  { key: "writing-outline", icon: WritingOutlineIcon, label: "Writing Outline", action: (navigate) => navigate("/writing_area") },
  { key: "notes-area", icon: NotesAreaIcon, label: "Notes Area", action: (navigate) => navigate("/writing_area") },
];

const notionApiBases = [
  process.env.REACT_APP_NOTION_API_BASE_URL,
  "/api/notion",
  "/notion-api",
  "http://localhost:4000",
  "http://140.115.126.27:4000",
].filter(Boolean);

const fetchToolkitFromNotion = async ({ studentName, className, topicName }) => {
  if (!studentName || !className || !topicName) return null;

  const token = localStorage.getItem("jwtToken");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let lastError = null;

  for (const base of notionApiBases) {
    const normalizedBase = base.replace(/\/+$/, "");
    const url = `${normalizedBase}/api/get-essay/${encodeURIComponent(studentName)}`;

    try {
      const response = await axios.get(url, {
        timeout: 15000,
        headers,
        params: { className, theme: topicName },
      });
      return response?.data?.data || null;
    } catch (error) {
      if (error?.response?.status === 404) {
        return null;
      }
      lastError = error;
    }
  }

  throw lastError || new Error("Fetch toolkit from Notion failed");
};

const hasMeaningfulStageValue = (value) => {
  if (typeof value !== "string") return false;
  const plainText = value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plainText.length > 0;
};

const buildWritingStageChecks = ({ summaryValue = "", outlineValue = "", finalWritingValue = "" } = {}) => ({
  discussion: true,
  summary: hasMeaningfulStageValue(summaryValue),
  outline: hasMeaningfulStageValue(outlineValue),
  finalWriting: hasMeaningfulStageValue(finalWritingValue),
});

const buildEssayStorageKey = (studentName, className, topicName) =>
  `essayData::${encodeURIComponent(studentName || "")}::${encodeURIComponent(className || "")}::${encodeURIComponent(topicName || "")}`;

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

export default function StudentLeftSidebar() {
  const navigate = useNavigate();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [kfSummaryContent, setKfSummaryContent] = useState("");
  const [outlineContent, setOutlineContent] = useState("");
  const [notesContent, setNotesContent] = useState("");
  const [writingStageChecks, setWritingStageChecks] = useState(() => buildWritingStageChecks());
  const [activeSidebarEditor, setActiveSidebarEditor] = useState("");
  const [expandedToolkitPanel, setExpandedToolkitPanel] = useState("");
  const [expandedPrimaryPanel, setExpandedPrimaryPanel] = useState("");
  const [isScoringUnlocked, setIsScoringUnlocked] = useState(getScoringUnlocked);
  const latestLoadRequestRef = useRef(0);
  const latestScopeSignatureRef = useRef("");
  const triggerToolkitReloadRef = useRef(() => {});
  const scoringLockedTooltip =
    "Please submit your argumentative essay in the Writing Area first!!!";

  useEffect(() => {
    let isUnmounted = false;

    const loadToolkitContent = async ({ forceNotionFetch = false } = {}) => {
      const requestId = latestLoadRequestRef.current + 1;
      latestLoadRequestRef.current = requestId;
      const toolkitScope = buildToolkitScopeFromStorage();
      const scopeSignature = `${toolkitScope.studentName}::${toolkitScope.className}::${toolkitScope.topicName}`;
      const isScopeChanged = latestScopeSignatureRef.current !== scopeSignature;
      if (isScopeChanged) {
        latestScopeSignatureRef.current = scopeSignature;
        setWritingStageChecks(buildWritingStageChecks());
      }

      const savedKfSummary = readToolkitContentByScope("kfAnalysisData", toolkitScope);
      const savedOutline = readToolkitContentByScope("outlineData", toolkitScope);
      const savedNotes = readToolkitContentByScope("noteData", toolkitScope);
      const scopedEssayKey = buildEssayStorageKey(
        toolkitScope.studentName,
        toolkitScope.className,
        toolkitScope.topicName
      );
      const scopedEssay = localStorage.getItem(scopedEssayKey);
      const hasExplicitScope = Boolean(
        toolkitScope.studentName || toolkitScope.className || toolkitScope.topicName
      );
      const savedEssay = hasExplicitScope
        ? (scopedEssay ?? "")
        : (scopedEssay ||
          localStorage.getItem("essayData") ||
          localStorage.getItem("editorData") ||
          "");

      setKfSummaryContent(savedKfSummary);
      setOutlineContent(savedOutline);
      setNotesContent(savedNotes);
      setWritingStageChecks(
        buildWritingStageChecks({
          summaryValue: savedKfSummary,
          outlineValue: savedOutline,
          finalWritingValue: savedEssay,
        })
      );

      if (!toolkitScope.studentName || !toolkitScope.className || !toolkitScope.topicName) {
        setWritingStageChecks(buildWritingStageChecks());
        return;
      }
      if (!forceNotionFetch && !isScopeChanged) {
        return;
      }

      try {
        const notionData = await fetchToolkitFromNotion(toolkitScope);
        if (isUnmounted || latestLoadRequestRef.current !== requestId) {
          return;
        }
        if (!notionData) {
          setWritingStageChecks(buildWritingStageChecks());
          return;
        }

        const fetchedKfSummary =
          typeof notionData?.kfAnalysisContent === "string" ? notionData.kfAnalysisContent : "";
        const fetchedOutline =
          typeof notionData?.outlineContent === "string" ? notionData.outlineContent : "";
        const fetchedEssay =
          typeof notionData?.essayContent === "string" ? notionData.essayContent : "";
        const fetchedNotes =
          typeof notionData?.noteContent === "string" ? notionData.noteContent : "";

        setKfSummaryContent(fetchedKfSummary);
        setOutlineContent(fetchedOutline);
        setNotesContent(fetchedNotes);
        setWritingStageChecks(
          buildWritingStageChecks({
            summaryValue: fetchedKfSummary,
            outlineValue: fetchedOutline,
            finalWritingValue: fetchedEssay,
          })
        );
        writeToolkitContentByScope("kfAnalysisData", fetchedKfSummary, toolkitScope);
        writeToolkitContentByScope("outlineData", fetchedOutline, toolkitScope);
        writeToolkitContentByScope("noteData", fetchedNotes, toolkitScope);
      } catch (error) {
        if (isUnmounted) return;
        console.error("Failed to fetch sidebar toolkit content from Notion:", error);
      }
    };

    const handleLoadToolkitContent = (forceNotionFetch = false) => {
      void loadToolkitContent({ forceNotionFetch });
    };
    triggerToolkitReloadRef.current = handleLoadToolkitContent;

    handleLoadToolkitContent(true);
    const onWindowFocus = () => handleLoadToolkitContent(true);
    const onWindowStorage = () => handleLoadToolkitContent(false);
    const onToolkitStorageUpdated = () => handleLoadToolkitContent(false);
    const scopeWatcherInterval = window.setInterval(() => {
      handleLoadToolkitContent(false);
    }, 1000);

    window.addEventListener("focus", onWindowFocus);
    window.addEventListener("storage", onWindowStorage);
    window.addEventListener(RAGFLOW_TOOLKIT_STORAGE_EVENT, onToolkitStorageUpdated);
    return () => {
      isUnmounted = true;
      window.clearInterval(scopeWatcherInterval);
      window.removeEventListener("focus", onWindowFocus);
      window.removeEventListener("storage", onWindowStorage);
      window.removeEventListener(RAGFLOW_TOOLKIT_STORAGE_EVENT, onToolkitStorageUpdated);
      triggerToolkitReloadRef.current = () => {};
    };
  }, []);

  useEffect(() => {
    const refreshScoringUnlockState = () => {
      setIsScoringUnlocked(getScoringUnlocked());
    };

    refreshScoringUnlockState();
    const onWindowFocus = () => refreshScoringUnlockState();
    const onWindowStorage = () => refreshScoringUnlockState();
    const lockWatcherInterval = window.setInterval(() => {
      refreshScoringUnlockState();
    }, 1000);

    window.addEventListener("focus", onWindowFocus);
    window.addEventListener("storage", onWindowStorage);
    return () => {
      window.clearInterval(lockWatcherInterval);
      window.removeEventListener("focus", onWindowFocus);
      window.removeEventListener("storage", onWindowStorage);
    };
  }, []);

  const studentName = useMemo(() => {
    return (
      localStorage.getItem("name") ||
      localStorage.getItem("username") ||
      localStorage.getItem("userName") ||
      "-"
    );
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("token");
    navigate("/");
  };

  const copyTextToClipboard = async (content) => {
    if (!content) return;

    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(content);
      return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = content;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  };

  const handleToggleToolkitPanel = (panelKey) => {
    setActiveSidebarEditor("");
    const shouldExpand = expandedToolkitPanel !== panelKey;
    setExpandedToolkitPanel(shouldExpand ? panelKey : "");
    if (shouldExpand && panelKey === "kf-summary") {
      triggerToolkitReloadRef.current(true);
    }
  };

  const handleCopySidebarContent = async (content, label) => {
    if (!content.trim()) {
      alert(`${label} 目前是空的，沒有可複製內容。`);
      return;
    }

    try {
      await copyTextToClipboard(content);
      alert(`${label} 已複製。`);
    } catch (error) {
      console.error(`Copy failed for ${label}:`, error);
      alert(`${label} 複製失敗，請稍後再試。`);
    }
  };

  const renderEditableMarkdownPanel = ({ fieldKey, value, onUpdate, placeholder }) => {
    if (activeSidebarEditor === fieldKey) {
      return (
        <textarea
          value={value}
          autoFocus
          onBlur={() => setActiveSidebarEditor("")}
          onChange={(event) => onUpdate(event.target.value)}
          style={{
            width: "100%",
            height: "150px",
            border: "1px solid #9e9e9e",
            backgroundColor: "#ffffff",
            padding: "8px",
            boxSizing: "border-box",
            resize: "none",
            fontSize: "14px",
            fontFamily: "inherit",
          }}
        />
      );
    }

    return (
      <div
        onClick={() => setActiveSidebarEditor(fieldKey)}
        style={{
          width: "100%",
          height: "150px",
          border: "1px solid #9e9e9e",
          backgroundColor: "#ffffff",
          padding: "8px",
          boxSizing: "border-box",
          overflowY: "auto",
          cursor: "text",
          fontSize: "14px",
          lineHeight: 1.4,
        }}
      >
        {value.trim() ? (
          <RagflowMarkdown content={value} />
        ) : (
          <span style={{ color: "#94a3b8" }}>{placeholder}</span>
        )}
      </div>
    );
  };

  const renderMenuButton = (menu) => {
    const isScoringMenu = menu.key === "scoring";
    const isScoringLocked = isScoringMenu && !isScoringUnlocked;

    return (
      <button
        key={menu.key}
        type="button"
        onClick={() => {
          if (isScoringLocked) return;
          menu.action(navigate);
        }}
        title={isScoringLocked ? scoringLockedTooltip : undefined}
        aria-disabled={isScoringLocked}
        style={{
          width: "100%",
          border: "none",
          background: "transparent",
          borderRadius: "10px",
          padding: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          textAlign: "left",
          color: isScoringLocked ? "#64748b" : "#1a1a1a",
          cursor: isScoringLocked ? "not-allowed" : "pointer",
          opacity: isScoringLocked ? 0.65 : 1,
          fontSize: "14px",
        }}
      >
        <img src={menu.icon} alt={menu.label} style={{ width: "24px", height: "24px" }} />
        <span>{menu.label}</span>
      </button>
    );
  };

  const renderPrimaryMenuButton = (menu) => {
    if (!menu.children?.length) {
      return renderMenuButton(menu);
    }

    const isExpandedPanel = expandedPrimaryPanel === menu.key;
    return (
      <div key={menu.key} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <button
          type="button"
          onClick={() => setExpandedPrimaryPanel((prev) => (prev === menu.key ? "" : menu.key))}
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            borderRadius: "10px",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            textAlign: "left",
            color: "#1a1a1a",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img src={menu.icon} alt={menu.label} style={{ width: "24px", height: "24px" }} />
            <span>{menu.label}</span>
          </div>
          <img
            src={ExpandIcon}
            alt={`${menu.label}-expand`}
            style={{
              width: "20px",
              height: "20px",
              transform: isExpandedPanel ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        </button>
        {isExpandedPanel && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              paddingLeft: "40px",
              paddingRight: "8px",
            }}
          >
            {menu.children.map((child) => (
              <button
                key={child.key}
                type="button"
                onClick={() => child.action(navigate)}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  borderRadius: "8px",
                  padding: "6px 8px",
                  textAlign: "left",
                  color: "#334155",
                  cursor: "pointer",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {child.icon ? (
                  <img src={child.icon} alt={child.label} style={{ width: "16px", height: "16px" }} />
                ) : null}
                <span>{child.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const toolkitMenus = SIDEBAR_TOOLKIT_MENUS.map((menu) => ({
    ...menu,
    value:
      menu.key === "kf-summary"
        ? kfSummaryContent
        : menu.key === "writing-outline"
          ? outlineContent
          : notesContent,
    placeholder: menu.key === "notes-area" ? "點擊即可編輯 Notes Area" : "",
    onUpdate: (nextValue) => {
      const toolkitScope = buildToolkitScopeFromStorage();
      if (menu.key === "kf-summary") {
        setKfSummaryContent(nextValue);
        writeToolkitContentByScope("kfAnalysisData", nextValue, toolkitScope);
        return;
      }
      if (menu.key === "writing-outline") {
        setOutlineContent(nextValue);
        writeToolkitContentByScope("outlineData", nextValue, toolkitScope);
        return;
      }
      setNotesContent(nextValue);
      writeToolkitContentByScope("noteData", nextValue, toolkitScope);
    },
  }));

  return (
    <div
      style={{
        width: isSidebarExpanded ? "430px" : "70px",
        minWidth: isSidebarExpanded ? "430px" : "70px",
        backgroundColor: "rgba(105, 83, 83, 0.05)",
        borderRight: "1px solid #d7d0c9",
        transition: "width 0.2s ease",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <button
        type="button"
        onClick={() => {
          setIsSidebarExpanded((prev) => !prev);
          setActiveSidebarEditor("");
          setExpandedToolkitPanel("");
        }}
        style={{
          width: "100%",
          border: "none",
          background: "transparent",
          padding: isSidebarExpanded ? "10px 8px" : "10px 0",
          display: "flex",
          justifyContent: isSidebarExpanded ? "flex-start" : "center",
          cursor: "pointer",
        }}
      >
        <img
          src={isSidebarExpanded ? LeftArrowIcon : HamburgerLineIcon}
          alt="menu-toggle"
          style={{ width: "24px", height: "24px" }}
        />
      </button>

      {isSidebarExpanded && (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "0 8px 8px" }}>
          <div style={{ padding: "0 8px 6px", fontSize: "16px", fontWeight: 700, color: "#222" }}>
            Main menu
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {SIDEBAR_PRIMARY_MENUS.map((menu) => renderPrimaryMenuButton(menu))}
          </div>
          <div style={{ padding: "8px 8px 6px", fontSize: "16px", fontWeight: 700, color: "#222" }}>
            Writing Toolkit
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {toolkitMenus.map((toolkit) => {
              const isExpandedPanel = expandedToolkitPanel === toolkit.key;
              return (
                <div key={toolkit.key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => handleToggleToolkitPanel(toolkit.key)}
                    style={{
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      borderRadius: "10px",
                      padding: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      textAlign: "left",
                      color: "#1a1a1a",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <img src={toolkit.icon} alt={toolkit.label} style={{ width: "24px", height: "24px" }} />
                      <span>{toolkit.label}</span>
                    </div>
                    <img
                      src={ExpandIcon}
                      alt={`${toolkit.label}-expand`}
                      style={{
                        width: "20px",
                        height: "20px",
                        transform: isExpandedPanel ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  </button>

                  {isExpandedPanel && (
                    <div style={{ padding: "0 6px 8px" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "4px" }}>
                        <button
                          type="button"
                          onClick={() => handleCopySidebarContent(toolkit.value, toolkit.label)}
                          disabled={!toolkit.value.trim()}
                          style={{
                            border: "none",
                            background: "transparent",
                            padding: 0,
                            cursor: toolkit.value.trim() ? "pointer" : "not-allowed",
                            opacity: toolkit.value.trim() ? 1 : 0.4,
                            lineHeight: 0,
                          }}
                          title={`複製 ${toolkit.label}`}
                        >
                          <img src={CopyIcon} alt={`copy-${toolkit.key}`} style={{ width: "22px", height: "22px" }} />
                        </button>
                      </div>
                      {renderEditableMarkdownPanel({
                        fieldKey: toolkit.key,
                        value: toolkit.value,
                        onUpdate: toolkit.onUpdate,
                        placeholder: toolkit.placeholder,
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <WritingStageStepper checkedStages={writingStageChecks} />

          <div
            style={{
              marginTop: "auto",
              paddingTop: "8px",
              borderTop: "1px solid #d7d0c9",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {SIDEBAR_SECONDARY_MENUS.map((menu) => renderMenuButton(menu))}

            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: "100%",
                border: "none",
                background: "transparent",
                borderRadius: "10px",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textAlign: "left",
                color: "#1a1a1a",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              <img src={LogoutIcon} alt="logout" style={{ width: "24px", height: "24px" }} />
              <span>logout</span>
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px",
                color: "#1a1a1a",
                fontSize: "14px",
              }}
            >
              <img src={AvatarIcon} alt="user-avatar" style={{ width: "24px", height: "24px" }} />
              <span>{studentName}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
