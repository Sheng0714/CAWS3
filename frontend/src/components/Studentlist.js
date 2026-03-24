import React, { useEffect, useMemo, useState } from "react";
import {
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

const notionApiBases = ["/api/notion", "/notion-api", "http://140.115.126.27:4000", "http://localhost:4000"];

const normalizeText = (value) => (typeof value === "string" ? value.trim().toLowerCase() : "");

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

const fetchNotionRowsByClass = async (className) => {
  let lastError = null;

  for (const base of notionApiBases) {
    const normalizedBase = String(base || "").replace(/\/+$/, "");
    if (!normalizedBase) continue;

    try {
      const response = await axios.get(
        `${normalizedBase}/api/get-students-by-class/${encodeURIComponent(className)}`,
        {
          timeout: 12000,
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
        const filteredRows = shouldFilterByTopic
          ? notionRows.filter((item) => normalizeText(item?.theme) === normalizeText(selectedTopicName))
          : notionRows;

        const mappedRows = filteredRows.map((item, index) => ({
          rowId: `${item?.studentName || "unknown"}-${item?.submissionDate || index}`,
          name: item?.studentName || "-",
          theme: item?.theme || selectedTopicName || "-",
          submissionTime: formatSubmissionTime(item?.submissionDate),
          grade:
            item?.grade ??
            item?.Grade ??
            item?.score ??
            item?.Score ??
            item?.grading ??
            item?.Grading ??
            "-",
        }));

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
        <Typography variant="h5" style={{ marginBottom: "20px", fontWeight: 700 }}>
          Class: {selectedClassName} | Topic: {selectedTopicName}
        </Typography>

        <StyledTableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableHeadCell>Name</StyledTableHeadCell>
                <StyledTableHeadCell>Submission Time</StyledTableHeadCell>
                <StyledTableHeadCell>Grading</StyledTableHeadCell>
                <StyledTableHeadCell>Message</StyledTableHeadCell>
                <StyledTableHeadCell>Grade</StyledTableHeadCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <StyledTableCell colSpan={5}>
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
                    <StyledTableCell>{student.submissionTime}</StyledTableCell>
                    <StyledTableCell>
                      <img
                        src={gradingIcon}
                        alt="grading"
                        style={{ width: "28px", height: "28px", cursor: "pointer" }}
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
                    <StyledTableCell>{student.grade}</StyledTableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <StyledTableCell colSpan={5}>{loadError || "No records found for this class/topic."}</StyledTableCell>
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
