// import React, { useState } from 'react';
// import { Button, Container } from "@mui/material";
// import { useNavigate } from 'react-router-dom'; // 引入 useNavigate
// import Logo from "../assets/LOGO-removebg-preview.png";
// import { HiOutlineBars3 } from 'react-icons/hi2';
// import HomeIcon from "@mui/icons-material/Home";
// import InfoIcon from "@mui/icons-material/Info";
// import { List, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText, Drawer } from "@mui/material"
// import { Box } from '@mui/system';
// import { Register } from './Register';
// import { Login } from './Login'

// export default function Navbar() {
//   const [openMenu, setOpenMenu] = useState(false);
//   const navigate = useNavigate(); // 使用 useNavigate 進行導航
//   const role = localStorage.getItem("role") || "student";
//   const menuOptions = [
//     {
//       text: "Home",
//       icon: <HomeIcon />,
//       onClick: () => navigate('/') // 跳轉到 Home 頁面
//     },
//     {
//       text: "About",
//       icon: <InfoIcon />,
//       onClick: () => navigate('/About_student') // 跳轉到 About 頁面
//     },
//     {
//       text: "KF",
//       icon: <Login />,
//       onClick: () => window.open('https://kf6.nccu.edu.tw/', '_blank')
//     },
//     {
//       text: "Writing Area",
//       icon: <Register />,
//       onClick: () => navigate('/home') // 跳轉到 Register 頁面
//     }

    
//   ];

//   const handleWriteArea = () => {
//     if (role === "teacher") {
//         // navigate("/teacher/home");  // 根據角色跳轉到不同頁面
//         navigate("/writing_area");  // 根據角色跳轉到不同頁面
//     } else {
//         // navigate("/home");
//         navigate("/home");  // 根據角色跳轉到不同頁面
//     }
// };

// // 點擊 KF 按鈕時跳轉到 /kfweb 路徑
// // const handleKFTEACHERClick = () => {
// //     navigate("/kf");  // 跳轉到 /kfweb 頁面
// // };

//   return (
//     <nav>
//       <div className='nav-logo-container'>
//         <img alt='' src={Logo} width={150} height={120} />
//         <p style={{ marginLeft: '150px', position: 'relative', top: '-75px', fontSize: '24px' }}>
//           Collaborative Argumentation and Writing System
//         </p>
//       </div>

//       <div className="navbar-links-container">
//         <a href="" onClick={() => navigate('/kf')}>Home</a> {/* 使用 navigate 進行跳轉 */}
//         <a href="" onClick={() => navigate('/About_student')}>About</a> {/* 使用 navigate 進行跳轉 */}
//         <a href="" style={{ marginRight: '15px' }}>Manual</a>
//         <a href="" onClick={() => navigate('/')}>logout</a> {/* 使用 navigate 進行跳轉 */}

//       </div>

//       <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", gap: "20px" }}>
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
//                                     WritingArea
//                                 </Button>
//                             </div>

//       <div className='navbar-menu-container'>
//         <HiOutlineBars3 onClick={() => setOpenMenu(true)} />
//       </div>

//       <Drawer open={openMenu} onClose={() => setOpenMenu(false)} anchor='right'>
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
//     </nav>
//   );
// }




// import React, { useState } from 'react';
// import { Button } from "@mui/material";
// import { useNavigate } from 'react-router-dom';
// import { useMediaQuery } from '@mui/material';
// import Logo from "../assets/LOGONEW.png";
// import { HiOutlineBars3 } from 'react-icons/hi2';
// import HomeIcon from "@mui/icons-material/Home";
// import InfoIcon from "@mui/icons-material/Info";
// import LoginIcon from "@mui/icons-material/Login";
// import PersonAddIcon from "@mui/icons-material/PersonAdd";
// import { List, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText, Drawer } from "@mui/material";
// import { Box } from '@mui/system';
// import { Register } from './Register';
// import { Login } from './Login';

// export default function Navbar() {
//   const [openMenu, setOpenMenu] = useState(false);
//   const navigate = useNavigate();
//   const role = localStorage.getItem("role") || "student";

//   const isTablet = useMediaQuery('(max-width: 768px)');
//   const isMobile = useMediaQuery('(max-width: 480px)');

//   const menuOptions = [
//     {
//       text: "Home",
//       icon: <HomeIcon />,
//       onClick: () => navigate('/kf')
//     },
//     {
//       text: "About",
//       icon: <InfoIcon />,
//       onClick: () => navigate('/About_student')
//     },
//     {
//       text: "KF",
//       // icon: <LoginIcon />,
//       onClick: () => window.open('https://kf6.nccu.edu.tw/', '_blank')
//     },
//     {
//       text: "Writing Area",
//       // icon: <PersonAddIcon />,
//       onClick: () => navigate('/home')
//     },
//     {
//       text: "Logout",
//       icon: <HomeIcon />,
//       onClick: () => navigate('/')
//     }
//   ];

