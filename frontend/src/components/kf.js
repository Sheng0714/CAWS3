
// import { useNavigate } from "react-router-dom";
// import { Button, Container } from "@mui/material";
// import React, { useState, useEffect } from 'react';  // 確保導入 useState 和 useEffect


// export const KF = () => {
//     const navigate = useNavigate();
//     const role = localStorage.getItem("role") || "student";
//     const [userName, setUserName] = useState('');

//     const handleWriteArea = () => {
//         if (role === "teacher") {
//             navigate("/teacher/home");
//         } else {
//             navigate("/home");
//         }
//     };


//     useEffect(() => {
//         const name = localStorage.getItem('name'); // 從 localStorage 讀取姓名
//         if (name) {
//             setUserName(name); // 設置姓名到 state
//         }
//     }, []);

//     return (
//         <Container style={{ textAlign: "center", marginTop: "50px" }}>
//             <h1>Welcome to {userName ? userName : 'KF Interface'}</h1>
//             <Button
//                 variant="contained"
//                 color="primary"
//                 style={{ margin: "10px" }}
//                 onClick={() => alert("KF 按鈕被點擊！")}
//             >
//                 KF
//             </Button>
//             <Button
//                 variant="contained"
//                 color="secondary"
//                 style={{ margin: "10px" }}
//                 onClick={handleWriteArea}
//             >
//                 寫作區
//             </Button>
//         </Container>
//     );
// };

// // 確保這行存在於 `kf.js` 中
// export default KF;



// import { useNavigate } from "react-router-dom";
// import { Button, Container } from "@mui/material";
// import React, { useState, useEffect } from 'react';  // 確保導入 useState 和 useEffect

// export const KF = () => {
//     const navigate = useNavigate();
//     const role = localStorage.getItem("role") || "student";
//     const [userName, setUserName] = useState('');  // 用來儲存用戶姓名

//     const handleWriteArea = () => {
//         if (role === "teacher") {
//             navigate("/teacher/home");  // 根據角色跳轉到不同頁面
//         } else {
//             navigate("/home");
//         }
//     };

//     useEffect(() => {
//         const name = localStorage.getItem('name');  // 從 localStorage 讀取姓名
//         if (name) {
//             setUserName(name);  // 設置姓名到 state
//         }
//     }, []);

//     return (
//         <Container 
//             style={{
//                 textAlign: "center", 
//                 position: "absolute",  // 使容器定位
//                 top: "50%",  // 垂直居中
//                 left: "1000px",  // 水平居中
//                 transform: "translate(-50%, -50%)",  // 移動容器至正中間
//                 backgroundColor: "#FFEBCC", 
//                 padding: "20px", 
//                 width: "40%",  // 限制容器寬度
//                 borderRadius: "8px",  // 增加圓角效果
//             }}
//         >
//             {/* 新增容器包裹 Welcome 和 按鈕 */}
//             <div style={{ marginBottom: "20px" }}>
//                 <h1>Welcome to {userName ? userName : 'KF Interface'}</h1>  {/* 顯示姓名或默認文字 */}
//             </div>
            
//             {/* 包裹按鈕的容器，確保兩個按鈕在同一區塊內顯示 */}
//             <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
//                 <Button
//                     variant="contained"
//                     color="primary"
//                     onClick={() => alert("KF 按鈕被點擊！")}
//                 >
//                     KF
//                 </Button>
//                 <Button
//                     variant="contained"
//                     color="secondary"
//                     onClick={handleWriteArea}
//                 >
//                     Writing Area
//                 </Button>
//             </div>
//         </Container>
//     );
// };

// export default KF;







// import { useNavigate } from "react-router-dom";
// import { Button, Container } from "@mui/material";
// import React, { useState, useEffect } from 'react';  // 確保導入 useState 和 useEffect

// export const KF = () => {
//     const navigate = useNavigate();  // 使用 navigate 來進行路由導航
//     const role = localStorage.getItem("role") || "student";
//     const [userName, setUserName] = useState('');  // 用來儲存用戶姓名

//     // 跳轉到 Writing Area 頁面
//     const handleWriteArea = () => {
//         if (role === "teacher") {
//             // navigate("/teacher/home");  // 根據角色跳轉到不同頁面
//             navigate("/writing_area");  // 根據角色跳轉到不同頁面
//         } else {
//             // navigate("/home");
//             navigate("/writing_area");  // 根據角色跳轉到不同頁面
//         }
//     };

