import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RagflowMarkdown from "./RagflowMarkdown";

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
import AvatarIcon from "../assets/頭像.png";

const SIDEBAR_PRIMARY_MENUS = [
  {
    key: "kf-argument",
    icon: StudentFeature1Icon,
    label: "KF Argumentation",
    action: () => window.open("https://kf6.nccu.edu.tw/", "_blank", "noopener,noreferrer"),
  },
  {
    key: "chatbot",
    icon: StudentFeature2Icon,
    label: "Chatbot",
    action: (navigate) => navigate("/Chatbot"),
  },
  {
    key: "writing-area",
    icon: StudentFeature3Icon,
    label: "Writing Area",
    action: (navigate) => navigate("/writing_area"),
  },
  {
    key: "scoring",
    icon: StudentFeature4Icon,
    label: "Scoring",
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

export default function StudentLeftSidebar() {
  const navigate = useNavigate();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [kfSummaryContent, setKfSummaryContent] = useState("");
  const [outlineContent, setOutlineContent] = useState("");
  const [notesContent, setNotesContent] = useState("");
  const [activeSidebarEditor, setActiveSidebarEditor] = useState("");
  const [expandedToolkitPanel, setExpandedToolkitPanel] = useState("");

  useEffect(() => {
    const loadToolkitContent = () => {
      setKfSummaryContent(localStorage.getItem("kfAnalysisData") || "");
      setOutlineContent(localStorage.getItem("outlineData") || "");
      setNotesContent(localStorage.getItem("noteData") || "");
    };

    loadToolkitContent();
    window.addEventListener("focus", loadToolkitContent);
    window.addEventListener("storage", loadToolkitContent);
    return () => {
      window.removeEventListener("focus", loadToolkitContent);
      window.removeEventListener("storage", loadToolkitContent);
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
    setExpandedToolkitPanel((prev) => (prev === panelKey ? "" : panelKey));
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
    return (
      <button
        key={menu.key}
        type="button"
        onClick={() => menu.action(navigate)}
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
        <img src={menu.icon} alt={menu.label} style={{ width: "24px", height: "24px" }} />
        <span>{menu.label}</span>
      </button>
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
      if (menu.key === "kf-summary") {
        setKfSummaryContent(nextValue);
        localStorage.setItem("kfAnalysisData", nextValue);
        return;
      }
      if (menu.key === "writing-outline") {
        setOutlineContent(nextValue);
        localStorage.setItem("outlineData", nextValue);
        return;
      }
      setNotesContent(nextValue);
      localStorage.setItem("noteData", nextValue);
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
            {SIDEBAR_PRIMARY_MENUS.map((menu) => renderMenuButton(menu))}
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
