import axios from 'axios';
import config from '../config.json';
import url from '../utils/urlConfig';

const readStoredValue = (...keys) => {
  for (const storage of [localStorage, sessionStorage]) {
    for (const key of keys) {
      const value = String(storage.getItem(key) || '').trim();
      if (value && value !== 'undefined' && value !== 'null') return value;
    }
  }
  return '';
};

export const readWritingSelection = () => ({
  activityId: readStoredValue('activityId'),
  groupId: readStoredValue('groupId'),
  className: readStoredValue('activityTitle', 'selectedClassName'),
  theme: readStoredValue('groupName', 'selectedTopicName'),
});

export const fetchWritingScope = async (selection) => {
  const userId = readStoredValue('userId');
  if (!userId) throw new Error('請先登入，再儲存寫作內容。');
  const token = readStoredValue('jwtToken');
  const response = await axios.get(
    `${url.backendHost + config[4].myJoinedActivityList}/${encodeURIComponent(userId)}/writing-scope`,
    {
      params: selection,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      timeout: 15000,
    }
  );
  const scope = response?.data?.data;
  if (response?.data?.success !== true || !scope?.studentName || !scope?.className || !scope?.theme) {
    throw new Error('無法取得目前的姓名、班級與主題，請回首頁重新進入活動後再儲存。');
  }
  return { studentName: scope.studentName, className: scope.className, theme: scope.theme };
};
