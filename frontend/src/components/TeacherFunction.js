import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar_Student";
import backIcon from "../assets/back.png";
import assistantImage from "../assets/揮手.gif";
import feature1 from "../assets/teacher_home1.png";
import feature2 from "../assets/teacher_home2.png";
import feature3 from "../assets/teacher_home3.png";
import feature4 from "../assets/teacher_home4.png";

import number1 from "../assets/數字1.png";
import number2 from "../assets/數字2.png";
import number3 from "../assets/數字3.png";
import number4 from "../assets/數字4.png";



const cardData = [
  {
    id: 1,
    numberImage: number1,
    featureImage: feature1,
    title: "Add Student",
    description: [
      "Students can choose to register manually themselves, or you can complete the registration for them in bulk.",
    ],
    enterPath: "/JoinStudents",
  },
  {
    id: 2,
    numberImage: number2,
    featureImage: feature2,
    title: "Manage Class",
    description: ["Create Classes and Argumentative Essay Topics"],
    enterPath: "/ClassManage",
  },
  {
    id: 3,
    numberImage: number3,
    featureImage: feature3,
    title: "View Students' Works",
    description: [
      "Select this after discussing with the CAWS BOT.",
      "Start writing your argumentative essay.",
    ],
    enterPath: "/StudentWork",
  },
  {
    id: 4,
    numberImage: number4,
    featureImage: feature4,
    title: "Dashboard",
    description: ["Check your teacher's feedback and scores."],
    enterPath: "",
  },
];

export default function TeacherFunction() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "16px 20px 32px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "18px",
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
            src={assistantImage}
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
              height: "80px",
              maxWidth: "100%",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              color: "#1e293b",
              fontSize: "22px",
              lineHeight: 1.35,
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              padding: "0 18px",
              boxSizing: "border-box",
            }}
          >
            <p style={{ margin: 0, fontWeight: 700 }}>
              Please choose the task you would like to work on today.
            </p>
          </div>
        </div>

        <div
          style={{
            borderRadius: "24px",
            padding: "16px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "18px",
              alignItems: "stretch",
              justifyItems: "center",
            }}
          >
            {cardData.map((card) => (
              <div
                key={card.id}
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "300px",
                  minHeight: "350px",
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1.5px solid #000000",
                  boxShadow: "0 10px 25px rgba(30, 41, 59, 0.08)",
                  padding: "16px 14px 18px",
                  textAlign: "left",
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
                    width: "130px",
                    height: "130px",
                    objectFit: "contain",
                    marginTop: "28px",
                    marginBottom: "10px",
                  }}
                />

                <h2
                  style={{
                    margin: "0 0 6px",
                    padding: "8px 0",
                    fontSize: "22px",
                    lineHeight: 1.3,
                    height: "76px",
                    color: "#0f172a",
                    textAlign: "center",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {card.title}
                </h2>

                <div
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                  }}
                >
                  {card.description.map((line) => (
                    <p
                      key={line}
                      style={{
                        margin: "1px 0",
                        fontSize: "15px",
                        lineHeight: 1.45,
                        color: "#334155",
                        textAlign: "center",
                        width: "100%",
                      }}
                    >
                      {line}
                    </p>
                  ))}
                </div>

                <a
                  href={card.enterPath}
                  onClick={(event) => {
                    if (!card.enterPath) {
                      event.preventDefault();
                    }
                  }}
                  style={{
                    marginTop: "auto",
                    width: "140px",
                    height: "40px",
                    background: "rgba(204, 149, 101, 0.3)",
                    border: "1.5px solid #000000",
                    borderRadius: "10px",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#111111",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                  }}
                >
                  ENTER
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
