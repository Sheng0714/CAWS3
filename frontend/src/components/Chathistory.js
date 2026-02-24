import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar_Student";
import config from "../config.json";
import url from "../url.json";

import cawsOwl from "../assets/去背.png";

export default function Studentfuntion() {
  const navigate = useNavigate();
  const [className, setClassName] = useState(localStorage.getItem("activityTitle") || "");
  const [topicName, setTopicName] = useState(localStorage.getItem("groupName") || "");

  useEffect(() => {
    const activityId = sessionStorage.getItem("activityId") || localStorage.getItem("activityId");
    const groupIdRaw = sessionStorage.getItem("groupId") || localStorage.getItem("groupId");

    if (!activityId) return;

    const fetchClassAndTopic = async () => {
      try {
        const response = await axios.get(
          `${url.backendHost + config[6].enterActivity}/${activityId}`
        );

        const activityData = response.data;
        const resolvedClassName = activityData?.title || "";

        let resolvedTopicName = "";
        if (groupIdRaw) {
          const groupIdNum = Number(groupIdRaw);
          const group = activityData?.Groups?.find(
            (item) => item.id === groupIdNum || item.groupId === groupIdNum
          );
          resolvedTopicName = group?.groupName || "";
        }

        setClassName(resolvedClassName);
        setTopicName(resolvedTopicName);

        if (resolvedClassName) {
          localStorage.setItem("activityTitle", resolvedClassName);
        }
        if (resolvedTopicName) {
          localStorage.setItem("groupName", resolvedTopicName);
        }
      } catch (error) {
        console.error("Failed to fetch class/topic:", error);
      }
    };

    fetchClassAndTopic();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#ece8e5" }}>
      <Navbar />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 20px 56px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "32px",
          }}
        >
          <img
            src={cawsOwl}
            alt="CAWS owl"
            style={{
              width: "130px",
              height: "130px",
              objectFit: "contain",
            }}
          />

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "16px 20px",
              maxWidth: "520px",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              color: "#1e293b",
              fontSize: "25px",
              lineHeight: 1.45,
              textAlign: "left",
            }}
          >
            <p style={{ margin: 0 }}>
               This mode organizes the arguments and evidence from your KF discussion.
            </p>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            background: "#ffffff",
            border: "1px solid #dbe3ef",
            borderRadius: "20px",
            minHeight: "420px",
            padding: "28px 24px",
            boxShadow: "0 10px 25px rgba(30, 41, 59, 0.08)",
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              width: "120px",
              height: "42px",
              background: "rgba(204, 149, 101, 0.3)",
              border: "1.5px solid #000000",
              borderRadius: "10px",
              fontSize: "18px",
              fontWeight: 700,
              color: "#111111",
              cursor: "pointer",
            }}
          >
            BACK
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              flexWrap: "wrap",
              paddingRight: "140px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              班級：{className || "---"}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              主題：{topicName || "---"}
            </p>
          </div>

          <div
            style={{
              marginTop: "16px",
              borderBottom: "1.5px solid #d1d5db",
              width: "100%",
            }}
          />

          <p
            style={{
              marginTop: "16px",
              marginBottom: 0,
              fontSize: "22px",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Your Chat History:
          </p>
        </div>
      </div>
    </div>
  );
}
