import axios from 'axios';

const notionApiBases = [...new Set([
  process.env.REACT_APP_NOTION_API_BASE_URL,
  '/notion-api',
  '/api/notion',
  'http://localhost:4000',
  'http://140.115.126.27:4000',
].filter(Boolean))];

const normalizeScopeValue = (value) => String(value ?? '').replace(/\u3000/g, ' ').trim();
const pendingTopicWrites = new Map();

const saveStudentTopicToNotion = async (payload) => {
  const token = localStorage.getItem('jwtToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let lastError;

  for (const base of notionApiBases) {
    try {
      const response = await axios.post(
        `${base.replace(/\/+$/, '')}/api/ensure-student-topic`,
        payload,
        { headers, timeout: 12000 }
      );
      if (response?.data?.success !== true) {
        throw new Error('Notion did not confirm that the class/topic was saved.');
      }
      return response.data.data;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Failed to save the class/topic to Notion.');
};

export const ensureStudentTopicInNotion = async ({ studentName, className, theme }) => {
  const payload = Object.fromEntries(
    Object.entries({ studentName, className, theme })
      .map(([key, value]) => [key, normalizeScopeValue(value)])
  );
  if (!payload.studentName || !payload.className || !payload.theme) {
    throw new Error('Student name, class name and topic are required to save to Notion.');
  }

  const key = JSON.stringify([payload.studentName, payload.className, payload.theme]);
  if (pendingTopicWrites.has(key)) return pendingTopicWrites.get(key);

  const request = saveStudentTopicToNotion(payload);
  pendingTopicWrites.set(key, request);
  try {
    return await request;
  } finally {
    pendingTopicWrites.delete(key);
  }
};

export const syncJoinedStudentTopicsToNotion = async ({ studentName, activities }) => {
  const result = { synced: [], failed: [] };
  const normalizedStudentName = normalizeScopeValue(studentName);
  if (!normalizedStudentName || !Array.isArray(activities)) return result;

  const scopes = new Map();
  for (const activity of activities) {
    const className = normalizeScopeValue(activity?.ActivityGroup?.Activity?.title);
    const theme = normalizeScopeValue(activity?.ActivityGroup?.Group?.groupName);
    if (!className || !theme) continue;
    scopes.set(JSON.stringify([className, theme]), { studentName: normalizedStudentName, className, theme });
  }

  for (const scope of scopes.values()) {
    try {
      result.synced.push(await ensureStudentTopicInNotion(scope));
    } catch (error) {
      result.failed.push({ ...scope, error });
    }
  }
  return result;
};
