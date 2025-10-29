// import React from "react";
// import Navbar from "../components/HomePage_Navbar";
// import BannerImage from "../assets/home-banner-image.png";
// import { FiArrowRight } from "react-icons/fi";
// import { Register } from "../components/Register";

// export default function Home() {
//     return (
//         <div className="home-container">
//             <Navbar />
//             <div className="home-banner-container">
//                 <div className="home-text-section">
//                     <h1 className="primary-heading">
//                         以想法為中心，
//                         <br/>
//                         盡情探究
//                     </h1>
//                     <button className="secondary-button">
//                         加入我們吧！前往
//                         <Register />
//                         <FiArrowRight />{" "}
//                     </button>
//                 </div>
//                 <div className="home-image-section">
//                     <img src={BannerImage} alt="" />
//                 </div>
//             </div>
//         </div>
//     )
// }




// import React, { useState } from "react";
// import Navbar from "../components/HomePage_Navbar";
// import axios from "axios";
// import { useSignIn } from "react-auth-kit";
// import { useNavigate } from "react-router-dom";
// import {
//   TextField,
//   Button,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
//   FormControl,
//   FormLabel,
// } from "@mui/material";
// import url from "../url.json";
// import config from "../config.json";
// import { Register } from "../components/Register";
// import { Login } from "../components/Login"; // 假設您已將 Login 組件放在這個路徑

// export default function Home() {
//   const [data, setData] = useState({
//     email: "",
//     password: "",
//   });
//   const [role, setRole] = useState("student"); // 預設為 student
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [openLogin, setOpenLogin] = useState(false); // 控制 Login 對話框
//   const [openRegister, setOpenRegister] = useState(false); // 控制 Register 對話框

//   const signIn = useSignIn();
//   const navigate = useNavigate();

//   // 處理表單輸入變化
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   // 處理角色選擇變化
//   const handleRoleChange = (e) => {
//     setRole(e.target.value);
//   };

//   // 處理表單提交
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const userData = {
//       email: data.email,
//       password: data.password,
//       role, // 將 role 傳給後端（如果後端需要）
//     };
//     try {
//       const response = await axios.post(
//         url.backendHost + config[1].loginUrl,
//         userData
//       );
//       setIsLoggedIn(true);
//       setData({ email: "", password: "" });

//       // 使用 react-auth-kit 的 signIn
//       signIn({
//         token: response.data.jwtToken,
//         expiresIn: 3600,
//         tokenType: "Bearer",
//         authState: { ...response.data },
//       });

//       // 儲存到 localStorage
//       localStorage.setItem("jwtToken", response.data.jwtToken);
//       localStorage.setItem("userId", response.data.id);
//       localStorage.setItem("name", response.data.name);
//       localStorage.setItem("email", response.data.email);
//       localStorage.setItem("role", role);

//       alert("登入成功!");

//       // 根據角色跳轉頁面
//       if (role === "student") {
//         navigate("/kf");
//       } else if (role === "teacher") {
//         navigate("/teacher/teacher_home");
//       }
//     } catch (error) {
//       if (!error.response) {
//         alert("後端伺服器連結失敗");
//       } else {
//         switch (error.response.status) {
//           case 401:
//             alert("登入授權失敗，請確認帳號密碼");
//             break;
//           default:
//             alert("未知錯誤，請聯絡管理員: " + error.response.status);
//         }
//       }
//     }
//   };

//   return (
//     <div className="home-container">
//       <Navbar />
//       <div className="home-banner-container">
//         <div className="home-text-section">
//           <h1 className="primary-heading">
//             Inspire Thinking
//             <br />
//             Write Infinite Possibilities
//           </h1>
//         </div>

//         <div
//           style={{
//             backgroundColor: "white",
//             padding: "20px",
//             marginRight: "-150px",
//             marginTop: "80px",
//             width: "500px",
//             margin: "0 auto",
//           }}
//         >
//           <form onSubmit={handleSubmit}>
//             <TextField
//               label="Please enter your email"
//               type="email"
//               name="email"
//               value={data.email}
//               fullWidth
//               onChange={handleChange}
//               style={{ marginBottom: "16px" }}
//             />
//             <TextField
//               label="Please enter your password"
//               type="password"
//               name="password"
//               value={data.password}
//               fullWidth
//               onChange={handleChange}
//               style={{ marginBottom: "16px" }}
//             />
//             <FormControl
//               component="fieldset"
//               style={{ marginBottom: "16px" }}
//             >
//               <FormLabel component="legend">Role</FormLabel>
//               <RadioGroup row value={role} onChange={handleRoleChange}>
//                 <FormControlLabel
//                   value="student"
//                   control={<Radio />}
//                   label="Student"
//                 />
//                 <FormControlLabel
//                   value="teacher"
//                   control={<Radio />}
//                   label="Teacher"
//                 />
//               </RadioGroup>
//             </FormControl>
//             <Button
//               type="submit"
//               variant="contained"
//               color="primary"
//               style={{ marginLeft: "16px", top: "28px" }}
//             >
//               Login
//             </Button>

//             <div style={{ marginTop: "16px" }}>
//               Haven't registered yet?
//               {/* <button
//                 type="button"
//                 className="register-button"
//                 style={{ marginLeft: "20px" }}
//                 onClick={() => setOpenRegister(true)}
//               >
//                 register
//                 <Register />
//               </button> */}
//               <button type="button" className='register-button' style={{ marginLeft: '20px'}}>register<Register /></button>
//                             {/* <Button variant="outlined" color="secondary" style={{ marginLeft: '20px' }} onClick={handleForgetPasswordClick}>
//                 forget the password?
//             </Button> */}
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* 整合 Login 組件作為對話框 */}
//       <Login
//         open={openLogin}
//         setOpen={setOpenLogin}
//         setOpenRegister={setOpenRegister}
//       />
//     </div>
//   );
// }






