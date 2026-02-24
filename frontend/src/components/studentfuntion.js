import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar_Student";

import number1 from "../assets/數字1.png";
import number2 from "../assets/數字2.png";
import number3 from "../assets/數字3.png";
import number4 from "../assets/數字4.png";

import feature1 from "../assets/學生功能1.png";
import feature2 from "../assets/學生功能2.png";
import feature3 from "../assets/學生功能3.png";
import feature4 from "../assets/學生功能4.png";
import cawsOwl from "../assets/去背.png";

const cardData = [
  {
    id: 1,
    numberImage: number1,
    featureImage: feature1,
    title: "KF Argumentation",
    description: [
      "If you haven't started the discussion yet, select this.",
      "Discuss with your group members in KF.",
    ],
  },
  {
    id: 2,
    numberImage: number2,
    featureImage: feature2,
    title: "Chatbot",
    description: [
      "KF Analysis Mode",
      "Writing Assistant Mode",
      "Writing Analysis Mode",
    ],
  },
  {
    id: 3,
    numberImage: number3,
    featureImage: feature3,
    title: "Argumentative Writing",
    description: [
      "Select this after discussing with the CAWS BOT.",
      "Start writing your argumentative essay.",
    ],
  },
  {
    id: 4,
    numberImage: number4,
    featureImage: feature4,
    title: "Scoring & Feedback",
    description: ["Check your teacher's feedback and scores."],
  },
];

export default function Studentfuntion() {
  const navigate = useNavigate();

  const handleEnterClick = (id) => {
    if (id === 1) {
      navigate("/kfweb");
      return;
    }
    if (id === 2) {
      navigate("/Chatbot");
    }
    if (id === 3) {
      navigate("/writing_area");
    }
    if (id === 4) {
      navigate("/freebackstudent");
    }
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
            <p style={{ margin: 0 }}>Hi! I'm your CAWS Bot.</p>
            <p style={{ margin: 0 }}>These are the <strong>4</strong> main functions of CAWS.</p>
            <p style={{ margin: 0 }}>Please select one of the followings.</p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px",
            justifyItems: "center",
          }}
        >
          {cardData.map((card) => (
            <div
              key={card.id}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "270px",
                minHeight: "380px",
                background: "#ffffff",
                borderRadius: "20px",
                border: "1px solid #dbe3ef",
                boxShadow: "0 10px 25px rgba(30, 41, 59, 0.08)",
                padding: "20px 18px 24px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img
                src={card.numberImage}
                alt={`number-${card.id}`}
                style={{
                  width: "40px",
                  height: "40px",
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  objectFit: "contain",
                }}
              />

              <img
                src={card.featureImage}
                alt={card.title}
                style={{
                  width: "142px",
                  height: "142px",
                  objectFit: "contain",
                  marginTop: "34px",
                  marginBottom: "18px",
                }}
              />

              <h2
                style={{
                  margin: "0 0 10px",
                  padding: "20px 20px",
                  fontSize: "24px",
                  color: "#0f172a",
                }}
              >
                {card.title}
              </h2>

              {card.description.map((line) => (
                <p
                  key={line}
                  style={{
                    margin: "2px auto",
                    fontSize: "16px",
                    lineHeight: 1.6,
                    color: "#334155",
                    textAlign: "left",
                    width: "fit-content",
                    maxWidth: "100%",
                  }}
                >
                  {line}
                </p>
              ))}

              <button
                type="button"
                onClick={() => handleEnterClick(card.id)}
                style={{
                  marginTop: "auto",
                  width: "140px",
                  height: "44px",
                  background: "rgba(204, 149, 101, 0.3)",
                  border: "1.5px solid #000000",
                  borderRadius: "10px",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#111111",
                  cursor: "pointer",
                }}
              >
                Enter
              </button>
            </div>
          ))}
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
              width: "140px",
              height: "44px",
              background: "rgba(204, 149, 101, 0.3)",
              border: "1.5px solid #000000",
              borderRadius: "10px",
              fontSize: "18px",
              fontWeight: 700,
              color: "#111111",
              cursor: "pointer",
            }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
