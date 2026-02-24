import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar_Student";

import ICON1 from "../assets/新聊天.png";
import ICON2 from "../assets/歷史紀錄2.png";
import cawsOwl from "../assets/去背.png";

export default function Studentfuntion() {
  const navigate = useNavigate();

  const actionButtonStyle = {
    width: "228px",
    height: "73px",
    background: "rgba(204, 149, 101, 0.3)",
    border: "1.5px solid #000000",
    borderRadius: "10px",
    fontSize: "26px",
    fontWeight: 700,
    color: "#111111",
    cursor: "pointer",
  };

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
            background: "#ffffff",
            border: "1px solid #dbe3ef",
            borderRadius: "20px",
            boxShadow: "0 10px 25px rgba(30, 41, 59, 0.08)",
            padding: "40px 20px",
            minHeight: "420px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: "64px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "18px",
              }}
            >
              <img
                src={ICON1}
                alt="Start New Chat"
                style={{ width: "110px", height: "110px", objectFit: "contain" }}
              />
              <button
                type="button"
                onClick={() => navigate("/Newchat")}
                style={actionButtonStyle}
              >
                Start New Chat
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "18px",
              }}
            >
              <img
                src={ICON2}
                alt="Chat History"
                style={{ width: "110px", height: "110px", objectFit: "contain" }}
              />
              <button
                type="button"
                onClick={() => navigate("/Chathistory")}
                style={actionButtonStyle}
              >
                Chat History
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "28px",
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              width: "130px",
              height: "60px",
              background: "rgba(204, 149, 101, 0.3)",
              border: "1.5px solid #000000",
              borderRadius: "10px",
              fontSize: "20px",
              fontWeight: 700,
              color: "#111111",
              cursor: "pointer",
            }}
          >
            BACK
          </button>
        </div>
      </div>
    </div>
  );
}
