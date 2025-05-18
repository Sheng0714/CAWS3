import React, {useState, useEffect, useRef} from 'react';
import Logo from "../assets/LOGO-removebg-preview.png"
import Avatar from '@mui/material/Avatar';
import { useSignOut } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import user from '../assets/user.png';
import edit from '../assets/edit.png';
import { JoinActivityForm } from './JoinActivityForm';
import EditProfileModal from './EditProfileModal';

function stringToColor(string) {
    let hash = 0;
    let i;
  
    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    let color = '#';
  
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */
  
    return color;
}
  
function stringAvatar(name) {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name.split('').map((char, index) => index > 0 ? char : '').join('')}`,
    // children: `${name.split('')[1][0]}${name.split('')[2][0]}`,
  };
}

function DropdownItem({ img = '', text = '', onClick = null }) {
  return (
      <li className="dropdownItem" onClick={onClick}>
          <img src={img} alt={text} />
          <a>{text}</a>
      </li>
  );
}


export default function IndexPage_Navbar({callback_setActivities}) {
    const singOut = useSignOut();
    const navigate = useNavigate();

    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email')
    
    let menuRef = useRef();

    const [open, setOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

    const handleOpenEditProfile = () => {
        setIsEditProfileOpen(true);
    };

    const handleCloseEditProfile = () => {
        setIsEditProfileOpen(false);
    };
    useEffect(() => {
        let handler = (e) => {
            if(!menuRef.current.contains(e.target)){
                setOpen(false);
                // console.log(menuRef.current);
            }
        };

        document.addEventListener("mousedown", handler);

        return() => {
            document.removeEventListener("mousedown", handler);
        }
    }, []);
  
    const logout = () => {
      singOut();
      navigate("/");
      localStorage.removeItem('userId');
      localStorage.removeItem('name');
      localStorage.removeItem('email');
      localStorage.removeItem('activityId');
      localStorage.removeItem('groupId');
      localStorage.removeItem('nodeId');
      localStorage.removeItem('nodeDataLength');
      localStorage.removeItem('jwtToken');

    };

    const handleLogoClick = () => {
    navigate('/'); // 導航到主畫面
  };

    return (
      <>
        <nav ref={menuRef}>
            <div className='nav-logo-container'>
                <img alt='' 
                src={Logo} 
                width={85} 
                height={85}
                onClick={handleLogoClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()} 
                />
            </div>
            <div className='nav-buttons'>
                {/* <button className='common-button' onClick={() => navigate("/teacher/home")}>創建活動</button> */}
                <button className='join-activity-button'>
                  <JoinActivityForm callback_setActivities={callback_setActivities}/>
                </button>
                <div className="menu-trigger" onClick={() => { setOpen(!open) }}>
                    <Avatar {...stringAvatar(name)} />
                </div>
            </div>
            <div className={`dropdown-menu ${open? 'active' : 'inactive'}`} >
                <h3>Hi{name}</h3>
                <ul>
                    <DropdownItem img = {user} text = {"我的個人資料"}/>
                    <DropdownItem
                            img={edit}
                            text={"編輯個人資料"}
                            onClick={handleOpenEditProfile} 
                    />                     </ul>
                <h3><button className='register-button' onClick={logout}>logout</button></h3>
            </div>
      </nav>
      <EditProfileModal open={isEditProfileOpen} onClose={handleCloseEditProfile} />
      </>
    )
}