//     // 點擊 KF 按鈕時跳轉到 /kfweb 路徑
//     const handleKFClick = () => {
//         navigate("/kfweb");  // 跳轉到 /kfweb 頁面
//     };

//     useEffect(() => {
//         const name = localStorage.getItem('name');  // 從 localStorage 讀取姓名
//         if (name) {
//             setUserName(name);  // 設置姓名到 state
//         }
//     }, []);

//     return (
        
//         <Container 
//             style={{
//                 textAlign: "center", 
//                 position: "absolute",  // 使容器定位
//                 top: "50%",  // 垂直居中
//                 left: "50%",  // 水平居中
//                 transform: "translate(-50%, -50%)",  // 移動容器至正中間
//                 backgroundColor: "#FFEBCC", 
//                 padding: "20px", 
//                 width: "40%",  // 限制容器寬度
//                 borderRadius: "8px",  // 增加圓角效果
//             }}
//         >
//             {/* 新增容器包裹 Welcome 和 按鈕 */}
//             <div style={{ marginBottom: "20px" }}>
//                 <h1>Welcome to {userName ? userName : 'KF Interface'}</h1>  {/* 顯示姓名或默認文字 */}
//             </div>
            
//             {/* 包裹按鈕的容器，確保兩個按鈕在同一區塊內顯示 */}
//             <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
//                 <Button
//                     variant="contained"
//                     color="primary"
//                     onClick={handleKFClick}  // 點擊 KF 按鈕跳轉到 /kfweb
//                 >
//                     KF
//                 </Button>
//                 <Button
//                     variant="contained"
//                     color="secondary"
//                     onClick={handleWriteArea}
//                 >
//                     Writing Area
//                 </Button>
//             </div>
//         </Container>
//     );
// };

// export default KF;




// import { useNavigate } from "react-router-dom";
// import { Button, Container } from "@mui/material";
// import React, { useState, useEffect } from 'react';  // 確保導入 useState 和 useEffect
// import Logo from "../assets/new_logo_1.png";
// import { HiOutlineBars3 } from 'react-icons/hi2';
// import { List, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText, Drawer } from "@mui/material"
// import { Box } from '@mui/system';
// import HomeIcon from "@mui/icons-material/Home";
// import InfoIcon from "@mui/icons-material/Info";
// import { Register } from './Register';
// import { Login } from './Login'



// export const KF = () => {
//     const navigate = useNavigate();  // 使用 navigate 來進行路由導航
//     const role = localStorage.getItem("role") || "student";
//     const [userName, setUserName] = useState('');  // 用來儲存用戶姓名
//     const [openMenu, setOpenMenu] = useState(false);

//     const menuOptions = [
//         {
//           text: "Home",
//           icon: <HomeIcon />,
//           onClick: () => navigate('/') // 跳轉到 Home 頁面
//         },
//         {
//           text: "About",
//           icon: <InfoIcon />,
//           onClick: () => navigate('/about') // 跳轉到 About 頁面
//         },
//         {
//           text: "Login",
//           icon: <Login />,
//           onClick: () => navigate('/login') // 跳轉到 Login 頁面
//         },
//         {
//           text: "Register",
//           icon: <Register />,
//           onClick: () => navigate('/register') // 跳轉到 Register 頁面
//         }
//       ];

//     // 跳轉到 Writing Area 頁面
//     const handleWriteArea = () => {
//         if (role === "teacher") {
//             // navigate("/teacher/home");  // 根據角色跳轉到不同頁面
//             navigate("/writing_area");  // 根據角色跳轉到不同頁面
//         } else {
//             // navigate("/home");
//             navigate("/writing_area");  // 根據角色跳轉到不同頁面
//         }
//     };

//     // 點擊 KF 按鈕時跳轉到 /kfweb 路徑
//     const handleKFClick = () => {
//         navigate("/kfweb");  // 跳轉到 /kfweb 頁面
//     };

//     useEffect(() => {
//         const name = localStorage.getItem('name');  // 從 localStorage 讀取姓名
//         if (name) {
//             setUserName(name);  // 設置姓名到 state
//         }
//     }, []);

