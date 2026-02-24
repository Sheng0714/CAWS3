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
//         {/* <button className='login-button' onClick={() => setOpenLogin(true)}>?擗</button>
//       <button className='register-button' onClick={() => setOpenRegister(true)}>?桅??</button> */}

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

//   // ?輯撒??useMediaQuery ?潘撓??嚗???蝡?
//   const isBelow900 = useMediaQuery('(max-width: 900px)'); // ??? 900px ??颲?
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

//   // ?堊垓??頦?????閬??
//   const navbarStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: isMobile ? '0.5rem' : isTablet ? '1rem' : '1rem 2rem',
//      backgroundColor: '#DEDED6', 
//     // backgroundColor: 'transparent', // ?踐???????魂?
//     // ??????秋撫??謘????????????????剛????backgroundColor: '#e6f0fa'
//     minHeight: '90px', // ??App.css ??nav ???
//     margin: '0 1.5rem', // ??App.css ??nav ???
//     width: '100%',
//     maxWidth: '1900px', // ??App.css ??.App ???
//     fontFamily: '"Reem Kufi", sans-serif', // ??App.css ???
//     zIndex: 1000, // ??怨翰?⊥??□??滿???
//   };

//   const navLogoContainerStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     gap: isMobile ? '0.5rem' : '1rem',
//     flexDirection: isTablet ? 'column' : 'row', // ?豰⊿?銋??蹇????
//     flexWrap: 'wrap',
//   };

//   const logoStyle = {
//     width: isMobile ? '100px' : isTablet ? '120px' : '150px',
//     height: isMobile ? '80px' : isTablet ? '96px' : '120px',
//     objectFit: 'contain',
//     cursor: 'pointer' // ????謕???
//   };

//   const navTitleStyle = {
    
//     fontSize: isMobile ? '14px' : isTablet ? '18px' : '24px',
//     // fontWeight: 500,
//     fontWeight: 'normal', // ??'bold' ?謘賣?瞏??秋播?????
//     color: '#333',
//     margin: 0,
//     maxWidth: isMobile ? '200px' : '90%',
//     whiteSpace: isMobile ? 'nowrap' : 'normal',
//     overflow: isMobile ? 'hidden' : 'visible',
//     textOverflow: isMobile ? 'ellipsis' : 'clip', // ?????謢?嚗??選皛??
//   };

//   const navbarLinksContainerStyle = {
//     display: isTablet ? 'none' : 'flex', // ?豰⊿?銋??璇?
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
//     display: isTablet ? 'block' : 'none', // ?豰⊿?銋??輯??抒?嚗畸??閰制?
//     cursor: 'pointer',
//     marginLeft: 'auto',
//   };

//   const menuIconStyle = {
//     fontSize: '2rem',
//     color: '#333',
//   };

//   const handleLogoClick = () => {
//     navigate('/'); // ?????祈????
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

//         {!isBelow900 && ( // ????刻????900px ?蹇盲?????
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
//             width: isMobile ? 180 : isTablet ? 200 : 250, // ?頦???Drawer ??瞍?
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

//   // ?輯撒??useMediaQuery ?潘撓??嚗???蝡?
//   const isBelow900 = useMediaQuery('(max-width: 900px)'); // ??? 900px ??颲?
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

//   // ?堊垓??頦?????閬??
//   const navbarStyle = {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'stretch',
//     padding: isMobile ? '0.5rem 1rem' : isTablet ? '0.75rem 1.5rem' : '1rem 2rem',
//     backgroundColor: '#FFFFFF', 
//     minHeight: isTablet ? '80px' : '120px', // ?方葭?格?謢嗆撞???????
//     margin: '0 1.5rem', 
//     width: '100%',
//     maxWidth: '1900px', 
//     fontFamily: '"Reem Kufi", sans-serif', 
//     zIndex: 1000, 
//   };

//   // ????契??????質???(LOGO + ???)
//   const topRowStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     flex: '1',
//     minHeight: '60px',
//   };

//   const leftTopStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     gap: isMobile ? '0.5rem' : '1rem',
//     flexDirection: isMobile ? 'column' : 'row',
//     flexWrap: 'wrap',
//     flex: 1,
//   };

//   const logoStyle = {
//     width: isMobile ? '80px' : isTablet ? '100px' : '120px',
//     height: isMobile ? '60px' : isTablet ? '80px' : '100px',
//     objectFit: 'contain',
//     cursor: 'pointer'
//   };

//   const navTitleStyle = {
//     fontSize: isMobile ? '12px' : isTablet ? '16px' : '30px',
//     fontWeight: 'normal', 
//     color: '#333',
//     margin: 0,
//     maxWidth: isMobile ? '150px' : isTablet ? '200px' : '800px',
//     whiteSpace: 'normal', // ?蹓曇?????謜?????
//     lineHeight: 1.2,
//     textAlign: 'left',
//   };

//   // ????城?輸????遴??獢???(?豰⊿?銋??輯???
//   const hamburgerContainerStyle = {
//     display: isTablet ? 'block' : 'none',
//     cursor: 'pointer',
//   };

