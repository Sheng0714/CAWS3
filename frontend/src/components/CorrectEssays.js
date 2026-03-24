import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  Snackbar,
  TextField,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar_Student";

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
  "/api/notion",
  "/notion-api",
  "http://140.115.126.27:4000",
  "http://localhost:4000",
].filter((base) => typeof base === "string" && base.trim() !== "");

const normalizeScopeValue = (value) => String(value ?? "").replace(/\u3000/g, " ").trim().toLowerCase();

const pickLatestRow = (rows) =>
  [...rows].sort((a, b) => new Date(b?.submissionDate || 0).getTime() - new Date(a?.submissionDate || 0).getTime())[0];

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

const containerStyle = {
  width: "min(1160px, 100%)",
  margin: "0 auto",
  padding: "0 10px 16px",
  boxSizing: "border-box",
  fontSize: "20px",
};

const sectionBorder = "1px solid #000000";

const selectStyle = {
  width: "96px",
  height: "40px",
  background: "#ffffff",
  borderRadius: "0",
  fontSize: "20px",
  "& .MuiSelect-select": {
    padding: "8px 10px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#000000",
  },
};

const commentFieldSx = {
  maxWidth: "520px",
  "& .MuiOutlinedInput-root": {
    borderRadius: 0,
    backgroundColor: "#ffffff",
    fontSize: "20px",
    height: "40px",
    "& input": {
      padding: "8px 10px",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000",
    },
  },
};

const scoreFieldSx = {
  width: "84px",
  "& .MuiOutlinedInput-root": {
    borderRadius: 0,
    backgroundColor: "#ffffff",
    height: "40px",
    fontSize: "20px",
    "& input": {
      textAlign: "center",
      padding: "8px 6px",
      fontWeight: 600,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#000000",
    },
  },
};

const roundButtonStyle = {
  textTransform: "none",
  borderRadius: "18px",
  borderColor: "#000000",
  color: "#222222",
  background: "#e6d5bf",
  padding: "4px 16px",
  minWidth: "112px",
  fontSize: "20px",
  fontWeight: 600,
  lineHeight: 1.1,
};