//     return (
//         <nav>
//         <div className='nav-logo-container'>
//           <img alt='' src={Logo} width={150} height={120} />
//           <p style={{ marginLeft: '150px', position: 'relative', top: '-100px', fontSize: '28px' }}>
//             Collaborative Argumentation and Writing System
//           </p>
//         </div>
  
//         <div className="navbar-links-container">
//           <a href="" onClick={() => navigate('/')}>Home</a> {/* 使用 navigate 進行跳轉 */}
//           <a href="" onClick={() => navigate('/about')}>About</a> {/* 使用 navigate 進行跳轉 */}
//           <a href="" style={{ marginRight: '15px' }}>Manual</a>
//         </div>
  
//         <div className='navbar-menu-container'>
//           <HiOutlineBars3 onClick={() => setOpenMenu(true)} />
//         </div>

//         <Drawer open={openMenu} onClose={() => setOpenMenu(false)} anchor='right'>
//         <Box
//           sx={{ width: 250 }}
//           role="presentation"
//           onClick={() => setOpenMenu(false)}
//           onKeyDown={() => setOpenMenu(false)}
//         >
//           <List>
//             {menuOptions.map((item) => (
//               <ListItem key={item.text} disablePadding>
//                 <ListItemButton onClick={item.onClick}> {/* 點擊時調用 onClick 進行導航 */}
//                   <ListItemIcon>{item.icon}</ListItemIcon>
//                   <ListItemText primary={item.text} />
//                 </ListItemButton>
//               </ListItem>
//             ))}
//           </List>
//           <Divider />
//         </Box>
//       </Drawer>
// <br></br>
//       <div className="home-text-section">
//                     <h1 className="primary-heading">
//                         Inspire Thinking
//                         <br />
//                         Write Infinite Possibilities
//                     </h1>
                    
//                 </div>

//         <Container 
//             style={{
//                 textAlign: "center", 
//                 position: "absolute",  // 使容器定位
//                 top: "50%",  // 垂直居中
//                 left: "50%",  // 水平居中
//                 transform: "translate(-50%, -50%)",  // 移動容器至正中間
//                 backgroundColor: "#FFEBCC", 
//                 padding: "20px", 
//                 width: "40%",  // 限制容器寬度
//                 borderRadius: "8px",  // 增加圓角效果
//             }}
//         >
//             {/* 新增容器包裹 Welcome 和 按鈕 */}
//             <div style={{ marginBottom: "20px" }}>
//                 <h1>Welcome to {userName ? userName : 'KF Interface'}</h1>  {/* 顯示姓名或默認文字 */}
//             </div>
            
//             {/* 包裹按鈕的容器，確保兩個按鈕在同一區塊內顯示 */}
//             <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "20px" }}>
//                 <Button
//                     variant="contained"
//                     color="primary"
//                     onClick={handleKFClick}  // 點擊 KF 按鈕跳轉到 /kfweb
//                 >
//                     KF
//                 </Button>
//                 <Button
//                     variant="contained"
//                     color="secondary"
//                     onClick={handleWriteArea}
//                 >
//                     Writing Area
//                 </Button>
//             </div>
//         </Container>
//         </nav>
//     );
// };

// export default KF;









// import { useNavigate } from "react-router-dom";
// import { Button, Container } from "@mui/material";
// import React, { useState, useEffect } from 'react';  // 確保導入 useState 和 useEffect
// import Logo from "../assets/new_logo_1.png";
// import { HiOutlineBars3 } from 'react-icons/hi2';
// import { List, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText, Drawer } from "@mui/material"
// import { Box } from '@mui/system';
// import HomeIcon from "@mui/icons-material/Home";
// import InfoIcon from "@mui/icons-material/Info";
// import { Register } from './Register';
// import { Login } from './Login'
// // import Navbar from "../components/HomePage_Navbar";
// import Navbar from "../components/Navbar_Student";

// export const KF = () => {
//     const navigate = useNavigate();  // 使用 navigate 來進行路由導航
//     const role = localStorage.getItem("role") || "student";
//     const [userName, setUserName] = useState('');  // 用來儲存用戶姓名
//     const [openMenu, setOpenMenu] = useState(false);