// import React, { useState } from "react";
// import Navbar from "../components/HomePage_Navbar";
// import axios from "axios";
// import { useSignIn } from "react-auth-kit";
// import { useNavigate } from "react-router-dom";
// import {
//   TextField,
//   Button,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
//   FormControl,
//   FormLabel,
// } from "@mui/material";
// import url from "../url.json";
// import config from "../config.json";
// import { Register } from "../components/Register"; // 確保路徑正確
// import { Login } from "../components/Login";

// export default function Home() {
//   const [data, setData] = useState({
//     email: "",
//     password: "",
//   });
//   const [role, setRole] = useState("student");
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [openLogin, setOpenLogin] = useState(false);
//   const [openRegister, setOpenRegister] = useState(false);

//   const signIn = useSignIn();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const handleRoleChange = (e) => {
//     setRole(e.target.value);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const userData = {
//       email: data.email,
//       password: data.password,
//       role,
//     };
//     try {
//       const response = await axios.post(
//         url.backendHost + config[1].loginUrl,
//         userData
//       );
//       setIsLoggedIn(true);
//       setData({ email: "", password: "" });
//       signIn({
//         token: response.data.jwtToken,
//         expiresIn: 3600,
//         tokenType: "Bearer",
//         authState: { ...response.data },
//       });
//       localStorage.setItem("jwtToken", response.data.jwtToken);
//       localStorage.setItem("userId", response.data.id);
//       localStorage.setItem("name", response.data.name);
//       localStorage.setItem("email", response.data.email);
//       localStorage.setItem("role", role);
//       alert("Login Successful!");
//       if (role === "student") navigate("/kf");
//       else if (role === "teacher") navigate("/teacher/teacher_home");
//     } catch (error) {
//       if (!error.response) {
//         alert("後端伺服器連結失敗");
//       } else {
//         switch (error.response.status) {
//           case 401:
//             alert("登入授權失敗，請確認帳號密碼");
//             break;
//           default:
//             alert("未知錯誤，請聯絡管理員: " + error.response.status);
//         }
//       }
//     }
//   };

//   return (
//     <div className="home-container">
//       <Navbar />
//       <div className="home-banner-container">
//         <div className="content-wrapper">

//         <div className="home-text-section">
//           <h1 className="primary-heading">
//             Inspire Thinking
//             <br />
//             Write Infinite Possibilities
//             <br />
//             with AI
//           </h1>
//         </div>

