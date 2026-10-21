import axios from 'axios';
import config from '../config.json';
import url from '../utils/urlConfig';

// The class-list API writes and verifies Notion before reporting sync success.
export const fetchJoinedStudentTopics = async (userId = localStorage.getItem('userId')) => {
  const token = localStorage.getItem('jwtToken');
  const response = await axios.get(
    `${url.backendHost + config[4].myJoinedActivityList}/${encodeURIComponent(userId)}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );
  if (!Array.isArray(response.data)) throw new Error('Unable to load joined class topics.');
  const status = response.headers?.['x-notion-sync-status'];
  return {
    activities: response.data,
    notionSyncStatus: status === 'success' ? 'success' : status === 'failed' ? 'failed' : 'unconfirmed',
  };
};
