import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar_Student";
import { styled } from "@mui/system";

const notionApiBases = [
  process.env.REACT_APP_NOTION_API_BASE_URL,
  "/notion-api",
  "http://localhost:4000",
  "http://140.115.126.27:4000",
].filter(Boolean);

const StyledPaper = styled(Paper)(({ theme }) => ({
  margin: "20px auto",
  maxWidth: "700px",
  padding: "20px",
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
  borderRadius: "8px",
  [theme?.breakpoints?.down("sm") || "@media (max-width: 600px)"]: {
    margin: "10px",
    padding: "15px",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: "100%",
  marginBottom: "16px",
  [theme?.breakpoints?.down("sm") || "@media (max-width: 600px)"]: {
    marginBottom: "12px",
  },
}));

const SendButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#42a5f5",
  color: "white",
  "&:hover": {
    backgroundColor: "#2196f3",
  },
  marginLeft: "auto",
  display: "block",
  [theme?.breakpoints?.down("sm") || "@media (max-width: 600px)"]: {
    fontSize: "14px",
    padding: "6px 12px",
  },
}));

const BackButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#e0e0e0",
  color: "#333",
  "&:hover": {
    backgroundColor: "#d5d5d5",
  },
  marginTop: "16px",
  [theme?.breakpoints?.down("sm") || "@media (max-width: 600px)"]: {
    fontSize: "14px",
    padding: "6px 12px",
  },
}));

const normalizeScope = (value) => String(value ?? "").replace(/\u3000/g, " ").trim();

const parseNoteContent = (noteContent) => {
  const raw = String(noteContent || "").trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const buildTeacherMessageFieldText = (messages = []) =>
  messages
    .map((item) => {
      const sender = String(item?.sender || "Teacher").trim();
      const content = String(item?.content || "").trim();
      const timestamp = String(item?.timestamp || item?.createdAt || "").trim();
      if (!content) return "";
      return `${sender}: ${content}${timestamp ? ` (${timestamp})` : ""}`;
    })
    .filter(Boolean)
    .join("\n");

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
      if (response?.data?.success) return response?.data?.data || {};
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
      if (response?.data?.success) return response?.data;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Failed to update note to Notion");
};

const MessageBoard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const teacherName = localStorage.getItem("name") || "Teacher";
  const scopedStudentName = normalizeScope(
    location.state?.studentName || localStorage.getItem("selectedStudentName") || localStorage.getItem("studentName")
  );
  const scopedClassName = normalizeScope(location.state?.className || localStorage.getItem("selectedClassName"));
  const scopedTheme = normalizeScope(location.state?.theme || localStorage.getItem("selectedTopicName"));

  const canSend = Boolean(scopedStudentName && scopedClassName && scopedTheme);
  const boardTitle = useMemo(() => `To: ${scopedStudentName || "Unknown"}`, [scopedStudentName]);

  const showSnackbar = (nextMessage, severity = "info") => {
    setSnackbar({ open: true, message: nextMessage, severity });
  };

  useEffect(() => {
    const loadMessageBoard = async () => {
      if (!canSend) {
        setMessages([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await fetchEssayByScopeFromNotion({
          studentName: scopedStudentName,
          className: scopedClassName,
          theme: scopedTheme,
        });
        const parsedNote = parseNoteContent(data?.noteContent);
        const noteMessages = Array.isArray(parsedNote?.teacherMessages) ? parsedNote.teacherMessages : [];
        setMessages(noteMessages);
      } catch (error) {
        console.error("Load message board from Notion failed:", error);
        showSnackbar(`Load failed: ${error?.message || "unknown error"}`, "error");
      } finally {
        setIsLoading(false);
      }
    };

    void loadMessageBoard();
  }, [canSend, scopedStudentName, scopedClassName, scopedTheme]);

  const handleSendMessage = async () => {
    if (!canSend) {
      showSnackbar("Missing student/class/topic scope.", "warning");
      return;
    }
    if (!message.trim()) {
      showSnackbar("Please enter a message.", "warning");
      return;
    }

    const newMessage = {
      sender: teacherName,
      content: message.trim(),
      timestamp: new Date().toLocaleString("zh-TW", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      createdAt: new Date().toISOString(),
    };

    setIsSending(true);
    try {
      const latestData = await fetchEssayByScopeFromNotion({
        studentName: scopedStudentName,
        className: scopedClassName,
        theme: scopedTheme,
      });
      const parsedNote = parseNoteContent(latestData?.noteContent);
      const currentMessages = Array.isArray(parsedNote?.teacherMessages) ? parsedNote.teacherMessages : [];
      const nextMessages = [...currentMessages, newMessage];
      const updatedNote = {
        ...parsedNote,
        teacherMessages: nextMessages,
        teacherNotificationMessage: newMessage.content,
        teacherNotificationAt: newMessage.createdAt,
      };

      await updateNoteToNotion({
        studentName: scopedStudentName,
        className: scopedClassName,
        theme: scopedTheme,
        essayContent: latestData?.essayContent || "",
        noteContent: JSON.stringify(updatedNote),
        kfAnalysisContent: latestData?.kfAnalysisContent || "",
        chatHistory: Array.isArray(latestData?.chatHistory) ? latestData.chatHistory : [],
        outlineContent: latestData?.outlineContent || "",
        teacherMessage: buildTeacherMessageFieldText(nextMessages),
      });

      setMessages(nextMessages);
      setMessage("");
      showSnackbar("Message sent to Notion.", "success");
    } catch (error) {
      console.error("Send message to Notion failed:", error);
      showSnackbar(`Send failed: ${error?.message || "unknown error"}`, "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <StyledPaper>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <Typography variant="h6">Message Board</Typography>
            <Typography variant="body2" sx={{ color: "#4a4a4a", fontWeight: 600 }}>
              {boardTitle}
            </Typography>
          </Box>

          <StyledTextField
            label="Please enter message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            rows={3}
            variant="outlined"
            disabled={!canSend || isSending}
          />

          <SendButton variant="contained" onClick={handleSendMessage} disabled={!canSend || isSending}>
            {isSending ? "Sending..." : "Send"}
          </SendButton>

          <List sx={{ marginTop: "12px" }}>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
                <CircularProgress size={24} />
              </Box>
            ) : messages.length > 0 ? (
              messages.map((msg, index) => (
                <ListItem key={`${msg.createdAt || msg.timestamp || "msg"}-${index}`} divider>
                  <ListItemText
                    primary={`${msg.sender || "Teacher"}`}
                    secondary={`${msg.content || ""} - ${msg.timestamp || ""}`}
                  />
                </ListItem>
              ))
            ) : (
              <ListItem divider>
                <ListItemText primary="No messages yet." />
              </ListItem>
            )}
          </List>

          <div style={{ textAlign: "right" }}>
            <BackButton variant="contained" onClick={() => navigate(-1)}>
              Back
            </BackButton>
          </div>
        </StyledPaper>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4500}
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
};

export default MessageBoard;
