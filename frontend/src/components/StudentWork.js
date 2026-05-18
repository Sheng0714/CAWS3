import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Card, CardContent, CardHeader, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import Navbar from "./Navbar_Student";
import StudentLeftSidebar from "./StudentLeftSidebar";
import backIcon from "../assets/back.png";
import owlWavingGif from "../assets/揮手.gif";
import config from "../config.json";
import url from "../url.json";

const notionApiBases = [
  process.env.REACT_APP_NOTION_API_BASE_URL,
  "/notion-api",
  "/api/notion",
  "http://localhost:4000",
  "http://140.115.126.27:4000",
].filter(Boolean);

const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 20px 30px",
};

const IN_PROGRESS_COLOR = '#D1E7FB';
const COMPLETED_COLOR = '#DFEDD7';
// const IN_PROGRESS_COLOR = "rgb(237, 237, 237)";
// const COMPLETED_COLOR = "rgb(163, 163, 163)";
//backgroundColor: status === 'completed' ? '#DFEDD7' : '#D1E7FB',

const buildAuthConfig = () => {
  const jwtToken = localStorage.getItem("jwtToken");
  if (!jwtToken) {
    return {};
  }
  return {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  };
};

const formatDateValue = (dateLike) => {
  if (!dateLike) {
    return "-";
  }
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isCompletedByEndDate = (endDate) => {
  if (!endDate) {
    return false;
  }
  const parsedEndDate = new Date(endDate);
  if (Number.isNaN(parsedEndDate.getTime())) {
    return false;
  }
  return parsedEndDate < new Date();
};

const incrementNotionLoginCount = async ({ studentName, className, theme }) => {
  const normalizedStudentName = String(studentName || "").trim();
  const normalizedClassName = String(className || "").trim();
  const normalizedTheme = String(theme || "").trim();
  if (!normalizedStudentName || !normalizedClassName || !normalizedTheme) return;

  let lastError = null;
  for (const base of notionApiBases) {
    const normalizedBase = String(base || "").replace(/\/+$/, "");
    if (!normalizedBase) continue;

    try {
      await axios.post(
        `${normalizedBase}/api/increment-login-count`,
        {
          studentName: normalizedStudentName,
          className: normalizedClassName,
          theme: normalizedTheme,
        },
        {
          timeout: 12000,
        }
      );
      return;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }
};

export default function StudentWork() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const inProgressRowRef = useRef(null);
  const completedRowRef = useRef(null);

  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const classTopicEntries = useMemo(() => {
    return activities.flatMap((activity, activityIndex) => {
      const activityIdentity = activity?.id ?? `idx-${activityIndex}`;
      const className = activity?.title || "-";
      const classStartDate = activity?.startDate || "";
      const classEndDate = activity?.endDate || "";
      const groups = Array.isArray(activity?.Groups)
        ? [...activity.Groups].sort((a, b) => (a?.id || 0) - (b?.id || 0))
        : [];

      if (groups.length === 0) {
        return [
          {
            entryId: `activity-${activityIdentity}-topic-none`,
            activityId: activity?.id || "",
            groupId: "",
            className,
            topicName: "-",
            startDate: classStartDate,
            endDate: classEndDate,
          },
        ];
      }

      return groups.map((group, groupIndex) => ({
        entryId: `activity-${activityIdentity}-topic-${group?.id ?? group?.joinCode ?? `idx-${groupIndex}`}`,
        activityId: activity?.id || "",
        groupId: group?.id || "",
        className,
        topicName: group?.groupName || "-",
        startDate: group?.startDate || classStartDate,
        endDate: group?.endDate || classEndDate,
      }));
    });
  }, [activities]);

  const inProgressEntries = useMemo(
    () => classTopicEntries.filter((entry) => !isCompletedByEndDate(entry.endDate)),
    [classTopicEntries]
  );

  const completedEntries = useMemo(
    () => classTopicEntries.filter((entry) => isCompletedByEndDate(entry.endDate)),
    [classTopicEntries]
  );

  const scrollRow = (rowRef, direction) => {
    if (!rowRef.current) return;
    const amount = isMobile ? 220 : isTablet ? 300 : 380;
    rowRef.current.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  const handleCardClick = (entry) => {
    const currentStudentName =
      localStorage.getItem("name") ||
      localStorage.getItem("username") ||
      localStorage.getItem("userName") ||
      "";

    localStorage.setItem("selectedClassName", entry.className || "");
    localStorage.setItem("selectedTopicName", entry.topicName || "");
    if (entry.activityId) {
      localStorage.setItem("activityId", String(entry.activityId));
    }
    if (entry.groupId) {
      localStorage.setItem("groupId", String(entry.groupId));
    }
    localStorage.setItem("activityTitle", entry.className || "");
    localStorage.setItem("groupName", entry.topicName || "");

    void incrementNotionLoginCount({
      studentName: currentStudentName,
      className: entry.className || "",
      theme: entry.topicName || "",
    }).catch((error) => {
      console.error("Failed to increment Notion login count:", error);
    });

    navigate("/Studentlist", {
      state: {
        className: entry.className || "",
        topicName: entry.topicName || "",
        activityId: entry.activityId || "",
        groupId: entry.groupId || "",
      },
    });
  };

  const renderCardSection = (title, entries, rowRef, backgroundColor) => {
    return (
      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            margin: "0 0 10px 0",
            color: "#111111",
            fontSize: isMobile ? "24px" : "28px",
            fontWeight: 800,
          }}
        >
          {title}
        </h2>

        {entries.length > 0 ? (
          <Box style={{ display: "flex", alignItems: "center" }}>
            {!isMobile && (
              <IconButton aria-label={`scroll ${title} left`} onClick={() => scrollRow(rowRef, "left")}>
                <ChevronLeft />
              </IconButton>
            )}
            <Box
              ref={rowRef}
              style={{
                display: "flex",
                gap: isMobile ? "12px" : "24px",
                overflowX: "auto",
                scrollBehavior: "smooth",
                flex: 1,
                paddingBottom: "8px",
              }}
            >
              {entries.map((entry) => (
                <Box
                  key={entry.entryId}
                  style={{
                    flex: "0 0 auto",
                    width: isMobile ? "min(85vw, 320px)" : isTablet ? "320px" : "360px",
                  }}
                >
                  <Card
                    onClick={() => handleCardClick(entry)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleCardClick(entry);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    style={{
                      backgroundColor,
                      borderRadius: "12px",
                      border: "none",
                      color: "#000000",
                      minHeight: isMobile ? "190px" : "210px",
                      boxSizing: "border-box",
                      cursor: "pointer",
                    }}
                  >
                    <CardHeader title={entry.className} subheader={entry.topicName} />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        {`${formatDateValue(entry.startDate)} ~ ${formatDateValue(entry.endDate)}`}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
            {!isMobile && (
              <IconButton aria-label={`scroll ${title} right`} onClick={() => scrollRow(rowRef, "right")}>
                <ChevronRight />
              </IconButton>
            )}
          </Box>
        ) : (
          <div
            style={{
              width: "min(1080px, 100%)",
              minHeight: "120px",
              border: "2px solid #000000",
              borderRadius: "16px",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
              fontSize: isMobile ? "16px" : "18px",
              fontWeight: 600,
              textAlign: "center",
              padding: "0 16px",
              boxSizing: "border-box",
            }}
          >
            {isLoading ? "Loading..." : loadError || "No class topic records yet."}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const fetchActivities = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setLoadError("Cannot find userId. Please login again.");
        return;
      }

      setIsLoading(true);
      setLoadError("");
      try {
        const response = await axios.get(
          `${url.backendHost + config[13].MyCreatedActivity}/${userId}`,
          buildAuthConfig()
        );
        setActivities(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to load class topic records:", error);
        setLoadError("Failed to load class topic records.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <StudentLeftSidebar />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              ...containerStyle,
              padding: isMobile ? "0 12px 24px" : isTablet ? "0 16px 28px" : containerStyle.padding,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: isMobile ? "flex-start" : "center",
                alignItems: isMobile ? "stretch" : "center",
                gap: isMobile ? "8px" : "12px",
                flexWrap: "wrap",
                marginBottom: "14px",
              }}
            >
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <img src={backIcon} alt="Back" width={35} height={35} />
              </button>

              <img
                src={owlWavingGif}
                alt="CAWS assistant"
                style={{
                  width: isMobile ? "100px" : "150px",
                  height: isMobile ? "100px" : "150px",
                  objectFit: "contain",
                }}
              />

              <div
                style={{
                  background: "rgba(105, 83, 83, 0.1)",
                  border: "1.5px solid #000000",
                  borderRadius: "16px",
                  width: "100%",
                  maxWidth: isMobile ? "100%" : "900px",
                  minHeight: isMobile ? "72px" : "84px",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                  color: "#1e293b",
                  fontSize: isMobile ? "16px" : isTablet ? "19px" : "22px",
                  lineHeight: 1.35,
                  textAlign: isMobile ? "center" : "left",
                  display: "flex",
                  alignItems: "center",
                  padding: isMobile ? "10px 14px" : "12px 18px",
                  boxSizing: "border-box",
                }}
              >
                <p style={{ margin: 0, fontWeight: 700 }}>
                  Please select a class below to view students' submission status, provide
                  feedback, or leave comments.
                </p>
              </div>
            </div>

            {renderCardSection("In Progress", inProgressEntries, inProgressRowRef, IN_PROGRESS_COLOR)}
            {renderCardSection("Completed", completedEntries, completedRowRef, COMPLETED_COLOR)}
          </div>
        </div>
      </div>
    </div>
  );
}