//         <div
//           // style={{
//           //   backgroundColor: "white",
//           //   padding: "20px",
//           //   marginRight: "-150px",
//           //   marginTop: "80px",
//           //   width: "500px",
//           //   margin: "0 auto",
//           // }}
//           className="form-section"
//         >
//           <form onSubmit={handleSubmit}>
//             <TextField
//               label="Please enter your email"
//               type="email"
//               name="email"
//               value={data.email}
//               fullWidth
//               onChange={handleChange}
//               style={{ marginBottom: "16px" }}
//             />
//             <TextField
//               label="Please enter your password"
//               type="password"
//               name="password"
//               value={data.password}
//               fullWidth
//               onChange={handleChange}
//               style={{ marginBottom: "16px" }}
//             />
//             <FormControl
//               component="fieldset"
//               style={{ marginBottom: "16px" }}
//             >
//               <FormLabel component="legend">Role:</FormLabel>
//               <RadioGroup row value={role} onChange={handleRoleChange}>
//                 <FormControlLabel
//                   value="student"
//                   control={<Radio />}
//                   label="Student"
//                 />
//                 <FormControlLabel
//                   value="teacher"
//                   control={<Radio />}
//                   label="Teacher"
//                 />
//               </RadioGroup>
//             </FormControl>
//             <br/>
//             <Button
//               type="submit"
//               variant="contained"
//               color="primary"
//               style={{ marginLeft: "16px", top: "5px" }}
//             >
//               Login
//             </Button>

//             {/* <div style={{ marginTop: "16px" }}>
//               Haven't registered yet?
//               <Button
//                 variant="outlined"
//                 color="secondary"
//                 style={{ marginLeft: "20px" }}
//                 onClick={() => setOpenRegister(true)}
//               >
//                 Register
//               </Button>
//             </div> */}
//           </form>
//         </div>
//         </div>
//       </div>

//       <Login
//         open={openLogin}
//         setOpen={setOpenLogin}
//         setOpenRegister={setOpenRegister}
//       />
//       <Register
//         open={openRegister}
//         setOpen={setOpenRegister}
//         setOpenLogin={setOpenLogin}
//       />
//     </div>
//   );
// }


// import React, { useState } from "react";
// import Navbar from "../components/HomePage_Navbar";
// import axios from "axios";
// import { useSignIn } from "react-auth-kit";
// import { useNavigate } from "react-router-dom";
// import {
//   TextField,
//   Button,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
//   FormControl,
//   FormLabel,
// } from "@mui/material";
// import url from "../url.json";
// import config from "../config.json";
// import { Register } from "../components/Register"; // 確保路徑正確
// import { Login } from "../components/Login";

// export default function Home() {
//   const [data, setData] = useState({ email: "", password: "" });
//   const [role, setRole] = useState("student");
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [openLogin, setOpenLogin] = useState(false);
//   const [openRegister, setOpenRegister] = useState(false);

//   const signIn = useSignIn();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleRoleChange = (e) => setRole(e.target.value);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const userData = { email: data.email, password: data.password, role };
//     try {
//       const response = await axios.post(
//         url.backendHost + config[1].loginUrl,
//         userData
//       );
//       setIsLoggedIn(true);
//       setData({ email: "", password: "" });
//       signIn({
//         token: response.data.jwtToken,
//         expiresIn: 3600,
//         tokenType: "Bearer",
//         authState: { ...response.data },
//       });
//       localStorage.setItem("jwtToken", response.data.jwtToken);
//       localStorage.setItem("userId", response.data.id);
//       localStorage.setItem("name", response.data.name);
//       localStorage.setItem("email", response.data.email);
//       localStorage.setItem("role", role);
//       alert("Login Successful!");
//       if (role === "student") navigate("/kf");
//       else if (role === "teacher") navigate("/teacher/teacher_home");
//     } catch (error) {
//       if (!error.response) alert("後端伺服器連結失敗");
//       else {
//         switch (error.response.status) {
//           case 401:
//             alert("登入授權失敗，請確認帳號密碼");
//             break;
//           default:
//             alert("未知錯誤，請聯絡管理員: " + error.response.status);
//         }
//       }
//     }
//   };

