// import React, { useState, useEffect, useRef } from 'react';
// import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, List, ListItem, ListItemText } from '@mui/material';
// import { Box } from '@mui/system';
// import FroalaEditor from 'react-froala-wysiwyg';
// import 'froala-editor/js/plugins.pkgd.min.js';
// import 'froala-editor/css/froala_editor.pkgd.min.css';
// import 'froala-editor/css/froala_style.min.css';
// import axios from 'axios';
// import Navbar from "../components/Navbar_Student";

// // 用於 RAGFlow API 的 axios 實例
// const agentAxios = axios.create({
//   baseURL: 'https://140.115.126.193',
// });

// const WritingArea = () => {
//   const [editorContent, setEditorContent] = useState('');
//   const [openReminderDialog, setOpenReminderDialog] = useState(false);
//   const [openTempSaveDialog, setOpenTempSaveDialog] = useState(false);
//   const [openNoteDialog, setOpenNoteDialog] = useState(false);
//   const [noteContent, setNoteContent] = useState('');
//   const [sessionId, setSessionId] = useState('');
//   const [lastCreatedSessionId, setLastCreatedSessionId] = useState('');
//   const [sessionResponse, setSessionResponse] = useState('');
//   const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [currentMessages, setCurrentMessages] = useState([]);
//   const [activityTitle, setActivityTitle] = useState(''); // State for activity title
//   const [groupName, setGroupName] = useState(''); // State for group name
//   const iframeRef = useRef(null);

//   // Load activity title and group name from localStorage on mount
//   useEffect(() => {
//     const savedData = localStorage.getItem('editorData');
//     if (savedData) {
//       setEditorContent(savedData);
//     }

//     const savedNote = localStorage.getItem('noteData');
//     if (savedNote) {
//       setNoteContent(savedNote);
//     }

//     const savedActivityTitle = localStorage.getItem('activityTitle');
//     if (savedActivityTitle) {
//       setActivityTitle(savedActivityTitle);
//     }

//     const savedGroupName = localStorage.getItem('groupName');
//     if (savedGroupName) {
//       setGroupName(savedGroupName);
//     }

//     setOpenReminderDialog(true);
//   }, []);

//   // 監聽 iframe 發回的消息
//   useEffect(() => {
//     const handleMessage = (event) => {
//       if (event.origin !== 'https://140.115.126.193') return;
//       const { type, content } = event.data;
//       if (type === 'agentResponse') {
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       }
//     };

//     window.addEventListener('message', handleMessage);
//     return () => window.removeEventListener('message', handleMessage);
//   }, []);

//   // 創建新聊天會話
//   const handleCreateSession = async () => {
//     if (sessionId) {
//       const currentSession = chatHistory.find((session) => session.id === sessionId) || {
//         id: sessionId,
//         created_at: new Date().toISOString(),
//       };
//       setChatHistory([
//         ...chatHistory.filter((session) => session.id !== sessionId),
//         { ...currentSession, messages: currentMessages || [] },
//       ]);
//     }

//     setCurrentMessages([]);

//     try {
//       const res = await agentAxios.post(
//         '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//         {},
//         {
//           headers: {
//             'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (res.data.code === 0) {
//         const newSessionId = res.data.data?.id || '未知 ID';
//         setSessionId(newSessionId);
//         setLastCreatedSessionId(newSessionId);
//         setSessionResponse(`✅ 成功創建聊天會話：${newSessionId}`);
//         console.log('新創建的 session_id:', newSessionId);
//         if (iframeRef.current) {
//           iframeRef.current.src = `https://140.115.126.193/chat/share?shared_id=8f34f200ef5911ef91480242ac120005&session_id=${newSessionId}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`;
//         }
//       } else {
//         setSessionResponse(`❌ 創建失敗：${res.data.message}`);
//       }
//     } catch (error) {
//       if (error.message.includes('Token')) {
//         setSessionResponse('❌ Token 無效，請重新登錄或聯繫管理員！');
//       } else if (error.message.includes('fetch')) {
//         setSessionResponse('❌ 網絡錯誤，請檢查伺服器連線或 SSL 證書！');
//       } else {
//         setSessionResponse(`❌ 錯誤：${error.message}`);
//       }
//     }
//   };

//   // 獲取聊天歷史紀錄
//   const handleFetchChatHistory = async () => {
//     try {
//       const res = await agentAxios.get(
//         '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//         {
//           params: {
//             page: 1,
//             page_size: 100,
//             orderby: 'create_time',
//             desc: true,
//           },
//           headers: {
//             'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       console.log('後端返回的會話資料:', res.data);

//       if (res.data.code === 0) {
//         const newSessions = res.data.data || [];
//         const updatedHistory = [...chatHistory];
//         newSessions.forEach((session) => {
//           const existingSessionIndex = updatedHistory.findIndex((s) => s.id === session.id);
//           if (existingSessionIndex !== -1) {
//             updatedHistory[existingSessionIndex] = {
//               ...updatedHistory[existingSessionIndex],
//               create_time: session.create_time,
//             };
//           } else {
//             updatedHistory.push({ ...session, messages: [] });
//           }
//         });
//         setChatHistory(updatedHistory);
//         if (lastCreatedSessionId) {
//           const sessionExists = updatedHistory.some((session) => session.id === lastCreatedSessionId);
//           console.log(
//             `檢查 session_id ${lastCreatedSessionId} 是否存在於歷史紀錄中: ${sessionExists ? '是' : '否'}`
//           );
//           console.log('更新後的 chatHistory:', updatedHistory);
//         } else {
//           console.log('尚未創建任何會話，無法檢查 session_id');
//         }
//         setOpenHistoryDialog(true);
//       } else {
//         alert(`❌ 獲取聊天歷史失敗：${res.data.message}`);
//       }
//     } catch (error) {
//       alert(`❌ 錯誤：${error.message}`);
//     }
//   };

//   // 格式化時間
//   const formatDateTime = (isoString) => {
//     const date = new Date(isoString);
//     return date.toLocaleString('zh-TW', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     });
//   };

//   // 儲存編輯器內容到 localStorage（繳交上傳）
//   const handleSubmit = () => {
//     localStorage.setItem('editorData', editorContent);
//     alert('繳交上傳成功!');
//   };

//   // 暫存編輯器內容
//   const handleTempSave = () => {
//     localStorage.setItem('editorData', editorContent);
//     setOpenTempSaveDialog(true);
//   };

//   // Froala 編輯器選項
//   const config = {
//     placeholderText: '開始編輯...',
//     charCounterCount: false,
//     toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'fontFamily', 'backColor',
//             'align', 'orderedList', 'unorderedList', 'insertImage', 'insertTable', 'link', 'undo', 'redo', 
//             'clearFormatting', 'fullscreen', 'html', 'insertHR', 'specialCharacters'],
//   };

//   // 關閉提醒視窗
//   const handleCloseReminderDialog = () => {
//     setOpenReminderDialog(false);
//   };

//   // 關閉暫存成功視窗
//   const handleCloseTempSaveDialog = () => {
//     setOpenTempSaveDialog(false);
//   };

//   // 打開筆記區視窗
//   const handleOpenNoteDialog = () => {
//     setOpenNoteDialog(true);
//   };

//   // 關閉筆記區視窗並儲存筆記
//   const handleCloseNoteDialog = () => {
//     localStorage.setItem('noteData', noteContent);
//     setOpenNoteDialog(false);
//   };

//   // 關閉聊天歷史視窗
//   const handleCloseHistoryDialog = () => {
//     setOpenHistoryDialog(false);
//   };

//   // 處理筆記內容變化
//   const handleNoteChange = (e) => {
//     setNoteContent(e.target.value);
//   };

//   return (
//     <div>
//       <Navbar />
//       <div style={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
//         {/* 左邊容器：聊天室 */}
//         <Box
//           sx={{
//             flex: 1,
//             padding: '5px',
//             borderRight: '1px solid #ccc',
//             display: 'flex',
//             flexDirection: 'column',
//             marginTop: '-75px',
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '50px',
//               display: 'flex',
//               justifyContent: 'center',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               position: 'relative',
//             }}
//           >
//             寫作精靈
//             <Button
//               variant="outlined"
//               size="small"
//               onClick={handleOpenNoteDialog}
//               sx={{
//                 position: 'absolute',
//                 right: '10px',
//                 fontSize: '14px',
//                 padding: '2px 8px',
//               }}
//             >
//               筆記區
//             </Button>
//           </Box>
//           <div
//             style={{
//               border: '2px solid black',
//               borderRadius: '8px',
//               padding: '10px',
//               flex: 1,
//               overflowY: 'auto',
//               backgroundColor: '#FFFFFF',
//               marginBottom: '10px',
//             }}
//           >
//             <Box sx={{ mb: 2, display: 'flex', gap: '10px' }}>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleCreateSession}
//                 sx={{ mb: 1 }}
//               >
//                 創建新聊天
//               </Button>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleFetchChatHistory}
//                 sx={{ mb: 1 }}
//               >
//                 查看聊天歷史
//               </Button>
//             </Box>
//             {sessionResponse && (
//               <Box
//                 sx={{
//                   mt: 1,
//                   p: 1,
//                   backgroundColor: '#f0f0f0',
//                   borderRadius: '4px',
//                   fontSize: '14px',
//                 }}
//               >
//                 {sessionResponse}
//               </Box>
//             )}
//             <iframe
//               ref={iframeRef}
//               src={`https://140.115.126.193/chat/share?shared_id=8f34f200ef5911ef91480242ac120005${sessionId ? `&session_id=${sessionId}` : ''}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`}
//               style={{ width: '100%', height: '100%', minHeight: '500px' }}
//               frameBorder="0"
//               title="Chat Widget"
//             />
//           </div>
//         </Box>

//         {/* 右邊容器：文字編輯器 */}
//         <Box
//           sx={{
//             flex: 2,
//             padding: '20px',
//             borderLeft: '1px solid #ccc',
//             position: 'relative',
//             height: '500px',
//             marginTop: '-75px',
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '50px',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               padding: '0 20px',
//             }}
//           >
//             <span>
//               {activityTitle && `班級: ${activityTitle}`}
//               {groupName && ` | 主題: ${groupName}`}
//             </span>
//             <span>寫作區</span>
            
//           </Box>
//           <FroalaEditor
//             tag='textarea'
//             config={config}
//             model={editorContent}
//             onModelChange={(newContent) => setEditorContent(newContent)}
//           />
//           <Box
//             sx={{
//               position: 'absolute',
//               bottom: '20px',
//               right: '20px',
//               display: 'flex',
//               gap: '10px',
//               zIndex: 10,
//             }}
//           >
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={handleTempSave}
//             >
//               暫存
//             </Button>
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={handleSubmit}
//             >
//               繳交上傳
//             </Button>
//           </Box>
//         </Box>
//       </div>

//       <Dialog open={openReminderDialog} onClose={handleCloseReminderDialog}>
//         <DialogTitle>提醒</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             請先與寫作精靈討論再開始寫作！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseReminderDialog} color="primary">
//             我知道了!
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openTempSaveDialog} onClose={handleCloseTempSaveDialog}>
//         <DialogTitle>提示</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             暫存成功！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseTempSaveDialog} color="primary">
//             確定
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openNoteDialog}
//         onClose={handleCloseNoteDialog}
//         sx={{
//           '& .MuiDialog-paper': {
//             width: '500px',
//             height: '500px',
//             maxWidth: 'none',
//           },
//         }}
//       >
//         <DialogTitle>筆記區</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="記錄您的筆記"
//             value={noteContent}
//             onChange={handleNoteChange}
//             multiline
//             rows={15}
//             fullWidth
//             variant="outlined"
//             sx={{ height: '90%' }}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseNoteDialog} color="primary">
//             儲存並關閉
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openHistoryDialog}
//         onClose={handleCloseHistoryDialog}
//         sx={{
//           '& .MuiDialog-paper': {
//             width: '500px',
//             maxHeight: '500px',
//           },
//         }}
//       >
//         <DialogTitle>聊天歷史紀錄</DialogTitle>
//         <DialogContent>
//           {chatHistory.length === 0 ? (
//             <DialogContentText>暫無聊天歷史紀錄</DialogContentText>
//           ) : (
//             <List>
//               {chatHistory.map((session) => (
//                 <ListItem key={session.id}>
//                   <ListItemText
//                     primary={`會話 ID: ${session.id}`}
//                     secondary={
//                       <>
//                         <div>創建時間: {formatDateTime(session.created_at)}</div>
//                         {session.messages && session.messages.length > 0 ? (
//                           <div>
//                             聊天內容:
//                             <List dense>
//                               {session.messages.map((msg, index) => (
//                                 <ListItem key={index}>
//                                   <ListItemText
//                                     primary={`${msg.role}: ${msg.content}`}
//                                     secondary={`時間: ${formatDateTime(msg.created_at)}`}
//                                   />
//                                 </ListItem>
//                               ))}
//                             </List>
//                           </div>
//                         ) : (
//                           <div>無聊天內容</div>
//                         )}
//                       </>
//                     }
//                   />
//                 </ListItem>
//               ))}
//             </List>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseHistoryDialog} color="primary">
//             關閉
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default WritingArea;









// //繳交上傳到NOTION成功版本
// import React, { useState, useEffect, useRef } from 'react';
// import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, List, ListItem, ListItemText } from '@mui/material';
// import { Box } from '@mui/system';
// import FroalaEditor from 'react-froala-wysiwyg';
// import 'froala-editor/js/plugins.pkgd.min.js';
// import 'froala-editor/css/froala_editor.pkgd.min.css';
// import 'froala-editor/css/froala_style.min.css';
// import axios from 'axios';
// import Navbar from "../components/Navbar_Student";

// // 用於 RAGFlow API 的 axios 實例
// const agentAxios = axios.create({
//   baseURL: 'https://140.115.126.193',
// });

// // 用於與本地後端交互的 axios 實例
// const apiAxios = axios.create({
//   baseURL: 'http://localhost:4000',
//   // 移除 withCredentials，因為目前不需要攜帶憑證
// });

// apiAxios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const WritingArea = () => {
//   const [editorContent, setEditorContent] = useState('');
//   const [openReminderDialog, setOpenReminderDialog] = useState(false);
//   const [openTempSaveDialog, setOpenTempSaveDialog] = useState(false);
//   const [openNoteDialog, setOpenNoteDialog] = useState(false);
//   const [noteContent, setNoteContent] = useState('');
//   const [sessionId, setSessionId] = useState('');
//   const [lastCreatedSessionId, setLastCreatedSessionId] = useState('');
//   const [sessionResponse, setSessionResponse] = useState('');
//   const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [currentMessages, setCurrentMessages] = useState([]);
//   const [activityTitle, setActivityTitle] = useState('');
//   const [groupName, setGroupName] = useState('');
//   const iframeRef = useRef(null);

//   // Load activity title, group name, and editor content from localStorage on mount
//   useEffect(() => {
//     const savedData = localStorage.getItem('editorData');
//     if (savedData) {
//       setEditorContent(savedData);
//     }

//     const savedNote = localStorage.getItem('noteData');
//     if (savedNote) {
//       setNoteContent(savedNote);
//     }

//     const savedActivityTitle = localStorage.getItem('activityTitle');
//     if (savedActivityTitle) {
//       setActivityTitle(savedActivityTitle);
//     }

//     const savedGroupName = localStorage.getItem('groupName');
//     if (savedGroupName) {
//       setGroupName(savedGroupName);
//     }

//     setOpenReminderDialog(true);
//   }, []);

//   // 監聽 iframe 發回的消息
//   useEffect(() => {
//     const handleMessage = (event) => {
//       if (event.origin !== 'https://140.115.126.193') return;
//       const { type, content } = event.data;
//       if (type === 'agentResponse') {
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       }
//     };

//     window.addEventListener('message', handleMessage);
//     return () => window.removeEventListener('message', handleMessage);
//   }, []);

//   // 創建新聊天會話
//   const handleCreateSession = async () => {
//     if (sessionId) {
//       const currentSession = chatHistory.find((session) => session.id === sessionId) || {
//         id: sessionId,
//         created_at: new Date().toISOString(),
//       };
//       setChatHistory([
//         ...chatHistory.filter((session) => session.id !== sessionId),
//         { ...currentSession, messages: currentMessages || [] },
//       ]);
//     }

//     setCurrentMessages([]);

//     try {
//       const res = await agentAxios.post(
//         '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//         {},
//         {
//           headers: {
//             'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (res.data.code === 0) {
//         const newSessionId = res.data.data?.id || '未知 ID';
//         setSessionId(newSessionId);
//         setLastCreatedSessionId(newSessionId);
//         setSessionResponse(`✅ 成功創建聊天會話：${newSessionId}`);
//         console.log('新創建的 session_id:', newSessionId);
//         if (iframeRef.current) {
//           iframeRef.current.src = `https://140.115.126.193/chat/share?shared_id=8f34f200ef5911ef91480242ac120005&session_id=${newSessionId}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`;
//         }
//       } else {
//         setSessionResponse(`❌ 創建失敗：${res.data.message}`);
//       }
//     } catch (error) {
//       if (error.message.includes('Token')) {
//         setSessionResponse('❌ Token 無效，請重新登錄或聯繫管理員！');
//       } else if (error.message.includes('fetch')) {
//         setSessionResponse('❌ 網絡錯誤，請檢查伺服器連線或 SSL 證書！');
//       } else {
//         setSessionResponse(`❌ 錯誤：${error.message}`);
//       }
//     }
//   };

//   // 獲取聊天歷史紀錄
//   const handleFetchChatHistory = async () => {
//     try {
//       const res = await agentAxios.get(
//         '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//         {
//           params: {
//             page: 1,
//             page_size: 100,
//             orderby: 'create_time',
//             desc: true,
//           },
//           headers: {
//             'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       console.log('後端返回的會話資料:', res.data);

//       if (res.data.code === 0) {
//         const newSessions = res.data.data || [];
//         const updatedHistory = [...chatHistory];
//         newSessions.forEach((session) => {
//           const existingSessionIndex = updatedHistory.findIndex((s) => s.id === session.id);
//           if (existingSessionIndex !== -1) {
//             updatedHistory[existingSessionIndex] = {
//               ...updatedHistory[existingSessionIndex],
//               create_time: session.create_time,
//             };
//           } else {
//             updatedHistory.push({ ...session, messages: [] });
//           }
//         });
//         setChatHistory(updatedHistory);
//         if (lastCreatedSessionId) {
//           const sessionExists = updatedHistory.some((session) => session.id === lastCreatedSessionId);
//           console.log(
//             `檢查 session_id ${lastCreatedSessionId} 是否存在於歷史紀錄中: ${sessionExists ? '是' : '否'}`
//           );
//           console.log('更新後的 chatHistory:', updatedHistory);
//         } else {
//           console.log('尚未創建任何會話，無法檢查 session_id');
//         }
//         setOpenHistoryDialog(true);
//       } else {
//         alert(`❌ 獲取聊天歷史失敗：${res.data.message}`);
//       }
//     } catch (error) {
//       alert(`❌ 錯誤：${error.message}`);
//     }
//   };

//   // 格式化時間
//   const formatDateTime = (isoString) => {
//     const date = new Date(isoString);
//     return date.toLocaleString('zh-TW', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     });
//   };

//   // 將編輯器內容發送到後端，後端再提交到 Notion
//   const handleSubmit = async () => {
//     try {
//       // 儲存編輯器內容到 localStorage
//       localStorage.setItem('editorData', editorContent);

//       // 向後端發送請求
//       const response = await apiAxios.post('/api/submit-to-notion', {
//         studentName: activityTitle || '未命名學生',
//         theme: groupName || '未指定主題',
//         essayContent: editorContent || '無內容',
//       });

//       if (response.data.success) {
//         alert('繳交上傳成功！');
//       } else {
//         alert(`繳交上傳失敗：${response.data.message}`);
//       }
//     } catch (error) {
//       console.error('發送到 Notion 時出錯:', error);
//       const errorMessage = error.response?.data?.message || error.message || '未知錯誤';
//       alert(`繳交上傳失敗：${errorMessage}`);
//     }
//   };

//   // 暫存編輯器內容
//   const handleTempSave = () => {
//     localStorage.setItem('editorData', editorContent);
//     setOpenTempSaveDialog(true);
//   };

//   // Froala 編輯器選項
//   const config = {
//     placeholderText: '開始編輯...',
//     charCounterCount: false,
//     toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'fontFamily', 'backColor',
//             'align', 'orderedList', 'unorderedList', 'insertImage', 'insertTable', 'link', 'undo', 'redo', 
//             'clearFormatting', 'fullscreen', 'html', 'insertHR', 'specialCharacters'],
//   };

//   // 關閉提醒視窗
//   const handleCloseReminderDialog = () => {
//     setOpenReminderDialog(false);
//   };

//   // 關閉暫存成功視窗
//   const handleCloseTempSaveDialog = () => {
//     setOpenTempSaveDialog(false);
//   };

//   // 打開筆記區視窗
//   const handleOpenNoteDialog = () => {
//     setOpenNoteDialog(true);
//   };

//   // 關閉筆記區視窗並儲存筆記
//   const handleCloseNoteDialog = () => {
//     localStorage.setItem('noteData', noteContent);
//     setOpenNoteDialog(false);
//   };

//   // 關閉聊天歷史視窗
//   const handleCloseHistoryDialog = () => {
//     setOpenHistoryDialog(false);
//   };

//   // 處理筆記內容變化
//   const handleNoteChange = (e) => {
//     setNoteContent(e.target.value);
//   };

//   return (
//     <div>
//       <Navbar />
//       <div style={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
//         {/* 左邊容器：聊天室 */}
//         <Box
//           sx={{
//             flex: 1,
//             padding: '5px',
//             borderRight: '1px solid #ccc',
//             display: 'flex',
//             flexDirection: 'column',
//             marginTop: '-75px',
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '50px',
//               display: 'flex',
//               justifyContent: 'center',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               position: 'relative',
//             }}
//           >
//             寫作精靈
//             <Button
//               variant="outlined"
//               size="small"
//               onClick={handleOpenNoteDialog}
//               sx={{
//                 position: 'absolute',
//                 right: '10px',
//                 fontSize: '14px',
//                 padding: '2px 8px',
//               }}
//             >
//               筆記區
//             </Button>
//           </Box>
//           <div
//             style={{
//               border: '2px solid black',
//               borderRadius: '8px',
//               padding: '10px',
//               flex: 1,
//               overflowY: 'auto',
//               backgroundColor: '#FFFFFF',
//               marginBottom: '10px',
//             }}
//           >
//             <Box sx={{ mb: 2, display: 'flex', gap: '10px' }}>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleCreateSession}
//                 sx={{ mb: 1 }}
//               >
//                 創建新聊天
//               </Button>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleFetchChatHistory}
//                 sx={{ mb: 1 }}
//               >
//                 查看聊天歷史
//               </Button>
//             </Box>
//             {sessionResponse && (
//               <Box
//                 sx={{
//                   mt: 1,
//                   p: 1,
//                   backgroundColor: '#f0f0f0',
//                   borderRadius: '4px',
//                   fontSize: '14px',
//                 }}
//               >
//                 {sessionResponse}
//               </Box>
//             )}
//             <iframe
//               ref={iframeRef}
//               src={`https://140.115.126.193/chat/share?shared_id=8f34f200ef5911ef91480242ac120005${sessionId ? `&session_id=${sessionId}` : ''}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`}
//               style={{ width: '100%', height: '100%', minHeight: '500px' }}
//               frameBorder="0"
//               title="Chat Widget"
//             />
//           </div>
//         </Box>

//         {/* 右邊容器：文字編輯器 */}
//         <Box
//           sx={{
//             flex: 2,
//             padding: '20px',
//             borderLeft: '1px solid #ccc',
//             position: 'relative',
//             height: '500px',
//             marginTop: '-75px',
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '50px',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               padding: '0 20px',
//             }}
//           >
//             <span>
//               {activityTitle && `班級: ${activityTitle}`}
//               {groupName && ` | 主題: ${groupName}`}
//             </span>
//             <span>寫作區</span>
            
//           </Box>
//           <FroalaEditor
//             tag='textarea'
//             config={config}
//             model={editorContent}
//             onModelChange={(newContent) => setEditorContent(newContent)}
//           />
//           <Box
//             sx={{
//               position: 'absolute',
//               bottom: '20px',
//               right: '20px',
//               display: 'flex',
//               gap: '10px',
//               zIndex: 10,
//             }}
//           >
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={handleTempSave}
//             >
//               暫存
//             </Button>
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={handleSubmit}
//             >
//               繳交上傳
//             </Button>
//           </Box>
//         </Box>
//       </div>

//       <Dialog open={openReminderDialog} onClose={handleCloseReminderDialog}>
//         <DialogTitle>提醒</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             請先與寫作精靈討論再開始寫作！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseReminderDialog} color="primary">
//             我知道了!
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openTempSaveDialog} onClose={handleCloseTempSaveDialog}>
//         <DialogTitle>提示</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             暫存成功！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseTempSaveDialog} color="primary">
//             確定
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openNoteDialog}
//         onClose={handleCloseNoteDialog}
//         sx={{
//           '& .MuiDialog-paper': {
//             width: '500px',
//             height: '500px',
//             maxWidth: 'none',
//           },
//         }}
//       >
//         <DialogTitle>筆記區</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="記錄您的筆記"
//             value={noteContent}
//             onChange={handleNoteChange}
//             multiline
//             rows={15}
//             fullWidth
//             variant="outlined"
//             sx={{ height: '90%' }}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseNoteDialog} color="primary">
//             儲存並關閉
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openHistoryDialog}
//         onClose={handleCloseHistoryDialog}
//         sx={{
//           '& .MuiDialog-paper': {
//             width: '500px',
//             maxHeight: '500px',
//           },
//         }}
//       >
//         <DialogTitle>聊天歷史紀錄</DialogTitle>
//         <DialogContent>
//           {chatHistory.length === 0 ? (
//             <DialogContentText>暫無聊天歷史紀錄</DialogContentText>
//           ) : (
//             <List>
//               {chatHistory.map((session) => (
//                 <ListItem key={session.id}>
//                   <ListItemText
//                     primary={`會話 ID: ${session.id}`}
//                     secondary={
//                       <>
//                         <div>創建時間: {formatDateTime(session.created_at)}</div>
//                         {session.messages && session.messages.length > 0 ? (
//                           <div>
//                             聊天內容:
//                             <List dense>
//                               {session.messages.map((msg, index) => (
//                                 <ListItem key={index}>
//                                   <ListItemText
//                                     primary={`${msg.role}: ${msg.content}`}
//                                     secondary={`時間: ${formatDateTime(msg.created_at)}`}
//                                   />
//                                 </ListItem>
//                               ))}
//                             </List>
//                           </div>
//                         ) : (
//                           <div>無聊天內容</div>
//                         )}
//                       </>
//                     }
//                   />
//                 </ListItem>
//               ))}
//             </List>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseHistoryDialog} color="primary">
//             關閉
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default WritingArea;






// import React, { useState, useEffect, useRef } from 'react';
// import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, List, ListItem, ListItemText } from '@mui/material';
// import { Box } from '@mui/system';
// import FroalaEditor from 'react-froala-wysiwyg';
// import 'froala-editor/js/plugins.pkgd.min.js';
// import 'froala-editor/css/froala_editor.pkgd.min.css';
// import 'froala-editor/css/froala_style.min.css';
// import axios from 'axios';
// import Navbar from "../components/Navbar_Student";

// // 用於 RAGFlow API 的 axios 實例
// const agentAxios = axios.create({
//   baseURL: 'https://140.115.126.193',
// });

// // 用於與本地後端交互的 axios 實例
// const apiAxios = axios.create({
//   baseURL: 'http://localhost:4000',
//   // 移除 withCredentials，因為目前不需要攜帶憑證
// });

// apiAxios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const WritingArea = () => {
//   const [editorContent, setEditorContent] = useState('');
//   const [openReminderDialog, setOpenReminderDialog] = useState(false);
//   const [openTempSaveDialog, setOpenTempSaveDialog] = useState(false);
//   const [openNoteDialog, setOpenNoteDialog] = useState(false);
//   const [noteContent, setNoteContent] = useState('');
//   const [sessionId, setSessionId] = useState('');
//   const [lastCreatedSessionId, setLastCreatedSessionId] = useState('');
//   const [sessionResponse, setSessionResponse] = useState('');
//   const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [currentMessages, setCurrentMessages] = useState([]);
//   const [activityTitle, setActivityTitle] = useState('');
//   const [groupName, setGroupName] = useState('');
//   const [isSubmitDisabled, setIsSubmitDisabled] = useState(false); // 新增狀態控制按鈕禁用
//   const iframeRef = useRef(null);

//   // Load activity title, group name, and editor content from localStorage on mount
//   useEffect(() => {
//     const savedData = localStorage.getItem('editorData');
//     if (savedData) {
//       setEditorContent(savedData);
//     }

//     const savedNote = localStorage.getItem('noteData');
//     if (savedNote) {
//       setNoteContent(savedNote);
//     }

//     const savedActivityTitle = localStorage.getItem('activityTitle');
//     if (savedActivityTitle) {
//       setActivityTitle(savedActivityTitle);
//     }

//     const savedGroupName = localStorage.getItem('groupName');
//     if (savedGroupName) {
//       setGroupName(savedGroupName);
//     }

//     setOpenReminderDialog(true);
//   }, []);

//   // 監聽 iframe 發回的消息
//   useEffect(() => {
//     const handleMessage = (event) => {
//       if (event.origin !== 'https://140.115.126.193') return;
//       const { type, content } = event.data;
//       if (type === 'agentResponse') {
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       }
//     };

//     window.addEventListener('message', handleMessage);
//     return () => window.removeEventListener('message', handleMessage);
//   }, []);

//   // 創建新聊天會話
//   const handleCreateSession = async () => {
//     if (sessionId) {
//       const currentSession = chatHistory.find((session) => session.id === sessionId) || {
//         id: sessionId,
//         created_at: new Date().toISOString(),
//       };
//       setChatHistory([
//         ...chatHistory.filter((session) => session.id !== sessionId),
//         { ...currentSession, messages: currentMessages || [] },
//       ]);
//     }

//     setCurrentMessages([]);

//     try {
//       const res = await agentAxios.post(
//         '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//         {},
//         {
//           headers: {
//             'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (res.data.code === 0) {
//         const newSessionId = res.data.data?.id || '未知 ID';
//         setSessionId(newSessionId);
//         setLastCreatedSessionId(newSessionId);
//         setSessionResponse(`✅ 成功創建聊天會話：${newSessionId}`);
//         console.log('新創建的 session_id:', newSessionId);
//         if (iframeRef.current) {
//           iframeRef.current.src = `https://140.115.126.193/chat/share?shared_id=8f34f200ef5911ef91480242ac120005&session_id=${newSessionId}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`;
//         }
//       } else {
//         setSessionResponse(`❌ 創建失敗：${res.data.message}`);
//       }
//     } catch (error) {
//       if (error.message.includes('Token')) {
//         setSessionResponse('❌ Token 無效，請重新登錄或聯繫管理員！');
//       } else if (error.message.includes('fetch')) {
//         setSessionResponse('❌ 網絡錯誤，請檢查伺服器連線或 SSL 證書！');
//       } else {
//         setSessionResponse(`❌ 錯誤：${error.message}`);
//       }
//     }
//   };

//   // 獲取聊天歷史紀錄
//   const handleFetchChatHistory = async () => {
//     try {
//       const res = await agentAxios.get(
//         '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//         {
//           params: {
//             page: 1,
//             page_size: 100,
//             orderby: 'create_time',
//             desc: true,
//           },
//           headers: {
//             'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       console.log('後端返回的會話資料:', res.data);

//       if (res.data.code === 0) {
//         const newSessions = res.data.data || [];
//         const updatedHistory = [...chatHistory];
//         newSessions.forEach((session) => {
//           const existingSessionIndex = updatedHistory.findIndex((s) => s.id === session.id);
//           if (existingSessionIndex !== -1) {
//             updatedHistory[existingSessionIndex] = {
//               ...updatedHistory[existingSessionIndex],
//               create_time: session.create_time,
//             };
//           } else {
//             updatedHistory.push({ ...session, messages: [] });
//           }
//         });
//         setChatHistory(updatedHistory);
//         if (lastCreatedSessionId) {
//           const sessionExists = updatedHistory.some((session) => session.id === lastCreatedSessionId);
//           console.log(
//             `檢查 session_id ${lastCreatedSessionId} 是否存在於歷史紀錄中: ${sessionExists ? '是' : '否'}`
//           );
//           console.log('更新後的 chatHistory:', updatedHistory);
//         } else {
//           console.log('尚未創建任何會話，無法檢查 session_id');
//         }
//         setOpenHistoryDialog(true);
//       } else {
//         alert(`❌ 獲取聊天歷史失敗：${res.data.message}`);
//       }
//     } catch (error) {
//       alert(`❌ 錯誤：${error.message}`);
//     }
//   };

//   // 格式化時間
//   const formatDateTime = (isoString) => {
//     const date = new Date(isoString);
//     return date.toLocaleString('zh-TW', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     });
//   };

//   // 將編輯器內容發送到後端，後端再提交到 Notion
//   const handleSubmit = async () => {
//     try {
//       // 儲存編輯器內容到 localStorage
//       localStorage.setItem('editorData', editorContent);

//       // 向後端發送請求
//       const response = await apiAxios.post('/api/submit-to-notion', {
//         studentName: activityTitle || '未命名學生',
//         theme: groupName || '未指定主題',
//         essayContent: editorContent || '無內容',
//       });

//       if (response.data.success) {
//         alert('繳交上傳成功！');
//         setIsSubmitDisabled(true); // 繳交成功後禁用按鈕
//       } else {
//         alert(`繳交上傳失敗：${response.data.message}`);
//       }
//     } catch (error) {
//       console.error('發送到 Notion 時出錯:', error);
//       const errorMessage = error.response?.data?.message || error.message || '未知錯誤';
//       alert(`繳交上傳失敗：${errorMessage}`);
//     }
//   };

//   // 暫存編輯器內容
//   const handleTempSave = () => {
//     localStorage.setItem('editorData', editorContent);
//     setOpenTempSaveDialog(true);
//   };

//   // Froala 編輯器選項
//   const config = {
//     placeholderText: '開始編輯...',
//     charCounterCount: false,
//     toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'fontFamily', 'backColor',
//             'align', 'orderedList', 'unorderedList', 'insertImage', 'insertTable', 'link', 'undo', 'redo', 
//             'clearFormatting', 'fullscreen', 'html', 'insertHR', 'specialCharacters'],
//   };

//   // 關閉提醒視窗
//   const handleCloseReminderDialog = () => {
//     setOpenReminderDialog(false);
//   };

//   // 關閉暫存成功視窗
//   const handleCloseTempSaveDialog = () => {
//     setOpenTempSaveDialog(false);
//   };

//   // 打開筆記區視窗
//   const handleOpenNoteDialog = () => {
//     setOpenNoteDialog(true);
//   };

//   // 關閉筆記區視窗並儲存筆記
//   const handleCloseNoteDialog = () => {
//     localStorage.setItem('noteData', noteContent);
//     setOpenNoteDialog(false);
//   };

//   // 關閉聊天歷史視窗
//   const handleCloseHistoryDialog = () => {
//     setOpenHistoryDialog(false);
//   };

//   // 處理筆記內容變化
//   const handleNoteChange = (e) => {
//     setNoteContent(e.target.value);
//   };

//   return (
//     <div>
//       <Navbar />
//       <div style={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
//         {/* 左邊容器：聊天室 */}
//         <Box
//           sx={{
//             flex: 1,
//             padding: '5px',
//             borderRight: '1px solid #ccc',
//             display: 'flex',
//             flexDirection: 'column',
//             marginTop: '-75px',
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '50px',
//               display: 'flex',
//               justifyContent: 'center',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               position: 'relative',
//             }}
//           >
//             寫作精靈
//             <Button
//               variant="outlined"
//               size="small"
//               onClick={handleOpenNoteDialog}
//               sx={{
//                 position: 'absolute',
//                 right: '10px',
//                 fontSize: '14px',
//                 padding: '2px 8px',
//               }}
//             >
//               筆記區
//             </Button>
//           </Box>
//           <div
//             style={{
//               border: '2px solid black',
//               borderRadius: '8px',
//               padding: '10px',
//               flex: 1,
//               overflowY: 'auto',
//               backgroundColor: '#FFFFFF',
//               marginBottom: '10px',
//             }}
//           >
//             <Box sx={{ mb: 2, display: 'flex', gap: '10px' }}>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleCreateSession}
//                 sx={{ mb: 1 }}
//               >
//                 創建新聊天
//               </Button>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleFetchChatHistory}
//                 sx={{ mb: 1 }}
//               >
//                 查看聊天歷史
//               </Button>
//             </Box>
//             {sessionResponse && (
//               <Box
//                 sx={{
//                   mt: 1,
//                   p: 1,
//                   backgroundColor: '#f0f0f0',
//                   borderRadius: '4px',
//                   fontSize: '14px',
//                 }}
//               >
//                 {sessionResponse}
//               </Box>
//             )}
//             <iframe
//               ref={iframeRef}
//               src={`https://140.115.126.193/chat/share?shared_id=8f34f200ef5911ef91480242ac120005${sessionId ? `&session_id=${sessionId}` : ''}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`}
//               style={{ width: '100%', height: '100%', minHeight: '500px' }}
//               frameBorder="0"
//               title="Chat Widget"
//             />
//           </div>
//         </Box>

//         {/* 右邊容器：文字編輯器 */}
//         <Box
//           sx={{
//             flex: 2,
//             padding: '20px',
//             borderLeft: '1px solid #ccc',
//             position: 'relative',
//             height: '500px',
//             marginTop: '-75px',
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '50px',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               padding: '0 20px',
//             }}
//           >
//             <span>
//               {activityTitle && `班級: ${activityTitle}`}
//               {groupName && ` | 主題: ${groupName}`}
//             </span>
//             <span>寫作區</span>
//           </Box>
//           <FroalaEditor
//             tag='textarea'
//             config={config}
//             model={editorContent}
//             onModelChange={(newContent) => setEditorContent(newContent)}
//           />
//           <Box
//             sx={{
//               position: 'absolute',
//               bottom: '20px',
//               right: '20px',
//               display: 'flex',
//               gap: '10px',
//               zIndex: 10,
//             }}
//           >
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={handleTempSave}
//             >
//               暫存
//             </Button>
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={handleSubmit}
//               disabled={isSubmitDisabled} // 根據狀態禁用按鈕
//             >
//               繳交上傳
//             </Button>
//           </Box>
//         </Box>
//       </div>

//       <Dialog open={openReminderDialog} onClose={handleCloseReminderDialog}>
//         <DialogTitle>提醒</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             請先與寫作精靈討論再開始寫作！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseReminderDialog} color="primary">
//             我知道了!
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openTempSaveDialog} onClose={handleCloseTempSaveDialog}>
//         <DialogTitle>提示</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             暫存成功！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseTempSaveDialog} color="primary">
//             確定
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openNoteDialog}
//         onClose={handleCloseNoteDialog}
//         sx={{
//           '& .MuiDialog-paper': {
//             width: '500px',
//             height: '500px',
//             maxWidth: 'none',
//           },
//         }}
//       >
//         <DialogTitle>筆記區</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="記錄您的筆記"
//             value={noteContent}
//             onChange={handleNoteChange}
//             multiline
//             rows={15}
//             fullWidth
//             variant="outlined"
//             sx={{ height: '90%' }}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseNoteDialog} color="primary">
//             儲存並關閉
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openHistoryDialog}
//         onClose={handleCloseHistoryDialog}
//         sx={{
//           '& .MuiDialog-paper': {
//             width: '500px',
//             maxHeight: '500px',
//           },
//         }}
//       >
//         <DialogTitle>聊天歷史紀錄</DialogTitle>
//         <DialogContent>
//           {chatHistory.length === 0 ? (
//             <DialogContentText>暫無聊天歷史紀錄</DialogContentText>
//           ) : (
//             <List>
//               {chatHistory.map((session) => (
//                 <ListItem key={session.id}>
//                   <ListItemText
//                     primary={`會話 ID: ${session.id}`}
//                     secondary={
//                       <>
//                         <div>創建時間: {formatDateTime(session.created_at)}</div>
//                         {session.messages && session.messages.length > 0 ? (
//                           <div>
//                             聊天內容:
//                             <List dense>
//                               {session.messages.map((msg, index) => (
//                                 <ListItem key={index}>
//                                   <ListItemText
//                                     primary={`${msg.role}: ${msg.content}`}
//                                     secondary={`時間: ${formatDateTime(msg.created_at)}`}
//                                   />
//                                 </ListItem>
//                               ))}
//                             </List>
//                           </div>
//                         ) : (
//                           <div>無聊天內容</div>
//                         )}
//                       </>
//                     }
//                   />
//                 </ListItem>
//               ))}
//             </List>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseHistoryDialog} color="primary">
//             關閉
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default WritingArea;




// //成功POST到資料庫
// import React, { useState, useEffect, useRef } from 'react';
// import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, List, ListItem, ListItemText } from '@mui/material';
// import { Box } from '@mui/system';
// import FroalaEditor from 'react-froala-wysiwyg';
// import 'froala-editor/js/plugins.pkgd.min.js';
// import 'froala-editor/css/froala_editor.pkgd.min.css';
// import 'froala-editor/css/froala_style.min.css';
// import axios from 'axios';
// import Navbar from "../components/Navbar_Student";

// // 用於 RAGFlow API 的 axios 實例
// const agentAxios = axios.create({
//   baseURL: 'https://140.115.126.193',
// });

// // 用於與本地後端交互的 axios 實例
// const apiAxios = axios.create({
//   baseURL: 'http://localhost:4000',
// });

// apiAxios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const WritingArea = () => {
//   const [editorContent, setEditorContent] = useState('');
//   const [openReminderDialog, setOpenReminderDialog] = useState(false);
//   const [openTempSaveDialog, setOpenTempSaveDialog] = useState(false);
//   const [openNoteDialog, setOpenNoteDialog] = useState(false);
//   const [noteContent, setNoteContent] = useState('');
//   const [sessionId, setSessionId] = useState('');
//   const [lastCreatedSessionId, setLastCreatedSessionId] = useState('');
//   const [sessionResponse, setSessionResponse] = useState('');
//   const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [currentMessages, setCurrentMessages] = useState([]);
//   const [activityTitle, setActivityTitle] = useState('');
//   const [groupName, setGroupName] = useState('');
//   const [username, setUsername] = useState('');
//   const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
//   const iframeRef = useRef(null);

//   // Load activity title, group name, username, and editor content from localStorage on mount
//   useEffect(() => {
//     const savedData = localStorage.getItem('editorData');
//     if (savedData) {
//       setEditorContent(savedData);
//     }

//     const savedNote = localStorage.getItem('noteData');
//     if (savedNote) {
//       setNoteContent(savedNote);
//     }

//     const savedActivityTitle = localStorage.getItem('activityTitle');
//     if (savedActivityTitle) {
//       setActivityTitle(savedActivityTitle);
//     }

//     const savedGroupName = localStorage.getItem('groupName');
//     if (savedGroupName) {
//       setGroupName(savedGroupName);
//     }

//     const savedUsername = localStorage.getItem('name');
//     if (savedUsername) {
//       setUsername(savedUsername);
//     }

//     setOpenReminderDialog(true);
//   }, []);

//   // 監聽 iframe 發回的消息
//   useEffect(() => {
//     const handleMessage = (event) => {
//       if (event.origin !== 'https://140.115.126.193') return;
//       const { type, content } = event.data;
//       if (type === 'agentResponse') {
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       }
//     };

//     window.addEventListener('message', handleMessage);
//     return () => window.removeEventListener('message', handleMessage);
//   }, []);

//   // 創建新聊天會話
//   const handleCreateSession = async () => {
//     if (sessionId) {
//       const currentSession = chatHistory.find((session) => session.id === sessionId) || {
//         id: sessionId,
//         created_at: new Date().toISOString(),
//       };
//       setChatHistory([
//         ...chatHistory.filter((session) => session.id !== sessionId),
//         { ...currentSession, messages: currentMessages || [] },
//       ]);
//     }

//     setCurrentMessages([]);

//     try {
//       const res = await agentAxios.post(
//         '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//         {},
//         {
//           headers: {
//             'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (res.data.code === 0) {
//         const newSessionId = res.data.data?.id || '未知 ID';
//         setSessionId(newSessionId);
//         setLastCreatedSessionId(newSessionId);
//         setSessionResponse(`✅ 成功創建聊天會話：${newSessionId}`);
//         console.log('新創建的 session_id:', newSessionId);
//         if (iframeRef.current) {
//           iframeRef.current.src = `https://140.115.126.193/chat/share?shared_id=8f34f200ef5911ef91480242ac120005&session_id=${newSessionId}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`;
//         }
//       } else {
//         setSessionResponse(`❌ 創建失敗：${res.data.message}`);
//       }
//     } catch (error) {
//       if (error.message.includes('Token')) {
//         setSessionResponse('❌ Token 無效，請重新登錄或聯繫管理員！');
//       } else if (error.message.includes('fetch')) {
//         setSessionResponse('❌ 網絡錯誤，請檢查伺服器連線或 SSL 證書！');
//       } else {
//         setSessionResponse(`❌ 錯誤：${error.message}`);
//       }
//     }
//   };

//   // 獲取聊天歷史紀錄
//   const handleFetchChatHistory = async () => {
//     try {
//       const res = await agentAxios.get(
//         '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//         {
//           params: {
//             page: 1,
//             page_size: 100,
//             orderby: 'create_time',
//             desc: true,
//           },
//           headers: {
//             'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       console.log('後端返回的會話資料:', res.data);

//       if (res.data.code === 0) {
//         const newSessions = res.data.data || [];
//         const updatedHistory = [...chatHistory];
//         newSessions.forEach((session) => {
//           const existingSessionIndex = updatedHistory.findIndex((s) => s.id === session.id);
//           if (existingSessionIndex !== -1) {
//             updatedHistory[existingSessionIndex] = {
//               ...updatedHistory[existingSessionIndex],
//               create_time: session.create_time,
//             };
//           } else {
//             updatedHistory.push({ ...session, messages: [] });
//           }
//         });
//         setChatHistory(updatedHistory);
//         if (lastCreatedSessionId) {
//           const sessionExists = updatedHistory.some((session) => session.id === lastCreatedSessionId);
//           console.log(
//             `檢查 session_id ${lastCreatedSessionId} 是否存在於歷史紀錄中: ${sessionExists ? '是' : '否'}`
//           );
//           console.log('更新後的 chatHistory:', updatedHistory);
//         } else {
//           console.log('尚未創建任何會話，無法檢查 session_id');
//         }
//         setOpenHistoryDialog(true);
//       } else {
//         alert(`❌ 獲取聊天歷史失敗：${res.data.message}`);
//       }
//     } catch (error) {
//       alert(`❌ 錯誤：${error.message}`);
//     }
//   };

//   // 格式化時間
//   const formatDateTime = (isoString) => {
//     const date = new Date(isoString);
//     return date.toLocaleString('zh-TW', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     });
//   };

//   // 將編輯器內容發送到後端，後端再提交到 Notion，使用 username 替代 activityTitle
//   const handleSubmit = async () => {
//     try {
//       // 儲存編輯器內容到 localStorage
//       localStorage.setItem('editorData', editorContent);

//       // 向後端發送請求，使用 username 作為 studentName
//       const response = await apiAxios.post('/api/submit-to-notion', {
//         studentName: username || '未命名使用者',
//         theme: groupName || '未指定主題',
//         essayContent: editorContent || '無內容',
//       });

//       if (response.data.success) {
//         alert('繳交上傳成功！');
//         setIsSubmitDisabled(true); // 繳交成功後禁用按鈕
//       } else {
//         alert(`繳交上傳失敗：${response.data.message}`);
//       }
//     } catch (error) {
//       console.error('發送到 Notion 時出錯:', error);
//       const errorMessage = error.response?.data?.message || error.message || '未知錯誤';
//       alert(`繳交上傳失敗：${errorMessage}`);
//     }
//   };

//   // 暫存編輯器內容
//   const handleTempSave = () => {
//     localStorage.setItem('editorData', editorContent);
//     setOpenTempSaveDialog(true);
//   };

//   // Froala 編輯器選項
//   const config = {
//     placeholderText: '開始編輯...',
//     charCounterCount: false,
//     toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'fontFamily', 'backColor',
//             'align', 'orderedList', 'unorderedList', 'insertImage', 'insertTable', 'link', 'undo', 'redo', 
//             'clearFormatting', 'fullscreen', 'html', 'insertHR', 'specialCharacters'],
//   };

//   // 關閉提醒視窗
//   const handleCloseReminderDialog = () => {
//     setOpenReminderDialog(false);
//   };

//   // 關閉暫存成功視窗
//   const handleCloseTempSaveDialog = () => {
//     setOpenTempSaveDialog(false);
//   };

//   // 打開筆記區視窗
//   const handleOpenNoteDialog = () => {
//     setOpenNoteDialog(true);
//   };

//   // 關閉筆記區視窗並儲存筆記
//   const handleCloseNoteDialog = () => {
//     localStorage.setItem('noteData', noteContent);
//     setOpenNoteDialog(false);
//   };

//   // 關閉聊天歷史視窗
//   const handleCloseHistoryDialog = () => {
//     setOpenHistoryDialog(false);
//   };

//   // 處理筆記內容變化
//   const handleNoteChange = (e) => {
//     setNoteContent(e.target.value);
//   };

//   return (
//     <div>
//       <Navbar />
//       <div style={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
//         {/* 左邊容器：聊天室 */}
//         <Box
//           sx={{
//             flex: 1,
//             padding: '5px',
//             borderRight: '1px solid #ccc',
//             display: 'flex',
//             flexDirection: 'column',
//             marginTop: '-75px',
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '50px',
//               display: 'flex',
//               justifyContent: 'center',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               position: 'relative',
//             }}
//           >
//             寫作精靈
//             <Button
//               variant="outlined"
//               size="small"
//               onClick={handleOpenNoteDialog}
//               sx={{
//                 position: 'absolute',
//                 right: '10px',
//                 fontSize: '14px',
//                 padding: '2px 8px',
//               }}
//             >
//               筆記區
//             </Button>
//           </Box>
//           <div
//             style={{
//               border: '2px solid black',
//               borderRadius: '8px',
//               padding: '10px',
//               flex: 1,
//               overflowY: 'auto',
//               backgroundColor: '#FFFFFF',
//               marginBottom: '10px',
//             }}
//           >
//             <Box sx={{ mb: 2, display: 'flex', gap: '10px' }}>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleCreateSession}
//                 sx={{ mb: 1 }}
//               >
//                 創建新聊天
//               </Button>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleFetchChatHistory}
//                 sx={{ mb: 1 }}
//               >
//                 查看聊天歷史
//               </Button>
//             </Box>
//             {sessionResponse && (
//               <Box
//                 sx={{
//                   mt: 1,
//                   p: 1,
//                   backgroundColor: '#f0f0f0',
//                   borderRadius: '4px',
//                   fontSize: '14px',
//                 }}
//               >
//                 {sessionResponse}
//               </Box>
//             )}
//             <iframe
//               ref={iframeRef}
//               src={`https://140.115.126.193/chat/share?shared_id=8f34f200ef5911ef91480242ac120005${sessionId ? `&session_id=${sessionId}` : ''}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`}
//               style={{ width: '100%', height: '100%', minHeight: '500px' }}
//               frameBorder="0"
//               title="Chat Widget"
//             />
//           </div>
//         </Box>

//         {/* 右邊容器：文字編輯器 */}
//         <Box
//           sx={{
//             flex: 2,
//             padding: '20px',
//             borderLeft: '1px solid #ccc',
//             position: 'relative',
//             height: '500px',
//             marginTop: '-75px',
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '50px',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               padding: '0 20px',
//             }}
//           >
//             <span>
//               {username && `使用者: ${username}`}
//               {activityTitle && ` | 班級: ${activityTitle}`}
//               {groupName && ` | 主題: ${groupName}`}
//             </span>
//             <span>寫作區</span>
//           </Box>
//           <FroalaEditor
//             tag='textarea'
//             config={config}
//             model={editorContent}
//             onModelChange={(newContent) => setEditorContent(newContent)}
//           />
//           <Box
//             sx={{
//               position: 'absolute',
//               bottom: '20px',
//               right: '20px',
//               display: 'flex',
//               gap: '10px',
//               zIndex: 10,
//             }}
//           >
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={handleTempSave}
//             >
//               暫存
//             </Button>
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={handleSubmit}
//               disabled={isSubmitDisabled}
//             >
//               繳交上傳
//             </Button>
//           </Box>
//         </Box>
//       </div>

//       <Dialog open={openReminderDialog} onClose={handleCloseReminderDialog}>
//         <DialogTitle>提醒</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             請先與寫作精靈討論再開始寫作！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseReminderDialog} color="primary">
//             我知道了!
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openTempSaveDialog} onClose={handleCloseTempSaveDialog}>
//         <DialogTitle>提示</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             暫存成功！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseTempSaveDialog} color="primary">
//             確定
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openNoteDialog}
//         onClose={handleCloseNoteDialog}
//         sx={{
//           '& .MuiDialog-paper': {
//             width: '500px',
//             height: '500px',
//             maxWidth: 'none',
//           },
//         }}
//       >
//         <DialogTitle>筆記區</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="記錄您的筆記"
//             value={noteContent}
//             onChange={handleNoteChange}
//             multiline
//             rows={15}
//             fullWidth
//             variant="outlined"
//             sx={{ height: '90%' }}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseNoteDialog} color="primary">
//             儲存並關閉
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openHistoryDialog}
//         onClose={handleCloseHistoryDialog}
//         sx={{
//           '& .MuiDialog-paper': {
//             width: '500px',
//             maxHeight: '500px',
//           },
//         }}
//       >
//         <DialogTitle>聊天歷史紀錄</DialogTitle>
//         <DialogContent>
//           {chatHistory.length === 0 ? (
//             <DialogContentText>暫無聊天歷史紀錄</DialogContentText>
//           ) : (
//             <List>
//               {chatHistory.map((session) => (
//                 <ListItem key={session.id}>
//                   <ListItemText
//                     primary={`會話 ID: ${session.id}`}
//                     secondary={
//                       <>
//                         <div>創建時間: {formatDateTime(session.created_at)}</div>
//                         {session.messages && session.messages.length > 0 ? (
//                           <div>
//                             聊天內容:
//                             <List dense>
//                               {session.messages.map((msg, index) => (
//                                 <ListItem key={index}>
//                                   <ListItemText
//                                     primary={`${msg.role}: ${msg.content}`}
//                                     secondary={`時間: ${formatDateTime(msg.created_at)}`}
//                                   />
//                                 </ListItem>
//                               ))}
//                             </List>
//                           </div>
//                         ) : (
//                           <div>無聊天內容</div>
//                         )}
//                       </>
//                     }
//                   />
//                 </ListItem>
//               ))}
//             </List>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseHistoryDialog} color="primary">
//             關閉
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default WritingArea;




// import React, { useState, useEffect, useRef } from 'react';
// import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, List, ListItem, ListItemText } from '@mui/material';
// import { Box } from '@mui/system';
// import FroalaEditor from 'react-froala-wysiwyg';
// import 'froala-editor/js/plugins.pkgd.min.js';
// import 'froala-editor/css/froala_editor.pkgd.min.css';
// import 'froala-editor/css/froala_style.min.css';
// import axios from 'axios';
// import Navbar from "../components/Navbar_Student";

// // 用於 RAGFlow API 的 axios 實例
// const agentAxios = axios.create({
//   baseURL: 'https://140.115.126.193',
// });

// // 用於與本地後端交互的 axios 實例
// const apiAxios = axios.create({
//   baseURL: 'http://localhost:4000',
// });

// apiAxios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const WritingArea = () => {
//   const [editorContent, setEditorContent] = useState('');
//   const [openReminderDialog, setOpenReminderDialog] = useState(false);
//   const [openTempSaveDialog, setOpenTempSaveDialog] = useState(false);
//   const [openNoteDialog, setOpenNoteDialog] = useState(false);
//   const [noteContent, setNoteContent] = useState('');
//   const [sessionId, setSessionId] = useState('');
//   const [lastCreatedSessionId, setLastCreatedSessionId] = useState('');
//   const [sessionResponse, setSessionResponse] = useState('');
//   const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [currentMessages, setCurrentMessages] = useState([]);
//   const [activityTitle, setActivityTitle] = useState('');
//   const [groupName, setGroupName] = useState('');
//   const [username, setUsername] = useState('');
//   const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
//   const iframeRef = useRef(null);

//   // Load activity title, group name, username, and editor content from localStorage on mount
//   useEffect(() => {
//     const savedData = localStorage.getItem('editorData');
//     if (savedData) {
//       setEditorContent(savedData);
//     }

//     const savedNote = localStorage.getItem('noteData');
//     if (savedNote) {
//       setNoteContent(savedNote);
//     }

//     const savedActivityTitle = localStorage.getItem('activityTitle');
//     if (savedActivityTitle) {
//       setActivityTitle(savedActivityTitle);
//     }

//     const savedGroupName = localStorage.getItem('groupName');
//     if (savedGroupName) {
//       setGroupName(savedGroupName);
//     }

//     const savedUsername = localStorage.getItem('name');
//     if (savedUsername) {
//       setUsername(savedUsername);
//     }

//     setOpenReminderDialog(true);
//   }, []);

//   // 監聽 iframe 發回的消息
//   useEffect(() => {
//     const handleMessage = (event) => {
//       if (event.origin !== 'https://140.115.126.193') return;
//       const { type, content } = event.data;
//       if (type === 'agentResponse') {
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       }
//     };

//     window.addEventListener('message', handleMessage);
//     return () => window.removeEventListener('message', handleMessage);
//   }, []);

//   // 創建新聊天會話
//   const handleCreateSession = async () => {
//     if (sessionId) {
//       const currentSession = chatHistory.find((session) => session.id === sessionId) || {
//         id: sessionId,
//         created_at: new Date().toISOString(),
//       };
//       setChatHistory([
//         ...chatHistory.filter((session) => session.id !== sessionId),
//         { ...currentSession, messages: currentMessages || [] },
//       ]);
//     }

//     setCurrentMessages([]);

//     try {
//       const res = await agentAxios.post(
//         '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//         {},
//         {
//           headers: {
//             'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (res.data.code === 0) {
//         const newSessionId = res.data.data?.id || '未知 ID';
//         setSessionId(newSessionId);
//         setLastCreatedSessionId(newSessionId);
//         setSessionResponse(`✅ 成功創建聊天會話：${newSessionId}`);
//         console.log('新創建的 session_id:', newSessionId);
//         if (iframeRef.current) {
//           iframeRef.current.src = `https://140.115.126.193/chat/share?shared_id=8f34f200ef5911ef91480242ac120005&session_id=${newSessionId}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`;
//         }
//       } else {
//         setSessionResponse(`❌ 創建失敗：${res.data.message}`);
//       }
//     } catch (error) {
//       if (error.message.includes('Token')) {
//         setSessionResponse('❌ Token 無效，請重新登錄或聯繫管理員！');
//       } else if (error.message.includes('fetch')) {
//         setSessionResponse('❌ 網絡錯誤，請檢查伺服器連線或 SSL 證書！');
//       } else {
//         setSessionResponse(`❌ 錯誤：${error.message}`);
//       }
//     }
//   };

//   // 獲取聊天歷史紀錄
//   const handleFetchChatHistory = async () => {
//     try {
//       const res = await agentAxios.get(
//         '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//         {
//           params: {
//             page: 1,
//             page_size: 100,
//             orderby: 'create_time',
//             desc: true,
//           },
//           headers: {
//             'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       console.log('後端返回的會話資料:', res.data);

//       if (res.data.code === 0) {
//         const newSessions = res.data.data || [];
//         const updatedHistory = [...chatHistory];
//         newSessions.forEach((session) => {
//           const existingSessionIndex = updatedHistory.findIndex((s) => s.id === session.id);
//           if (existingSessionIndex !== -1) {
//             updatedHistory[existingSessionIndex] = {
//               ...updatedHistory[existingSessionIndex],
//               create_time: session.create_time,
//             };
//           } else {
//             updatedHistory.push({ ...session, messages: [] });
//           }
//         });
//         setChatHistory(updatedHistory);
//         if (lastCreatedSessionId) {
//           const sessionExists = updatedHistory.some((session) => session.id === lastCreatedSessionId);
//           console.log(
//             `檢查 session_id ${lastCreatedSessionId} 是否存在於歷史紀錄中: ${sessionExists ? '是' : '否'}`
//           );
//           console.log('更新後的 chatHistory:', updatedHistory);
//         } else {
//           console.log('尚未創建任何會話，無法檢查 session_id');
//         }
//         setOpenHistoryDialog(true);
//       } else {
//         alert(`❌ 獲取聊天歷史失敗：${res.data.message}`);
//       }
//     } catch (error) {
//       alert(`❌ 錯誤：${error.message}`);
//     }
//   };

//   // 格式化時間
//   const formatDateTime = (isoString) => {
//     const date = new Date(isoString);
//     return date.toLocaleString('zh-TW', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     });
//   };

//   // 將編輯器內容發送到後端，後端再提交到 Notion，使用 username 替代 activityTitle
//   const handleSubmit = async () => {
//     try {
//       // 儲存編輯器內容到 localStorage
//       localStorage.setItem('editorData', editorContent);

//       // 向後端發送請求，使用 username 作為 studentName，activityTitle 作為 className
//       const response = await apiAxios.post('/api/submit-to-notion', {
//         studentName: username || '未命名使用者',
//         theme: groupName || '未指定主題',
//         essayContent: editorContent || '無內容',
//         className: activityTitle || '未指定班級',
//       });

//       if (response.data.success) {
//         alert('繳交上傳成功！');
//         setIsSubmitDisabled(true); // 繳交成功後禁用按鈕
//       } else {
//         alert(`繳交上傳失敗：${response.data.message}`);
//       }
//     } catch (error) {
//       console.error('發送到 Notion 時出錯:', error);
//       const errorMessage = error.response?.data?.message || error.message || '未知錯誤';
//       alert(`繳交上傳失敗：${errorMessage}`);
//     }
//   };

//   // 暫存編輯器內容
//   const handleTempSave = () => {
//     localStorage.setItem('editorData', editorContent);
//     setOpenTempSaveDialog(true);
//   };

//   // Froala 編輯器選項
//   const config = {
//     placeholderText: '開始編輯...',
//     charCounterCount: false,
//     toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'fontFamily', 'backColor',
//             'align', 'orderedList', 'unorderedList', 'insertImage', 'insertTable', 'link', 'undo', 'redo', 
//             'clearFormatting', 'fullscreen', 'html', 'insertHR', 'specialCharacters'],
//   };

//   // 關閉提醒視窗
//   const handleCloseReminderDialog = () => {
//     setOpenReminderDialog(false);
//   };

//   // 關閉暫存成功視窗
//   const handleCloseTempSaveDialog = () => {
//     setOpenTempSaveDialog(false);
//   };

//   // 打開筆記區視窗
//   const handleOpenNoteDialog = () => {
//     setOpenNoteDialog(true);
//   };

//   // 關閉筆記區視窗並儲存筆記
//   const handleCloseNoteDialog = () => {
//     localStorage.setItem('noteData', noteContent);
//     setOpenNoteDialog(false);
//   };

//   // 關閉聊天歷史視窗
//   const handleCloseHistoryDialog = () => {
//     setOpenHistoryDialog(false);
//   };

//   // 處理筆記內容變化
//   const handleNoteChange = (e) => {
//     setNoteContent(e.target.value);
//   };

//   return (
//     <div>
//       <Navbar />
//       <div style={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
//         {/* 左邊容器：聊天室 */}
//         <Box
//           sx={{
//             flex: 1,
//             padding: '5px',
//             borderRight: '1px solid #ccc',
//             display: 'flex',
//             flexDirection: 'column',
//             marginTop: '-75px',
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '50px',
//               display: 'flex',
//               justifyContent: 'center',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               position: 'relative',
//             }}
//           >
//             寫作精靈
//             <Button
//               variant="outlined"
//               size="small"
//               onClick={handleOpenNoteDialog}
//               sx={{
//                 position: 'absolute',
//                 right: '10px',
//                 fontSize: '14px',
//                 padding: '2px 8px',
//               }}
//             >
//               筆記區
//             </Button>
//           </Box>
//           <div
//             style={{
//               border: '2px solid black',
//               borderRadius: '8px',
//               padding: '10px',
//               flex: 1,
//               overflowY: 'auto',
//               backgroundColor: '#FFFFFF',
//               marginBottom: '10px',
//             }}
//           >
//             <Box sx={{ mb: 2, display: 'flex', gap: '10px' }}>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleCreateSession}
//                 sx={{ mb: 1 }}
//               >
//                 創建新聊天
//               </Button>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleFetchChatHistory}
//                 sx={{ mb: 1 }}
//               >
//                 查看聊天歷史
//               </Button>
//             </Box>
//             {sessionResponse && (
//               <Box
//                 sx={{
//                   mt: 1,
//                   p: 1,
//                   backgroundColor: '#f0f0f0',
//                   borderRadius: '4px',
//                   fontSize: '14px',
//                 }}
//               >
//                 {sessionResponse}
//               </Box>
//             )}
//             <iframe
//               ref={iframeRef}
//               src={`https://140.115.126.193/chat/share?shared_id=8f34f200ef5911ef91480242ac120005${sessionId ? `&session_id=${sessionId}` : ''}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`}
//               style={{ width: '100%', height: '100%', minHeight: '500px' }}
//               frameBorder="0"
//               title="Chat Widget"
//             />
//           </div>
//         </Box>

//         {/* 右邊容器：文字編輯器 */}
//         <Box
//           sx={{
//             flex: 2,
//             padding: '20px',
//             borderLeft: '1px solid #ccc',
//             position: 'relative',
//             height: '500px',
//             marginTop: '-75px',
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '50px',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               padding: '0 20px',
//             }}
//           >
//             {/* <span>
//               {username && `使用者: ${username}`}
//               {activityTitle && ` | 班級: ${activityTitle}`}
//               {groupName && ` | 主題: ${groupName}`}
//             </span> */}
//             <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
//              {username && `使用者: ${username}`}
//             {activityTitle && ` | 班級: ${activityTitle}`}
//             {groupName && ` | 主題: ${groupName}`}
//             </span>
//             <span style={{ fontSize: '18px', fontWeight: 'bold' }}>寫作區</span>
//           </Box>
//           <FroalaEditor
//             tag='textarea'
//             config={config}
//             model={editorContent}
//             onModelChange={(newContent) => setEditorContent(newContent)}
//           />
//           <Box
//             sx={{
//               position: 'absolute',
//               bottom: '20px',
//               right: '20px',
//               display: 'flex',
//               gap: '10px',
//               zIndex: 10,
//             }}
//           >
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={handleTempSave}
//             >
//               暫存
//             </Button>
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={handleSubmit}
//               disabled={isSubmitDisabled}
//             >
//               繳交上傳
//             </Button>
//           </Box>
//         </Box>
//       </div>

//       <Dialog open={openReminderDialog} onClose={handleCloseReminderDialog}>
//         <DialogTitle>提醒</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             請先與寫作精靈討論再開始寫作！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseReminderDialog} color="primary">
//             我知道了!
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openTempSaveDialog} onClose={handleCloseTempSaveDialog}>
//         <DialogTitle>提示</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             暫存成功！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseTempSaveDialog} color="primary">
//             確定
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openNoteDialog}
//         onClose={handleCloseNoteDialog}
//         sx={{
//           '& .MuiDialog-paper': {
//             width: '500px',
//             height: '500px',
//             maxWidth: 'none',
//           },
//         }}
//       >
//         <DialogTitle>筆記區</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="記錄您的筆記"
//             value={noteContent}
//             onChange={handleNoteChange}
//             multiline
//             rows={15}
//             fullWidth
//             variant="outlined"
//             sx={{ height: '90%' }}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseNoteDialog} color="primary">
//             儲存並關閉
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openHistoryDialog}
//         onClose={handleCloseHistoryDialog}
//         sx={{
//           '& .MuiDialog-paper': {
//             width: '500px',
//             maxHeight: '500px',
//           },
//         }}
//       >
//         <DialogTitle>聊天歷史紀錄</DialogTitle>
//         <DialogContent>
//           {chatHistory.length === 0 ? (
//             <DialogContentText>暫無聊天歷史紀錄</DialogContentText>
//           ) : (
//             <List>
//               {chatHistory.map((session) => (
//                 <ListItem key={session.id}>
//                   <ListItemText
//                     primary={`會話 ID: ${session.id}`}
//                     secondary={
//                       <>
//                         <div>創建時間: {formatDateTime(session.created_at)}</div>
//                         {session.messages && session.messages.length > 0 ? (
//                           <div>
//                             聊天內容:
//                             <List dense>
//                               {session.messages.map((msg, index) => (
//                                 <ListItem key={index}>
//                                   <ListItemText
//                                     primary={`${msg.role}: ${msg.content}`}
//                                     secondary={`時間: ${formatDateTime(msg.created_at)}`}
//                                   />
//                                 </ListItem>
//                               ))}
//                             </List>
//                           </div>
//                         ) : (
//                           <div>無聊天內容</div>
//                         )}
//                       </>
//                     }
//                   />
//                 </ListItem>
//               ))}
//             </List>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseHistoryDialog} color="primary">
//             關閉
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default WritingArea;


//成功版本
// import React, { useState, useEffect, useRef } from 'react';
// import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, List, ListItem, ListItemText } from '@mui/material';
// import { Box } from '@mui/system';
// import FroalaEditor from 'react-froala-wysiwyg';
// import 'froala-editor/js/plugins.pkgd.min.js';
// import 'froala-editor/css/froala_editor.pkgd.min.css';
// import 'froala-editor/css/froala_style.min.css';
// import axios from 'axios';
// import Navbar from "../components/Navbar_Student";

// // 用於 RAGFlow API 的 axios 實例
// const agentAxios = axios.create({
//   baseURL: 'https://140.115.126.193',
// });

// // 用於與本地後端交互的 axios 實例
// const apiAxios = axios.create({
//   baseURL: 'http://localhost:4000',
// });

// apiAxios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const WritingArea = () => {
//   const [editorContent, setEditorContent] = useState('');
//   const [openReminderDialog, setOpenReminderDialog] = useState(false);
//   const [openTempSaveDialog, setOpenTempSaveDialog] = useState(false);
//   const [openNoteDialog, setOpenNoteDialog] = useState(false);
//   const [noteContent, setNoteContent] = useState('');
//   const [sessionId, setSessionId] = useState('');
//   const [lastCreatedSessionId, setLastCreatedSessionId] = useState('');
//   const [sessionResponse, setSessionResponse] = useState('');
//   const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [currentMessages, setCurrentMessages] = useState([]);
//   const [activityTitle, setActivityTitle] = useState('');
//   const [groupName, setGroupName] = useState('');
//   const [username, setUsername] = useState('');
//   const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
//   const iframeRef = useRef(null);

//   // Load activity title, group name, username, and fetch essay content from Notion
//   useEffect(() => {
//     const savedActivityTitle = localStorage.getItem('activityTitle');
//     if (savedActivityTitle) {
//       setActivityTitle(savedActivityTitle);
//     }

//     const savedGroupName = localStorage.getItem('groupName');
//     if (savedGroupName) {
//       setGroupName(savedGroupName);
//     }

//     const savedUsername = localStorage.getItem('name');
//     if (savedUsername && savedActivityTitle && savedGroupName) {
//       setUsername(savedUsername);

//       // Fetch essay content from Notion based on username, className, and theme
//       const fetchEssayContent = async () => {
//         try {
//           const response = await apiAxios.get(`/api/get-essay/${encodeURIComponent(savedUsername)}`, {
//             params: { className: savedActivityTitle, theme: savedGroupName },
//           });
//           if (response.data.success) {
//             setEditorContent(response.data.data.essayContent || '');
//           } else {
//             console.warn('未找到符合學生姓名、班級和主題的議論文內容，使用空白內容');
//             setEditorContent('');
//           }
//         } catch (error) {
//           console.error('從 Notion 獲取議論文內容失敗:', error);
//           setEditorContent('');
//         }
//       };

//       fetchEssayContent();
//     }

//     const savedNote = localStorage.getItem('noteData');
//     if (savedNote) {
//       setNoteContent(savedNote);
//     }

//     setOpenReminderDialog(true);
//   }, []);

//   // 監聽 iframe 發回的消息
//   useEffect(() => {
//     const handleMessage = (event) => {
//       if (event.origin !== 'https://140.115.126.193') return;
//       const { type, content } = event.data;
//       if (type === 'agentResponse') {
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       }
//     };

//     window.addEventListener('message', handleMessage);
//     return () => window.removeEventListener('message', handleMessage);
//   }, []);

//   // 創建新聊天會話
//   const handleCreateSession = async () => {
//     if (sessionId) {
//       const currentSession = chatHistory.find((session) => session.id === sessionId) || {
//         id: sessionId,
//         created_at: new Date().toISOString(),
//       };
//       setChatHistory([
//         ...chatHistory.filter((session) => session.id !== sessionId),
//         { ...currentSession, messages: currentMessages || [] },
//       ]);
//     }

//     setCurrentMessages([]);

//     try {
//       const res = await agentAxios.post(
//         '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//         {},
//         {
//           headers: {
//             'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (res.data.code === 0) {
//         const newSessionId = res.data.data?.id || '未知 ID';
//         setSessionId(newSessionId);
//         setLastCreatedSessionId(newSessionId);
//         setSessionResponse(`✅ 成功創建聊天會話：${newSessionId}`);
//         console.log('新創建的 session_id:', newSessionId);
//         if (iframeRef.current) {
//           iframeRef.current.src = `https://140.115.126.193/chat/share?shared_id=8f34f200ef5911ef91480242ac120005&session_id=${newSessionId}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`;
//         }
//       } else {
//         setSessionResponse(`❌ 創建失敗：${res.data.message}`);
//       }
//     } catch (error) {
//       if (error.message.includes('Token')) {
//         setSessionResponse('❌ Token 無效，請重新登錄或聯繫管理員！');
//       } else if (error.message.includes('fetch')) {
//         setSessionResponse('❌ 網絡錯誤，請檢查伺服器連線或 SSL 證書！');
//       } else {
//         setSessionResponse(`❌ 錯誤：${error.message}`);
//       }
//     }
//   };

//   // 獲取聊天歷史紀錄
//   const handleFetchChatHistory = async () => {
//     try {
//       const res = await agentAxios.get(
//         '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//         {
//           params: {
//             page: 1,
//             page_size: 100,
//             orderby: 'create_time',
//             desc: true,
//           },
//           headers: {
//             'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       console.log('後端返回的會話資料:', res.data);

//       if (res.data.code === 0) {
//         const newSessions = res.data.data || [];
//         const updatedHistory = [...chatHistory];
//         newSessions.forEach((session) => {
//           const existingSessionIndex = updatedHistory.findIndex((s) => s.id === session.id);
//           if (existingSessionIndex !== -1) {
//             updatedHistory[existingSessionIndex] = {
//               ...updatedHistory[existingSessionIndex],
//               create_time: session.create_time,
//             };
//           } else {
//             updatedHistory.push({ ...session, messages: [] });
//           }
//         });
//         setChatHistory(updatedHistory);
//         if (lastCreatedSessionId) {
//           const sessionExists = updatedHistory.some((session) => session.id === lastCreatedSessionId);
//           console.log(
//             `檢查 session_id ${lastCreatedSessionId} 是否存在於歷史紀錄中: ${sessionExists ? '是' : '否'}`
//           );
//           console.log('更新後的 chatHistory:', updatedHistory);
//         } else {
//           console.log('尚未創建任何會話，無法檢查 session_id');
//         }
//         setOpenHistoryDialog(true);
//       } else {
//         alert(`❌ 獲取聊天歷史失敗：${res.data.message}`);
//       }
//     } catch (error) {
//       alert(`❌ 錯誤：${error.message}`);
//     }
//   };

//   // 格式化時間
//   const formatDateTime = (isoString) => {
//     const date = new Date(isoString);
//     return date.toLocaleString('zh-TW', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     });
//   };

//   // 將編輯器內容發送到後端，後端再提交到 Notion，使用 username 替代 activityTitle
//   const handleSubmit = async () => {
//     try {
//       // 向後端發送請求，使用 username 作為 studentName，activityTitle 作為 className
//       const response = await apiAxios.post('/api/submit-to-notion', {
//         studentName: username || '未命名使用者',
//         theme: groupName || '未指定主題',
//         essayContent: editorContent || '無內容',
//         className: activityTitle || '未指定班級',
//       });

//       if (response.data.success) {
//         alert('繳交上傳成功！');
//         setIsSubmitDisabled(true); // 繳交成功後禁用按鈕
//       } else {
//         alert(`繳交上傳失敗：${response.data.message}`);
//       }
//     } catch (error) {
//       console.error('發送到 Notion 時出錯:', error);
//       const errorMessage = error.response?.data?.message || error.message || '未知錯誤';
//       alert(`繳交上傳失敗：${errorMessage}`);
//     }
//   };

//   // 暫存編輯器內容（不再使用 localStorage）
//   const handleTempSave = () => {
//     setOpenTempSaveDialog(true);
//   };

//   // Froala 編輯器選項
//   const config = {
//     placeholderText: '開始編輯...',
//     charCounterCount: false,
//     toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'fontFamily', 'backColor',
//             'align', 'orderedList', 'unorderedList', 'insertImage', 'insertTable', 'link', 'undo', 'redo', 
//             'clearFormatting', 'fullscreen', 'html', 'insertHR', 'specialCharacters'],
//   };

//   // 關閉提醒視窗
//   const handleCloseReminderDialog = () => {
//     setOpenReminderDialog(false);
//   };

//   // 關閉暫存成功視窗
//   const handleCloseTempSaveDialog = () => {
//     setOpenTempSaveDialog(false);
//   };

//   // 打開筆記區視窗
//   const handleOpenNoteDialog = () => {
//     setOpenNoteDialog(true);
//   };

//   // 關閉筆記區視窗並儲存筆記
//   const handleCloseNoteDialog = () => {
//     localStorage.setItem('noteData', noteContent);
//     setOpenNoteDialog(false);
//   };

//   // 關閉聊天歷史視窗
//   const handleCloseHistoryDialog = () => {
//     setOpenHistoryDialog(false);
//   };

//   // 處理筆記內容變化
//   const handleNoteChange = (e) => {
//     setNoteContent(e.target.value);
//   };

//   return (
//     <div>
//       <Navbar />
//       <div style={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
//         {/* 左邊容器：聊天室 */}
//         <Box
//           sx={{
//             flex: 1,
//             padding: '5px',
//             borderRight: '1px solid #ccc',
//             display: 'flex',
//             flexDirection: 'column',
//             marginTop: '-75px',
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '50px',
//               display: 'flex',
//               justifyContent: 'center',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               position: 'relative',
//             }}
//           >
//             AI Writing Assistant
//             <Button
//               variant="outlined"
//               size="small"
//               onClick={handleOpenNoteDialog}
//               sx={{
//                 position: 'absolute',
//                 right: '10px',
//                 fontSize: '14px',
//                 padding: '2px 8px',
//               }}
//             >
//               Notes Area
//             </Button>
//           </Box>
//           <div
//             style={{
//               border: '2px solid black',
//               borderRadius: '8px',
//               padding: '10px',
//               flex: 1,
//               overflowY: 'auto',
//               backgroundColor: '#FFFFFF',
//               marginBottom: '10px',
//             }}
//           >
//             <Box sx={{ mb: 2, display: 'flex', gap: '10px' }}>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleCreateSession}
//                 sx={{ mb: 1 }}
//               >
//                 Create New Chat
//               </Button>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleFetchChatHistory}
//                 sx={{ mb: 1 }}
//               >
//                 View Chat History
//               </Button>
//             </Box>
//             {sessionResponse && (
//               <Box
//                 sx={{
//                   mt: 1,
//                   p: 1,
//                   backgroundColor: '#f0f0f0',
//                   borderRadius: '4px',
//                   fontSize: '14px',
//                 }}
//               >
//                 {sessionResponse}
//               </Box>
//             )}
//             <iframe
//               ref={iframeRef}
//               src={`https://140.115.126.193/chat/share?shared_id=8f34f200ef5911ef91480242ac120005${sessionId ? `&session_id=${sessionId}` : ''}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`}
//               style={{ width: '100%', height: '100%', minHeight: '500px' }}
//               frameBorder="0"
//               title="Chat Widget"
//             />
//           </div>
//         </Box>

//         {/* 右邊容器：文字編輯器 */}
//         <Box
//           sx={{
//             flex: 2,
//             padding: '20px',
//             borderLeft: '1px solid #ccc',
//             position: 'relative',
//             height: '500px',
//             marginTop: '-75px',
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '50px',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               padding: '0 20px',
//             }}
//           >
//             <Box sx={{ fontSize: '18px', fontWeight: 'bold' }}>
//               <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
//                 {username && `User: ${username}`}
//                 {activityTitle && ` Class: ${activityTitle}`}
//                 {groupName && ` Topic: ${groupName}`}
//               </span>
//             </Box>
//             {/* <span style={{ fontSize: '18px', fontWeight: 'bold' }}>寫作區</span> */}
//           </Box>
//           <FroalaEditor
//             tag='textarea'
//             config={config}
//             model={editorContent}
//             onModelChange={(newContent) => setEditorContent(newContent)}
//           />
//           <Box
//             sx={{
//               position: 'absolute',
//               bottom: '20px',
//               right: '20px',
//               display: 'flex',
//               gap: '10px',
//               zIndex: 10,
//             }}
//           >
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={handleTempSave}
//             >
//               Temporary
//             </Button>
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={handleSubmit}
//               disabled={isSubmitDisabled}
//             >
//               Submit Upload
//             </Button>
//           </Box>
//         </Box>
//       </div>

//       <Dialog open={openReminderDialog} onClose={handleCloseReminderDialog}>
//         <DialogTitle>Notification</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Please discuss with the Writing Assistant before starting to write!
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseReminderDialog} color="primary">
//             OK!
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openTempSaveDialog} onClose={handleCloseTempSaveDialog}>
//         <DialogTitle>Tip</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Temporary save successful!
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseTempSaveDialog} color="primary">
//             OK
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openNoteDialog}
//         onClose={handleCloseNoteDialog}
//         sx={{
//           '& .MuiDialog-paper': {
//             width: '500px',
//             height: '500px',
//             maxWidth: 'none',
//           },
//         }}
//       >
//         <DialogTitle>Notes Area</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="記錄您的筆記"
//             value={noteContent}
//             onChange={handleNoteChange}
//             multiline
//             rows={15}
//             fullWidth
//             variant="outlined"
//             sx={{ height: '90%' }}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseNoteDialog} color="primary">
//             Save and Close
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openHistoryDialog}
//         onClose={handleCloseHistoryDialog}
//         sx={{
//           '& .MuiDialog-paper': {
//             width: '500px',
//             maxHeight: '500px',
//           },
//         }}
//       >
//         <DialogTitle>Chat History</DialogTitle>
//         <DialogContent>
//           {chatHistory.length === 0 ? (
//             <DialogContentText>No chat history available</DialogContentText>
//           ) : (
//             <List>
//               {chatHistory.map((session) => (
//                 <ListItem key={session.id}>
//                   <ListItemText
//                     primary={`會話 ID: ${session.id}`}
//                     secondary={
//                       <>
//                         <div>Creation Time: {formatDateTime(session.created_at)}</div>
//                         {session.messages && session.messages.length > 0 ? (
//                           <div>
//                             Chat Content:
//                             <List dense>
//                               {session.messages.map((msg, index) => (
//                                 <ListItem key={index}>
//                                   <ListItemText
//                                     primary={`${msg.role}: ${msg.content}`}
//                                     secondary={`時間: ${formatDateTime(msg.created_at)}`}
//                                   />
//                                 </ListItem>
//                               ))}
//                             </List>
//                           </div>
//                         ) : (
//                           <div>No chat content</div>
//                         )}
//                       </>
//                     }
//                   />
//                 </ListItem>
//               ))}
//             </List>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseHistoryDialog} color="primary">
//             Close
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default WritingArea;







// import React, { useState, useEffect, useRef } from 'react';
// import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, List, ListItem, ListItemText } from '@mui/material';
// import { Box } from '@mui/system';
// import FroalaEditor from 'react-froala-wysiwyg';
// import 'froala-editor/js/plugins.pkgd.min.js';
// import 'froala-editor/css/froala_editor.pkgd.min.css';
// import 'froala-editor/css/froala_style.min.css';
// import axios from 'axios';
// import Navbar from "../components/Navbar_Student";

// // 用於 RAGFlow API 的 axios 實例
// const agentAxios = axios.create({
//   baseURL: 'https://140.115.126.193',
// });

// // 用於與本地後端交互的 axios 實例
// const apiAxios = axios.create({
//   baseURL: 'http://localhost:4000',
// });

// apiAxios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const WritingArea = () => {
//   const [editorContent, setEditorContent] = useState('');
//   const [openReminderDialog, setOpenReminderDialog] = useState(false);
//   const [openTempSaveDialog, setOpenTempSaveDialog] = useState(false);
//   const [openNoteDialog, setOpenNoteDialog] = useState(false);
//   const [noteContent, setNoteContent] = useState('');
//   const [sessionId, setSessionId] = useState('');
//   const [lastCreatedSessionId, setLastCreatedSessionId] = useState('');
//   const [sessionResponse, setSessionResponse] = useState('');
//   const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [currentMessages, setCurrentMessages] = useState([]);
//   const [activityTitle, setActivityTitle] = useState('');
//   const [groupName, setGroupName] = useState('');
//   const [username, setUsername] = useState('');
//   const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
//   const [openConfirmSubmitDialog, setOpenConfirmSubmitDialog] = useState(false);
//   const iframeRef = useRef(null);

//   // Load activity title, group name, username, and fetch essay content from Notion
//   useEffect(() => {
//     const savedActivityTitle = localStorage.getItem('activityTitle');
//     if (savedActivityTitle) {
//       setActivityTitle(savedActivityTitle);
//     }

//     const savedGroupName = localStorage.getItem('groupName');
//     if (savedGroupName) {
//       setGroupName(savedGroupName);
//     }

//     const savedUsername = localStorage.getItem('name');
//     if (savedUsername && savedActivityTitle && savedGroupName) {
//       setUsername(savedUsername);

//       const fetchEssayContent = async () => {
//         try {
//           const response = await apiAxios.get(`/api/get-essay/${encodeURIComponent(savedUsername)}`, {
//             params: { className: savedActivityTitle, theme: savedGroupName },
//           });
//           if (response.data.success) {
//             setEditorContent(response.data.data.essayContent || '');
//           } else {
//             console.warn('未找到符合學生姓名、班級和主題的議論文內容，使用空白內容');
//             setEditorContent('');
//           }
//         } catch (error) {
//           console.error('從 Notion 獲取議論文內容失敗:', error);
//           setEditorContent('');
//         }
//       };

//       fetchEssayContent();
//     }

//     const savedNote = localStorage.getItem('noteData');
//     if (savedNote) {
//       setNoteContent(savedNote);
//     }

//     setOpenReminderDialog(true);
//   }, []);

//   useEffect(() => {
//     const handleMessage = (event) => {
//       if (event.origin !== 'https://140.115.126.193') return;
//       const { type, content } = event.data;
//       if (type === 'agentResponse') {
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       }
//     };

//     window.addEventListener('message', handleMessage);
//     return () => window.removeEventListener('message', handleMessage);
//   }, []);

//   const handleCreateSession = async () => {
//     if (sessionId) {
//       const currentSession = chatHistory.find((session) => session.id === sessionId) || {
//         id: sessionId,
//         created_at: new Date().toISOString(),
//       };
//       setChatHistory([
//         ...chatHistory.filter((session) => session.id !== sessionId),
//         { ...currentSession, messages: currentMessages || [] },
//       ]);
//     }

//     setCurrentMessages([]);

//     try {
//       const res = await agentAxios.post(
//         '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//         {},
//         {
//           headers: {
//             'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (res.data.code === 0) {
//         const newSessionId = res.data.data?.id || '未知 ID';
//         setSessionId(newSessionId);
//         setLastCreatedSessionId(newSessionId);
//         setSessionResponse(`✅ 成功創建聊天會話：${newSessionId}`);
//         if (iframeRef.current) {
//           iframeRef.current.src = `https://140.115.126.193/chat/share?shared_id=8f34f200ef5911ef91480242ac120005&session_id=${newSessionId}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`;
//         }
//       } else {
//         setSessionResponse(`❌ 創建失敗：${res.data.message}`);
//       }
//     } catch (error) {
//       if (error.message.includes('Token')) {
//         setSessionResponse('❌ Token 無效，請重新登錄或聯繫管理員！');
//       } else if (error.message.includes('fetch')) {
//         setSessionResponse('❌ 網絡錯誤，請檢查伺服器連線或 SSL 證書！');
//       } else {
//         setSessionResponse(`❌ 錯誤：${error.message}`);
//       }
//     }
//   };

//   const handleFetchChatHistory = async () => {
//     try {
//       const res = await agentAxios.get(
//         '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//         {
//           params: {
//             page: 1,
//             page_size: 100,
//             orderby: 'create_time',
//             desc: true,
//           },
//           headers: {
//             'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (res.data.code === 0) {
//         const newSessions = res.data.data || [];
//         const updatedHistory = [...chatHistory];
//         newSessions.forEach((session) => {
//           const existingSessionIndex = updatedHistory.findIndex((s) => s.id === session.id);
//           if (existingSessionIndex !== -1) {
//             updatedHistory[existingSessionIndex] = {
//               ...updatedHistory[existingSessionIndex],
//               create_time: session.create_time,
//             };
//           } else {
//             updatedHistory.push({ ...session, messages: [] });
//           }
//         });
//         setChatHistory(updatedHistory);
//         setOpenHistoryDialog(true);
//       } else {
//         alert(`❌ 獲取聊天歷史失敗：${res.data.message}`);
//       }
//     } catch (error) {
//       alert(`❌ 錯誤：${error.message}`);
//     }
//   };

//   const formatDateTime = (isoString) => {
//     const date = new Date(isoString);
//     return date.toLocaleString('zh-TW', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     });
//   };

//   const handleSubmit = async () => {
//     try {
//       const response = await apiAxios.post('/api/submit-to-notion', {
//         studentName: username || '未命名使用者',
//         theme: groupName || '未指定主題',
//         essayContent: editorContent || '無內容',
//         className: activityTitle || '未指定班級',
//       });

//       if (response.data.success) {
//         alert('繳交上傳成功！');
//         setIsSubmitDisabled(true);
//       } else {
//         alert(`繳交上傳失敗：${response.data.message}`);
//       }
//     } catch (error) {
//       console.error('發送到 Notion 時出錯:', error);
//       const errorMessage = error.response?.data?.message || error.message || '未知錯誤';
//       alert(`繳交上傳失敗：${errorMessage}`);
//     }
//   };

//   const handleConfirmSubmit = () => {
//     setOpenConfirmSubmitDialog(false);
//     handleSubmit();
//   };

//   const handleTempSave = () => {
//     setOpenTempSaveDialog(true);
//   };

//   const config = {
//     placeholderText: '開始編輯...',
//     charCounterCount: false,
//     toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'fontFamily', 'backColor',
//             'align', 'orderedList', 'unorderedList', 'insertImage', 'insertTable', 'link', 'undo', 'redo', 
//             'clearFormatting', 'fullscreen', 'html', 'insertHR', 'specialCharacters'],
//   };

//   const handleCloseReminderDialog = () => {
//     setOpenReminderDialog(false);
//   };

//   const handleCloseTempSaveDialog = () => {
//     setOpenTempSaveDialog(false);
//   };

//   const handleOpenNoteDialog = () => {
//     setOpenNoteDialog(true);
//   };

//   const handleCloseNoteDialog = () => {
//     localStorage.setItem('noteData', noteContent);
//     setOpenNoteDialog(false);
//   };

//   const handleCloseHistoryDialog = () => {
//     setOpenHistoryDialog(false);
//   };

//   const handleNoteChange = (e) => {
//     setNoteContent(e.target.value);
//   };

//   return (
//     <div>
//       <Navbar />
//       <Box
//         sx={{
//           display: 'flex',
//           flexDirection: { xs: 'column', md: 'row' },
//           minHeight: 'calc(100vh - 120px)',
//           padding: '10px',
//           gap: '10px',
//         }}
//       >
//         {/* 左邊容器：聊天室 */}
//         <Box
//           sx={{
//             width: '100%',
//             maxWidth: { xs: '100%', md: '400px' },
//             padding: '5px',
//             borderRight: { md: '1px solid #ccc', xs: 'none' },
//             display: 'flex',
//             flexDirection: 'column',
//             marginTop: '-75px',
//             '@media (max-width: 800px)': {
//               maxWidth: '100%',
//               marginTop: 0,
//             },
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '50px',
//               display: 'flex',
//               justifyContent: 'center',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               position: 'relative',
//             }}
//           >
//             AI Writing Assistant
//             <Button
//               variant="contained"
//               size="small"
//               onClick={handleOpenNoteDialog}
//               sx={{
//                 position: 'absolute',
//                 right: '10px',
//                 fontSize: { xs: '12px', md: '14px' }, // 響應式字體大小
//                 padding: { xs: '2px 6px', md: '2px 8px' }, // 響應式內邊距
//                 backgroundColor: '#1976d2', // 藍色背景
//                 color: '#ffffff', // 白色文字
//                 '&:hover': {
//                   backgroundColor: '#1565c0', // 懸停時稍深的藍色
//                 },
//               }}
//             >
//               Notes Area
//             </Button>
//           </Box>
//           <div
//             style={{
//               border: '2px solid black',
//               borderRadius: '8px',
//               padding: '10px',
//               flex: 1,
//               overflowY: 'auto',
//               backgroundColor: '#FFFFFF',
//               marginBottom: '10px',
//             }}
//           >
//             <Box sx={{ mb: 2, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleCreateSession}
//                 sx={{ mb: 1 }}
//               >
//                 Create New Chat
//               </Button>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleFetchChatHistory}
//                 sx={{ mb: 1 }}
//               >
//                 View Chat History
//               </Button>
//             </Box>
//             {sessionResponse && (
//               <Box
//                 sx={{
//                   mt: 1,
//                   p: 1,
//                   backgroundColor: '#f0f0f0',
//                   borderRadius: '4px',
//                   fontSize: '14px',
//                 }}
//               >
//                 {sessionResponse}
//               </Box>
//             )}
//             <iframe
//               ref={iframeRef}
//               src={`https://140.115.126.193/chat/share?shared_id=8f34f200ef5911ef91480242ac120005${sessionId ? `&session_id=${sessionId}` : ''}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`}
//               style={{ width: '100%', height: '100%', minHeight: '500px' }}
//               frameBorder="0"
//               title="Chat Widget"
//             />
//           </div>
//         </Box>

//         {/* 右邊容器：文字編輯器 */}
//         <Box
//           sx={{
//             width: '100%',
//             padding: '20px',
//             borderLeft: { md: '1px solid #ccc', xs: 'none' },
//             position: 'relative',
//             height: '500px',
//             flex: 1,
//             '@media (max-width: 00px)': {
//               padding: '10px',
//               height: 'auto',
//               borderLeft: 'none',
//             },
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '50px',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               padding: '0 20px',
//               '@media (max-width: 600px)': {
//                 fontSize: '16px',
//                 height: '40px',
//                 padding: '0 10px',
//               },
//             }}
//           >
//             <Box>
//               <span>
//                 {username && `User: ${username}`}
//                 {activityTitle && ` Class: ${activityTitle}`}
//                 {groupName && ` Topic: ${groupName}`}
//               </span>
//             </Box>
//           </Box>
//           <FroalaEditor
//             tag='textarea'
//             config={config}
//             model={editorContent}
//             onModelChange={(newContent) => setEditorContent(newContent)}
//           />
//           {/* 按鈕容器：移動到寫作區右下方 */}
//           <Box
//             sx={{
//               position: 'absolute',
//               bottom: '20px',
//               right: '20px',
//               display: 'flex',
//               gap: '10px',
//               zIndex: 10,
//               '@media (max-width: 600px)': {
//                 position: 'relative',
//                 bottom: 0,
//                 right: 0,
//                 width: '100%',
//                 justifyContent: 'center',
//                 marginTop: '10px',
//                 flexWrap: 'wrap', // 小螢幕自動換行
//               },
//             }}
//           >
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={handleTempSave}
//             >
//               Temporary
//             </Button>
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={() => setOpenConfirmSubmitDialog(true)}
//               disabled={isSubmitDisabled}
//             >
//               Submit Upload
//             </Button>
//           </Box>
//         </Box>
//       </Box>

//       {/* 提交確認對話框 */}
//       <Dialog open={openConfirmSubmitDialog} onClose={() => setOpenConfirmSubmitDialog(false)}>
//         <DialogTitle>確認繳交</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             確定要繳交嗎，繳交後無法再修改內容？
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenConfirmSubmitDialog(false)} color="primary">
//             取消
//           </Button>
//           <Button onClick={handleConfirmSubmit} color="primary" autoFocus>
//             確認
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openReminderDialog} onClose={handleCloseReminderDialog}>
//         <DialogTitle>Notification</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Please discuss with the Writing Assistant before starting to write!
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseReminderDialog} color="primary">
//             OK!
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openTempSaveDialog} onClose={handleCloseTempSaveDialog}>
//         <DialogTitle>Tip</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Temporary save successful!
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseTempSaveDialog} color="primary">
//             OK
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openNoteDialog}
//         onClose={handleCloseNoteDialog}
//         sx={{
//           '& .MuiDialog-paper': {
//             width: '500px',
//             height: '500px',
//             maxWidth: '90vw',
//             '@media (max-width: 600px)': {
//               width: '90vw',
//               height: '80vh',
//             },
//           },
//         }}
//       >
//         <DialogTitle>Notes Area</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="記錄您的筆記"
//             value={noteContent}
//             onChange={handleNoteChange}
//             multiline
//             rows={15}
//             fullWidth
//             variant="outlined"
//             sx={{ height: '90%' }}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseNoteDialog} color="primary">
//             Save and Close
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openHistoryDialog}
//         onClose={handleCloseHistoryDialog}
//         sx={{
//           '& .MuiDialog-paper': {
//             width: '500px',
//             maxHeight: '500px',
//             maxWidth: '90vw',
//             '@media (max-width: 600px)': {
//               width: '90vw',
//               maxHeight: '80vh',
//             },
//           },
//         }}
//       >
//         <DialogTitle>Chat History</DialogTitle>
//         <DialogContent>
//           {chatHistory.length === 0 ? (
//             <DialogContentText>No chat history available</DialogContentText>
//           ) : (
//             <List>
//               {chatHistory.map((session) => (
//                 <ListItem key={session.id}>
//                   <ListItemText
//                     primary={`會話 ID: ${session.id}`}
//                     secondary={
//                       <>
//                         <div>Creation Time: {formatDateTime(session.created_at)}</div>
//                         {session.messages && session.messages.length > 0 ? (
//                           <div>
//                             Chat Content:
//                             <List dense>
//                               {session.messages.map((msg, index) => (
//                                 <ListItem key={index}>
//                                   <ListItemText
//                                     primary={`${msg.role}: ${msg.content}`}
//                                     secondary={`時間: ${formatDateTime(msg.created_at)}`}
//                                   />
//                                 </ListItem>
//                               ))}
//                             </List>
//                           </div>
//                         ) : (
//                           <div>No chat content</div>
//                         )}
//                       </>
//                     }
//                   />
//                 </ListItem>
//               ))}
//             </List>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseHistoryDialog} color="primary">
//             Close
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default WritingArea;




// import React, { useState, useEffect, useRef } from 'react';
// import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, List, ListItem, ListItemText } from '@mui/material';
// import { Box } from '@mui/system';
// import FroalaEditor from 'react-froala-wysiwyg';
// import 'froala-editor/js/plugins.pkgd.min.js';
// import 'froala-editor/css/froala_editor.pkgd.min.css';
// import 'froala-editor/css/froala_style.min.css';
// import axios from 'axios';
// import Navbar from "../components/Navbar_Student";

// // 用於 RAGFlow API 的 axios 實例
// const agentAxios = axios.create({
//   baseURL: 'https://140.115.126.193',
// });

// // 用於與本地後端交互的 axios 實例
// const apiAxios = axios.create({
//   baseURL: 'http://localhost:4000',
// });

// apiAxios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const WritingArea = () => {
//   const [editorContent, setEditorContent] = useState('');
//   const [openReminderDialog, setOpenReminderDialog] = useState(false);
//   const [openTempSaveDialog, setOpenTempSaveDialog] = useState(false);
//   const [openNoteDialog, setOpenNoteDialog] = useState(false);
//   const [noteContent, setNoteContent] = useState('');
//   const [sessionId, setSessionId] = useState('');
//   const [lastCreatedSessionId, setLastCreatedSessionId] = useState('');
//   const [sessionResponse, setSessionResponse] = useState('');
//   const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [currentMessages, setCurrentMessages] = useState([]);
//   const [activityTitle, setActivityTitle] = useState('');
//   const [groupName, setGroupName] = useState('');
//   const [username, setUsername] = useState('');
//   const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
//   const [openConfirmSubmitDialog, setOpenConfirmSubmitDialog] = useState(false);
//   const iframeRef = useRef(null);

//   // Load activity title, group name, username, and fetch essay content from Notion
//   useEffect(() => {
//     const savedActivityTitle = localStorage.getItem('activityTitle');
//     if (savedActivityTitle) {
//       setActivityTitle(savedActivityTitle);
//     }

//     const savedGroupName = localStorage.getItem('groupName');
//     if (savedGroupName) {
//       setGroupName(savedGroupName);
//     }

//     const savedUsername = localStorage.getItem('name');
//     if (savedUsername && savedActivityTitle && savedGroupName) {
//       setUsername(savedUsername);

//       const fetchEssayContent = async () => {
//         try {
//           const response = await apiAxios.get(`/api/get-essay/${encodeURIComponent(savedUsername)}`, {
//             params: { className: savedActivityTitle, theme: savedGroupName },
//           });
//           if (response.data.success) {
//             setEditorContent(response.data.data.essayContent || '');
//           } else {
//             console.warn('未找到符合學生姓名、班級和主題的議論文內容，使用空白內容');
//             setEditorContent('');
//           }
//         } catch (error) {
//           console.error('從 Notion 獲取議論文內容失敗:', error);
//           setEditorContent('');
//         }
//       };

//       fetchEssayContent();
//     }

//     const savedNote = localStorage.getItem('noteData');
//     if (savedNote) {
//       setNoteContent(savedNote);
//     }

//     setOpenReminderDialog(true);
//   }, []);

//   useEffect(() => {
//     const handleMessage = (event) => {
//       if (event.origin !== 'https://140.115.126.193') return;
//       const { type, content } = event.data;
//       if (type === 'agentResponse') {
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       }
//     };

//     window.addEventListener('message', handleMessage);
//     return () => window.removeEventListener('message', handleMessage);
//   }, []);

//   const handleCreateSession = async () => {
//     if (sessionId) {
//       const currentSession = chatHistory.find((session) => session.id === sessionId) || {
//         id: sessionId,
//         created_at: new Date().toISOString(),
//       };
//       setChatHistory([
//         ...chatHistory.filter((session) => session.id !== sessionId),
//         { ...currentSession, messages: currentMessages || [] },
//       ]);
//     }

//     setCurrentMessages([]);

//     try {
//       const res = await agentAxios.post(
//         '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//         {},
//         {
//           headers: {
//             'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (res.data.code === 0) {
//         const newSessionId = res.data.data?.id || '未知 ID';
//         setSessionId(newSessionId);
//         setLastCreatedSessionId(newSessionId);
//         setSessionResponse(`✅ 成功創建聊天會話：${newSessionId}`);
//         if (iframeRef.current) {
//           iframeRef.current.src = `https://140.115.126.193/chat/share?shared_id=8f34f200ef5911ef91480242ac120005&session_id=${newSessionId}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`;
//         }
//       } else {
//         setSessionResponse(`❌ 創建失敗：${res.data.message}`);
//       }
//     } catch (error) {
//       if (error.message.includes('Token')) {
//         setSessionResponse('❌ Token 無效，請重新登錄或聯繫管理員！');
//       } else if (error.message.includes('fetch')) {
//         setSessionResponse('❌ 網絡錯誤，請檢查伺服器連線或 SSL 證書！');
//       } else {
//         setSessionResponse(`❌ 錯誤：${error.message}`);
//       }
//     }
//   };

//   const handleFetchChatHistory = async () => {
//     try {
//       const res = await agentAxios.get(
//         '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//         {
//           params: {
//             page: 1,
//             page_size: 100,
//             orderby: 'create_time',
//             desc: true,
//           },
//           headers: {
//             'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (res.data.code === 0) {
//         const newSessions = res.data.data || [];
//         const updatedHistory = [...chatHistory];
//         newSessions.forEach((session) => {
//           const existingSessionIndex = updatedHistory.findIndex((s) => s.id === session.id);
//           if (existingSessionIndex !== -1) {
//             updatedHistory[existingSessionIndex] = {
//               ...updatedHistory[existingSessionIndex],
//               create_time: session.create_time,
//             };
//           } else {
//             updatedHistory.push({ ...session, messages: [] });
//           }
//         });
//         setChatHistory(updatedHistory);
//         setOpenHistoryDialog(true);
//       } else {
//         alert(`❌ 獲取聊天歷史失敗：${res.data.message}`);
//       }
//     } catch (error) {
//       alert(`❌ 錯誤：${error.message}`);
//     }
//   };

//   const formatDateTime = (isoString) => {
//     const date = new Date(isoString);
//     return date.toLocaleString('zh-TW', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     });
//   };

//   const handleSubmit = async () => {
//     try {
//       const response = await apiAxios.post('/api/submit-to-notion', {
//         studentName: username || '未命名使用者',
//         theme: groupName || '未指定主題',
//         essayContent: editorContent || '無內容',
//         className: activityTitle || '未指定班級',
//       });

//       if (response.data.success) {
//         alert('繳交上傳成功！');
//         setIsSubmitDisabled(true);
//       } else {
//         alert(`繳交上傳失敗：${response.data.message}`);
//       }
//     } catch (error) {
//       console.error('發送到 Notion 時出錯:', error);
//       const errorMessage = error.response?.data?.message || error.message || '未知錯誤';
//       alert(`繳交上傳失敗：${errorMessage}`);
//     }
//   };

//   const handleConfirmSubmit = () => {
//     setOpenConfirmSubmitDialog(false);
//     handleSubmit();
//   };

//   const handleTempSave = () => {
//     setOpenTempSaveDialog(true);
//   };

//   const config = {
//     placeholderText: '開始編輯...',
//     charCounterCount: false,
//     toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'fontFamily', 'backColor',
//             'align', 'orderedList', 'unorderedList', 'insertImage', 'insertTable', 'link', 'undo', 'redo', 
//             'clearFormatting', 'fullscreen', 'html', 'insertHR', 'specialCharacters'],
//   };

//   const handleCloseReminderDialog = () => {
//     setOpenReminderDialog(false);
//   };

//   const handleCloseTempSaveDialog = () => {
//     setOpenTempSaveDialog(false);
//   };

//   const handleOpenNoteDialog = () => {
//     setOpenNoteDialog(true);
//   };

//   const handleCloseNoteDialog = () => {
//     localStorage.setItem('noteData', noteContent);
//     setOpenNoteDialog(false);
//   };

//   const handleCloseHistoryDialog = () => {
//     setOpenHistoryDialog(false);
//   };

//   const handleNoteChange = (e) => {
//     setNoteContent(e.target.value);
//   };

//   return (
//     <div>
//       <Navbar />
//       <Box
//         sx={{
//           display: 'flex',
//           flexDirection: { xs: 'column', md: 'row' },
//           minHeight: 'calc(100vh - 120px)',
//           padding: '10px',
//           gap: '10px',
//         }}
//       >
//         {/* 左邊容器：聊天室 */}
//         <Box
//           sx={{
//             width: { md: '50%', xs: '100%' },
//             padding: '5px',
//             borderRight: { md: '1px solid #ccc', xs: 'none' },
//             display: 'flex',
//             flexDirection: 'column',
//             height: { md: '600px', sm: '800px', xs: 'auto' },
//             '@media (max-width: 700px)': {
//               height: '800px',
//             },
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '50px',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               padding: '0 10px',
//             }}
//           >
//             <span style={{ fontSize:'18px'}}>AI Writing Assistant</span>
//             <Box sx={{ display: 'flex', gap: '5px' }}>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleCreateSession}
//                 sx={{ fontSize: '12px', padding: '2px 6px' }}
//               >
//                 Create New Chat
//               </Button>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleFetchChatHistory}
//                 sx={{ fontSize: '12px', padding: '2px 6px' }}
//               >
//                 View Chat History
//               </Button>
//             </Box>
//           </Box>
//           <div
//             style={{
//               border: '2px solid black',
//               borderRadius: '8px',
//               padding: '10px',
//               flex: 1,
//               overflowY: 'auto',
//               backgroundColor: '#FFFFFF',
//               marginBottom: '10px',
//             }}
//           >
//             {sessionResponse && (
//               <Box
//                 sx={{
//                   mt: 1,
//                   p: 1,
//                   backgroundColor: '#f0f0f0',
//                   borderRadius: '4px',
//                   fontSize: '14px',
//                 }}
//               >
//                 {sessionResponse}
//               </Box>
//             )}
//             <iframe
//               ref={iframeRef}
//               src={`https://140.115.126.193/chat/share?shared_id=8f34f200ef5911ef91480242ac120005${sessionId ? `&session_id=${sessionId}` : ''}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`}
//               style={{ width: '100%', height: '100%' }}
//               frameBorder="0"
//               title="Chat Widget"
//             />
//           </div>
//         </Box>

//         {/* 右邊容器：文字編輯器 */}
//         <Box
//           sx={{
//             width: { md: '50%', xs: '100%' },
//             padding: '20px',
//             borderLeft: { md: '1px solid #ccc', xs: 'none' },
//             position: 'relative',
//             height: { md: '600px', sm: '800px', xs: 'auto' },
//             '@media (max-width: 700px)': {
//               width: '100%',
//               padding: '10px',
//               height: '800px',
//               borderLeft: 'none',
//             },
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '50px',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               padding: '0 10px',
//             }}
//           >
//             <Box>
//               <span style={{ fontSize:'18px'}}>
//                 {username && `User: ${username}`}
//                 {activityTitle && ` Class: ${activityTitle}`}
//                 {groupName && ` Topic: ${groupName}`}
//               </span>
//             </Box>
//             <Button
//               variant="contained"
//               size="small"
//               onClick={handleOpenNoteDialog}
//               sx={{
//                 fontSize: '12px',
//                 padding: '2px 6px',
//                 backgroundColor: '#1976d2',
//                 color: '#ffffff',
//                 '&:hover': {
//                   backgroundColor: '#1565c0',
//                 },
//               }}
//             >
//               Notes Area
//             </Button>
//           </Box>
//           <Box sx={{ height: 'calc(100% - 110px)' }}>
//             <FroalaEditor
//               tag='textarea'
//               config={config}
//               model={editorContent}
//               onModelChange={(newContent) => setEditorContent(newContent)}
//               style={{ height: '100%' }}
//             />
//           </Box>
//           {/* 按鈕容器：移動到寫作區右下方 */}
//           <Box
//             sx={{
//               position: 'absolute',
//               bottom: '20px',
//               right: '20px',
//               display: 'flex',
//               gap: '10px',
//               zIndex: 10,
//               '@media (max-width: 600px)': {
//                 position: 'relative',
//                 bottom: 0,
//                 right: '0',
//                 width: '100%',
//                 justifyContent: 'center',
//                 marginTop: '10px',
//                 flexWrap: 'wrap',
//               },
//             }}
//           >
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={handleTempSave}
//             >
//               Temporary
//             </Button>
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={() => setOpenConfirmSubmitDialog(true)}
//               disabled={isSubmitDisabled}
//             >
//               Submit Upload
//             </Button>
//           </Box>
//         </Box>
//       </Box>

//       {/* 提交確認對話框 */}
//       <Dialog open={openConfirmSubmitDialog} onClose={() => setOpenConfirmSubmitDialog(false)}>
//         <DialogTitle>確認繳交</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             確定要繳交嗎，繳交後無法再修改內容？
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenConfirmSubmitDialog(false)} color="primary">
//             取消
//           </Button>
//           <Button onClick={handleConfirmSubmit} color="primary" autoFocus>
//             確認
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openReminderDialog} onClose={handleCloseReminderDialog}>
//         <DialogTitle>Notification</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Please discuss with the Writing Assistant before starting to write!
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseReminderDialog} color="primary">
//             OK!
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openTempSaveDialog} onClose={handleCloseTempSaveDialog}>
//         <DialogTitle>Tip</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Temporary save successful!
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseTempSaveDialog} color="primary">
//             OK
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openNoteDialog}
//         onClose={handleCloseNoteDialog}
//         sx={{
//           '& .MuiDialog-paper': {
//             width: '500px',
//             height: '500px',
//             maxWidth: '90vw',
//             '@media (max-width: 600px)': {
//               width: '90vw',
//               height: '80vh',
//             },
//           },
//         }}
//       >
//         <DialogTitle>Notes Area</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="記錄您的筆記"
//             value={noteContent}
//             onChange={handleNoteChange}
//             multiline
//             rows={15}
//             fullWidth
//             variant="outlined"
//             sx={{ height: '90%' }}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseNoteDialog} color="primary">
//             Save and Close
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openHistoryDialog}
//         onClose={handleCloseHistoryDialog}
//         sx={{
//           '& .MuiDialog-paper': {
//             width: '500px',
//             maxHeight: '500px',
//             maxWidth: '90vw',
//             '@media (max-width: 600px)': {
//               width: '90vw',
//               maxHeight: '80vh',
//             },
//           },
//         }}
//       >
//         <DialogTitle>Chat History</DialogTitle>
//         <DialogContent>
//           {chatHistory.length === 0 ? (
//             <DialogContentText>No chat history available</DialogContentText>
//           ) : (
//             <List>
//               {chatHistory.map((session) => (
//                 <ListItem key={session.id}>
//                   <ListItemText
//                     primary={`會話 ID: ${session.id}`}
//                     secondary={
//                       <>
//                         <div>Creation Time: {formatDateTime(session.created_at)}</div>
//                         {session.messages && session.messages.length > 0 ? (
//                           <div>
//                             Chat Content:
//                             <List dense>
//                               {session.messages.map((msg, index) => (
//                                 <ListItem key={index}>
//                                   <ListItemText
//                                     primary={`${msg.role}: ${msg.content}`}
//                                     secondary={`時間: ${formatDateTime(msg.created_at)}`}
//                                   />
//                                 </ListItem>
//                               ))}
//                             </List>
//                           </div>
//                         ) : (
//                           <div>No chat content</div>
//                         )}
//                       </>
//                     }
//                   />
//                 </ListItem>
//               ))}
//             </List>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseHistoryDialog} color="primary">
//             Close
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default WritingArea;



// import React, { useState, useEffect, useRef } from 'react';
// import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, List, ListItem, ListItemText } from '@mui/material';
// import { Box } from '@mui/system';
// import FroalaEditor from 'react-froala-wysiwyg';
// import 'froala-editor/js/plugins.pkgd.min.js';
// import 'froala-editor/css/froala_editor.pkgd.min.css';
// import 'froala-editor/css/froala_style.min.css';
// import axios from 'axios';
// import Navbar from "../components/Navbar_Student";

// // 用於 RAGFlow API 的 axios 實例
// const agentAxios = axios.create({
//   baseURL: 'https://140.115.126.193',
// });

// // 用於與本地後端交互的 axios 實例
// const apiAxios = axios.create({
//   baseURL: 'http://localhost:4000',
// });

// apiAxios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const WritingArea = () => {
//   const [editorContent, setEditorContent] = useState('');
//   const [openReminderDialog, setOpenReminderDialog] = useState(false);
//   const [openTempSaveDialog, setOpenTempSaveDialog] = useState(false);
//   const [openNoteDialog, setOpenNoteDialog] = useState(false);
//   const [noteContent, setNoteContent] = useState('');
//   const [sessionId, setSessionId] = useState('');
//   const [lastCreatedSessionId, setLastCreatedSessionId] = useState('');
//   const [sessionResponse, setSessionResponse] = useState('');
//   const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [currentMessages, setCurrentMessages] = useState([]);
//   const [activityTitle, setActivityTitle] = useState('');
//   const [groupName, setGroupName] = useState('');
//   const [username, setUsername] = useState('');
//   const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
//   const [openConfirmSubmitDialog, setOpenConfirmSubmitDialog] = useState(false);
//   const iframeRef = useRef(null);

//   // Load activity title, group name, username, and fetch essay and note content from Notion
//   useEffect(() => {
//     const savedActivityTitle = localStorage.getItem('activityTitle');
//     if (savedActivityTitle) {
//       setActivityTitle(savedActivityTitle);
//     }

//     const savedGroupName = localStorage.getItem('groupName');
//     if (savedGroupName) {
//       setGroupName(savedGroupName);
//     }

//     const savedUsername = localStorage.getItem('name');
//     if (savedUsername && savedActivityTitle && savedGroupName) {
//       setUsername(savedUsername);

//       const fetchEssayContent = async () => {
//         try {
//           const response = await apiAxios.get(`/api/get-essay/${encodeURIComponent(savedUsername)}`, {
//             params: { className: savedActivityTitle, theme: savedGroupName },
//           });
//           if (response.data.success) {
//             setEditorContent(response.data.data.essayContent || '');
//             setNoteContent(response.data.data.noteContent || ''); // 載入筆記區內容
//           } else {
//             console.warn('未找到符合學生姓名、班級和主題的議論文內容，使用空白內容');
//             setEditorContent('');
//             setNoteContent('');
//           }
//         } catch (error) {
//           console.error('從 Notion 獲取議論文內容失敗:', error);
//           setEditorContent('');
//           setNoteContent('');
//         }
//       };

//       fetchEssayContent();
//     }

//     const savedNote = localStorage.getItem('noteData');
//     if (savedNote) {
//       setNoteContent(savedNote);
//     }

//     setOpenReminderDialog(true);
//   }, []);

//   useEffect(() => {
//     const handleMessage = (event) => {
//       if (event.origin !== 'https://140.115.126.193') return;
//       const { type, content } = event.data;
//       if (type === 'agentResponse') {
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       }
//     };

//     window.addEventListener('message', handleMessage);
//     return () => window.removeEventListener('message', handleMessage);
//   }, []);

//   const handleCreateSession = async () => {
//     if (sessionId) {
//       const currentSession = chatHistory.find((session) => session.id === sessionId) || {
//         id: sessionId,
//         created_at: new Date().toISOString(),
//       };
//       setChatHistory([
//         ...chatHistory.filter((session) => session.id !== sessionId),
//         { ...currentSession, messages: currentMessages || [] },
//       ]);
//     }

//     setCurrentMessages([]);

//     try {
//       const res = await agentAxios.post(
//         '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//         {},
//         {
//           headers: {
//             'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (res.data.code === 0) {
//         const newSessionId = res.data.data?.id || '未知 ID';
//         setSessionId(newSessionId);
//         setLastCreatedSessionId(newSessionId);
//         setSessionResponse(`✅ 成功創建聊天會話：${newSessionId}`);
//         if (iframeRef.current) {
//           iframeRef.current.src = `https://140.115.126.193/chat/share?shared_id=8f34f200ef5911ef91480242ac120005&session_id=${newSessionId}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`;
//         }
//       } else {
//         setSessionResponse(`❌ 創建失敗：${res.data.message}`);
//       }
//     } catch (error) {
//       if (error.message.includes('Token')) {
//         setSessionResponse('❌ Token 無效，請重新登錄或聯繫管理員！');
//       } else if (error.message.includes('fetch')) {
//         setSessionResponse('❌ 網絡錯誤，請檢查伺服器連線或 SSL 證書！');
//       } else {
//         setSessionResponse(`❌ 錯誤：${error.message}`);
//       }
//     }
//   };

//   const handleFetchChatHistory = async () => {
//     try {
//       const res = await agentAxios.get(
//         '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//         {
//           params: {
//             page: 1,
//             page_size: 100,
//             orderby: 'create_time',
//             desc: true,
//           },
//           headers: {
//             'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (res.data.code === 0) {
//         const newSessions = res.data.data || [];
//         const updatedHistory = [...chatHistory];
//         newSessions.forEach((session) => {
//           const existingSessionIndex = updatedHistory.findIndex((s) => s.id === session.id);
//           if (existingSessionIndex !== -1) {
//             updatedHistory[existingSessionIndex] = {
//               ...updatedHistory[existingSessionIndex],
//               create_time: session.create_time,
//             };
//           } else {
//             updatedHistory.push({ ...session, messages: [] });
//           }
//         });
//         setChatHistory(updatedHistory);
//         setOpenHistoryDialog(true);
//       } else {
//         alert(`❌ 獲取聊天歷史失敗：${res.data.message}`);
//       }
//     } catch (error) {
//       alert(`❌ 錯誤：${error.message}`);
//     }
//   };

//   const formatDateTime = (isoString) => {
//     const date = new Date(isoString);
//     return date.toLocaleString('zh-TW', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     });
//   };

//   const handleSubmit = async () => {
//     try {
//       const response = await apiAxios.post('/api/submit-to-notion', {
//         studentName: username || '未命名使用者',
//         theme: groupName || '未指定主題',
//         essayContent: editorContent || '無內容',
//         className: activityTitle || '未指定班級',
//         noteContent: noteContent || '', // 包含筆記區內容
//       });

//       if (response.data.success) {
//         alert('繳交上傳成功！');
//         setIsSubmitDisabled(true);
//       } else {
//         alert(`繳交上傳失敗：${response.data.message}`);
//       }
//     } catch (error) {
//       console.error('發送到 Notion 時出錯:', error);
//       const errorMessage = error.response?.data?.message || error.message || '未知錯誤';
//       alert(`繳交上傳失敗：${errorMessage}`);
//     }
//   };

//   const handleConfirmSubmit = () => {
//     setOpenConfirmSubmitDialog(false);
//     handleSubmit();
//   };

//   const handleTempSave = () => {
//     setOpenTempSaveDialog(true);
//   };

//   const handleUpdateNote = async () => {
//     try {
//       const response = await apiAxios.patch('/api/update-note', {
//         studentName: username || '未命名使用者',
//         className: activityTitle || '未指定班級',
//         theme: groupName || '未指定主題',
//         noteContent: noteContent || '',
//       });

//       if (response.data.success) {
//         console.log('筆記區內容已更新到 Notion');
//       } else {
//         console.warn('更新筆記區內容失敗:', response.data.message);
//       }
//     } catch (error) {
//       console.error('更新筆記區內容時出錯:', error);
//     }
//   };

//   const config = {
//     placeholderText: '開始編輯...',
//     charCounterCount: false,
//     toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'fontFamily', 'backColor',
//             'align', 'orderedList', 'unorderedList', 'insertImage', 'insertTable', 'link', 'undo', 'redo', 
//             'clearFormatting', 'fullscreen', 'html', 'insertHR', 'specialCharacters'],
//   };

//   const handleCloseReminderDialog = () => {
//     setOpenReminderDialog(false);
//   };

//   const handleCloseTempSaveDialog = () => {
//     setOpenTempSaveDialog(false);
//   };

//   const handleOpenNoteDialog = () => {
//     setOpenNoteDialog(true);
//   };

//   const handleCloseNoteDialog = () => {
//     localStorage.setItem('noteData', noteContent);
//     handleUpdateNote(); // 儲存筆記時更新 Notion
//     setOpenNoteDialog(false);
//   };

//   const handleCloseHistoryDialog = () => {
//     setOpenHistoryDialog(false);
//   };

//   const handleNoteChange = (e) => {
//     setNoteContent(e.target.value);
//   };

//   return (
//     <div>
//       <Navbar />
//       <Box
//         sx={{
//           display: 'flex',
//           flexDirection: { xs: 'column', md: 'row' },
//           minHeight: 'calc(100vh - 120px)',
//           padding: '10px',
//           gap: '10px',
//         }}
//       >
//         {/* 左邊容器：聊天室 */}
//         <Box
//           sx={{
//             width: { md: '50%', xs: '100%' },
//             padding: '5px',
//             borderRight: { md: '1px solid #ccc', xs: 'none' },
//             display: 'flex',
//             flexDirection: 'column',
//             height: { md: '600px', sm: '800px', xs: 'auto' },
//             '@media (max-width: 700px)': {
//               height: '800px',
//             },
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '50px',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               padding: '0 10px',
//             }}
//           >
//             <span style={{ fontSize:'18px'}}>AI Writing Assistant</span>
//             <Box sx={{ display: 'flex', gap: '5px' }}>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleCreateSession}
//                 sx={{ fontSize: '12px', padding: '2px 6px' }}
//               >
//                 Create New Chat
//               </Button>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleFetchChatHistory}
//                 sx={{ fontSize: '12px', padding: '2px 6px' }}
//               >
//                 View Chat History
//               </Button>
//             </Box>
//           </Box>
//           <div
//             style={{
//               border: '2px solid black',
//               borderRadius: '8px',
//               padding: '10px',
//               flex: 1,
//               overflowY: 'auto',
//               backgroundColor: '#FFFFFF',
//               marginBottom: '10px',
//             }}
//           >
//             {sessionResponse && (
//               <Box
//                 sx={{
//                   mt: 1,
//                   p: 1,
//                   backgroundColor: '#f0f0f0',
//                   borderRadius: '4px',
//                   fontSize: '14px',
//                 }}
//               >
//                 {sessionResponse}
//               </Box>
//             )}
//             <iframe
//               ref={iframeRef}
//               src={`https://140.115.126.193/chat/share?shared_id=8f34f200ef5911ef91480242ac120005${sessionId ? `&session_id=${sessionId}` : ''}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`}
//               style={{ width: '100%', height: '100%' }}
//               frameBorder="0"
//               title="Chat Widget"
//             />
//           </div>
//         </Box>

//         {/* 右邊容器：文字編輯器 */}
//         <Box
//           sx={{
//             width: { md: '50%', xs: '100%' },
//             padding: '20px',
//             borderLeft: { md: '1px solid #ccc', xs: 'none' },
//             position: 'relative',
//             height: { md: '600px', sm: '800px', xs: 'auto' },
//             '@media (max-width: 700px)': {
//               width: '100%',
//               padding: '10px',
//               height: '800px',
//               borderLeft: 'none',
//             },
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '50px',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               padding: '0 10px',
//             }}
//           >
//             <Box>
//               <span style={{ fontSize:'18px'}}>
//                 {username && `User: ${username}`}
//                 {activityTitle && ` Class: ${activityTitle}`}
//                 {groupName && ` Topic: ${groupName}`}
//               </span>
//             </Box>
//             <Button
//               variant="contained"
//               size="small"
//               onClick={handleOpenNoteDialog}
//               sx={{
//                 fontSize: '12px',
//                 padding: '2px 6px',
//                 backgroundColor: '#1976d2',
//                 color: '#ffffff',
//                 '&:hover': {
//                   backgroundColor: '#1565c0',
//                 },
//               }}
//             >
//               Notes Area
//             </Button>
//           </Box>
//           <Box sx={{ height: 'calc(100% - 110px)' }}>
//             <FroalaEditor
//               tag='textarea'
//               config={config}
//               model={editorContent}
//               onModelChange={(newContent) => setEditorContent(newContent)}
//               style={{ height: '100%' }}
//             />
//           </Box>
//           {/* 按鈕容器：移動到寫作區右下方 */}
//           <Box
//             sx={{
//               position: 'absolute',
//               bottom: '20px',
//               right: '20px',
//               display: 'flex',
//               gap: '10px',
//               zIndex: 10,
//               '@media (max-width: 600px)': {
//                 position: 'relative',
//                 bottom: 0,
//                 right: '0',
//                 width: '100%',
//                 justifyContent: 'center',
//                 marginTop: '10px',
//                 flexWrap: 'wrap',
//               },
//             }}
//           >
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={handleTempSave}
//             >
//               Temporary
//             </Button>
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={() => setOpenConfirmSubmitDialog(true)}
//               disabled={isSubmitDisabled}
//             >
//               Submit Upload
//             </Button>
//           </Box>
//         </Box>
//       </Box>

//       {/* 提交確認對話框 */}
//       <Dialog open={openConfirmSubmitDialog} onClose={() => setOpenConfirmSubmitDialog(false)}>
//         <DialogTitle>確認繳交</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             確定要繳交嗎，繳交後無法再修改內容？
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenConfirmSubmitDialog(false)} color="primary">
//             取消
//           </Button>
//           <Button onClick={handleConfirmSubmit} color="primary" autoFocus>
//             確認
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openReminderDialog} onClose={handleCloseReminderDialog}>
//         <DialogTitle>Notification</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Please discuss with the Writing Assistant before starting to write!
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseReminderDialog} color="primary">
//             OK!
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openTempSaveDialog} onClose={handleCloseTempSaveDialog}>
//         <DialogTitle>Tip</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Temporary save successful!
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseTempSaveDialog} color="primary">
//             OK
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openNoteDialog}
//         onClose={handleCloseNoteDialog}
//         sx={{
//           '& .MuiDialog-paper': {
//             width: '500px',
//             height: '500px',
//             maxWidth: '90vw',
//             '@media (max-width: 600px)': {
//               width: '90vw',
//               height: '80vh',
//             },
//           },
//         }}
//       >
//         <DialogTitle>Notes Area</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="記錄您的筆記"
//             value={noteContent}
//             onChange={handleNoteChange}
//             multiline
//             rows={15}
//             fullWidth
//             variant="outlined"
//             sx={{ height: '90%' }}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseNoteDialog} color="primary">
//             Save and Close
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openHistoryDialog}
//         onClose={handleCloseHistoryDialog}
//         sx={{
//           '& .MuiDialog-paper': {
//             width: '500px',
//             maxHeight: '500px',
//             maxWidth: '90vw',
//             '@media (max-width: 600px)': {
//               width: '90vw',
//               maxHeight: '80vh',
//             },
//           },
//         }}
//       >
//         <DialogTitle>Chat History</DialogTitle>
//         <DialogContent>
//           {chatHistory.length === 0 ? (
//             <DialogContentText>No chat history available</DialogContentText>
//           ) : (
//             <List>
//               {chatHistory.map((session) => (
//                 <ListItem key={session.id}>
//                   <ListItemText
//                     primary={`會話 ID: ${session.id}`}
//                     secondary={
//                       <>
//                         <div>Creation Time: {formatDateTime(session.created_at)}</div>
//                         {session.messages && session.messages.length > 0 ? (
//                           <div>
//                             Chat Content:
//                             <List dense>
//                               {session.messages.map((msg, index) => (
//                                 <ListItem key={index}>
//                                   <ListItemText
//                                     primary={`${msg.role}: ${msg.content}`}
//                                     secondary={`時間: ${formatDateTime(msg.created_at)}`}
//                                   />
//                                 </ListItem>
//                               ))}
//                             </List>
//                           </div>
//                         ) : (
//                           <div>No chat content</div>
//                         )}
//                       </>
//                     }
//                   />
//                 </ListItem>
//               ))}
//             </List>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseHistoryDialog} color="primary">
//             Close
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default WritingArea;










// import React, { useState, useEffect, useRef } from 'react';
// import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, List, ListItem, ListItemText } from '@mui/material';
// import { Box } from '@mui/system';
// import FroalaEditor from 'react-froala-wysiwyg';
// import 'froala-editor/js/plugins.pkgd.min.js';
// import 'froala-editor/css/froala_editor.pkgd.min.css';
// import 'froala-editor/css/froala_style.min.css';
// import axios from 'axios';
// import Navbar from "../components/Navbar_Student";

// // 用於 RAGFlow API 的 axios 實例
// const agentAxios = axios.create({
//   baseURL: 'https://ragflow.lazyinwork.com',
// });

// // 用於與本地後端交互的 axios 實例
// // const apiAxios = axios.create({
// //   baseURL: 'http://localhost:4000',
// // });

// const apiAxios = axios.create({
//   baseURL: 'http://140.115.126.27:4000',
// });


// apiAxios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const WritingArea = () => {
//   const [editorContent, setEditorContent] = useState('');
//   const [openReminderDialog, setOpenReminderDialog] = useState(false);
//   const [openTempSaveDialog, setOpenTempSaveDialog] = useState(false);
//   const [openNoteDialog, setOpenNoteDialog] = useState(false);
//   const [noteContent, setNoteContent] = useState('');
//   const [sessionId, setSessionId] = useState('');
//   const [lastCreatedSessionId, setLastCreatedSessionId] = useState('');
//   const [sessionResponse, setSessionResponse] = useState('');
//   const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [currentMessages, setCurrentMessages] = useState([]);
//   const [activityTitle, setActivityTitle] = useState('');
//   const [groupName, setGroupName] = useState('');
//   const [username, setUsername] = useState('');
//   const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
//   const [openConfirmSubmitDialog, setOpenConfirmSubmitDialog] = useState(false);
//   const iframeRef = useRef(null);

//   // Load activity title, group name, username, and fetch essay and note content from Notion
//   useEffect(() => {
//     const savedActivityTitle = localStorage.getItem('activityTitle');
//     if (savedActivityTitle) {
//       setActivityTitle(savedActivityTitle);
//     }

//     const savedGroupName = localStorage.getItem('groupName');
//     if (savedGroupName) {
//       setGroupName(savedGroupName);
//     }

//     const savedUsername = localStorage.getItem('name');
//     if (savedUsername && savedActivityTitle && savedGroupName) {
//       setUsername(savedUsername);

//       const fetchEssayContent = async () => {
//         try {
//           const response = await apiAxios.get(`/api/get-essay/${encodeURIComponent(savedUsername)}`, {
//             params: { className: savedActivityTitle, theme: savedGroupName },
//           });
//           if (response.data.success) {
//             setEditorContent(response.data.data.essayContent || '');
//             setNoteContent(response.data.data.noteContent || ''); // 載入筆記區內容
//           } else {
//             console.warn('未找到符合學生姓名、班級和主題的議論文內容，使用空白內容');
//             setEditorContent('');
//             setNoteContent('');
//           }
//         } catch (error) {
//           console.error('從 Notion 獲取議論文內容失敗:', error);
//           setEditorContent('');
//           setNoteContent('');
//         }
//       };

//       fetchEssayContent();
//     }

//     const savedNote = localStorage.getItem('noteData');
//     if (savedNote) {
//       setNoteContent(savedNote);
//     }

//     setOpenReminderDialog(true);
//   }, []);

//   useEffect(() => {
//     const handleMessage = (event) => {
//       if (event.origin !== 'https://ragflow.lazyinwork.com') return;
//       const { type, content } = event.data;
//       if (type === 'agentResponse') {
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       }
//     };

//     window.addEventListener('message', handleMessage);
//     return () => window.removeEventListener('message', handleMessage);
//   }, []);

//   const handleCreateSession = async () => {
//     if (sessionId) {
//       const currentSession = chatHistory.find((session) => session.id === sessionId) || {
//         id: sessionId,
//         created_at: new Date().toISOString(),
//       };
//       setChatHistory([
//         ...chatHistory.filter((session) => session.id !== sessionId),
//         { ...currentSession, messages: currentMessages || [] },
//       ]);
//     }

//     setCurrentMessages([]);

//     try {
//       const res = await agentAxios.post(
//         '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//         {},
//         {
//           headers: {
//             'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (res.data.code === 0) {
//         const newSessionId = res.data.data?.id || '未知 ID';
//         setSessionId(newSessionId);
//         setLastCreatedSessionId(newSessionId);
//         setSessionResponse(`✅ 成功創建聊天會話：${newSessionId}`);
//         if (iframeRef.current) {
//           iframeRef.current.src = `https://ragflow.lazyinwork.com/chat/share?shared_id=8f34f200ef5911ef91480242ac120005&session_id=${newSessionId}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`;
//         }
//       } else {
//         setSessionResponse(`❌ 創建失敗：${res.data.message}`);
//       }
//     } catch (error) {
//       if (error.message.includes('Token')) {
//         setSessionResponse('❌ Token 無效，請重新登錄或聯繫管理員！');
//       } else if (error.message.includes('fetch')) {
//         setSessionResponse('❌ 網絡錯誤，請檢查伺服器連線或 SSL 證書！');
//       } else {
//         setSessionResponse(`❌ 錯誤：${error.message}`);
//       }
//     }
//   };

//   const handleFetchChatHistory = async () => {
//     try {
//       const res = await agentAxios.get(
//         '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//         {
//           params: {
//             page: 1,
//             page_size: 100,
//             orderby: 'create_time',
//             desc: true,
//           },
//           headers: {
//             'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (res.data.code === 0) {
//         const newSessions = res.data.data || [];
//         const updatedHistory = [...chatHistory];
//         newSessions.forEach((session) => {
//           const existingSessionIndex = updatedHistory.findIndex((s) => s.id === session.id);
//           if (existingSessionIndex !== -1) {
//             updatedHistory[existingSessionIndex] = {
//               ...updatedHistory[existingSessionIndex],
//               create_time: session.create_time,
//             };
//           } else {
//             updatedHistory.push({ ...session, messages: [] });
//           }
//         });
//         setChatHistory(updatedHistory);
//         setOpenHistoryDialog(true);
//       } else {
//         alert(`❌ 獲取聊天歷史失敗：${res.data.message}`);
//       }
//     } catch (error) {
//       alert(`❌ 錯誤：${error.message}`);
//     }
//   };

//   const formatDateTime = (isoString) => {
//     const date = new Date(isoString);
//     return date.toLocaleString('zh-TW', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     });
//   };

//   const handleSubmit = async () => {
//     try {
//       const response = await apiAxios.post('/api/submit-to-notion', {
//         studentName: username || '未命名使用者',
//         theme: groupName || '未指定主題',
//         essayContent: editorContent || '無內容',
//         className: activityTitle || '未指定班級',
//         noteContent: noteContent || '', // 包含筆記區內容
//       });

//       if (response.data.success) {
//         alert('繳交上傳成功！');
//         setIsSubmitDisabled(true);
//       } else {
//         alert(`繳交上傳失敗：${response.data.message}`);
//       }
//     } catch (error) {
//       console.error('發送到 Notion 時出錯:', error);
//       const errorMessage = error.response?.data?.message || error.message || '未知錯誤';
//       alert(`繳交上傳失敗：${errorMessage}`);
//     }
//   };

//   const handleConfirmSubmit = () => {
//     setOpenConfirmSubmitDialog(false);
//     handleSubmit();
//   };

//   const handleTempSave = () => {
//     setOpenTempSaveDialog(true);
//   };

//   const handleUpdateNote = async () => {
//     try {
//       const response = await apiAxios.patch('/api/update-note', {
//         studentName: username || '未命名使用者',
//         className: activityTitle || '未指定班級',
//         theme: groupName || '未指定主題',
//         noteContent: noteContent || '',
//         essayContent: editorContent || '', // 包含寫作區內容
//       });

//       if (response.data.success) {
//         console.log('筆記區和寫作區內容已更新到 Notion');
//       } else {
//         console.warn('更新筆記區和寫作區內容失敗:', response.data.message);
//       }
//     } catch (error) {
//       console.error('更新筆記區和寫作區內容時出錯:', error);
//     }
//   };

//   const config = {
//     placeholderText: '開始編輯...',
//     charCounterCount: false,
//     toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'fontFamily', 'backColor',
//             'align', 'orderedList', 'unorderedList', 'insertImage', 'insertTable', 'link', 'undo', 'redo', 
//             'clearFormatting', 'fullscreen', 'html', 'insertHR', 'specialCharacters'],
//   };

//   const handleCloseReminderDialog = () => {
//     setOpenReminderDialog(false);
//   };

//   const handleCloseTempSaveDialog = () => {
//     setOpenTempSaveDialog(false);
//   };

//   const handleOpenNoteDialog = () => {
//     setOpenNoteDialog(true);
//   };

//   const handleCloseNoteDialog = () => {
//     localStorage.setItem('noteData', noteContent);
//     handleUpdateNote(); // 儲存筆記時更新 Notion，包含寫作區和筆記區內容
//     setOpenNoteDialog(false);
//   };

//   const handleCloseHistoryDialog = () => {
//     setOpenHistoryDialog(false);
//   };

//   const handleNoteChange = (e) => {
//     setNoteContent(e.target.value);
//   };

//   return (
//     <div>
//       <Navbar />
//       <Box
//         sx={{
//           display: 'flex',
//           flexDirection: { xs: 'column', md: 'row' },
//           minHeight: 'calc(100vh - 120px)',
//           padding: '10px',
//           gap: '10px',
//         }}
//       >
//         {/* 左邊容器：聊天室 */}
//         <Box
//           sx={{
//             width: { md: '50%', xs: '100%' },
//             padding: '5px',
//             borderRight: { md: '1px solid #ccc', xs: 'none' },
//             display: 'flex',
//             flexDirection: 'column',
//             height: { md: '600px', sm: '800px', xs: 'auto' },
//             '@media (max-width: 700px)': {
//               height: '800px',
//             },
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '50px',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               padding: '0 10px',
//             }}
//           >
//             <span style={{ fontSize:'18px'}}>AI Writing Assistant</span>
//             <Box sx={{ display: 'flex', gap: '5px' }}>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleCreateSession}
//                 sx={{ fontSize: '12px', padding: '2px 6px' }}
//               >
//                 Create New Chat
//               </Button>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleFetchChatHistory}
//                 sx={{ fontSize: '12px', padding: '2px 6px' }}
//               >
//                 View Chat History
//               </Button>
//             </Box>
//           </Box>
//           <div
//             style={{
//               border: '2px solid black',
//               borderRadius: '8px',
//               padding: '10px',
//               flex: 1,
//               overflowY: 'auto',
//               backgroundColor: '#FFFFFF',
//               marginBottom: '10px',
//             }}
//           >
//             {sessionResponse && (
//               <Box
//                 sx={{
//                   mt: 1,
//                   p: 1,
//                   backgroundColor: '#f0f0f0',
//                   borderRadius: '4px',
//                   fontSize: '14px',
//                 }}
//               >
//                 {sessionResponse}
//               </Box>
//             )}
//             <iframe
//               ref={iframeRef}
//               src={`https://ragflow.lazyinwork.com/chat/share?shared_id=8f34f200ef5911ef91480242ac120005${sessionId ? `&session_id=${sessionId}` : ''}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`}
//               style={{ width: '100%', height: '100%' }}
//               frameBorder="0"
//               title="Chat Widget"
//             />
//           </div>
//         </Box>

//         {/* 右邊容器：文字編輯器 */}
//         <Box
//           sx={{
//             width: { md: '50%', xs: '100%' },
//             padding: '20px',
//             borderLeft: { md: '1px solid #ccc', xs: 'none' },
//             position: 'relative',
//             height: { md: '600px', sm: '800px', xs: 'auto' },
//             '@media (max-width: 700px)': {
//               width: '100%',
//               padding: '10px',
//               height: '800px',
//               borderLeft: 'none',
//             },
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '50px',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               padding: '0 10px',
//             }}
//           >
//             <Box>
//               <span style={{ fontSize:'18px'}}>
//                 {username && `User: ${username}`}
//                 {activityTitle && ` Class: ${activityTitle}`}
//                 {groupName && ` Topic: ${groupName}`}
//               </span>
//             </Box>
//             <Button
//               variant="contained"
//               size="small"
//               onClick={handleOpenNoteDialog}
//               sx={{
//                 fontSize: '12px',
//                 padding: '2px 6px',
//                 backgroundColor: '#1976d2',
//                 color: '#ffffff',
//                 '&:hover': {
//                   backgroundColor: '#1565c0',
//                 },
//               }}
//             >
//               Notes Area
//             </Button>
//           </Box>
//           <Box sx={{ height: 'calc(100% - 110px)' }}>
//             <FroalaEditor
//               tag='textarea'
//               config={config}
//               model={editorContent}
//               onModelChange={(newContent) => setEditorContent(newContent)}
//               style={{ height: '100%' }}
//             />
//           </Box>
//           {/* 按鈕容器：移動到寫作區右下方 */}
//           <Box
//             sx={{
//               position: 'absolute',
//               bottom: '20px',
//               right: '20px',
//               display: 'flex',
//               gap: '10px',
//               zIndex: 10,
//               '@media (max-width: 600px)': {
//                 position: 'relative',
//                 bottom: 0,
//                 right: '0',
//                 width: '100%',
//                 justifyContent: 'center',
//                 marginTop: '10px',
//                 flexWrap: 'wrap',
//               },
//             }}
//           >
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={handleTempSave}
//             >
//               Temporary
//             </Button>
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={() => setOpenConfirmSubmitDialog(true)}
//               disabled={isSubmitDisabled}
//             >
//               Submit Upload
//             </Button>
//           </Box>
//         </Box>
//       </Box>

//       {/* 提交確認對話框 */}
//       <Dialog open={openConfirmSubmitDialog} onClose={() => setOpenConfirmSubmitDialog(false)}>
//         <DialogTitle>Confirm Submission</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Are you sure you want to submit? You won’t be able to edit the content after submission.
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenConfirmSubmitDialog(false)} color="primary">
//             Close
//           </Button>
//           <Button onClick={handleConfirmSubmit} color="primary" autoFocus>
//             OK
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openReminderDialog} onClose={handleCloseReminderDialog}>
//         <DialogTitle>Notification</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Please discuss with the AI Writing Genie before starting to write!
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseReminderDialog} color="primary">
//             OK!
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openTempSaveDialog} onClose={handleCloseTempSaveDialog}>
//         <DialogTitle>Tip</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Temporary save successful!
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseTempSaveDialog} color="primary">
//             OK
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openNoteDialog}
//         onClose={handleCloseNoteDialog}
//         sx={{
//           '& .MuiDialog-paper': {
//             width: '500px',
//             height: '500px',
//             maxWidth: '90vw',
//             '@media (max-width: 600px)': {
//               width: '90vw',
//               height: '80vh',
//             },
//           },
//         }}
//       >
//         <DialogTitle>Notes Area</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="記錄您的筆記"
//             value={noteContent}
//             onChange={handleNoteChange}
//             multiline
//             rows={15}
//             fullWidth
//             variant="outlined"
//             sx={{ height: '90%' }}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseNoteDialog} color="primary">
//             Save and Close
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openHistoryDialog}
//         onClose={handleCloseHistoryDialog}
//         sx={{
//           '& .MuiDialog-paper': {
//             width: '500px',
//             maxHeight: '500px',
//             maxWidth: '90vw',
//             '@media (max-width: 600px)': {
//               width: '90vw',
//               maxHeight: '80vh',
//             },
//           },
//         }}
//       >
//         <DialogTitle>Chat History</DialogTitle>
//         <DialogContent>
//           {chatHistory.length === 0 ? (
//             <DialogContentText>No chat history available</DialogContentText>
//           ) : (
//             <List>
//               {chatHistory.map((session) => (
//                 <ListItem key={session.id}>
//                   <ListItemText
//                     primary={`會話 ID: ${session.id}`}
//                     secondary={
//                       <>
//                         <div>Creation Time: {formatDateTime(session.created_at)}</div>
//                         {session.messages && session.messages.length > 0 ? (
//                           <div>
//                             Chat Content:
//                             <List dense>
//                               {session.messages.map((msg, index) => (
//                                 <ListItem key={index}>
//                                   <ListItemText
//                                     primary={`${msg.role}: ${msg.content}`}
//                                     secondary={`時間: ${formatDateTime(msg.created_at)}`}
//                                   />
//                                 </ListItem>
//                               ))}
//                             </List>
//                           </div>
//                         ) : (
//                           <div>No chat content</div>
//                         )}
//                       </>
//                     }
//                   />
//                 </ListItem>
//               ))}
//             </List>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseHistoryDialog} color="primary">
//             Close
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default WritingArea;


// //寫作區超過2000字元做分段處理
// import React, { useState, useEffect, useRef } from 'react';
// import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, List, ListItem, ListItemText } from '@mui/material';
// import { Box } from '@mui/system';
// import FroalaEditor from 'react-froala-wysiwyg';
// import 'froala-editor/js/plugins.pkgd.min.js';
// import 'froala-editor/css/froala_editor.pkgd.min.css';
// import 'froala-editor/css/froala_style.min.css';
// import axios from 'axios';
// import Navbar from "../components/Navbar_Student";

// // 用於 RAGFlow API 的 axios 實例
// const agentAxios = axios.create({
//     baseURL: 'https://ragflow.lazyinwork.com',
// });

// // 用於與後端交互的 axios 實例
// const apiAxios = axios.create({
//     baseURL: 'http://140.115.126.27:4000',
// });

// apiAxios.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// const WritingArea = () => {
//     const [editorContent, setEditorContent] = useState('');
//     const [openReminderDialog, setOpenReminderDialog] = useState(false);
//     const [openTempSaveDialog, setOpenTempSaveDialog] = useState(false);
//     const [openNoteDialog, setOpenNoteDialog] = useState(false);
//     const [noteContent, setNoteContent] = useState('');
//     const [sessionId, setSessionId] = useState('');
//     const [lastCreatedSessionId, setLastCreatedSessionId] = useState('');
//     const [sessionResponse, setSessionResponse] = useState('');
//     const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
//     const [chatHistory, setChatHistory] = useState([]);
//     const [currentMessages, setCurrentMessages] = useState([]);
//     const [activityTitle, setActivityTitle] = useState('');
//     const [groupName, setGroupName] = useState('');
//     const [username, setUsername] = useState('');
//     const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
//     const [openConfirmSubmitDialog, setOpenConfirmSubmitDialog] = useState(false);
//     const iframeRef = useRef(null);

//     // 載入活動標題、組名、用戶名，並從 Notion 獲取議論文和筆記內容
//     useEffect(() => {
//         const savedActivityTitle = localStorage.getItem('activityTitle');
//         if (savedActivityTitle) {
//             setActivityTitle(savedActivityTitle);
//         }

//         const savedGroupName = localStorage.getItem('groupName');
//         if (savedGroupName) {
//             setGroupName(savedGroupName);
//         }

//         const savedUsername = localStorage.getItem('name');
//         if (savedUsername && savedActivityTitle && savedGroupName) {
//             setUsername(savedUsername);

//             const fetchEssayContent = async () => {
//                 try {
//                     const response = await apiAxios.get(`/api/get-essay/${encodeURIComponent(savedUsername)}`, {
//                         params: { className: savedActivityTitle, theme: savedGroupName },
//                     });
//                     if (response.data.success) {
//                         setEditorContent(response.data.data.essayContent || '');
//                         setNoteContent(response.data.data.noteContent || '');
//                     } else {
//                         console.warn('未找到符合學生姓名、班級和主題的議論文內容，使用空白內容');
//                         setEditorContent('');
//                         setNoteContent('');
//                     }
//                 } catch (error) {
//                     console.error('從 Notion 獲取議論文內容失敗:', error);
//                     setEditorContent('');
//                     setNoteContent('');
//                 }
//             };

//             fetchEssayContent();
//         }

//         const savedNote = localStorage.getItem('noteData');
//         if (savedNote) {
//             setNoteContent(savedNote);
//         }

//         setOpenReminderDialog(true);
//     }, []);

//     useEffect(() => {
//         const handleMessage = (event) => {
//             if (event.origin !== 'https://ragflow.lazyinwork.com') return;
//             const { type, content } = event.data;
//             if (type === 'agentResponse') {
//                 setCurrentMessages((prev) => [
//                     ...prev,
//                     { role: 'assistant', content, created_at: new Date().toISOString() },
//                 ]);
//             }
//         };

//         window.addEventListener('message', handleMessage);
//         return () => window.removeEventListener('message', handleMessage);
//     }, []);

//     const handleCreateSession = async () => {
//         if (sessionId) {
//             const currentSession = chatHistory.find((session) => session.id === sessionId) || {
//                 id: sessionId,
//                 created_at: new Date().toISOString(),
//             };
//             setChatHistory([
//                 ...chatHistory.filter((session) => session.id !== sessionId),
//                 { ...currentSession, messages: currentMessages || [] },
//             ]);
//         }

//         setCurrentMessages([]);

//         try {
//             const res = await agentAxios.post(
//                 '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//                 {},
//                 {
//                     headers: {
//                         'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//                         'Content-Type': 'application/json',
//                     },
//                 }
//             );

//             if (res.data.code === 0) {
//                 const newSessionId = res.data.data?.id || '未知 ID';
//                 setSessionId(newSessionId);
//                 setLastCreatedSessionId(newSessionId);
//                 setSessionResponse(`✅ 成功創建聊天會話：${newSessionId}`);
//                 if (iframeRef.current) {
//                     iframeRef.current.src = `https://ragflow.lazyinwork.com/chat/share?shared_id=8f34f200ef5911ef91480242ac120005&session_id=${newSessionId}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`;
//                 }
//             } else {
//                 setSessionResponse(`❌ 創建失敗：${res.data.message}`);
//             }
//         } catch (error) {
//             if (error.message.includes('Token')) {
//                 setSessionResponse('❌ Token 無效，請重新登錄或聯繫管理員！');
//             } else if (error.message.includes('fetch')) {
//                 setSessionResponse('❌ 網絡錯誤，請檢查伺服器連線或 SSL 證書！');
//             } else {
//                 setSessionResponse(`❌ 錯誤：${error.message}`);
//             }
//         }
//     };

//     const handleFetchChatHistory = async () => {
//         try {
//             const res = await agentAxios.get(
//                 '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//                 {
//                     params: {
//                         page: 1,
//                         page_size: 100,
//                         orderby: 'create_time',
//                         desc: true,
//                     },
//                     headers: {
//                         'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//                         'Content-Type': 'application/json',
//                     },
//                 }
//             );

//             if (res.data.code === 0) {
//                 const newSessions = res.data.data || [];
//                 const updatedHistory = [...chatHistory];
//                 newSessions.forEach((session) => {
//                     const existingSessionIndex = updatedHistory.findIndex((s) => s.id === session.id);
//                     if (existingSessionIndex !== -1) {
//                         updatedHistory[existingSessionIndex] = {
//                             ...updatedHistory[existingSessionIndex],
//                             create_time: session.create_time,
//                         };
//                     } else {
//                         updatedHistory.push({ ...session, messages: [] });
//                     }
//                 });
//                 setChatHistory(updatedHistory);
//                 setOpenHistoryDialog(true);
//             } else {
//                 alert(`❌ 獲取聊天歷史失敗：${res.data.message}`);
//             }
//         } catch (error) {
//             alert(`❌ 錯誤：${error.message}`);
//         }
//     };

//     const formatDateTime = (isoString) => {
//         const date = new Date(isoString);
//         return date.toLocaleString('zh-TW', {
//             year: 'numeric',
//             month: '2-digit',
//             day: '2-digit',
//             hour: '2-digit',
//             minute: '2-digit',
//             second: '2-digit',
//         });
//     };

//     const handleSubmit = async () => {
//         // 檢查字數
//         if (editorContent.length > 2000) {
//             alert('議論文內容超過 2000 字元，將自動分段儲存至資料庫');
//         }
//         if (noteContent.length > 2000) {
//             alert('筆記內容超過 2000 字元，將自動分段儲存至資料庫');
//         }

//         try {
//             const response = await apiAxios.post('/api/submit-to-notion', {
//                 studentName: username || '未命名使用者',
//                 theme: groupName || '未指定主題',
//                 essayContent: editorContent || '無內容',
//                 className: activityTitle || '未指定班級',
//                 noteContent: noteContent || '',
//             });

//             if (response.data.success) {
//                 alert('繳交上傳成功！');
//                 setIsSubmitDisabled(true);
//             } else {
//                 alert(`繳交上傳失敗：${response.data.message || '未知錯誤'}`);
//             }
//         } catch (error) {
//             console.error('發送到 Notion 時出錯:', error);
//             const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || '未知錯誤';
//             alert(`繳交上傳失敗：${errorMessage}`);
//         }
//     };

//     const handleConfirmSubmit = () => {
//         setOpenConfirmSubmitDialog(false);
//         handleSubmit();
//     };

//     const handleTempSave = () => {
//         setOpenTempSaveDialog(true);
//     };

//     const handleUpdateNote = async () => {
//         // 檢查字數
//         if (editorContent.length > 2000) {
//             console.log('議論文內容超過 2000 字元，將自動分段儲存');
//         }
//         if (noteContent.length > 2000) {
//             console.log('筆記內容超過 2000 字元，將自動分段儲存');
//         }

//         try {
//             const response = await apiAxios.patch('/api/update-note', {
//                 studentName: username || '未命名使用者',
//                 className: activityTitle || '未指定班級',
//                 theme: groupName || '未指定主題',
//                 noteContent: noteContent || '',
//                 essayContent: editorContent || '',
//             });

//             if (response.data.success) {
//                 console.log('筆記區和寫作區內容已更新到 Notion');
//             } else {
//                 console.warn('更新筆記區和寫作區內容失敗:', response.data.error);
//             }
//         } catch (error) {
//             console.error('更新筆記區和寫作區內容時出錯:', error);
//             const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || '未知錯誤';
//             console.warn(`更新失敗：${errorMessage}`);
//         }
//     };

//     const config = {
//         placeholderText: '開始編輯...',
//         charCounterCount: false,
//         toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'fontFamily', 'backColor',
//             'align', 'orderedList', 'unorderedList', 'insertImage', 'insertTable', 'link', 'undo', 'redo',
//             'clearFormatting', 'fullscreen', 'html', 'insertHR', 'specialCharacters'],
//     };

//     const handleCloseReminderDialog = () => {
//         setOpenReminderDialog(false);
//     };

//     const handleCloseTempSaveDialog = () => {
//         setOpenTempSaveDialog(false);
//     };

//     const handleOpenNoteDialog = () => {
//         setOpenNoteDialog(true);
//     };

//     const handleCloseNoteDialog = () => {
//         localStorage.setItem('noteData', noteContent);
//         handleUpdateNote();
//         setOpenNoteDialog(false);
//     };

//     const handleCloseHistoryDialog = () => {
//         setOpenHistoryDialog(false);
//     };

//     const handleNoteChange = (e) => {
//         setNoteContent(e.target.value);
//     };

//     return (
//         <div>
//             <Navbar />
//             <Box
//                 sx={{
//                     display: 'flex',
//                     flexDirection: { xs: 'column', md: 'row' },
//                     minHeight: 'calc(100vh - 120px)',
//                     padding: '10px',
//                     gap: '10px',
//                 }}
//             >
//                 {/* 左邊容器：聊天室 */}
//                 <Box
//                     sx={{
//                         width: { md: '50%', xs: '100%' },
//                         padding: '5px',
//                         borderRight: { md: '1px solid #ccc', xs: 'none' },
//                         display: 'flex',
//                         flexDirection: 'column',
//                         height: { md: '600px', sm: '800px', xs: 'auto' },
//                         '@media (max-width: 700px)': {
//                             height: '800px',
//                         },
//                     }}
//                 >
//                     <Box
//                         sx={{
//                             width: '100%',
//                             height: '50px',
//                             display: 'flex',
//                             justifyContent: 'space-between',
//                             alignItems: 'center',
//                             backgroundColor: '#B7C5FF',
//                             fontSize: '18px',
//                             fontWeight: 'bold',
//                             padding: '0 10px',
//                         }}
//                     >
//                         <span style={{ fontSize: '18px' }}>AI Writing Assistant</span>
//                         <Box sx={{ display: 'flex', gap: '5px' }}>
//                             <Button
//                                 variant="contained"
//                                 color="primary"
//                                 onClick={handleCreateSession}
//                                 sx={{ fontSize: '12px', padding: '2px 6px' }}
//                             >
//                                 Create New Chat
//                             </Button>
//                             <Button
//                                 variant="contained"
//                                 color="primary"
//                                 onClick={handleFetchChatHistory}
//                                 sx={{ fontSize: '12px', padding: '2px 6px' }}
//                             >
//                                 View Chat History
//                             </Button>
//                         </Box>
//                     </Box>
//                     <div
//                         style={{
//                             border: '2px solid black',
//                             borderRadius: '8px',
//                             padding: '10px',
//                             flex: 1,
//                             overflowY: 'auto',
//                             backgroundColor: '#FFFFFF',
//                             marginBottom: '10px',
//                         }}
//                     >
//                         {sessionResponse && (
//                             <Box
//                                 sx={{
//                                     mt: 1,
//                                     p: 1,
//                                     backgroundColor: '#f0f0f0',
//                                     borderRadius: '4px',
//                                     fontSize: '14px',
//                                 }}
//                             >
//                                 {sessionResponse}
//                             </Box>
//                         )}
//                         <iframe
//                             ref={iframeRef}
//                             src={`https://ragflow.lazyinwork.com/chat/share?shared_id=8f34f200ef5911ef91480242ac120005${sessionId ? `&session_id=${sessionId}` : ''}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`}
//                             style={{ width: '100%', height: '100%' }}
//                             frameBorder="0"
//                             title="Chat Widget"
//                         />
//                     </div>
//                 </Box>

//                 {/* 右邊容器：文字編輯器 */}
//                 <Box
//                     sx={{
//                         width: { md: '50%', xs: '100%' },
//                         padding: '20px',
//                         borderLeft: { md: '1px solid #ccc', xs: 'none' },
//                         position: 'relative',
//                         height: { md: '600px', sm: '800px', xs: 'auto' },
//                         '@media (max-width: 700px)': {
//                             width: '100%',
//                             padding: '10px',
//                             height: '800px',
//                             borderLeft: 'none',
//                         },
//                     }}
//                 >
//                     <Box
//                         sx={{
//                             width: '100%',
//                             height: '50px',
//                             display: 'flex',
//                             justifyContent: 'space-between',
//                             alignItems: 'center',
//                             backgroundColor: '#B7C5FF',
//                             fontSize: '18px',
//                             fontWeight: 'bold',
//                             padding: '0 10px',
//                         }}
//                     >
//                         <Box>
//                             <span style={{ fontSize: '18px' }}>
//                                 {username && `User: ${username}`}
//                                 {activityTitle && ` Class: ${activityTitle}`}
//                                 {groupName && ` Topic: ${groupName}`}
//                             </span>
//                         </Box>
//                         <Button
//                             variant="contained"
//                             size="small"
//                             onClick={handleOpenNoteDialog}
//                             sx={{
//                                 fontSize: '12px',
//                                 padding: '2px 6px',
//                                 backgroundColor: '#1976d2',
//                                 color: '#ffffff',
//                                 '&:hover': {
//                                     backgroundColor: '#1565c0',
//                                 },
//                             }}
//                         >
//                             Notes Area
//                         </Button>
//                     </Box>
//                     <Box sx={{ height: 'calc(100% - 110px)' }}>
//                         <FroalaEditor
//                             tag='textarea'
//                             config={config}
//                             model={editorContent}
//                             onModelChange={(newContent) => setEditorContent(newContent)}
//                             style={{ height: '100%' }}
//                         />
//                     </Box>
//                     {/* 按鈕容器：移動到寫作區右下方 */}
//                     <Box
//                         sx={{
//                             position: 'absolute',
//                             bottom: '20px',
//                             right: '20px',
//                             display: 'flex',
//                             gap: '10px',
//                             zIndex: 10,
//                             '@media (max-width: 600px)': {
//                                 position: 'relative',
//                                 bottom: 0,
//                                 right: '0',
//                                 width: '100%',
//                                 justifyContent: 'center',
//                                 marginTop: '10px',
//                                 flexWrap: 'wrap',
//                             },
//                         }}
//                     >
//                         <Button
//                             variant="contained"
//                             color="secondary"
//                             onClick={handleTempSave}
//                         >
//                             Temporary
//                         </Button>
//                         <Button
//                             variant="contained"
//                             color="secondary"
//                             onClick={() => setOpenConfirmSubmitDialog(true)}
//                             disabled={isSubmitDisabled}
//                         >
//                             Submit Upload
//                         </Button>
//                     </Box>
//                 </Box>
//             </Box>

//             {/* 提交確認對話框 */}
//             <Dialog open={openConfirmSubmitDialog} onClose={() => setOpenConfirmSubmitDialog(false)}>
//                 <DialogTitle>Confirm Submission</DialogTitle>
//                 <DialogContent>
//                     <DialogContentText>
//                         Are you sure you want to submit? You won’t be able to edit the content after submission.
//                     </DialogContentText>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={() => setOpenConfirmSubmitDialog(false)} color="primary">
//                         Close
//                     </Button>
//                     <Button onClick={handleConfirmSubmit} color="primary" autoFocus>
//                         OK
//                     </Button>
//                 </DialogActions>
//             </Dialog>

//             <Dialog open={openReminderDialog} onClose={handleCloseReminderDialog}>
//                 <DialogTitle>Notification</DialogTitle>
//                 <DialogContent>
//                     <DialogContentText>
//                         Please discuss with the AI Writing Genie before starting to write!
//                     </DialogContentText>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleCloseReminderDialog} color="primary">
//                         OK!
//                     </Button>
//                 </DialogActions>
//             </Dialog>

//             <Dialog open={openTempSaveDialog} onClose={handleCloseTempSaveDialog}>
//                 <DialogTitle>Tip</DialogTitle>
//                 <DialogContent>
//                     <DialogContentText>
//                         Temporary save successful!
//                     </DialogContentText>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleCloseTempSaveDialog} color="primary">
//                         OK
//                     </Button>
//                 </DialogActions>
//             </Dialog>

//             <Dialog
//                 open={openNoteDialog}
//                 onClose={handleCloseNoteDialog}
//                 sx={{
//                     '& .MuiDialog-paper': {
//                         width: '500px',
//                         height: '500px',
//                         maxWidth: '90vw',
//                         '@media (max-width: 600px)': {
//                             width: '90vw',
//                             height: '80vh',
//                         },
//                     },
//                 }}
//             >
//                 <DialogTitle>Notes Area</DialogTitle>
//                 <DialogContent>
//                     <TextField
//                         label="記錄您的筆記"
//                         value={noteContent}
//                         onChange={handleNoteChange}
//                         multiline
//                         rows={15}
//                         fullWidth
//                         variant="outlined"
//                         sx={{ height: '90%' }}
//                     />
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleCloseNoteDialog} color="primary">
//                         Save and Close
//                     </Button>
//                 </DialogActions>
//             </Dialog>

//             <Dialog
//                 open={openHistoryDialog}
//                 onClose={handleCloseHistoryDialog}
//                 sx={{
//                     '& .MuiDialog-paper': {
//                         width: '500px',
//                         maxHeight: '500px',
//                         maxWidth: '90vw',
//                         '@media (max-width: 600px)': {
//                             width: '90vw',
//                             maxHeight: '80vh',
//                         },
//                     },
//                 }}
//             >
//                 <DialogTitle>Chat History</DialogTitle>
//                 <DialogContent>
//                     {chatHistory.length === 0 ? (
//                         <DialogContentText>No chat history available</DialogContentText>
//                     ) : (
//                         <List>
//                             {chatHistory.map((session) => (
//                                 <ListItem key={session.id}>
//                                     <ListItemText
//                                         primary={`會話 ID: ${session.id}`}
//                                         secondary={
//                                             <>
//                                                 <div>Creation Time: {formatDateTime(session.created_at)}</div>
//                                                 {session.messages && session.messages.length > 0 ? (
//                                                     <div>
//                                                         Chat Content:
//                                                         <List dense>
//                                                             {session.messages.map((msg, index) => (
//                                                                 <ListItem key={index}>
//                                                                     <ListItemText
//                                                                         primary={`${msg.role}: ${msg.content}`}
//                                                                         secondary={`時間: ${formatDateTime(msg.created_at)}`}
//                                                                     />
//                                                                 </ListItem>
//                                                             ))}
//                                                         </List>
//                                                     </div>
//                                                 ) : (
//                                                     <div>No chat content</div>
//                                                 )}
//                                             </>
//                                         }
//                                     />
//                                 </ListItem>
//                             ))}
//                         </List>
//                     )}
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleCloseHistoryDialog} color="primary">
//                         Close
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </div>
//     );
// };

// export default WritingArea;


// import React, { useState, useEffect, useRef } from 'react';
// import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, List, ListItem, ListItemText } from '@mui/material';
// import { Box } from '@mui/system';
// import FroalaEditor from 'react-froala-wysiwyg';
// import 'froala-editor/js/plugins.pkgd.min.js';
// import 'froala-editor/css/froala_editor.pkgd.min.css';
// import 'froala-editor/css/froala_style.min.css';
// import axios from 'axios';
// import Navbar from "../components/Navbar_Student";

// // 用於 RAGFlow API 的 axios 實例
// const agentAxios = axios.create({
//     baseURL: 'https://ragflow.lazyinwork.com',
// });

// // 用於與後端交互的 axios 實例
// const apiAxios = axios.create({
//     baseURL: 'http://140.115.126.27:4000',
// });

// apiAxios.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// const WritingArea = () => {
//     const [editorContent, setEditorContent] = useState('');
//     const [openReminderDialog, setOpenReminderDialog] = useState(false);
//     const [openTempSaveDialog, setOpenTempSaveDialog] = useState(false);
//     const [openNoteDialog, setOpenNoteDialog] = useState(false);
//     const [noteContent, setNoteContent] = useState('');
//     const [sessionId, setSessionId] = useState('');
//     const [lastCreatedSessionId, setLastCreatedSessionId] = useState('');
//     const [sessionResponse, setSessionResponse] = useState('');
//     const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
//     const [chatHistory, setChatHistory] = useState([]);
//     const [currentMessages, setCurrentMessages] = useState([]);
//     const [activityTitle, setActivityTitle] = useState('');
//     const [groupName, setGroupName] = useState('');
//     const [username, setUsername] = useState('');
//     const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
//     const [openConfirmSubmitDialog, setOpenConfirmSubmitDialog] = useState(false);
//     const iframeRef = useRef(null);

//     // 載入活動標題、組名、用戶名，並從 Notion 獲取議論文和筆記內容
//     useEffect(() => {
//         const savedActivityTitle = localStorage.getItem('activityTitle');
//         if (savedActivityTitle) {
//             setActivityTitle(savedActivityTitle);
//         }

//         const savedGroupName = localStorage.getItem('groupName');
//         if (savedGroupName) {
//             setGroupName(savedGroupName);
//         }

//         const savedUsername = localStorage.getItem('name');
//         if (savedUsername && savedActivityTitle && savedGroupName) {
//             setUsername(savedUsername);

//             const fetchEssayContent = async () => {
//                 try {
//                     const response = await apiAxios.get(`/api/get-essay/${encodeURIComponent(savedUsername)}`, {
//                         params: { className: savedActivityTitle, theme: savedGroupName },
//                     });
//                     if (response.data.success) {
//                         setEditorContent(response.data.data.essayContent || '');
//                         setNoteContent(response.data.data.noteContent || '');
//                     } else {
//                         console.warn('未找到符合學生姓名、班級和主題的議論文內容，使用空白內容');
//                         setEditorContent('');
//                         setNoteContent('');
//                     }
//                 } catch (error) {
//                     console.error('從 Notion 獲取議論文內容失敗:', error);
//                     setEditorContent('');
//                     setNoteContent('');
//                 }
//             };

//             fetchEssayContent();
//         }

//         const savedNote = localStorage.getItem('noteData');
//         if (savedNote) {
//             setNoteContent(savedNote);
//         }

//         setOpenReminderDialog(true);
//     }, []);

//     useEffect(() => {
//         const handleMessage = (event) => {
//             if (event.origin !== 'https://ragflow.lazyinwork.com') return;
//             const { type, content } = event.data;
//             if (type === 'agentResponse') {
//                 setCurrentMessages((prev) => [
//                     ...prev,
//                     { role: 'assistant', content, created_at: new Date().toISOString() },
//                 ]);
//             }
//         };

//         window.addEventListener('message', handleMessage);
//         return () => window.removeEventListener('message', handleMessage);
//     }, []);

//     const handleCreateSession = async () => {
//         if (sessionId) {
//             const currentSession = chatHistory.find((session) => session.id === sessionId) || {
//                 id: sessionId,
//                 created_at: new Date().toISOString(),
//             };
//             setChatHistory([
//                 ...chatHistory.filter((session) => session.id !== sessionId),
//                 { ...currentSession, messages: currentMessages || [] },
//             ]);
//         }

//         setCurrentMessages([]);

//         try {
//             const res = await agentAxios.post(
//                 '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//                 {},
//                 {
//                     headers: {
//                         'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//                         'Content-Type': 'application/json',
//                     },
//                 }
//             );

//             if (res.data.code === 0) {
//                 const newSessionId = res.data.data?.id || '未知 ID';
//                 setSessionId(newSessionId);
//                 setLastCreatedSessionId(newSessionId);
//                 setSessionResponse(`✅ 成功創建聊天會話：${newSessionId}`);
//                 if (iframeRef.current) {
//                     iframeRef.current.src = `https://ragflow.lazyinwork.com/chat/share?shared_id=8f34f200ef5911ef91480242ac120005&session_id=${newSessionId}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`;
//                 }
//             } else {
//                 setSessionResponse(`❌ 創建失敗：${res.data.message}`);
//             }
//         } catch (error) {
//             if (error.message.includes('Token')) {
//                 setSessionResponse('❌ Token 無效，請重新登錄或聯繫管理員！');
//             } else if (error.message.includes('fetch')) {
//                 setSessionResponse('❌ 網絡錯誤，請檢查伺服器連線或 SSL 證書！');
//             } else {
//                 setSessionResponse(`❌ 錯誤：${error.message}`);
//             }
//         }
//     };

//     const handleFetchChatHistory = async () => {
//         try {
//             const res = await agentAxios.get(
//                 '/api/v1/agents/8f34f200ef5911ef91480242ac120005/sessions',
//                 {
//                     params: {
//                         page: 1,
//                         page_size: 100,
//                         orderby: 'create_time',
//                         desc: true,
//                     },
//                     headers: {
//                         'Authorization': 'Bearer ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm',
//                         'Content-Type': 'application/json',
//                     },
//                 }
//             );

//             if (res.data.code === 0) {
//                 const newSessions = res.data.data || [];
//                 const updatedHistory = [...chatHistory];
//                 newSessions.forEach((session) => {
//                     const existingSessionIndex = updatedHistory.findIndex((s) => s.id === session.id);
//                     if (existingSessionIndex !== -1) {
//                         updatedHistory[existingSessionIndex] = {
//                             ...updatedHistory[existingSessionIndex],
//                             create_time: session.create_time,
//                         };
//                     } else {
//                         updatedHistory.push({ ...session, messages: [] });
//                     }
//                 });
//                 setChatHistory(updatedHistory);
//                 setOpenHistoryDialog(true);
//             } else {
//                 alert(`❌ 獲取聊天歷史失敗：${res.data.message}`);
//             }
//         } catch (error) {
//             alert(`❌ 錯誤：${error.message}`);
//         }
//     };

//     const formatDateTime = (isoString) => {
//         const date = new Date(isoString);
//         return date.toLocaleString('zh-TW', {
//             year: 'numeric',
//             month: '2-digit',
//             day: '2-digit',
//             hour: '2-digit',
//             minute: '2-digit',
//             second: '2-digit',
//         });
//     };

//     const handleSubmit = async () => {
//         // 檢查字數
//         if (editorContent.length > 2000) {
//             alert('議論文內容超過 2000 字元，將自動分段儲存至資料庫');
//         }
//         if (noteContent.length > 2000) {
//             alert('筆記內容超過 2000 字元，將自動分段儲存至資料庫');
//         }

//         try {
//             const response = await apiAxios.post('/api/submit-to-notion', {
//                 studentName: username || '未命名使用者',
//                 theme: groupName || '未指定主題',
//                 essayContent: editorContent || '無內容',
//                 className: activityTitle || '未指定班級',
//                 noteContent: noteContent || '',
//             });

//             if (response.data.success) {
//                 alert('繳交上傳成功！');
//                 setIsSubmitDisabled(true);
//             } else {
//                 alert(`繳交上傳失敗：${response.data.message || '未知錯誤'}`);
//             }
//         } catch (error) {
//             console.error('發送到 Notion 時出錯:', error);
//             const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || '未知錯誤';
//             alert(`繳交上傳失敗：${errorMessage}`);
//         }
//     };

//     const handleConfirmSubmit = () => {
//         setOpenConfirmSubmitDialog(false);
//         handleSubmit();
//     };

//     const handleTempSave = () => {
//         setOpenTempSaveDialog(true);
//     };

//     const handleUpdateNote = async () => {
//         // 檢查字數
//         if (editorContent.length > 2000) {
//             console.log('議論文內容超過 2000 字元，將自動分段儲存');
//         }
//         if (noteContent.length > 2000) {
//             console.log('筆記內容超過 2000 字元，將自動分段儲存');
//         }

//         try {
//             const response = await apiAxios.patch('/api/update-note', {
//                 studentName: username || '未命名使用者',
//                 className: activityTitle || '未指定班級',
//                 theme: groupName || '未指定主題',
//                 noteContent: noteContent || '',
//                 essayContent: editorContent || '',
//             });

//             if (response.data.success) {
//                 console.log('筆記區和寫作區內容已更新到 Notion');
//             } else {
//                 console.warn('更新筆記區和寫作區內容失敗:', response.data.error);
//             }
//         } catch (error) {
//             console.error('更新筆記區和寫作區內容時出錯:', error);
//             const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || '未知錯誤';
//             console.warn(`更新失敗：${errorMessage}`);
//         }
//     };

//     const config = {
//         placeholderText: '開始編輯...',
//         charCounterCount: false,
//         toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'fontFamily', 'backColor',
//             'align', 'orderedList', 'unorderedList', 'insertImage', 'insertTable', 'link', 'undo', 'redo',
//             'clearFormatting', 'fullscreen', 'html', 'insertHR', 'specialCharacters'],
//     };

//     const handleCloseReminderDialog = () => {
//         setOpenReminderDialog(false);
//     };

//     const handleCloseTempSaveDialog = () => {
//         setOpenTempSaveDialog(false);
//     };

//     const handleOpenNoteDialog = () => {
//         setOpenNoteDialog(true);
//     };

//     const handleCloseNoteDialog = () => {
//         localStorage.setItem('noteData', noteContent );
//         handleUpdateNote();
//         setOpenNoteDialog(false);
//     };

//     const handleCloseHistoryDialog = () => {
//         setOpenHistoryDialog(false);
//     };

//     const handleNoteChange = (e) => {
//         setNoteContent(e.target.value);
//     };

//     return (
//         <div>
//             <Navbar />
//             <Box
//                 sx={{
//                     display: 'flex',
//                     flexDirection: { xs: 'column', md: 'row' },
//                     minHeight: 'calc(100vh - 120px)',
//                     padding: '10px',
//                     gap: '10px',
//                 }}
//             >
//                 {/* 左邊容器：聊天室 */}
//                 <Box
//                     sx={{
//                         width: { md: '50%', xs: '100%' },
//                         padding: '5px',
//                         borderRight: { md: '1px solid #ccc', xs: 'none' },
//                         display: 'flex',
//                         flexDirection: 'column',
//                         height: { md: '600px', sm: '800px', xs: 'auto' },
//                         '@media (max-width: 700px)': {
//                             height: '800px',
//                         },
//                     }}
//                 >
//                     <Box
//                         sx={{
//                             width: '100%',
//                             height: '100px',
//                             display: 'flex',
//                             justifyContent: 'space-between',
//                             alignItems: 'center',
//                             backgroundColor: '#B7C5FF',
//                             fontSize: '18px',
//                             fontWeight: 'bold',
//                             padding: '0 10px',
//                         }}
//                     >
//                         <span style={{ fontSize: '16px' }}>AI Writing Assistant</span>
//                         <Box sx={{ display: 'flex', gap: '5px' }}>
//                             <Button
//                                 variant="contained"
//                                 color="primary"
//                                 onClick={handleCreateSession}
//                                 sx={{ fontSize: '12px', padding: '2px 6px' }}
//                             >
//                                 Create New Chat
//                             </Button>
//                             <Button
//                                 variant="contained"
//                                 color="primary"
//                                 onClick={handleFetchChatHistory}
//                                 sx={{ fontSize: '12px', padding: '2px 6px' }}
//                             >
//                                 View Chat History
//                             </Button>
//                         </Box>
//                     </Box>
//                     <div
//                         style={{
//                             border: '2px solid black',
//                             borderRadius: '8px',
//                             padding: '10px',
//                             flex: 1,
//                             overflowY: 'auto',
//                             backgroundColor: '#FFFFFF',
//                             marginBottom: '10px',
//                         }}
//                     >
//                         {sessionResponse && (
//                             <Box
//                                 sx={{
//                                     mt: 1,
//                                     p: 1,
//                                     backgroundColor: '#f0f0f0',
//                                     borderRadius: '4px',
//                                     fontSize: '14px',
//                                 }}
//                             >
//                                 {sessionResponse}
//                             </Box>
//                         )}
//                         <iframe
//                             ref={iframeRef}
//                             src={`https://ragflow.lazyinwork.com/chat/share?shared_id=8f34f200ef5911ef91480242ac120005${sessionId ? `&session_id=${sessionId}` : ''}&from=agent&auth=hmY2Y0MjNjMWQ5YTExZjBhMGQ5MDI0Mm`}
//                             style={{ width: '100%', height: '100%' }}
//                             frameBorder="0"
//                             title="Chat Widget"
//                         />
//                     </div>
//                 </Box>

//                 {/* 右邊容器：文字編輯器 */}
//                 <Box
//                     sx={{
//                         width: { md: '50%', xs: '100%' },
//                         // padding: '20px',
//                         borderLeft: { md: '1px solid #ccc', xs: 'none' },
//                         position: 'relative',
//                         height: { md: '600px', sm: '800px', xs: 'auto' },
//                         display: 'flex',
//                         flexDirection: 'column',
//                         '@media (max-width: 700px)': {
//                             width: '100%',
//                             padding: '10px',
//                             height: '800px',
//                             borderLeft: 'none',
//                         },
//                     }}
//                 >
//                     <Box
//                         sx={{
//                             width: '100%',
//                             height: '100px',
//                             display: 'flex',
//                             justifyContent: 'space-between',
//                             alignItems: 'center',
//                             backgroundColor: '#B7C5FF',
//                             fontSize: '18px',
//                             fontWeight: 'bold',
//                             padding: '0 10px',
//                         }}
//                     >
//                         <Box>
//                             <span style={{ fontSize: '16px' }}>
//                                 {username && `User: ${username}`}
//                                 {activityTitle && ` Class: ${activityTitle}`}<br/>
//                                 {groupName && ` Topic: ${groupName}`}
//                             </span>
//                         </Box>
//                         <Button
//                             variant="contained"
//                             size="small"
//                             onClick={handleOpenNoteDialog}
//                             sx={{
//                                 fontSize: '12px',
//                                 padding: '2px 6px',
//                                 backgroundColor: '#1976d2',
//                                 color: '#ffffff',
//                                 '&:hover': {
//                                     backgroundColor: '#1565c0',
//                                 },
//                             }}
//                         >
//                             Notes Area
//                         </Button>
//                     </Box>
//                     <Box sx={{ flex: 1, overflowY: 'auto' }}>
//                         <FroalaEditor
//                             tag='textarea'
//                             config={config}
//                             model={editorContent}
//                             onModelChange={(newContent) => setEditorContent(newContent)}
//                             style={{ height: '100%' }}
//                         />
//                     </Box>
//                     {/* 按鈕容器：固定在右下角 */}
//                     <Box
//                         sx={{
//                             display: 'flex',
//                             gap: '10px',
//                             justifyContent: 'flex-end',
//                             padding: '10px',
//                             // backgroundColor: '#fff',
//                             '@media (max-width: 600px)': {
//                                 flexWrap: 'wrap',
//                                 justifyContent: 'center',
//                             },
//                         }}
//                     >
//                         <Button
//                             variant="contained"
//                             color="secondary"
//                             onClick={handleTempSave}
//                         >
//                             Temporary
//                         </Button>
//                         <Button
//                             variant="contained"
//                             color="secondary"
//                             onClick={() => setOpenConfirmSubmitDialog(true)}
//                             disabled={isSubmitDisabled}
//                         >
//                             Submit
//                         </Button>
//                     </Box>
//                 </Box>
//             </Box>

//             {/* 提交確認對話框 */}
//             <Dialog open={openConfirmSubmitDialog} onClose={() => setOpenConfirmSubmitDialog(false)}>
//                 <DialogTitle>Confirm Submission</DialogTitle>
//                 <DialogContent>
//                     <DialogContentText>
//                         Are you sure you want to submit? You won’t be able to edit the content after submission.
//                     </DialogContentText>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={() => setOpenConfirmSubmitDialog(false)} color="primary">
//                         Close
//                     </Button>
//                     <Button onClick={handleConfirmSubmit} color="primary" autoFocus>
//                         OK
//                     </Button>
//                 </DialogActions>
//             </Dialog>

//             <Dialog open={openReminderDialog} onClose={handleCloseReminderDialog}>
//                 <DialogTitle>Notification</DialogTitle>
//                 <DialogContent>
//                     <DialogContentText>
//                         Please discuss with the AI Writing Assistant before starting to write!
//                     </DialogContentText>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleCloseReminderDialog} color="primary">
//                         OK!
//                     </Button>
//                 </DialogActions>
//             </Dialog>

//             <Dialog open={openTempSaveDialog} onClose={handleCloseTempSaveDialog}>
//                 <DialogTitle>Tip</DialogTitle>
//                 <DialogContent>
//                     <DialogContentText>
//                         Temporary save successful!
//                     </DialogContentText>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleCloseTempSaveDialog} color="primary">
//                         OK
//                     </Button>
//                 </DialogActions>
//             </Dialog>

//             <Dialog
//                 open={openNoteDialog}
//                 onClose={handleCloseNoteDialog}
//                 sx={{
//                     '& .MuiDialog-paper': {
//                         width: '500px',
//                         height: '500px',
//                         maxWidth: '90vw',
//                         '@media (max-width: 600px)': {
//                             width: '90vw',
//                             height: '80vh',
//                         },
//                     },
//                 }}
//             >
//                 <DialogTitle>Notes Area</DialogTitle>
//                 <DialogContent>
//                     <TextField
//                         label="記錄您的筆記"
//                         value={noteContent}
//                         onChange={handleNoteChange}
//                         multiline
//                         rows={15}
//                         fullWidth
//                         variant="outlined"
//                         sx={{ height: '90%' }}
//                     />
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleCloseNoteDialog} color="primary">
//                         Save and Close
//                     </Button>
//                 </DialogActions>
//             </Dialog>

//             <Dialog
//                 open={openHistoryDialog}
//                 onClose={handleCloseHistoryDialog}
//                 sx={{
//                     '& .MuiDialog-paper': {
//                         width: '500px',
//                         maxHeight: '500px',
//                         maxWidth: '90vw',
//                         '@media (max-width: 600px)': {
//                             width: '90vw',
//                             maxHeight: '80vh',
//                         },
//                     },
//                 }}
//             >
//                 <DialogTitle>Chat History</DialogTitle>
//                 <DialogContent>
//                     {chatHistory.length === 0 ? (
//                         <DialogContentText>No chat history available</DialogContentText>
//                     ) : (
//                         <List>
//                             {chatHistory.map((session) => (
//                                 <ListItem key={session.id}>
//                                     <ListItemText
//                                         primary={`會話 ID: ${session.id}`}
//                                         secondary={
//                                             <>
//                                                 <div>Creation Time: {formatDateTime(session.created_at)}</div>
//                                                 {session.messages && session.messages.length > 0 ? (
//                                                     <div>
//                                                         Chat Content:
//                                                         <List dense>
//                                                             {session.messages.map((msg, index) => (
//                                                                 <ListItem key={index}>
//                                                                     <ListItemText
//                                                                         primary={`${msg.role}: ${msg.content}`}
//                                                                         secondary={`時間: ${formatDateTime(msg.created_at)}`}
//                                                                     />
//                                                                 </ListItem>
//                                                             ))}
//                                                         </List>
//                                                     </div>
//                                                 ) : (
//                                                     <div>No chat content</div>
//                                                 )}
//                                             </>
//                                         }
//                                     />
//                                 </ListItem>
//                             ))}
//                         </List>
//                     )}
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleCloseHistoryDialog} color="primary">
//                         Close
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </div>
//     );
// };

// export default WritingArea;



// //寫作精靈串API
// import React, { useState, useEffect, useRef } from 'react';
// import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, List, ListItem, ListItemText, Avatar, IconButton } from '@mui/material';
// import { Box } from '@mui/system';
// import FroalaEditor from 'react-froala-wysiwyg';
// import 'froala-editor/js/plugins.pkgd.min.js';
// import 'froala-editor/css/froala_editor.pkgd.min.css';
// import 'froala-editor/css/froala_style.min.css';
// import axios from 'axios';
// import Navbar from "../components/Navbar_Student";
// import userAvatar from "../assets/學生ICON.png";
// import assistantAvatar from "../assets/AI_LOGOICON.png";
// import sendArrow from '../assets/發送.png'; // 導入本地箭頭圖片


// const apiAxios = axios.create({
//   baseURL: 'http://140.115.126.27:4000',
//   timeout: 10000,
// });

// apiAxios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const WritingArea = () => {
//   const [editorContent, setEditorContent] = useState('');
//   const [openReminderDialog, setOpenReminderDialog] = useState(false);
//   const [openTempSaveDialog, setOpenTempSaveDialog] = useState(false);
//   const [openNoteDialog, setOpenNoteDialog] = useState(false);
//   const [noteContent, setNoteContent] = useState('');
//   const [currentMessages, setCurrentMessages] = useState([]);
//   const [userInput, setUserInput] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [sessionId, setSessionId] = useState('');
//   const [activityTitle, setActivityTitle] = useState('');
//   const [groupName, setGroupName] = useState('');
//   const [username, setUsername] = useState('');
//   const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
//   const [openConfirmSubmitDialog, setOpenConfirmSubmitDialog] = useState(false);
//   const chatEndRef = useRef(null);



//   const RAGFLOW_API_URL = 'https://ragflow.lazyinwork.com/api/v1';
//   const RAGFLOW_API_KEY = 'ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm';
//   const AGENT_ID = '8f34f200ef5911ef91480242ac120005';

//   const scrollToBottom = () => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [currentMessages]);

//   useEffect(() => {
//     const savedActivityTitle = localStorage.getItem('activityTitle');
//     if (savedActivityTitle) {
//       setActivityTitle(savedActivityTitle);
//     }

//     const savedGroupName = localStorage.getItem('groupName');
//     if (savedGroupName) {
//       setGroupName(savedGroupName);
//     }

//     const savedUsername = localStorage.getItem('name');
//     if (savedUsername && savedActivityTitle && savedGroupName) {
//       setUsername(savedUsername);

//       const fetchEssayContent = async () => {
//         try {
//           const response = await apiAxios.get(`/api/get-essay/${encodeURIComponent(savedUsername)}`, {
//             params: { className: savedActivityTitle, theme: savedGroupName },
//           });
//           if (response.data.success) {
//             setEditorContent(response.data.data.essayContent || '');
//             setNoteContent(response.data.data.noteContent || '');
//           } else {
//             console.warn('未找到符合學生姓名、班級和主題的議論文內容，使用空白內容');
//             setEditorContent('');
//             setNoteContent('');
//           }
//         } catch (error) {
//           console.error('從 Notion 獲取議論文內容失敗:', error);
//           setEditorContent('');
//           setNoteContent('');
//         }
//       };

//       fetchEssayContent();
//     }

//     const savedNote = localStorage.getItem('noteData');
//     if (savedNote) {
//       setNoteContent(savedNote);
//     }

//     setOpenReminderDialog(true);

//     // 頁面加載時自動創建一個新會話並觸發開場白
//     handleCreateSession();
//   }, []);

//   const handleCreateSession = async () => {
//     setCurrentMessages([]); // 清空當前聊天記錄
//     setErrorMessage('');

//     try {
//       const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/sessions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
//         },
//         body: JSON.stringify({}),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP 錯誤：${response.status}`);
//       }

//       const data = await response.json();
//       console.log('創建會話回應:', data);

//       if (data.code === 0) {
//         const newSessionId = data.data?.id;
//         setSessionId(newSessionId);
//         setErrorMessage(`✅ 成功創建聊天會話：${newSessionId}`);

//         // 創建會話後自動觸發開場白
//         await fetchOpeningMessage(newSessionId);
//       } else {
//         setErrorMessage(`❌ 創建會話失敗：${data.message}`);
//       }
//     } catch (error) {
//       setErrorMessage(`❌ 創建會話錯誤：${error.message}`);
//       console.error('創建會話失敗:', error);
//     }
//   };

//   const fetchOpeningMessage = async (sessionId) => {
//     try {
//       const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/completions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
//         },
//         body: JSON.stringify({
//           question: "Hello", // 預設問題觸發開場白
//           stream: false,
//           session_id: sessionId,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP 錯誤：${response.status}`);
//       }

//       const data = await response.json();
//       console.log('開場白回應:', data);

//       if (data.code === 0) {
//         const content = data.data?.answer || 'No opening message received';
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       } else {
//         setErrorMessage(`❌ 獲取開場白失敗：${data.message}`);
//       }
//     } catch (error) {
//       setErrorMessage(`❌ 獲取開場白錯誤：${error.message}`);
//       console.error('獲取開場白失敗:', error);
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!userInput.trim()) {
//       setErrorMessage('❌ 請輸入問題！');
//       return;
//     }

//     if (!sessionId) {
//       setErrorMessage('❌ 請先創建聊天會話！');
//       return;
//     }

//     const newMessage = { role: 'user', content: userInput, created_at: new Date().toISOString() };
//     setCurrentMessages((prev) => [...prev, newMessage]);
//     setUserInput('');
//     setErrorMessage('');

//     try {
//       const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/completions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
//         },
//         body: JSON.stringify({
//           question: userInput,
//           stream: false,
//           session_id: sessionId,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP 錯誤：${response.status}`);
//       }

//       const data = await response.json();
//       console.log('API 回應:', data);

//       if (data.code === 0) {
//         const content = data.data?.answer || 'No content received from API';
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       } else {
//         setErrorMessage(`❌ 回應失敗：${data.message}`);
//       }
//     } catch (error) {
//       setErrorMessage(`❌ 發送訊息失敗：${error.message}`);
//       console.error('發送訊息失敗:', error);
//     }
//   };

//   const formatDateTime = (isoString) => {
//     const date = new Date(isoString);
//     return date.toLocaleString('zh-TW', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     });
//   };

//   const handleSubmit = async () => {
//     if (editorContent.length > 2000) {
//       alert('議論文內容超過 2000 字元，將自動分段儲存至資料庫');
//     }
//     if (noteContent.length > 2000) {
//       alert('筆記內容超過 2000 字元，將自動分段儲存至資料庫');
//     }

//     try {
//       const response = await apiAxios.post('/api/submit-to-notion', {
//         studentName: username || '未命名使用者',
//         theme: groupName || '未指定主題',
//         essayContent: editorContent || '無內容',
//         className: activityTitle || '未指定班級',
//         noteContent: noteContent || '',
//       });

//       if (response.data.success) {
//         alert('繳交上傳成功！');
//         setIsSubmitDisabled(true);
//       } else {
//         alert(`繳交上傳失敗：${response.data.message || '未知錯誤'}`);
//       }
//     } catch (error) {
//       console.error('發送到 Notion 時出錯:', error);
//       const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || '未知錯誤';
//       alert(`繳交上傳失敗：${errorMessage}`);
//     }
//   };

//   const handleConfirmSubmit = () => {
//     setOpenConfirmSubmitDialog(false);
//     handleSubmit();
//   };

//   const handleTempSave = () => {
//     setOpenTempSaveDialog(true);
//   };

//   const handleUpdateNote = async () => {
//     if (editorContent.length > 2000) {
//       console.log('議論文內容超過 2000 字元，將自動分段儲存');
//     }
//     if (noteContent.length > 2000) {
//       console.log('筆記內容超過 2000 字元，將自動分段儲存');
//     }

//     try {
//       const response = await apiAxios.patch('/api/update-note', {
//         studentName: username || '未命名使用者',
//         className: activityTitle || '未指定班級',
//         theme: groupName || '未指定主題',
//         noteContent: noteContent || '',
//         essayContent: editorContent || '',
//       });

//       if (response.data.success) {
//         console.log('筆記區和寫作區內容已更新到 Notion');
//       } else {
//         console.warn('更新筆記區和寫作區內容失敗:', response.data.error);
//       }
//     } catch (error) {
//       console.error('更新筆記區和寫作區內容時出錯:', error);
//       const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || '未知錯誤';
//       console.warn(`更新失敗：${errorMessage}`);
//     }
//   };

//   const config = {
//     placeholderText: '開始編輯...',
//     charCounterCount: false,
//     toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'fontFamily', 'backColor',
//       'align', 'orderedList', 'unorderedList', 'insertImage', 'insertTable', 'link', 'undo', 'redo',
//       'clearFormatting', 'fullscreen', 'html', 'insertHR', 'specialCharacters'],
//   };

//   const handleCloseReminderDialog = () => {
//     setOpenReminderDialog(false);
//   };

//   const handleCloseTempSaveDialog = () => {
//     setOpenTempSaveDialog(false);
//   };

//   const handleOpenNoteDialog = () => {
//     setOpenNoteDialog(true);
//   };

//   const handleCloseNoteDialog = () => {
//     localStorage.setItem('noteData', noteContent);
//     handleUpdateNote();
//     setOpenNoteDialog(false);
//   };

//   const handleNoteChange = (e) => {
//     setNoteContent(e.target.value);
//   };

//   return (
//     <div>
//       <Navbar />
//       <Box
//         sx={{
//           display: 'flex',
//           flexDirection: { xs: 'column', md: 'row' },
//           minHeight: 'calc(100vh - 120px)',
//           padding: '10px',
//           gap: '10px',
//         }}
//       >
//         {/* 左邊容器：聊天室 */}
//         <Box
//           sx={{
//             width: { md: '50%', xs: '100%' },
//             padding: '5px',
//             borderRight: { md: '1px solid #ccc', xs: 'none' },
//             display: 'flex',
//             flexDirection: 'column',
//             height: { md: '600px', sm: '800px', xs: 'auto' },
//             '@media (max-width: 700px)': {
//               height: '800px',
//             },
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '100px',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               padding: '0 10px',
//             }}
//           >
//             <span style={{ fontSize: '16px' }}>AI Writing Assistant</span>
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={handleCreateSession}
//               sx={{ fontSize: '12px', padding: '2px 6px' }}
//             >
//               Create New Chat
//             </Button>
//           </Box>
//           <Box
//             sx={{
//               border: '2px solid black',
//               borderRadius: '8px',
//               padding: '10px',
//               flex: 1,
//               overflowY: 'auto',
//               backgroundColor: '#FFFFFF',
//               marginBottom: '5px',
//               marginTop: '10px',
//               display: 'flex',
//               flexDirection: 'column',
//             }}
//           >
//             {errorMessage && (
//               <Box
//                 sx={{
//                   mt: 1,
//                   p: 1,
//                   backgroundColor: '#f0f0f0',
//                   borderRadius: '4px',
//                   fontSize: '14px',
//                 }}
//               >
//                 {errorMessage}
//               </Box>
//             )}
//             <List
//               sx={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '5px' }}
//             >
//               {currentMessages.map((msg, index) => (
//                 <ListItem
//                   key={index}
//                   sx={{
//                     justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
//                     textAlign: msg.role === 'user' ? 'right' : 'left',
//                     marginBottom: '5px',
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       display: 'flex',
//                       flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
//                       alignItems: 'flex-start',
//                     }}
//                   >
//                     <Avatar
//                       alt={msg.role === 'user' ? 'User' : 'AI Assistant'}
//                       src={msg.role === 'user' ? userAvatar : assistantAvatar}
//                       sx={{ width: 40, height: 40, margin: '0 8px' }}
//                     />
//                     <Box
//                       sx={{
//                         maxWidth: '70%',
//                         p: 2,
//                         borderRadius: '8px',
//                         backgroundColor: msg.role === 'user' ? '#DCF8C6' : '#F0F0F0',
//                       }}
//                     >
//                       <ListItemText
//                         primary={msg.content || 'No content'}
//                         secondary={formatDateTime(msg.created_at)}
//                         sx={{ wordBreak: 'break-word' }}
//                       />
//                     </Box>
//                   </Box>
//                 </ListItem>
//               ))}
//               <div ref={chatEndRef} />
//             </List>
//             <Box sx={{ display: 'flex', mt: 2 }}>
//               <TextField
//                 fullWidth
//                 value={userInput}
//                 onChange={(e) => setUserInput(e.target.value)}
//                 placeholder="請輸入與寫作主題相關的內容..."
//                 onKeyPress={(e) => {
//                   if (e.key === 'Enter' && !e.shiftKey) {
//                     e.preventDefault();
//                     handleSendMessage();
//                   }
//                 }}
//                 variant="standard"
//                 sx={{ marginRight: '8px' }}
//               />
//               <IconButton
//                 color="primary"
//                 onClick={handleSendMessage}
//                 sx={{ padding: '8px' }}
//               >
//                 <img src={sendArrow} alt="Send" style={{ width: '40px', height: '40px' }} />
//               </IconButton>
//             </Box>
//           </Box>
//         </Box>

//         {/* 右邊容器：文字編輯器 */}
//         <Box
//           sx={{
//             width: { md: '50%', xs: '100%' },
//             borderLeft: { md: '1px solid #ccc', xs: 'none' },
//             position: 'relative',
//             height: { md: '600px', sm: '800px', xs: 'auto' },
//             display: 'flex',
//             flexDirection: 'column',
//             '@media (max-width: 700px)': {
//               width: '100%',
//               padding: '10px',
//               height: '800px',
//               borderLeft: 'none',
//             },
//             '@media (max-width: 600px)': {
//               width: '100%',
//             },
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '100px',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               padding: '0 10px',
//             }}
//           >
//             <Box>
//               <span style={{ fontSize: '16px' }}>
//                 {username && `User: ${username}`}
//                 {activityTitle && ` Class: ${activityTitle}`}<br />
//                 {groupName && ` Topic: ${groupName}`}
//               </span>
//             </Box>
//             <Button
//               variant="contained"
//               size="small"
//               onClick={handleOpenNoteDialog}
//               sx={{
//                 fontSize: '12px',
//                 padding: '2px 6px',
//                 backgroundColor: '#1976d2',
//                 color: '#ffffff',
//                 '&:hover': {
//                   backgroundColor: '#1565c0',
//                 },
//               }}
//             >
//               Notes Area
//             </Button>
//           </Box>
//           <Box sx={{ flex: 1, overflowY: 'auto' }}>
//             <FroalaEditor
//               tag="textarea"
//               config={config}
//               model={editorContent}
//               onModelChange={(value) => setEditorContent(value)}
//               style={{ height: '100%' }}
//             />
//           </Box>
//           <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '10px' }}>
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={handleTempSave}
//             >
//               Temporary
//             </Button>
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={() => setOpenConfirmSubmitDialog(true)}
//               disabled={isSubmitDisabled}
//             >
//               Submit
//             </Button>
//           </Box>
//         </Box>
//       </Box>

//       {/* 提交確認提示 */}
//       <Dialog open={openConfirmSubmitDialog} onClose={() => setOpenConfirmSubmitDialog(false)}>
//         <DialogTitle>確認提交</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             您確定要提交嗎？提交後無法編輯內容。
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenConfirmSubmitDialog(false)} color="primary">
//             關閉
//           </Button>
//           <Button onClick={handleConfirmSubmit} color="primary" autoFocus>
//             確定
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openReminderDialog} onClose={handleCloseReminderDialog}>
//         <DialogTitle>通知</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             請先與 AI 寫作助理討論後再開始寫作！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseReminderDialog} color="primary">
//             好的！
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openTempSaveDialog} onClose={handleCloseTempSaveDialog}>
//         <DialogTitle>提示</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             暫存成功！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseTempSaveDialog} color="primary">
//             確定
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openNoteDialog}
//         onClose={handleCloseNoteDialog}
//         sx={{
//           '& .MuiDialog-container .MuiPaper-root': {
//             width: '500px',
//             height: '500px',
//             maxWidth: '90vw',
//             '@media (max-width: 600px)': {
//               width: '90vw',
//               height: '80vh',
//             },
//           },
//         }}
//       >
//         <DialogTitle>筆記區域</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="記下你的想法"
//             value={noteContent}
//             onChange={handleNoteChange}
//             multiline
//             rows={15}
//             fullWidth
//             variant="outlined"
//             sx={{ height: '90%' }}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseNoteDialog} color="primary">
//             儲存並關閉
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default WritingArea;




// import React, { useState, useEffect, useRef } from 'react';
// import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, List, ListItem, ListItemText, Avatar, IconButton, ListItemButton } from '@mui/material';
// import { Box } from '@mui/system';
// import FroalaEditor from 'react-froala-wysiwyg';
// import 'froala-editor/js/plugins.pkgd.min.js';
// import 'froala-editor/css/froala_editor.pkgd.min.css';
// import 'froala-editor/css/froala_style.min.css';
// import axios from 'axios';
// import Navbar from "../components/Navbar_Student";
// import userAvatar from "../assets/學生ICON.png";
// import assistantAvatar from "../assets/AI_LOGOICON.png";
// import sendArrow from '../assets/發送.png';

// const apiAxios = axios.create({
//   baseURL: 'http://140.115.126.27:4000',
//   timeout: 10000,
// });

// apiAxios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const WritingArea = () => {
//   const [editorContent, setEditorContent] = useState('');
//   const [openReminderDialog, setOpenReminderDialog] = useState(false);
//   const [openTempSaveDialog, setOpenTempSaveDialog] = useState(false);
//   const [openNoteDialog, setOpenNoteDialog] = useState(false);
//   const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
//   const [noteContent, setNoteContent] = useState('');
//   const [currentMessages, setCurrentMessages] = useState([]);
//   const [chatHistory, setChatHistory] = useState([]); // 儲存所有會話的歷史紀錄
//   const [userInput, setUserInput] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [sessionId, setSessionId] = useState('');
//   const [activityTitle, setActivityTitle] = useState('');
//   const [groupName, setGroupName] = useState('');
//   const [username, setUsername] = useState('');
//   const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
//   const [openConfirmSubmitDialog, setOpenConfirmSubmitDialog] = useState(false);
//   const chatEndRef = useRef(null);

//   const RAGFLOW_API_URL = 'https://ragflow.lazyinwork.com/api/v1';
//   const RAGFLOW_API_KEY = 'ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm';
//   const AGENT_ID = '8f34f200ef5911ef91480242ac120005';

//   const scrollToBottom = () => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [currentMessages]);

//   useEffect(() => {
//     const savedActivityTitle = localStorage.getItem('activityTitle');
//     if (savedActivityTitle) {
//       setActivityTitle(savedActivityTitle);
//     }

//     const savedGroupName = localStorage.getItem('groupName');
//     if (savedGroupName) {
//       setGroupName(savedGroupName);
//     }

//     const savedUsername = localStorage.getItem('name');
//     if (savedUsername && savedActivityTitle && savedGroupName) {
//       setUsername(savedUsername);

//       const fetchEssayContent = async () => {
//         try {
//           const response = await apiAxios.get(`/api/get-essay/${encodeURIComponent(savedUsername)}`, {
//             params: { className: savedActivityTitle, theme: savedGroupName },
//           });
//           if (response.data.success) {
//             setEditorContent(response.data.data.essayContent || '');
//             setNoteContent(response.data.data.noteContent || '');
//           } else {
//             console.warn('未找到符合學生姓名、班級和主題的議論文內容，使用空白內容');
//             setEditorContent('');
//             setNoteContent('');
//           }
//         } catch (error) {
//           console.error('從 Notion 獲取議論文內容失敗:', error);
//           setEditorContent('');
//           setNoteContent('');
//         }
//       };

//       fetchEssayContent();
//     }

//     const savedNote = localStorage.getItem('noteData');
//     if (savedNote) {
//       setNoteContent(savedNote);
//     }

//     setOpenReminderDialog(true);

//     handleCreateSession();
//   }, []);

//   const handleCreateSession = async () => {
//     // 將當前聊天記錄保存到歷史紀錄中（如果有訊息）
//     if (sessionId && currentMessages.length > 0) {
//       setChatHistory((prev) => [
//         ...prev,
//         { sessionId, messages: [...currentMessages], createdAt: new Date().toISOString() }, // 添加創建時間
//       ]);
//     }

//     setCurrentMessages([]);
//     setErrorMessage('');

//     try {
//       const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/sessions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
//         },
//         body: JSON.stringify({}),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP 錯誤：${response.status}`);
//       }

//       const data = await response.json();
//       console.log('創建會話回應:', data);

//       if (data.code === 0) {
//         const newSessionId = data.data?.id;
//         setSessionId(newSessionId);
//         setErrorMessage(`✅ 成功創建聊天會話：${newSessionId}`);

//         await fetchOpeningMessage(newSessionId);
//       } else {
//         setErrorMessage(`❌ 創建會話失敗：${data.message}`);
//       }
//     } catch (error) {
//       setErrorMessage(`❌ 創建會話錯誤：${error.message}`);
//       console.error('創建會話失敗:', error);
//     }
//   };

//   const fetchOpeningMessage = async (sessionId) => {
//     try {
//       const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/completions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
//         },
//         body: JSON.stringify({
//           question: "Hello",
//           stream: false,
//           session_id: sessionId,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP 錯誤：${response.status}`);
//       }

//       const data = await response.json();
//       console.log('開場白回應:', data);

//       if (data.code === 0) {
//         const content = data.data?.answer || 'No opening message received';
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       } else {
//         setErrorMessage(`❌ 獲取開場白失敗：${data.message}`);
//       }
//     } catch (error) {
//       setErrorMessage(`❌ 獲取開場白錯誤：${error.message}`);
//       console.error('獲取開場白失敗:', error);
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!userInput.trim()) {
//       setErrorMessage('❌ 請輸入問題！');
//       return;
//     }

//     if (!sessionId) {
//       setErrorMessage('❌ 請先創建聊天會話！');
//       return;
//     }

//     const newMessage = { role: 'user', content: userInput, created_at: new Date().toISOString() };
//     setCurrentMessages((prev) => [...prev, newMessage]);
//     setUserInput('');
//     setErrorMessage('');

//     try {
//       const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/completions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
//         },
//         body: JSON.stringify({
//           question: userInput,
//           stream: false,
//           session_id: sessionId,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP 錯誤：${response.status}`);
//       }

//       const data = await response.json();
//       console.log('API 回應:', data);

//       if (data.code === 0) {
//         const content = data.data?.answer || 'No content received from API';
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       } else {
//         setErrorMessage(`❌ 回應失敗：${data.message}`);
//       }
//     } catch (error) {
//       setErrorMessage(`❌ 發送訊息失敗：${error.message}`);
//       console.error('發送訊息失敗:', error);
//     }
//   };

//   const handleViewHistory = () => {
//     // 當前會話如果有訊息，先保存到歷史紀錄
//     if (sessionId && currentMessages.length > 0) {
//       setChatHistory((prev) => {
//         const existingSession = prev.find((session) => session.sessionId === sessionId);
//         if (existingSession) {
//           existingSession.messages = [...currentMessages];
//           existingSession.createdAt = new Date().toISOString(); // 更新創建時間
//           return [...prev];
//         } else {
//           return [
//             ...prev,
//             { sessionId, messages: [...currentMessages], createdAt: new Date().toISOString() }, // 添加創建時間
//           ];
//         }
//       });
//     }
//     setOpenHistoryDialog(true);
//   };

//   const handleLoadHistory = (session) => {
//     setCurrentMessages(session.messages);
//     setSessionId(session.sessionId);
//     setOpenHistoryDialog(false);
//   };

//   const formatDateTime = (isoString) => {
//     const date = new Date(isoString);
//     return date.toLocaleString('zh-TW', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     });
//   };

//   const handleSubmit = async () => {
//     if (editorContent.length > 2000) {
//       alert('議論文內容超過 2000 字元，將自動分段儲存至資料庫');
//     }
//     if (noteContent.length > 2000) {
//       alert('筆記內容超過 2000 字元，將自動分段儲存至資料庫');
//     }

//     try {
//       const response = await apiAxios.post('/api/submit-to-notion', {
//         studentName: username || '未命名使用者',
//         theme: groupName || '未指定主題',
//         essayContent: editorContent || '無內容',
//         className: activityTitle || '未指定班級',
//         noteContent: noteContent || '',
//       });

//       if (response.data.success) {
//         alert('繳交上傳成功！');
//         setIsSubmitDisabled(true);
//       } else {
//         alert(`繳交上傳失敗：${response.data.message || '未知錯誤'}`);
//       }
//     } catch (error) {
//       console.error('發送到 Notion 時出錯:', error);
//       const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || '未知錯誤';
//       alert(`繳交上傳失敗：${errorMessage}`);
//     }
//   };

//   const handleConfirmSubmit = () => {
//     setOpenConfirmSubmitDialog(false);
//     handleSubmit();
//   };

//   const handleTempSave = () => {
//     setOpenTempSaveDialog(true);
//   };

//   const handleUpdateNote = async () => {
//     if (editorContent.length > 2000) {
//       console.log('議論文內容超過 2000 字元，將自動分段儲存');
//     }
//     if (noteContent.length > 2000) {
//       console.log('筆記內容超過 2000 字元，將自動分段儲存');
//     }

//     try {
//       const response = await apiAxios.patch('/api/update-note', {
//         studentName: username || '未命名使用者',
//         className: activityTitle || '未指定班級',
//         theme: groupName || '未指定主題',
//         noteContent: noteContent || '',
//         essayContent: editorContent || '',
//       });

//       if (response.data.success) {
//         console.log('筆記區和寫作區內容已更新到 Notion');
//       } else {
//         console.warn('更新筆記區和寫作區內容失敗:', response.data.error);
//       }
//     } catch (error) {
//       console.error('更新筆記區和寫作區內容時出錯:', error);
//       const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || '未知錯誤';
//       console.warn(`更新失敗：${errorMessage}`);
//     }
//   };

//   const config = {
//     placeholderText: '開始編輯...',
//     charCounterCount: false,
//     toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'fontFamily', 'backColor',
//       'align', 'orderedList', 'unorderedList', 'insertImage', 'insertTable', 'link', 'undo', 'redo',
//       'clearFormatting', 'fullscreen', 'html', 'insertHR', 'specialCharacters'],
//   };

//   const handleCloseReminderDialog = () => {
//     setOpenReminderDialog(false);
//   };

//   const handleCloseTempSaveDialog = () => {
//     setOpenTempSaveDialog(false);
//   };

//   const handleOpenNoteDialog = () => {
//     setOpenNoteDialog(true);
//   };

//   const handleCloseNoteDialog = () => {
//     localStorage.setItem('noteData', noteContent);
//     handleUpdateNote();
//     setOpenNoteDialog(false);
//   };

//   const handleCloseHistoryDialog = () => {
//     setOpenHistoryDialog(false);
//   };

//   const handleNoteChange = (e) => {
//     setNoteContent(e.target.value);
//   };

//   return (
//     <div>
//       <Navbar />
//       <Box
//         sx={{
//           display: 'flex',
//           flexDirection: { xs: 'column', md: 'row' },
//           minHeight: 'calc(100vh - 120px)',
//           padding: '10px',
//           gap: '10px',
//         }}
//       >
//         {/* 左邊容器：聊天室 */}
//         <Box
//           sx={{
//             width: { md: '50%', xs: '100%' },
//             padding: '5px',
//             borderRight: { md: '1px solid #ccc', xs: 'none' },
//             display: 'flex',
//             flexDirection: 'column',
//             height: { md: '600px', sm: '800px', xs: 'auto' },
//             '@media (max-width: 700px)': {
//               height: '800px',
//             },
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '100px',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               padding: '0 10px',
//             }}
//           >
//             <span style={{ fontSize: '16px' }}>AI Writing Assistant</span>
//             <Box sx={{ display: 'flex', gap: '10px' }}>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleViewHistory}
//                 sx={{ fontSize: '12px', padding: '2px 6px' }}
//               >
//                 View History
//               </Button>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleCreateSession}
//                 sx={{ fontSize: '12px', padding: '2px 6px' }}
//               >
//                 Create New Chat
//               </Button>
//             </Box>
//           </Box>
//           <Box
//             sx={{
//               border: '2px solid black',
//               borderRadius: '8px',
//               padding: '10px',
//               flex: 1,
//               overflowY: 'auto',
//               backgroundColor: '#FFFFFF',
//               marginBottom: '5px',
//               marginTop: '10px',
//               display: 'flex',
//               flexDirection: 'column',
//             }}
//           >
//             {errorMessage && (
//               <Box
//                 sx={{
//                   mt: 1,
//                   p: 1,
//                   backgroundColor: '#f0f0f0',
//                   borderRadius: '4px',
//                   fontSize: '14px',
//                 }}
//               >
//                 {errorMessage}
//               </Box>
//             )}
//             <List
//               sx={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '5px' }}
//             >
//               {currentMessages.map((msg, index) => (
//                 <ListItem
//                   key={index}
//                   sx={{
//                     justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
//                     textAlign: msg.role === 'user' ? 'right' : 'left',
//                     marginBottom: '5px',
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       display: 'flex',
//                       flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
//                       alignItems: 'flex-start',
//                     }}
//                   >
//                     <Avatar
//                       alt={msg.role === 'user' ? 'User' : 'AI Assistant'}
//                       src={msg.role === 'user' ? userAvatar : assistantAvatar}
//                       sx={{ width: 40, height: 40, margin: '0 8px' }}
//                     />
//                     <Box
//                       sx={{
//                         maxWidth: '70%',
//                         p: 2,
//                         borderRadius: '8px',
//                         backgroundColor: msg.role === 'user' ? '#DCF8C6' : '#F0F0F0',
//                       }}
//                     >
//                       <ListItemText
//                         primary={msg.content || 'No content'}
//                         secondary={formatDateTime(msg.created_at)}
//                         sx={{ wordBreak: 'break-word' }}
//                       />
//                     </Box>
//                   </Box>
//                 </ListItem>
//               ))}
//               <div ref={chatEndRef} />
//             </List>
//             <Box sx={{ display: 'flex', mt: 2 }}>
//               <TextField
//                 fullWidth
//                 value={userInput}
//                 onChange={(e) => setUserInput(e.target.value)}
//                 placeholder="請輸入與寫作主題相關的內容..."
//                 onKeyPress={(e) => {
//                   if (e.key === 'Enter' && !e.shiftKey) {
//                     e.preventDefault();
//                     handleSendMessage();
//                   }
//                 }}
//                 variant="standard"
//                 sx={{ marginRight: '8px' }}
//               />
//               <IconButton
//                 color="primary"
//                 onClick={handleSendMessage}
//                 sx={{ padding: '8px' }}
//               >
//                 <img src={sendArrow} alt="Send" style={{ width: '40px', height: '40px' }} />
//               </IconButton>
//             </Box>
//           </Box>
//         </Box>

//         {/* 右邊容器：文字編輯器 */}
//         <Box
//           sx={{
//             width: { md: '50%', xs: '100%' },
//             borderLeft: { md: '1px solid #ccc', xs: 'none' },
//             position: 'relative',
//             height: { md: '600px', sm: '800px', xs: 'auto' },
//             display: 'flex',
//             flexDirection: 'column',
//             '@media (max-width: 700px)': {
//               width: '100%',
//               padding: '10px',
//               height: '800px',
//               borderLeft: 'none',
//             },
//             '@media (max-width: 600px)': {
//               width: '100%',
//             },
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '100px',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               padding: '0 10px',
//             }}
//           >
//             <Box>
//               <span style={{ fontSize: '16px' }}>
//                 {username && `User: ${username}`}
//                 {activityTitle && ` Class: ${activityTitle}`}<br />
//                 {groupName && ` Topic: ${groupName}`}
//               </span>
//             </Box>
//             <Button
//               variant="contained"
//               size="small"
//               onClick={handleOpenNoteDialog}
//               sx={{
//                 fontSize: '12px',
//                 padding: '2px 6px',
//                 backgroundColor: '#1976d2',
//                 color: '#ffffff',
//                 '&:hover': {
//                   backgroundColor: '#1565c0',
//                 },
//               }}
//             >
//               Notes Area
//             </Button>
//           </Box>
//           <Box sx={{ flex: 1, overflowY: 'auto' }}>
//             <FroalaEditor
//               tag="textarea"
//               config={config}
//               model={editorContent}
//               onModelChange={(value) => setEditorContent(value)}
//               style={{ height: '100%' }}
//             />
//           </Box>
//           <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '10px' }}>
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={handleTempSave}
//             >
//               Temporary
//             </Button>
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={() => setOpenConfirmSubmitDialog(true)}
//               disabled={isSubmitDisabled}
//             >
//               Submit
//             </Button>
//           </Box>
//         </Box>
//       </Box>

//       {/* 提交確認提示 */}
//       <Dialog open={openConfirmSubmitDialog} onClose={() => setOpenConfirmSubmitDialog(false)}>
//         <DialogTitle>確認提交</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             您確定要提交嗎？提交後無法編輯內容。
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenConfirmSubmitDialog(false)} color="primary">
//             關閉
//           </Button>
//           <Button onClick={handleConfirmSubmit} color="primary" autoFocus>
//             確定
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openReminderDialog} onClose={handleCloseReminderDialog}>
//         <DialogTitle>通知</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             請先與 AI 寫作助理討論後再開始寫作！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseReminderDialog} color="primary">
//             好的！
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openTempSaveDialog} onClose={handleCloseTempSaveDialog}>
//         <DialogTitle>提示</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             暫存成功！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseTempSaveDialog} color="primary">
//             確定
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog
//         open={openNoteDialog}
//         onClose={handleCloseNoteDialog}
//         sx={{
//           '& .MuiDialog-container .MuiPaper-root': {
//             width: '500px',
//             height: '500px',
//             maxWidth: '90vw',
//             '@media (max-width: 600px)': {
//               width: '90vw',
//               height: '80vh',
//             },
//           },
//         }}
//       >
//         <DialogTitle>筆記區域</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="記下你的想法"
//             value={noteContent}
//             onChange={handleNoteChange}
//             multiline
//             rows={15}
//             fullWidth
//             variant="outlined"
//             sx={{ height: '90%' }}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseNoteDialog} color="primary">
//             儲存並關閉
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* 歷史紀錄對話框 */}
//       <Dialog
//         open={openHistoryDialog}
//         onClose={handleCloseHistoryDialog}
//         sx={{
//           '& .MuiDialog-container .MuiPaper-root': {
//             width: '500px',
//             maxWidth: '90vw',
//           },
//         }}
//       >
//         <DialogTitle>聊天歷史紀錄</DialogTitle>
//         <DialogContent>
//           {chatHistory.length === 0 ? (
//             <DialogContentText>暫無歷史紀錄</DialogContentText>
//           ) : (
//             <List>
//               {chatHistory.map((session, index) => (
//                 <ListItem key={index} disablePadding>
//                   <ListItemButton onClick={() => handleLoadHistory(session)}>
//                     <ListItemText
//                       primary={`會話 ${session.sessionId}`}
//                       secondary={
//                         <>
//                           {`創建時間: ${formatDateTime(session.createdAt)}`}<br />
//                           {session.messages[0]?.content
//                             ? session.messages[0].content.substring(0, 50) + '...'
//                             : '無訊息'}
//                         </>
//                       }
//                     />
//                   </ListItemButton>
//                 </ListItem>
//               ))}
//             </List>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseHistoryDialog} color="primary">
//             關閉
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default WritingArea;




//側欄顯示
// import React, { useState, useEffect, useRef } from 'react';
// import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, List, ListItem, ListItemText, Avatar, IconButton, ListItemButton, Drawer } from '@mui/material';
// import { Box } from '@mui/system';
// import FroalaEditor from 'react-froala-wysiwyg';
// import 'froala-editor/js/plugins.pkgd.min.js';
// import 'froala-editor/css/froala_editor.pkgd.min.css';
// import 'froala-editor/css/froala_style.min.css';
// import axios from 'axios';
// import Navbar from "../components/Navbar_Student";
// import userAvatar from "../assets/學生ICON.png";
// import assistantAvatar from "../assets/AI_LOGOICON.png";
// import sendArrow from '../assets/發送.png';
// import NotesIcon from '@mui/icons-material/Notes';

// const apiAxios = axios.create({
//   baseURL: 'http://140.115.126.27:4000',
//   timeout: 10000,
// });

// apiAxios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const WritingArea = () => {
//   const [editorContent, setEditorContent] = useState('');
//   const [openReminderDialog, setOpenReminderDialog] = useState(false);
//   const [openTempSaveDialog, setOpenTempSaveDialog] = useState(false);
//   const [openNoteDrawer, setOpenNoteDrawer] = useState(false);
//   const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
//   const [noteContent, setNoteContent] = useState('');
//   const [currentMessages, setCurrentMessages] = useState([]);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [userInput, setUserInput] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [sessionId, setSessionId] = useState('');
//   const [activityTitle, setActivityTitle] = useState('');
//   const [groupName, setGroupName] = useState('');
//   const [username, setUsername] = useState('');
//   const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
//   const [openConfirmSubmitDialog, setOpenConfirmSubmitDialog] = useState(false);
//   const chatEndRef = useRef(null);

//   const RAGFLOW_API_URL = 'https://ragflow.lazyinwork.com/api/v1';
//   const RAGFLOW_API_KEY = 'ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm';
//   const AGENT_ID = '8f34f200ef5911ef91480242ac120005';

//   const scrollToBottom = () => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [currentMessages]);

//   useEffect(() => {
//     const savedActivityTitle = localStorage.getItem('activityTitle');
//     if (savedActivityTitle) {
//       setActivityTitle(savedActivityTitle);
//     }

//     const savedGroupName = localStorage.getItem('groupName');
//     if (savedGroupName) {
//       setGroupName(savedGroupName);
//     }

//     const savedUsername = localStorage.getItem('name');
//     if (savedUsername && savedActivityTitle && savedGroupName) {
//       setUsername(savedUsername);

//       const fetchEssayContent = async () => {
//         try {
//           const response = await apiAxios.get(`/api/get-essay/${encodeURIComponent(savedUsername)}`, {
//             params: { className: savedActivityTitle, theme: savedGroupName },
//           });
//           if (response.data.success) {
//             setEditorContent(response.data.data.essayContent || '');
//             setNoteContent(response.data.data.noteContent || '');
//           } else {
//             console.warn('未找到符合學生姓名、班級和主題的議論文內容，使用空白內容');
//             setEditorContent('');
//             setNoteContent('');
//           }
//         } catch (error) {
//           console.error('從 Notion 獲取議論文內容失敗:', error);
//           setEditorContent('');
//           setNoteContent('');
//         }
//       };

//       fetchEssayContent();
//     }

//     const savedNote = localStorage.getItem('noteData');
//     if (savedNote) {
//       setNoteContent(savedNote);
//     }

//     setOpenReminderDialog(true);

//     handleCreateSession();
//   }, []);

//   const handleCreateSession = async () => {
//     if (sessionId && currentMessages.length > 0) {
//       setChatHistory((prev) => [
//         ...prev,
//         { sessionId, messages: [...currentMessages], createdAt: new Date().toISOString() },
//       ]);
//     }

//     setCurrentMessages([]);
//     setErrorMessage('');

//     try {
//       const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/sessions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
//         },
//         body: JSON.stringify({}),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP 錯誤：${response.status}`);
//       }

//       const data = await response.json();
//       console.log('創建會話回應:', data);

//       if (data.code === 0) {
//         const newSessionId = data.data?.id;
//         setSessionId(newSessionId);
//         setErrorMessage(`✅ 成功創建聊天會話：${newSessionId}`);

//         await fetchOpeningMessage(newSessionId);
//       } else {
//         setErrorMessage(`❌ 創建會話失敗：${data.message}`);
//       }
//     } catch (error) {
//       setErrorMessage(`❌ 創建會話錯誤：${error.message}`);
//       console.error('創建會話失敗:', error);
//     }
//   };

//   const fetchOpeningMessage = async (sessionId) => {
//     try {
//       const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/completions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
//         },
//         body: JSON.stringify({
//           question: "Hello",
//           stream: false,
//           session_id: sessionId,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP 錯誤：${response.status}`);
//       }

//       const data = await response.json();
//       console.log('開場白回應:', data);

//       if (data.code === 0) {
//         const content = data.data?.answer || 'No opening message received';
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       } else {
//         setErrorMessage(`❌ 獲取開場白失敗：${data.message}`);
//       }
//     } catch (error) {
//       setErrorMessage(`❌ 獲取開場白錯誤：${error.message}`);
//       console.error('獲取開場白失敗:', error);
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!userInput.trim()) {
//       setErrorMessage('❌ 請輸入問題！');
//       return;
//     }

//     if (!sessionId) {
//       setErrorMessage('❌ 請先創建聊天會話！');
//       return;
//     }

//     const newMessage = { role: 'user', content: userInput, created_at: new Date().toISOString() };
//     setCurrentMessages((prev) => [...prev, newMessage]);
//     setUserInput('');
//     setErrorMessage('');

//     try {
//       const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/completions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
//         },
//         body: JSON.stringify({
//           question: userInput,
//           stream: false,
//           session_id: sessionId,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP 錯誤：${response.status}`);
//       }

//       const data = await response.json();
//       console.log('API 回應:', data);

//       if (data.code === 0) {
//         const content = data.data?.answer || 'No content received from API';
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       } else {
//         setErrorMessage(`❌ 回應失敗：${data.message}`);
//       }
//     } catch (error) {
//       setErrorMessage(`❌ 發送訊息失敗：${error.message}`);
//       console.error('發送訊息失敗:', error);
//     }
//   };

//   const handleViewHistory = () => {
//     if (sessionId && currentMessages.length > 0) {
//       setChatHistory((prev) => {
//         const existingSession = prev.find((session) => session.sessionId === sessionId);
//         if (existingSession) {
//           existingSession.messages = [...currentMessages];
//           existingSession.createdAt = new Date().toISOString();
//           return [...prev];
//         } else {
//           return [
//             ...prev,
//             { sessionId, messages: [...currentMessages], createdAt: new Date().toISOString() },
//           ];
//         }
//       });
//     }
//     setOpenHistoryDialog(true);
//   };

//   const handleLoadHistory = (session) => {
//     setCurrentMessages(session.messages);
//     setSessionId(session.sessionId);
//     setOpenHistoryDialog(false);
//   };

//   const formatDateTime = (isoString) => {
//     const date = new Date(isoString);
//     return date.toLocaleString('zh-TW', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     });
//   };

//   const handleSubmit = async () => {
//     if (editorContent.length > 2000) {
//       alert('議論文內容超過 2000 字元，將自動分段儲存至資料庫');
//     }
//     if (noteContent.length > 2000) {
//       alert('筆記內容超過 2000 字元，將自動分段儲存至資料庫');
//     }

//     try {
//       const response = await apiAxios.post('/api/submit-to-notion', {
//         studentName: username || '未命名使用者',
//         theme: groupName || '未指定主題',
//         essayContent: editorContent || '無內容',
//         className: activityTitle || '未指定班級',
//         noteContent: noteContent || '',
//       });

//       if (response.data.success) {
//         alert('繳交上傳成功！');
//         setIsSubmitDisabled(true);
//       } else {
//         alert(`繳交上傳失敗：${response.data.message || '未知錯誤'}`);
//       }
//     } catch (error) {
//       console.error('發送到 Notion 時出錯:', error);
//       const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || '未知錯誤';
//       alert(`繳交上傳失敗：${errorMessage}`);
//     }
//   };

//   const handleConfirmSubmit = () => {
//     setOpenConfirmSubmitDialog(false);
//     handleSubmit();
//   };

//   const handleTempSave = () => {
//     setOpenTempSaveDialog(true);
//   };

//   const handleUpdateNote = async () => {
//     if (editorContent.length > 2000) {
//       console.log('議論文內容超過 2000 字元，將自動分段儲存');
//     }
//     if (noteContent.length > 2000) {
//       console.log('筆記內容超過 2000 字元，將自動分段儲存');
//     }

//     try {
//       const response = await apiAxios.patch('/api/update-note', {
//         studentName: username || '未命名使用者',
//         className: activityTitle || '未指定班級',
//         theme: groupName || '未指定主題',
//         noteContent: noteContent || '',
//         essayContent: editorContent || '',
//       });

//       if (response.data.success) {
//         console.log('筆記區和寫作區內容已更新到 Notion');
//       } else {
//         console.warn('更新筆記區和寫作區內容失敗:', response.data.error);
//       }
//     } catch (error) {
//       console.error('更新筆記區和寫作區內容時出錯:', error);
//       const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || '未知錯誤';
//       console.warn(`更新失敗：${errorMessage}`);
//     }
//   };

//   const config = {
//     placeholderText: '開始編輯...',
//     charCounterCount: false,
//     toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'fontFamily', 'backColor',
//       'align', 'orderedList', 'unorderedList', 'insertImage', 'insertTable', 'link', 'undo', 'redo',
//       'clearFormatting', 'fullscreen', 'html', 'insertHR', 'specialCharacters'],
//   };

//   const handleCloseReminderDialog = () => {
//     setOpenReminderDialog(false);
//   };

//   const handleCloseTempSaveDialog = () => {
//     setOpenTempSaveDialog(false);
//   };

//   const handleToggleNoteDrawer = () => {
//     setOpenNoteDrawer((prev) => {
//       if (prev) {
//         // 關閉時儲存筆記
//         localStorage.setItem('noteData', noteContent);
//         handleUpdateNote();
//       }
//       return !prev;
//     });
//   };

//   const handleNoteChange = (e) => {
//     setNoteContent(e.target.value);
//   };

//   return (
//     <div>
//       <Navbar />
//       <Box
//         sx={{
//           display: 'flex',
//           flexDirection: { xs: 'column', md: 'row' },
//           minHeight: 'calc(100vh - 120px)',
//           padding: '10px',
//           gap: '10px',
//         }}
//       >
//         {/* 左邊容器：聊天室 */}
//         <Box
//           sx={{
//             width: { md: '50%', xs: '100%' },
//             padding: '5px',
//             borderRight: { md: '1px solid #ccc', xs: 'none' },
//             display: 'flex',
//             flexDirection: 'column',
//             height: { md: '600px', sm: '800px', xs: 'auto' },
//             '@media (max-width: 700px)': {
//               height: '800px',
//             },
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '100px',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               padding: '0 10px',
//             }}
//           >
//             <span style={{ fontSize: '16px' }}>AI Writing Assistant</span>
//             <Box sx={{ display: 'flex', gap: '10px' }}>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleViewHistory}
//                 sx={{ fontSize: '12px', padding: '2px 6px' }}
//               >
//                 View History
//               </Button>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleCreateSession}
//                 sx={{ fontSize: '12px', padding: '2px 6px' }}
//               >
//                 Create New Chat
//               </Button>
//             </Box>
//           </Box>
//           <Box
//             sx={{
//               border: '2px solid black',
//               borderRadius: '8px',
//               padding: '10px',
//               flex: 1,
//               overflowY: 'auto',
//               backgroundColor: '#FFFFFF',
//               marginBottom: '5px',
//               marginTop: '10px',
//               display: 'flex',
//               flexDirection: 'column',
//             }}
//           >
//             {errorMessage && (
//               <Box
//                 sx={{
//                   mt: 1,
//                   p: 1,
//                   backgroundColor: '#f0f0f0',
//                   borderRadius: '4px',
//                   fontSize: '14px',
//                 }}
//               >
//                 {errorMessage}
//               </Box>
//             )}
//             <List
//               sx={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '5px' }}
//             >
//               {currentMessages.map((msg, index) => (
//                 <ListItem
//                   key={index}
//                   sx={{
//                     justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
//                     textAlign: msg.role === 'user' ? 'right' : 'left',
//                     marginBottom: '5px',
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       display: 'flex',
//                       flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
//                       alignItems: 'flex-start',
//                     }}
//                   >
//                     <Avatar
//                       alt={msg.role === 'user' ? 'User' : 'AI Assistant'}
//                       src={msg.role === 'user' ? userAvatar : assistantAvatar}
//                       sx={{ width: 40, height: 40, margin: '0 8px' }}
//                     />
//                     <Box
//                       sx={{
//                         maxWidth: '70%',
//                         p: 2,
//                         borderRadius: '8px',
//                         backgroundColor: msg.role === 'user' ? '#DCF8C6' : '#F0F0F0',
//                       }}
//                     >
//                       <ListItemText
//                         primary={msg.content || 'No content'}
//                         secondary={formatDateTime(msg.created_at)}
//                         sx={{ wordBreak: 'break-word' }}
//                       />
//                     </Box>
//                   </Box>
//                 </ListItem>
//               ))}
//               <div ref={chatEndRef} />
//             </List>
//             <Box sx={{ display: 'flex', mt: 2 }}>
//               <TextField
//                 fullWidth
//                 value={userInput}
//                 onChange={(e) => setUserInput(e.target.value)}
//                 placeholder="請輸入與寫作主題相關的內容..."
//                 onKeyPress={(e) => {
//                   if (e.key === 'Enter' && !e.shiftKey) {
//                     e.preventDefault();
//                     handleSendMessage();
//                   }
//                 }}
//                 variant="standard"
//                 sx={{ marginRight: '8px' }}
//               />
//               <IconButton
//                 color="primary"
//                 onClick={handleSendMessage}
//                 sx={{ padding: '8px' }}
//               >
//                 <img src={sendArrow} alt="Send" style={{ width: '40px', height: '40px' }} />
//               </IconButton>
//             </Box>
//           </Box>
//         </Box>

//         {/* 右邊容器：文字編輯器與側欄 */}
//         <Box
//           sx={{
//             width: { md: '50%', xs: '100%' },
//             borderLeft: { md: '1px solid #ccc', xs: 'none' },
//             position: 'relative',
//             height: { md: '600px', sm: '800px', xs: 'auto' },
//             display: 'flex',
//             flexDirection: 'row',
//             '@media (max-width: 700px)': {
//               width: '100%',
//               padding: '10px',
//               height: '800px',
//               borderLeft: 'none',
//             },
//             '@media (max-width: 600px)': {
//               width: '100%',
//             },
//           }}
//         >
//           {/* 編輯器區域 */}
//           <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
//             <Box
//               sx={{
//                 width: '100%',
//                 height: '100px',
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 backgroundColor: '#B7C5FF',
//                 fontSize: '18px',
//                 fontWeight: 'bold',
//                 padding: '0 10px',
//               }}
//             >
//               <Box>
//                 <span style={{ fontSize: '16px' }}>
//                   {username && `User: ${username}`}
//                   {activityTitle && ` Class: ${activityTitle}`}<br />
//                   {groupName && ` Topic: ${groupName}`}
//                 </span>
//               </Box>
//             </Box>
//             <Box sx={{ flex: 1, overflowY: 'auto' }}>
//               <FroalaEditor
//                 tag="textarea"
//                 config={config}
//                 model={editorContent}
//                 onModelChange={(value) => setEditorContent(value)}
//                 style={{ height: '100%' }}
//               />
//             </Box>
//             <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '10px' }}>
//               <Button
//                 variant="contained"
//                 color="secondary"
//                 onClick={handleTempSave}
//               >
//                 Temporary
//               </Button>
//               <Button
//                 variant="contained"
//                 color="secondary"
//                 onClick={() => setOpenConfirmSubmitDialog(true)}
//                 disabled={isSubmitDisabled}
//               >
//                 Submit
//               </Button>
//             </Box>
//           </Box>

//           {/* 側欄 */}
//           <Box
//             sx={{
//               width: '50px',
//               backgroundColor: 'transparent', // 透明背景
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               paddingTop: '10px',
//             }}
//           >
//             <IconButton
//               onClick={handleToggleNoteDrawer}
//               sx={{
//                 color: '#1976d2',
//                 '&:hover': {
//                   backgroundColor: 'rgba(0, 0, 0, 0.04)',
//                 },
//               }}
//             >
//               <NotesIcon />
//             </IconButton>
//           </Box>
//         </Box>
//       </Box>

//       {/* 提交確認提示 */}
//       <Dialog open={openConfirmSubmitDialog} onClose={() => setOpenConfirmSubmitDialog(false)}>
//         <DialogTitle>確認提交</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             您確定要提交嗎？提交後無法編輯內容。
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenConfirmSubmitDialog(false)} color="primary">
//             關閉
//           </Button>
//           <Button onClick={handleConfirmSubmit} color="primary" autoFocus>
//             確定
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openReminderDialog} onClose={handleCloseReminderDialog}>
//         <DialogTitle>通知</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             請先與 AI 寫作助理討論後再開始寫作！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseReminderDialog} color="primary">
//             好的！
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openTempSaveDialog} onClose={handleCloseTempSaveDialog}>
//         <DialogTitle>提示</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             暫存成功！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseTempSaveDialog} color="primary">
//             確定
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* 筆記側欄 Drawer */}
//       <Drawer
//         anchor="right"
//         open={openNoteDrawer}
//         onClose={handleToggleNoteDrawer}
//         sx={{
//           '& .MuiDrawer-paper': {
//             width: '500px',
//             maxWidth: '90vw',
//             height: '100%',
//             '@media (max-width: 600px)': {
//               width: '90vw',
//             },
//           },
//         }}
//       >
//         <Box sx={{ p: 2 }}>
//           <DialogTitle>筆記區域</DialogTitle>
//           <DialogContent>
//             <TextField
//               label="記下你的想法"
//               value={noteContent}
//               onChange={handleNoteChange}
//               multiline
//               rows={15}
//               fullWidth
//               variant="outlined"
//               sx={{ height: '90%' }}
//             />
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleToggleNoteDrawer} color="primary">
//               儲存並關閉
//             </Button>
//           </DialogActions>
//         </Box>
//       </Drawer>

//       {/* 歷史紀錄對話框 */}
//       <Dialog
//         open={openHistoryDialog}
//         onClose={() => setOpenHistoryDialog(false)}
//         sx={{
//           '& .MuiDialog-container .MuiPaper-root': {
//             width: '500px',
//             maxWidth: '90vw',
//           },
//         }}
//       >
//         <DialogTitle>聊天歷史紀錄</DialogTitle>
//         <DialogContent>
//           {chatHistory.length === 0 ? (
//             <DialogContentText>暫無歷史紀錄</DialogContentText>
//           ) : (
//             <List>
//               {chatHistory.map((session, index) => (
//                 <ListItem key={index} disablePadding>
//                   <ListItemButton onClick={() => handleLoadHistory(session)}>
//                     <ListItemText
//                       primary={`會話 ${session.sessionId}`}
//                       secondary={
//                         <>
//                           {`創建時間: ${formatDateTime(session.createdAt)}`}<br />
//                           {session.messages[0]?.content
//                             ? session.messages[0].content.substring(0, 50) + '...'
//                             : '無訊息'}
//                         </>
//                       }
//                     />
//                   </ListItemButton>
//                 </ListItem>
//               ))}
//             </List>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenHistoryDialog(false)} color="primary">
//             關閉
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default WritingArea;


// //加上筆記區側欄
// import React, { useState, useEffect, useRef } from 'react';
// import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, List, ListItem, ListItemText, Avatar, IconButton, ListItemButton, Drawer } from '@mui/material';
// import { Box } from '@mui/system';
// import FroalaEditor from 'react-froala-wysiwyg';
// import 'froala-editor/js/plugins.pkgd.min.js';
// import 'froala-editor/css/froala_editor.pkgd.min.css';
// import 'froala-editor/css/froala_style.min.css';
// import axios from 'axios';
// import Navbar from "../components/Navbar_Student";
// import userAvatar from "../assets/學生ICON.png";
// import assistantAvatar from "../assets/AI_LOGOICON.png";
// import sendArrow from '../assets/發送.png';
// import notesIcon from '../assets/筆記工具.png'; // 新增本地圖片

// const apiAxios = axios.create({
//   baseURL: 'http://140.115.126.27:4000',
//   timeout: 10000,
// });

// apiAxios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const WritingArea = () => {
//   const [editorContent, setEditorContent] = useState('');
//   const [openReminderDialog, setOpenReminderDialog] = useState(false);
//   const [openTempSaveDialog, setOpenTempSaveDialog] = useState(false);
//   const [openNoteDrawer, setOpenNoteDrawer] = useState(false);
//   const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
//   const [noteContent, setNoteContent] = useState('');
//   const [currentMessages, setCurrentMessages] = useState([]);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [userInput, setUserInput] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [sessionId, setSessionId] = useState('');
//   const [activityTitle, setActivityTitle] = useState('');
//   const [groupName, setGroupName] = useState('');
//   const [username, setUsername] = useState('');
//   const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
//   const [openConfirmSubmitDialog, setOpenConfirmSubmitDialog] = useState(false);
//   const chatEndRef = useRef(null);

//   const RAGFLOW_API_URL = 'https://ragflow.lazyinwork.com/api/v1';
//   const RAGFLOW_API_KEY = 'ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm';
//   const AGENT_ID = '8f34f200ef5911ef91480242ac120005';

//   const scrollToBottom = () => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [currentMessages]);

//   useEffect(() => {
//     const savedActivityTitle = localStorage.getItem('activityTitle');
//     if (savedActivityTitle) {
//       setActivityTitle(savedActivityTitle);
//     }

//     const savedGroupName = localStorage.getItem('groupName');
//     if (savedGroupName) {
//       setGroupName(savedGroupName);
//     }

//     const savedUsername = localStorage.getItem('name');
//     if (savedUsername && savedActivityTitle && savedGroupName) {
//       setUsername(savedUsername);

//       const fetchEssayContent = async () => {
//         try {
//           const response = await apiAxios.get(`/api/get-essay/${encodeURIComponent(savedUsername)}`, {
//             params: { className: savedActivityTitle, theme: savedGroupName },
//           });
//           if (response.data.success) {
//             setEditorContent(response.data.data.essayContent || '');
//             setNoteContent(response.data.data.noteContent || '');
//           } else {
//             console.warn('未找到符合學生姓名、班級和主題的議論文內容，使用空白內容');
//             setEditorContent('');
//             setNoteContent('');
//           }
//         } catch (error) {
//           console.error('從 Notion 獲取議論文內容失敗:', error);
//           setEditorContent('');
//           setNoteContent('');
//         }
//       };

//       fetchEssayContent();
//     }

//     const savedNote = localStorage.getItem('noteData');
//     if (savedNote) {
//       setNoteContent(savedNote);
//     }

//     setOpenReminderDialog(true);

//     handleCreateSession();
//   }, []);

//   const handleCreateSession = async () => {
//     if (sessionId && currentMessages.length > 0) {
//       setChatHistory((prev) => [
//         ...prev,
//         { sessionId, messages: [...currentMessages], createdAt: new Date().toISOString() },
//       ]);
//     }

//     setCurrentMessages([]);
//     setErrorMessage('');

//     try {
//       const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/sessions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
//         },
//         body: JSON.stringify({}),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP 錯誤：${response.status}`);
//       }

//       const data = await response.json();
//       console.log('創建會話回應:', data);

//       if (data.code === 0) {
//         const newSessionId = data.data?.id;
//         setSessionId(newSessionId);
//         setErrorMessage(`✅ 成功創建聊天會話：${newSessionId}`);

//         await fetchOpeningMessage(newSessionId);
//       } else {
//         setErrorMessage(`❌ 創建會話失敗：${data.message}`);
//       }
//     } catch (error) {
//       setErrorMessage(`❌ 創建會話錯誤：${error.message}`);
//       console.error('創建會話失敗:', error);
//     }
//   };

//   const fetchOpeningMessage = async (sessionId) => {
//     try {
//       const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/completions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
//         },
//         body: JSON.stringify({
//           question: "Hello",
//           stream: false,
//           session_id: sessionId,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP 錯誤：${response.status}`);
//       }

//       const data = await response.json();
//       console.log('開場白回應:', data);

//       if (data.code === 0) {
//         const content = data.data?.answer || 'No opening message received';
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       } else {
//         setErrorMessage(`❌ 獲取開場白失敗：${data.message}`);
//       }
//     } catch (error) {
//       setErrorMessage(`❌ 獲取開場白錯誤：${error.message}`);
//       console.error('獲取開場白失敗:', error);
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!userInput.trim()) {
//       setErrorMessage('❌ 請輸入問題！');
//       return;
//     }

//     if (!sessionId) {
//       setErrorMessage('❌ 請先創建聊天會話！');
//       return;
//     }

//     const newMessage = { role: 'user', content: userInput, created_at: new Date().toISOString() };
//     setCurrentMessages((prev) => [...prev, newMessage]);
//     setUserInput('');
//     setErrorMessage('');

//     try {
//       const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/completions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
//         },
//         body: JSON.stringify({
//           question: userInput,
//           stream: false,
//           session_id: sessionId,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP 錯誤：${response.status}`);
//       }

//       const data = await response.json();
//       console.log('API 回應:', data);

//       if (data.code === 0) {
//         const content = data.data?.answer || 'No content received from API';
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       } else {
//         setErrorMessage(`❌ 回應失敗：${data.message}`);
//       }
//     } catch (error) {
//       setErrorMessage(`❌ 發送訊息失敗：${error.message}`);
//       console.error('發送訊息失敗:', error);
//     }
//   };

//   const handleViewHistory = () => {
//     if (sessionId && currentMessages.length > 0) {
//       setChatHistory((prev) => {
//         const existingSession = prev.find((session) => session.sessionId === sessionId);
//         if (existingSession) {
//           existingSession.messages = [...currentMessages];
//           existingSession.createdAt = new Date().toISOString();
//           return [...prev];
//         } else {
//           return [
//             ...prev,
//             { sessionId, messages: [...currentMessages], createdAt: new Date().toISOString() },
//           ];
//         }
//       });
//     }
//     setOpenHistoryDialog(true);
//   };

//   const handleLoadHistory = (session) => {
//     setCurrentMessages(session.messages);
//     setSessionId(session.sessionId);
//     setOpenHistoryDialog(false);
//   };

//   const formatDateTime = (isoString) => {
//     const date = new Date(isoString);
//     return date.toLocaleString('zh-TW', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     });
//   };

//   const handleSubmit = async () => {
//     if (editorContent.length > 2000) {
//       alert('議論文內容超過 2000 字元，將自動分段儲存至資料庫');
//     }
//     if (noteContent.length > 2000) {
//       alert('筆記內容超過 2000 字元，將自動分段儲存至資料庫');
//     }

//     try {
//       const response = await apiAxios.post('/api/submit-to-notion', {
//         studentName: username || '未命名使用者',
//         theme: groupName || '未指定主題',
//         essayContent: editorContent || '無內容',
//         className: activityTitle || '未指定班級',
//         noteContent: noteContent || '',
//       });

//       if (response.data.success) {
//         alert('繳交上傳成功！');
//         setIsSubmitDisabled(true);
//       } else {
//         alert(`繳交上傳失敗：${response.data.message || '未知錯誤'}`);
//       }
//     } catch (error) {
//       console.error('發送到 Notion 時出錯:', error);
//       const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || '未知錯誤';
//       alert(`繳交上傳失敗：${errorMessage}`);
//     }
//   };

//   const handleConfirmSubmit = () => {
//     setOpenConfirmSubmitDialog(false);
//     handleSubmit();
//   };

//   const handleTempSave =  () => {
//     setOpenTempSaveDialog(true);
//   };

//   const handleUpdateNote = async () => {
//     if (editorContent.length > 2000) {
//       console.log('議論文內容超過 2000 字元，將自動分段儲存');
//     }
//     if (noteContent.length > 2000) {
//       console.log('筆記內容超過 2000 字元，將自動分段儲存');
//     }

//     try {
//       const response = await apiAxios.patch('/api/update-note', {
//         studentName: username || '未命名使用者',
//         className: activityTitle || '未指定班級',
//         theme: groupName || '未指定主題',
//         noteContent: noteContent || '',
//         essayContent: editorContent || '',
//       });

//       if (response.data.success) {
//         console.log('筆記區和寫作區內容已更新到 Notion');
//       } else {
//         console.warn('更新筆記區和寫作區內容失敗:', response.data.error);
//       }
//     } catch (error) {
//       console.error('更新筆記區和寫作區內容時出錯:', error);
//       const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || '未知錯誤';
//       console.warn(`更新失敗：${errorMessage}`);
//     }
//   };

//   const config = {
//     placeholderText: '開始編輯...',
//     charCounterCount: false,
//     toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'fontFamily', 'backColor',
//       'align', 'orderedList', 'unorderedList', 'insertImage', 'insertTable', 'link', 'undo', 'redo',
//       'clearFormatting', 'fullscreen', 'html', 'insertHR', 'specialCharacters'],
//   };

//   const handleCloseReminderDialog = () => {
//     setOpenReminderDialog(false);
//   };

//   const handleCloseTempSaveDialog = () => {
//     setOpenTempSaveDialog(false);
//   };

//   const handleToggleNoteDrawer = () => {
//     setOpenNoteDrawer((prev) => {
//       if (prev) {
//         // 關閉時儲存筆記
//         localStorage.setItem('noteData', noteContent);
//         handleUpdateNote();
//       }
//       return !prev;
//     });
//   };

//   const handleNoteChange = (e) => {
//     setNoteContent(e.target.value);
//   };

//   return (
//     <div>
//       <Navbar />
//       <Box
//         sx={{
//           display: 'flex',
//           flexDirection: { xs: 'column', md: 'row' },
//           minHeight: 'calc(100vh - 120px)',
//           padding: '10px',
//           gap: '10px',
//         }}
//       >
//         {/* 左邊容器：聊天室 */}
//         <Box
//           sx={{
//             width: { md: '50%', xs: '100%' },
//             padding: '5px',
//             borderRight: { md: '1px solid #ccc', xs: 'none' },
//             display: 'flex',
//             flexDirection: 'column',
//             height: { md: '600px', sm: '800px', xs: 'auto' },
//             '@media (max-width: 700px)': {
//               height: '800px',
//             },
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '100px',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               backgroundColor: '#B7C5FF',
//               fontSize: '18px',
//               fontWeight: 'bold',
//               padding: '0 10px',
//             }}
//           >
//             <span style={{ fontSize: '16px' }}>AI Writing Assistant</span>
//             <Box sx={{ display: 'flex', gap: '10px' }}>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleViewHistory}
//                 sx={{ fontSize: '12px', padding: '2px 6px' }}
//               >
//                 View History
//               </Button>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={handleCreateSession}
//                 sx={{ fontSize: '12px', padding: '2px 6px' }}
//               >
//                 Create New Chat
//               </Button>
//             </Box>
//           </Box>
//           <Box
//             sx={{
//               border: '2px solid black',
//               borderRadius: '8px',
//               padding: '10px',
//               flex: 1,
//               overflowY: 'auto',
//               backgroundColor: '#FFFFFF',
//               marginBottom: '5px',
//               marginTop: '10px',
//               display: 'flex',
//               flexDirection: 'column',
//             }}
//           >
//             {errorMessage && (
//               <Box
//                 sx={{
//                   mt: 1,
//                   p: 1,
//                   backgroundColor: '#f0f0f0',
//                   borderRadius: '4px',
//                   fontSize: '14px',
//                 }}
//               >
//                 {errorMessage}
//               </Box>
//             )}
//             <List
//               sx={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '5px' }}
//             >
//               {currentMessages.map((msg, index) => (
//                 <ListItem
//                   key={index}
//                   sx={{
//                     justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
//                     textAlign: msg.role === 'user' ? 'right' : 'left',
//                     marginBottom: '5px',
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       display: 'flex',
//                       flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
//                       alignItems: 'flex-start',
//                     }}
//                   >
//                     <Avatar
//                       alt={msg.role === 'user' ? 'User' : 'AI Assistant'}
//                       src={msg.role === 'user' ? userAvatar : assistantAvatar}
//                       sx={{ width: 40, height: 40, margin: '0 8px' }}
//                     />
//                     <Box
//                       sx={{
//                         maxWidth: '70%',
//                         p: 2,
//                         borderRadius: '8px',
//                         backgroundColor: msg.role === 'user' ? '#DCF8C6' : '#F0F0F0',
//                       }}
//                     >
//                       <ListItemText
//                         primary={msg.content || 'No content'}
//                         secondary={formatDateTime(msg.created_at)}
//                         sx={{ wordBreak: 'break-word' }}
//                       />
//                     </Box>
//                   </Box>
//                 </ListItem>
//               ))}
//               <div ref={chatEndRef} />
//             </List>
//             <Box sx={{ display: 'flex', mt: 2 }}>
//               <TextField
//                 fullWidth
//                 value={userInput}
//                 onChange={(e) => setUserInput(e.target.value)}
//                 placeholder="請輸入與寫作主題相關的內容..."
//                 onKeyPress={(e) => {
//                   if (e.key === 'Enter' && !e.shiftKey) {
//                     e.preventDefault();
//                     handleSendMessage();
//                   }
//                 }}
//                 variant="standard"
//                 sx={{ marginRight: '8px' }}
//               />
//               <IconButton
//                 color="primary"
//                 onClick={handleSendMessage}
//                 sx={{ padding: '8px' }}
//               >
//                 <img src={sendArrow} alt="Send" style={{ width: '40px', height: '40px' }} />
//               </IconButton>
//             </Box>
//           </Box>
//         </Box>

//         {/* 右邊容器：文字編輯器與側欄 */}
//         <Box
//           sx={{
//             width: { md: '50%', xs: '100%' },
//             borderLeft: { md: '1px solid #ccc', xs: 'none' },
//             position: 'relative',
//             height: { md: '600px', sm: '800px', xs: 'auto' },
//             display: 'flex',
//             flexDirection: 'row',
//             '@media (max-width: 700px)': {
//               width: '100%',
//               padding: '10px',
//               height: '800px',
//               borderLeft: 'none',
//             },
//             '@media (max-width: 600px)': {
//               width: '100%',
//             },
//           }}
//         >
//           {/* 編輯器區域 */}
//           <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
//             <Box
//               sx={{
//                 width: '100%',
//                 height: '100px',
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 backgroundColor: '#B7C5FF',
//                 fontSize: '18px',
//                 fontWeight: 'bold',
//                 padding: '0 10px',
//               }}
//             >
//               <Box>
//                 <span style={{ fontSize: '16px' }}>
//                   {username && `User: ${username}`}
//                   {activityTitle && ` Class: ${activityTitle}`}<br />
//                   {groupName && ` Topic: ${groupName}`}
//                 </span>
//               </Box>


//             {/* 側欄 */}
//           <Box
//             sx={{
//               width: '50px',
//               backgroundColor: 'transparent',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               paddingTop: '10px',
//             }}
//           >
//             <IconButton
//               onClick={handleToggleNoteDrawer}
//               sx={{
//                 color: '#1976d2',
//                 '&:hover': {
//                   backgroundColor: 'rgba(0, 0, 0, 0.04)',
//                 },
//               }}
//             >
//               <img src={notesIcon} alt="Notes" style={{ width: '24px', height: '24px' }} />
//             </IconButton>
//           </Box>

//             </Box>
//             <Box sx={{ flex: 1, overflowY: 'auto' }}>
//               <FroalaEditor
//                 tag="textarea"
//                 config={config}
//                 model={editorContent}
//                 onModelChange={(value) => setEditorContent(value)}
//                 style={{ height: '100%' }}
//               />
//             </Box>
//             <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '10px' }}>
//               <Button
//                 variant="contained"
//                 color="secondary"
//                 onClick={handleTempSave}
//               >
//                 Temporary
//               </Button>
//               <Button
//                 variant="contained"
//                 color="secondary"
//                 onClick={() => setOpenConfirmSubmitDialog(true)}
//                 disabled={isSubmitDisabled}
//               >
//                 Submit
//               </Button>
//             </Box>
//           </Box>

          
//         </Box>
//       </Box>

//       {/* 提交確認提示 */}
//       <Dialog open={openConfirmSubmitDialog} onClose={() => setOpenConfirmSubmitDialog(false)}>
//         <DialogTitle>確認提交</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             您確定要提交嗎？提交後無法編輯內容。
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenConfirmSubmitDialog(false)} color="primary">
//             關閉
//           </Button>
//           <Button onClick={handleConfirmSubmit} color="primary" autoFocus>
//             確定
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openReminderDialog} onClose={handleCloseReminderDialog}>
//         <DialogTitle>通知</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             請先與 AI 寫作助理討論後再開始寫作！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseReminderDialog} color="primary">
//             好的！
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openTempSaveDialog} onClose={handleCloseTempSaveDialog}>
//         <DialogTitle>提示</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             暫存成功！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseTempSaveDialog} color="primary">
//             確定
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* 筆記側欄 Drawer */}
//       <Drawer
//         anchor="right"
//         open={openNoteDrawer}
//         onClose={handleToggleNoteDrawer}
//         sx={{
//           '& .MuiDrawer-paper': {
//             width: '500px',
//             maxWidth: '90vw',
//             height: '100%',
//             '@media (max-width: 600px)': {
//               width: '90vw',
//             },
//           },
//         }}
//       >
//         <Box sx={{ p: 2 }}>
//           <DialogTitle>Note Area</DialogTitle>
//           <DialogContent>
//             <TextField
//               label="Jot down your ideas"
//               value={noteContent}
//               onChange={handleNoteChange}
//               multiline
//               rows={15}
//               fullWidth
//               variant="outlined"
//               sx={{ height: '90%' }}
//             />
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleToggleNoteDrawer} color="primary">
//               Save & Close
//             </Button>
//           </DialogActions>
//         </Box>
//       </Drawer>

//       {/* 歷史紀錄對話框 */}
//       <Dialog
//         open={openHistoryDialog}
//         onClose={() => setOpenHistoryDialog(false)}
//         sx={{
//           '& .MuiDialog-container .MuiPaper-root': {
//             width: '500px',
//             maxWidth: '90vw',
//           },
//         }}
//       >
//         <DialogTitle>聊天歷史紀錄</DialogTitle>
//         <DialogContent>
//           {chatHistory.length === 0 ? (
//             <DialogContentText>暫無歷史紀錄</DialogContentText>
//           ) : (
//             <List>
//               {chatHistory.map((session, index) => (
//                 <ListItem key={index} disablePadding>
//                   <ListItemButton onClick={() => handleLoadHistory(session)}>
//                     <ListItemText
//                       primary={`會話 ${session.sessionId}`}
//                       secondary={
//                         <>
//                           {`創建時間: ${formatDateTime(session.createdAt)}`}<br />
//                           {session.messages[0]?.content
//                             ? session.messages[0].content.substring(0, 50) + '...'
//                             : '無訊息'}
//                         </>
//                       }
//                     />
//                   </ListItemButton>
//                 </ListItem>
//               ))}
//             </List>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenHistoryDialog(false)} color="primary">
//             關閉
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default WritingArea;


// //兩邊側欄
// import React, { useState, useEffect, useRef } from 'react';
// import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, List, ListItem, ListItemText, Avatar, IconButton, ListItemButton, Drawer, Tooltip } from '@mui/material';
// import { Box } from '@mui/system';
// import FroalaEditor from 'react-froala-wysiwyg';
// import 'froala-editor/js/plugins.pkgd.min.js';
// import 'froala-editor/css/froala_editor.pkgd.min.css';
// import 'froala-editor/css/froala_style.min.css';
// import axios from 'axios';
// import Navbar from "../components/Navbar_Student";
// import userAvatar from "../assets/學生ICON.png";
// import assistantAvatar from "../assets/AI_LOGOICON.png";
// import sendArrow from '../assets/發送.png';
// import notesIcon from '../assets/筆記工具.png';
// import MenuIcon from '../assets/側欄ICON.png'; // 新增側欄展開圖示
// import HelpOutline from '@mui/icons-material/HelpOutline';

// const apiAxios = axios.create({
//   baseURL: 'http://140.115.126.27:4000',
//   timeout: 10000,
// });

// apiAxios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const WritingArea = () => {
//   const [editorContent, setEditorContent] = useState('');
//   const [openReminderDialog, setOpenReminderDialog] = useState(false);
//   const [openTempSaveDialog, setOpenTempSaveDialog] = useState(false);
//   const [openNoteDrawer, setOpenNoteDrawer] = useState(false);
//   const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
//   const [openChatSidebar, setOpenChatSidebar] = useState(false); // 新增聊天室側欄狀態
//   const [noteContent, setNoteContent] = useState('');
//   const [currentMessages, setCurrentMessages] = useState([]);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [userInput, setUserInput] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [sessionId, setSessionId] = useState('');
//   const [activityTitle, setActivityTitle] = useState('');
//   const [groupName, setGroupName] = useState('');
//   const [username, setUsername] = useState('');
//   const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
//   const [openConfirmSubmitDialog, setOpenConfirmSubmitDialog] = useState(false);
//   const chatEndRef = useRef(null);

//   const RAGFLOW_API_URL = 'https://ragflow.lazyinwork.com/api/v1';
//   const RAGFLOW_API_KEY = 'ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm';
//   const AGENT_ID = '8f34f200ef5911ef91480242ac120005';

//   const scrollToBottom = () => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [currentMessages]);

//   useEffect(() => {
//     const savedActivityTitle = localStorage.getItem('activityTitle');
//     if (savedActivityTitle) {
//       setActivityTitle(savedActivityTitle);
//     }

//     const savedGroupName = localStorage.getItem('groupName');
//     if (savedGroupName) {
//       setGroupName(savedGroupName);
//     }

//     const savedUsername = localStorage.getItem('name');
//     if (savedUsername && savedActivityTitle && savedGroupName) {
//       setUsername(savedUsername);

//       const fetchEssayContent = async () => {
//         try {
//           const response = await apiAxios.get(`/api/get-essay/${encodeURIComponent(savedUsername)}`, {
//             params: { className: savedActivityTitle, theme: savedGroupName },
//           });
//           if (response.data.success) {
//             setEditorContent(response.data.data.essayContent || '');
//             setNoteContent(response.data.data.noteContent || '');
//           } else {
//             console.warn('未找到符合學生姓名、班級和主題的議論文內容，使用空白內容');
//             setEditorContent('');
//             setNoteContent('');
//           }
//         } catch (error) {
//           console.error('從 Notion 獲取議論文內容失敗:', error);
//           setEditorContent('');
//           setNoteContent('');
//         }
//       };

//       fetchEssayContent();
//     }

//     const savedNote = localStorage.getItem('noteData');
//     if (savedNote) {
//       setNoteContent(savedNote);
//     }

//     setOpenReminderDialog(true);

//     handleCreateSession();
//   }, []);

//   const handleCreateSession = async () => {
//     if (sessionId && currentMessages.length > 0) {
//       setChatHistory((prev) => [
//         ...prev,
//         { sessionId, messages: [...currentMessages], createdAt: new Date().toISOString() },
//       ]);
//     }

//     setCurrentMessages([]);
//     setErrorMessage('');

//     try {
//       const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/sessions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
//         },
//         body: JSON.stringify({}),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP 錯誤：${response.status}`);
//       }

//       const data = await response.json();
//       console.log('創建會話回應:', data);

//       if (data.code === 0) {
//         const newSessionId = data.data?.id;
//         setSessionId(newSessionId);
//         setErrorMessage(`✅ 成功創建聊天會話：${newSessionId}`);

//         await fetchOpeningMessage(newSessionId);
//       } else {
//         setErrorMessage(`❌ 創建會話失敗：${data.message}`);
//       }
//     } catch (error) {
//       setErrorMessage(`❌ 創建會話錯誤：${error.message}`);
//       console.error('創建會話失敗:', error);
//     }
//   };

//   const fetchOpeningMessage = async (sessionId) => {
//     try {
//       const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/completions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
//         },
//         body: JSON.stringify({
//           question: "Hello",
//           stream: false,
//           session_id: sessionId,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP 錯誤：${response.status}`);
//       }

//       const data = await response.json();
//       console.log('開場白回應:', data);

//       if (data.code === 0) {
//         const content = data.data?.answer || 'No opening message received';
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       } else {
//         setErrorMessage(`❌ 獲取開場白失敗：${data.message}`);
//       }
//     } catch (error) {
//       setErrorMessage(`❌ 獲取開場白錯誤：${error.message}`);
//       console.error('獲取開場白失敗:', error);
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!userInput.trim()) {
//       setErrorMessage('❌ 請輸入問題！');
//       return;
//     }

//     if (!sessionId) {
//       setErrorMessage('❌ 請先創建聊天會話！');
//       return;
//     }

//     const newMessage = { role: 'user', content: userInput, created_at: new Date().toISOString() };
//     setCurrentMessages((prev) => [...prev, newMessage]);
//     setUserInput('');
//     setErrorMessage('');

//     try {
//       const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/completions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
//         },
//         body: JSON.stringify({
//           question: userInput,
//           stream: false,
//           session_id: sessionId,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP 錯誤：${response.status}`);
//       }

//       const data = await response.json();
//       console.log('API 回應:', data);

//       if (data.code === 0) {
//         const content = data.data?.answer || 'No content received from API';
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       } else {
//         setErrorMessage(`❌ 回應失敗：${data.message}`);
//       }
//     } catch (error) {
//       setErrorMessage(`❌ 發送訊息失敗：${error.message}`);
//       console.error('發送訊息失敗:', error);
//     }
//   };

//   const handleViewHistory = () => {
//     if (sessionId && currentMessages.length > 0) {
//       setChatHistory((prev) => {
//         const existingSession = prev.find((session) => session.sessionId === sessionId);
//         if (existingSession) {
//           existingSession.messages = [...currentMessages];
//           existingSession.createdAt = new Date().toISOString();
//           return [...prev];
//         } else {
//           return [
//             ...prev,
//             { sessionId, messages: [...currentMessages], createdAt: new Date().toISOString() },
//           ];
//         }
//       });
//     }
//     setOpenHistoryDialog(true);
//   };

//   const handleLoadHistory = (session) => {
//     setCurrentMessages(session.messages);
//     setSessionId(session.sessionId);
//     setOpenHistoryDialog(false);
//   };

//   const formatDateTime = (isoString) => {
//     const date = new Date(isoString);
//     return date.toLocaleString('zh-TW', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     });
//   };

//   const handleSubmit = async () => {
//     if (editorContent.length > 2000) {
//       alert('議論文內容超過 2000 字元，將自動分段儲存至資料庫');
//     }
//     if (noteContent.length > 2000) {
//       alert('筆記內容超過 2000 字元，將自動分段儲存至資料庫');
//     }

//     try {
//       const response = await apiAxios.post('/api/submit-to-notion', {
//         studentName: username || '未命名使用者',
//         theme: groupName || '未指定主題',
//         essayContent: editorContent || '無內容',
//         className: activityTitle || '未指定班級',
//         noteContent: noteContent || '',
//       });

//       if (response.data.success) {
//         alert('繳交上傳成功！');
//         setIsSubmitDisabled(true);
//       } else {
//         alert(`繳交上傳失敗：${response.data.message || '未知錯誤'}`);
//       }
//     } catch (error) {
//       console.error('發送到 Notion 時出錯:', error);
//       const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || '未知錯誤';
//       alert(`繳交上傳失敗：${errorMessage}`);
//     }
//   };

//   const handleConfirmSubmit = () => {
//     setOpenConfirmSubmitDialog(false);
//     handleSubmit();
//   };

//   const handleTempSave = () => {
//     setOpenTempSaveDialog(true);
//   };

//   const handleUpdateNote = async () => {
//     if (editorContent.length > 2000) {
//       console.log('議論文內容超過 2000 字元，將自動分段儲存');
//     }
//     if (noteContent.length > 2000) {
//       console.log('筆記內容超過 2000 字元，將自動分段儲存');
//     }

//     try {
//       const response = await apiAxios.patch('/api/update-note', {
//         studentName: username || '未命名使用者',
//         className: activityTitle || '未指定班級',
//         theme: groupName || '未指定主題',
//         noteContent: noteContent || '',
//         essayContent: editorContent || '',
//       });

//       if (response.data.success) {
//         console.log('筆記區和寫作區內容已更新到 Notion');
//       } else {
//         console.warn('更新筆記區和寫作區內容失敗:', response.data.error);
//       }
//     } catch (error) {
//       console.error('更新筆記區和寫作區內容時出錯:', error);
//       const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || '未知錯誤';
//       console.warn(`更新失敗：${errorMessage}`);
//     }
//   };

//   const config = {
//     placeholderText: '開始編輯...',
//     charCounterCount: false,
//     toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'fontFamily', 'backColor',
//       'align', 'orderedList', 'unorderedList', 'insertImage', 'insertTable', 'link', 'undo', 'redo',
//       'clearFormatting', 'fullscreen', 'html', 'insertHR', 'specialCharacters'],
//   };

//   const handleCloseReminderDialog = () => {
//     setOpenReminderDialog(false);
//   };

//   const handleCloseTempSaveDialog = () => {
//     setOpenTempSaveDialog(false);
//   };

//   const handleToggleNoteDrawer = () => {
//     setOpenNoteDrawer((prev) => {
//       if (prev) {
//         localStorage.setItem('noteData', noteContent);
//         handleUpdateNote();
//       }
//       return !prev;
//     });
//   };

//   const handleNoteChange = (e) => {
//     setNoteContent(e.target.value);
//   };

//   const handleToggleChatSidebar = () => {
//     setOpenChatSidebar((prev) => !prev);
//   };

//   return (
//     <div>
//       <Navbar />
//       <Box
//         sx={{
//           display: 'flex',
//           flexDirection: { xs: 'column', md: 'row' },
//           minHeight: 'calc(100vh - 120px)',
//           padding: '10px',
//           gap: '10px',
//         }}
//       >
//         {/* 左邊容器：聊天室與側欄 */}
//         <Box
//           sx={{
//             width: { md: '50%', xs: '100%' },
//             padding: '5px',
//             borderRight: { md: '1px solid #ccc', xs: 'none' },
//             display: 'flex',
//             flexDirection: 'row',
//             height: { md: '600px', sm: '800px', xs: 'auto' },
//             '@media (max-width: 700px)': {
//               height: '800px',
//             },
//           }}
//         >
          

//           {/* 聊天室區域 */}
//           <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
//             <Box
//               sx={{
//                 width: '100%',
//                 height: '100px',
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 backgroundColor: '#B7C5FF',
//                 fontSize: '18px',
//                 fontWeight: 'bold',
//                 padding: '0 10px',
//               }}
//             >

//                 {/* 聊天室側欄 */}
//           <Box
//             sx={{
//               width: '50px',
//               backgroundColor: 'transparent',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               paddingTop: '10px',
//             }}
//           >
//             <IconButton
//               onClick={handleToggleChatSidebar}
//               sx={{
//                 color: '#1976d2',
//                 '&:hover': {
//                   backgroundColor: 'rgba(0, 0, 0, 0.04)',
//                 },
//               }}
//             >
//               <img src={MenuIcon} alt="Menu" style={{ width: '24px', height: '24px' }} />
//             </IconButton>
//           </Box>

//               <span style={{ fontSize: '16px' }}>AI Writing Assistant</span>
//             <Tooltip
//             title="I'm here to help you brainstorm, explore, and organize your ideas for a great essay！"
//             placement="top"
//             arrow
//             >
//             <IconButton sx={{ padding: 0, color: '#000000' }}>
//             <HelpOutline sx={{ fontSize: '28px' }} />
//             </IconButton>
//             </Tooltip>

//             </Box>
//             <Box
//               sx={{
//                 border: '2px solid black',
//                 borderRadius: '8px',
//                 padding: '10px',
//                 flex: 1,
//                 overflowY: 'auto',
//                 backgroundColor: '#FFFFFF',
//                 marginBottom: '5px',
//                 marginTop: '10px',
//                 display: 'flex',
//                 flexDirection: 'column',
//               }}
//             >
//               {errorMessage && (
//                 <Box
//                   sx={{
//                     mt: 1,
//                     p: 1,
//                     backgroundColor: '#f0f0f0',
//                     borderRadius: '4px',
//                     fontSize: '14px',
//                   }}
//                 >
//                   {errorMessage}
//                 </Box>
//               )}
//               <List
//                 sx={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '5px' }}
//               >
//                 {currentMessages.map((msg, index) => (
//                   <ListItem
//                     key={index}
//                     sx={{
//                       justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
//                       textAlign: msg.role === 'user' ? 'right' : 'left',
//                       marginBottom: '5px',
//                     }}
//                   >
//                     <Box
//                       sx={{
//                         display: 'flex',
//                         flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
//                         alignItems: 'flex-start',
//                       }}
//                     >
//                       <Avatar
//                         alt={msg.role === 'user' ? 'User' : 'AI Assistant'}
//                         src={msg.role === 'user' ? userAvatar : assistantAvatar}
//                         sx={{ width: 40, height: 40, margin: '0 8px' }}
//                       />
//                       <Box
//                         sx={{
//                           maxWidth: '80%',
//                           p: 2,
//                           borderRadius: '8px',
//                           backgroundColor: msg.role === 'user' ? '#DCF8C6' : '#F0F0F0',
//                         }}
//                       >
//                         <ListItemText
//                           primary={msg.content || 'No content'}
//                           secondary={formatDateTime(msg.created_at)}
//                           sx={{ wordBreak: 'break-word', 
//                           textAlign: 'left', // 確保文字左對齊
//                           }}
                          
//                         />
//                       </Box>
//                     </Box>
//                   </ListItem>
//                 ))}
//                 <div ref={chatEndRef} />
//               </List>
//               <Box sx={{ display: 'flex', mt: 2 }}>
//                 <TextField
//                   fullWidth
//                   value={userInput}
//                   onChange={(e) => setUserInput(e.target.value)}
//                   placeholder="請輸入與寫作主題相關的內容..."
//                   onKeyPress={(e) => {
//                     if (e.key === 'Enter' && !e.shiftKey) {
//                       e.preventDefault();
//                       handleSendMessage();
//                     }
//                   }}
//                   variant="standard"
//                   sx={{ marginRight: '8px' }}
//                 />
//                 <IconButton
//                   color="primary"
//                   onClick={handleSendMessage}
//                   sx={{ padding: '8px' }}
//                 >
//                   <img src={sendArrow} alt="Send" style={{ width: '40px', height: '40px' }} />
//                 </IconButton>
//               </Box>
//             </Box>
//           </Box>
//         </Box>

//         {/* 右邊容器：文字編輯器與側欄 */}
//         <Box
//           sx={{
//             width: { md: '50%', xs: '100%' },
//             borderLeft: { md: '1px solid #ccc', xs: 'none' },
//             position: 'relative',
//             height: { md: '600px', sm: '800px', xs: 'auto' },
//             display: 'flex',
//             flexDirection: 'row',
//             '@media (max-width: 700px)': {
//               width: '100%',
//               padding: '10px',
//               height: '800px',
//               borderLeft: 'none',
//             },
//             '@media (max-width: 600px)': {
//               width: '100%',
//             },
//           }}
//         >
//           {/* 編輯器區域 */}
//           <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
//             <Box
//               sx={{
//                 width: '100%',
//                 height: '100px',
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 backgroundColor: '#B7C5FF',
//                 fontSize: '18px',
//                 fontWeight: 'bold',
//                 padding: '0 10px',
//               }}
//             >
//               <Box>
//                 <span style={{ fontSize: '16px' }}>
//                   {username && `User: ${username}`}
//                   {activityTitle && ` Class: ${activityTitle}`}<br />
//                   {groupName && ` Topic: ${groupName}`}
//                 </span>
//               </Box>

//               {/* 筆記側欄 */}
//           <Box
//             sx={{
//               width: '50px',
//               backgroundColor: 'transparent',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               paddingTop: '10px',
//             }}
//           >
//             <IconButton
//               onClick={handleToggleNoteDrawer}
//               sx={{
//                 color: '#1976d2',
//                 '&:hover': {
//                   backgroundColor: 'rgba(0, 0, 0, 0.04)',
//                 },
//               }}
//             >
//               <img src={notesIcon} alt="Notes" style={{ width: '24px', height: '24px' }} />
//             </IconButton>
//           </Box>

//             </Box>
//             <Box sx={{ flex: 1, overflowY: 'auto' }}>
//               <FroalaEditor
//                 tag="textarea"
//                 config={config}
//                 model={editorContent}
//                 onModelChange={(value) => setEditorContent(value)}
//                 style={{ height: '100%' }}
//               />
//             </Box>
//             <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '10px' }}>
//               <Button
//                 variant="contained"
//                 color="secondary"
//                 onClick={handleTempSave}
//               >
//                 Temporary
//               </Button>
//               <Button
//                 variant="contained"
//                 color="secondary"
//                 onClick={() => setOpenConfirmSubmitDialog(true)}
//                 disabled={isSubmitDisabled}
//               >
//                 Submit
//               </Button>
//             </Box>
//           </Box>

          
//         </Box>
//       </Box>

//       {/* 提交確認提示 */}
//       <Dialog open={openConfirmSubmitDialog} onClose={() => setOpenConfirmSubmitDialog(false)}>
//         <DialogTitle>確認提交</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             您確定要提交嗎？提交後無法編輯內容。
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenConfirmSubmitDialog(false)} color="primary">
//             關閉
//           </Button>
//           <Button onClick={handleConfirmSubmit} color="primary" autoFocus>
//             確定
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openReminderDialog} onClose={handleCloseReminderDialog}>
//         <DialogTitle>Notice</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Please discuss with the AI Writing Assistant before you start writing!
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseReminderDialog} color="primary">
//             OK！
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openTempSaveDialog} onClose={handleCloseTempSaveDialog}>
//         <DialogTitle>提示</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             暫存成功！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseTempSaveDialog} color="primary">
//             確定
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* 筆記側欄 Drawer */}
//       <Drawer
//         anchor="right"
//         open={openNoteDrawer}
//         onClose={handleToggleNoteDrawer}
//         sx={{
//           '& .MuiDrawer-paper': {
//             width: '500px',
//             maxWidth: '90vw',
//             height: '100%',
//             '@media (max-width: 600px)': {
//               width: '90vw',
//             },
//           },
//         }}
//       >
//         <Box sx={{ p: 2 }}>
//           <DialogTitle>Note Area</DialogTitle>

//           <Tooltip
//             title="Capture your thoughts before they fly away！"
//             placement="top"
//             arrow
//             >
//             <IconButton sx={{ padding: 0, color: '#000000' }}>
//             <HelpOutline sx={{ fontSize: '28px' }} />
//             </IconButton>
//             </Tooltip>

//           <DialogContent>
//             <TextField
//               label="Jot down your ideas"
//               value={noteContent}
//               onChange={handleNoteChange}
//               multiline
//               rows={15}
//               fullWidth
//               variant="outlined"
//               sx={{ height: '90%' }}
//             />
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleToggleNoteDrawer} color="primary">
//               Save & Close
//             </Button>
//           </DialogActions>
//         </Box>
//       </Drawer>

//       {/* 聊天室側欄 Drawer */}
//       <Drawer
//         anchor="left"
//         open={openChatSidebar}
//         onClose={handleToggleChatSidebar}
//         sx={{
//           '& .MuiDrawer-paper': {
//             width: '200px',
//             maxWidth: '90vw',
//             height: '100%',
//             backgroundColor: '#f5f5f5',
//             padding: '10px',
//             '@media (max-width: 600px)': {
//               width: '80vw',
//             },
//           },
//         }}
//       >
//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', p: 2 }}>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleViewHistory}
//             sx={{ fontSize: '12px', padding: '6px 12px' }}
//           >
//             View History
//           </Button>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleCreateSession}
//             sx={{ fontSize: '12px', padding: '6px 12px' }}
//           >
//             Create New Chat
//           </Button>
//         </Box>
//       </Drawer>

//       {/* 歷史紀錄對話框 */}
//       <Dialog
//         open={openHistoryDialog}
//         onClose={() => setOpenHistoryDialog(false)}
//         sx={{
//           '& .MuiDialog-container .MuiPaper-root': {
//             width: '500px',
//             maxWidth: '90vw',
//           },
//         }}
//       >
//         <DialogTitle>聊天歷史紀錄</DialogTitle>
//         <DialogContent>
//           {chatHistory.length === 0 ? (
//             <DialogContentText>暫無歷史紀錄</DialogContentText>
//           ) : (
//             <List>
//               {chatHistory.map((session, index) => (
//                 <ListItem key={index} disablePadding>
//                   <ListItemButton onClick={() => handleLoadHistory(session)}>
//                     <ListItemText
//                       primary={`會話 ${session.sessionId}`}
//                       secondary={
//                         <>
//                           {`創建時間: ${formatDateTime(session.createdAt)}`}<br />
//                           {session.messages[0]?.content
//                             ? session.messages[0].content.substring(0, 50) + '...'
//                             : '無訊息'}
//                         </>
//                       }
//                     />
//                   </ListItemButton>
//                 </ListItem>
//               ))}
//             </List>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenHistoryDialog(false)} color="primary">
//             關閉
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default WritingArea;


//0613進度
// import React, { useState, useEffect, useRef } from 'react';
// import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, List, ListItem, ListItemText, Avatar, IconButton, ListItemButton, Drawer, Tooltip } from '@mui/material';
// import { Box } from '@mui/system';
// import { useNavigate } from 'react-router-dom'; // 新增引入
// import FroalaEditor from 'react-froala-wysiwyg';
// import 'froala-editor/js/plugins.pkgd.min.js';
// import 'froala-editor/css/froala_editor.pkgd.min.css';
// import 'froala-editor/css/froala_style.min.css';
// import axios from 'axios';
// import Navbar from "../components/Navbar_Student";
// import userAvatar from "../assets/學生ICON.png";
// import assistantAvatar from "../assets/AI_LOGOICON.png";
// import sendArrow from '../assets/發送.png';
// import HelpOutline from '@mui/icons-material/HelpOutline';

// const apiAxios = axios.create({
//   baseURL: 'http://140.115.126.27:4000',
//   timeout: 10000,
// });

// apiAxios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const WritingArea = () => {
//   const navigate = useNavigate(); // 初始化 navigate
//   const [editorContent, setEditorContent] = useState('');
//   const [openReminderDialog, setOpenReminderDialog] = useState(false);
//   const [openTempSaveDialog, setOpenTempSaveDialog] = useState(false);
//   const [openNoteDrawer, setOpenNoteDrawer] = useState(false);
//   const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
//   const [openChatSidebar, setOpenChatSidebar] = useState(false);
//   const [noteContent, setNoteContent] = useState('');
//   const [currentMessages, setCurrentMessages] = useState([]);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [userInput, setUserInput] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const [sessionId, setSessionId] = useState('');
//   const [activityTitle, setActivityTitle] = useState('');
//   const [groupName, setGroupName] = useState('');
//   const [username, setUsername] = useState('');
//   const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
//   const [openConfirmSubmitDialog, setOpenConfirmSubmitDialog] = useState(false);
//   const chatEndRef = useRef(null);

//   const RAGFLOW_API_URL = 'https://ragflow.lazyinwork.com/api/v1';
//   const RAGFLOW_API_KEY = 'ragflow-hmY2YzMjRjMWQ5YTExFjBhMGQ5MDI0Mm';
//   const AGENT_ID = '8f34f200ef5911ef914942ac120005';

//   const scrollToBottom = () => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [currentMessages]);

//   useEffect(() => {
//     const savedActivityTitle = localStorage.getItem('activityTitle');
//     if (savedActivityTitle) {
//       setActivityTitle(savedActivityTitle);
//     }

//     const savedGroupName = localStorage.getItem('groupName');
//     if (savedGroupName) {
//       setGroupName(savedGroupName);
//     }

//     const savedUsername = localStorage.getItem('name');
//     if (savedUsername && savedActivityTitle && savedGroupName) {
//       setUsername(savedUsername);

//       const fetchEssayContent = async () => {
//         try {
//           const response = await apiAxios.get(`/api/get-essay/${encodeURIComponent(savedUsername)}`, {
//             params: { className: savedActivityTitle, theme: savedGroupName },
//           });
//           if (response.data.success) {
//             setEditorContent(response.data.data.essayContent || '');
//             setNoteContent(response.data.noteContent || '');
//           } else {
//             console.warn('未找到符合學生姓名、班級和主題的議論文內容，使用空白內容');
//             setEditorContent('');
//             setNoteContent('');
//           }
//         } catch (error) {
//           console.error('從 Notion 獲取議論文內容失敗:', error);
//           setEditorContent('');
//           setNoteContent('');
//         }
//       };

//       fetchEssayContent();
//     }

//     const savedNote = localStorage.getItem('noteData');
//     if (savedNote) {
//       setNoteContent(savedNote);
//     }

//     setOpenReminderDialog(true);

//     handleCreateSession();
//   }, []);

//   const handleCreateSession = async () => {
//     if (sessionId && currentMessages.length > 0) {
//       setChatHistory((prev) => [
//         ...prev,
//         { sessionId, messages: [...currentMessages], createdAt: new Date().toISOString() },
//       ]);
//     }

//     setCurrentMessages([]);
//     setErrorMessage('');

//     try {
//       const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/sessions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
//         },
//         body: JSON.stringify({}),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP 錯誤：${response.status}`);
//       }

//       const data = await response.json();
//       console.log('創建會話回應:', data);

//       if (data.code === 0) {
//         const newSessionId = data.data?.id;
//         setSessionId(newSessionId);
//         setErrorMessage(`✅ 成功創建聊天會話：${newSessionId}`);

//         await fetchOpeningMessage(newSessionId);
//       } else {
//         setErrorMessage(`❌ 創建會話失敗：${data.message}`);
//       }
//     } catch (error) {
//       setErrorMessage(`❌ 創建會話錯誤：${error.message}`);
//       console.error('創建會話失敗:', error);
//     }
//   };

//   const fetchOpeningMessage = async (sessionId) => {
//     try {
//       const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/completions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
//         },
//         body: JSON.stringify({
//           question: "Hello",
//           stream: false,
//           session_id: sessionId,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP 錯誤：${response.status}`);
//       }

//       const data = await response.json();
//       console.log('開場白回應:', data);

//       if (data.code === 0) {
//         const content = data.data?.answer || 'No opening message received';
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       } else {
//         setErrorMessage(`❌ 獲取開場白失敗：${data.message}`);
//       }
//     } catch (error) {
//       setErrorMessage(`❌ 獲取開場白錯誤：${error.message}`);
//       console.error('獲取開場白失敗:', error);
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!userInput.trim()) {
//       setErrorMessage('❌ 請輸入問題！');
//       return;
//     }

//     if (!sessionId) {
//       setErrorMessage('❌ 請先創建聊天會話！');
//       return;
//     }

//     const newMessage = { role: 'user', content: userInput, created_at: new Date().toISOString() };
//     setCurrentMessages((prev) => [...prev, newMessage]);
//     setUserInput('');
//     setErrorMessage('');

//     try {
//       const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/completions`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
//         },
//         body: JSON.stringify({
//           question: userInput,
//           stream: false,
//           session_id: sessionId,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP 錯誤：${response.status}`);
//       }

//       const data = await response.json();
//       console.log('API 回應:', data);

//       if (data.code === 0) {
//         const content = data.data?.answer || 'No content received from API';
//         setCurrentMessages((prev) => [
//           ...prev,
//           { role: 'assistant', content, created_at: new Date().toISOString() },
//         ]);
//       } else {
//         setErrorMessage(`❌ 回應失敗：${data.message}`);
//       }
//     } catch (error) {
//       setErrorMessage(`❌ 發送訊息失敗：${error.message}`);
//       console.error('發送訊息失敗:', error);
//     }
//   };

//   const handleViewHistory = () => {
//     if (sessionId && currentMessages.length > 0) {
//       setChatHistory((prev) => {
//         const existingSession = prev.find((session) => session.sessionId === sessionId);
//         if (existingSession) {
//           existingSession.messages = [...currentMessages];
//           existingSession.createdAt = new Date().toISOString();
//           return [...prev];
//         } else {
//           return [
//             ...prev,
//             { sessionId, messages: [...currentMessages], createdAt: new Date().toISOString() },
//           ];
//         }
//       });
//     }
//     setOpenHistoryDialog(true);
//   };

//   const handleLoadHistory = (session) => {
//     setCurrentMessages(session.messages);
//     setSessionId(session.sessionId);
//     setOpenHistoryDialog(false);
//   };

//   const formatDateTime = (isoString) => {
//     const date = new Date(isoString);
//     return date.toLocaleString('zh-TW', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//     });
//   };

//   const handleSubmit = async () => {
//     if (editorContent.length > 2000) {
//       alert('議論文內容超過 2000 字元，將自動分段儲存至資料庫');
//     }
//     if (noteContent.length > 2000) {
//       alert('筆記內容超過 2000 字元，將自動分段儲存至資料庫');
//     }

//     try {
//       const response = await apiAxios.post('/api/submit-to-notion', {
//         studentName: username || '未命名使用者',
//         theme: groupName || '未指定主題',
//         essayContent: editorContent || '無內容',
//         className: activityTitle || '未指定班級',
//         noteContent: noteContent || '',
//       });

//       if (response.data.success) {
//         alert('繳交上傳成功！');
//         setIsSubmitDisabled(true);
//       } else {
//         alert(`繳交上傳失敗：${response.data.message || '未知錯誤'}`);
//       }
//     } catch (error) {
//       console.error('發送到 Notion 時出錯:', error);
//       const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || '未知錯誤';
//       alert(`繳交上傳失敗：${errorMessage}`);
//     }
//   };

//   const handleConfirmSubmit = () => {
//     setOpenConfirmSubmitDialog(false);
//     handleSubmit();
//   };

//   const handleTempSave = () => {
//     setOpenTempSaveDialog(true);
//   };

//   const handleUpdateNote = async () => {
//     if (editorContent.length > 2000) {
//       console.log('議論文內容超過 2000 字元，將自動分段儲存');
//     }
//     if (noteContent.length > 2000) {
//       console.log('筆記內容超過 2000 字元，將自動分段儲存');
//     }

//     try {
//       const response = await apiAxios.patch('/api/update-note', {
//         studentName: username || '未命名使用者',
//         className: activityTitle || '未指定班級',
//         theme: groupName || '未指定主題',
//         noteContent: noteContent || '',
//         essayContent: editorContent || '',
//       });

//       if (response.data.success) {
//         console.log('筆記區和寫作區內容已更新到 Notion');
//       } else {
//         console.warn('更新筆記區和寫作區內容失敗:', response.data.error);
//       }
//     } catch (error) {
//       console.error('更新筆記區和寫作區內容時出錯:', error);
//       const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || '未知錯誤';
//       console.warn(`更新失敗：${errorMessage}`);
//     }
//   };

//   const config = {
//     placeholderText: '開始編輯...',
//     charCounterCount: false,
//     toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'fontFamily', 'backColor',
//       'align', 'orderedList', 'unorderedList', 'insertImage', 'insertTable', 'link', 'undo', 'redo',
//       'clearFormatting', 'fullscreen', 'html', 'insertHR', 'specialCharacters'],
//   };

//   const handleCloseReminderDialog = () => {
//     setOpenReminderDialog(false);
//   };

//   const handleCloseTempSaveDialog = () => {
//     setOpenTempSaveDialog(false);
//   };

//   const handleToggleNoteDrawer = () => {
//     setOpenNoteDrawer((prev) => {
//       if (prev) {
//         localStorage.setItem('noteData', noteContent);
//         handleUpdateNote();
//       }
//       return !prev;
//     });
//   };

//   const handleNoteChange = (e) => {
//     setNoteContent(e.target.value);
//   };

//   const handleToggleChatSidebar = () => {
//     setOpenChatSidebar((prev) => !prev);
//   };

//   return (
//     <div>
//       <Navbar />
//       <Box
//         sx={{
//           display: 'flex',
//           flexDirection: { xs: 'column', md: 'row' },
//           minHeight: 'calc(100vh - 120px)',
//           padding: '10px',
//           gap: '10px',
//         }}
//       >
//         {/* 左邊容器：聊天室與側欄 */}
//         <Box
//           sx={{
//             width: { md: '50%', xs: '100%' },
//             padding: '5px',
//             borderRight: { md: '1px solid #ccc', xs: 'none' },
//             display: 'flex',
//             flexDirection: 'row',
//             height: { md: '600px', sm: '800px', xs: 'auto' },
//             '@media (max-width: 700px)': {
//               height: '800px',
//             },
//           }}
//         >
//           {/* 聊天室側欄 */}
//           <Box
//             sx={{
//               width: '50px',
//               backgroundColor: 'transparent',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               paddingTop: '10px',
//             }}
//           >
//             <IconButton
//               onClick={handleToggleChatSidebar}
//               sx={{
//                 color: '#1976d2',
//                 '&:hover': {
//                   backgroundColor: 'rgba(0, 0, 0, 0.04)',
//                 },
//               }}
//             >
//               <Box
//                 sx={{
//                   display: 'flex',
//                   flexDirection: 'column',
//                   alignItems: 'center',
//                   fontSize: '16px',
//                   fontWeight: 'bold',
//                   color: '#1976d2',
//                   lineHeight: '1.2',
//                 }}
//               >
//                 {['M', 'E', 'N', 'U'].map((letter, index) => (
//                   <Box key={index}>{letter}</Box>
//                 ))}
//               </Box>
//             </IconButton>
//           </Box>

//           {/* 聊天室區域 */}
//           <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
//             <Box
//               sx={{
//                 width: '100%',
//                 height: '100px',
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 backgroundColor: '#B7C5FF',
//                 fontSize: '18px',
//                 fontWeight: 'bold',
//                 padding: '0 10px',
//               }}
//             >
//               <span style={{ fontSize: '16px' }}>AI Writing Assistant</span>
//               <Tooltip
//                 title="I'm here to help you brainstorm, explore, and organize your ideas for a great essay！"
//                 placement="top"
//                 arrow
//                 componentsProps={{
//                   tooltip: {
//                     sx: {
//                       fontSize: '16px',
//                       padding: '8px 12px',
//                     },
//                   },
//                 }}
//               >
//                 <IconButton sx={{ padding: 0, color: '#000000' }}>
//                   <HelpOutline sx={{ fontSize: '28px' }} />
//                 </IconButton>
//               </Tooltip>
//             </Box>
//             <Box
//               sx={{
//                 border: '2px solid black',
//                 borderRadius: '8px',
//                 padding: '10px',
//                 flex: 1,
//                 overflowY: 'auto',
//                 backgroundColor: '#FFFFFF',
//                 marginBottom: '5px',
//                 marginTop: '10px',
//                 display: 'flex',
//                 flexDirection: 'column',
//               }}
//             >
//               {errorMessage && (
//                 <Box
//                   sx={{
//                     mt: 1,
//                     p: 1,
//                     backgroundColor: '#f0f0f0',
//                     borderRadius: '4px',
//                     fontSize: '14px',
//                   }}
//                 >
//                   {errorMessage}
//                 </Box>
//               )}
//               <List
//                 sx={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '5px' }}
//               >
//                 {currentMessages.map((msg, index) => (
//                   <ListItem
//                     key={index}
//                     sx={{
//                       justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
//                       textAlign: msg.role === 'user' ? 'right' : 'left',
//                       marginBottom: '5px',
//                     }}
//                   >
//                     <Box
//                       sx={{
//                         display: 'flex',
//                         flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
//                         alignItems: 'flex-start',
//                       }}
//                     >
//                       <Avatar
//                         alt={msg.role === 'user' ? 'User' : 'AI Assistant'}
//                         src={msg.role === 'user' ? userAvatar : assistantAvatar}
//                         sx={{ width: 40, height: 40, margin: '0 8px' }}
//                       />
//                       <Box
//                         sx={{
//                           maxWidth: '80%',
//                           p: 2,
//                           borderRadius: '8px',
//                           backgroundColor: msg.role === 'user' ? '#DCF8C6' : '#F0F0F0',
//                         }}
//                       >
//                         <ListItemText
//                           primary={msg.content || 'No content'}
//                           secondary={formatDateTime(msg.created_at)}
//                           sx={{ wordBreak: 'break-word', textAlign: 'left' }}
//                         />
//                       </Box>
//                     </Box>
//                   </ListItem>
//                 ))}
//                 <div ref={chatEndRef} />
//               </List>
//               <Box sx={{ display: 'flex', mt: 2 }}>
//                 <TextField
//                   fullWidth
//                   value={userInput}
//                   onChange={(e) => setUserInput(e.target.value)}
//                   placeholder="請輸入與寫作主題相關的內容..."
//                   onKeyPress={(e) => {
//                     if (e.key === 'Enter' && !e.shiftKey) {
//                       e.preventDefault();
//                       handleSendMessage();
//                     }
//                   }}
//                   variant="standard"
//                   sx={{ marginRight: '8px' }}
//                 />
//                 <IconButton
//                   color="primary"
//                   onClick={handleSendMessage}
//                   sx={{ padding: '8px' }}
//                 >
//                   <img src={sendArrow} alt="Send" style={{ width: '40px', height: '40px' }} />
//                 </IconButton>
//               </Box>
//             </Box>
//           </Box>
//         </Box>

//         {/* 右邊容器：文字編輯器與側欄 */}
//         <Box
//           sx={{
//             width: { md: '50%', xs: '100%' },
//             borderLeft: { md: '1px solid #ccc', xs: 'none' },
//             position: 'relative',
//             height: { md: '600px', sm: '800px', xs: 'auto' },
//             display: 'flex',
//             flexDirection: 'row',
//             '@media (max-width: 700px)': {
//               width: '100%',
//               padding: '10px',
//               height: '800px',
//               borderLeft: 'none',
//             },
//             '@media (max-width: 600px)': {
//               width: '100%',
//             },
//           }}
//         >
//           {/* 編輯器區域 */}
//           <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
//             <Box
//               sx={{
//                 width: '100%',
//                 height: '100px',
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 backgroundColor: '#B7C5FF',
//                 fontSize: '18px',
//                 fontWeight: 'bold',
//                 padding: '0 10px',
//               }}
//             >
//               <Box>
//                 <span style={{ fontSize: '16px' }}>
//                   {username && `User: ${username}`}
//                   {activityTitle && ` Class: ${activityTitle}`}<br />
//                   {groupName && ` Topic: ${groupName}`}
//                 </span>
//               </Box>
//               {/* 筆記側欄 */}
//               <Box
//                 sx={{
//                   width: '50px',
//                   backgroundColor: 'transparent',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   alignItems: 'center',
//                   paddingTop: '10px',
//                 }}
//               >
//                 <IconButton
//                   onClick={handleToggleNoteDrawer}
//                   sx={{
//                     color: '#1976d2',
//                     '&:hover': {
//                       backgroundColor: 'rgba(0, 0, 0, 0.04)',
//                     },
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       display: 'flex',
//                       flexDirection: 'column',
//                       alignItems: 'center',
//                       fontSize: '16px',
//                       fontWeight: 'bold',
//                       color: '#1976d2',
//                       lineHeight: '1.2',
//                     }}
//                   >
//                     {['N', 'O', 'T', 'E'].map((letter, index) => (
//                       <Box key={index}>{letter}</Box>
//                     ))}
//                   </Box>
//                 </IconButton>
//               </Box>
//             </Box>
//             <Box sx={{ flex: 1, overflowY: 'auto' }}>
//               <FroalaEditor
//                 tag="textarea"
//                 config={config}
//                 model={editorContent}
//                 onModelChange={(value) => setEditorContent(value)}
//                 style={{ height: '100%' }}
//               />
//             </Box>
//             <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '10px' }}>
//               <Button
//                 variant="contained"
//                 color="secondary"
//                 onClick={handleTempSave}
//               >
//                 Temporary
//               </Button>
//               <Button
//                 variant="contained"
//                 color="secondary"
//                 onClick={() => setOpenConfirmSubmitDialog(true)}
//                 disabled={isSubmitDisabled}
//               >
//                 Submit
//               </Button>
//             </Box>
//           </Box>
//         </Box>
//       </Box>

//       {/* 提交確認提示 */}
//       <Dialog open={openConfirmSubmitDialog} onClose={() => setOpenConfirmSubmitDialog(false)}>
//         <DialogTitle>確認提交</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             您確定要提交嗎？提交後無法編輯內容。
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenConfirmSubmitDialog(false)} color="primary">
//             關閉
//           </Button>
//           <Button onClick={handleConfirmSubmit} color="primary" autoFocus>
//             確定
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openReminderDialog} onClose={handleCloseReminderDialog}>
//         <DialogTitle>通知</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             請先與 AI 寫作助理討論後再開始寫作！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseReminderDialog} color="primary">
//             好的！
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openTempSaveDialog} onClose={handleCloseTempSaveDialog}>
//         <DialogTitle>提示</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             暫存成功！
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseTempSaveDialog} color="primary">
//             確定
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* 筆記側欄 Drawer */}
//       <Drawer
//         anchor="right"
//         open={openNoteDrawer}
//         onClose={handleToggleNoteDrawer}
//         sx={{
//           '& .MuiDrawer-paper': {
//             width: '500px',
//             maxWidth: '90vw',
//             height: '100%',
//             '@media (max-width: 600px)': {
//               width: '90vw',
//             },
//           },
//         }}
//       >
//         <Box sx={{ p: 2 }}>
//           <DialogTitle>Note Area</DialogTitle>
//           <Tooltip
//             title="Capture your thoughts before they fly away！"
//             placement="top"
//             arrow
//             componentsProps={{
//               tooltip: {
//                 sx: {
//                   fontSize: '16px',
//                   padding: '8px 12px',
//                 },
//               },
//             }}
//           >
//             <IconButton sx={{ padding: 0, color: '#000000' }}>
//               <HelpOutline sx={{ fontSize: '28px' }} />
//             </IconButton>
//           </Tooltip>

//           <DialogContent>
//             <TextField
//               label="Here is your current essay outline progress."
              
              
//               multiline
//               rows={15}
//               fullWidth
//               variant="outlined"
//               sx={{ height: '90%' }}
//             />
//           </DialogContent>

//           <DialogContent>
//             <TextField
//               label="Jot down your ideas"
//               value={noteContent}
//               onChange={handleNoteChange}
//               multiline
//               rows={15}
//               fullWidth
//               variant="outlined"
//               sx={{ height: '90%' }}
//             />
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleToggleNoteDrawer} color="primary">
//               Save & Close
//             </Button>
//           </DialogActions>
//         </Box>
//       </Drawer>

//       {/* 聊天室側欄 Drawer */}
//       <Drawer
//         anchor="left"
//         open={openChatSidebar}
//         onClose={handleToggleChatSidebar}
//         sx={{
//           '& .MuiDrawer-paper': {
//             width: '200px',
//             maxWidth: '90vw',
//             height: '100%',
//             backgroundColor: '#f5f5f5',
//             padding: '10px',
//             '@media (max-width: 600px)': {
//               width: '80vw',
//             },
//           },
//         }}
//       >
//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', p: 2 }}>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleViewHistory}
//             sx={{ fontSize: '12px', padding: '6px 12px' }}
//           >
//             View History
//           </Button>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={() => {
//               handleCreateSession();
//               setOpenChatSidebar(false);
//             }}
//             sx={{ fontSize: '12px', padding: '6px 12px' }}
//           >
//             Create New Chat
//           </Button>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={() => {
//               navigate('/teacher/teacher_home');
//               setOpenChatSidebar(false);
//             }}
//             sx={{ fontSize: '12px', padding: '6px 12px' }}
//           >
//             Home
//           </Button>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={() => {
//               navigate('/About_teacher');
//               setOpenChatSidebar(false);
//             }}
//             sx={{ fontSize: '12px', padding: '6px 12px' }}
//           >
//             About
//           </Button>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={() => {
//               navigate('/manual');
//               setOpenChatSidebar(false);
//             }}
//             sx={{ fontSize: '12px', padding: '6px 12px' }}
//           >
//             Manual
//           </Button>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={() => {
//               navigate('/home');
//               setOpenChatSidebar(false);
//             }}
//             sx={{ fontSize: '12px', padding: '6px 12px' }}
//           >
//             WritingArea
//           </Button>
//         </Box>
//       </Drawer>

//       {/* 歷史紀錄對話框 */}
//       <Dialog
//         open={openHistoryDialog}
//         onClose={() => setOpenHistoryDialog(false)}
//         sx={{
//           '& .MuiDialog-container .MuiPaper-root': {
//             width: '500px',
//             maxWidth: '90vw',
//           },
//         }}
//       >
//         <DialogTitle>聊天歷史紀錄</DialogTitle>
//         <DialogContent>
//           {chatHistory.length === 0 ? (
//             <DialogContentText>暫無歷史紀錄</DialogContentText>
//           ) : (
//             <List>
//               {chatHistory.map((session, index) => (
//                 <ListItem key={index} disablePadding>
//                   <ListItemButton onClick={() => handleLoadHistory(session)}>
//                     <ListItemText
//                       primary={`會話 ${session.sessionId}`}
//                       secondary={
//                         <>
//                           {`創建時間: ${formatDateTime(session.createdAt)}`}<br />
//                           {session.messages[0]?.content
//                             ? session.messages[0].content.substring(0, 50) + '...'
//                             : '無訊息'}
//                         </>
//                       }
//                     />
//                   </ListItemButton>
//                 </ListItem>
//               ))}
//             </List>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenHistoryDialog(false)} color="primary">
//             關閉
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default WritingArea;



//+寫作建議按鈕
import React, { useState, useEffect, useRef } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, List, ListItem, ListItemText, Avatar, IconButton, ListItemButton, Drawer, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import FroalaEditor from 'react-froala-wysiwyg';
import 'froala-editor/js/plugins.pkgd.min.js';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/css/froala_style.min.css';
import axios from 'axios';
import Navbar from "../components/Navbar_Student";
import userAvatar from "../assets/學生ICON.png";
import assistantAvatar from "../assets/AI_LOGOICON.png";
import sendArrow from '../assets/發送.png';
import notesIcon from '../assets/筆記工具.png';
import MenuIcon from '../assets/側欄ICON.png';
import HelpOutline from '@mui/icons-material/HelpOutline';

const apiAxios = axios.create({
  baseURL: 'http://140.115.126.27:4000',
  timeout: 10000,
});

apiAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const WritingArea = () => {
  const [editorContent, setEditorContent] = useState('');
  const [openReminderDialog, setOpenReminderDialog] = useState(false);
  const [openTempSaveDialog, setOpenTempSaveDialog] = useState(false);
  const [openNoteDrawer, setOpenNoteDrawer] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [openChatSidebar, setOpenChatSidebar] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [currentMessages, setCurrentMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [activityTitle, setActivityTitle] = useState('');
  const [groupName, setGroupName] = useState('');
  const [username, setUsername] = useState('');
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [openConfirmSubmitDialog, setOpenConfirmSubmitDialog] = useState(false);
  const chatEndRef = useRef(null);

  const RAGFLOW_API_URL = 'https://ragflow.lazyinwork.com/api/v1';
  const RAGFLOW_API_KEY = 'ragflow-hmY2YzMjRjMWQ5YTExZjBhMGQ5MDI0Mm';
  const AGENT_ID = '8f34f200ef5911ef91480242ac120005';

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  useEffect(() => {
    const savedActivityTitle = localStorage.getItem('activityTitle');
    if (savedActivityTitle) {
      setActivityTitle(savedActivityTitle);
    }

    const savedGroupName = localStorage.getItem('groupName');
    if (savedGroupName) {
      setGroupName(savedGroupName);
    }

    const savedUsername = localStorage.getItem('name');
    if (savedUsername && savedActivityTitle && savedGroupName) {
      setUsername(savedUsername);

      const fetchEssayContent = async () => {
        try {
          const response = await apiAxios.get(`/api/get-essay/${encodeURIComponent(savedUsername)}`, {
            params: { className: savedActivityTitle, theme: savedGroupName },
          });
          if (response.data.success) {
            setEditorContent(response.data.data.essayContent || '');
            setNoteContent(response.data.data.noteContent || '');
          } else {
            console.warn('未找到符合學生姓名、班級和主題的議論文內容，使用空白內容');
            setEditorContent('');
            setNoteContent('');
          }
        } catch (error) {
          console.error('從 Notion 獲取議論文內容失敗:', error);
          setEditorContent('');
          setNoteContent('');
        }
      };

      fetchEssayContent();
    }

    const savedNote = localStorage.getItem('noteData');
    if (savedNote) {
      setNoteContent(savedNote);
    }

    setOpenReminderDialog(true);

    handleCreateSession();
  }, []);

  const handleCreateSession = async () => {
    if (sessionId && currentMessages.length > 0) {
      setChatHistory((prev) => [
        ...prev,
        { sessionId, messages: [...currentMessages], createdAt: new Date().toISOString() },
      ]);
    }

    setCurrentMessages([]);
    setErrorMessage('');

    try {
      const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP 錯誤：${response.status}`);
      }

      const data = await response.json();
      console.log('創建會話回應:', data);

      if (data.code === 0) {
        const newSessionId = data.data?.id;
        setSessionId(newSessionId);
        setErrorMessage(`✅ 成功創建聊天會話：${newSessionId}`);

        await fetchOpeningMessage(newSessionId);
      } else {
        setErrorMessage(`❌ 創建會話失敗：${data.message}`);
      }
    } catch (error) {
      setErrorMessage(`❌ 創建會話錯誤：${error.message}`);
      console.error('創建會話失敗:', error);
    }
  };

  const fetchOpeningMessage = async (sessionId) => {
    try {
      const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
        },
        body: JSON.stringify({
          question: "Hello",
          stream: false,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP 錯誤：${response.status}`);
      }

      const data = await response.json();
      console.log('開場白回應:', data);

      if (data.code === 0) {
        const content = data.data?.answer || 'No opening message received';
        setCurrentMessages((prev) => [
          ...prev,
          { role: 'assistant', content, created_at: new Date().toISOString() },
        ]);
      } else {
        setErrorMessage(`❌ 獲取開場白失敗：${data.message}`);
      }
    } catch (error) {
      setErrorMessage(`❌ 獲取開場白錯誤：${error.message}`);
      console.error('獲取開場白失敗:', error);
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) {
      setErrorMessage('❌ 請輸入問題！');
      return;
    }

    if (!sessionId) {
      setErrorMessage('❌ 請先創建聊天會話！');
      return;
    }

    const newMessage = { role: 'user', content: message, created_at: new Date().toISOString() };
    setCurrentMessages((prev) => [...prev, newMessage]);
    setErrorMessage('');

    try {
      const response = await fetch(`${RAGFLOW_API_URL}/agents/${AGENT_ID}/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RAGFLOW_API_KEY}`,
        },
        body: JSON.stringify({
          question: message,
          stream: false,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP 錯誤：${response.status}`);
      }

      const data = await response.json();
      console.log('API 回應:', data);

      if (data.code === 0) {
        const content = data.data?.answer || 'No content received from API';
        setCurrentMessages((prev) => [
          ...prev,
          { role: 'assistant', content, created_at: new Date().toISOString() },
        ]);
      } else {
        setErrorMessage(`❌ 回應失敗：${data.message}`);
      }
    } catch (error) {
      setErrorMessage(`❌ 發送訊息失敗：${error.message}`);
      console.error('發送訊息失敗:', error);
    }
  };

  const stripHtml = (html) => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    // Remove Froala watermark
    const watermark = tempDiv.querySelector('p[data-f-id="pbf"]');
    if (watermark) {
      watermark.remove();
    }
    // Get plain text and normalize whitespace
    return tempDiv.textContent.trim();
  };

  const handleEssaySuggestion = () => {
    if (!editorContent.trim()) {
      setErrorMessage('❌ 寫作區內容為空，請先輸入議論文內容！');
      return;
    }
    const plainText = stripHtml(editorContent);
    if (!plainText) {
      setErrorMessage('❌ 寫作區無有效文字內容！');
      return;
    }
    const suggestionPrompt = `Please provide suggestions for improving the following essay content:\n\n${plainText}`;
    handleSendMessage(suggestionPrompt);
  };

  const handleViewHistory = () => {
    if (sessionId && currentMessages.length > 0) {
      setChatHistory((prev) => {
        const existingSession = prev.find((session) => session.sessionId === sessionId);
        if (existingSession) {
          existingSession.messages = [...currentMessages];
          existingSession.createdAt = new Date().toISOString();
          return [...prev];
        } else {
          return [
            ...prev,
            { sessionId, messages: [...currentMessages], createdAt: new Date().toISOString() },
          ];
        }
      });
    }
    setOpenHistoryDialog(true);
  };

  const handleLoadHistory = (session) => {
    setCurrentMessages(session.messages);
    setSessionId(session.sessionId);
    setOpenHistoryDialog(false);
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleSubmit = async () => {
    if (editorContent.length > 2000) {
      alert('議論文內容超過 2000 字元，將自動分段儲存至資料庫');
    }
    if (noteContent.length > 2000) {
      alert('筆記內容超過 2000 字元，將自動分段儲存至資料庫');
    }

    try {
      const response = await apiAxios.post('/api/submit-to-notion', {
        studentName: username || '未命名使用者',
        theme: groupName || '未指定主題',
        essayContent: editorContent || '無內容',
        className: activityTitle || '未指定班級',
        noteContent: noteContent || '',
      });

      if (response.data.success) {
        alert('繳交上傳成功！');
        setIsSubmitDisabled(true);
      } else {
        alert(`繳交上傳失敗：${response.data.message || '未知錯誤'}`);
      }
    } catch (error) {
      console.error('發送到 Notion 時出錯:', error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || '未知錯誤';
      alert(`繳交上傳失敗：${errorMessage}`);
    }
  };

  const handleConfirmSubmit = () => {
    setOpenConfirmSubmitDialog(false);
    handleSubmit();
  };

  const handleTempSave = () => {
    setOpenTempSaveDialog(true);
  };

  const handleUpdateNote = async () => {
    if (editorContent.length > 2000) {
      console.log('議論文內容超過 2000 字元，將自動分段儲存');
    }
    if (noteContent.length > 2000) {
      console.log('筆記內容超過 2000 字元，將自動分段儲存');
    }

    try {
      const response = await apiAxios.patch('/api/update-note', {
        studentName: username || '未命名使用者',
        className: activityTitle || '未指定班級',
        theme: groupName || '未指定主題',
        noteContent: noteContent || '',
        essayContent: editorContent || '',
      });

      if (response.data.success) {
        console.log('筆記區和寫作區內容已更新到 Notion');
      } else {
        console.warn('更新筆記區和寫作區內容失敗:', response.data.error);
      }
    } catch (error) {
      console.error('更新筆記區和寫作區內容時出錯:', error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || '未知錯誤';
      console.warn(`更新失敗：${errorMessage}`);
    }
  };

  const config = {
    placeholderText: '開始編輯...',
    charCounterCount: false,
    toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'fontSize', 'color', 'fontFamily', 'backColor',
      'align', 'orderedList', 'unorderedList', 'insertImage', 'insertTable', 'link', 'undo', 'redo',
      'clearFormatting', 'fullscreen', 'html', 'insertHR', 'specialCharacters'],
  };

  const handleCloseReminderDialog = () => {
    setOpenReminderDialog(false);
  };

  const handleCloseTempSaveDialog = () => {
    setOpenTempSaveDialog(false);
  };

  const handleToggleNoteDrawer = () => {
    setOpenNoteDrawer((prev) => {
      if (prev) {
        localStorage.setItem('noteData', noteContent);
        handleUpdateNote();
      }
      return !prev;
    });
  };

  const handleNoteChange = (e) => {
    setNoteContent(e.target.value);
  };

  const handleToggleChatSidebar = () => {
    setOpenChatSidebar((prev) => !prev);
  };

  return (
    <div>
      <Navbar />
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          minHeight: 'calc(100vh - 120px)',
          padding: '10px',
          gap: '10px',
        }}
      >
        {/* 左邊容器：聊天室與側欄 */}
        <Box
          sx={{
            width: { md: '50%', xs: '100%' },
            padding: '5px',
            borderRight: { md: '1px solid #ccc', xs: 'none' },
            display: 'flex',
            flexDirection: 'row',
            height: { md: '600px', sm: '800px', xs: 'auto' },
            '@media (max-width: 700px)': {
              height: '800px',
            },
          }}
        >
          {/* 聊天室側欄 */}
          <Box
            sx={{
              width: '50px',
              backgroundColor: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: '10px',
            }}
          >
            <IconButton
              onClick={handleToggleChatSidebar}
              sx={{
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <img src={MenuIcon} alt="Menu" style={{ width: '24px', height: '24px' }} />
            </IconButton>
          </Box>

          {/* 聊天室區域 */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                width: '100%',
                height: '100px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#B7C5FF',
                fontSize: '18px',
                fontWeight: 'bold',
                padding: '0 10px',
              }}
            >
              <span style={{ fontSize: '16px' }}>AI Writing Assistant</span>
              <Tooltip
                title="I'm here to help you brainstorm, explore, and organize your ideas for a great essay！"
                placement="top"
                arrow
              >
                <IconButton sx={{ padding: '0', color: '#000000' }}>
                  <HelpOutline sx={{ fontSize: '28px' }} />
                </IconButton>
              </Tooltip>
            </Box>
            <Box
              sx={{
                border: '2px solid black',
                borderRadius: '8px',
                padding: '10px',
                flex: 1,
                overflowY: 'auto',
                backgroundColor: '#FFFFFF',
                marginBottom: '5px',
                marginTop: '10px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {errorMessage && (
                <Box
                  sx={{
                    mt: 1,
                    p: 1,
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  {errorMessage}
                </Box>
              )}
              <List
                sx={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '5px' }}
              >
                {currentMessages.map((msg, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      textAlign: msg.role === 'user' ? 'right' : 'left',
                      marginBottom: '5px',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Avatar
                        alt={msg.role === 'user' ? 'User' : 'AI Assistant'}
                        src={msg.role === 'user' ? userAvatar : assistantAvatar}
                        sx={{ width: 40, height: 40, margin: '0 8px' }}
                      />
                      <Box
                        sx={{
                          maxWidth: '80%',
                          p: 2,
                          borderRadius: '8px',
                          backgroundColor: msg.role === 'user' ? '#DCF8C6' : '#F0F0F0',
                        }}
                      >
                        <ListItemText
                          primary={msg.content || 'No content'}
                          secondary={formatDateTime(msg.created_at)}
                          sx={{
                            wordBreak: 'break-word',
                            textAlign: 'left',
                          }}
                        />
                      </Box>
                    </Box>
                  </ListItem>
                ))}
                <div ref={chatEndRef} />
              </List>
              <Box sx={{ display: 'flex', mt: 2 }}>
                <TextField
                  fullWidth
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="請輸入與寫作主題相關的內容..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(userInput);
                    }
                  }}
                  variant="standard"
                  sx={{ marginRight: '8px' }}
                />
                <IconButton
                  color="primary"
                  onClick={() => handleSendMessage(userInput)}
                  sx={{ padding: '8px' }}
                >
                  <img src={sendArrow} alt="Send" style={{ width: '40px', height: '40px' }} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* 右邊容器：文字編輯器與側欄 */}
        <Box
          sx={{
            width: { md: '50%', xs: '100%' },
            borderLeft: { md: '1px solid #ccc', xs: 'none' },
            position: 'relative',
            height: { md: '600px', sm: '800px', xs: 'auto' },
            display: 'flex',
            flexDirection: 'row',
            '@media (max-width: 700px)': {
              width: '100%',
              padding: '10px',
              height: '800px',
              borderLeft: 'none',
            },
            '@media (max-width: 600px)': {
              width: '100%',
            },
          }}
        >
          {/* 編輯器區域 */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                width: '100%',
                height: '100px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#B7C5FF',
                fontSize: '18px',
                fontWeight: 'bold',
                padding: '0 10px',
              }}
            >
              <Box>
                <span style={{ fontSize: '16px' }}>
                  {username && `User: ${username}`}
                  {activityTitle && ` Class: ${activityTitle}`}<br />
                  {groupName && ` Topic: ${groupName}`}
                </span>
              </Box>
              {/* 筆記側欄 */}
              <Box
                sx={{
                  width: '50px',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  paddingTop: '10px',
                }}
              >
                <IconButton
                  onClick={handleToggleNoteDrawer}
                  sx={{
                    color: '#1976d2',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <img src={notesIcon} alt="Notes" style={{ width: '24px', height: '24px' }} />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              <FroalaEditor
                tag="textarea"
                config={config}
                model={editorContent}
                onModelChange={(value) => setEditorContent(value)}
                style={{ height: '100%' }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '10px' }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleTempSave}
              >
                Temporary
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleEssaySuggestion}
              >
                Essay Suggestion
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setOpenConfirmSubmitDialog(true)}
                disabled={isSubmitDisabled}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 提交確認提示 */}
      <Dialog open={openConfirmSubmitDialog} onClose={() => setOpenConfirmSubmitDialog(false)}>
        <DialogTitle>確認提交</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您確定要提交嗎？提交後無法編輯內容。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmSubmitDialog(false)} color="primary">
            關閉
          </Button>
          <Button onClick={handleConfirmSubmit} color="primary" autoFocus>
            確定
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openReminderDialog} onClose={handleCloseReminderDialog}>
        <DialogTitle>Notice</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please discuss with the AI Writing Assistant before you start writing!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReminderDialog} color="primary">
            OK！
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openTempSaveDialog} onClose={handleCloseTempSaveDialog}>
        <DialogTitle>提示</DialogTitle>
        <DialogContent>
          <DialogContentText>
            暫存成功！
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTempSaveDialog} color="primary">
            確定
          </Button>
        </DialogActions>
      </Dialog>

      {/* 筆記側欄 Drawer */}
      <Drawer
        anchor="right"
        open={openNoteDrawer}
        onClose={handleToggleNoteDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: '500px',
            maxWidth: '90vw',
            height: '100%',
            '@media (max-width: 600px)': {
              width: '90vw',
            },
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <DialogTitle>Note Area</DialogTitle>
          <Tooltip
            title="Capture your thoughts before they fly away！"
            placement="top"
            arrow
          >
            <IconButton sx={{ padding: 0, color: '#000000' }}>
              <HelpOutline sx={{ fontSize: '28px' }} />
            </IconButton>
          </Tooltip>
          <DialogContent>
            <TextField
              label="Jot down your ideas"
              value={noteContent}
              onChange={handleNoteChange}
              multiline
              rows={15}
              fullWidth
              variant="outlined"
              sx={{ height: '90%' }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleToggleNoteDrawer} color="primary">
              Save & Close
            </Button>
          </DialogActions>
        </Box>
      </Drawer>

      {/* 聊天室側欄 Drawer */}
      <Drawer
        anchor="left"
        open={openChatSidebar}
        onClose={handleToggleChatSidebar}
        sx={{
          '& .MuiDrawer-paper': {
            width: '200px',
            maxWidth: '90vw',
            height: '100%',
            backgroundColor: '#f5f5f5',
            padding: '10px',
            '@media (max-width: 600px)': {
              width: '80vw',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', p: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleViewHistory}
            sx={{ fontSize: '12px', padding: '6px 12px' }}
          >
            View History
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateSession}
            sx={{ fontSize: '12px', padding: '6px 12px' }}
          >
            Create New Chat
          </Button>
        </Box>
      </Drawer>

      {/* 歷史紀錄對話框 */}
      <Dialog
        open={openHistoryDialog}
        onClose={() => setOpenHistoryDialog(false)}
        sx={{
          '& .MuiDialog-container .MuiPaper-root': {
            width: '500px',
            maxWidth: '90vw',
          },
        }}
      >
        <DialogTitle>聊天歷史紀錄</DialogTitle>
        <DialogContent>
          {chatHistory.length === 0 ? (
            <DialogContentText>暫無歷史紀錄</DialogContentText>
          ) : (
            <List>
              {chatHistory.map((session, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton onClick={() => handleLoadHistory(session)}>
                    <ListItemText
                      primary={`會話 ${session.sessionId}`}
                      secondary={
                        <>
                          {`創建時間: ${formatDateTime(session.createdAt)}`}<br />
                          {session.messages[0]?.content
                            ? session.messages[0].content.substring(0, 50) + '...'
                            : '無訊息'}
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistoryDialog(false)} color="primary">
            關閉
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default WritingArea;