export default function CorrectEssays() {
  const location = useLocation();
  const navigate = useNavigate();

  const studentName =
    location.state?.studentName || localStorage.getItem("selectedStudentName") || "Harry";
  const className = location.state?.className || localStorage.getItem("activityTitle") || "Class A";
  const topicName = location.state?.theme || location.state?.topicName || localStorage.getItem("groupName") || "-";

  const [essayContent, setEssayContent] = useState("");
  const [matchedScope, setMatchedScope] = useState({
    className: "",
    studentName: "",
    theme: "",
  });
  const [humanComment, setHumanComment] = useState("");
  const [aiComment, setAiComment] = useState("");

  const [claimsScore, setClaimsScore] = useState("");
  const [groundsScore, setGroundsScore] = useState("");
  const [rebuttalsScore, setRebuttalsScore] = useState("");

  const [claimsComment, setClaimsComment] = useState("");
  const [groundsComment, setGroundsComment] = useState("");
  const [rebuttalsComment, setRebuttalsComment] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const totalScore = useMemo(() => {
    const c = Number.isNaN(Number(claimsScore)) ? 0 : Number(claimsScore || 0);
    const g = Number.isNaN(Number(groundsScore)) ? 0 : Number(groundsScore || 0);
    const r = Number.isNaN(Number(rebuttalsScore)) ? 0 : Number(rebuttalsScore || 0);
    return c + g + r;
  }, [claimsScore, groundsScore, rebuttalsScore]);

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const resetGradingFields = () => {
    setHumanComment("");
    setAiComment("");
    setClaimsScore("");
    setGroundsScore("");
    setRebuttalsScore("");
    setClaimsComment("");
    setGroundsComment("");
    setRebuttalsComment("");
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

        const rawNote = data.noteContent || "";
        if (rawNote) {
          try {
            const parsed = JSON.parse(rawNote);
            setHumanComment(parsed.humanComment || "");
            setAiComment(parsed.aiComment || "");
            setClaimsScore(parsed.claimsScore ?? "");
            setGroundsScore(parsed.groundsScore ?? "");
            setRebuttalsScore(parsed.rebuttalsScore ?? "");
            setClaimsComment(parsed.claimsComment || "");
            setGroundsComment(parsed.groundsComment || "");
            setRebuttalsComment(parsed.rebuttalsComment || "");
          } catch {
            setAiComment(rawNote);
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

  const handleGenerateAiComment = () => {
    if (!essayContent.trim()) {
      showSnackbar("No essay content to grade.", "warning");
      return;
    }

    const nextComment = [
      "AI suggestion:",
      `1. Claims score ${claimsScore || 0}, grounds score ${groundsScore || 0}, rebuttals score ${rebuttalsScore || 0}.`,
      "2. Strengthen evidence by adding concrete data and sources.",
      "3. Add rebuttal details for opposing viewpoints.",
    ].join("\n");

    setAiComment(nextComment);
  };

  const handleSubmit = async () => {
    if (!studentName || !className || !topicName || topicName === "-") {
      showSnackbar("Missing class/topic/student context.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitStudentName = matchedScope.studentName || studentName;
      const submitClassName = matchedScope.className || className;
      const submitTheme = matchedScope.theme || topicName;

      const notePayload = JSON.stringify({
        humanComment,
        aiComment,
        claimsScore,
        groundsScore,
        rebuttalsScore,
        claimsComment,
        groundsComment,
        rebuttalsComment,
        totalScore,
      });

      await apiAxios.patch("/api/update-note", {
        studentName: submitStudentName,
        className: submitClassName,
        theme: submitTheme,
        noteContent: notePayload,
        essayContent,
      });

      showSnackbar("Submitted successfully.", "success");
    } catch (error) {
      console.error("Submit failed:", error);
      showSnackbar(`Submit failed: ${error?.message || "unknown error"}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const menuItemSx = { fontSize: "20px" };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: '"Times New Roman", serif', fontSize: "20px" }}>
      <Navbar />

      <div style={containerStyle}>
        <div
          style={{
            border: sectionBorder,
            background: "#efefef",
            padding: "6px 12px",
            fontSize: "20px",
            lineHeight: 1.25,
            marginTop: "8px",
            fontWeight: 500,
          }}
        >
          <div>{`Class:${className} Student:${studentName}`}</div>
          <div>{`Topic:${topicName}`}</div>
          <div>{`Notion: Class:${matchedScope.className || "-"} Student:${matchedScope.studentName || "-"} Topic:${matchedScope.theme || "-"}`}</div>
        </div>

        <div
          style={{
            border: sectionBorder,
            background: "#ffffff",
            minHeight: "188px",
            padding: "8px 10px",
            fontSize: "20px",
            lineHeight: 1.55,
            overflowY: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {isLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "190px" }}>
              <CircularProgress size={26} />
            </div>
          ) : (
            essayContent || "No essay content found for this class/topic/student."
          )}
        </div>

        <div
          style={{
            border: sectionBorder,
            borderTop: "none",
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            background: "#efefef",
            minHeight: "122px",
          }}
        >
          <div style={{ borderRight: sectionBorder }}>
            <div style={{ borderBottom: sectionBorder, padding: "6px 10px", fontSize: "20px", fontWeight: 600 }}>
              Human Grading
            </div>
            <textarea
              value={humanComment}
              onChange={(event) => setHumanComment(event.target.value)}
              placeholder="Please enter your comments......"
              style={{
                width: "100%",
                minHeight: "78px",
                border: "none",
                padding: "9px 10px",
                boxSizing: "border-box",
                resize: "vertical",
                background: "#efefef",
                fontSize: "20px",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div>
            <div
              style={{
                borderBottom: sectionBorder,
                padding: "4px 8px",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Button
                variant="outlined"
                onClick={handleGenerateAiComment}
                style={{ ...roundButtonStyle, minWidth: "126px", fontSize: "20px", padding: "4px 14px" }}
              >
                AI Grading
              </Button>
            </div>
            <textarea
              value={aiComment}
              onChange={(event) => setAiComment(event.target.value)}
              placeholder="Click the button to generate comments"
              style={{
                width: "100%",
                minHeight: "78px",
                border: "none",
                padding: "9px 10px",
                boxSizing: "border-box",
                resize: "vertical",
                background: "#efefef",
                fontSize: "20px",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        <div
          style={{
            border: sectionBorder,
            borderTop: "none",
            background: "#efefef",
            padding: "8px 10px 10px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", columnGap: "14px", alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "120px 110px minmax(260px, 520px)", gap: "8px", alignItems: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, lineHeight: 1 }}>Claims :</div>
                <Select
                  size="small"
                  value={claimsScore}
                  onChange={(event) => setClaimsScore(event.target.value)}
                  displayEmpty
                  sx={selectStyle}
                >
                  <MenuItem sx={menuItemSx} value="">Select</MenuItem>
                  <MenuItem sx={menuItemSx} value={0}>0</MenuItem>
                  <MenuItem sx={menuItemSx} value={1}>1</MenuItem>
                  <MenuItem sx={menuItemSx} value={2}>2</MenuItem>
                </Select>
                <TextField
                  size="small"
                  placeholder="Please enter your comments......"
                  value={claimsComment}
                  onChange={(event) => setClaimsComment(event.target.value)}
                  fullWidth
                  sx={commentFieldSx}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "120px 110px minmax(260px, 520px)", gap: "8px", alignItems: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, lineHeight: 1 }}>Grounds:</div>
                <Select
                  size="small"
                  value={groundsScore}
                  onChange={(event) => setGroundsScore(event.target.value)}
                  displayEmpty
                  sx={selectStyle}
                >
                  <MenuItem sx={menuItemSx} value="">Select</MenuItem>
                  <MenuItem sx={menuItemSx} value={0}>0</MenuItem>
                  <MenuItem sx={menuItemSx} value={1}>1</MenuItem>
                  <MenuItem sx={menuItemSx} value={2}>2</MenuItem>
                  <MenuItem sx={menuItemSx} value={3}>3</MenuItem>
                  <MenuItem sx={menuItemSx} value={4}>4</MenuItem>
                </Select>
                <TextField
                  size="small"
                  placeholder="Please enter your comments......"
                  value={groundsComment}
                  onChange={(event) => setGroundsComment(event.target.value)}
                  fullWidth
                  sx={commentFieldSx}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "120px 110px minmax(260px, 520px)", gap: "8px", alignItems: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, lineHeight: 1 }}>Rebuttals :</div>
                <Select
                  size="small"
                  value={rebuttalsScore}
                  onChange={(event) => setRebuttalsScore(event.target.value)}
                  displayEmpty
                  sx={selectStyle}
                >
                  <MenuItem sx={menuItemSx} value="">Select</MenuItem>
                  <MenuItem sx={menuItemSx} value={0}>0</MenuItem>
                  <MenuItem sx={menuItemSx} value={1}>1</MenuItem>
                  <MenuItem sx={menuItemSx} value={2}>2</MenuItem>
                </Select>
                <TextField
                  size="small"
                  placeholder="Please enter your comments......"
                  value={rebuttalsComment}
                  onChange={(event) => setRebuttalsComment(event.target.value)}
                  fullWidth
                  sx={commentFieldSx}
                />
              </div>
            </div>

            <div style={{ minWidth: "160px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", paddingTop: "2px" }}>
              <div style={{ fontSize: "20px", fontWeight: 700 }}>Score:</div>
              <TextField
                size="small"
                value={totalScore}
                inputProps={{ readOnly: true }}
                sx={scoreFieldSx}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "18px", marginTop: "10px" }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              style={roundButtonStyle}
            >
              Back ↺
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
        </div>
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