//   return (
//     <div
//       className="home-container"
//       style={{ backgroundColor: "#DEDED6", minHeight: "100vh" }}
//     >
//       <Navbar />
//       <div
//         className="home-banner-container"
//         style={{
//           backgroundColor: "#DEDED6",
//           minHeight: "calc(100vh - 120px)",
//         }}
//       >
//         <div
//   className="content-wrapper"
//   style={{
//     display: "flex",
//     justifyContent: "flex-start", // ✅ 改這裡，讓內容靠左對齊
//     alignItems: "flex-end", // 讓右邊登入框靠底對齊
//     width: "100vw",
//     height: "calc(100vh - 120px)",
//     backgroundColor: "#DEDED6",
//     padding: "0 5vw 5vh 5vw", // 下方與左右邊留白
//     boxSizing: "border-box",
//     gap: "3vw", // ✅ 新增一點間距，讓左右區塊不緊貼
//   }}
// >
//   {/* 左邊插圖區塊 */}
//   <div
//     style={{
//       backgroundColor: "#CCC6B8",
//       width: "100%",
//       height: "80%", // 高度略高於右邊登入框
//       borderRadius: "0 0 0 0px", // 模仿設計的圓角
//     }}
//   />

//   {/* 右邊登入區塊 */}
//   <div
//     className="form-section"
//     style={{
//       backgroundColor: "#573f3f",
//       padding: "2rem",
//       width: "30%",
//       borderRadius: "0",
//       display: "flex",
//       flexDirection: "column",
//       justifyContent: "flex-start",
//       alignItems: "stretch",
//       color: "#DEDED6",
//       boxSizing: "border-box",
//     }}
//   >
//     <TextField
//       label="Please enter your email"
//       type="email"
//       name="email"
//       value={data.email}
//       fullWidth
//       onChange={handleChange}
//       style={{ marginBottom: "1rem" }}
//       sx={{
//         "& .MuiInputBase-root": { backgroundColor: "#DEDED6" },
//         "& .MuiInputLabel-root": { color: "#333" },
//         "& .MuiOutlinedInput-root fieldset": { borderColor: "#DEDED6" },
//       }}
//     />
//     <TextField
//       label="Please enter your password"
//       type="password"
//       name="password"
//       value={data.password}
//       fullWidth
//       onChange={handleChange}
//       style={{ marginBottom: "1rem" }}
//       sx={{
//         "& .MuiInputBase-root": { backgroundColor: "#DEDED6" },
//         "& .MuiInputLabel-root": { color: "#333" },
//         "& .MuiOutlinedInput-root fieldset": { borderColor: "#DEDED6" },
//       }}
//     />
//     <FormControl component="fieldset" style={{ marginBottom: "1rem" }}>
//       <FormLabel component="legend" sx={{ color: "#DEDED6" }}>
//         Role :
//       </FormLabel>
//       <RadioGroup
//         row
//         value={role}
//         onChange={handleRoleChange}
//         sx={{
//           "& .MuiFormControlLabel-label": { color: "#DEDED6" },
//           "& .MuiSvgIcon-root": { color: "#DEDED6" },
//         }}
//       >
//         <FormControlLabel value="student" control={<Radio />} label="Student" />
//         <FormControlLabel value="teacher" control={<Radio />} label="Teacher" />
//       </RadioGroup>
//     </FormControl>

//     <Button
//       type="button"
//       variant="contained"
//       style={{
//         backgroundColor: "#CCC6B8",
//         color: "#573f3f",
//         alignSelf: "flex-end",
//         borderRadius: 10,
//         padding: "0.5rem 2rem",
//         fontWeight: "bold",
//         textTransform: "uppercase",
//       }}
//       onClick={handleSubmit}
//     >
//       LOGIN
//     </Button>
//   </div>
// </div>

//       </div>

//       <Login open={openLogin} setOpen={setOpenLogin} setOpenRegister={setOpenRegister} />
//       <Register open={openRegister} setOpen={setOpenRegister} setOpenLogin={setOpenLogin} />
//     </div>
//   );
// }




// import React, { useState } from "react";
// import Navbar from "../components/HomePage_Navbar";
// import axios from "axios";
// import { useSignIn } from "react-auth-kit";
// import { useNavigate } from "react-router-dom";
// import {
//   TextField,
//   Button,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
//   FormControl,
//   FormLabel,
// } from "@mui/material";
// import url from "../url.json";
// import config from "../config.json";
// import { Register } from "../components/Register";
// import { Login } from "../components/Login";

