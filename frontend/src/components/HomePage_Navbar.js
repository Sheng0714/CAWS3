// import React, { useState } from 'react';
// import Logo from "../assets/LOGO-removebg-preview.png";
// import { HiOutlineBars3 } from 'react-icons/hi2';
// import HomeIcon from "@mui/icons-material/Home";
// import InfoIcon from "@mui/icons-material/Info";
// import LoginIcon from "@mui/icons-material/Login"; 
// import PersonAddIcon from "@mui/icons-material/PersonAdd"; 

// import { List, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText, Drawer, Button } from "@mui/material"
// import { Box } from '@mui/system';
// import { Register } from './Register';
// import { Login } from './Login'

// export default function Navbar() {
//   const [openMenu, setOpenMenu] = useState(false)
//   const [openLogin, setOpenLogin] = useState(false);
//   const [openRegister, setOpenRegister] = useState(false);
//   const menuOptions = [
//     {
//       text: "Home",
//       icon: <HomeIcon />,
//       action: () => {
//         setOpenMenu(false);
//         navigate('/..');
//       },
//     },
//     {
//       text: "About",
//       icon: <InfoIcon />,
//       action: () => {
//         setOpenMenu(false);
//         navigate('/about');
//       },
//     },
//     {
//       text: "Login",
//       icon: <LoginIcon />,
//       action: () => {
//         setOpenMenu(false); z
//         setOpenLogin(true); 
//       },
//     },
//     {
//       text: "Register",
//       icon: <PersonAddIcon />,
//       action: () => {
//         setOpenMenu(false); 
//         setOpenRegister(true); 
//       },
//     },
//   ];
//   return (
//     <nav>
//        <div className='nav-logo-container'>
//         <img alt='' src={Logo} width={150} height={120} />
//         <p style={{ marginLeft: '150px', position: 'relative', top: '-75px', fontSize: '24px' }}>
//           Collaborative Argumentation and Writing System
//         </p>
//       </div>
        
//       <div className="navbar-links-container" style={{ marginLeft: "auto" }}>
//         <a href='/..'>Home</a>
//         <a href='/about'>About</a>
//         {/* <button className='login-button' onClick={() => setOpenLogin(true)}>登入</button>
//       <button className='register-button' onClick={() => setOpenRegister(true)}>註冊</button> */}

//    </div>

//       <div className='navbar-menu-container' style={{ marginLeft: "auto" }}>
//         <HiOutlineBars3 onClick={() => setOpenMenu(true)} />
//       </div>
//       <Drawer open={openMenu} onClose={() => setOpenMenu(false)} anchor='right'>
//         <Box sx={{ width: 250 }} role="presentation">
//           <List>
//             {menuOptions.map((item, index) => (
//               <ListItem key={index} disablePadding>
//                 <ListItemButton onClick={item.action}>
//                   <ListItemIcon>{item.icon}</ListItemIcon>
//                   <ListItemText primary={item.text} />
//                 </ListItemButton>
//               </ListItem>
//             ))}
//           </List>
//           <Divider />
//         </Box>
//       </Drawer>
//       <Login open={openLogin} setOpen={setOpenLogin} setOpenRegister={setOpenRegister} />
//       <Register open={openRegister} setOpen={setOpenRegister} setOpenLogin={setOpenLogin} />
//      </nav>
//   )
// }




// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useMediaQuery } from '@mui/material';
// import Logo from "../assets/LOGONEW.png";
// import Pencil from "../assets/Pencil.png";
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
//   const [openLogin, setOpenLogin] = useState(false);
//   const [openRegister, setOpenRegister] = useState(false);
//   const navigate = useNavigate();

//   // 使用 useMediaQuery 檢測螢幕尺寸
//   const isBelow900 = useMediaQuery('(max-width: 900px)'); // 新增 900px 條件
//   const isTablet = useMediaQuery('(max-width: 768px)');
//   const isMobile = useMediaQuery('(max-width: 480px)');

//   const menuOptions = [
//     {
//       text: "Home",
//       icon: <HomeIcon />,
//       action: () => {
//         setOpenMenu(false);
//         navigate('/');
//       },
//     },
//     {
//       text: "About",
//       icon: <InfoIcon />,
//       action: () => {
//         setOpenMenu(false);
//         navigate('/about');
//       },
//     },
//     {
//       text: "Login",
//       icon: <LoginIcon />,
//       action: () => {
//         setOpenMenu(false);
//         setOpenLogin(true);
//       },
//     },
//     {
//       text: "Register",
//       icon: <PersonAddIcon />,
//       action: () => {
//         setOpenMenu(false);
//         setOpenRegister(true);
//       },
//     },
//   ];

