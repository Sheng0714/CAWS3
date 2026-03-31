import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import Navbar from "./Navbar_Student";
import StudentLeftSidebar from "./StudentLeftSidebar";
import backIcon from "../assets/back.png";
import owlWavingGif from "../assets/揮手.gif";
import addTopicIcon from "../assets/addtopic.png";
import createClassIcon from "../assets/addgroup.svg";
import settingIcon from "../assets/setting.png";
import clearIcon from "../assets/XX.png";
import config from "../config.json";
import url from "../url.json";

const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 20px 30px",
};

const tableColumns = "1.1fr 2.7fr 1.1fr 1fr 0.9fr";

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
    return "";
  }
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getNextMonthDateValue = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return formatDateValue(date);
};

export default function ClassManage() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [createStartDate, setCreateStartDate] = useState(formatDateValue(new Date()));
  const [createEndDate, setCreateEndDate] = useState(getNextMonthDateValue());

  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [topicActivityId, setTopicActivityId] = useState(null);
  const [newTopicName, setNewTopicName] = useState("");

  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [editActivityId, setEditActivityId] = useState(null);
  const [editClassName, setEditClassName] = useState("");

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteActivityId, setDeleteActivityId] = useState(null);

  const apiBaseUrl = useMemo(
    () => (url.backendHost.endsWith("/") ? url.backendHost : `${url.backendHost}/`),
    []
  );
  const buildPathCandidates = (path) => {
    const normalizedPath = String(path || "").replace(/^\/+/, "");
    const withoutApiPrefix = normalizedPath.replace(/^api\/+/i, "");
    const withApiPrefix = normalizedPath.toLowerCase().startsWith("api/") ? normalizedPath : `api/${normalizedPath}`;
    const rawCandidates = [withApiPrefix, normalizedPath, withoutApiPrefix];
    return [...new Set(rawCandidates.filter(Boolean).map((item) => `${apiBaseUrl}${item}`))];
  };
  const requestWithFallback = async ({ method, path, data, auth = true }) => {
    const candidates = buildPathCandidates(path);
    let lastError = null;

    for (const endpoint of candidates) {
      try {
        const requestConfig = auth ? buildAuthConfig() : {};
        return await axios({
          method,
          url: endpoint,
          data,
          ...requestConfig,
        });
      } catch (error) {
        lastError = error;
        const statusCode = error?.response?.status;
        if (statusCode !== 404) {
          throw error;
        }
      }
    }

    if (lastError) {
      lastError.attemptedEndpoints = candidates;
      throw lastError;
    }
    throw new Error(`No API endpoint candidates available for path: ${path}`);
  };

  const classRows = useMemo(() => {
    return activities.map((activity) => {
      const sortedGroups = Array.isArray(activity.Groups) ? [...activity.Groups].sort((a, b) => a.id - b.id) : [];
      const firstGroup = sortedGroups[0] || null;
      return {
        activityId: activity.id,
        className: activity.title || "",
        topicName: firstGroup?.groupName || "",
        inviteCode: firstGroup?.joinCode || "",
        deadline: formatDateValue(activity.endDate),
      };
    });
  }, [activities]);

  const hasClass = classRows.length > 0;

  const fetchActivities = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setLoadError("Cannot find userId. Please login again.");
      return;
    }

    setIsLoading(true);
    setLoadError("");
    try {
      const response = await requestWithFallback({
        method: "get",
        path: `${config[13].MyCreatedActivity}/${userId}`,
      });
      setActivities(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load class list:", error);
      setLoadError("Failed to load class list.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const renewJwtToken = async () => {
    try {
      const response = await requestWithFallback({
        method: "get",
        path: config[1].reNewTokenUrl,
      });
      const renewedToken = response?.data?.token || response?.data?.jwtToken;
      if (renewedToken) {
        localStorage.setItem("jwtToken", renewedToken);
      }
    } catch (error) {
      console.warn("Token renew failed:", error);
    }
  };

  const openCreateClassDialog = () => {
    setNewClassName("");
    setCreateStartDate(formatDateValue(new Date()));
    setCreateEndDate(getNextMonthDateValue());
    setIsCreateClassOpen(true);
  };

  const handleCreateClass = async () => {
    const userId = localStorage.getItem("userId");
    const trimmedClassName = newClassName.trim();

    if (!userId) {
      alert("Cannot find userId. Please login again.");
      return;
    }
    if (!trimmedClassName) {
      alert("Please enter a class name.");
      return;
    }
    if (!createStartDate || !createEndDate) {
      alert("Please choose start date and end date.");
      return;
    }
    if (createEndDate < createStartDate) {
      alert("End date cannot be earlier than start date.");
      return;
    }

    try {
      await requestWithFallback({
        method: "post",
        path: config[2].createActivity,
        data: {
          userId,
          title: trimmedClassName,
          startDate: new Date(`${createStartDate}T12:00:00`).toISOString(),
          endDate: new Date(`${createEndDate}T12:00:00`).toISOString(),
        },
      });

      setNewClassName("");
      setIsCreateClassOpen(false);
      await renewJwtToken();
      await fetchActivities();
    } catch (error) {
      console.error("Failed to create class:", error);
      alert("Failed to create class.");
    }
  };

  const openAddTopicDialog = (row) => {
    setTopicActivityId(row.activityId);
    setNewTopicName("");
    setIsAddTopicOpen(true);
  };

  const handleAddTopic = async () => {
    const trimmedTopicName = newTopicName.trim();
    const userId = localStorage.getItem("userId");
    const targetActivity = activities.find((activity) => activity.id === topicActivityId);

    if (!topicActivityId) {
      alert("Missing activityId.");
      return;
    }
    if (!trimmedTopicName) {
      alert("Please enter a topic name.");
      return;
    }
    if (!targetActivity) {
      alert("Cannot find selected class.");
      return;
    }

    try {
      const createGroupResponse = await requestWithFallback({
        method: "post",
        path: config[14].creatGroup,
        data: {
          groupName: trimmedTopicName,
          activityId: topicActivityId,
          numGroups: 1,
          startDate: targetActivity.startDate,
          endDate: targetActivity.endDate,
        },
      });

      const createdGroups = createGroupResponse?.data?.groups || [];
      if (userId && createdGroups.length > 0) {
        await Promise.all(
          createdGroups.map((group) =>
            requestWithFallback({
              method: "put",
              path: `groups/${group.joinCode}/join`,
              data: { userId },
              auth: false,
            })
          )
        );
      }

      setIsAddTopicOpen(false);
      setTopicActivityId(null);
      await renewJwtToken();
      await fetchActivities();
    } catch (error) {
      console.error("Failed to add topic:", error);
      const detail = error.response?.data?.message || error.response?.data || error.message;
      const failedUrl = error?.config?.url ? `\nURL: ${error.config.url}` : "";
      alert(`Failed to add topic: ${detail}${failedUrl}`);
    }
  };

  const openEditClassDialog = (row) => {
    setEditActivityId(row.activityId);
    setEditClassName(row.className);
    setIsEditClassOpen(true);
  };

  const handleEditClassName = async () => {
    const trimmedClassName = editClassName.trim();
    if (!editActivityId) {
      alert("Missing activityId.");
      return;
    }
    if (!trimmedClassName) {
      alert("Please enter a class name.");
      return;
    }

    try {
      await requestWithFallback({
        method: "put",
        path: `activities/${editActivityId}`,
        data: { title: trimmedClassName },
      });
      setIsEditClassOpen(false);
      setEditActivityId(null);
      await fetchActivities();
    } catch (error) {
      console.error("Failed to rename class:", error);
      alert("Failed to rename class.");
    }
  };

  const openDeleteDialog = (activityId) => {
    setDeleteActivityId(activityId);
    setIsDeleteOpen(true);
  };

  const handleDeleteRow = async () => {
    if (!deleteActivityId) {
      return;
    }
    try {
      await requestWithFallback({
        method: "delete",
        path: `activities/${deleteActivityId}`,
      });
      setDeleteActivityId(null);
      setIsDeleteOpen(false);
      await fetchActivities();
    } catch (error) {
      console.error("Failed to delete class row:", error);
      const detail = error.response?.data?.message || error.response?.data || error.message;
      const failedUrl = error?.config?.url ? `\nURL: ${error.config.url}` : "";
      alert(`Failed to delete class row: ${detail}${failedUrl}`);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <StudentLeftSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={containerStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "8px",
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
                  width: "650px",
                  maxWidth: "100%",
                  minHeight: "84px",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                  color: "#1e293b",
                  fontSize: "22px",
                  lineHeight: 1.35,
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 18px",
                  boxSizing: "border-box",
                }}
              >
                <p style={{ margin: 0, fontWeight: 700 }}>
                  You need to create a class first before you can add topics corresponding to that class.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px", paddingRight: "8%" }}>
              <button
                type="button"
                onClick={openCreateClassDialog}
                style={{
                  minWidth: "170px",
                  height: "48px",
                  border: "1.5px solid #000000",
                  borderRadius: "30px",
                  background: "rgba(204, 149, 101, 0.3)",
                  color: "#111111",
                  fontWeight: 700,
                  fontSize: "22px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "0 16px",
                  boxSizing: "border-box",
                }}
              >
                <img src={createClassIcon} alt="Create class" style={{ width: "24px", height: "24px" }} />
                <span>Create Class</span>
              </button>
            </div>

            <div
              style={{
                width: "min(1080px, 100%)",
                margin: "0 auto",
                background: "#ffffff",
                border: "2px solid #000000",
                borderRadius: "16px",
                overflow: "hidden",
                minHeight: "420px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: tableColumns,
                  alignItems: "center",
                  padding: "12px 18px",
                  borderBottom: "1px solid #000000",
                  fontSize: "22px",
                  fontWeight: 1000,
                  color: "#111111",
                }}
              >
                <span>Class</span>
                <span>Topic</span>
                <span>Invite Code</span>
                <span>Deadline</span>
                <span>Manage</span>
              </div>

              <div style={{ minHeight: "360px" }}>
                {hasClass ? (
                  classRows.map((row) => (
                    <div
                      key={row.activityId}
                      style={{
                        display: "grid",
                        gridTemplateColumns: tableColumns,
                        alignItems: "center",
                        padding: "10px 18px",
                        borderBottom: "1px solid #c7c7c7",
                        fontSize: "17px",
                        color: "#111111",
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>{row.className}</span>

                      <div>
                        {row.topicName ? (
                          <span style={{ fontWeight: 600 }}>{row.topicName}</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openAddTopicDialog(row)}
                            style={{
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              padding: 0,
                              lineHeight: 0,
                            }}
                            title="addtopic"
                          >
                            <img src={addTopicIcon} alt="addtopic" style={{ width: "20px", height: "20px" }} />
                          </button>
                        )}
                      </div>

                      <span>{row.inviteCode || "-"}</span>
                      <span>{row.deadline || "-"}</span>

                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <button
                          type="button"
                          onClick={() => openEditClassDialog(row)}
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            padding: 0,
                            lineHeight: 0,
                          }}
                          title="edit class name"
                        >
                          <img src={settingIcon} alt="setting" style={{ width: "20px", height: "20px" }} />
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteDialog(row.activityId)}
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            padding: 0,
                            lineHeight: 0,
                          }}
                          title="delete row"
                        >
                          <img src={clearIcon} alt="delete row" style={{ width: "20px", height: "20px" }} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      minHeight: "360px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#7c7c7c",
                      fontSize: "20px",
                      fontWeight: 600,
                    }}
                  >
                    {isLoading ? "Loading..." : loadError || 'No class yet. Please click "Create Class".'}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <Dialog open={isCreateClassOpen} onClose={() => setIsCreateClassOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Class Name"
            fullWidth
            value={newClassName}
            onChange={(event) => setNewClassName(event.target.value)}
          />
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            value={createStartDate}
            onChange={(event) => setCreateStartDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            value={createEndDate}
            onChange={(event) => setCreateEndDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateClassOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateClass}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isAddTopicOpen} onClose={() => setIsAddTopicOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Topic</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Topic Name"
            fullWidth
            value={newTopicName}
            onChange={(event) => setNewTopicName(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddTopicOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTopic}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isEditClassOpen} onClose={() => setIsEditClassOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Class Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Class Name"
            fullWidth
            value={editClassName}
            onChange={(event) => setEditClassName(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditClassOpen(false)}>Cancel</Button>
          <Button onClick={handleEditClassName}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Class Row</DialogTitle>
        <DialogContent style={{ paddingTop: "10px", fontSize: "16px" }}>
          Delete this row (class and topic shown in this row)?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteRow}>
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}