// export default function Home() {
//   const [data, setData] = useState({ email: "", password: "" });
//   const [role, setRole] = useState("student");
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [openLogin, setOpenLogin] = useState(false);
//   const [openRegister, setOpenRegister] = useState(false);

//   const signIn = useSignIn();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleRoleChange = (e) => setRole(e.target.value);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const userData = { email: data.email, password: data.password, role };
//     try {
//       const response = await axios.post(
//         url.backendHost + config[1].loginUrl,
//         userData
//       );
//       setIsLoggedIn(true);
//       setData({ email: "", password: "" });
//       signIn({
//         token: response.data.jwtToken,
//         expiresIn: 3600,
//         tokenType: "Bearer",
//         authState: { ...response.data },
//       });
//       localStorage.setItem("jwtToken", response.data.jwtToken);
//       localStorage.setItem("userId", response.data.id);
//       localStorage.setItem("name", response.data.name);
//       localStorage.setItem("email", response.data.email);
//       localStorage.setItem("role", role);
//       alert("Login Successful!");
//       if (role === "student") navigate("/kf");
//       else if (role === "teacher") navigate("/teacher/teacher_home");
//     } catch (error) {
//       if (!error.response) alert("後端伺服器連結失敗");
//       else {
//         switch (error.response.status) {
//           case 401:
//             alert("登入授權失敗，請確認帳號密碼");
//             break;
//           default:
//             alert("未知錯誤，請聯絡管理員: " + error.response.status);
//         }
//       }
//     }
//   };

//   return (
//     <div
//       className="home-container"
//       style={{ backgroundColor: "#DEDED6", minHeight: "100vh" }}
//     >
//       <Navbar />
//       <div
//         className="home-banner-container"
//         style={{
//           backgroundColor: "#DEDED6",
//           minHeight: "calc(100vh - 120px)",
//         }}
//       >
//         <div
//           className="content-wrapper"
//           style={{
//             display: "flex",
//             justifyContent: "flex-start",
//             alignItems: "flex-end",
//             width: "100vw",
//             height: "calc(100vh - 120px)",
//             backgroundColor: "#DEDED6",
//             padding: "0 5vw 5vh 5vw",
//             boxSizing: "border-box",
//             gap: "3vw",
//           }}
//         >
//           {/* 左邊插圖區塊 */}
//           <div
//             style={{
//               backgroundColor: "#CCC6B8",
//               width: "100%",
//               height: "80%",
//               borderRadius: "0 0 0 0px",
//             }}
//           />

//           {/* 右邊登入區塊（外層容器） */}
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               width: "30%",
//               gap: "1rem",
//             }}
//           >
//             {/* 標語文字 */}
//             <h2
//               style={{
//                 color: "#573f3f",
//                 fontSize: "1.8rem",
//                 fontWeight: "600",
//                 textAlign: "center",
//                 lineHeight: "1.4",
//                 textShadow: "1px 1px 3px rgba(0,0,0,0.2)",
//                 letterSpacing: "1px",
//               }}
//             >
//               Inspire Thinking <br />
//               Write Infinite Possibilities <br />
//               with AI
//             </h2>

