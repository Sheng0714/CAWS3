import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar_Student";
import backIcon from "../assets/back.png";

import number1 from "../assets/數字1.png";
import number2 from "../assets/數字2.png";
import number3 from "../assets/數字3.png";


import ICON1 from "../assets/CHATBOT1.png";
import ICON2 from "../assets/CHATBOT2.png";
import ICON3 from "../assets/CHATBOT3.png";

import cawsOwl from "../assets/去背.png";

const cardData = [
  {
    id: 1,
    numberImage: number1,
    featureImage: ICON1,
    title: "KF Analysis",
    description: [
      "Summarize the data your group discussed in KF.",
    ],
  },
  {
    id: 2,
    numberImage: number2,
    featureImage: ICON2,
    title: "Writing Assistant",
    description: [
      "Check your knowledge of argumentative essay structure.",
      "Build your writing outline.",
    ],
  },
  {
    id: 3,
    numberImage: number3,
    featureImage: ICON3,
    title: "Argumentative Writing",
    description: [
      "Receive feedback and suggestions before submitting your argumentative essay.",
    ],
  },
  
];

export default function Studentfuntion() {
  const navigate = useNavigate();

  const handleEnterClick = (id) => {
    if (id === 1) {
      navigate("/Chatbotlogin");
      return;
    }
    if (id === 2) {
      navigate("/Chatbotlogin");
    }
    if (id === 3) {
      navigate("/Chatbotlogin");
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
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
          >
            <img src={backIcon} alt="Back" width={25} height={25} />
          </button>

          <img
            src={cawsOwl}
            alt="CAWS owl"
            style={{
              width: "170px",
              height: "170px",
              objectFit: "contain",
            }}
          />

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "16px 20px",
              height: "155px",
              width: "900px",
              maxWidth: "100%",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              color: "#1e293b",
              fontSize: "25px",
              lineHeight: 1.45,
              textAlign: "left",
            }}
          >
            <p style={{ margin: 0, fontWeight: 700 }}>Please enter one of the following Chatbots before starting your writing.</p>
            
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
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
                maxWidth: "340px",
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
                  fontSize: "24px",
                  padding: "20px 20px",
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
                    textAlign: "center",
                    width: "100%",
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
                ENTER
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