//   const handleWriteArea = () => {
//     if (role === "teacher") {
//       navigate("/writing_area");
//     } else {
//       navigate("/home");
//     }
//   };

//   const navbarStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: isMobile ? '0.5rem' : isTablet ? '1rem' : '1rem 2rem',
//     backgroundColor: 'transparent',
//     minHeight: '90px',
//     margin: '0 1.5rem',
//     width: '100%',
//     maxWidth: '1900px',
//     fontFamily: '"Reem Kufi", sans-serif',
//     zIndex: 1000
//   };

//   const navLogoContainerStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     gap: isMobile ? '0.5rem' : '1rem',
//     flexDirection: isTablet ? 'column' : 'row',
//     flexWrap: 'wrap'
//   };

//   const logoStyle = {
//     width: isMobile ? '100px' : isTablet ? '120px' : '150px',
//     height: isMobile ? '80px' : isTablet ? '96px' : '120px',
//     objectFit: 'contain',
//     cursor: 'pointer' // 添加這一行
//   };

//   const navTitleStyle = {
//     fontSize: isMobile ? '14px' : isTablet ? '18px' : '24px',
//     fontWeight: 500,
//     color: '#333',
//     margin: 0,
//     maxWidth: isMobile ? '200px' : '90%',
//     whiteSpace: isMobile ? 'nowrap' : 'normal',
//     overflow: isMobile ? 'hidden' : 'visible',
//     textOverflow: isMobile ? 'ellipsis' : 'clip'
//   };

//   const navbarLinksContainerStyle = {
//     display: isTablet ? 'none' : 'flex',
//     gap: '1.5rem',
//     alignItems: 'center',
//     marginLeft: 'auto'
//   };

//   const navbarMenuContainerStyle = {
//     display: isTablet ? 'block' : 'none',
//     cursor: 'pointer',
//     marginLeft: 'auto'
//   };

//   const menuIconStyle = {
//     fontSize: '2rem',
//     color: '#333'
//   };

//   const handleLogoClick = () => {
//     navigate('/'); // 導航到主畫面
//   };

//   return (
//     <nav style={navbarStyle}>
//       <div style={navLogoContainerStyle}>
        
//         <img 
//         alt='Logo' 
//         src={Logo} 
//         style={logoStyle} 
//         onClick={handleLogoClick}
//         role="button"
//         tabIndex={0}
//         onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
//         />
        
        
//         {!isTablet && (
//           <p style={navTitleStyle}>
//             Collaborative Argumentation and Writing System
//           </p>
//         )}
//       </div>

//       <div style={navbarLinksContainerStyle}>
//         <a href='' onClick={() => navigate('/kf')}>Home</a>
//         <a href='' onClick={() => navigate('/About_student')}>About</a>
//         <a href='' style={{ marginRight: '15px' }}>Manual</a>
//         <a href='' onClick={() => navigate('/')}>Logout</a>
//       </div>

//       <div style={{ display: isTablet ? 'none' : 'flex', flexDirection: "row", justifyContent: "center", gap: "20px" }}>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={() => window.open('https://kf6.nccu.edu.tw/', '_blank')}
//         >
//           KF
//         </Button>
//         <Button
//           variant="contained"
//           color="secondary"
//           onClick={handleWriteArea}
//         >
//           Writing Area
//         </Button>
//       </div>

//       <div style={navbarMenuContainerStyle}>
//         <HiOutlineBars3 style={menuIconStyle} onClick={() => setOpenMenu(true)} />
//       </div>

//       <Drawer open={openMenu} onClose={() => setOpenMenu(false)} anchor='right'
//         sx={{ '& .MuiDrawer-paper': { width: isMobile ? 180 : isTablet ? 200 : 250 } }}>
//         <Box sx={{ width: '100%' }} role="presentation">
//           <List>
//             {menuOptions.map((item) => (
//               <ListItem key={item.text} disablePadding>
//                 <ListItemButton onClick={item.onClick}>
//                   <ListItemIcon>{item.icon}</ListItemIcon>
//                   <ListItemText primary={item.text} />
//                 </ListItemButton>
//               </ListItem>
//             ))}
//           </List>
//           <Divider />
//         </Box>
//       </Drawer>
//     </nav>
//   );
// }