//   const menuIconStyle = {
//     fontSize: isMobile ? '1.5rem' : '2rem',
//     color: '#333',
//   };

//   // ?賣??謍??????質???(?謜? + About + Home ?????嚚??? - ?謜??蹎什???
//   const bottomRowStyle = {
//     display: isTablet ? 'none' : 'flex',
//     alignItems: 'center',
//     justifyContent: 'flex-start', // ?撖抆冪?蹎什???
//     gap: '1rem', // ?謜???倦????????
//     marginTop: '1.5rem',
//     minHeight: '30px',
//   };

//   // ?賣??謍???閬??- ??撞????嚗?80%???頦???
//   const pencilStyle = {
//     width: '80%', // ?閰??瞏??啣音謒?(navbar) ??80%
//     maxWidth: '80vw', // ????蝞???蟡銵? 80%?謢?嚗豢趙??
//     height: '20px', // ?朱瞍脤豲????堆?????
//     objectFit: 'contain', // ?踐???謘??伍??
//     marginRight: 'auto', // ?????謜??蹎什???次敺??佇??????????
//   };

//   // ????契????啣音謒??? - ??祗???
//   const linksContainerStyle = {
//     display: isTablet ? 'none' : 'flex',
//     gap: '1.5rem',
//     alignItems: 'center',
//     marginLeft: 'auto',
//     marginRight: '1rem',
//   };

//   const linkStyle = {
//     textDecoration: 'none',
//     color: '#333',
//     fontSize: '1.5rem',
//     fontWeight: 600,
//     transition: 'color 0.2s',
//   };

//   // ????城??綜垮閬??(???謘??????)
//   const lineStyle = {
//     border: 'none',
//     height: '1px',
//     backgroundColor: '#D2B48C', // ?捂????????撖??謘?
//     width: '100%',
//     margin: '0.25rem 0',
//   };

//   const handleLogoClick = () => {
//     navigate('/'); 
//   };

//   return (
//     <nav style={navbarStyle}>
//       {/* ?蹇??往OGO + ??? + ?撥赯?閰制? */}
//       <div style={topRowStyle}>
//         <div style={leftTopStyle}>
//           <img 
//             alt="Logo" 
//             src={Logo} 
//             style={logoStyle}
//             onClick={handleLogoClick}
//             role="button"
//             tabIndex={0}
//             onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
//           />
//           {!isBelow900 && (
//             <p style={navTitleStyle}>
//               Collaborative Argumentation and Writing System
//             </p>
//           )}
//         </div>
//         <div style={hamburgerContainerStyle}>
//           <HiOutlineBars3 style={menuIconStyle} onClick={() => setOpenMenu(true)} />
//         </div>
//       </div>

   

//       {/* ?制???謍???(?蹎什??望?0%) + About + Home (???) */}
//       <div style={bottomRowStyle}>
//         <img src={Pencil} alt="Pencil Icon" style={pencilStyle} />
//         <div style={linksContainerStyle}>
//           <a href='/about' style={linkStyle}>About</a>
//           <a href='/' style={linkStyle}>Home</a>
//         </div>
//       </div>
      
//       <Drawer
//         open={openMenu}
//         onClose={() => setOpenMenu(false)}
//         anchor="right"
//         sx={{
//           '& .MuiDrawer-paper': {
//             width: isMobile ? 180 : isTablet ? 200 : 250, 
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

  const isBelow900 = useMediaQuery('(max-width: 900px)');
  const isTablet = useMediaQuery('(max-width: 768px)');
  const isMobile = useMediaQuery('(max-width: 480px)');

  const menuOptions = [
    {
      text: 'Home',
      icon: <HomeIcon />,
      action: () => {
        setOpenMenu(false);
        navigate('/');
      },
    },
    {
      text: 'About',
      icon: <InfoIcon />,
      action: () => {
        setOpenMenu(false);
        navigate('/about');
      },
    },
    {
      text: 'Login',
      icon: <LoginIcon />,
      action: () => {
        setOpenMenu(false);
        setOpenLogin(true);
      },
    },
    {
      text: 'Register',
      icon: <PersonAddIcon />,
      action: () => {
        setOpenMenu(false);
        setOpenRegister(true);
      },
    },
  ];

  const navbarStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: isMobile ? '0.5rem 1rem' : isTablet ? '0.75rem 1.5rem' : '1rem 2rem',
    backgroundColor: '#FFFFFF',
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

  const linksContainerStyle = {
    display: isTablet ? 'none' : 'flex',
    gap: '1.5rem',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: '1rem',
  };

  const linkStyle = {
    textDecoration: 'none',
    color: '#333',
    fontSize: '1.5rem',
    fontWeight: 600,
    transition: 'color 0.2s',
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <nav style={navbarStyle}>
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

        <div style={linksContainerStyle}>
          <a href='/about' style={linkStyle}>About</a>
          <a href='/' style={linkStyle}>Home</a>
        </div>

        <div style={hamburgerContainerStyle}>
          <HiOutlineBars3 style={menuIconStyle} onClick={() => setOpenMenu(true)} />
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
