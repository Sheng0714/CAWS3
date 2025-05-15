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




import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import Logo from "../assets/LOGO-removebg-preview.png";
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isMobile ? '0.5rem' : isTablet ? '1rem' : '1rem 2rem',
    backgroundColor: 'transparent', // 保持透明背景
    // 如果需要與圖片中的淺藍色匹配，可使用：backgroundColor: '#e6f0fa'
    minHeight: '90px', // 與 App.css 的 nav 一致
    margin: '0 1.5rem', // 與 App.css 的 nav 一致
    width: '100%',
    maxWidth: '1900px', // 與 App.css 的 .App 一致
    fontFamily: '"Reem Kufi", sans-serif', // 與 App.css 一致
    zIndex: 1000, // 防止被其他元素覆蓋
  };

  const navLogoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '0.5rem' : '1rem',
    flexDirection: isTablet ? 'column' : 'row', // 平板以下垂直排列
    flexWrap: 'wrap',
  };

  const logoStyle = {
    width: isMobile ? '100px' : isTablet ? '120px' : '150px',
    height: isMobile ? '80px' : isTablet ? '96px' : '120px',
    objectFit: 'contain',
  };

  const navTitleStyle = {
    fontSize: isMobile ? '14px' : isTablet ? '18px' : '24px',
    fontWeight: 500,
    color: '#333',
    margin: 0,
    maxWidth: isMobile ? '200px' : '90%',
    whiteSpace: isMobile ? 'nowrap' : 'normal',
    overflow: isMobile ? 'hidden' : 'visible',
    textOverflow: isMobile ? 'ellipsis' : 'clip', // 手機上防止標題溢出
  };

  const navbarLinksContainerStyle = {
    display: isTablet ? 'none' : 'flex', // 平板以下隱藏
    gap: '1.5rem',
    alignItems: 'center',
    marginLeft: 'auto',
  };

  const linkStyle = {
    textDecoration: 'none',
    color: '#333',
    fontSize: '1.1rem',
    fontWeight: 600,
    transition: 'color 0.2s',
  };

  const navbarMenuContainerStyle = {
    display: isTablet ? 'block' : 'none', // 平板以下顯示漢堡選單
    cursor: 'pointer',
    marginLeft: 'auto',
  };

  const menuIconStyle = {
    fontSize: '2rem',
    color: '#333',
  };

  return (
    <nav style={navbarStyle}>
      <div style={navLogoContainerStyle}>
        <img alt="Logo" src={Logo} style={logoStyle} />
        {!isBelow900 && ( // 當寬度小於 900px 時隱藏標題
          <p style={navTitleStyle}>
            Collaborative Argumentation and Writing System
          </p>
        )}
      </div>
      
      <div style={navbarLinksContainerStyle}>
        <a href='/' style={linkStyle}>Home</a>
        <a href='/about' style={linkStyle}>About</a>
      </div>

      <div style={navbarMenuContainerStyle}>
        <HiOutlineBars3 style={menuIconStyle} onClick={() => setOpenMenu(true)} />
      </div>
      
      <Drawer
        open={openMenu}
        onClose={() => setOpenMenu(false)}
        anchor="right"
        sx={{
          '& .MuiDrawer-paper': {
            width: isMobile ? 180 : isTablet ? 200 : 250, // 響應式 Drawer 寬度
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