//     const menuOptions = [
//         {
//           text: "Home",
//           icon: <HomeIcon />,
//           onClick: () => navigate('/') // 跳轉到 Home 頁面
//         },
//         {
//           text: "About",
//           icon: <InfoIcon />,
//           onClick: () => navigate('/about') // 跳轉到 About 頁面
//         },
//         {
//           text: "Login",
//           icon: <Login />,
//           onClick: () => navigate('/login') // 跳轉到 Login 頁面
//         },
//         {
//           text: "Register",
//           icon: <Register />,
//           onClick: () => navigate('/register') // 跳轉到 Register 頁面
//         }
//     ];

//     // 跳轉到 Writing Area 頁面
//     const handleWriteArea = () => {
//         if (role === "teacher") {
//             // navigate("/teacher/home");  // 根據角色跳轉到不同頁面
//             navigate("/writing_area");  // 根據角色跳轉到不同頁面
//         } else {
//             // navigate("/home");
//             navigate("/home");  // 根據角色跳轉到不同頁面
//         }
//     };

//     // 點擊 KF 按鈕時跳轉到 /kfweb 路徑
//     const handleKFClick = () => {
//         navigate("/kfweb_student");  // 跳轉到 /kfweb 頁面
//     };

//     useEffect(() => {
//         const name = localStorage.getItem('name');  // 從 localStorage 讀取姓名
//         if (name) {
//             setUserName(name);  // 設置姓名到 state
//         }
//     }, []);

//     return (
//         <div className="home-container">
//             <Navbar />
//             <div className="home-banner-container">
//                 <div className="content-wrapper">

               
//                 <div className="home-text-section">
//                     <h1 className="primary-heading">
//                         Inspire Thinking
//                         <br />
//                         Write Infinite Possibilities
//                         <br />
//                         with AI
//                     </h1>
//                 </div>

//                 <div style={{ backgroundColor: 'white', padding: '20px', marginRight: '-150px', marginTop: '80px', width: '500px', margin: '0 auto' }}>
//                     <form>
//                         <Container style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
//                             {/* 新增容器包裹 Welcome 和 按鈕 */}
//                             <div style={{ marginBottom: "20px", textAlign: "center" }}>
//                               <br/><br/>
//                                 <h1>Welcome to {userName ? userName : 'KF Interface'}</h1>  {/* 顯示姓名或默認文字 */}
//                             </div>
//                               <br/><br/><br/>
//                             {/* 包裹按鈕的容器，確保兩個按鈕在同一區塊內顯示 */}
//                             <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", gap: "20px" }}>
//                                 <Button
//                                     variant="contained"
//                                     color="primary"
//                                     onClick={() => window.open('https://kf6.nccu.edu.tw/', '_blank')}  // 點擊 KF 按鈕跳轉到 /kfweb
//                                 >
//                                     KF
//                                 </Button>
//                                 <Button
//                                     variant="contained"
//                                     color="secondary"
//                                     onClick={handleWriteArea}
//                                 >
//                                     Writing Area
//                                 </Button>
//                             </div>
//                         </Container>
//                     </form>
//                 </div>

//             </div>
//         </div>
//          </div>
//     );
// };

// export default KF;




// import { useNavigate } from "react-router-dom";
// import { Button, Container } from "@mui/material";
// import React, { useState, useEffect } from 'react';
// import Logo from "../assets/new_logo_1.png";
// import { HiOutlineBars3 } from 'react-icons/hi2';
// import { List, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText, Drawer } from "@mui/material";
// import { Box } from '@mui/system';
// import HomeIcon from "@mui/icons-material/Home";
// import InfoIcon from "@mui/icons-material/Info";
// import { Register } from './Register';
// import { Login } from './Login';
// import Navbar from "../components/Navbar_Student";

// export const KF = () => {
//     const navigate = useNavigate();
//     const role = localStorage.getItem("role") || "student";
//     const [userName, setUserName] = useState('');
//     const [openMenu, setOpenMenu] = useState(false);

//     const menuOptions = [
//         {
//           text: "Home",
//           icon: <HomeIcon />,
//           onClick: () => navigate('/')
//         },
//         {
//           text: "About",
//           icon: <InfoIcon />,
//           onClick: () => navigate('/about')
//         },
//         {
//           text: "Login",
//           icon: <Login />,
//           onClick: () => navigate('/login')
//         },
//         {
//           text: "Register",
//           icon: <Register />,
//           onClick: () => navigate('/register')
//         }
//     ];

