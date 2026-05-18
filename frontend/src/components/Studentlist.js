import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import axios from "axios";
import Navbar from "../components/Navbar_Student";
import gradingIcon from "../assets/grading.png";
import messageIcon from "../assets/message.png";
import exportIcon from "../assets/export.png";

const StyledTableContainer = styled(TableContainer)({
  margin: "20px auto",
  maxWidth: "92%",
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
  borderRadius: "8px",
});

const StyledTableCell = styled(TableCell)({
  fontSize: "16px",
  padding: "12px",
  textAlign: "center",
});

const StyledTableHeadCell = styled(StyledTableCell)({
  fontWeight: 700,
  backgroundColor: "#f5f5f5",
  color: "#333",
});

const StyledButton = styled(Button)({
  margin: "10px",
  backgroundColor: "#e0e0e0",
  color: "#333",
  "&:hover": {
    backgroundColor: "#d5d5d5",
  },
});

const notionApiBases = ["/notion-api", "/api/notion", "http://140.115.126.27:4000", "http://localhost:4000"];
const PROGRESS_STEPS = [
  { key: "discussion", label: "KF Discussion" },
  { key: "summary", label: "Summary" },
  { key: "outline", label: "Writing Outline" },
  { key: "finalWriting", label: "Final Writing" },
];

const normalizeText = (value) => (typeof value === "string" ? value.trim().toLowerCase() : "");
const isSubmittedStatusYes = (value) => {
  const normalized = normalizeText(value);
  return normalized === "是" || normalized === "yes" || normalized === "true" || normalized === "1" || normalized === "submitted" || normalized === "已繳交";
};
const hasMeaningfulText = (value) => {
  if (typeof value !== "string") return false;
  const normalized = value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.length > 0;
};

const formatSubmissionTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  const hh = `${date.getHours()}`.padStart(2, "0");
  const mi = `${date.getMinutes()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
};

const normalizeScoreValue = (value) => {
  if (value === null || value === undefined) return "";
  const raw = String(value).trim();
  if (!raw || raw === "-") return "";
  if (raw.toLowerCase() === "not graded") return "";
  return raw;
};

const firstAvailableScore = (values = []) => {
  for (const value of values) {
    const normalized = normalizeScoreValue(value);
    if (normalized !== "") return normalized;
  }
  return "";
};

const parseScoreParts = (value) => {
  const raw = normalizeScoreValue(value);
  if (!raw) return null;

  const slashMatch = raw.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
  if (slashMatch) {
    const numeric = Number(slashMatch[1]);
    const scale = Number(slashMatch[2]);
    if (Number.isNaN(numeric) || Number.isNaN(scale)) return null;
    return { raw, numeric, scale };
  }

  const numeric = Number(raw);
  if (Number.isNaN(numeric)) return null;
  return { raw, numeric, scale: null };
};

const isLikelyArgumentScore = (value) => {
  const parsed = parseScoreParts(value);
  if (!parsed) return false;
  if (parsed.scale !== null) return parsed.scale <= 8;
  return parsed.numeric >= 0 && parsed.numeric <= 8;
};

const isLikelyTotalScore = (value) => {
  const parsed = parseScoreParts(value);
  if (!parsed) return false;
  if (parsed.scale !== null) return parsed.scale >= 100;
  return parsed.numeric > 8;
};

const pickFirstMatchingScore = (values = [], predicate = () => true) => {
  for (const value of values) {
    if (!predicate(value)) continue;
    const normalized = normalizeScoreValue(value);
    if (normalized) return normalized;
  }
  return "";
};

const resolveTeacherArgumentScoreRaw = ({ item, essayData }) => {
  const teacherArgumentScore = firstAvailableScore([
    essayData?.argumentScore,
    essayData?.teacherArgumentScore,
    item?.argumentScore,
    item?.teacherArgumentScore,
  ]);
  if (teacherArgumentScore) return teacherArgumentScore;

  const legacyTeacherArgumentScore = pickFirstMatchingScore(
    [
      essayData?.teacherTotalScore,
      essayData?.totalScore,
      essayData?.finalTotalScore,
      item?.teacherTotalScore,
      item?.totalScore,
      item?.TotalScore,
      item?.["總分"],
      item?.grade,
      item?.Grade,
      item?.score,
      item?.Score,
      item?.grading,
      item?.Grading,
    ],
    isLikelyArgumentScore
  );
  if (legacyTeacherArgumentScore) return legacyTeacherArgumentScore;

  return "";
};

const resolveAiArgumentScoreRaw = ({ item, essayData }) =>
  firstAvailableScore([
    essayData?.aiTotalScore,
    item?.aiTotalScore,
    item?.AITotalScore,
  ]) ||
  firstAvailableScore([
    essayData?.aiArgumentScore,
    item?.aiArgumentScore,
    item?.AIArgumentScore,
  ]) ||
  pickFirstMatchingScore(
    [
      item?.aiScore,
      item?.AIScore,
    ],
    isLikelyArgumentScore
  );

const resolveTotalScoreRaw = ({ item, essayData }) =>
  pickFirstMatchingScore(
    [
      essayData?.totalScore,
      essayData?.finalTotalScore,
      item?.teacherTotalScore,
      item?.totalScore,
      item?.TotalScore,
      item?.["分數"],
    ],
    isLikelyTotalScore
  );

const formatTotalScoreOutOfHundred = (value) => {
  const parsed = parseScoreParts(value);
  if (!parsed) return "Not graded";
  const numericText = Number.isInteger(parsed.numeric) ? String(parsed.numeric) : String(parsed.numeric);
  return `${numericText}/100`;
};

const formatArgumentScorePairPart = (value) => {
  const normalized = normalizeScoreValue(value);
  if (!normalized) return "-";
  const parsed = parseScoreParts(normalized);
  if (!parsed) return normalized;
  if (parsed.scale !== null && parsed.scale !== 8) return normalized;
  const numericText = Number.isInteger(parsed.numeric) ? String(parsed.numeric) : String(parsed.numeric);
  return `${numericText}/8`;
};

const formatArgumentScoreTeacherAi = (teacherValue, aiValue) => {
  const teacherText = formatArgumentScorePairPart(teacherValue);
  const aiText = formatArgumentScorePairPart(aiValue);
  if (teacherText === "-" && aiText === "-") return "Not graded";
  return `${teacherText} / ${aiText}`;
};

const sanitizeFileName = (value) => {
  const fallback = "ClassReport";
  const normalized = String(value || "").trim();
  if (!normalized) return fallback;
  return normalized.replace(/[\\/:*?"<>|]/g, "_");
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const toPlainTextForExport = (value) => {
  if (typeof value !== "string") return "";
  if (typeof window === "undefined" || typeof window.DOMParser === "undefined") {
    return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  const parser = new window.DOMParser();
  const document = parser.parseFromString(value, "text/html");
  return (document?.body?.textContent || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const toSingleCellEssayText = (value) =>
  toPlainTextForExport(value)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

const normalizeExportValue = (value) => {
  const normalized = normalizeScoreValue(value);
  return normalized || "Not graded";
};

const downloadExcelReport = ({ headers = [], rows = [], fileName = "ClassReport" }) => {
  const headerHtml = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  const bodyHtml = rows
    .map(
      (row) =>
        `<tr>${row
          .map((cell) => `<td style="white-space: pre-wrap;">${escapeHtml(cell).replace(/\n/g, "<br/>")}</td>`)
          .join("")}</tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
</head>
<body>
  <table border="1">
    <thead><tr>${headerHtml}</tr></thead>
    <tbody>${bodyHtml}</tbody>
  </table>
</body>
</html>`;

  const blob = new Blob(["\ufeff", html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${sanitizeFileName(fileName)}.xls`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
};

const getNotionApiBaseCandidates = (preferredBase = "") => {
  const normalizedPreferredBase = String(preferredBase || "").replace(/\/+$/, "");
  const orderedBases = [
    normalizedPreferredBase,
    ...notionApiBases.map((base) => String(base || "").replace(/\/+$/, "")),
  ];
  return [...new Set(orderedBases.filter(Boolean))];
};

