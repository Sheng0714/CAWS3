import axios from 'axios';

const notionApiBases = [
  process.env.REACT_APP_NOTION_API_BASE_URL,
  '/api/notion',
  '/notion-api',
  'http://localhost:4000',
  'http://140.115.126.27:4000',
].filter(Boolean);

export const normalizeFieldValue = (value) =>
  value === null || value === undefined ? '' : String(value).trim();

export const hasGradedScore = (scoreValue) => {
  const normalized = normalizeFieldValue(scoreValue);
  return normalized !== '' && normalized !== '-';
};

export const fetchEssayFromNotion = async ({ studentName, className, theme }) => {
  const token = localStorage.getItem('jwtToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let lastError = null;

  for (const base of notionApiBases) {
    const normalizedBase = base.replace(/\/+$/, '');
    const requestUrl = `${normalizedBase}/api/get-essay/${encodeURIComponent(studentName)}`;

    try {
      const response = await axios.get(requestUrl, {
        timeout: 15000,
        headers,
        params: { className, theme },
      });
      return response?.data?.data || {};
    } catch (error) {
      const isBackendJson =
        error?.response &&
        typeof error.response.data === 'object' &&
        error.response.data !== null &&
        Object.prototype.hasOwnProperty.call(error.response.data, 'success');

      if (error?.response?.status === 404 && isBackendJson) {
        const notFoundError = new Error('NOT_FOUND');
        notFoundError.code = 'NOT_FOUND';
        throw notFoundError;
      }

      lastError = error;
    }
  }

  throw lastError || new Error('Fetch essay from Notion failed');
};

export const fetchGradedStatus = async ({ studentName, className, theme }) => {
  try {
    const notionData = await fetchEssayFromNotion({ studentName, className, theme });
    return hasGradedScore(notionData?.totalScore);
  } catch (error) {
    if (error?.code === 'NOT_FOUND') {
      return false;
    }
    throw error;
  }
};
