import axios from 'axios';

const notionApiBases = [
  process.env.REACT_APP_NOTION_API_BASE_URL,
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

const parseNoteContent = (noteContent) => {
  const raw = String(noteContent || '').trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const resolveLatestTeacherMessage = (parsedNote = {}) => {
  const messages = Array.isArray(parsedNote?.teacherMessages) ? parsedNote.teacherMessages : [];
  const latestFromArray = [...messages]
    .reverse()
    .find((item) => normalizeFieldValue(item?.content) && normalizeFieldValue(item?.sender));
  if (latestFromArray) {
    return {
      content: normalizeFieldValue(latestFromArray.content),
      timestamp: normalizeFieldValue(latestFromArray.createdAt || latestFromArray.timestamp),
    };
  }

  return {
    content: normalizeFieldValue(parsedNote?.teacherNotificationMessage || parsedNote?.teacherMessage),
    timestamp: normalizeFieldValue(parsedNote?.teacherNotificationAt || parsedNote?.teacherMessageAt),
  };
};

const parseTeacherMessageFieldText = (rawText) => {
  const text = String(rawText || '').trim();
  if (!text) return [];

  return text
    .split(/\r?\n/)
    .map((line) => String(line || '').trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([^:]+)\s*:\s*(.*?)(?:\s*\(([^)]+)\))?$/);
      if (!match) {
        return {
          sender: 'Teacher',
          content: line,
          time: '',
        };
      }
      return {
        sender: normalizeFieldValue(match[1]) || 'Teacher',
        content: normalizeFieldValue(match[2]),
        time: normalizeFieldValue(match[3]),
      };
    })
    .filter((item) => item.content);
};

const resolveTeacherMessages = ({ parsedNote, notionData }) => {
  const messages = Array.isArray(parsedNote?.teacherMessages) ? parsedNote.teacherMessages : [];
  const normalizedMessages = messages
    .map((item) => ({
      sender: normalizeFieldValue(item?.sender) || 'Teacher',
      content: normalizeFieldValue(item?.content),
      time: normalizeFieldValue(item?.createdAt || item?.timestamp),
    }))
    .filter((item) => item.content);

  if (normalizedMessages.length > 0) {
    return normalizedMessages;
  }

  const latestTeacherMessage = resolveLatestTeacherMessage(parsedNote);
  const directTeacherMessage = normalizeFieldValue(notionData?.teacherMessage);
  const parsedFromField = parseTeacherMessageFieldText(directTeacherMessage);
  if (parsedFromField.length > 0) {
    return parsedFromField;
  }
  const fallbackContent = directTeacherMessage || latestTeacherMessage.content;
  const fallbackTime = latestTeacherMessage.timestamp;
  if (!fallbackContent) return [];

  return [
    {
      sender: 'Teacher',
      content: fallbackContent,
      time: fallbackTime,
    },
  ];
};

const resolveGradingNotificationTime = ({ notionData, parsedNote }) =>
  normalizeFieldValue(parsedNote?.gradingNotifiedAt) || normalizeFieldValue(notionData?.lastEditedTime);

export const fetchNotificationStatus = async ({ studentName, className, theme }) => {
  try {
    const notionData = await fetchEssayFromNotion({ studentName, className, theme });
    const graded = hasGradedScore(notionData?.totalScore);
    const parsedNote = parseNoteContent(notionData?.noteContent);
    const teacherMessages = resolveTeacherMessages({ parsedNote, notionData });
    const latestTeacherMessage = teacherMessages.length > 0 ? teacherMessages[teacherMessages.length - 1] : null;
    const mergedTeacherMessage = normalizeFieldValue(latestTeacherMessage?.content);
    const mergedTeacherMessageTime = normalizeFieldValue(latestTeacherMessage?.time);
    const gradingTime = resolveGradingNotificationTime({ notionData, parsedNote });
    const hasTeacherMessage = teacherMessages.length > 0;
    const hasNotification = graded || hasTeacherMessage;

    const notifications = [];
    if (hasTeacherMessage) {
      teacherMessages.forEach((item) => {
        notifications.push({
          type: 'teacher-message',
          title: 'Teacher',
          content: item.content,
          time: item.time,
        });
      });
    }
    if (graded) {
      notifications.push({
        type: 'grading-complete',
        title: 'Grading Complete',
        content: "Your essay has been graded! You can check your teacher's comments and score in Scoring & Feedback.",
        time: gradingTime,
      });
    }

    const versionParts = [
      graded ? 'graded' : 'not-graded',
      normalizeFieldValue(notionData?.totalScore),
      hasTeacherMessage ? 'teacher-msg' : 'no-teacher-msg',
      normalizeFieldValue(
        teacherMessages.map((item) => `${normalizeFieldValue(item.time)}::${normalizeFieldValue(item.content)}`).join('|')
      ),
      normalizeFieldValue(gradingTime),
    ];
    const version = versionParts.join('|');

    let message = 'No new notification for this class topic yet.';
    if (graded && hasTeacherMessage) {
      message = `Your essay has been graded. Teacher message: ${mergedTeacherMessage}`;
    } else if (graded) {
      message = "Your essay has been graded! You can check your teacher's comments and score in Scoring & Feedback.";
    } else if (hasTeacherMessage) {
      message = `New teacher message: ${mergedTeacherMessage}`;
    }

    return {
      hasNotification,
      graded,
      hasTeacherMessage,
      teacherMessage: mergedTeacherMessage,
      teacherMessageTime: mergedTeacherMessageTime,
      gradingTime,
      notifications,
      version,
      message,
    };
  } catch (error) {
    if (error?.code === 'NOT_FOUND') {
      return {
        hasNotification: false,
        graded: false,
        hasTeacherMessage: false,
        teacherMessage: '',
        teacherMessageTime: '',
        gradingTime: '',
        notifications: [],
        version: 'not-found',
        message: 'No new notification for this class topic yet.',
      };
    }
    throw error;
  }
};