import React, { useState } from 'react';
import { Button } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { useMediaQuery, Drawer, List, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import Logo from "../assets/LOGONEW.png";
import Pencil from "../assets/Pencil.png";
import { HiOutlineBars3 } from 'react-icons/hi2';
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import DescriptionIcon from "@mui/icons-material/Description";
import SchoolIcon from "@mui/icons-material/School";
import { Box } from '@mui/system';

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "student";

  // 響應式判斷
  const isBelow900 = useMediaQuery('(max-width: 900px)');
  const isTablet = useMediaQuery('(max-width: 768px)');
  const isMobile = useMediaQuery('(max-width: 480px)');

  // Drawer 選單項目
  const menuOptions = [
    { text: "Home", icon: <HomeIcon />, onClick: () => navigate('/kf') },
    { text: "About", icon: <InfoIcon />, onClick: () => navigate('/About_student') },
    { text: "KF", icon: <SchoolIcon />, onClick: () => window.open('https://kf6.nccu.edu.tw/', '_blank') },
    { text: "Writing Area", icon: <DescriptionIcon />, onClick: () => handleWriteArea() },
    { text: "Logout", icon: <ExitToAppIcon />, onClick: () => navigate('/') },
  ];

  const handleWriteArea = () => {
    if (role === "teacher") navigate("/writing_area");
    else navigate("/home");
  };

  const handleLogoClick = () => navigate('/');

  // --- 樣式設定（與主頁一致） ---
  const navbarStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: isMobile ? '0.5rem 1rem' : isTablet ? '0.75rem 1.5rem' : '1rem 2rem',
    backgroundColor: '#DEDED6',
    minHeight: isTablet ? '80px' : '120px',
    margin: '0 1.5rem',
    width: '100%',
    maxWidth: '1900px',
    fontFamily: '"Reem Kufi", sans-serif',
    zIndex: 1000,
  };

  const topRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: '1',
    minHeight: '60px',
  };

  const leftTopStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '0.5rem' : '1rem',
    flexDirection: isMobile ? 'column' : 'row',
    flexWrap: 'wrap',
    flex: 1,
  };

  const logoStyle = {
    width: isMobile ? '80px' : isTablet ? '100px' : '120px',
    height: isMobile ? '60px' : isTablet ? '80px' : '100px',
    objectFit: 'contain',
    cursor: 'pointer',
  };

  const navTitleStyle = {
    fontSize: isMobile ? '12px' : isTablet ? '16px' : '30px',
    fontWeight: 'normal',
    color: '#333',
    margin: 0,
    maxWidth: isMobile ? '150px' : isTablet ? '200px' : '800px',
    whiteSpace: 'normal',
    lineHeight: 1.2,
    textAlign: 'left',
  };

  const hamburgerContainerStyle = {
    display: isTablet ? 'block' : 'none',
    cursor: 'pointer',
  };

  const menuIconStyle = {
    fontSize: isMobile ? '1.5rem' : '2rem',
    color: '#333',
  };

  const bottomRowStyle = {
    display: isTablet ? 'none' : 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '1rem',
    marginTop: '1.5rem',
    minHeight: '30px',
  };

  const pencilStyle = {
    width: '65%',
    maxWidth: '80vw',
    height: '20px',
    objectFit: 'contain',
    marginRight: 'auto',
  };

  const linksContainerStyle = {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    marginLeft: 'auto',
  };

  const linkStyle = {
    textDecoration: 'none',
    color: '#333',
    fontSize: '1.5rem',
    fontWeight: 600,
    transition: 'color 0.2s',
  };

  return (
    <nav style={navbarStyle}>
      {/* 上層：Logo + 標題 + 漢堡選單 */}
      <div style={topRowStyle}>
        <div style={leftTopStyle}>
          <img
            alt="Logo"
            src={Logo}
            style={logoStyle}
            onClick={handleLogoClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
          />
          {!isBelow900 && (
            <p style={navTitleStyle}>
              Collaborative Argumentation and Writing System
            </p>
          )}
        </div>

        <div style={hamburgerContainerStyle}>
          <HiOutlineBars3 style={menuIconStyle} onClick={() => setOpenMenu(true)} />
        </div>
      </div>

      {/* 下層：鉛筆線 + 按鈕區域 */}
      <div style={bottomRowStyle}>
        <img src={Pencil} alt="Pencil Icon" style={pencilStyle} />
        <div style={linksContainerStyle}>
          <a href='/About_student' style={linkStyle}>About</a>
          <a href='/kf' style={linkStyle}>Home</a>
          <a href='/manual' style={linkStyle}>Manual</a>
          <a href='/' style={linkStyle}>Logout</a>
          {/* <Button
            variant="contained"
            color="primary"
            onClick={() => window.open('https://kf6.nccu.edu.tw/', '_blank')}
          >
            KF
          </Button> */}
          {/* <Button
            variant="contained"
            color="secondary"
            onClick={handleWriteArea}
          >
            Writing Area
          </Button> */}
        </div>
      </div>

      {/* Drawer (平板/手機顯示) */}
      <Drawer
        open={openMenu}
        onClose={() => setOpenMenu(false)}
        anchor="right"
        sx={{
          '& .MuiDrawer-paper': {
            width: isMobile ? 180 : isTablet ? 200 : 250,
          },
        }}
      >
        <Box sx={{ width: '100%' }} role="presentation">
          <List>
            {menuOptions.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton onClick={item.onClick}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>
    </nav>
  );
}
