import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Tooltip,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar_Student";
import questionIcon from "../assets/question.png";
import copyIcon from "../assets/複製.png";
import "./CorrectEssays.css";

const apiAxios = axios.create({
  baseURL: "http://140.115.126.27:4000",
  timeout: 10000,
});

apiAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const notionApiBases = [
  process.env.REACT_APP_NOTION_API_BASE_URL,
  "/notion-api",
  "http://140.115.126.27:4000",
  "http://localhost:4000",
].filter((base) => typeof base === "string" && base.trim() !== "");

const RAGFLOW_API_SERVER = String(process.env.REACT_APP_RAGFLOW_API_SERVER || "https://wu-ragflow.zeabur.app").replace(/\/+$/, "");
const RAGFLOW_API_KEY = String(process.env.REACT_APP_RAGFLOW_API_KEY || "ragflow-E5MjJlMmFlMWMxMTExZjFiZjJkYTYxNz").trim();
const RAGFLOW_AI_GRADING_AGENT_ID = "63c9cda0496e11f180c3a61716fb138a";

const normalizeScopeValue = (value) => String(value ?? "").replace(/\u3000/g, " ").trim().toLowerCase();

const pickLatestRow = (rows) =>
  [...rows].sort((a, b) => new Date(b?.submissionDate || 0).getTime() - new Date(a?.submissionDate || 0).getTime())[0];

const normalizeStudentList = (list) => {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const normalized = [];
  list.forEach((item) => {
    const student = String(item || "").trim();
    if (!student) return;
    const key = normalizeScopeValue(student);
    if (!key || seen.has(key)) return;
    seen.add(key);
    normalized.push(student);
  });
  return normalized;
};

const buildStudentListFromRows = (rows, topicName) => {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const latestByStudent = new Map();
  rows.forEach((row) => {
    const rowName = String(row?.studentName || "").trim();
    if (!rowName) return;
    if (normalizeScopeValue(row?.theme) !== normalizeScopeValue(topicName)) return;

    const key = normalizeScopeValue(rowName);
    const rowTime = new Date(row?.submissionDate || 0).getTime();
    const existing = latestByStudent.get(key);
    const existingTime = new Date(existing?.submissionDate || 0).getTime();
    if (!existing || rowTime >= existingTime) {
      latestByStudent.set(key, row);
    }
  });

  return [...latestByStudent.values()]
    .sort((a, b) => new Date(b?.submissionDate || 0).getTime() - new Date(a?.submissionDate || 0).getTime())
    .map((item) => String(item?.studentName || "").trim())
    .filter(Boolean);
};