//             {/* 登入表單區塊 */}
//             <div
//               className="form-section"
//               style={{
//                 backgroundColor: "#573f3f",
//                 padding: "2rem",
//                 width: "100%",
//                 borderRadius: "0",
//                 display: "flex",
//                 flexDirection: "column",
//                 justifyContent: "flex-start",
//                 alignItems: "stretch",
//                 color: "#DEDED6",
//                 boxSizing: "border-box",
//               }}
//             >
//               <TextField
//                 label="Please enter your email"
//                 type="email"
//                 name="email"
//                 value={data.email}
//                 fullWidth
//                 onChange={handleChange}
//                 style={{ marginBottom: "1rem" }}
//                 sx={{
//                   "& .MuiInputBase-root": { backgroundColor: "#DEDED6" },
//                   "& .MuiInputLabel-root": { color: "#333" },
//                   "& .MuiOutlinedInput-root fieldset": {
//                     borderColor: "#DEDED6",
//                   },
//                 }}
//               />
//               <TextField
//                 label="Please enter your password"
//                 type="password"
//                 name="password"
//                 value={data.password}
//                 fullWidth
//                 onChange={handleChange}
//                 style={{ marginBottom: "1rem" }}
//                 sx={{
//                   "& .MuiInputBase-root": { backgroundColor: "#DEDED6" },
//                   "& .MuiInputLabel-root": { color: "#333" },
//                   "& .MuiOutlinedInput-root fieldset": {
//                     borderColor: "#DEDED6",
//                   },
//                 }}
//               />
//               <FormControl component="fieldset" style={{ marginBottom: "1rem" }}>
//                 <FormLabel component="legend" sx={{ color: "#DEDED6" }}>
//                   Role :
//                 </FormLabel>
//                 <RadioGroup
//                   row
//                   value={role}
//                   onChange={handleRoleChange}
//                   sx={{
//                     "& .MuiFormControlLabel-label": { color: "#DEDED6" },
//                     "& .MuiSvgIcon-root": { color: "#DEDED6" },
//                   }}
//                 >
//                   <FormControlLabel
//                     value="student"
//                     control={<Radio />}
//                     label="Student"
//                   />
//                   <FormControlLabel
//                     value="teacher"
//                     control={<Radio />}
//                     label="Teacher"
//                   />
//                 </RadioGroup>
//               </FormControl>

//               <Button
//                 type="button"
//                 variant="contained"
//                 style={{
//                   backgroundColor: "#CCC6B8",
//                   color: "#573f3f",
//                   alignSelf: "flex-end",
//                   borderRadius: 10,
//                   padding: "0.5rem 2rem",
//                   fontWeight: "bold",
//                   textTransform: "uppercase",
//                 }}
//                 onClick={handleSubmit}
//               >
//                 LOGIN
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <Login
//         open={openLogin}
//         setOpen={setOpenLogin}
//         setOpenRegister={setOpenRegister}
//       />
//       <Register
//         open={openRegister}
//         setOpen={setOpenRegister}
//         setOpenLogin={setOpenLogin}
//       />
//     </div>
//   );
// }






// import React, { useState } from "react";
// import Navbar from "../components/HomePage_Navbar";
// import axios from "axios";
// import { useSignIn } from "react-auth-kit";
// import { useNavigate } from "react-router-dom";
// import {
//   TextField,
//   Button,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
//   FormControl,
//   FormLabel,
// } from "@mui/material";
// import url from "../url.json";
// import config from "../config.json";
// import { Register } from "../components/Register";
// import { Login } from "../components/Login";
// import illustration from "../assets/Qcover3.png";

// export default function Home() {
//   const [data, setData] = useState({ email: "", password: "" });
//   const [role, setRole] = useState("student");
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [openLogin, setOpenLogin] = useState(false);
//   const [openRegister, setOpenRegister] = useState(false);

//   const signIn = useSignIn();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleRoleChange = (e) => setRole(e.target.value);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const userData = { email: data.email, password: data.password, role };
//     try {
//       const response = await axios.post(
//         url.backendHost + config[1].loginUrl,
//         userData
//       );
//       setIsLoggedIn(true);
//       setData({ email: "", password: "" });
//       signIn({
//         token: response.data.jwtToken,
//         expiresIn: 3600,
//         tokenType: "Bearer",
//         authState: { ...response.data },
//       });
//       localStorage.setItem("jwtToken", response.data.jwtToken);
//       localStorage.setItem("userId", response.data.id);
//       localStorage.setItem("name", response.data.name);
//       localStorage.setItem("email", response.data.email);
//       localStorage.setItem("role", role);
//       alert("Login Successful!");
//       if (role === "student") navigate("/kf");
//       else if (role === "teacher") navigate("/teacher/teacher_home");
//     } catch (error) {
//       if (!error.response) alert("後端伺服器連結失敗");
//       else {
//         switch (error.response.status) {
//           case 401:
//             alert("登入授權失敗，請確認帳號密碼");
//             break;
//           default:
//             alert("未知錯誤，請聯絡管理員: " + error.response.status);
//         }
//       }
//     }
//   };