//     const handleWriteArea = () => {
//         if (role === "teacher") {
//             navigate("/writing_area");
//         } else {
//             navigate("/home");
//         }
//     };

//     const handleKFClick = () => {
//         navigate("/kfweb_student");
//     };

//     useEffect(() => {
//         const name = localStorage.getItem('name');
//         if (name) {
//             setUserName(name);
//         }
//     }, []);

//     return (
//         <div className="home-container">
//             <Navbar />
//             <div className="home-banner-container">
//                 <div className="content-wrapper responsive-flex">

//                     <div className="home-text-section">
//                         <h1 className="primary-heading">
//                             Inspire Thinking
//                             <br />
//                             Write Infinite Possibilities
//                             <br />
//                             with AI
//                         </h1>
//                     </div>

//                     <div className="form-section">
//                         <form>
//                             <Container style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
//                                 <div style={{ marginBottom: "20px", textAlign: "center" }}>
//                                     <br /><br />
//                                     <h1>Welcome to {userName ? userName : 'KF Interface'}</h1>
//                                 </div>
//                                 <br /><br /><br />
//                                 <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: "20px" }}>
//                                     <Button
//                                         variant="contained"
//                                         color="primary"
//                                         onClick={() => window.open('https://kf6.nccu.edu.tw/', '_blank')}
//                                     >
//                                         KF
//                                     </Button>
//                                     <Button
//                                         variant="contained"
//                                         color="secondary"
//                                         onClick={handleWriteArea}
//                                     >
//                                         Writing Area
//                                     </Button>
//                                 </div>
//                             </Container>
//                         </form>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default KF;

import React, { useState, useEffect } from "react";
import { Button, TextField, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar_Student";
import illustration from "../assets/Qcover3.png";

export const KF = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "student";
  const [userName, setUserName] = useState("");

  // 取得使用者名稱
  useEffect(() => {
    const name = localStorage.getItem("name");
    if (name) setUserName(name);
  }, []);

  const handleWriteArea = () => {
    if (role === "teacher") navigate("/writing_area");
    else navigate("/home");
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
      {/* 共用導覽列 */}
      <Navbar />

      {/* 主體內容 */}
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
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "stretch",
            width: "100%",
            maxWidth: "1200px",
            gap: "3vw",
          }}
        >
          {/* 左邊插圖或展示區塊 */}
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

          {/* 右邊主要區塊 */}
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
            {/* 標語文字（與主頁一致） */}
            <div
              style={{
                width: "100%",
                textAlign: "center",
                color: "#573f3f",
                fontSize: "clamp(1.2rem, 2.5vw, 2rem)",
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

            {/* 使用者歡迎 + KF/WritingArea 按鈕 */}
            <div
              className="form-section"
              style={{
                backgroundColor: "#573f3f",
                padding: "2rem",
                width: "100%",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "#DEDED6",
                boxSizing: "border-box",
                marginTop: "1rem",
              }}
            >
              {/* <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                Welcome, {userName ? userName : "Student"}!
              </h2> */}
              <h2 style={{ textAlign: "center", marginBottom: "1.5rem", whiteSpace: "pre-line",padding: "20px" }}>
                {`Welcome, ${userName ? userName : "Student"} !\nLet's make your writing even better today.`}
                </h2>


              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "20px",
                  marginTop: "1rem",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  style={{
                    backgroundColor: "#DEDED6",
                    color: "#573f3f",
                    fontWeight: "bold",
                    borderRadius: "10px",
                    padding: "0.5rem 2rem",
                  }}
                  onClick={() => window.open("https://kf6.nccu.edu.tw/", "_blank")}
                >
                  KF
                </Button>

                <Button
                  variant="contained"
                  color="secondary"
                  style={{
                    backgroundColor: "#DEDED6",
                    color: "#573f3f",
                    fontWeight: "bold",
                    borderRadius: "10px",
                    padding: "0.5rem 2rem",
                  }}
                  onClick={handleWriteArea}
                >
                  Writing Area
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KF;