//   // 定義響應式內聯樣式
//   const navbarStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: isMobile ? '0.5rem' : isTablet ? '1rem' : '1rem 2rem',
//      backgroundColor: '#DEDED6', 
//     // backgroundColor: 'transparent', // 保持透明背景
//     // 如果需要與圖片中的淺藍色匹配，可使用：backgroundColor: '#e6f0fa'
//     minHeight: '90px', // 與 App.css 的 nav 一致
//     margin: '0 1.5rem', // 與 App.css 的 nav 一致
//     width: '100%',
//     maxWidth: '1900px', // 與 App.css 的 .App 一致
//     fontFamily: '"Reem Kufi", sans-serif', // 與 App.css 一致
//     zIndex: 1000, // 防止被其他元素覆蓋
//   };

//   const navLogoContainerStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     gap: isMobile ? '0.5rem' : '1rem',
//     flexDirection: isTablet ? 'column' : 'row', // 平板以下垂直排列
//     flexWrap: 'wrap',
//   };

//   const logoStyle = {
//     width: isMobile ? '100px' : isTablet ? '120px' : '150px',
//     height: isMobile ? '80px' : isTablet ? '96px' : '120px',
//     objectFit: 'contain',
//     cursor: 'pointer' // 添加這一行
//   };

//   const navTitleStyle = {
    
//     fontSize: isMobile ? '14px' : isTablet ? '18px' : '24px',
//     // fontWeight: 500,
//     fontWeight: 'normal', // 或 'bold' 取決於你要的粗細
//     color: '#333',
//     margin: 0,
//     maxWidth: isMobile ? '200px' : '90%',
//     whiteSpace: isMobile ? 'nowrap' : 'normal',
//     overflow: isMobile ? 'hidden' : 'visible',
//     textOverflow: isMobile ? 'ellipsis' : 'clip', // 手機上防止標題溢出
//   };

//   const navbarLinksContainerStyle = {
//     display: isTablet ? 'none' : 'flex', // 平板以下隱藏
//     gap: '1.5rem',
//     alignItems: 'center',
//     marginLeft: 'auto',
//   };

//   const linkStyle = {
//     textDecoration: 'none',
//     color: '#333',
//     fontSize: '1.1rem',
//     fontWeight: 600,
//     transition: 'color 0.2s',
//   };

//   const navbarMenuContainerStyle = {
//     display: isTablet ? 'block' : 'none', // 平板以下顯示漢堡選單
//     cursor: 'pointer',
//     marginLeft: 'auto',
//   };

//   const menuIconStyle = {
//     fontSize: '2rem',
//     color: '#333',
//   };

//   const handleLogoClick = () => {
//     navigate('/'); // 導航到主畫面
//   };

//   return (
//     <nav style={navbarStyle}>
//       <div style={navLogoContainerStyle}>
        
//         <img 
//         alt="Logo" 
//         src={Logo} 
//         style={logoStyle}
//         onClick={handleLogoClick}
//         role="button"
//         tabIndex={0}
//         onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
//          />

//         {!isBelow900 && ( // 當寬度小於 900px 時隱藏標題
//           <p style={navTitleStyle}>
//             Collaborative Argumentation and Writing System
//           </p>
//         )}
//       </div>
      
//       <div style={navbarLinksContainerStyle}>
//         <a href='/' style={linkStyle}>Home</a>
//         <a href='/about_Home' style={linkStyle}>About</a>
//       </div>

//       <div style={navbarMenuContainerStyle}>
//         <HiOutlineBars3 style={menuIconStyle} onClick={() => setOpenMenu(true)} />
//       </div>
      
//       <Drawer
//         open={openMenu}
//         onClose={() => setOpenMenu(false)}
//         anchor="right"
//         sx={{
//           '& .MuiDrawer-paper': {
//             width: isMobile ? 180 : isTablet ? 200 : 250, // 響應式 Drawer 寬度
//           },
//         }}
//       >
//         <Box sx={{ width: '100%' }} role="presentation">
//           <List>
//             {menuOptions.map((item, index) => (
//               <ListItem key={index} disablePadding>
//                 <ListItemButton onClick={item.action}>
//                   <ListItemIcon>{item.icon}</ListItemIcon>
//                   <ListItemText primary={item.text} />
//                 </ListItemButton>
//               </ListItem>
//             ))}
//           </List>
//           <Divider />
//         </Box>
//       </Drawer>
      
//       <Login open={openLogin} setOpen={setOpenLogin} setOpenRegister={setOpenRegister} />
//       <Register open={openRegister} setOpen={setOpenRegister} setOpenLogin={setOpenLogin} />
//     </nav>
//   );
// }