//   return (
//     <div
//       className="home-container"
//       style={{
//         backgroundColor: "#DEDED6",
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       <Navbar />
//       <div
//         className="home-banner-container"
//         style={{
//           backgroundColor: "#DEDED6",
//           flex: 1,
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           padding: "2rem",
//         }}
//       >
//         <div
//           className="content-wrapper"
//           style={{
//             display: "flex",
//             flexDirection: "row",
//             flexWrap: "wrap", // RWD：小螢幕時上下排列
//             justifyContent: "center",
//             alignItems: "stretch",
//             width: "100%",
//             maxWidth: "1200px",
//             gap: "3vw",
//           }}
//         >
//           {/* 左邊插圖區塊 */}
//           {/* <div
//           className="left-panel"
//             style={{
//               backgroundColor: "#CCC6B8",
//               flex: "1 1 50%",
//               minWidth: "280px",
//               height: "80%",
//               borderRadius: "8px",
//             }}
//           /> */}
//           <div
//   className="left-panel"
//   style={{
//     backgroundColor: "#E9DECC",
//     flex: "1 1 50%",
//     minWidth: "280px",
//     borderRadius: "8px",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//   }}
// >
//   <img
//     src={illustration}
//     alt="Illustration"
//     style={{
//       width: "70%",
//       height: "auto",
//       objectFit: "contain",
//     }}
//   />
// </div>



//           {/* 右邊登入區塊（外層容器） */}
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               justifyContent: "space-between",
//               alignItems: "center",
//               flex: "1 1 40%",
//               minWidth: "280px",
//               height: "80%",
//               boxSizing: "border-box",
//             }}
//           >
//             {/* 標語文字 */}
//             <div
//               style={{
//                 width: "100%",
//                 textAlign: "center",
//                 color: "#573f3f",
//                 fontSize: "clamp(1.2rem, 2.5vw, 2rem)", // RWD 字體
//                 fontWeight: "600",
//                 lineHeight: "1.4",
//                 textShadow: "1px 1px 3px rgba(0,0,0,0.2)",
//                 letterSpacing: "1px",
//               }}
//             >
//               Inspire Thinking <br />
//               Write Infinite Possibilities <br />
//               with AI
              
//             </div>

//             {/* 登入表單區塊 */}
//             <div
//               className="form-section"
//               style={{
//                 backgroundColor: "#573f3f",
//                 padding: "2rem",
//                 width: "100%",
//                 borderRadius: "8px",
//                 display: "flex",
//                 flexDirection: "column",
//                 justifyContent: "flex-start",
//                 alignItems: "stretch",
//                 color: "#DEDED6",
//                 boxSizing: "border-box",
//                 marginTop: "1rem",
//               }}
//             >
//               <TextField
//                 label="Please enter your email"
//                 type="email"
//                 name="email"
//                 value={data.email}
//                 fullWidth
//                 onChange={handleChange}
//                 style={{ marginBottom: "1rem" }}
//                 sx={{
//                   "& .MuiInputBase-root": { backgroundColor: "#DEDED6" },
//                   "& .MuiInputLabel-root": { color: "#333" },
//                   "& .MuiOutlinedInput-root fieldset": {
//                     borderColor: "#DEDED6",
//                   },
//                 }}
//               />
//               <TextField
//                 label="Please enter your password"
//                 type="password"
//                 name="password"
//                 value={data.password}
//                 fullWidth
//                 onChange={handleChange}
//                 style={{ marginBottom: "1rem" }}
//                 sx={{
//                   "& .MuiInputBase-root": { backgroundColor: "#DEDED6" },
//                   "& .MuiInputLabel-root": { color: "#333" },
//                   "& .MuiOutlinedInput-root fieldset": {
//                     borderColor: "#DEDED6",
//                   },
//                 }}
//               />
//               <FormControl
//                 component="fieldset"
//                 style={{ marginBottom: "1rem" }}
//               >
//                 <FormLabel component="legend" sx={{ color: "#DEDED6" }}>
//                   Role :
//                 </FormLabel>
//                 <RadioGroup
//                   row
//                   value={role}
//                   onChange={handleRoleChange}
//                   sx={{
//                     "& .MuiFormControlLabel-label": { color: "#DEDED6" },
//                     "& .MuiSvgIcon-root": { color: "#DEDED6" },
//                   }}
//                 >
//                   <FormControlLabel
//                     value="student"
//                     control={<Radio />}
//                     label="Student"
//                   />
//                   <FormControlLabel
//                     value="teacher"
//                     control={<Radio />}
//                     label="Teacher"
//                   />
//                 </RadioGroup>
//               </FormControl>

