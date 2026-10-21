import axios from 'axios';
import config from '../config.json';
import url from '../utils/urlConfig';

export const fetchChatHistoryFromNotion = async (scope) => {
  const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
  if (!userId) throw new Error('Please log in before loading chat history.');
  const token = localStorage.getItem('jwtToken');
  const response = await axios.get(
    `${url.backendHost + config[4].myJoinedActivityList}/${encodeURIComponent(userId)}/chat-history`,
    {
      params: { activityId: scope.activityId || '', groupId: scope.groupId || '', className: scope.className || '', theme: scope.topicName || '' },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      timeout: 30000,
    }
  );
  if (response?.data?.success !== true || !Array.isArray(response.data.data?.chatHistory)) {
    throw new Error('Notion did not return a valid chat history.');
  }
  return response.data.data.chatHistory;
};

export const saveChatHistoryToNotion = async ({ scope, sessions }) => {
  const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
  if (!userId) throw new Error('Please log in before saving chat history.');
  const token = localStorage.getItem('jwtToken');
  const response = await axios.post(
    `${url.backendHost + config[4].myJoinedActivityList}/${encodeURIComponent(userId)}/chat-history`,
    {
      activityId: scope.activityId || '',
      groupId: scope.groupId || '',
      className: scope.className || '',
      theme: scope.topicName || '',
      chatHistory: sessions,
    },
    { headers: token ? { Authorization: `Bearer ${token}` } : {}, timeout: 45000 }
  );
  if (response?.data?.success !== true) throw new Error('Notion did not confirm saving the chat history.');
  return response.data.data;
};