const fetchStudentsByClassFromNotion = async (className) => {
  const token = localStorage.getItem("jwtToken");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let lastError = null;

  for (const base of notionApiBases) {
    const normalizedBase = String(base || "").replace(/\/+$/, "");
    if (!normalizedBase) continue;

    try {
      const response = await axios.get(
        `${normalizedBase}/api/get-students-by-class/${encodeURIComponent(className)}`,
        {
          timeout: 12000,
          headers,
          withCredentials: false,
        }
      );

      const rows = response?.data?.data;
      if (response?.data?.success && Array.isArray(rows)) {
        return rows;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Failed to fetch students by class from Notion");
};

const fetchEssayByScopeFromNotion = async ({ studentName, className, theme }) => {
  const token = localStorage.getItem("jwtToken");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let lastError = null;

  for (const base of notionApiBases) {
    const normalizedBase = String(base || "").replace(/\/+$/, "");
    if (!normalizedBase) continue;

    try {
      const response = await axios.get(`${normalizedBase}/api/get-essay/${encodeURIComponent(studentName)}`, {
        timeout: 15000,
        headers,
        withCredentials: false,
        params: { className, theme },
      });

      if (response?.data?.success) {
        return response.data.data || {};
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Failed to fetch scoped essay from Notion");
};

const updateNoteToNotion = async (payload) => {
  const token = localStorage.getItem("jwtToken");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let lastError = null;

  for (const base of notionApiBases) {
    const normalizedBase = String(base || "").replace(/\/+$/, "");
    if (!normalizedBase) continue;

    try {
      const response = await axios.patch(`${normalizedBase}/api/update-note`, payload, {
        timeout: 15000,
        headers,
        withCredentials: false,
      });

      if (response?.data?.success) {
        return response.data;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Failed to update note to Notion");
};

const selectStyle = {
  width: "300px",
  height: "42px",
  background: "#ffffff",
  borderRadius: "8px",
  fontSize: "15px",
  "& .MuiSelect-select": {
    padding: "9px 12px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#d4dbe4",
  },
};

const scoreFieldSx = {
  width: "88px",
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    height: "42px",
    fontSize: "17px",
    "& input": {
      textAlign: "center",
      padding: "9px 6px",
      fontWeight: 600,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#d4dbe4",
    },
  },
};

const questionIconStyle = {
  width: "16px",
  height: "16px",
  cursor: "help",
  display: "block",
};

const scoreHelpTitleSx = {
  fontSize: "15px",
  fontWeight: 700,
  marginBottom: "6px",
};

const scoreHelpTextSx = {
  fontSize: "13px",
  lineHeight: 1.45,
};

const claimsScoreHelp = [
  "0: No clear position",
  "1: A position is present but unclear or vague",
  "2: Clear and specific position",
];

const groundsScoreHelp = [
  "0: No reasons or evidence",
  "1: Simple reason with little or no explanation",
  "2: Some reasons, but not fully developed or unclear",
  "3: Clear reasons with examples or explanation",
  "4: Strong, well-developed reasons with specific and convincing evidence",
];

const rebuttalsScoreHelp = [
  "0: No counterargument mentioned",
  "1: Counterargument is mentioned but weakly addressed",
  "2: Clear counterargument with an effective rebuttal",
];

const roundButtonStyle = {
  textTransform: "none",
  borderRadius: "8px",
  borderColor: "#a6b5c7",
  color: "#26425d",
  background: "#ffffff",
  padding: "8px 16px",
  minWidth: "108px",
  fontSize: "15px",
  fontWeight: 600,
  lineHeight: 1.2,
};

const decodeHtmlEntities = (text) => {
  if (typeof window === "undefined") return text;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
};

const normalizeEssayContentForDisplay = (value) => {
  const content = String(value ?? "");
  if (!content.trim()) return "";

  const hasHtmlTag = /<\/?[a-z][\s\S]*>/i.test(content);
  const hasHtmlEntity = /&(?:[a-z\d]+|#\d+|#x[a-f\d]+);/i.test(content);
  if (!hasHtmlTag && !hasHtmlEntity) return content;

  const withLineBreaks = content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|blockquote|tr)>/gi, "\n")
    .replace(/<li>/gi, "• ");

  const withoutTags = withLineBreaks.replace(/<[^>]+>/g, "");
  return decodeHtmlEntities(withoutTags)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const extractJsonText = (rawText) => {
  const text = String(rawText || "").trim();
  if (!text) return "";

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const objectLike = text.match(/\{[\s\S]*\}/);
  if (objectLike?.[0]) return objectLike[0];

  return "";
};

const normalizeFeedbackBlock = (value) => String(value || "").replace(/\r\n/g, "\n").trim();

const clampScore = (value, min, max) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "";
  return String(Math.min(max, Math.max(min, Math.round(num))));
};

const createEmptyScoreSet = () => ({
  claimsScore: "",
  groundsScore: "",
  rebuttalsScore: "",
});

const hasOwnKey = (target, key) => Object.prototype.hasOwnProperty.call(target, key);

const computeTotalFromScores = (scoreSet = {}) => {
  const claims = Number.isNaN(Number(scoreSet?.claimsScore)) ? 0 : Number(scoreSet?.claimsScore || 0);
  const grounds = Number.isNaN(Number(scoreSet?.groundsScore)) ? 0 : Number(scoreSet?.groundsScore || 0);
  const rebuttals = Number.isNaN(Number(scoreSet?.rebuttalsScore)) ? 0 : Number(scoreSet?.rebuttalsScore || 0);
  return claims + grounds + rebuttals;
};

const parseScoreObject = (scoreInput) => {
  const score = scoreInput && typeof scoreInput === "object" ? scoreInput : {};
  return {
    claimsScore: clampScore(
      score.claimsScore ?? score.claims ?? score.Claims ?? score.claim ?? score.Claim,
      0,
      2
    ),
    groundsScore: clampScore(
      score.groundsScore ?? score.grounds ?? score.Grounds ?? score.ground ?? score.Ground,
      0,
      4
    ),
    rebuttalsScore: clampScore(
      score.rebuttalsScore ?? score.rebuttals ?? score.Rebuttals ?? score.rebuttal ?? score.Rebuttal,
      0,
      2
    ),
  };
};

const parseScoresFromText = (text) => {
  const sourceText = String(text || "");
  const claimsMatch = sourceText.match(/(?:Claims?|主張|立場)\s*[：:]\s*(-?\d+(?:\.\d+)?)/i);
  const groundsMatch = sourceText.match(/(?:Grounds?|Ground|理由|論據)\s*[：:]\s*(-?\d+(?:\.\d+)?)/i);
  const rebuttalMatch = sourceText.match(/(?:Rebuttals?|Rebuttal|反駁)\s*[：:]\s*(-?\d+(?:\.\d+)?)/i);
  return {
    claimsScore: clampScore(claimsMatch?.[1], 0, 2),
    groundsScore: clampScore(groundsMatch?.[1], 0, 4),
    rebuttalsScore: clampScore(rebuttalMatch?.[1], 0, 2),
  };
};

const extractLabeledBlock = (text, label, nextLabels = []) => {
  const sourceText = String(text || "");
  const nextSectionPart =
    Array.isArray(nextLabels) && nextLabels.length > 0
      ? `(?=\\n\\s*(?:${nextLabels.join("|")})\\s*[：:]|$)`
      : "$";
  const pattern = new RegExp(`${label}\\s*[：:]\\s*([\\s\\S]*?)${nextSectionPart}`, "i");
  const match = sourceText.match(pattern);
  return normalizeFeedbackBlock(match?.[1] || "");
};

const extractByLabels = (text, labels = [], nextLabels = []) => {
  for (const label of labels) {
    const found = extractLabeledBlock(text, label, nextLabels);
    if (found) return found;
  }
  return "";
};

const buildFeedbackTextFromParsed = ({ overall, keyPoints, details, suggestions }) => {
  const sections = [];
  if (overall) sections.push(`Overall Feedback:\n${overall}`);
  if (keyPoints) sections.push(`Key Improvement Focus:\n${keyPoints}`);
  if (details) sections.push(`Detailed Feedback:\n${details}`);
  if (suggestions) sections.push(`Suggested Improvements:\n${suggestions}`);
  return sections.join("\n\n").trim();
};

const formatDetailedFeedback = (detailsInput) => {
  if (!detailsInput) return "";

  let claims = "";
  let grounds = "";
  let rebuttals = "";

  if (typeof detailsInput === "object" && detailsInput !== null) {
    claims = normalizeFeedbackBlock(
      detailsInput.claims ?? detailsInput.Claims ?? detailsInput["主張"] ?? detailsInput["立場"]
    );
    grounds = normalizeFeedbackBlock(
      detailsInput.grounds ?? detailsInput.Grounds ?? detailsInput["理由"] ?? detailsInput["證據"]
    );
    rebuttals = normalizeFeedbackBlock(
      detailsInput.rebuttals ?? detailsInput.Rebuttals ?? detailsInput["反駁"]
    );
  } else {
    const text = String(detailsInput || "");
    const sanitizeDetail = (value) => {
      return normalizeFeedbackBlock(value)
        .replace(/^\s*(?:\d+\.)?\s*(?:Claims?|Grounds?|Rebuttals?)\s*[:：]?\s*/i, "")
        .replace(/\n\s*(?:\d+\.)?\s*(?:Claims?|Grounds?|Rebuttals?)\s*$/gi, "")
        .replace(/\n\s*(?:\d+\.)?\s*(?:Claims?|Grounds?|Rebuttals?)\s*\n?/gi, "\n")
        .trim();
    };

    const numberedPattern = /(?:^|\n)\s*1\.\s*Claims?\s*:?\s*([\s\S]*?)(?=\n\s*2\.\s*Grounds?\s*:?\s*|$)/i;
    const groundsPattern = /(?:^|\n)\s*2\.\s*Grounds?\s*:?\s*([\s\S]*?)(?=\n\s*3\.\s*Rebuttals?\s*:?\s*|$)/i;
    const rebuttalsPattern = /(?:^|\n)\s*3\.\s*Rebuttals?\s*:?\s*([\s\S]*?)$/i;

    const numberedClaims = text.match(numberedPattern)?.[1];
    const numberedGrounds = text.match(groundsPattern)?.[1];
    const numberedRebuttals = text.match(rebuttalsPattern)?.[1];

    const extractDetailItem = (sourceText, labelPattern) => {
      const pattern = new RegExp(
        `(?:^|\\n)\\s*(?:\\d+\\.)?\\s*(?:${labelPattern})\\s*[：:]\\s*([\\s\\S]*?)(?=\\n\\s*(?:\\d+\\.)?\\s*(?:Claims?|Grounds?|Ground|Rebuttals?|Rebuttal|主張|立場|理由|證據|論據|反駁)\\s*[：:]|$)`,
        "i"
      );
      return sourceText.match(pattern)?.[1] || "";
    };

    claims = sanitizeDetail(
      numberedClaims || extractDetailItem(text, "Claims?|主張|立場")
    );
    grounds = sanitizeDetail(
      numberedGrounds || extractDetailItem(text, "Grounds?|Ground|理由|證據|論據")
    );
    rebuttals = sanitizeDetail(
      numberedRebuttals || extractDetailItem(text, "Rebuttals?|Rebuttal|反駁")
    );
  }

  return [
    `1. Claims${claims ? `: ${claims}` : ""}`,
    `2. Grounds${grounds ? `: ${grounds}` : ""}`,
    `3. Rebuttals${rebuttals ? `: ${rebuttals}` : ""}`,
  ].join("\n");
};

const parseAiReply = (rawReplyText) => {
  const rawText = String(rawReplyText || "").trim();
  if (!rawText) {
    return {
      feedbackText: "",
      claimsScore: "",
      groundsScore: "",
      rebuttalsScore: "",
      sections: { overall: "", keyPoints: "", details: "", suggestions: "" },
    };
  }

  let feedbackText = "";
  let claimsScore = "";
  let groundsScore = "";
  let rebuttalsScore = "";

  const jsonText = extractJsonText(rawText);
  if (jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      const overall = normalizeFeedbackBlock(parsed?.整體回饋 ?? parsed?.overall_feedback ?? parsed?.overallFeedback);
      const keyPointsRaw =
        parsed?.主要改進重點 ??
        parsed?.main_improvements ??
        parsed?.key_improvements ??
        parsed?.key_improvement_focus ??
        parsed?.mainImprovementPoints;
      const keyPoints = Array.isArray(keyPointsRaw)
        ? keyPointsRaw
            .map((item) => String(item || "").trim())
            .filter(Boolean)
            .map((item, index) => `${index + 1}. ${item}`)
            .join("\n")
        : normalizeFeedbackBlock(keyPointsRaw);
      const detailsRaw = parsed?.細部回饋 ?? parsed?.detailed_feedback ?? parsed?.detailedFeedback;
      const details = formatDetailedFeedback(detailsRaw);
      const suggestionsRaw =
        parsed?.修改建議 ??
        parsed?.revision_suggestions ??
        parsed?.revisionSuggestions ??
        parsed?.suggested_improvements;
      const suggestions = Array.isArray(suggestionsRaw)
        ? suggestionsRaw
            .map((item) => String(item || "").trim())
            .filter(Boolean)
            .map((item, index) => `${index + 1}. ${item}`)
            .join("\n")
        : normalizeFeedbackBlock(suggestionsRaw);
      feedbackText = buildFeedbackTextFromParsed({ overall, keyPoints, details, suggestions });

      const parsedScores = parseScoreObject(parsed?.評分 ?? parsed?.scores ?? parsed?.score);
      claimsScore = parsedScores.claimsScore;
      groundsScore = parsedScores.groundsScore;
      rebuttalsScore = parsedScores.rebuttalsScore;
    } catch {
      // Fallback to text label parser below.
    }
  }

  if (!feedbackText) {
    const sectionLabels = [
      "整體回饋",
      "Overall Feedback",
      "主要改進重點",
      "Key Improvement Focus",
      "細部回饋",
      "Detailed Feedback",
      "修改建議",
      "Suggested Improvements",
      "評分",
      "Score",
      "Scores",
    ];
    const overall = extractByLabels(rawText, ["整體回饋", "Overall Feedback"], sectionLabels.slice(2));
    const keyPoints = extractByLabels(rawText, ["主要改進重點", "Key Improvement Focus"], sectionLabels.slice(4));
    const details = formatDetailedFeedback(
      extractByLabels(rawText, ["細部回饋", "Detailed Feedback"], sectionLabels.slice(6))
    );
    const suggestions = extractByLabels(rawText, ["修改建議", "Suggested Improvements"], sectionLabels.slice(8));
    feedbackText = buildFeedbackTextFromParsed({ overall, keyPoints, details, suggestions });
  }

  if (!claimsScore || !groundsScore || !rebuttalsScore) {
    const scoreSection = extractLabeledBlock(rawText, "評分");
    const parsedFromText = parseScoresFromText(scoreSection || rawText);
    claimsScore = claimsScore || parsedFromText.claimsScore;
    groundsScore = groundsScore || parsedFromText.groundsScore;
    rebuttalsScore = rebuttalsScore || parsedFromText.rebuttalsScore;
  }

  return {
    feedbackText: feedbackText || rawText,
    claimsScore,
    groundsScore,
    rebuttalsScore,
    sections: {
      overall: extractByLabels(
        feedbackText || rawText,
        ["整體回饋", "Overall Feedback"],
        ["主要改進重點", "Key Improvement Focus", "細部回饋", "Detailed Feedback", "修改建議", "Suggested Improvements", "評分", "Score", "Scores"]
      ),
      keyPoints: extractByLabels(
        feedbackText || rawText,
        ["主要改進重點", "Key Improvement Focus"],
        ["細部回饋", "Detailed Feedback", "修改建議", "Suggested Improvements", "評分", "Score", "Scores"]
      ),
      details: formatDetailedFeedback(
        extractByLabels(
          feedbackText || rawText,
          ["細部回饋", "Detailed Feedback"],
          ["修改建議", "Suggested Improvements", "評分", "Score", "Scores"]
        )
      ),
      suggestions: extractByLabels(
        feedbackText || rawText,
        ["修改建議", "Suggested Improvements"],
        ["評分", "Score", "Scores"]
      ),
    },
  };
};

const buildAiGradingPrompt = ({ className, topicName, studentName, essayContent }) => {
  return [
    "You are an English argumentative essay evaluator.",
    "Return ALL feedback in English only.",
    `Class: ${className || "-"}`,
    `Topic: ${topicName || "-"}`,
    `Student: ${studentName || "-"}`,
    "",
    "Scoring rules:",
    "- Claims: 0~2",
    "- Ground: 0~4",
    "- Rebuttal: 0~2",
    "",
    "Output STRICT JSON only. No markdown fence. No extra text.",
    "Use this exact schema and key names:",
    '{"overall_feedback":"...", "key_improvement_focus":["...", "..."], "detailed_feedback":{"Claims":"...", "Grounds":"...", "Rebuttals":"..."}, "suggested_improvements":["...", "..."], "scores":{"Claims":0, "Ground":0, "Rebuttal":0}}',
    "Do not repeat items. Each detailed_feedback field must appear exactly once.",
    "",
    "Essay:",
    essayContent,
  ].join("\n");
};

const buildEnglishFeedbackFromSections = (sections) => {
  const overall = normalizeFeedbackBlock(sections?.overall);
  const keyPoints = normalizeFeedbackBlock(sections?.keyPoints);
  const details = normalizeFeedbackBlock(sections?.details);
  const suggestions = normalizeFeedbackBlock(sections?.suggestions);

  const lines = [];
  if (overall) lines.push(`Overall Feedback:\n${overall}`);
  if (keyPoints) lines.push(`Key Improvement Focus:\n${keyPoints}`);
  if (details) lines.push(`Detailed Feedback:\n${details}`);
  if (suggestions) lines.push(`Suggested Improvements:\n${suggestions}`);
  return lines.join("\n\n").trim();
};

const extractDetailedCommentItems = (detailsText) => {
  const text = String(detailsText || "");
  const extractItem = (labelPattern) => {
    const pattern = new RegExp(
      `(?:^|\\n)\\s*(?:\\d+\\.)?\\s*(?:${labelPattern})\\s*(?:\\([^\\n)]*\\))?\\s*:?[ \\t]*([\\s\\S]*?)(?=\\n\\s*(?:\\d+\\.)?\\s*(?:Claims?|Grounds?|Rebuttals?)\\b|$)`,
      "i"
    );
    const match = text.match(pattern);
    return normalizeFeedbackBlock(match?.[1] || "");
  };

  return {
    claimsComment: extractItem("Claims?"),
    groundsComment: extractItem("Grounds?|Ground"),
    rebuttalsComment: extractItem("Rebuttals?|Rebuttal"),
  };
};

export default function CorrectEssays() {
  const location = useLocation();
  const navigate = useNavigate();

  const studentName =
    location.state?.studentName || localStorage.getItem("selectedStudentName") || "Harry";
  const className = location.state?.className || localStorage.getItem("activityTitle") || "Class A";
  const topicName = location.state?.theme || location.state?.topicName || localStorage.getItem("groupName") || "-";
  const incomingStudentList = useMemo(
    () => normalizeStudentList(location.state?.studentList),
    [location.state?.studentList]
  );

  const [essayContent, setEssayContent] = useState("");
  const [kfAnalysisContent, setKfAnalysisContent] = useState("");
  const [chatHistoryContent, setChatHistoryContent] = useState([]);
  const [outlineContent, setOutlineContent] = useState("");
  const [studentList, setStudentList] = useState(() => incomingStudentList);
  const [matchedScope, setMatchedScope] = useState({
    className: "",
    studentName: "",
    theme: "",
  });
  const [humanComment, setHumanComment] = useState("");
  const [aiComment, setAiComment] = useState("");
  const [aiFeedbackSections, setAiFeedbackSections] = useState(null);

  const [teacherScores, setTeacherScores] = useState(createEmptyScoreSet);
  const [aiScores, setAiScores] = useState(createEmptyScoreSet);
  const [manualTotalScore, setManualTotalScore] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [gradingView, setGradingView] = useState("teacher");

  useEffect(() => {
    if (incomingStudentList.length > 0) {
      setStudentList(incomingStudentList);
    }
  }, [incomingStudentList]);

  const activeScores = gradingView === "teacher" ? teacherScores : aiScores;
  const { claimsScore, groundsScore, rebuttalsScore } = activeScores;

  const argumentScore = useMemo(() => {
    return computeTotalFromScores({ claimsScore, groundsScore, rebuttalsScore });
  }, [claimsScore, groundsScore, rebuttalsScore]);
  const displayEssayContent = useMemo(() => normalizeEssayContentForDisplay(essayContent), [essayContent]);

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const activeOverallComment = gradingView === "teacher" ? humanComment : aiComment;
  const renderedAiSections = useMemo(() => {
    if (aiFeedbackSections) return aiFeedbackSections;
    if (!aiComment) return null;
    return parseAiReply(aiComment).sections;
  }, [aiFeedbackSections, aiComment]);
  const resolvedCurrentStudentName = matchedScope.studentName || studentName;
  const currentStudentIndex = useMemo(() => {
    const currentKey = normalizeScopeValue(resolvedCurrentStudentName);
    if (!currentKey || studentList.length === 0) return -1;
    return studentList.findIndex((item) => normalizeScopeValue(item) === currentKey);
  }, [studentList, resolvedCurrentStudentName]);
  const hasPrevStudent = currentStudentIndex > 0;
  const hasNextStudent = currentStudentIndex >= 0 && currentStudentIndex < studentList.length - 1;

  const handleOverallCommentChange = (value) => {
    if (gradingView === "teacher") {
      setHumanComment(value);
      return;
    }
    setAiComment(value);
    setAiFeedbackSections(null);
  };

  const setActiveScoreField = (field, value) => {
    if (gradingView === "teacher") {
      setTeacherScores((prev) => ({ ...prev, [field]: value }));
      return;
    }
    setAiScores((prev) => ({ ...prev, [field]: value }));
  };

  const resetGradingFields = () => {
    setHumanComment("");
    setAiComment("");
    setAiFeedbackSections(null);
    setTeacherScores(createEmptyScoreSet());
    setAiScores(createEmptyScoreSet());
    setManualTotalScore("");
    setKfAnalysisContent("");
    setChatHistoryContent([]);
    setOutlineContent("");
  };

  const handleSwitchStudent = (step) => {
    if (!step || studentList.length === 0 || currentStudentIndex < 0) return;
    const targetIndex = currentStudentIndex + step;
    if (targetIndex < 0 || targetIndex >= studentList.length) return;
    const targetStudentName = studentList[targetIndex];

    navigate("/CorrectEssays", {
      replace: true,
      state: {
        studentName: targetStudentName,
        className,
        theme: topicName,
        studentList,
      },
    });
  };

  const handleCopyEssayContent = async () => {
    const contentToCopy = displayEssayContent.trim();
    if (!contentToCopy) {
      showSnackbar("No essay content to copy.", "warning");
      return;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(contentToCopy);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = contentToCopy;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (!copied) {
          throw new Error("execCommand copy failed");
        }
      }
      showSnackbar("Essay copied to clipboard.", "success");
    } catch (error) {
      console.error("Copy essay failed:", error);
      showSnackbar("Copy failed. Please copy manually.", "error");
    }
  };

  useEffect(() => {
    const fetchEssay = async () => {
      if (!studentName || !className || !topicName || topicName === "-") {
        showSnackbar("Missing class/topic/student context.", "warning");
        return;
      }

      setIsLoading(true);
      resetGradingFields();
      try {
        const classCandidates = [className, String(className || "").replace(/\u3000/g, " ").trim()].filter(
          (value, index, self) => value && self.indexOf(value) === index
        );
        let rows = [];
        let resolvedClassName = className;
        let lastClassError = null;
        for (const candidateClassName of classCandidates) {
          try {
            rows = await fetchStudentsByClassFromNotion(candidateClassName);
            resolvedClassName = candidateClassName;
            break;
          } catch (error) {
            lastClassError = error;
          }
        }
        if (!Array.isArray(rows) || rows.length === 0) {
          throw lastClassError || new Error("No Notion rows found for class");
        }
        if (incomingStudentList.length === 0) {
          const fallbackStudentList = buildStudentListFromRows(rows, topicName);
          if (fallbackStudentList.length > 0) {
            setStudentList(fallbackStudentList);
          }
        }

        const matchedRows = rows.filter(
          (item) =>
            normalizeScopeValue(item?.studentName) === normalizeScopeValue(studentName) &&
            normalizeScopeValue(item?.theme) === normalizeScopeValue(topicName)
        );

        if (matchedRows.length === 0) {
          setEssayContent("");
          setMatchedScope({ className: "", studentName: "", theme: "" });
          showSnackbar("Notion has no row matching this CLASS / STUDENT / TOPIC.", "warning");
          return;
        }

        const sortedMatchedRows = [pickLatestRow(matchedRows), ...matchedRows].filter(Boolean);
        const uniqueScopeKeys = new Set();
        const scopedCandidates = sortedMatchedRows.filter((item) => {
          const key = `${item?.studentName || ""}::${item?.theme || ""}`;
          if (uniqueScopeKeys.has(key)) return false;
          uniqueScopeKeys.add(key);
          return true;
        });

        let data = null;
        let matchedCandidate = null;
        let lastScopedError = null;
        for (const candidate of scopedCandidates) {
          const scopedStudentName = candidate?.studentName || studentName;
          const scopedTheme = candidate?.theme || topicName;
          try {
            data = await fetchEssayByScopeFromNotion({
              studentName: scopedStudentName,
              className: resolvedClassName,
              theme: scopedTheme,
            });
            matchedCandidate = candidate;
            break;
          } catch (error) {
            lastScopedError = error;
          }
        }

        if (!data) {
          throw lastScopedError || new Error("No scoped essay found for matched Notion rows");
        }

        setMatchedScope({
          className: resolvedClassName,
          studentName: matchedCandidate?.studentName || studentName,
          theme: matchedCandidate?.theme || topicName,
        });

        setEssayContent(data.essayContent || "");
        setKfAnalysisContent(String(data.kfAnalysisContent || ""));
        setChatHistoryContent(Array.isArray(data.chatHistory) ? data.chatHistory : []);
        setOutlineContent(String(data.outlineContent || ""));

        const teacherFeedbackFromDb = String(data?.teacherFeedback || data?.humanComment || "").trim();
        const aiFeedbackFromDb = String(data?.aiFeedback || data?.aiComment || "").trim();
        const topLevelScores = parseScoreObject({
          claimsScore: data?.claimsScore,
          groundsScore: data?.groundsScore,
          rebuttalsScore: data?.rebuttalsScore,
        });
        const aiTopLevelScores = parseScoreObject({
          claimsScore: data?.aiClaimsScore,
          groundsScore: data?.aiGroundsScore,
          rebuttalsScore: data?.aiRebuttalsScore,
        });
        const hasAiTopLevelScores =
          String(aiTopLevelScores.claimsScore || "").trim() !== "" ||
          String(aiTopLevelScores.groundsScore || "").trim() !== "" ||
          String(aiTopLevelScores.rebuttalsScore || "").trim() !== "";

        setHumanComment(teacherFeedbackFromDb);
        setAiComment(aiFeedbackFromDb);
        setAiFeedbackSections(null);
        setTeacherScores(topLevelScores);
        setAiScores(aiTopLevelScores);
        const totalScoreFromDb = String(data?.totalScore ?? "").trim();
        setManualTotalScore(totalScoreFromDb);

        const rawNote = data.noteContent || "";
        if (rawNote) {
          try {
            const parsed = JSON.parse(rawNote);
            const parsedGradingView = String(parsed?.gradingView || "").trim().toLowerCase();
            const hasTeacherCommentField = hasOwnKey(parsed, "teacherComment");
            const hasLegacyHumanCommentField = hasOwnKey(parsed, "humanComment");
            const hasTeacherScoresField = parsed?.teacherScores && typeof parsed.teacherScores === "object";
            const hasAiScoresField = parsed?.aiScores && typeof parsed.aiScores === "object";
            const hasModeSpecificScores = hasTeacherScoresField || hasAiScoresField;
            const legacyScores = parseScoreObject({
              claimsScore: parsed.claimsScore,
              groundsScore: parsed.groundsScore,
              rebuttalsScore: parsed.rebuttalsScore,
            });
            const parsedTeacherScores = parseScoreObject(parsed.teacherScores);
            const parsedAiScores = parseScoreObject(parsed.aiScores);

            const teacherCommentFromParsed = teacherFeedbackFromDb || (hasTeacherCommentField
              ? String(parsed.teacherComment || "")
              : parsedGradingView === "ai" && hasLegacyHumanCommentField
                ? ""
                : String(parsed.humanComment || ""));
            const aiCommentFromParsed = aiFeedbackFromDb ||
              String(parsed.aiComment || "").trim() ||
              (parsedGradingView === "ai" ? String(parsed.humanComment || "").trim() : "");

            setHumanComment(teacherCommentFromParsed);
            setAiComment(aiCommentFromParsed);
            setAiFeedbackSections(null);
            setTeacherScores(
              hasTeacherScoresField
                ? parsedTeacherScores
                : !hasModeSpecificScores && parsedGradingView !== "ai"
                  ? legacyScores
                  : createEmptyScoreSet()
            );
            setAiScores(
              hasAiTopLevelScores
                ? aiTopLevelScores
                : hasAiScoresField
                ? parsedAiScores
                : !hasModeSpecificScores && parsedGradingView === "ai"
                  ? legacyScores
                  : createEmptyScoreSet()
            );
            if (!totalScoreFromDb) {
              const parsedTotalScore = String(
                parsed?.finalTotalScore ?? parsed?.teacherTotalScore ?? ""
              ).trim();
              if (parsedTotalScore) {
                setManualTotalScore(parsedTotalScore);
              }
            }
          } catch {
            // Keep database column values as source of truth when note JSON is invalid.
          }
        }
      } catch (error) {
        console.error("Failed to load essay from Notion:", error);
        showSnackbar(`Load failed: ${error?.message || "unknown error"}`, "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEssay();
  }, [studentName, className, topicName]);

  const handleGenerateAiComment = async () => {
    if (!displayEssayContent.trim()) {
      showSnackbar("No essay content to grade.", "warning");
      return;
    }

    if (!RAGFLOW_API_KEY) {
      showSnackbar("RAGFLOW API key is missing.", "error");
      return;
    }

    setIsGeneratingAi(true);
    try {
      const userIdScope = [
        String(localStorage.getItem("userId") || "").trim() || "teacher",
        String(className || "").trim(),
        String(topicName || "").trim(),
        String(studentName || "").trim(),
      ]
        .filter(Boolean)
        .join("_");

      const createSessionResponse = await fetch(
        `${RAGFLOW_API_SERVER}/api/v1/agents/${RAGFLOW_AI_GRADING_AGENT_ID}/sessions?user_id=${encodeURIComponent(userIdScope)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RAGFLOW_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: `CorrectEssays-${className}-${topicName}-${studentName}`,
          }),
        }
      );
      const createSessionPayload = await createSessionResponse.json();
      if (!createSessionResponse.ok || createSessionPayload?.code !== 0) {
        throw new Error(createSessionPayload?.message || `Create RAGFLOW session failed: HTTP ${createSessionResponse.status}`);
      }

      const sessionId =
        createSessionPayload?.data?.id ||
        createSessionPayload?.data?.session_id ||
        createSessionPayload?.id ||
        createSessionPayload?.session_id;
      if (!sessionId) {
        throw new Error("RAGFLOW session id missing in response.");
      }

      const prompt = buildAiGradingPrompt({
        className,
        topicName,
        studentName: matchedScope.studentName || studentName,
        essayContent: displayEssayContent,
      });

      const completionResponse = await fetch(
        `${RAGFLOW_API_SERVER}/api/v1/agents/${RAGFLOW_AI_GRADING_AGENT_ID}/completions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RAGFLOW_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: prompt,
            session_id: sessionId,
            stream: false,
          }),
        }
      );
      const completionPayload = await completionResponse.json();
      if (!completionResponse.ok || completionPayload?.code !== 0) {
        throw new Error(completionPayload?.message || `RAGFLOW completion failed: HTTP ${completionResponse.status}`);
      }

      const rawReply =
        completionPayload?.data?.data?.content ||
        completionPayload?.data?.answer ||
        completionPayload?.answer ||
        "";

      const parsedReply = parseAiReply(rawReply);
      setAiComment(parsedReply.feedbackText || rawReply);
      setAiFeedbackSections(parsedReply.sections || null);
      setGradingView("ai");
      setAiScores((prev) => ({
        claimsScore: parsedReply.claimsScore !== "" ? parsedReply.claimsScore : prev.claimsScore,
        groundsScore: parsedReply.groundsScore !== "" ? parsedReply.groundsScore : prev.groundsScore,
        rebuttalsScore: parsedReply.rebuttalsScore !== "" ? parsedReply.rebuttalsScore : prev.rebuttalsScore,
      }));

      showSnackbar("AI feedback generated.", "success");
    } catch (error) {
      console.error("Generate AI feedback failed:", error);
      showSnackbar(`AI generation failed: ${error?.message || "unknown error"}`, "error");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = async () => {
    if (!studentName || !className || !topicName || topicName === "-") {
      showSnackbar("Missing class/topic/student context.", "error");
      return;
    }
    if (gradingView === "teacher" && !String(manualTotalScore || "").trim()) {
      showSnackbar("Total Score is required before submit.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitStudentName = matchedScope.studentName || studentName;
      const submitClassName = matchedScope.className || className;
      const submitTheme = matchedScope.theme || topicName;
      const isTeacherGradingSubmit = gradingView === "teacher";
      const aiSectionsForSubmit = renderedAiSections || parseAiReply(aiComment).sections || null;
      const teacherCommentForStorage = String(humanComment || "").trim();
      const aiCommentForStorage =
        buildEnglishFeedbackFromSections(aiSectionsForSubmit) || String(aiComment || "").trim();
      const teacherArgumentScore = String(computeTotalFromScores(teacherScores));
      const teacherTotalScore = String(manualTotalScore || "").trim();
      const aiTotalScore = computeTotalFromScores(aiScores);
      const teacherDetailsForSplit = normalizeFeedbackBlock(parseAiReply(teacherCommentForStorage).sections?.details);
      const aiDetailsForSplit = normalizeFeedbackBlock(aiSectionsForSubmit?.details);
      const teacherDetailComments = extractDetailedCommentItems(teacherDetailsForSplit);
      const aiDetailComments = extractDetailedCommentItems(aiDetailsForSplit);

      const notePayload = JSON.stringify({
        teacherComment: teacherCommentForStorage,
        humanComment: teacherCommentForStorage,
        aiComment: aiCommentForStorage,
        aiTotalScore,
        aiClaimsScore: aiScores.claimsScore,
        aiGroundsScore: aiScores.groundsScore,
        aiRebuttalsScore: aiScores.rebuttalsScore,
        aiClaimsComment: aiDetailComments.claimsComment,
        aiGroundsComment: aiDetailComments.groundsComment,
        aiRebuttalsComment: aiDetailComments.rebuttalsComment,
        claimsScore: teacherScores.claimsScore,
        groundsScore: teacherScores.groundsScore,
        rebuttalsScore: teacherScores.rebuttalsScore,
        claimsComment: teacherDetailComments.claimsComment,
        groundsComment: teacherDetailComments.groundsComment,
        rebuttalsComment: teacherDetailComments.rebuttalsComment,
        argumentScore: teacherArgumentScore,
        totalScore: teacherTotalScore,
        teacherTotalScore,
        finalTotalScore: teacherTotalScore,
        teacherArgumentScore,
        teacherDetailComments,
        aiDetailComments,
        gradingNotifiedAt: new Date().toISOString(),
        gradingView,
        teacherScores,
        aiScores,
      });

      const updatePayload = {
        studentName: submitStudentName,
        className: submitClassName,
        theme: submitTheme,
        noteContent: notePayload,
        essayContent,
      };

      if (isTeacherGradingSubmit) {
        Object.assign(updatePayload, {
          argumentScore: teacherArgumentScore,
          totalScore: teacherTotalScore,
          humanComment: teacherCommentForStorage,
          claimsScore: teacherScores.claimsScore,
          groundsScore: teacherScores.groundsScore,
          rebuttalsScore: teacherScores.rebuttalsScore,
          claimsComment: teacherDetailComments.claimsComment,
          groundsComment: teacherDetailComments.groundsComment,
          rebuttalsComment: teacherDetailComments.rebuttalsComment,
        });
      } else {
        Object.assign(updatePayload, {
          aiComment: aiCommentForStorage,
          aiTotalScore,
          aiClaimsScore: aiScores.claimsScore,
          aiGroundsScore: aiScores.groundsScore,
          aiRebuttalsScore: aiScores.rebuttalsScore,
          aiClaimsComment: aiDetailComments.claimsComment,
          aiGroundsComment: aiDetailComments.groundsComment,
          aiRebuttalsComment: aiDetailComments.rebuttalsComment,
        });
      }

      await updateNoteToNotion(updatePayload);

      showSnackbar("Submitted successfully.", "success");
    } catch (error) {
      console.error("Submit failed:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.details ||
        error?.message ||
        "unknown error";
      showSnackbar(`Submit failed: ${errorMessage}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const menuItemSx = { fontSize: "14px" };

  return (
    <div className="correct-essays-page">
      <Navbar />

      <div className="correct-essays-workspace">
        <section className="ce-panel ce-left-panel">
          <div className="ce-info-card">
            <div className="ce-info-row">
              <span className="ce-info-label">Class</span>
              <span className="ce-info-value">{className}</span>
            </div>
            <div className="ce-info-row">
              <span className="ce-info-label">Topic</span>
              <span className="ce-info-value">{topicName}</span>
            </div>
            <div className="ce-info-row">
              <span className="ce-info-label">Student</span>
              <span className="ce-info-value">{matchedScope.studentName || "-"}</span>
            </div>
            <div className="ce-student-switch">
              <button
                type="button"
                className="ce-switch-button"
                onClick={() => handleSwitchStudent(-1)}
                disabled={!hasPrevStudent || isLoading}
              >
                Previous
              </button>
              <span className="ce-switch-status">
                {currentStudentIndex >= 0 ? `${currentStudentIndex + 1}` : "-"} / {studentList.length || "-"}
              </span>
              <button
                type="button"
                className="ce-switch-button"
                onClick={() => handleSwitchStudent(1)}
                disabled={!hasNextStudent || isLoading}
              >
                Next
              </button>
            </div>
          </div>

          <div className="ce-essay-card">
            <div className="ce-card-title ce-card-title-with-action">
              <span>Argumentative Essay</span>
              <button
                type="button"
                className="ce-copy-button"
                onClick={handleCopyEssayContent}
                disabled={isLoading || !displayEssayContent.trim()}
                aria-label="複製文章內容"
                title="複製文章內容"
              >
                <img src={copyIcon} alt="複製" className="ce-copy-button-image" />
              </button>
            </div>
            <div className="ce-essay-content">
              {isLoading ? (
                <div className="ce-loading-wrapper">
                  <CircularProgress size={26} />
                </div>
              ) : (
                displayEssayContent || "No essay content found for this class/topic/student."
              )}
            </div>
          </div>
        </section>

        <section className="ce-panel ce-right-panel">
          <div className="ce-section-card">
            <div className="ce-toolbar">
              <div className="ce-tab-group">
                <button
                  type="button"
                  className={`ce-tab-button ${gradingView === "teacher" ? "active" : ""}`}
                  onClick={() => setGradingView("teacher")}
                >
                  Teacher Grading
                </button>
                <button
                  type="button"
                  className={`ce-tab-button ${gradingView === "ai" ? "active" : ""}`}
                  onClick={() => setGradingView("ai")}
                >
                  AI Grading
                </button>
              </div>
              {gradingView === "ai" ? (
                <Button
                  variant="outlined"
                  onClick={handleGenerateAiComment}
                  disabled={isGeneratingAi}
                  style={roundButtonStyle}
                >
                  {isGeneratingAi ? "Grading..." : "Start AI Grading"}
                </Button>
              ) : null}
            </div>

            <div className="ce-subtitle">Feedback</div>
            {gradingView === "ai" ? (
              <div className="ce-overall-feedback ce-overall-feedback-rich">
                <div className="ce-rich-block">
                  <strong className="ce-rich-title">
                    <span>Overall Feedback:</span>
                  </strong>
                  <div>{renderedAiSections?.overall || "（尚未產生）"}</div>
                </div>
                <div className="ce-rich-block">
                  <strong className="ce-rich-title">
                    <span>Key Improvement Focus:</span>
                  </strong>
                  <div>{renderedAiSections?.keyPoints || "（尚未產生）"}</div>
                </div>
                <div className="ce-rich-block">
                  <strong className="ce-rich-title">
                    <span>Detailed Feedback:</span>
                  </strong>
                  <div>{renderedAiSections?.details || "（尚未產生）"}</div>
                </div>
                <div className="ce-rich-block">
                  <strong className="ce-rich-title">
                    <span>Suggested Improvements:</span>
                  </strong>
                  <div>{renderedAiSections?.suggestions || "（尚未產生）"}</div>
                </div>
              </div>
            ) : (
              <textarea
                value={activeOverallComment}
                onChange={(event) => handleOverallCommentChange(event.target.value)}
                placeholder="Please enter teacher overall feedback..."
                className="ce-overall-feedback"
              />
            )}
            <div className="ce-subtitle ce-score-subtitle">Argument Component Scores </div>
            <div className="ce-score-list">
              <div className="ce-score-row">
                <div className="ce-score-label">Claims</div>
                <Select
                  size="small"
                  value={claimsScore}
                  onChange={(event) => setActiveScoreField("claimsScore", event.target.value)}
                  displayEmpty
                  sx={selectStyle}
                >
                  <MenuItem sx={menuItemSx} value="">Please select a score!</MenuItem>
                  <MenuItem sx={menuItemSx} value={0}>0,No clear position</MenuItem>
                  <MenuItem sx={menuItemSx} value={1}>1,A position is present but unclear or vague</MenuItem>
                  <MenuItem sx={menuItemSx} value={2}>2,Clear and specific position</MenuItem>
                </Select>
                <Tooltip
                  arrow
                  placement="right"
                  title={(
                    <div>
                      <div style={scoreHelpTitleSx}>Claims Scoring</div>
                      {claimsScoreHelp.map((line) => (
                        <div key={line} style={scoreHelpTextSx}>{line}</div>
                      ))}
                    </div>
                  )}
                >
                  <img src={questionIcon} alt="Claims score help" style={questionIconStyle} />
                </Tooltip>
              </div>

              <div className="ce-score-row">
                <div className="ce-score-label">Ground</div>
                <Select
                  size="small"
                  value={groundsScore}
                  onChange={(event) => setActiveScoreField("groundsScore", event.target.value)}
                  displayEmpty
                  sx={selectStyle}
                >
                  <MenuItem sx={menuItemSx} value="">Please select a score!</MenuItem>
                  <MenuItem sx={menuItemSx} value={0}>0,No reasons or evidence</MenuItem>
                  <MenuItem sx={menuItemSx} value={1}>1,Simple reason with little or no explanation</MenuItem>
                  <MenuItem sx={menuItemSx} value={2}>2,Some reasons, but not fully developed or unclear</MenuItem>
                  <MenuItem sx={menuItemSx} value={3}>3,Clear reasons with examples or explanation</MenuItem>
                  <MenuItem sx={menuItemSx} value={4}>4,Strong, well-developed reasons with specific and convincing evidence</MenuItem>
                </Select>
                <Tooltip
                  arrow
                  placement="right"
                  title={(
                    <div>
                      <div style={scoreHelpTitleSx}>Grounds Scoring</div>
                      {groundsScoreHelp.map((line) => (
                        <div key={line} style={scoreHelpTextSx}>{line}</div>
                      ))}
                    </div>
                  )}
                >
                  <img src={questionIcon} alt="Grounds score help" style={questionIconStyle} />
                </Tooltip>
              </div>

              <div className="ce-score-row">
                <div className="ce-score-label">Rebuttal</div>
                <Select
                  size="small"
                  value={rebuttalsScore}
                  onChange={(event) => setActiveScoreField("rebuttalsScore", event.target.value)}
                  displayEmpty
                  sx={selectStyle}
                >
                  <MenuItem sx={menuItemSx} value="">Please select a score!</MenuItem>
                  <MenuItem sx={menuItemSx} value={0}>0,No counterargument mentioned</MenuItem>
                  <MenuItem sx={menuItemSx} value={1}>1,Counterargument is mentioned but weakly addressed</MenuItem>
                  <MenuItem sx={menuItemSx} value={2}>2,Clear counterargument with an effective rebuttal</MenuItem>
                </Select>
                <Tooltip
                  arrow
                  placement="right"
                  title={(
                    <div>
                      <div style={scoreHelpTitleSx}>Rebuttals Scoring</div>
                      {rebuttalsScoreHelp.map((line) => (
                        <div key={line} style={scoreHelpTextSx}>{line}</div>
                      ))}
                    </div>
                  )}
                >
                  <img src={questionIcon} alt="Rebuttals score help" style={questionIconStyle} />
                </Tooltip>
              </div>
            </div>

            <div className="ce-total-row">
              <div className="ce-total-item">
                <span className="ce-total-label">Argument Score</span>
                <TextField
                  size="small"
                  value={argumentScore}
                  inputProps={{ readOnly: true }}
                  sx={scoreFieldSx}
                />
              </div>
              <div className="ce-total-item">
                <span className="ce-total-label">Total Score</span>
                <TextField
                  size="small"
                  value={manualTotalScore}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    if (/^\d*\.?\d*$/.test(nextValue)) {
                      setManualTotalScore(nextValue);
                    }
                  }}
                  
                  disabled={gradingView !== "teacher"}
                  inputProps={{ inputMode: "decimal", min: 0 }}
                  sx={scoreFieldSx}
                />
              </div>
            </div>
          </div>

          <div className="ce-footer-actions">
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              style={roundButtonStyle}
            >
              Back
            </Button>

            <Button
              variant="outlined"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={roundButtonStyle}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </section>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