//               <Button
//                 type="button"
//                 variant="contained"
//                 style={{
//                   backgroundColor: "#E9DECC",
//                   color: "#573f3f",
//                   alignSelf: "flex-end",
//                   borderRadius: 10,
//                   padding: "0.5rem 2rem",
//                   fontWeight: "bold",
//                   textTransform: "uppercase",
//                 }}
//                 onClick={handleSubmit}
//               >
//                 LOGIN
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <Login
//         open={openLogin}
//         setOpen={setOpenLogin}
//         setOpenRegister={setOpenRegister}
//       />
//       <Register
//         open={openRegister}
//         setOpen={setOpenRegister}
//         setOpenLogin={setOpenLogin}
//       />
//     </div>
//   );
// }




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
import illustration from "../assets/Qcover3.png";

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
      if (!error.response) alert("後端伺服器連結失敗");
      else {
        switch (error.response.status) {
          case 401:
            alert("登入授權失敗，請確認帳號密碼");
            break;
          default:
            alert("未知錯誤，請聯絡管理員: " + error.response.status);
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
            flexWrap: "wrap", // RWD：小螢幕時上下排列
            justifyContent: "center",
            alignItems: "stretch",
            width: "100%",
            maxWidth: "1200px",
            gap: "3vw",
          }}
        >
          {/* 左邊插圖區塊 */}
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
        {/* 左邊插圖區塊 */}
<div
  className="left-panel"
  style={{
    backgroundColor: "#E9DECC",
    flex: "1 1 50%",
    minWidth: "280px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column", // 修改為垂直排列，讓文字在圖片下方
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem", // 可選：增加內距以避免邊緣過近
  }}
>
  <img
    src={illustration}
    alt="Illustration"
    style={{
      width: "70%",
      height: "auto",
      objectFit: "contain",
      marginBottom: "1rem", // 在圖片和文字之間增加間距
    }}
  />
  {/* 新增文字區塊 */}
  <div
    style={{
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center", // 讓整個文字區塊居中
      justifyContent: "flex-end", // 將文字推到底部（如果需要調整位置）
      marginTop: "auto", // 將文字推到容器底部，確保在圖片下方
    }}
  >
    <div
      style={{
        width: "100%",
        textAlign: "center", // 第一行置中（或根據需求調整為 left）
        color: "#573f3f", // 與其他文字顏色一致，可調整
        fontSize: "0.8rem", // 調整字體大小，根據需求
        lineHeight: "1.2",
        marginBottom: "0.5rem",
      }}
    >
      © 2025 THKLM team of Language Center, NCU, All rights reserved.
    </div>
    <div
      style={{
        textAlign: "center", // 第二行明確置中對齊
        color: "#573f3f", // 與其他文字顏色一致，可調整
        fontSize: "0.8rem", // 調整字體大小，根據需求
        lineHeight: "1.2",
      }}
    >
      Tommy, Harry, Kezia, Luby, Melisa
    </div>
  </div>
</div>



          {/* 右邊登入區塊（外層容器） */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              flex: "1 1 40%",
              minWidth: "280px",
              height: "80%",
              boxSizing: "border-box",
            }}
          >
            {/* 標語文字 */}
            <div
              style={{
                width: "100%",
                textAlign: "center",
                color: "#573f3f",
                fontSize: "clamp(1.2rem, 2.5vw, 2rem)", // RWD 字體
                fontWeight: "600",
                lineHeight: "1.4",
                textShadow: "1px 1px 3px rgba(0,0,0,0.2)",
                letterSpacing: "1px",
              }}
            >
              Inspire Thinking <br />
              Write Infinite Possibilities <br />
              with AI
              
            </div>

            {/* 登入表單區塊 */}
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

