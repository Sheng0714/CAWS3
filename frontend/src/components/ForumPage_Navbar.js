import React, { useEffect, useState, useContext } from "react";
import config from "../config.json";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import {
  Box,
  Toolbar,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import BackToHomeIcon from "../assets/返回首頁icon.png";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import IdeaIcon from "../assets/IdeaIcon.png";
import QuestionIcon from "../assets/QuestionIcon.png";
import InformationIcon from "../assets/InformationIcon.png";
import FlaskIcon from "../assets/FlaskIcon.png";
import NoteIcon from "../assets/NoteIcon.png";
import CreateForumIcon from "../assets/CreateForumIcon.png";
import TaskMapIcon from "../assets/TaskMapIcon.png";
import LearningFeedbackIcon from "../assets/LearningFeedbackIcon.png";
import ForumIcon from "../assets/返回論壇icon.png";
import CommunityIcon from "../assets/CommunityIcon.png";
import AnnouncementIcon from "../assets/AnnouncementIcon.png";
import { CreateIdea } from "./CreateIdea";
import { CreateQuestion } from "./CreateQuestion";
import { CreateInformation } from "./CreateInformation";
import { CreateFlask } from "./CreateFlask";
import { CreateNote } from "./CreateNote";
import url from "../url.json";
import { GroupChatRoom } from "./GroupChatRoom";
import { ChatModeToggle } from "./ChatModeToggle";
import { ModeContext } from '../contexts/ModeContext';


const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));





