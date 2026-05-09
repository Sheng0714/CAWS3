import React, { useState } from "react";
import Navbar from "../components/HomePage_Navbar";
import axios from "axios";
import { useSignIn } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from "@mui/material";
import url from "../url.json";
import config from "../config.json";
import { Register } from "../components/Register";
import { Login } from "../components/Login";

export default function Home() {
  const [data, setData] = useState({ email: "", password: "" });
  const [role, setRole] = useState("student");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);

  const signIn = useSignIn();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => setRole(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { email: data.email, password: data.password, role };
    try {
      const response = await axios.post(
        url.backendHost + config[1].loginUrl,
        userData
      );
      setIsLoggedIn(true);
      setData({ email: "", password: "" });
      signIn({
        token: response.data.jwtToken,
        expiresIn: 3600,
        tokenType: "Bearer",
        authState: { ...response.data },
      });
      localStorage.setItem("jwtToken", response.data.jwtToken);
      localStorage.setItem("userId", response.data.id);
      localStorage.setItem("name", response.data.name);
      localStorage.setItem("email", response.data.email);
      localStorage.setItem("role", role);
      alert("Login Successful!");
      if (role === "student") navigate("/kf");
      else if (role === "teacher") navigate("/teacher/teacher_home");
    } catch (error) {
      if (!error.response) alert("敺垢隡箸??券??憭望?");
      else {
        switch (error.response.status) {
          case 401:
            alert("?餃??憭望?嚗?蝣箄?撣唾?撖Ⅳ");
            break;
          default:
            alert("?芰?航炊嚗??舐窗蝞∠??? " + error.response.status);
        }
      }
    }
  };

  return (
    <div
      className="home-container"
      style={{
        backgroundColor: "#DEDED6",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />
      <div
        className="home-banner-container"
        style={{
          backgroundColor: "#DEDED6",
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
        }}
      >
        <div
          className="content-wrapper"
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap", // RWD嚗??Ｗ???銝???
            justifyContent: "center",
            alignItems: "stretch",
            width: "100%",
            maxWidth: "1200px",
            gap: "3vw",
            transform: "translateX(-32px)",
          }}
        >
          {/* 撌阡????憛?*/}
          {/* <div
          className="left-panel"
            style={{
              backgroundColor: "#CCC6B8",
              flex: "1 1 50%",
              minWidth: "280px",
              height: "80%",
              borderRadius: "8px",
            }}
          /> */}
        {/* 撌阡????憛?*/}
<div
  className="left-panel"
  style={{
    flex: "1 1 50%",
    minWidth: "280px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column", // 靽格?箏??湔???霈?摮??銝
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: "1.2rem 2rem 2rem 1rem", // ?舫嚗??頝誑?踹??楠??
  }}
>
    <h1
    style={{
      fontSize: "clamp(2rem, 5vw, 4rem)",
      fontWeight: 700,
      margin: 0,
      letterSpacing: "0.04em",
    }}
  >
    CAWS
  </h1>
  <p
    style={{
      fontSize: "clamp(1.25rem, 2.5vw, 1.8rem)",
      lineHeight: 1.5,
      marginTop: "1rem",
      marginBottom: "1.5rem",
      maxWidth: "32ch",
    }}
  >
    A powerful AI-assisted argumentative writing platform that helps you
    write more efficiently.
  </p>
  <Button
    type="button"
    variant="contained"
    style={{
      backgroundColor: "#573f3f",
      color: "#E9DECC",
      borderRadius: 10,
      padding: "0.6rem 1.4rem",
      fontWeight: "bold",
      textTransform: "none",
    }}
    onClick={() => setOpenRegister(true)}
  >
    Get started
  </Button>
</div>



          {/* ?喲??餃?憛?憭惜摰孵嚗?*/}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "center",
              flex: "1 1 40%",
              minWidth: "280px",
              height: "80%",
              boxSizing: "border-box",
              paddingTop: "0",
              marginTop: "-0.5rem",
            }}
          >
            {/* 璅??? */}
            <div
              style={{
                width: "100%",
                textAlign: "center",
                color: "#573f3f",
                fontSize: "clamp(1.2rem, 2.5vw, 2rem)", // RWD 摮?
                fontWeight: "600",
                lineHeight: "1.4",
                textShadow: "1px 1px 3px rgba(0,0,0,0.2)",
                letterSpacing: "1px",
              }}
            >
              Inspire Thinking <br />
              Write Infinite Possibilities <br />
              with A
              
            </div>

            {/* ?餃銵典?憛?*/}
            <div
              className="form-section"
              style={{
                backgroundColor: "#573f3f",
                padding: "2rem",
                width: "100%",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "stretch",
                color: "#DEDED6",
                boxSizing: "border-box",
                marginTop: "1rem",
              }}
            >
              <TextField
                label="Please enter your email"
                type="email"
                name="email"
                value={data.email}
                fullWidth
                onChange={handleChange}
                style={{ marginBottom: "1rem" }}
                sx={{
                  "& .MuiInputBase-root": { backgroundColor: "#DEDED6" },
                  "& .MuiInputLabel-root": { color: "#333" },
                  "& .MuiOutlinedInput-root fieldset": {
                    borderColor: "#DEDED6",
                  },
                }}
              />
              <TextField
                label="Please enter your password"
                type="password"
                name="password"
                value={data.password}
                fullWidth
                onChange={handleChange}
                style={{ marginBottom: "1rem" }}
                sx={{
                  "& .MuiInputBase-root": { backgroundColor: "#DEDED6" },
                  "& .MuiInputLabel-root": { color: "#333" },
                  "& .MuiOutlinedInput-root fieldset": {
                    borderColor: "#DEDED6",
                  },
                }}
              />
              <FormControl
                component="fieldset"
                style={{ marginBottom: "1rem" }}
              >
                <FormLabel component="legend" sx={{ color: "#DEDED6" }}>
                  Role :
                </FormLabel>
                <RadioGroup
                  row
                  value={role}
                  onChange={handleRoleChange}
                  sx={{
                    "& .MuiFormControlLabel-label": { color: "#DEDED6" },
                    "& .MuiSvgIcon-root": { color: "#DEDED6" },
                  }}
                >
                  <FormControlLabel
                    value="student"
                    control={<Radio />}
                    label="Student"
                  />
                  <FormControlLabel
                    value="teacher"
                    control={<Radio />}
                    label="Teacher"
                  />
                </RadioGroup>
              </FormControl>

              <Button
                type="button"
                variant="contained"
                style={{
                  backgroundColor: "#E9DECC",
                  color: "#573f3f",
                  alignSelf: "flex-end",
                  borderRadius: 10,
                  padding: "0.5rem 2rem",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
                onClick={handleSubmit}
              >
                LOGIN
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Login
        open={openLogin}
        setOpen={setOpenLogin}
        setOpenRegister={setOpenRegister}
      />
      <Register
        open={openRegister}
        setOpen={setOpenRegister}
        setOpenLogin={setOpenLogin}
      />
    </div>
  );
}

