import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config.json';
import io from 'socket.io-client';
import PrepareLessonsPage_Navbar from '../../components/PrepareLessonsPage_Navbar';
import {
  Button,
  FormControl,
  FormHelperText,
  TextField,
  List,
  ListItem,
  ListSubheader,
  ListItemButton,
  ListItemText,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Box,
  Switch,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { newNode } from '../../utils/ideaTool';
import url from '../../utils/urlConfig';
import draftToHtml from 'draftjs-to-html';



export default function PrepareLessons() {
  const name = localStorage.getItem('name');
  const [ws, setSocket] = useState(null);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [groupData, setGroupData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAnnouncement, setIsAnnouncement] = useState(false); 
  const [data, setData] = useState({
    title: '',
    content: '',
    tags: 'question',
    author: name,
    groupId: localStorage.getItem('groupId'),
  });

  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const getGroups = async () => {
    try {
      const fetchData = await axios.get(
        `${url.backendHost}${config[15].findAllGroup}${localStorage.getItem('activityId')}`);
      console.log('GroupData: ', fetchData.data.Groups);
      setGroupData(fetchData.data.Groups);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditorState(EditorState.createEmpty());
    setData({
      title: '',
      content: '',
      tags: 'question', 
      author: name,
      groupId: localStorage.getItem('groupId'),
    });
    setSelectedGroups([]); // Clear selected groups
    setSelectAll(false); // Reset selectAll
    setIsAnnouncement(false); // 重置公告狀態
    getGroups();
  };

  useEffect(() => {
    setSocket(io.connect(url.socketioHost,{path: '/s/socket.io'}));
    getGroups();
  }, []);

  useEffect(() => {
    if (ws) {
      console.log('initWebSocket');
      ws.on('connect', () => {
        console.log('WebSocket connected');
      });

      ws.on('event02', (arg, callback) => {
        console.log('Received event02:', arg);
        callback({
          status: 'event02 ok',
        });
      });

      // 清理 WebSocket 連接
      return () => {
        ws.off('connect');
        ws.off('event02');
        ws.disconnect();
      };
    }
  }, [ws]);

  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
    // 將編輯器內容轉換為 HTML 字串
    const rawContentState = convertToRaw(editorState.getCurrentContent());
    const htmlContent = draftToHtml(rawContentState);
    setData((prevData) => ({
      ...prevData,
      content: htmlContent,
    }));
    // console.log('content: ', htmlContent);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const toggleGroupSelection = (groupId) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter((id) => id !== groupId));
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  };

  const handleSelectAll = () => {
    const allGroupIds = groupData.map((group) => group.id);
    setSelectedGroups(selectAll ? [] : allGroupIds);
    setSelectAll(!selectAll);
  };
  const handleAnnouncementToggle = (event) => {
    setIsAnnouncement(event.target.checked);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isTitleValid = data.title.trim().length > 0;
    const titleValidLength = data.title.trim().length < 15;

    if (
      isTitleValid &&
      titleValidLength &&
      editorState.getCurrentContent().hasText() &&
      editorState.getCurrentContent().getPlainText().length > 0 &&
      selectedGroups.length > 0
    ) {
      setLoading(true);
      try {
        alert("任務傳送中...");
        await Promise.all(
          selectedGroups.map(async (groupId) => {
            let content = data.content;
            // 如果設為公告，添加公告標記詞
            if (isAnnouncement) {

              content = `【公告】${content}`;
            }
            const currentIdeaData = {
              title: data.title,
              content: content,
              tags: data.tags,
              author: data.author,
              groupId: groupId, // 為每個請求創建新的 groupId
            };
            const result = await newNode(currentIdeaData, localStorage.getItem('activityId'), ws);
            // 通過 WebSocket 發送新公告通知
            if (isAnnouncement && ws) {
              ws.emit(`announcement`, {
                ...currentIdeaData,
                id: result.id || Math.random(),
                createdAt: new Date().toISOString(),
             });
           }          
          })
        );
        alert("派發任務成功！");
        setLoading(false);
        resetForm(); // Reset the form after successful submission
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    } else {
      alert('請填寫所有必填欄位並選擇至少一個小組。');
    }
  };

  return (
    <div className="home-container">
      <PrepareLessonsPage_Navbar />
      <Box sx={{ padding: '50px', marginLeft: '64px' }}>
        <form onSubmit={handleSubmit}>
          <FormControl variant="standard" fullWidth>
            {/* 標題輸入 */}
            <TextField
              required
              autoFocus
              margin="dense"
              label={'關鍵提問標題'}
              type="text"
              name="title"
              value={data.title}
              fullWidth
              sx={{ m: 1 }}
              variant="standard"
              onChange={handleChange}
              inputProps={{ maxLength: 15 }}
            />
            <FormHelperText id="component-helper-text">
              請為你關鍵提問定義標題，讓學生能更快速的了解你的關鍵提問內容！
            </FormHelperText>

            {/* 單選按鈕組 */}
            <FormControl component="fieldset" margin="dense" sx={{ m: 1 }}>
              <FormLabel component="legend">類型</FormLabel>
              <RadioGroup
                aria-label="tags"
                name="tags"
                value={data.tags}
                onChange={handleChange}
                row
              >
                <FormControlLabel value="idea" control={<Radio />} label="想法💡" />
                <FormControlLabel value="question" control={<Radio />} label="提問❓" />
                <FormControlLabel value="information" control={<Radio />} label="資訊🔍" />
                <FormControlLabel value="experiment" control={<Radio />} label="實驗🧪" />
                <FormControlLabel value="record" control={<Radio />} label="記錄📄" />
              </RadioGroup>
            </FormControl>
            <FormControlLabel
              control={<Switch checked={isAnnouncement} onChange={handleAnnouncementToggle} />}
              label="設為公告"
            />
            {/* 編輯器 */}
            <Box sx={{ m: 1, minHeight: '200px', maxHeight: '270px', overflow: 'auto' }}>
            <Editor
                editorState={editorState}
                onEditorStateChange={onEditorStateChange}
                wrapperClassName="wrapper-class"
                editorClassName="editor-class"
                toolbarClassName="toolbar-class"
                editorStyle={{ minHeight: '200px', maxHeight: '260px', overflow: 'auto' }} 
                toolbar={{
                  options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'history'],
                  inline: { options: ['bold', 'italic', 'underline', 'strikethrough'] },
                  link: { options: ['link', 'unlink'] },
                }}
              />
            </Box>
            <List
              subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                  小組列表
                </ListSubheader>
              }
            >
              <Button onClick={handleSelectAll} sx={{ m: 1 }}>
                {selectAll ? '取消全選' : '全選'}
              </Button>
              {groupData.map((group) => (
                <ListItem key={group.id} disablePadding>
                  <ListItemButton>
                    <ListItemText primary={group.groupName} />
                    <Checkbox
                      checked={selectedGroups.includes(group.id)}
                      onChange={() => toggleGroupSelection(group.id)}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <LoadingButton
              type="submit"
              loading={loading}
              loadingPosition="start"
              variant="contained"
              startIcon={<SendIcon />}
              sx={{ m: 1 }}
            >
              送出
            </LoadingButton>
          </FormControl>
        </form>
      </Box>
    </div>
  );
}