// const specialItems = ['新增想法牆','任務地圖', '學習歷程', '討論區'];
// const specialItems = ['新增紀錄', '學習歷程', '討論區'];
const specialItems = ["新增實驗", "新增紀錄", "學習歷程"];
const defaultNavBarItems = [
  { text: "新增想法", modalKey: "createIdea", icon: "IdeaIcon" },
  { text: "新增提問", modalKey: "createQuestion", icon: "QuestionIcon" },
  { text: "新增資訊", modalKey: "createInformation", icon: "InformationIcon" },
  { text: "新增實驗", modalKey: "createFlask", icon: "FlaskIcon" },
  { text: "新增紀錄", modalKey: "createNote", icon: "NoteIcon" },
]
export default function ForumPage_Navbar({ ws }) {
  // menuItems: 用來顯示在 Navbar 上的選單項目
  const [menuItems, setMenuItems] = useState(defaultNavBarItems);

  //
  const navigate = useNavigate();
  const [activityData, setActivityData] = useState(null);
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedModal, setSelectedModal] = useState(null);
  const [selectedModalOpen, setSelectedModalOpen] = useState(false);
  const { isMapBoard, updateBoardMode } = useContext(ModeContext);



  //
  const getIconByLabel = (label) => {
    switch (label) {
      case "IdeaIcon":
        return IdeaIcon;
      case "QuestionIcon":
        return QuestionIcon;
      case "InformationIcon": 
        return InformationIcon;
      case "FlaskIcon":
        return FlaskIcon;
      case "NoteIcon": 
        return NoteIcon;
      case "CreateForumIcon":
        return CreateForumIcon;
      case "TaskMapIcon":
        return TaskMapIcon;
      case "LearningFeedbackIcon":
        return LearningFeedbackIcon;
      case "ForumIcon":
        return ForumIcon;
      default:
        return NoteIcon;
    }
  }

  const renderSelectedModal = (lable) => {
    switch (lable) {
      case "createIdea":
        return <CreateIdea open={openModal} onClose={closeModal} ws={ws} />;
      case "createQuestion":
        return <CreateQuestion open={openModal} onClose={closeModal} ws={ws} />;
      case "createInformation":
        return <CreateInformation open={openModal} onClose={closeModal} ws={ws} />;
      case "createFlask":
        return <CreateFlask open={openModal} onClose={closeModal} ws={ws} />;
      case "createNote":
        return <CreateNote open={openModal} onClose={closeModal} ws={ws} />;
      default:
        return null;
    }
  };


  const openModal = (modalKey) => {
    setSelectedModal(modalKey);
    setSelectedModalOpen(true);
  };

  const closeModal = () => {
    setSelectedModal(null);
    setSelectedModalOpen(false);
  };

  const selecteditemstyle = {
    backgroundColor: "red",
  };
  const getActivityData = async () => {
    try {
      const response = await axios.get(
        `${
          url.backendHost + config[6].enterActivity
        }/${sessionStorage.getItem("activityId")}`
      );
      setActivityData(response.data);
    } catch (err) {
      // console.log(err);
    }
  };
  useEffect(() => {
    getActivityData();
  }, []);
  // 從 sessionStorage 中讀取 groupId
  const groupId = sessionStorage.getItem("groupId");

  // 尋找與 groupId 對應的小組
  const group = activityData?.Groups.find(
    (group) => group.id === parseInt(groupId)
  );

  // 獲取小組名稱
  const groupName = group?.groupName;
  return (
    <nav>
      {/* <AppBar position="fixed" open={open} style={{ background: 'transparent', boxShadow: 'none'}}> */}
      <AppBar
        position="fixed"
        open={open}
        style={{ background: "transparent", boxShadow: "none" }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setOpen(true)}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: "none" }),
            }}
          >
            
            <MenuIcon
              color="primary"
              style={{
                color: "#8B8B8B",
                background: "white",
                boxShadow: "none",
              }}
            />
          </IconButton>
          <Tooltip title="返回首頁" arrow>
            <IconButton
              size="large"
              aria-label="show 4 new mails"
              color="inherit"
              onClick={() => navigate(-1)}
            >
              <Badge color="error">
                <img
                  alt="返回首頁"
                  src={BackToHomeIcon}
                  width={24}
                  height={24}
                />
              </Badge>
            </IconButton>
          </Tooltip>
          <Typography
            variant="h6"
            noWrap
            component="div"
            color="black"
            fontWeight="bolder"
          >
            {activityData && ( // ensure that activityData is not null or undefined before trying to access its properties.
              <>
                {activityData.title}
                {groupName && ` - ${groupName}`}{" "}
                {/* 如果存在 groupName，則顯示在標題後面 */}
              </>
            )}
          </Typography>
          {/* <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Tooltip title='小組聊天室' arrow>
              <IconButton
                size="large"
                aria-label="show 4 new mails"
                color="inherit"
              >
                <Badge color="error">
                  <img alt='小組聊天室' src={CommunityIcon} width={24} height={24} />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title='任務公告' arrow>
              <IconButton size="large" aria-label="show new notifications" color="inherit">
                <Badge color="error">
                  <img alt='任務公告' src={AnnouncementIcon} width={24} height={24} />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box> */}

          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <ChatModeToggle isMapBoard={isMapBoard} updateBoardMode={updateBoardMode}/>
          </Box>
          <Box sx={{ display: { xs: "none", sm: "block" } }}/>

        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={() => setOpen(false)}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((menuItem, index) => (
            <div key={menuItem.text}>
              <ListItem
                selecteditemstyle={selecteditemstyle}
                disablePadding
                sx={{ display: "block" }}
              >
                <Tooltip title={menuItem.text} arrow placement="right">
                  <ListItemButton
                    sx={{
                      minHeight: 60,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                    }}
                    onClick={() => openModal(menuItem.modalKey)}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        maxWidth: 24,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                      }}
                    >
                      <img alt="" src={getIconByLabel(menuItem.icon)} />
                    </ListItemIcon>
                    <ListItemText
                      primary={menuItem.text}
                      sx={{ opacity: open ? 1 : 0 }}
                      style={{ color: "#8B8B8B" }}
                    />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
              {specialItems.includes(menuItem.text) &&
                index < menuItems.length - 1 && <Divider />}
            </div>
          ))}
        </List>
      </Drawer>
      {renderSelectedModal(selectedModal)}
    </nav>
  );
}