import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import Logo from "../assets/LOGONEW.png";
import Pencil from "../assets/Pencil.png";
import { HiOutlineBars3 } from 'react-icons/hi2';
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import LoginIcon from "@mui/icons-material/Login"; 
import PersonAddIcon from "@mui/icons-material/PersonAdd"; 
import { List, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText, Drawer } from "@mui/material";
import { Box } from '@mui/system';
import { Register } from './Register';
import { Login } from './Login';

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const navigate = useNavigate();

  // 使用 useMediaQuery 檢測螢幕尺寸
  const isBelow900 = useMediaQuery('(max-width: 900px)'); // 新增 900px 條件
  const isTablet = useMediaQuery('(max-width: 768px)');
  const isMobile = useMediaQuery('(max-width: 480px)');

  const menuOptions = [
    {
      text: "Home",
      icon: <HomeIcon />,
      action: () => {
        setOpenMenu(false);
        navigate('/');
      },
    },
    {
      text: "About",
      icon: <InfoIcon />,
      action: () => {
        setOpenMenu(false);
        navigate('/about');
      },
    },
    {
      text: "Login",
      icon: <LoginIcon />,
      action: () => {
        setOpenMenu(false);
        setOpenLogin(true);
      },
    },
    {
      text: "Register",
      icon: <PersonAddIcon />,
      action: () => {
        setOpenMenu(false);
        setOpenRegister(true);
      },
    },
  ];

  // 定義響應式內聯樣式
  const navbarStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: isMobile ? '0.5rem 1rem' : isTablet ? '0.75rem 1.5rem' : '1rem 2rem',
    backgroundColor: '#DEDED6', 
    minHeight: isTablet ? '80px' : '120px', // 調整高度以容納兩層
    margin: '0 1.5rem', 
    width: '100%',
    maxWidth: '1900px', 
    fontFamily: '"Reem Kufi", sans-serif', 
    zIndex: 1000, 
  };

  // 新增：頂層容器樣式 (LOGO + 標題)
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
    cursor: 'pointer'
  };

  const navTitleStyle = {
    fontSize: isMobile ? '12px' : isTablet ? '16px' : '30px',
    fontWeight: 'normal', 
    color: '#333',
    margin: 0,
    maxWidth: isMobile ? '150px' : isTablet ? '200px' : '400px',
    whiteSpace: 'normal', // 允許標題換行成兩行
    lineHeight: 1.2,
    textAlign: 'left',
  };

  // 新增：右上漢堡選單容器 (平板以下顯示)
  const hamburgerContainerStyle = {
    display: isTablet ? 'block' : 'none',
    cursor: 'pointer',
  };

  const menuIconStyle = {
    fontSize: isMobile ? '1.5rem' : '2rem',
    color: '#333',
  };

  // 修改：底層容器樣式 (鉛筆 + About + Home 平行，桌面顯示) - 鉛筆靠左對齊
  const bottomRowStyle = {
    display: isTablet ? 'none' : 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start', // 改為靠左對齊
    gap: '1rem', // 鉛筆與連結間的間距
    marginTop: '1.5rem',
    minHeight: '30px',
  };

  // 修改：鉛筆樣式 - 長度達頁面的80%，並響應式
  const pencilStyle = {
    width: '80%', // 相對於父容器 (navbar) 的 80%
    maxWidth: '80vw', // 限制為視窗寬度的 80%，防止溢出
    height: '20px', // 高度保持，讓它變橫長
    objectFit: 'contain', // 保持圖片比例
    marginRight: 'auto', // 確保鉛筆靠左，其餘空間推到右邊的連結
  };

  // 新增：連結容器樣式 - 放在右邊
  const linksContainerStyle = {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
    marginLeft: 'auto', // 推到右邊
  };

  const linkStyle = {
    textDecoration: 'none',
    color: '#333',
    fontSize: '1.5rem',
    fontWeight: 600,
    transition: 'color 0.2s',
  };

  // 新增：底線樣式 (模擬圖片中的橫線)
  const lineStyle = {
    border: 'none',
    height: '1px',
    backgroundColor: '#D2B48C', // 淺棕色線條，匹配圖片
    width: '100%',
    margin: '0.25rem 0',
  };

  const handleLogoClick = () => {
    navigate('/'); 
  };

  return (
    <nav style={navbarStyle}>
      {/* 頂層：LOGO + 標題 + 漢堡選單 */}
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

   

      {/* 底層：鉛筆 (靠左，長度80%) + About + Home (右邊) */}
      <div style={bottomRowStyle}>
        <img src={Pencil} alt="Pencil Icon" style={pencilStyle} />
        <div style={linksContainerStyle}>
          <a href='/about' style={linkStyle}>About</a>
          <a href='/' style={linkStyle}>Home</a>
        </div>
      </div>
      
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
            {menuOptions.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton onClick={item.action}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>
      
      <Login open={openLogin} setOpen={setOpenLogin} setOpenRegister={setOpenRegister} />
      <Register open={openRegister} setOpen={setOpenRegister} setOpenLogin={setOpenLogin} />
    </nav>
  );
}