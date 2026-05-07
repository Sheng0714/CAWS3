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

const formatGradeOutOfEight = (value) => {
  if (value === null || value === undefined) return "Not graded";
  const raw = String(value).trim();
  if (!raw || raw === "-") return "Not graded";
  if (raw.includes("/")) return raw;
  return `${raw}/8`;
};

const fetchNotionRowsByClass = async (className) => {
  let lastError = null;
  const token = localStorage.getItem("jwtToken");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

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

  throw lastError || new Error("Failed to fetch students from Notion");
};

const fetchEssayByScope = async ({ studentName, className, theme }) => {
  if (!studentName || !className || !theme) return {};

  let lastError = null;
  const token = localStorage.getItem("jwtToken");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  for (const base of notionApiBases) {
    const normalizedBase = String(base || "").replace(/\/+$/, "");
    if (!normalizedBase) continue;

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
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchRows = async () => {
      if (!selectedClassName || selectedClassName === "-") {
        setLoadError("Missing class name.");
        setRows([]);
        return;
      }

      setIsLoading(true);
      setLoadError("");

      try {
        const notionRows = await fetchNotionRowsByClass(selectedClassName);
        const shouldFilterByTopic = selectedTopicName && selectedTopicName !== "-";
        const filteredRowsByTopic = shouldFilterByTopic
          ? notionRows.filter((item) => normalizeText(item?.theme) === normalizeText(selectedTopicName))
          : notionRows;

        const mappedRows = await Promise.all(
          filteredRowsByTopic.map(async (item, index) => {
            const theme = item?.theme || selectedTopicName || "-";
            const studentName = item?.studentName || "-";
            const essayData = await fetchEssayByScope({
              studentName,
              className: selectedClassName,
              theme,
            });
            const progress = getProgressData({
              kfAnalysisContent: essayData?.kfAnalysisContent || "",
              outlineContent: essayData?.outlineContent || "",
              essayContent: essayData?.essayContent || "",
              submissionStatus: item?.submissionStatus || "",
            });

            return {
              rowId: `${item?.studentName || "unknown"}-${item?.submissionDate || index}`,
              name: studentName,
              theme,
              submissionTime: formatSubmissionTime(item?.submissionDate),
              progressPercent: progress.percent,
              progressCompletedByStep: progress.completedByStep,
              gradeRaw:
                item?.totalScore ??
                item?.TotalScore ??
                item?.["總分"] ??
                item?.grade ??
                item?.Grade ??
                item?.score ??
                item?.Score ??
                item?.grading ??
                item?.Grading ??
                "",
            };
          })
        );

        setRows(mappedRows);
      } catch (error) {
        console.error("Failed to fetch Notion student rows:", error);
        setLoadError("Failed to fetch student records from Notion.");
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRows();
  }, [selectedClassName, selectedTopicName]);

  const tableRows = useMemo(() => rows, [rows]);

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
          <Typography variant="h6" style={{ fontWeight: 700, whiteSpace: "nowrap", alignSelf: "flex-start", marginTop: "40px" }}>
            Total: {tableRows.length}
          </Typography>
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
                <StyledTableHeadCell>Grade</StyledTableHeadCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <StyledTableCell colSpan={6}>
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
                        const gradeText = formatGradeOutOfEight(student.gradeRaw);
                        const isNotGraded = gradeText === "Not graded";
                        return (
                          <span style={{ color: isNotGraded ? "#d32f2f" : "inherit", fontWeight: isNotGraded ? 700 : 400 }}>
                            {gradeText}
                          </span>
                        );
                      })()}
                    </StyledTableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <StyledTableCell colSpan={6}>{loadError || "No records found for this class/topic."}</StyledTableCell>
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
