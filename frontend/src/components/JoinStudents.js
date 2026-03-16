/*
import React, { useState } from "react";
// JoinStudents page for teacher-side batch import.
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar_Student";
import backIcon from "../assets/back.png";
import assistantImage from "../assets/揮手.gif";
import url from "../url.json";
import config from "../config.json";

const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "16px 20px 32px",
};

export default function JoinStudents() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleImport = async () => {
    if (isImporting) {
      return;
    }

    if (!file) {
      alert("Please select an Excel file first.");
      return;
    }

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".xlsx") && !lowerName.endsWith(".xls")) {
      alert("Only Excel files are supported.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsImporting(true);
      const response = await axios.post(
        `${url.backendHost + config[19].batchRegisterUrl}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert(response.data?.message || "Import successful!");
      setFile(null);
    } catch (error) {
      alert(error.response?.data?.message || "Import failed. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ece8e5" }}>
      <Navbar />

      <div style={containerStyle}>
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
              width: "550px",
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
            <p style={{ margin: 0, fontWeight: 700, display: "none" }}>
              You can use the “Batch Import” feature below to quickly add students.
            </p>
            <p style={{ margin: 0, fontWeight: 700 }}>
              You can use the "Batch Import" feature below to quickly add students.
            </p>
          </div>
        </div>

        <div
          style={{
            width: "min(760px, 100%)",
            height: "450px",
            margin: "0 auto",
            background: "#ffffff",
            border: "2px solid #000000",
            borderRadius: "16px",
            padding: "24px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#000000",
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            Batch Import Student Accounts
          </h2>

          <div style={{ color: "#000000", lineHeight: 1.5, fontSize: "18px" }}>
            <p style={{ margin: "0 0 8px 0" }}>
              1.
              <br />
              Please download the template file and fill in the student information according
              to the format.
            </p>
            <p style={{ margin: 0 }}>
              2. Only Excel files are supported. Please keep the same column order as the
              template.{" "}
              <a
                href="/example.xlsx"
                download
                style={{
                  color: "#1d4ed8",
                  textDecoration: "underline",
                  fontWeight: 600,
                }}
              >
                Download Template.
              </a>
            </p>
          </div>

          <div>
            <label
              htmlFor="join-students-upload"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "140px",
                height: "44px",
                padding: "0 16px",
                border: "1.5px solid #000000",
                borderRadius: "10px",
                background: "rgba(204, 149, 101, 0.3)",
                color: "#111111",
                fontWeight: 700,
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              Upload
            </label>
            <input
              id="join-students-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          <div
            style={{
              minHeight: "54px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              background: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              color: "#0f172a",
              fontSize: "17px",
            }}
          >
            Selected: {file ? file.name : "No file selected"}
          </div>

          <div
            style={{
              flex: 1,
              borderRadius: "12px",
              border: "1.5px solid #cbd5e1",
              background: "#ffffff",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end",
              padding: "16px",
              minHeight: "170px",
            }}
          >
            <button
              type="button"
              disabled={isImporting}
              onClick={handleImport}
              style={{
                width: "120px",
                height: "44px",
                border: "none",
                borderRadius: "10px",
                background: "#2563eb",
                color: "#ffffff",
                fontSize: "18px",
                fontWeight: 700,
                cursor: isImporting ? "not-allowed" : "pointer",
                opacity: isImporting ? 0.65 : 1,
              }}
            >
              {isImporting ? "Importing..." : "Import"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
*/

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar_Student";
import backIcon from "../assets/back.png";
import assistantImage from "../assets/\u63ee\u624b.gif";
import clearIcon from "../assets/XX.png";
import url from "../url.json";
import config from "../config.json";

const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "16px 20px 32px",
};

export default function JoinStudents() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleImport = async () => {
    if (!file) {
      alert("Please select an Excel file first.");
      return;
    }

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".xlsx") && !lowerName.endsWith(".xls")) {
      alert("Only Excel files are supported.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsImporting(true);
      const response = await axios.post(
        `${url.backendHost + config[19].batchRegisterUrl}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert(response.data?.message || "Import successful!");
      setFile(null);
    } catch (error) {
      alert(error.response?.data?.message || "Import failed. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearFile = () => {
    setFile(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      <Navbar />

      <div style={containerStyle}>
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
              width: "550px",
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
              You can use the "Batch Import" feature below to quickly add students.
            </p>
          </div>
        </div>

        <div
          style={{
            width: "min(760px, 100%)",
            height: "450px",
            margin: "0 auto",
            background: "#ffffff",
            border: "2px solid #000000",
            borderRadius: "16px",
            padding: "24px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#000000",
              fontSize: "28px",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            Batch Import Student Accounts
          </h2>

          <div style={{ color: "#000000", lineHeight: 1.5, fontSize: "18px" }}>
            <p style={{ margin: "0 0 8px 0" }}>
              1. Please download the template file and fill in the student information according
              to the format.
            </p>
            <p style={{ margin: 0 }}>
              2. Only Excel files are supported. Please keep the same column order as the
              template.{" "}
              <a
                href="/example.xlsx"
                download
                style={{
                  color: "#1d4ed8",
                  textDecoration: "underline",
                  fontWeight: 600,
                }}
              >
                Download Template.
              </a>
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <label
              htmlFor="join-students-upload"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "140px",
                height: "44px",
                padding: "0 16px",
                border: "1.5px solid #000000",
                borderRadius: "10px",
                background: "rgba(204, 149, 101, 0.3)",
                color: "#111111",
                fontWeight: 700,
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              Upload
            </label>
            <input
              id="join-students-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          <div
            style={{
              minHeight: "54px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              background: "rgba(217, 217, 217, 0.31)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 14px",
              color: "#0f172a",
              fontSize: "17px",
            }}
          >
            <span>Selected: {file ? file.name : "No file selected"}</span>
            {file && (
              <img
                src={clearIcon}
                alt="Remove selected file"
                onClick={handleClearFile}
                style={{ width: "15px", height: "15px", cursor: "pointer" }}
              />
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "4px",
            }}
          >
            <span
              onClick={isImporting ? undefined : handleImport}
              role="button"
              aria-disabled={isImporting}
              style={{
                minWidth: "120px",
                height: "28px",
                background: "transparent",
                color: "#2563eb",
                fontSize: "16px",
                fontWeight: 700,
                cursor: isImporting ? "not-allowed" : "pointer",
                opacity: isImporting ? 0.65 : 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                userSelect: "none",
                pointerEvents: isImporting ? "none" : "auto",
              }}
            >
              {isImporting ? "IMPORTING..." : "IMPORT"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