const fetchNotionRowsByClass = async (className, { theme = "" } = {}) => {
  let lastError = null;
  const token = localStorage.getItem("jwtToken");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  for (const normalizedBase of getNotionApiBaseCandidates()) {
    if (!normalizedBase) continue;

    try {
      const response = await axios.get(
        `${normalizedBase}/api/get-students-by-class/${encodeURIComponent(className)}`,
        {
          timeout: 12000,
          headers,
          params: theme ? { theme } : undefined,
          withCredentials: false,
        }
      );

      const rows = response?.data?.data;
      if (response?.data?.success && Array.isArray(rows)) {
        return { rows, apiBase: normalizedBase };
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Failed to fetch students from Notion");
};

const fetchStudentProgressRowsByClass = async (className, { theme = "", page = 1, pageSize = 200 } = {}) => {
  let lastError = null;
  const token = localStorage.getItem("jwtToken");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  for (const normalizedBase of getNotionApiBaseCandidates()) {
    if (!normalizedBase) continue;
    try {
      const response = await axios.get(
        `${normalizedBase}/api/get-student-progress-by-class/${encodeURIComponent(className)}`,
        {
          timeout: 15000,
          headers,
          params: {
            ...(theme ? { theme } : {}),
            page,
            pageSize,
          },
          withCredentials: false,
        }
      );

      const rows = response?.data?.data;
      if (response?.data?.success && Array.isArray(rows)) {
        return {
          rows,
          pagination: response?.data?.pagination || null,
          apiBase: normalizedBase,
        };
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Failed to fetch student progress batch");
};

const fetchEssayByScope = async ({ studentName, className, theme, preferredBase = "" }) => {
  if (!studentName || !className || !theme) return {};

  let lastError = null;
  const token = localStorage.getItem("jwtToken");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  for (const normalizedBase of getNotionApiBaseCandidates(preferredBase)) {
    try {
      const response = await axios.get(`${normalizedBase}/api/get-essay/${encodeURIComponent(studentName)}`, {
        timeout: 12000,
        headers,
        params: { className, theme },
        withCredentials: false,
      });
      if (response?.data?.success) return response?.data?.data || {};
    } catch (error) {
      if (error?.response?.status === 404) return {};
      lastError = error;
    }
  }

  if (lastError) {
    console.warn(`Failed to fetch essay scope for ${studentName}:`, lastError?.message || lastError);
  }
  return {};
};

const mapWithConcurrency = async (items, limit, mapper) => {
  const normalizedLimit = Math.max(1, Number(limit) || 1);
  if (!Array.isArray(items) || items.length === 0) return [];
  const results = new Array(items.length);
  let currentIndex = 0;

  const worker = async () => {
    while (true) {
      const index = currentIndex;
      currentIndex += 1;
      if (index >= items.length) return;
      results[index] = await mapper(items[index], index);
    }
  };

  const workerCount = Math.min(normalizedLimit, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
};

const toTimestamp = (value) => {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const dedupeRowsByStudentAndTheme = (rows = [], fallbackTheme = "") => {
  const map = new Map();
  rows.forEach((item, index) => {
    const studentName = String(item?.studentName || "").trim();
    const theme = item?.theme || fallbackTheme || "-";
    const key = `${normalizeText(studentName)}::${normalizeText(theme)}`;
    if (!key || key === "::") return;

    const existing = map.get(key);
    const currentTime = toTimestamp(item?.submissionDate);
    const existingTime = toTimestamp(existing?.item?.submissionDate);
    if (!existing || currentTime >= existingTime) {
      map.set(key, { item, index });
    }
  });
  return [...map.values()];
};

const createStudentRow = ({ item, index, selectedTopicName, selectedClassName, essayData = {} }) => {
  const theme = item?.theme || selectedTopicName || "-";
  const studentName = item?.studentName || "-";
  const progress = getProgressData({
    kfAnalysisContent: essayData?.kfAnalysisContent || "",
    outlineContent: essayData?.outlineContent || "",
    essayContent: essayData?.essayContent || "",
    submissionStatus: item?.submissionStatus || essayData?.submissionStatus || "",
  });

  return {
    rowId: `${item?.studentName || "unknown"}-${item?.submissionDate || index}`,
    name: studentName,
    theme,
    submissionTime: formatSubmissionTime(item?.submissionDate),
    progressPercent: progress.percent,
    progressCompletedByStep: progress.completedByStep,
    teacherArgumentScoreRaw: resolveTeacherArgumentScoreRaw({ item, essayData }),
    aiArgumentScoreRaw: resolveAiArgumentScoreRaw({ item, essayData }),
    totalScoreRaw: resolveTotalScoreRaw({ item, essayData }),
    className: selectedClassName,
  };
};

const createStudentRowFromBatchItem = ({ item, index, selectedTopicName, selectedClassName }) => {
  const theme = item?.theme || selectedTopicName || "-";
  const studentName = item?.studentName || item?.name || "-";
  const fallbackProgress = getProgressData({
    kfAnalysisContent: item?.kfAnalysisContent || "",
    outlineContent: item?.outlineContent || "",
    essayContent: item?.essayContent || "",
    submissionStatus: item?.submissionStatus || "",
  });
  const progressCompletedByStep =
    Array.isArray(item?.progressCompletedByStep) && item.progressCompletedByStep.length > 0
      ? item.progressCompletedByStep.map((step) => Boolean(step))
      : fallbackProgress.completedByStep;

  return {
    rowId: item?.rowId || `${studentName}-${item?.submissionDate || index}`,
    name: studentName,
    theme,
    submissionTime: formatSubmissionTime(item?.submissionDate),
    progressPercent:
      typeof item?.progressPercent === "number"
        ? item.progressPercent
        : progressCompletedByStep.filter(Boolean).length * 25,
    progressCompletedByStep,
    teacherArgumentScoreRaw:
      resolveTeacherArgumentScoreRaw({
        item,
        essayData: item || {},
      }) || "",
    aiArgumentScoreRaw:
      resolveAiArgumentScoreRaw({
        item,
        essayData: item || {},
      }) || "",
    totalScoreRaw:
      resolveTotalScoreRaw({
        item,
        essayData: item || {},
      }) || "",
    className: selectedClassName,
  };
};

const getProgressData = ({ kfAnalysisContent = "", outlineContent = "", essayContent = "", submissionStatus = "" } = {}) => {
  const completedByStep = [
    true,
    hasMeaningfulText(kfAnalysisContent),
    hasMeaningfulText(outlineContent),
    hasMeaningfulText(essayContent) || isSubmittedStatusYes(submissionStatus),
  ];
  const completedCount = completedByStep.filter(Boolean).length;
  return {
    completedByStep,
    percent: completedCount * 25,
  };
};

const ProgressBarCell = ({ completedByStep = [] }) => {
  const doneColor = "#42b41a";
  const todoColor = "#c9c9c9";

  return (
    <Box sx={{ minWidth: 420, maxWidth: 600, margin: "0 auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
        {PROGRESS_STEPS.map((step, index) => {
          const isDone = Boolean(completedByStep[index]);
          const connectorDone = index > 0 && Boolean(completedByStep[index - 1] && completedByStep[index]);
          return (
            <React.Fragment key={step.key}>
              {index > 0 ? (
                <Box
                  sx={{
                    flex: 1,
                    height: "5px",
                    borderRadius: "999px",
                    backgroundColor: connectorDone ? doneColor : "#e0e0e0",
                  }}
                />
              ) : null}
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  backgroundColor: isDone ? doneColor : "#fff",
                  border: isDone ? `2px solid ${doneColor}` : `2px solid ${todoColor}`,
                  color: isDone ? "#fff" : "#666",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {isDone ? "✓" : index + 1}
              </Box>
            </React.Fragment>
          );
        })}
      </Box>
      <Box sx={{ display: "flex", marginTop: "10px", justifyContent: "space-between", gap: 0.5 }}>
        {PROGRESS_STEPS.map((step) => (
          <Typography
            key={`${step.key}-label`}
            sx={{
              width: "25%",
              textAlign: "center",
              fontSize: "12px",
              color: "#555",
              lineHeight: 1.25,
              wordBreak: "break-word",
            }}
          >
            {step.label}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default function Studentlist() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedClassName =
    location.state?.className || localStorage.getItem("selectedClassName") || localStorage.getItem("activityTitle") || "-";
  const selectedTopicName =
    location.state?.topicName || localStorage.getItem("selectedTopicName") || localStorage.getItem("groupName") || "-";

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchRows = async () => {
      if (!selectedClassName || selectedClassName === "-") {
        setLoadError("Missing class name.");
        setRows([]);
        return;
      }

      setIsLoading(true);
      setLoadError("");

      try {
        const shouldFilterByTopic = selectedTopicName && selectedTopicName !== "-";
        try {
          const { rows: batchRows } = await fetchStudentProgressRowsByClass(selectedClassName, {
            theme: shouldFilterByTopic ? selectedTopicName : "",
            page: 1,
            pageSize: 200,
          });

          const mappedBatchRows = batchRows.map((item, index) =>
            createStudentRowFromBatchItem({
              item,
              index,
              selectedTopicName,
              selectedClassName,
            })
          );

          if (!cancelled) {
            setRows(mappedBatchRows);
          }
          return;
        } catch (batchError) {
          console.warn("Batch student progress API unavailable, falling back to legacy flow:", batchError?.message || batchError);
        }

        const { rows: notionRows, apiBase } = await fetchNotionRowsByClass(selectedClassName, {
          theme: shouldFilterByTopic ? selectedTopicName : "",
        });
        const filteredRowsByTopic = shouldFilterByTopic
          ? notionRows.filter((item) => normalizeText(item?.theme) === normalizeText(selectedTopicName))
          : notionRows;
        const dedupedRows = dedupeRowsByStudentAndTheme(filteredRowsByTopic, selectedTopicName);

        const initialRows = dedupedRows.map(({ item, index }) =>
          createStudentRow({
            item,
            index,
            selectedTopicName,
            selectedClassName,
          })
        );

        if (!cancelled) {
          setRows(initialRows);
          setIsLoading(false);
        }

        if (dedupedRows.length === 0) return;

        const essayCache = new Map();
        const enrichedRows = await mapWithConcurrency(dedupedRows, 6, async ({ item, index }) => {
          const theme = item?.theme || selectedTopicName || "-";
          const studentName = item?.studentName || "-";
          const cacheKey = `${normalizeText(studentName)}::${normalizeText(selectedClassName)}::${normalizeText(theme)}`;

          if (!essayCache.has(cacheKey)) {
            essayCache.set(
              cacheKey,
              fetchEssayByScope({
                studentName,
                className: selectedClassName,
                theme,
                preferredBase: apiBase,
              })
            );
          }

          const essayData = await essayCache.get(cacheKey);
          return createStudentRow({
            item,
            index,
            selectedTopicName,
            selectedClassName,
            essayData,
          });
        });

        if (!cancelled) {
          setRows(enrichedRows);
        }
      } catch (error) {
        console.error("Failed to fetch Notion student rows:", error);
        if (!cancelled) {
          setLoadError("Failed to fetch student records from Notion.");
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchRows();

    return () => {
      cancelled = true;
    };
  }, [selectedClassName, selectedTopicName]);

  const tableRows = useMemo(() => rows, [rows]);
  const studentListForNavigation = useMemo(() => {
    const seen = new Set();
    const orderedNames = [];
    tableRows.forEach((row) => {
      const name = String(row?.name || "").trim();
      if (!name) return;
      const key = normalizeText(name);
      if (!key || seen.has(key)) return;
      seen.add(key);
      orderedNames.push(name);
    });
    return orderedNames;
  }, [tableRows]);

  const handleExportToExcel = async () => {
    if (!tableRows.length) return;

    setIsExporting(true);
    try {
      const enrichedRows = await mapWithConcurrency(tableRows, 6, async (student) => {
        const essayData = await fetchEssayByScope({
          studentName: student.name,
          className: selectedClassName,
          theme: student.theme || selectedTopicName,
        });

        return [
          student.className || selectedClassName || "-",
          student.theme || selectedTopicName || "-",
          student.name || "-",
          toSingleCellEssayText(essayData?.essayContent || ""),
          normalizeExportValue(essayData?.claimsScore),
          normalizeExportValue(essayData?.groundsScore),
          normalizeExportValue(essayData?.rebuttalsScore),
          normalizeExportValue(essayData?.aiClaimsScore),
          normalizeExportValue(essayData?.aiGroundsScore),
          normalizeExportValue(essayData?.aiRebuttalsScore),
          normalizeExportValue(essayData?.totalScore || student.totalScoreRaw),
        ];
      });

      downloadExcelReport({
        headers: [
          "班級",
          "主題",
          "姓名",
          "作文內容",
          "老師 Claims Score",
          "老師 Ground Score",
          "老師 Rebuttal Score",
          "AI Claims Score",
          "AI Ground Score",
          "AI Rebuttal Score",
          "總分",
        ],
        rows: enrichedRows,
        fileName: selectedClassName || "ClassReport",
      });
    } catch (error) {
      console.error("Failed to export Excel report:", error);
      window.alert("匯出 Excel 失敗，請稍後再試。");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <div style={{ margin: "0 auto 20px", maxWidth: "92%", display: "flex", justifyContent: "space-between", gap: "12px" }}>
          <div>
            <Typography variant="h5" style={{ fontWeight: 700 }}>
              Class: {selectedClassName}
            </Typography>
            <Typography variant="h5" style={{ fontWeight: 700, marginTop: "8px" }}>
              Topic: {selectedTopicName}
            </Typography>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginTop: "34px" }}>
            <StyledButton
              variant="contained"
              onClick={handleExportToExcel}
              disabled={isLoading || isExporting || tableRows.length === 0}
              style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}
            >
              <img src={exportIcon} alt="export" style={{ width: "20px", height: "20px", marginRight: "6px" }} />
              {isExporting ? "Exporting..." : "Export to Excel"}
            </StyledButton>
            <Typography variant="h6" style={{ fontWeight: 700, whiteSpace: "nowrap", alignSelf: "center" }}>
              Total: {tableRows.length}
            </Typography>
          </div>
        </div>

        <StyledTableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableHeadCell>Name</StyledTableHeadCell>
                <StyledTableHeadCell>Progress</StyledTableHeadCell>
                <StyledTableHeadCell>Submission Time</StyledTableHeadCell>
                <StyledTableHeadCell>Grading</StyledTableHeadCell>
                <StyledTableHeadCell>Message</StyledTableHeadCell>
                <StyledTableHeadCell>Argument Score (Teacher/AI)</StyledTableHeadCell>
                <StyledTableHeadCell>Total Score</StyledTableHeadCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <StyledTableCell colSpan={7}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
                      <CircularProgress size={20} />
                      <span>Loading...</span>
                    </div>
                  </StyledTableCell>
                </TableRow>
              ) : tableRows.length > 0 ? (
                tableRows.map((student) => (
                  <TableRow key={student.rowId}>
                    <StyledTableCell>{student.name}</StyledTableCell>
                    <StyledTableCell>
                      <ProgressBarCell completedByStep={student.progressCompletedByStep} />
                    </StyledTableCell>
                    <StyledTableCell>{student.submissionTime}</StyledTableCell>
                    <StyledTableCell>
                      <img
                        src={gradingIcon}
                        alt="grading"
                        style={{ width: "40px", height: "40px", cursor: "pointer" }}
                        onClick={() =>
                          navigate("/CorrectEssays", {
                            state: {
                              studentName: student.name,
                              className: selectedClassName,
                              theme: student.theme || selectedTopicName,
                              studentList: studentListForNavigation,
                            },
                          })
                        }
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      <img
                        src={messageIcon}
                        alt="message"
                        style={{ width: "28px", height: "28px", cursor: "pointer" }}
                        onClick={() =>
                          navigate("/MessageBoard", {
                            state: {
                              studentName: student.name,
                              className: selectedClassName,
                              theme: selectedTopicName,
                            },
                          })
                        }
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      {(() => {
                        const gradeText = formatArgumentScoreTeacherAi(
                          student.teacherArgumentScoreRaw,
                          student.aiArgumentScoreRaw
                        );
                        const isNotGraded = gradeText === "Not graded";
                        return (
                          <span style={{ color: isNotGraded ? "#d32f2f" : "inherit", fontWeight: isNotGraded ? 700 : 400 }}>
                            {gradeText}
                          </span>
                        );
                      })()}
                    </StyledTableCell>
                    <StyledTableCell>
                      {(() => {
                        const totalText = formatTotalScoreOutOfHundred(student.totalScoreRaw);
                        const isNotGraded = totalText === "Not graded";
                        return (
                          <span style={{ color: isNotGraded ? "#d32f2f" : "inherit", fontWeight: isNotGraded ? 700 : 400 }}>
                            {totalText}
                          </span>
                        );
                      })()}
                    </StyledTableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <StyledTableCell colSpan={7}>{loadError || "No records found for this class/topic."}</StyledTableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>

        <div style={{ textAlign: "right" }}>
          <StyledButton variant="contained" onClick={() => navigate(-1)}>
            Back
          </StyledButton>
        </div>
      </div>
    </div>
  );
}
