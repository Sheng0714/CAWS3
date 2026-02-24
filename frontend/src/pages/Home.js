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
//                         隞交瘜銝剖?嚗?
//                         <br/>
//                         ?⊥??Ｙ弦
//                     </h1>
//                     <button className="secondary-button">
//                         ??嚗?敺
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
// import { Login } from "../components/Login"; // ?身?典歇撠?Login 蝯辣?曉?楝敺?

// export default function Home() {
//   const [data, setData] = useState({
//     email: "",
//     password: "",
//   });
//   const [role, setRole] = useState("student"); // ?身??student
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [openLogin, setOpenLogin] = useState(false); // ?批 Login 撠店獢?
//   const [openRegister, setOpenRegister] = useState(false); // ?批 Register 撠店獢?

//   const signIn = useSignIn();
//   const navigate = useNavigate();

//   // ??銵典頛詨霈?
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   // ??閫?豢?霈?
//   const handleRoleChange = (e) => {
//     setRole(e.target.value);
//   };

//   // ??銵典?漱
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const userData = {
//       email: data.email,
//       password: data.password,
//       role, // 撠?role ?喟策敺垢嚗???蝡舫?閬?
//     };
//     try {
//       const response = await axios.post(
//         url.backendHost + config[1].loginUrl,
//         userData
//       );
//       setIsLoggedIn(true);
//       setData({ email: "", password: "" });

//       // 雿輻 react-auth-kit ??signIn
//       signIn({
//         token: response.data.jwtToken,
//         expiresIn: 3600,
//         tokenType: "Bearer",
//         authState: { ...response.data },
//       });

//       // ?脣???localStorage
//       localStorage.setItem("jwtToken", response.data.jwtToken);
//       localStorage.setItem("userId", response.data.id);
//       localStorage.setItem("name", response.data.name);
//       localStorage.setItem("email", response.data.email);
//       localStorage.setItem("role", role);

//       alert("?餃??!");

//       // ?寞?閫頝唾??
//       if (role === "student") {
//         navigate("/kf");
//       } else if (role === "teacher") {
//         navigate("/teacher/teacher_home");
//       }
//     } catch (error) {
//       if (!error.response) {
//         alert("敺垢隡箸??券??憭望?");
//       } else {
//         switch (error.response.status) {
//           case 401:
//             alert("?餃??憭望?嚗?蝣箄?撣唾?撖Ⅳ");
//             break;
//           default:
//             alert("?芰?航炊嚗??舐窗蝞∠??? " + error.response.status);
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

//       {/* ?游? Login 蝯辣雿撠店獢?*/}
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
// import { Register } from "../components/Register"; // 蝣箔?頝臬?甇?Ⅱ
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
//         alert("敺垢隡箸??券??憭望?");
//       } else {
//         switch (error.response.status) {
//           case 401:
//             alert("?餃??憭望?嚗?蝣箄?撣唾?撖Ⅳ");
//             break;
//           default:
//             alert("?芰?航炊嚗??舐窗蝞∠??? " + error.response.status);
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
// import { Register } from "../components/Register"; // 蝣箔?頝臬?甇?Ⅱ
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
//       if (!error.response) alert("敺垢隡箸??券??憭望?");
//       else {
//         switch (error.response.status) {
//           case 401:
//             alert("?餃??憭望?嚗?蝣箄?撣唾?撖Ⅳ");
//             break;
//           default:
//             alert("?芰?航炊嚗??舐窗蝞∠??? " + error.response.status);
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
//     justifyContent: "flex-start", // ???寥ㄐ嚗??批捆?椰撠?
//     alignItems: "flex-end", // 霈??交???撠?
//     width: "100vw",
//     height: "calc(100vh - 120px)",
//     backgroundColor: "#DEDED6",
//     padding: "0 5vw 5vh 5vw", // 銝?椰?喲??
//     boxSizing: "border-box",
//     gap: "3vw", // ???啣?銝暺?頝?霈椰?喳?憛?蝺票
//   }}
// >
//   {/* 撌阡????憛?*/}
//   <div
//     style={{
//       backgroundColor: "#CCC6B8",
//       width: "100%",
//       height: "80%", // 擃漲?仿??澆??交?
//       borderRadius: "0 0 0 0px", // 璅∩遛閮剛???閫?
//     }}
//   />

//   {/* ?喲??餃?憛?*/}
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
//       if (!error.response) alert("敺垢隡箸??券??憭望?");
//       else {
//         switch (error.response.status) {
//           case 401:
//             alert("?餃??憭望?嚗?蝣箄?撣唾?撖Ⅳ");
//             break;
//           default:
//             alert("?芰?航炊嚗??舐窗蝞∠??? " + error.response.status);
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
//           {/* 撌阡????憛?*/}
//           <div
//             style={{
//               backgroundColor: "#CCC6B8",
//               width: "100%",
//               height: "80%",
//               borderRadius: "0 0 0 0px",
//             }}
//           />

//           {/* ?喲??餃?憛?憭惜摰孵嚗?*/}
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               width: "30%",
//               gap: "1rem",
//             }}
//           >
//             {/* 璅??? */}
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

//             {/* ?餃銵典?憛?*/}
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
// 
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
//       if (!error.response) alert("敺垢隡箸??券??憭望?");
//       else {
//         switch (error.response.status) {
//           case 401:
//             alert("?餃??憭望?嚗?蝣箄?撣唾?撖Ⅳ");
//             break;
//           default:
//             alert("?芰?航炊嚗??舐窗蝞∠??? " + error.response.status);
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
//             flexWrap: "wrap", // RWD嚗??Ｗ???銝???
//             justifyContent: "center",
//             alignItems: "stretch",
//             width: "100%",
//             maxWidth: "1200px",
//             gap: "3vw",
//           }}
//         >
//           {/* 撌阡????憛?*/}
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



//           {/* ?喲??餃?憛?憭惜摰孵嚗?*/}
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
//             {/* 璅??? */}
//             <div
//               style={{
//                 width: "100%",
//                 textAlign: "center",
//                 color: "#573f3f",
//                 fontSize: "clamp(1.2rem, 2.5vw, 2rem)", // RWD 摮?
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

//             {/* ?餃銵典?憛?*/}
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
import HomeImage1 from "../assets/首頁1.png";
import HomeImage2 from "../assets/首頁2.png";
import HomeImage3 from "../assets/首頁3.png";
import KF from "../assets/首頁1.png";
import WritingAssistant from "../assets/首頁2.png";
import WritingAnalysis from "../assets/首頁3.png";

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
        backgroundColor: "#FFFFFF",
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
    minHeight: "520px",
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
      fontSize: "clamp(2.25rem, 2.5vw, 1.8rem)",
      lineHeight: 1.5,
      marginTop: "1rem",
      marginBottom: "1.5rem",
      fontWeight: "bold",
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
      backgroundColor: "#6953538f",
      color: "#FFFFFF",
      borderRadius: 10,
      padding: "0.6rem 1.4rem",
      fontWeight: "bold",
      fontSize: "1.4rem",
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
            {/* <div
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
              
            </div> */}

            {/* ?餃銵典?憛?*/}
            <div
              className="form-section"
              style={{
                backgroundColor: "#ffffffd5",
                padding: "2rem",
                width: "100%",
                minHeight: "450px",
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
              <div
                style={{
                  textAlign: "center",
                  color: "#000000",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                  letterSpacing: "0.04em",
                }}
              >
                LOGIN
              </div>
              <TextField
                label="Please enter your email"
                type="email"
                name="email"
                value={data.email}
                fullWidth
                onChange={handleChange}
                style={{ marginBottom: "1rem" }}
                sx={{
                  "& .MuiInputBase-root": { backgroundColor: "#FFFFFF" },
                  "& .MuiInputLabel-root": { color: "#000000" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#000000" },
                  "& .MuiOutlinedInput-root fieldset": {
                    borderColor: "#000000",
                  },
                  "& .MuiOutlinedInput-root:hover fieldset": {
                    borderColor: "#000000",
                  },
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: "#000000",
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
                  "& .MuiInputBase-root": { backgroundColor: "#FFFFFF" },
                  "& .MuiInputLabel-root": { color: "#000000" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#000000" },
                  "& .MuiOutlinedInput-root fieldset": {
                    borderColor: "#000000",
                  },
                  "& .MuiOutlinedInput-root:hover fieldset": {
                    borderColor: "#000000",
                  },
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: "#000000",
                  },
                }}
              />
              <FormControl
                component="fieldset"
                style={{ marginBottom: "1rem" }}
              >
                <FormLabel component="legend" sx={{ color: "#000000" }}>
                  Role :
                </FormLabel>
                <RadioGroup
                  row
                  value={role}
                  onChange={handleRoleChange}
                  sx={{
                    "& .MuiFormControlLabel-label": { color: "#000000" },
                    "& .MuiSvgIcon-root": { color: "#000000" },
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

      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "3rem auto 2rem auto",
          padding: "0 2rem",
          transform: "translateX(-32px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "2rem",
        }}
      >
        <div
          style={{
            flex: "1 1 280px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #000000",
            borderRadius: "8px",
            padding: "1.25rem",
          }}
        >
          <img
            src={HomeImage1}
            alt="首頁1"
            style={{
              width: "85px",
              height: "85px",
              objectFit: "contain",
              display: "block",
              margin: "0 auto",
              borderRadius: "6px",
              marginBottom: "0.9rem",
            }}
          />
          <h3
            style={{
              color: "#000000",
              textAlign: "center",
              padding: 0,
              marginBottom: "0.6rem",
              fontWeight: 700,
              fontSize: "1.4rem",
            }}
          >
            KF Analysis
          </h3>
          <p style={{ color: "#333333", lineHeight: 1.5, fontSize: "1.08rem", textAlign: "center" }}>
            Organize the discussion data from KF for you.
          </p>
        </div>

        <div
          style={{
            flex: "1 1 280px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #000000",
            borderRadius: "8px",
            padding: "1.25rem",
          }}
        >
          <img
            src={HomeImage2}
            alt="首頁2"
            style={{
              width: "85px",
              height: "85px",
              objectFit: "contain",
              display: "block",
              margin: "0 auto",
              borderRadius: "6px",
              marginBottom: "0.9rem",
            }}
          />
          <h3
            style={{
              color: "#000000",
              textAlign: "center",
              padding: 0,
              marginBottom: "0.6rem",
              fontWeight: 700,
              fontSize: "1.4rem",
            }}
          >
            Writing Assistant
          </h3>
          <p style={{ color: "#333333", lineHeight: 1.5, fontSize: "1.08rem", textAlign: "center" }}>
            Check your knowledge of argumentative essay structure.
            <br />
            Build your writing outline.
          </p>
        </div>

        <div
          style={{
            flex: "1 1 280px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #000000",
            borderRadius: "8px",
            padding: "1.25rem",
          }}
        >
          <img
            src={HomeImage3}
            alt="首頁3"
            style={{
              width: "85px",
              height: "85px",
              objectFit: "contain",
              display: "block",
              margin: "0 auto",
              borderRadius: "6px",
              marginBottom: "0.9rem",
            }}
          />
          <h3
            style={{
              color: "#000000",
              textAlign: "center",
              padding: 0,
              marginBottom: "0.6rem",
              fontWeight: 700,
              fontSize: "1.4rem",
            }}
          >
            Writing Analysis
          </h3>
          <p style={{ color: "#333333", lineHeight: 1.5, fontSize: "1.08rem", textAlign: "center" }}>
            Get feedback and suggestions on your writing.
          </p>
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


