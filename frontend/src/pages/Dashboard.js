import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavbarStudent from '../components/Navbar_Student';
import config from '../config.json';
import url from '../url.json';
import context1142BUrl from '../contexts/1142B.txt';
import context1142CUrl from '../contexts/1142C.txt';
import context1142HUrl from '../contexts/1142H.txt';

const FALLBACK_CLASSES = [
  { value: '701', label: 'Class 701' },
  { value: '702', label: 'Class 702' },
  { value: '703', label: 'Class 703' },
  { value: '704', label: 'Class 704' },
  { value: '1142B', label: 'Class 1142B' },
  { value: '1142C', label: 'Class 1142C' },
  { value: '1142H', label: 'Class 1142H' },
];

const TOPIC_OPTIONS = [
  { value: 'argumentation', label: 'Argumentative Writing' },
  { value: 'science', label: 'Scientific Inquiry' },
  { value: 'society', label: 'Social Issues' },
  { value: 'media', label: 'Media Literacy' },
];

const TASK_LABELS = ['Topic Understanding', 'Research Collection', 'Group Discussion', 'Argument Building', 'Presentation'];
const TREND_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const LOGIN_TREND_RANGE_OPTIONS = [
  { value: '7d', label: '最近七天', days: 7 },
  { value: '14d', label: '最近14天', days: 14 },
  { value: '30d', label: '最近一個月', days: 30 },
  { value: 'all', label: '全部', days: null },
];
const DEFAULT_LOGIN_TREND_RANGE = LOGIN_TREND_RANGE_OPTIONS[0].value;
const NOTION_API_BASES = [
  process.env.REACT_APP_NOTION_API_BASE_URL,
  '/notion-api',
  '/api/notion',
  'http://localhost:4000',
  'http://140.115.126.27:4000',
].filter(Boolean);
const DASHBOARD_SUPPORTED_CLASS_CODES = ['1142B', '1142C', '1142H'];
const DASHBOARD_CONTEXT_BY_CLASS = {
  '1142B': context1142BUrl,
  '1142C': context1142CUrl,
  '1142H': context1142HUrl,
};
const RAGFLOW_DASHBOARD_AGENT_ID = '927247da462711f18b61a61716fb138a';
const RAGFLOW_API_KEY = 'ragflow-E5MjJlMmFlMWMxMTExZjFiZjJkYTYxNz';
const RAGFLOW_API_SERVER = 'https://wu-ragflow.zeabur.app';
const ARGUMENT_COLORS = {
  support: '#2F80ED',
  oppose: '#F2994A',
  evidence: '#27AE60',
};
const WARNING_COUNT_THRESHOLD = 5;
const DASHBOARD_SECTION_FILTERS = [
  { value: 'overview', label: '班級總覽' },
  { value: 'learning', label: '班級學習狀況' },
  { value: 'kf', label: 'KF論證狀況' },
  { value: 'system', label: '系統使用狀況' },
  { value: 'mastery', label: '答題掌握狀況' },
  { value: 'focus', label: '需重點關注對象' },
];
const KF_IDEA_CATEGORY_CONFIGS = [
  { key: 'myIdea', label: 'My idea', pattern: /my\s*idea/gi, color: '#4A90E2' },
  { key: 'betterIdea', label: 'A better idea', pattern: /a\s*better\s*idea/gi, color: '#27AE60' },
  { key: 'newInformation', label: 'New information', pattern: /new\s*information/gi, color: '#F39C12' },
  { key: 'cannotExplain', label: 'This idea cannot explain', pattern: /this\s*idea\s*cannot\s*explain/gi, color: '#E74C3C' },
  { key: 'needToUnderstand', label: 'I need to understand', pattern: /i\s*need\s*to\s*understand/gi, color: '#8E44AD' },
  { key: 'puttingTogether', label: 'Putting our knowledge together', pattern: /putting\s*our\s*knowledge\s*together/gi, color: '#16A085' },
];
const KF_IDEA_ALL_OPTION = 'ALL';
const KF_IDEA_WARNING_THRESHOLD = 3;
const KF_WORDCLOUD_MAX_TERMS = 36;
const KF_WORDCLOUD_STOPWORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'has', 'are', 'was', 'were', 'been', 'being', 'into',
  'about', 'will', 'would', 'could', 'should', 'their', 'there', 'they', 'them', 'then', 'than', 'your', 'you', 'our',
  'can', 'cannot', 'cant', 'just', 'also', 'more', 'most', 'very', 'much', 'many', 'some', 'such', 'when', 'what',
  'where', 'which', 'while', 'over', 'under', 'into', 'onto', 'between', 'because', 'through', 'across', 'within',
  'idea', 'my', 'better', 'new', 'information', 'need', 'understand', 'putting', 'knowledge', 'together',
  'support', 'oppose', 'evidence', 'group', 'students', 'student', 'learning', 'education', 'university',
  'use', 'these', 'without', 'needs', 'not', 'west', 'helps', 'make', 'don', 'may', 'too', 'own', 'best', 'like',
  'but', 'long', 'one', '參考資料', 'pdf', 'non', 'lose', 'point', 'how', 't',
  'http', 'https', 'com', 'org', 'edu', 'article', 'research', 'paper',
]);
const KF_WORDCLOUD_COLORS = ['#2F80ED', '#D81B60', '#27AE60', '#5E35B1', '#EF6C00', '#00897B', '#3949AB', '#E53935', '#6D4C41'];

const scoreFromKey = (key) => {
  return key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
};

const dedupeOptionsByValue = (options) => {
  return Array.from(new Map(options.map((option) => [option.value, option])).values());
};

const normalizeText = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const isSubmittedStatusYes = (value) => {
  const normalized = normalizeText(value);
  return normalized === '是' || normalized === 'yes' || normalized === 'true' || normalized === '1' || normalized === 'submitted' || normalized === '已繳交';
};

const hasMeaningfulTextContent = (value) => {
  if (typeof value !== 'string') return false;
  const normalized = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return normalized.length > 0;
};

const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== '';

const resolveNotionSubmissionState = (row) => {
  const notionSubmissionKeys = ['是否繳交', '是否繳交 ', '是否 繳交', '是否已繳交', 'submissionStatus', 'isSubmitted', 'submitted'];
  for (const key of notionSubmissionKeys) {
    if (Object.prototype.hasOwnProperty.call(row || {}, key)) {
      return {
        hasField: true,
        submitted: hasValue(row?.[key]),
      };
    }
  }
  return {
    hasField: false,
    submitted: false,
  };
};

const hasMeaningfulScore = (value) => {
  if (value === null || value === undefined) return false;
  const normalized = String(value).trim();
  return normalized !== '' && normalized !== '-';
};

const parseScoreValue = (value) => {
  if (!hasMeaningfulScore(value)) return null;
  const normalized = String(value).trim();
  const raw = normalized.includes('/') ? normalized.split('/')[0] : normalized;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

const pickFirstValue = (row, keys) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }
  return '';
};

const isRowSubmitted = (row) => {
  const notionSubmissionState = resolveNotionSubmissionState(row);
  if (notionSubmissionState.hasField) {
    return notionSubmissionState.submitted;
  }

  return (
    isSubmittedStatusYes(row?.submissionStatus) ||
    Boolean(row?.submissionDate) ||
    Boolean(row?.submittedAt)
  );
};

const getTotalScoreFromRow = (row) => pickFirstValue(row, ['totalScore', 'TotalScore', '總分', 'grade', 'Grade', 'score', 'Score', 'grading', 'Grading']);
const getClaimsScoreFromRow = (row) => pickFirstValue(row, ['claimsScore', 'ClaimsScore', 'claims', 'Claims']);
const getGroundsScoreFromRow = (row) => pickFirstValue(row, ['groundsScore', 'GroundsScore', 'grounds', 'Grounds']);
const getRebuttalsScoreFromRow = (row) => pickFirstValue(row, ['rebuttalsScore', 'RebuttalsScore', 'rebuttals', 'Rebuttals']);

const extractStudentNameFromRow = (row) =>
  String(row?.studentName || row?.name || row?.student || row?.username || row?.userName || '').trim();

const fetchEssayByScopeFromNotion = async ({ studentName, className, theme }) => {
  if (!studentName || !className || !theme) return {};

  let lastError = null;
  const token = localStorage.getItem('jwtToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  for (const base of NOTION_API_BASES) {
    const normalizedBase = String(base || '').replace(/\/+$/, '');
    if (!normalizedBase) continue;

    try {
      const response = await axios.get(`${normalizedBase}/api/get-essay/${encodeURIComponent(studentName)}`, {
        timeout: 15000,
        headers,
        params: { className, theme },
        withCredentials: false,
      });
      if (response?.data?.success) return response?.data?.data || {};
    } catch (error) {
      if (error?.response?.status === 404) return {};
      lastError = error;
    }
  }

  if (lastError) {
    console.warn(`Failed to fetch essay scope for ${studentName}:`, lastError?.message || lastError);
  }

  return {};
};

const buildProgressCompletionByStage = ({
  discussionContent = '',
  summaryContent = '',
  outlineContent = '',
  finalWritingContent = '',
  submissionStatus = '',
} = {}) => {
  const summaryCompleted = hasMeaningfulTextContent(summaryContent);
  const discussionCompleted = hasMeaningfulTextContent(discussionContent) || summaryCompleted;
  const outlineCompleted = hasMeaningfulTextContent(outlineContent);
  const finalWritingCompleted =
    hasMeaningfulTextContent(finalWritingContent) ||
    isSubmittedStatusYes(submissionStatus);

  const completedByStep = [discussionCompleted, summaryCompleted, outlineCompleted, finalWritingCompleted];
  return {
    completedByStep,
    allCompleted: completedByStep.every(Boolean),
  };
};

const getFallbackClassOptions = () => {
  const rawValue = localStorage.getItem('groupIds');
  if (!rawValue) {
    return FALLBACK_CLASSES;
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return FALLBACK_CLASSES;
    }

    const options = parsed.map((item, index) => {
      if (item && typeof item === 'object') {
        const value = String(item.id ?? item.groupId ?? index + 1);
        const label = item.name || item.className || `Class ${value}`;
        return { value, label };
      }

      const value = String(item);
      return { value, label: `Class ${value}` };
    });

    const uniqueOptions = dedupeOptionsByValue(options);
    return uniqueOptions.length > 0 ? uniqueOptions : FALLBACK_CLASSES;
  } catch (error) {
    return FALLBACK_CLASSES;
  }
};

const buildAuthConfig = () => {
  const jwtToken = localStorage.getItem('jwtToken');
  if (!jwtToken) {
    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  };
};

const buildPathCandidates = (apiBaseUrl, path) => {
  const normalizedBaseUrl = String(apiBaseUrl || '');
  const baseHasApiSuffix = /\/api\/?$/i.test(normalizedBaseUrl);
  const normalizedPath = String(path || '').replace(/^\/+/, '');
  const withoutApiPrefix = normalizedPath.replace(/^api\/+/i, '');
  const withApiPrefix = normalizedPath.toLowerCase().startsWith('api/') ? normalizedPath : `api/${normalizedPath}`;

  const rawCandidates = baseHasApiSuffix
    ? [normalizedPath, withoutApiPrefix]
    : [withApiPrefix, normalizedPath, withoutApiPrefix];

  return [...new Set(rawCandidates.filter(Boolean).map((item) => `${apiBaseUrl}${item}`))];
};

const normalizeBaseUrl = (value) => {
  const normalized = String(value || '').trim();
  if (!normalized) return '';
  return normalized.endsWith('/') ? normalized : `${normalized}/`;
};

const requestWithFallback = async ({ method, path, data, params, apiBaseUrls }) => {
  const uniqueBaseUrls = [...new Set((Array.isArray(apiBaseUrls) ? apiBaseUrls : []).map(normalizeBaseUrl).filter(Boolean))];
  const resolvedBaseUrls = uniqueBaseUrls.length > 0 ? uniqueBaseUrls : [normalizeBaseUrl(url.backendHost)].filter(Boolean);
  let lastError = null;

  for (const baseUrl of resolvedBaseUrls) {
    const endpointCandidates = buildPathCandidates(baseUrl, path);
    for (const endpoint of endpointCandidates) {
      try {
        return await axios({
          method,
          url: endpoint,
          data,
          params,
          ...buildAuthConfig(),
        });
      } catch (error) {
        lastError = error;
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500 && status !== 404) {
          throw error;
        }
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error(`No API endpoint candidates available for path: ${path}`);
};

const resolveNotionClassName = (selectedClassOption, selectedDashboardClassCode) => {
  if (selectedDashboardClassCode) return selectedDashboardClassCode;

  const selectedLabel = String(selectedClassOption?.label || '').trim();
  const selectedValue = String(selectedClassOption?.value || '').trim();
  if (!selectedLabel && selectedValue) return selectedValue;
  if (!selectedLabel) return '';

  return selectedLabel.replace(/^class\s+/i, '').trim();
};

const fetchNotionStudentsByClass = async ({ className, theme }) => {
  const normalizedClassName = String(className || '').trim();
  const normalizedTheme = String(theme || '').trim();
  if (!normalizedClassName) return [];

  let lastError = null;
  for (const base of NOTION_API_BASES) {
    const normalizedBase = String(base || '').replace(/\/+$/, '');
    if (!normalizedBase) continue;

    try {
      const response = await axios.get(
        `${normalizedBase}/api/get-students-by-class/${encodeURIComponent(normalizedClassName)}`,
        {
          timeout: 15000,
          params: {
            theme: normalizedTheme,
          },
        }
      );
      if (response?.data?.success && Array.isArray(response?.data?.data)) {
        return response.data.data;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Failed to fetch students by class from Notion.');
};

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const formatDateKey = (dateLike) => {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKeyToDate = (dateKey) => {
  if (typeof dateKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const date = new Date(`${dateKey}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatMonthDayLabel = (dateLike) => {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return '-';
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${month}/${day}`;
};

const resolveLoginTrendRangeDays = (rangeValue) => {
  const found = LOGIN_TREND_RANGE_OPTIONS.find((item) => item.value === rangeValue);
  return found?.days ?? 7;
};

const buildLoginTrendRowsByRange = (dateCountMap = {}, rangeValue = DEFAULT_LOGIN_TREND_RANGE, dateLike = new Date()) => {
  const today = new Date(dateLike);
  today.setHours(0, 0, 0, 0);
  const validKeys = Object.keys(dateCountMap || {})
    .filter((dateKey) => Boolean(parseDateKeyToDate(dateKey)))
    .sort((a, b) => parseDateKeyToDate(a).getTime() - parseDateKeyToDate(b).getTime());

  const rangeDays = resolveLoginTrendRangeDays(rangeValue);
  let startDate = new Date(today);
  if (rangeValue === 'all' && validKeys.length > 0) {
    startDate = parseDateKeyToDate(validKeys[0]);
  } else {
    const days = rangeDays || 7;
    startDate.setDate(today.getDate() - days + 1);
  }

  if (Number.isNaN(startDate.getTime()) || startDate.getTime() > today.getTime()) {
    startDate = new Date(today);
  }

  const rows = [];
  const cursor = new Date(startDate);
  while (cursor.getTime() <= today.getTime()) {
    const dateKey = formatDateKey(cursor);
    const weekdayIndex = (cursor.getDay() + 6) % 7;
    rows.push({
      day: formatMonthDayLabel(cursor),
      weekday: WEEKDAY_LABELS[weekdayIndex],
      date: dateKey,
      count: toNonNegativeInteger(dateCountMap?.[dateKey]),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  if (rows.length > 0) return rows;
  return [
    {
      day: formatMonthDayLabel(today),
      weekday: WEEKDAY_LABELS[(today.getDay() + 6) % 7],
      date: formatDateKey(today),
      count: 0,
    },
  ];
};

const formatDeadlineDisplay = (value) => {
  if (!value) return '未設定';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, '0');
  const dd = `${date.getDate()}`.padStart(2, '0');
  const hh = `${date.getHours()}`.padStart(2, '0');
  const mi = `${date.getMinutes()}`.padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
};

const isDeadlineNotPassed = (value) => {
  if (!value) return true;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return true;
  return date.getTime() >= Date.now();
};

const buildClassData = (classOption, topicOption) => {
  const seed = scoreFromKey(`${classOption.value}-${topicOption.value}`);
  const students = 24 + (seed % 11);
  const activeStudents = Math.min(students, Math.floor(students * (0.72 + ((seed % 12) / 100))));
  const completedTasks = 8 + (seed % 7);
  const pendingTasks = 3 + (seed % 4);
  const submittedHomework = Math.min(students, Math.floor(students * (0.58 + ((seed % 27) / 100))));
  const unsubmittedHomework = students - submittedHomework;
  const submissionRate = Math.round((submittedHomework / students) * 100);

  const completionRates = TASK_LABELS.map((task, index) => {
    const value = 55 + ((seed + index * 11) % 42);
    return { task, value };
  });

  const participationTrend = TREND_DAYS.map((day, index) => {
    const value = 42 + ((seed + index * 9) % 50);
    return { day, value };
  });

  const watchList = [
    { name: 'Student Lin', issue: 'Missed 2 homework submissions', action: 'Arrange after-class make-up submission' },
    { name: 'Student Chen', issue: 'Low discussion participation', action: 'Assign a speaking role in group work' },
    { name: 'Student Wang', issue: 'Incorrect citation format', action: 'Provide citation format guidance' },
    { name: 'Student Chang', issue: 'Weak argument linkage', action: 'Provide a sample argument framework' },
  ];

  const focusIndex = seed % watchList.length;

  return {
    summary: {
      students,
      activeStudents,
      activeRate: Math.round((activeStudents / students) * 100),
      completedTasks,
      pendingTasks,
      avgScore: 74 + (seed % 18),
      submittedHomework,
      unsubmittedHomework,
      submissionRate,
    },
    completionRates,
    participationTrend,
    watchList: [
      watchList[focusIndex],
      watchList[(focusIndex + 1) % watchList.length],
      watchList[(focusIndex + 2) % watchList.length],
    ],
  };
};

const cardStyle = {
  background: '#ffffff',
  borderRadius: '18px',
  padding: '20px',
  border: '1px solid #e8edf3',
  boxShadow: '0 8px 24px rgba(17, 43, 73, 0.08)',
};

const blockTitleStyle = {
  margin: 0,
  fontSize: '20px',
  color: '#133A5A',
  fontWeight: 700,
  textAlign: 'center',
};

const buildArgumentPieBackground = (counts) => {
  const support = Number(counts?.support || 0);
  const oppose = Number(counts?.oppose || 0);
  const evidence = Number(counts?.evidence || 0);
  const total = support + oppose + evidence;

  if (total <= 0) {
    return '#ECF2F8';
  }

  const supportPct = (support / total) * 100;
  const opposePct = (oppose / total) * 100;
  const evidencePct = 100 - supportPct - opposePct;
  const secondStop = supportPct + opposePct;
  const thirdStop = secondStop + evidencePct;

  return `conic-gradient(
    ${ARGUMENT_COLORS.support} 0% ${supportPct}%,
    ${ARGUMENT_COLORS.oppose} ${supportPct}% ${secondStop}%,
    ${ARGUMENT_COLORS.evidence} ${secondStop}% ${thirdStop}%
  )`;
};

const normalizeGroupId = (value) => {
  const normalized = String(value || '').trim().toUpperCase();
  return /^G\d+$/.test(normalized) ? normalized : '';
};

const normalizeStudentName = (value) => {
  const normalized = String(value || '').trim();
  return normalized || '';
};

const resolveDashboardClassCode = (selectedClass, selectedClassOption) => {
  const selectedClassValue = String(selectedClass || '').trim();
  const selectedClassLabel = String(selectedClassOption?.label || '');

  for (const classCode of DASHBOARD_SUPPORTED_CLASS_CODES) {
    if (selectedClassValue === classCode || selectedClassLabel.includes(classCode)) {
      return classCode;
    }
  }

  return '';
};

const toNonNegativeInteger = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.round(num));
};

const extractJsonText = (rawText) => {
  const text = String(rawText || '').trim();
  if (!text) return '';

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const objectLike = text.match(/\{[\s\S]*\}/);
  if (objectLike?.[0]) return objectLike[0];

  const arrayLike = text.match(/\[[\s\S]*\]/);
  if (arrayLike?.[0]) return arrayLike[0];

  return '';
};

const sortGroupIds = (groupIds) => {
  return [...new Set(groupIds)]
    .filter(Boolean)
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
};

const buildGroupsFromCountMap = (entries, countMap) => {
  const groupIdsFromEntries = entries.map((entry) => entry.groupId);
  const groupIdsFromMap = Object.keys(countMap || {});
  const orderedGroupIds = sortGroupIds([...groupIdsFromEntries, ...groupIdsFromMap]);

  return orderedGroupIds.map((groupId) => {
    const counts = countMap?.[groupId] || {};
    return {
      groupId,
      counts: {
        support: toNonNegativeInteger(counts.support),
        oppose: toNonNegativeInteger(counts.oppose),
        evidence: toNonNegativeInteger(counts.evidence),
      },
    };
  });
};

const parseAgentReplyData = (replyText, entries) => {
  const jsonText = extractJsonText(replyText);
  if (!jsonText) {
    throw new Error('RAGFLOW reply does not contain JSON.');
  }

  let parsed = null;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    throw new Error('RAGFLOW reply JSON parse failed.');
  }

  const groupsArray = Array.isArray(parsed?.groups)
    ? parsed.groups
    : Array.isArray(parsed)
      ? parsed
      : [];

  const countMap = {};
  const studentMapByGroup = {};

  groupsArray.forEach((group) => {
    const groupId = normalizeGroupId(group?.groupId || group?.group || group?.id);
    if (!groupId) return;

    const countsInput = group?.counts || group;
    countMap[groupId] = {
      support: toNonNegativeInteger(
        countsInput?.support ?? countsInput?.pro ?? countsInput?.agree ?? countsInput?.['贊成論點']
      ),
      oppose: toNonNegativeInteger(
        countsInput?.oppose ?? countsInput?.con ?? countsInput?.disagree ?? countsInput?.['反對論點']
      ),
      evidence: toNonNegativeInteger(
        countsInput?.evidence ?? countsInput?.proof ?? countsInput?.['證據']
      ),
    };

    const students = Array.isArray(group?.students) ? group.students : [];
    studentMapByGroup[groupId] = students
      .map((student) => {
        const name = normalizeStudentName(student?.name || student?.studentName || student?.student);
        if (!name) return null;
        const studentCountsInput = student?.counts || student;
        return {
          name,
          counts: {
            support: toNonNegativeInteger(
              studentCountsInput?.support ?? studentCountsInput?.pro ?? studentCountsInput?.agree ?? studentCountsInput?.['贊成論點']
            ),
            oppose: toNonNegativeInteger(
              studentCountsInput?.oppose ?? studentCountsInput?.con ?? studentCountsInput?.disagree ?? studentCountsInput?.['反對論點']
            ),
            evidence: toNonNegativeInteger(
              studentCountsInput?.evidence ?? studentCountsInput?.proof ?? studentCountsInput?.['證據']
            ),
          },
        };
      })
      .filter(Boolean);
  });

  if (Object.keys(countMap).length === 0 && parsed && typeof parsed === 'object') {
    Object.keys(parsed).forEach((key) => {
      const groupId = normalizeGroupId(key);
      if (!groupId) return;
      const value = parsed[key] || {};
      countMap[groupId] = {
        support: toNonNegativeInteger(value?.support ?? value?.['贊成論點']),
        oppose: toNonNegativeInteger(value?.oppose ?? value?.['反對論點']),
        evidence: toNonNegativeInteger(value?.evidence ?? value?.['證據']),
      };
    });
  }

  if (Object.keys(countMap).length === 0) {
    throw new Error('RAGFLOW reply JSON format is unsupported.');
  }

  return {
    groups: buildGroupsFromCountMap(entries, countMap),
    studentBreakdownByGroup: studentMapByGroup,
  };
};

const buildDashboardPrompt = (sourceText, classCode) => {
  const normalizedClassCode = String(classCode || '').trim() || '1142B';
  const sourceName = `${normalizedClassCode}.txt`;
  return [
    `你是論證分類助手，請閱讀以下 ${sourceName} 內容。`,
    '任務：統計每組 (G1, G2...) 三類筆數：support(贊成論點)、oppose(反對論點)、evidence(證據)。',
    '同時統計每組內每位學生在三類中的貢獻次數。',
    '請只輸出 JSON，不要任何解釋文字。',
    '輸出格式：{"groups":[{"groupId":"G1","counts":{"support":0,"oppose":0,"evidence":0},"students":[{"name":"學生A","counts":{"support":0,"oppose":0,"evidence":0}}]}]}',
    '',
    `${sourceName}:`,
    sourceText,
  ].join('\n');
};

const extractCompactEntriesFromText = (rawText) => {
  const text = String(rawText || '');
  const pattern = /\(([^()\r\n]{0,800}?G(\d+)\s*)\)/g;
  const matches = [...text.matchAll(pattern)];

  return matches.map((match) => {
    const markerText = String(match[1] || '').replace(/\s+/g, ' ').trim();
    const groupNo = String(match[2] || '').trim();
    const groupId = `G${groupNo}`;
    const topicText = markerText
      .replace(/\bby\b[\s\S]*$/i, '')
      .replace(/\bG\d+\s*$/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      groupId,
      text: topicText.slice(0, 180),
    };
  }).filter((item) => /^G\d+$/.test(item.groupId) && item.text);
};

const buildEmptyKfIdeaCategoryCounts = () => {
  return KF_IDEA_CATEGORY_CONFIGS.reduce((acc, item) => {
    acc[item.key] = 0;
    return acc;
  }, {});
};

const countPatternMatches = (text, pattern) => {
  const sourceText = String(text || '');
  if (!sourceText) return 0;
  const matcher = new RegExp(pattern.source, 'gi');
  const matches = sourceText.match(matcher);
  return Array.isArray(matches) ? matches.length : 0;
};

const parseKfIdeaCategoryCountsByGroup = (rawText) => {
  const text = String(rawText || '');
  const result = {};

  const headingRegex = /=+\s*GROUP\s*(\d+)\s*=+/gi;
  const headingMatches = [...text.matchAll(headingRegex)];

  if (headingMatches.length > 0) {
    headingMatches.forEach((match, index) => {
      const groupId = `G${match[1]}`;
      const start = (match.index ?? 0) + match[0].length;
      const end = index + 1 < headingMatches.length ? (headingMatches[index + 1].index ?? text.length) : text.length;
      const sectionText = text.slice(start, end);
      const counts = buildEmptyKfIdeaCategoryCounts();
      KF_IDEA_CATEGORY_CONFIGS.forEach((item) => {
        counts[item.key] = countPatternMatches(sectionText, item.pattern);
      });
      result[groupId] = counts;
    });
    return result;
  }

  const markerRegex = /\(([\s\S]{0,1500}?\bG(\d+)\b[\s\S]{0,300}?)\)/gi;
  const markers = [...text.matchAll(markerRegex)];
  markers.forEach((markerMatch) => {
    const groupNo = markerMatch[2];
    if (!groupNo) return;
    const groupId = `G${groupNo}`;
    if (!result[groupId]) {
      result[groupId] = buildEmptyKfIdeaCategoryCounts();
    }

    const markerIndex = markerMatch.index ?? 0;
    const lookbackStart = Math.max(0, markerIndex - 1600);
    const lookbackText = text.slice(lookbackStart, markerIndex);

    let matchedKey = '';
    let matchedAt = -1;
    KF_IDEA_CATEGORY_CONFIGS.forEach((item) => {
      const labelRegex = new RegExp(item.pattern.source, 'gi');
      let labelMatch = labelRegex.exec(lookbackText);
      while (labelMatch) {
        if ((labelMatch.index ?? -1) >= matchedAt) {
          matchedAt = labelMatch.index ?? -1;
          matchedKey = item.key;
        }
        labelMatch = labelRegex.exec(lookbackText);
      }
    });

    if (matchedKey) {
      result[groupId][matchedKey] += 1;
    }
  });

  return result;
};

const buildKfSpeechTextByGroup = (rawText) => {
  const text = String(rawText || '');
  const groupTextMap = {};
  if (!text.trim()) return groupTextMap;

  const headingRegex = /=+\s*GROUP\s*(\d+)\s*=+/gi;
  const headingMatches = [...text.matchAll(headingRegex)];
  if (headingMatches.length > 0) {
    headingMatches.forEach((match, index) => {
      const groupId = `G${match[1]}`;
      const start = (match.index ?? 0) + match[0].length;
      const end = index + 1 < headingMatches.length ? (headingMatches[index + 1].index ?? text.length) : text.length;
      const sectionText = text.slice(start, end).trim();
      groupTextMap[groupId] = `${groupTextMap[groupId] || ''}\n${sectionText}`.trim();
    });
    return groupTextMap;
  }

  const markerRegex = /\(([\s\S]{0,1800}?\bG(\d+)\b[\s\S]{0,300}?)\)/gi;
  const markers = [...text.matchAll(markerRegex)];
  let previousEnd = 0;
  markers.forEach((match) => {
    const groupNo = match[2];
    if (!groupNo) return;
    const groupId = `G${groupNo}`;
    const markerStart = match.index ?? previousEnd;
    const speechChunk = text.slice(previousEnd, markerStart).trim();
    if (speechChunk) {
      groupTextMap[groupId] = `${groupTextMap[groupId] || ''}\n${speechChunk}`.trim();
    }
    previousEnd = markerStart + match[0].length;
  });

  return groupTextMap;
};

const buildWordCloudTermsFromKfText = (rawText, selectedGroupId) => {
  const textByGroup = buildKfSpeechTextByGroup(rawText);
  const groupedText =
    selectedGroupId === KF_IDEA_ALL_OPTION
      ? Object.values(textByGroup).join('\n')
      : textByGroup[selectedGroupId] || '';
  const normalized = String(groupedText || '')
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/www\.\S+/gi, ' ')
    .replace(/\(([^)]*?)\)/g, ' ')
    .replace(/\bG\d+\b/gi, ' ')
    .replace(/[_*#~`"“”'’.,!?;:/\\|()[\]{}<>+=-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return [];

  const counts = {};
  const englishTokens = normalized.match(/[A-Za-z][A-Za-z'-]{2,}/g) || [];
  englishTokens.forEach((token) => {
    const word = token.toLowerCase();
    if (KF_WORDCLOUD_STOPWORDS.has(word)) return;
    counts[word] = (counts[word] || 0) + 1;
  });

  const chineseTokens = normalized.match(/[\u4e00-\u9fff]{2,}/g) || [];
  chineseTokens.forEach((token) => {
    counts[token] = (counts[token] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, KF_WORDCLOUD_MAX_TERMS);
};

const buildWordCloudLayout = (terms, width = 920, height = 300) => {
  if (!Array.isArray(terms) || terms.length === 0) return [];
  const maxCount = Math.max(1, ...terms.map((item) => Number(item.count || 0)));
  const minCount = Math.min(...terms.map((item) => Number(item.count || 0)));
  const denom = Math.max(1, maxCount - minCount);
  const centerX = width / 2;
  const centerY = height / 2;
  const placed = [];

  terms.forEach((term, index) => {
    const normalized = (Number(term.count || 0) - minCount) / denom;
    const fontSize = Math.round(16 + normalized * 64);
    const wordLength = String(term.word || '').length || 1;
    const wordWidth = Math.max(fontSize * 0.55 * wordLength, fontSize * 1.8);
    const wordHeight = fontSize * 1.05;
    let chosen = null;

    for (let step = 0; step < 1800; step += 1) {
      const angle = step * 0.38;
      const radius = 1.8 * angle;
      const x = centerX + radius * Math.cos(angle) - wordWidth / 2;
      const y = centerY + radius * Math.sin(angle) - wordHeight / 2;
      if (x < 2 || y < 2 || x + wordWidth > width - 2 || y + wordHeight > height - 2) continue;

      const box = { x, y, w: wordWidth, h: wordHeight };
      const hasOverlap = placed.some((existing) => {
        const padding = 5;
        return !(
          box.x + box.w + padding < existing.x ||
          box.x > existing.x + existing.w + padding ||
          box.y + box.h + padding < existing.y ||
          box.y > existing.y + existing.h + padding
        );
      });

      if (!hasOverlap) {
        chosen = box;
        break;
      }
    }

    if (!chosen) {
      chosen = {
        x: Math.max(2, Math.min(width - wordWidth - 2, centerX - wordWidth / 2 + (index % 5) * 10)),
        y: Math.max(2, Math.min(height - wordHeight - 2, centerY - wordHeight / 2 + (index % 7) * 8)),
        w: wordWidth,
        h: wordHeight,
      };
    }

    placed.push({
      ...chosen,
      word: term.word,
      count: Number(term.count || 0),
      fontSize,
      color: KF_WORDCLOUD_COLORS[index % KF_WORDCLOUD_COLORS.length],
      opacity: 0.7 + normalized * 0.3,
    });
  });

  return placed;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const fallbackClasses = useMemo(() => getFallbackClassOptions(), []);
  const [classOptions, setClassOptions] = useState(fallbackClasses);
  const [topicsByClass, setTopicsByClass] = useState(() => {
    const map = {};
    fallbackClasses.forEach((classOption) => {
      map[classOption.value] = TOPIC_OPTIONS;
    });
    return map;
  });

  const [selectedClass, setSelectedClass] = useState(fallbackClasses[0].value);
  const [selectedTopic, setSelectedTopic] = useState(TOPIC_OPTIONS[0].value);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState('');
  const [argumentBreakdown, setArgumentBreakdown] = useState(null);
  const [isArgumentBreakdownLoading, setIsArgumentBreakdownLoading] = useState(false);
  const [argumentBreakdownError, setArgumentBreakdownError] = useState('');
  const [argumentBreakdownWarning, setArgumentBreakdownWarning] = useState('');
  const [selectedKfGroup, setSelectedKfGroup] = useState('');
  const [kfIdeaCategoryCountsByGroup, setKfIdeaCategoryCountsByGroup] = useState({});
  const [selectedKfIdeaGroup, setSelectedKfIdeaGroup] = useState('');
  const [kfContextRawText, setKfContextRawText] = useState('');
  const [loginTrendDateCountMap, setLoginTrendDateCountMap] = useState({});
  const [loginTrendTotalStudents, setLoginTrendTotalStudents] = useState(0);
  const [classTopicRows, setClassTopicRows] = useState([]);
  const [topicDeadlineByClass, setTopicDeadlineByClass] = useState({});
  const [isLoginTrendLoading, setIsLoginTrendLoading] = useState(false);
  const [loginTrendError, setLoginTrendError] = useState('');
  const [selectedLoginTrendRange, setSelectedLoginTrendRange] = useState(DEFAULT_LOGIN_TREND_RANGE);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState(DASHBOARD_SECTION_FILTERS[0].value);

  const apiBaseUrls = useMemo(() => {
    const primaryBaseUrl = normalizeBaseUrl(url.backendHost);
    const backupBaseUrl = normalizeBaseUrl(url.backupBackendHost || 'http://140.115.126.27/');
    const localBaseUrl = normalizeBaseUrl(url.localBackendHost || 'http://localhost:3000/api/');
    return [...new Set([primaryBaseUrl, backupBaseUrl, localBaseUrl].filter(Boolean))];
  }, []);

  useEffect(() => {
    const fetchTeacherCreatedFilters = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        return;
      }

      setIsFilterLoading(true);
      setFilterError('');

      try {
        const response = await requestWithFallback({
          method: 'get',
          path: `${config[13].MyCreatedActivity}/${userId}`,
          apiBaseUrls,
        });

        const activities = Array.isArray(response.data) ? response.data : [];
        if (activities.length === 0) {
          return;
        }

        const parsedClasses = [];
        const parsedTopicsByClass = {};
        const parsedTopicDeadlineByClass = {};

        activities.forEach((activity, index) => {
          const classValue = String(activity.id ?? index + 1);
          const classLabel = activity.title || `Class ${classValue}`;

          const groups = Array.isArray(activity.Groups) ? activity.Groups : [];
          const validEndDates = [
            activity?.endDate,
            ...groups.map((group) => group?.endDate),
          ]
            .map((item) => String(item || '').trim())
            .filter(Boolean)
            .map((item) => new Date(item))
            .filter((date) => !Number.isNaN(date.getTime()));
          const classDeadline = validEndDates.length > 0
            ? new Date(Math.max(...validEndDates.map((date) => date.getTime()))).toISOString()
            : '';
          if (!isDeadlineNotPassed(classDeadline)) {
            return;
          }

          parsedClasses.push({ value: classValue, label: classLabel });
          parsedTopicDeadlineByClass[classValue] = {};

          const topicOptions = groups.map((group, groupIndex) => {
            const topicValue = String(group.id ?? `${classValue}-${groupIndex + 1}`);
            const topicLabel = group.groupName || `Topic ${groupIndex + 1}`;
            parsedTopicDeadlineByClass[classValue][topicValue] = group?.endDate || activity?.endDate || '';
            return { value: topicValue, label: topicLabel };
          });

          parsedTopicsByClass[classValue] = topicOptions.length > 0
            ? dedupeOptionsByValue(topicOptions)
            : [{ value: `${classValue}-default-topic`, label: 'Untitled Topic' }];
        });

        const uniqueClassOptions = dedupeOptionsByValue(parsedClasses);
        if (uniqueClassOptions.length > 0) {
          setClassOptions(uniqueClassOptions);
          setTopicsByClass(parsedTopicsByClass);
          setTopicDeadlineByClass(parsedTopicDeadlineByClass);
          setSelectedClass((prev) => {
            if (uniqueClassOptions.some((option) => option.value === prev)) {
              return prev;
            }
            return uniqueClassOptions[0].value;
          });
        } else {
          setClassOptions([{ value: '', label: 'No Active Class' }]);
          setTopicsByClass({ '': [{ value: 'no-active-topic', label: 'No Active Topic' }] });
          setTopicDeadlineByClass({});
          setSelectedClass('');
        }
      } catch (error) {
        console.error('Failed to load teacher-created filter data:', error);
        setFilterError('Failed to load teacher-created classes/topics. Fallback data is being used.');
      } finally {
        setIsFilterLoading(false);
      }
    };

    fetchTeacherCreatedFilters();
  }, [apiBaseUrls]);

  const topicOptions = useMemo(() => {
    const options = topicsByClass[selectedClass];
    if (Array.isArray(options) && options.length > 0) {
      return options;
    }
    return TOPIC_OPTIONS;
  }, [topicsByClass, selectedClass]);

  useEffect(() => {
    if (!topicOptions.some((option) => option.value === selectedTopic)) {
      setSelectedTopic(topicOptions[0].value);
    }
  }, [topicOptions, selectedTopic]);

  const selectedClassOption = classOptions.find((option) => option.value === selectedClass) || classOptions[0];
  const selectedTopicOption = topicOptions.find((option) => option.value === selectedTopic) || topicOptions[0];
  const selectedTopicDeadlineRaw = topicDeadlineByClass?.[selectedClass]?.[selectedTopic] || '';
  const selectedTopicDeadlineLabel = formatDeadlineDisplay(selectedTopicDeadlineRaw);
  const selectedDashboardClassCode = resolveDashboardClassCode(selectedClass, selectedClassOption);
  const selectedNotionClassName = resolveNotionClassName(selectedClassOption, selectedDashboardClassCode);
  const selectedDashboardContextUrl = selectedDashboardClassCode
    ? DASHBOARD_CONTEXT_BY_CLASS[selectedDashboardClassCode]
    : '';
  const isTargetClassSelected = Boolean(selectedDashboardClassCode && selectedDashboardContextUrl);

  const classData = useMemo(
    () => buildClassData(selectedClassOption, selectedTopicOption),
    [selectedClassOption, selectedTopicOption]
  );
  const displayedLoginTrendRows = useMemo(
    () => buildLoginTrendRowsByRange(loginTrendDateCountMap, selectedLoginTrendRange),
    [loginTrendDateCountMap, selectedLoginTrendRange]
  );
  const selectedLoginTrendRangeLabel =
    LOGIN_TREND_RANGE_OPTIONS.find((item) => item.value === selectedLoginTrendRange)?.label || '最近七天';
  const loginTrendPlotTop = 10;
  const loginTrendPlotBottom = 94;
  const loginTrendPlotHeight = loginTrendPlotBottom - loginTrendPlotTop;
  const loginTrendYAxisMin = 0;
  const loginTrendObservedMax = Math.max(0, ...displayedLoginTrendRows.map((item) => toNonNegativeInteger(item.count)));
  const loginTrendAutoMax = Math.max(5, loginTrendObservedMax + 2);
  const loginTrendStep = Math.max(1, Math.ceil(loginTrendAutoMax / 5));
  const loginTrendYAxisMax = loginTrendStep * 5;
  const loginTrendRange = Math.max(1, loginTrendYAxisMax - loginTrendYAxisMin);
  const loginTrendTickCount = 6;
  const loginTrendTicks = Array.from({ length: loginTrendTickCount }, (_, index) => {
    const ratio = index / (loginTrendTickCount - 1);
    const tickValue = loginTrendYAxisMax - index * loginTrendStep;
    const y = loginTrendPlotTop + ratio * loginTrendPlotHeight;
    return {
      y,
      value: tickValue,
    };
  });
  const loginTrendPolylinePoints = displayedLoginTrendRows
    .map((item, index) => {
      const x = displayedLoginTrendRows.length <= 1 ? 50 : ((index + 0.5) / displayedLoginTrendRows.length) * 100;
      const clampedCount = Math.min(loginTrendYAxisMax, Math.max(loginTrendYAxisMin, item.count));
      const y = loginTrendPlotBottom - (((clampedCount - loginTrendYAxisMin) / loginTrendRange) * loginTrendPlotHeight);
      return `${x},${y}`;
    })
    .join(' ');
  const averageLoginCount = Math.round(
    displayedLoginTrendRows.reduce((sum, item) => sum + item.count, 0) / Math.max(1, displayedLoginTrendRows.length)
  );
  const totalLoginCount = displayedLoginTrendRows.reduce((sum, item) => sum + item.count, 0);
  const breakdownModelLabel = argumentBreakdown?.model || 'RAGFLOW agent';
  const kfGroupOptions = Array.isArray(argumentBreakdown?.groups) ? argumentBreakdown.groups : [];
  const selectedKfGroupData = kfGroupOptions.find((group) => group.groupId === selectedKfGroup) || kfGroupOptions[0] || null;
  const kfIdeaGroupOptions = useMemo(
    () => {
      const groups = Object.keys(kfIdeaCategoryCountsByGroup).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
      return groups.length > 0 ? [KF_IDEA_ALL_OPTION, ...groups] : [];
    },
    [kfIdeaCategoryCountsByGroup]
  );
  const kfIdeaAggregateCounts = useMemo(() => {
    const aggregate = buildEmptyKfIdeaCategoryCounts();
    Object.values(kfIdeaCategoryCountsByGroup).forEach((groupCounts) => {
      KF_IDEA_CATEGORY_CONFIGS.forEach((item) => {
        aggregate[item.key] += Number(groupCounts?.[item.key] || 0);
      });
    });
    return aggregate;
  }, [kfIdeaCategoryCountsByGroup]);
  const kfIdeaHasAnyLowCountByCategory = useMemo(() => {
    const flags = {};
    KF_IDEA_CATEGORY_CONFIGS.forEach((item) => {
      flags[item.key] = Object.values(kfIdeaCategoryCountsByGroup).some(
        (groupCounts) => Number(groupCounts?.[item.key] || 0) < KF_IDEA_WARNING_THRESHOLD
      );
    });
    return flags;
  }, [kfIdeaCategoryCountsByGroup]);
  const selectedKfIdeaCounts =
    selectedKfIdeaGroup === KF_IDEA_ALL_OPTION
      ? kfIdeaAggregateCounts
      : kfIdeaCategoryCountsByGroup[selectedKfIdeaGroup] || null;
  const kfWordCloudTerms = useMemo(
    () => buildWordCloudTermsFromKfText(kfContextRawText, selectedKfIdeaGroup || ''),
    [kfContextRawText, selectedKfIdeaGroup]
  );
  const selectedGroupStudentsRaw = Array.isArray(argumentBreakdown?.studentBreakdownByGroup?.[selectedKfGroupData?.groupId])
    ? argumentBreakdown.studentBreakdownByGroup[selectedKfGroupData.groupId]
    : [];
  const selectedGroupStudents = [...selectedGroupStudentsRaw]
    .map((student) => {
      const support = Number(student?.counts?.support || 0);
      const oppose = Number(student?.counts?.oppose || 0);
      const evidence = Number(student?.counts?.evidence || 0);
      return {
        name: student?.name || 'Unknown',
        counts: { support, oppose, evidence },
        total: support + oppose + evidence,
      };
    })
    .sort((a, b) => b.total - a.total);
  const studentBarMax = Math.max(
    1,
    ...selectedGroupStudents.flatMap((student) => [student.counts.support, student.counts.oppose, student.counts.evidence])
  );
  const classOverviewSummary = useMemo(() => {
    const studentMap = new Map();
    classTopicRows.forEach((row, index) => {
      const studentName = extractStudentNameFromRow(row);
      const key = normalizeText(studentName) || `unknown-${index}`;
      const rowDate = new Date(row?.submissionDate || row?.submittedAt || 0).getTime();
      const totalScoreRaw = getTotalScoreFromRow(row);
      const totalScore = parseScoreValue(totalScoreRaw);
      const claimsScore = parseScoreValue(getClaimsScoreFromRow(row));
      const groundsScore = parseScoreValue(getGroundsScoreFromRow(row));
      const rebuttalsScore = parseScoreValue(getRebuttalsScoreFromRow(row));
      const isSubmitted = isRowSubmitted(row);
      const isGraded = totalScore !== null;
      const existing = studentMap.get(key) || {
        studentName: studentName || `Student ${index + 1}`,
        submitted: false,
        graded: false,
        latestDate: Number.NEGATIVE_INFINITY,
        gradedDate: Number.NEGATIVE_INFINITY,
        gradedScores: null,
        submittedClaims: null,
        submittedGrounds: null,
        submittedRebuttals: null,
        submittedClaimsDate: Number.NEGATIVE_INFINITY,
        submittedGroundsDate: Number.NEGATIVE_INFINITY,
        submittedRebuttalsDate: Number.NEGATIVE_INFINITY,
        allProgressCompleted: false,
      };

      existing.submitted = existing.submitted || isSubmitted;
      if (rowDate > existing.latestDate) {
        existing.latestDate = rowDate;
      }
      if (isGraded && rowDate >= existing.gradedDate) {
        existing.graded = true;
        existing.gradedDate = rowDate;
        existing.gradedScores = {
          total: totalScore,
          claims: claimsScore,
          grounds: groundsScore,
          rebuttals: rebuttalsScore,
        };
      }
      if (isSubmitted && claimsScore !== null && rowDate >= existing.submittedClaimsDate) {
        existing.submittedClaims = claimsScore;
        existing.submittedClaimsDate = rowDate;
      }
      if (isSubmitted && groundsScore !== null && rowDate >= existing.submittedGroundsDate) {
        existing.submittedGrounds = groundsScore;
        existing.submittedGroundsDate = rowDate;
      }
      if (isSubmitted && rebuttalsScore !== null && rowDate >= existing.submittedRebuttalsDate) {
        existing.submittedRebuttals = rebuttalsScore;
        existing.submittedRebuttalsDate = rowDate;
      }
      existing.allProgressCompleted = existing.allProgressCompleted || Boolean(row?.allProgressCompleted);
      studentMap.set(key, existing);
    });

    const students = studentMap.size;
    const studentRows = Array.from(studentMap.values());
    const submittedRows = studentRows.filter((item) => item.submitted);
    const submitted = submittedRows.length;
    const gradedRows = Array.from(studentMap.values()).filter((item) => item.graded && item.gradedScores);
    const graded = gradedRows.length;
    const totalScoreSum = gradedRows.reduce((sum, item) => sum + (item.gradedScores?.total ?? 0), 0);
    const submittedClaimsValues = submittedRows.map((item) => item.submittedClaims).filter((value) => value !== null);
    const submittedGroundsValues = submittedRows.map((item) => item.submittedGrounds).filter((value) => value !== null);
    const submittedRebuttalsValues = submittedRows.map((item) => item.submittedRebuttals).filter((value) => value !== null);
    const claimsSum = submittedClaimsValues.reduce((sum, value) => sum + value, 0);
    const groundsSum = submittedGroundsValues.reduce((sum, value) => sum + value, 0);
    const rebuttalsSum = submittedRebuttalsValues.reduce((sum, value) => sum + value, 0);
    const avgTotal = graded > 0 ? totalScoreSum / graded : 0;
    const avgClaims = submittedClaimsValues.length > 0 ? claimsSum / submittedClaimsValues.length : 0;
    const avgGrounds = submittedGroundsValues.length > 0 ? groundsSum / submittedGroundsValues.length : 0;
    const avgRebuttals = submittedRebuttalsValues.length > 0 ? rebuttalsSum / submittedRebuttalsValues.length : 0;
    const submissionRate = students > 0 ? Math.round((submitted / students) * 100) : 0;
    const gradingRate = submitted > 0 ? Math.round((graded / submitted) * 100) : 0;
    const accuracyRate = Math.max(0, Math.min(100, Math.round((avgTotal / 11) * 100)));
    const completedAllProgressCount = studentRows.filter((item) => item.allProgressCompleted).length;

    return {
      students,
      submitted,
      graded,
      avgTotal,
      avgClaims,
      avgGrounds,
      avgRebuttals,
      submissionRate,
      gradingRate,
      accuracyRate,
      completedAllProgressCount,
    };
  }, [classTopicRows]);
  const isSubmissionRateLow = classOverviewSummary.submissionRate < 50;
  const isGradingRateLow = classOverviewSummary.gradingRate < 50;
  const classDisplayName = String(selectedClassOption?.label || '-').replace(/^class\s+/i, '').trim() || '-';
  const completedAllProgressStudents = classOverviewSummary.completedAllProgressCount;
  const completedAllProgressPercent = classOverviewSummary.students > 0
    ? Math.round((completedAllProgressStudents / classOverviewSummary.students) * 100)
    : 0;
  const masteryRateDisplay = classOverviewSummary.accuracyRate > 0 ? classOverviewSummary.accuracyRate : 78;
  const avgClassScoreDisplay = classOverviewSummary.avgTotal > 0 ? classOverviewSummary.avgTotal.toFixed(1) : '0.0';
  const showClassOverviewCard = selectedSectionFilter === 'overview' || selectedSectionFilter === 'mastery';
  const showLearningStatusCard = selectedSectionFilter === 'learning';
  const showFocusCard = selectedSectionFilter === 'focus';
  const showSystemCard = selectedSectionFilter === 'system';
  const showKfCard = selectedSectionFilter === 'kf';

  useEffect(() => {
    let isCancelled = false;

    const fetchRealLoginTrend = async () => {
      const notionClassName = resolveNotionClassName(selectedClassOption, selectedDashboardClassCode);
      const selectedThemeName = String(selectedTopicOption?.label || '').trim();
      if (!notionClassName) {
        setLoginTrendDateCountMap({});
        setLoginTrendTotalStudents(0);
        setClassTopicRows([]);
        setLoginTrendError('Class name is missing. Cannot load login trend.');
        setIsLoginTrendLoading(false);
        return;
      }

      setIsLoginTrendLoading(true);
      setLoginTrendError('');

      try {
        const notionRows = await fetchNotionStudentsByClass({
          className: notionClassName,
          theme: selectedThemeName,
        });
        const normalizedTheme = normalizeText(selectedThemeName);
        const scopedRows = normalizedTheme
          ? notionRows.filter((item) => normalizeText(item?.theme) === normalizedTheme)
          : notionRows;
        const scopedRowsByStudentKey = new Map();
        scopedRows.forEach((item, index) => {
          const studentName = extractStudentNameFromRow(item);
          const studentKey = normalizeText(studentName) || `unknown-${index}`;
          const rowTimestamp = new Date(item?.submissionDate || item?.submittedAt || 0).getTime();
          const existing = scopedRowsByStudentKey.get(studentKey);
          if (!existing || rowTimestamp >= existing.rowTimestamp) {
            scopedRowsByStudentKey.set(studentKey, {
              studentName,
              studentKey,
              rowTimestamp,
              submissionStatus: item?.submissionStatus || '',
              theme: String(item?.theme || selectedThemeName || '').trim(),
            });
          }
        });

        const completionResultEntries = await Promise.all(
          [...scopedRowsByStudentKey.values()].map(async (studentInfo) => {
            const essayData = await fetchEssayByScopeFromNotion({
              studentName: studentInfo.studentName,
              className: notionClassName,
              theme: studentInfo.theme,
            });
            const discussionContent = typeof essayData?.chatHistory === 'string'
              ? essayData.chatHistory
              : Array.isArray(essayData?.chatHistory)
                ? essayData.chatHistory.map((item) => JSON.stringify(item)).join(' ')
                : String(essayData?.chatHistory || '');
            const completion = buildProgressCompletionByStage({
              discussionContent,
              summaryContent: essayData?.kfAnalysisContent || '',
              outlineContent: essayData?.outlineContent || '',
              finalWritingContent: essayData?.essayContent || '',
              submissionStatus: studentInfo.submissionStatus,
            });

            return [studentInfo.studentKey, completion.allCompleted];
          })
        );
        const completionMapByStudentKey = new Map(completionResultEntries);
        const scopedRowsWithProgress = scopedRows.map((row, index) => {
          const studentName = extractStudentNameFromRow(row);
          const studentKey = normalizeText(studentName) || `unknown-${index}`;
          return {
            ...row,
            allProgressCompleted: Boolean(completionMapByStudentKey.get(studentKey)),
          };
        });
        const uniqueStudentCount = new Set(
          scopedRows
            .map((item) => normalizeText(extractStudentNameFromRow(item)))
            .filter(Boolean)
        ).size;

        const dateCountMap = {};

        scopedRows.forEach((item) => {
          const rawDateCounts = item?.loginDateCounts && typeof item.loginDateCounts === 'object'
            ? item.loginDateCounts
            : {};
          Object.entries(rawDateCounts).forEach(([dateKey, count]) => {
            const normalizedDate = parseDateKeyToDate(dateKey);
            if (!normalizedDate) return;
            const normalizedDateKey = formatDateKey(normalizedDate);
            dateCountMap[normalizedDateKey] = (dateCountMap[normalizedDateKey] || 0) + toNonNegativeInteger(count);
          });
        });

        if (!isCancelled) {
          setClassTopicRows(scopedRowsWithProgress);
          setLoginTrendDateCountMap(dateCountMap);
          setLoginTrendTotalStudents(uniqueStudentCount);
          if (scopedRows.length === 0) {
            setLoginTrendError(`No Notion records found for class "${notionClassName}" and topic "${selectedThemeName || '-'}".`);
          }
        }
      } catch (error) {
        console.error('Failed to load real login trend:', error);
        if (!isCancelled) {
          setClassTopicRows([]);
          setLoginTrendDateCountMap({});
          setLoginTrendTotalStudents(0);
          setLoginTrendError('Failed to load login counts from Notion.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoginTrendLoading(false);
        }
      }
    };

    fetchRealLoginTrend();

    return () => {
      isCancelled = true;
    };
  }, [selectedClassOption, selectedDashboardClassCode, selectedTopicOption]);

  useEffect(() => {
    if (kfGroupOptions.length === 0) {
      setSelectedKfGroup('');
      return;
    }

    setSelectedKfGroup((prev) => {
      if (kfGroupOptions.some((group) => group.groupId === prev)) {
        return prev;
      }
      return kfGroupOptions[0].groupId;
    });
  }, [kfGroupOptions]);

  useEffect(() => {
    if (kfIdeaGroupOptions.length === 0) {
      setSelectedKfIdeaGroup('');
      return;
    }

    setSelectedKfIdeaGroup((prev) => {
      if (kfIdeaGroupOptions.includes(prev)) {
        return prev;
      }
      if (kfIdeaGroupOptions.includes('G1')) {
        return 'G1';
      }
      const firstGroupOption = kfIdeaGroupOptions.find((item) => item !== KF_IDEA_ALL_OPTION);
      return firstGroupOption || KF_IDEA_ALL_OPTION;
    });
  }, [kfIdeaGroupOptions]);

  useEffect(() => {
    let isCancelled = false;

    const fetchArgumentBreakdown = async () => {
      if (!isTargetClassSelected) {
        setArgumentBreakdown(null);
        setArgumentBreakdownError('');
        setArgumentBreakdownWarning('');
        setSelectedKfGroup('');
        setKfIdeaCategoryCountsByGroup({});
        setSelectedKfIdeaGroup('');
        setKfContextRawText('');
        setIsArgumentBreakdownLoading(false);
        return;
      }

      setIsArgumentBreakdownLoading(true);
      setArgumentBreakdownError('');
      setArgumentBreakdownWarning('');
      setKfIdeaCategoryCountsByGroup({});
      setSelectedKfIdeaGroup('');

      try {
        const sourceTextResponse = await fetch(selectedDashboardContextUrl);
        if (!sourceTextResponse.ok) {
          throw new Error(`Failed to load ${selectedDashboardClassCode}.txt from frontend bundle (${sourceTextResponse.status}).`);
        }
        const sourceText = await sourceTextResponse.text();
        const parsedIdeaCountsByGroup = parseKfIdeaCategoryCountsByGroup(sourceText);
        if (!isCancelled) {
          setKfContextRawText(sourceText);
          setKfIdeaCategoryCountsByGroup(parsedIdeaCountsByGroup);
        }
        const entries = extractCompactEntriesFromText(sourceText);
        if (entries.length === 0) {
          throw new Error(`No group entries found in ${selectedDashboardClassCode}.txt.`);
        }

        const scopeUserId = String(localStorage.getItem('userId') || `dashboard_${selectedDashboardClassCode}_classifier`).trim();
        const createSessionUrl = `${RAGFLOW_API_SERVER}/api/v1/agents/${RAGFLOW_DASHBOARD_AGENT_ID}/sessions?user_id=${encodeURIComponent(scopeUserId)}`;
        const createSessionResponse = await fetch(createSessionUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RAGFLOW_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: `Dashboard-${selectedDashboardClassCode}-session` }),
        });

        const createSessionPayload = await createSessionResponse.json();
        if (!createSessionResponse.ok || createSessionPayload?.code !== 0) {
          throw new Error(createSessionPayload?.message || `RAGFLOW session create failed: HTTP ${createSessionResponse.status}`);
        }

        const sessionId =
          createSessionPayload?.data?.id ||
          createSessionPayload?.data?.session_id ||
          createSessionPayload?.id ||
          createSessionPayload?.session_id;

        if (!sessionId) {
          throw new Error('RAGFLOW session id missing in response.');
        }

        const completionResponse = await fetch(
          `${RAGFLOW_API_SERVER}/api/v1/agents/${RAGFLOW_DASHBOARD_AGENT_ID}/completions`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${RAGFLOW_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              question: buildDashboardPrompt(sourceText, selectedDashboardClassCode),
              session_id: sessionId,
              stream: false,
            }),
          }
        );

        const completionPayload = await completionResponse.json();
        if (!completionResponse.ok || completionPayload?.code !== 0) {
          throw new Error(completionPayload?.message || `RAGFLOW completion failed: HTTP ${completionResponse.status}`);
        }

        const answerText =
          completionPayload?.data?.data?.content ||
          completionPayload?.data?.answer ||
          completionPayload?.answer ||
          '';

        const parsedBreakdown = parseAgentReplyData(answerText, entries);
        const groups = parsedBreakdown.groups;

        if (!isCancelled) {
          setArgumentBreakdown({
            classCode: selectedDashboardClassCode,
            classifier: 'ragflow_agent',
            model: `ragflow-agent:${RAGFLOW_DASHBOARD_AGENT_ID}`,
            agentId: RAGFLOW_DASHBOARD_AGENT_ID,
            ragflowSessionId: String(sessionId),
            groups,
            studentBreakdownByGroup: parsedBreakdown.studentBreakdownByGroup,
            totalEntries: entries.length,
            generatedAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error(`Failed to load ${selectedDashboardClassCode} argument breakdown:`, error);
        if (!isCancelled) {
          setArgumentBreakdown(null);
          const detail =
            error?.message ||
            `Failed to analyze ${selectedDashboardClassCode} arguments from RAGFLOW reply.`;
          setArgumentBreakdownError(detail);
        }
      } finally {
        if (!isCancelled) {
          setIsArgumentBreakdownLoading(false);
        }
      }
    };

    fetchArgumentBreakdown();

    return () => {
      isCancelled = true;
    };
  }, [isTargetClassSelected, selectedDashboardClassCode, selectedDashboardContextUrl]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F6FAFF 0%, #F9F6F1 100%)' }}>
      <NavbarStudent />

      <main style={{ padding: '24px clamp(16px, 4vw, 48px) 36px' }}>
        <section
          style={{
            ...cardStyle,
            marginBottom: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
	          <div>
	            <h1 style={{ margin: 0, fontSize: '30px', color: '#0F2B46' }}>Dashboard</h1>
	            {isFilterLoading && (
	              <p style={{ margin: '8px 0 0', color: '#5B7087', fontSize: '13px' }}>
	                Loading teacher-created classes and topics...
              </p>
            )}
            {!isFilterLoading && filterError && (
              <p style={{ margin: '8px 0 0', color: '#B45309', fontSize: '13px' }}>{filterError}</p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="class-filter" style={{ fontWeight: 700, color: '#1F4060' }}>
                Class
              </label>
              <select
                id="class-filter"
                value={selectedClass}
                onChange={(event) => setSelectedClass(event.target.value)}
                style={{
                  minWidth: '170px',
                  height: '42px',
                  borderRadius: '10px',
                  border: '1px solid #cdd8e6',
                  padding: '0 12px',
                  fontSize: '15px',
                  color: '#1B314A',
                  backgroundColor: '#fff',
                }}
              >
                {classOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="topic-filter" style={{ fontWeight: 700, color: '#1F4060' }}>
                Topic
              </label>
              <select
                id="topic-filter"
                value={selectedTopic}
                onChange={(event) => setSelectedTopic(event.target.value)}
                style={{
                  minWidth: '170px',
                  height: '42px',
                  borderRadius: '10px',
                  border: '1px solid #cdd8e6',
                  padding: '0 12px',
                  fontSize: '15px',
                  color: '#1B314A',
                  backgroundColor: '#fff',
                }}
              >
                {topicOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

	        <section
	          style={{
	            ...cardStyle,
	            marginBottom: '18px',
	            padding: '6px',
	            borderRadius: '18px',
	            border: '1px solid #B8C4D1',
	            background: '#ffffff',
	          }}
	        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {DASHBOARD_SECTION_FILTERS.map((filter) => {
              const isActive = selectedSectionFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedSectionFilter(filter.value)}
                  style={{
                    border: '1px solid #A7B5C4',
                    borderRadius: '14px',
                    padding: '10px 18px',
                    fontSize: 'clamp(14px, 1.15vw, 20px)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: isActive ? '#205221' : '#2C4A65',
                    background: isActive ? '#BFE0A9' : '#ffffff',
                    boxShadow: isActive ? 'inset 0 0 0 1px #8FBC73' : 'none',
                    lineHeight: 1.15,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gap: '18px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          }}
        >
          {showClassOverviewCard && (
            <article style={{ ...cardStyle, gridColumn: '1 / -1' }}>
              <h2 style={blockTitleStyle}>班級概況</h2>
              {isLoginTrendLoading && (
                <p style={{ margin: '14px 0 0', color: '#4E6377', fontSize: '14px', textAlign: 'center' }}>載入班級主題資料中...</p>
              )}
              {!isLoginTrendLoading && loginTrendError && (
                <p style={{ margin: '14px 0 0', color: '#B45309', fontSize: '14px', textAlign: 'center' }}>{loginTrendError}</p>
              )}
              {!isLoginTrendLoading && !loginTrendError && (
	                <div
	                  style={{
	                    marginTop: '14px',
	                    display: 'grid',
	                    gap: '12px',
	                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 260px))',
	                    justifyContent: 'center',
	                  }}
	                >
		                  <div style={{ background: '#D7E8FB', borderRadius: '12px', padding: '16px 14px', width: '260px', height: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', justifySelf: 'center', boxSizing: 'border-box' }}>
		                    <p style={{ margin: 0, color: '#40607D', fontSize: '20px', fontWeight: 700, textAlign: 'center' }}>學生數</p>
		                    <div style={{ marginTop: '14px', color: '#294865', fontSize: '30px', textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
		                      {`${classOverviewSummary.students}`}
		                    </div>
		                  </div>
	
	                  <div style={{ background: '#E7DDFB', borderRadius: '12px', padding: '16px 14px', width: '260px', height: '260px', justifySelf: 'center', boxSizing: 'border-box' }}>
	                    <p style={{ margin: 0, color: '#40607D', fontSize: '20px', fontWeight: 700, textAlign: 'center' }}>作業繳交率</p>
	                    <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
	                      <div
	                        style={{
	                          width: '110px',
	                          height: '110px',
	                          borderRadius: '50%',
	                          background: `conic-gradient(#2F80ED 0% ${classOverviewSummary.submissionRate}%, #E8EEF7 ${classOverviewSummary.submissionRate}% 100%)`,
	                          position: 'relative',
	                          flexShrink: 0,
                        }}
                      >
	                        <div
	                          style={{
	                            position: 'absolute',
	                            inset: '18px',
	                            borderRadius: '50%',
	                            backgroundColor: '#fff',
	                            display: 'flex',
	                            alignItems: 'center',
	                            justifyContent: 'center',
	                            fontSize: '18px',
	                            fontWeight: 700,
	                            color: '#1A3A5A',
	                          }}
		                        >
			                          <span style={{ color: isSubmissionRateLow ? '#C0392B' : '#1A3A5A', fontSize: '18px', lineHeight: 1 }}>
			                            {classOverviewSummary.submissionRate}%
			                          </span>
		                        </div>
		                      </div>
		                      <div style={{ color: isSubmissionRateLow ? '#C0392B' : '#294865', fontSize: '16px', textAlign: 'center', fontWeight: isSubmissionRateLow ? 700 : 500 }}>
		                        {`已繳交 ${classOverviewSummary.submitted} / ${classOverviewSummary.students}`}
		                      </div>
		                    </div>
		                    <div style={{ marginTop: '10px', color: '#6A8096', fontSize: '12px', textAlign: 'center' }}>
		                      {`繳交期限：${selectedTopicDeadlineLabel}`}
		                    </div>
		                  </div>
	
	                  <div style={{ background: '#D8EEE4', borderRadius: '12px', padding: '16px 14px', width: '260px', height: '260px', justifySelf: 'center', boxSizing: 'border-box' }}>
	                    <p style={{ margin: 0, color: '#40607D', fontSize: '20px', fontWeight: 700, textAlign: 'center' }}>作業批改率</p>
	                    <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
	                      <div
	                        style={{
	                          width: '110px',
	                          height: '110px',
	                          borderRadius: '50%',
	                          background: `conic-gradient(#27AE60 0% ${classOverviewSummary.gradingRate}%, #E7F0EA ${classOverviewSummary.gradingRate}% 100%)`,
	                          position: 'relative',
	                          flexShrink: 0,
                        }}
                      >
	                        <div
	                          style={{
	                            position: 'absolute',
	                            inset: '18px',
	                            borderRadius: '50%',
	                            backgroundColor: '#fff',
	                            display: 'flex',
	                            alignItems: 'center',
	                            justifyContent: 'center',
	                            fontSize: '18px',
	                            fontWeight: 700,
	                            color: '#1A3A5A',
	                          }}
		                        >
			                          <span style={{ color: isGradingRateLow ? '#C0392B' : '#1A3A5A', fontSize: '18px', lineHeight: 1 }}>
			                            {classOverviewSummary.gradingRate}%
			                          </span>
		                        </div>
		                      </div>
		                      <div style={{ color: isGradingRateLow ? '#C0392B' : '#294865', fontSize: '16px', textAlign: 'center', fontWeight: isGradingRateLow ? 700 : 500 }}>
		                        {`已批改 ${classOverviewSummary.graded} / ${classOverviewSummary.submitted}`}
		                      </div>
		                    </div>
	                  </div>
	
		                  <div style={{ background: '#D7F0E2', borderRadius: '12px', padding: '16px 14px', width: '260px', height: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', justifySelf: 'center', boxSizing: 'border-box' }}>
		                    <p style={{ margin: 0, color: '#40607D', fontSize: '20px', fontWeight: 700, textAlign: 'center' }}>答題掌握率</p>
			                    <div style={{ marginTop: '14px', color: '#294865', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
			                      <div style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1.2 }}>{`${classOverviewSummary.accuracyRate}%`}</div>
			                      <div style={{ fontSize: '14px', lineHeight: 1.3 }}>{'(總共11道題目)'}</div>
			                    </div>
		                  </div>
	
		                  <div style={{ background: '#FFFFCE', borderRadius: '12px', padding: '16px 14px', width: '260px', height: '260px', justifySelf: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', boxSizing: 'border-box' }}>
	                    <p style={{ margin: 0, color: '#40607D', fontSize: '20px', fontWeight: 700, textAlign: 'center' }}>平均學習成績</p>
	                    <div style={{ marginTop: '14px', display: 'grid', gap: '8px' }}>
	                      {[
	                        { label: '平均總分', value: classOverviewSummary.avgTotal, max: 8, color: '#2F80ED' },
	                        { label: '平均 Claims', value: classOverviewSummary.avgClaims, max: 2, color: '#4A90E2' },
	                        { label: '平均 Grounds', value: classOverviewSummary.avgGrounds, max: 4, color: '#27AE60' },
	                        { label: '平均 Rebuttals', value: classOverviewSummary.avgRebuttals, max: 2, color: '#F2994A' },
	                      ].map((item) => {
	                        const ratio = item.max > 0 ? Math.max(0, Math.min(100, (item.value / item.max) * 100)) : 0;
	                        return (
	                          <div key={item.label} style={{ display: 'grid', gap: '4px' }}>
	                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#294865', fontSize: '13px', fontWeight: 700 }}>
	                              <span>{item.label}</span>
	                              <span>{`${item.value.toFixed(2)} / ${item.max}`}</span>
	                            </div>
	                            <div style={{ height: '10px', borderRadius: '999px', background: '#F8EBDD', overflow: 'hidden' }}>
	                              <div
	                                style={{
	                                  width: `${ratio}%`,
	                                  height: '100%',
	                                  borderRadius: '999px',
	                                  background: item.color,
	                                }}
	                              />
	                            </div>
	                          </div>
	                        );
	                      })}
	                    </div>
	                  </div>
                </div>
              )}
            </article>
          )}

          {showLearningStatusCard && (
            <article style={{ ...cardStyle, gridColumn: '1 / -1' }}>
              <h2 style={blockTitleStyle}>班級學習狀況</h2>
              <div
                style={{
                  marginTop: '14px',
                  border: '1px solid #C8D1DB',
                  borderRadius: '18px',
                  background: '#ECEDEF',
                  padding: '20px 22px 14px',
                  maxWidth: '900px',
                  width: '100%',
                  marginInline: 'auto',
                }}
              >
                <div style={{ color: '#173F63', fontSize: '26px', fontWeight: 700, textAlign: 'center' }}>
                  {classDisplayName}
                </div>

                <div style={{ marginTop: '14px', display: 'grid', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <span style={{ color: '#2D4A64', fontSize: '22px', fontWeight: 600 }}>完成所有進度百分比</span>
                    <span style={{ color: '#173F63', fontSize: '24px', fontWeight: 700 }}>
                      {`${completedAllProgressPercent}%`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <span style={{ color: '#2D4A64', fontSize: '22px', fontWeight: 600 }}>整體答題掌握率</span>
                    <span style={{ color: '#D64545', fontSize: '24px', fontWeight: 700 }}>{`${masteryRateDisplay}%`}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <span style={{ color: '#2D4A64', fontSize: '22px', fontWeight: 600 }}>班級平均分數</span>
                    <span style={{ color: '#173F63', fontSize: '24px', fontWeight: 700 }}>{`${avgClassScoreDisplay}/8`}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate('/Studentlist', {
                      state: {
                        className: selectedNotionClassName || classDisplayName,
                        topicName: selectedTopicOption?.label || '-',
                      },
                    })
                  }
                  style={{
                    marginTop: '14px',
                    width: '100%',
                    border: '1px solid #E3C95A',
                    borderRadius: '12px',
                    background: '#F2E7BB',
                    color: '#8C6C1F',
                    fontSize: '20px',
                    fontWeight: 700,
                    height: '56px',
                    cursor: 'pointer',
                  }}
                >
                  點擊展開詳細資訊
                </button>
              </div>
            </article>
          )}

          {showFocusCard && (
            <article style={cardStyle}>
            <h2 style={blockTitleStyle}>Students Needing Attention</h2>
            <div style={{ marginTop: '14px', display: 'grid', gap: '10px' }}>
              {classData.watchList.map((student) => (
                <div
                  key={student.name + student.issue}
                  style={{
                    borderRadius: '12px',
                    border: '1px solid #e6ecf3',
                    padding: '12px',
                    backgroundColor: '#FCFDFE',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
                    <strong style={{ color: '#173F63', fontSize: '16px' }}>{student.name}</strong>
                    <span style={{ color: '#6A8096', fontSize: '12px' }}>Priority Watch</span>
                  </div>
                  <p style={{ margin: '8px 0 4px', color: '#2D4A64', fontSize: '14px' }}>{student.issue}</p>
                  <p style={{ margin: 0, color: '#5C7187', fontSize: '13px' }}>Suggestion: {student.action}</p>
                </div>
              ))}
            </div>
            </article>
          )}

          {showSystemCard && (
            <article style={{ ...cardStyle, gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h2 style={{ ...blockTitleStyle, margin: 0 }}>Class Login Trend</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="login-trend-range-filter" style={{ color: '#1F4060', fontSize: '13px', fontWeight: 700 }}>
                  篩選
                </label>
                <select
                  id="login-trend-range-filter"
                  value={selectedLoginTrendRange}
                  onChange={(event) => setSelectedLoginTrendRange(event.target.value)}
                  style={{
                    minWidth: '130px',
                    height: '34px',
                    borderRadius: '9px',
                    border: '1px solid #cdd8e6',
                    padding: '0 10px',
                    fontSize: '13px',
                    color: '#1B314A',
                    backgroundColor: '#fff',
                  }}
                >
                  {LOGIN_TREND_RANGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p style={{ margin: '10px 0 0', color: '#4E6377', fontSize: '13px', textAlign: 'center' }}>
              Class "{selectedClassOption.label}" topic "{selectedTopicOption.label}" {selectedLoginTrendRangeLabel}平均每日登入次數：{averageLoginCount}
            </p>
            <p style={{ margin: '8px 0 0', color: '#5C7187', fontSize: '13px', textAlign: 'center' }}>
              Students: {loginTrendTotalStudents} | Total login counts: {totalLoginCount}
            </p>
            {isLoginTrendLoading && (
              <p style={{ margin: '8px 0 0', color: '#33516F', fontSize: '13px', textAlign: 'center' }}>
                Loading real login trend...
              </p>
            )}
            {!isLoginTrendLoading && loginTrendError && (
              <p style={{ margin: '8px 0 0', color: '#B45309', fontSize: '13px', textAlign: 'center' }}>
                {loginTrendError}
              </p>
            )}
            <div
              style={{
                marginTop: '14px',
                display: 'grid',
                gap: '16px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                alignItems: 'start',
              }}
            >
              <div style={{ border: '1px solid #E4ECF4', borderRadius: '12px', padding: '12px', background: '#FCFEFF' }}>
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-label="class login line chart"
                  style={{ width: '100%', height: '250px' }}
                >
                  {loginTrendTicks.map((tick) => (
                    <line key={`grid-${tick.y}`} x1="8" y1={tick.y} x2="100" y2={tick.y} stroke="#E7EEF6" strokeWidth="0.8" />
                  ))}
                  <line x1="8" y1={loginTrendPlotTop} x2="8" y2={loginTrendPlotBottom} stroke="#D7E3F0" strokeWidth="0.8" />
                  {loginTrendTicks.map((tick) => (
                    <text
                      key={`tick-${tick.y}`}
                      x="6.5"
                      y={tick.y}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fontSize="4.2"
                      fill="#6B7E92"
                    >
                      {tick.value}
                    </text>
                  ))}
                  <polyline
                    fill="none"
                    stroke="#2F80ED"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={loginTrendPolylinePoints}
                  />
                  {displayedLoginTrendRows.map((item, index) => {
                    const x = displayedLoginTrendRows.length <= 1 ? 50 : ((index + 0.5) / displayedLoginTrendRows.length) * 100;
                    const clampedCount = Math.min(loginTrendYAxisMax, Math.max(loginTrendYAxisMin, item.count));
                    const y = loginTrendPlotBottom - (((clampedCount - loginTrendYAxisMin) / loginTrendRange) * loginTrendPlotHeight);
                    return <circle key={`${item.date}-${index}`} cx={x} cy={y} r="2.1" fill="#2F80ED" />;
                  })}
                </svg>
                <div
                  style={{
                    marginTop: '8px',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${displayedLoginTrendRows.length}, minmax(0, 1fr))`,
                    gap: '0',
                  }}
                >
                  {displayedLoginTrendRows.map((item) => (
                    <div key={`axis-${item.date}`} style={{ textAlign: 'center', color: '#5C7187', fontSize: '12px' }}>
                      {item.day}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ border: '1px solid #E4ECF4', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#F4F8FC' }}>
                      <th style={{ padding: '10px', color: '#1F4060', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '10px', color: '#1F4060', textAlign: 'right' }}>Login Count</th>
                      <th style={{ padding: '10px', color: '#1F4060', textAlign: 'right' }}>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedLoginTrendRows.map((item) => {
                      const denominator = Math.max(1, totalLoginCount);
                      const rate = Math.round((item.count / denominator) * 100);
                      return (
                        <tr key={`login-row-${item.day}-${item.date || 'no-date'}`} style={{ borderTop: '1px solid #EDF2F7' }}>
                          <td style={{ padding: '10px', color: '#234562' }}>{`${item.day} (${item.weekday})`}</td>
                          <td style={{ padding: '10px', color: '#234562', textAlign: 'right', fontWeight: 700 }}>{item.count}</td>
                          <td style={{ padding: '10px', color: '#5A7086', textAlign: 'right' }}>{rate}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            </article>
          )}

          {showKfCard && !isTargetClassSelected && (
            <article style={{ ...cardStyle, gridColumn: '1 / -1' }}>
              <h2 style={blockTitleStyle}>KF參與比例</h2>
              <p style={{ margin: '14px 0 0', color: '#B45309', fontSize: '14px', textAlign: 'center' }}>
                請切換到支援的班級（1142B / 1142C / 1142H）以查看 KF 論證狀況。
              </p>
            </article>
          )}

          {showKfCard && isTargetClassSelected && (
            <article style={{ ...cardStyle, gridColumn: '1 / -1' }}>
              <h2 style={blockTitleStyle}>KF參與比例</h2>
              <p style={{ margin: '12px 0 0', color: '#4E6377', fontSize: '13px', textAlign: 'center' }}>
                依據 {selectedDashboardClassCode}.txt 由 {breakdownModelLabel} 分析。各組數值若少於 {WARNING_COUNT_THRESHOLD} 筆會以紅字標示。
              </p>

              {isArgumentBreakdownLoading && (
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', color: '#33516F' }}>
                  <svg width="18" height="18" viewBox="0 0 50 50" aria-hidden="true">
                    <circle
                      cx="25"
                      cy="25"
                      r="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray="90 150"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 25 25"
                        to="360 25 25"
                        dur="0.9s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                  <span>分析中...</span>
                </div>
              )}

              {!isArgumentBreakdownLoading && argumentBreakdownError && (
                <p style={{ margin: '16px 0 0', color: '#C0392B', textAlign: 'center' }}>{argumentBreakdownError}</p>
              )}

              {!isArgumentBreakdownLoading && !argumentBreakdownError && argumentBreakdownWarning && (
                <p style={{ margin: '16px 0 0', color: '#B45309', textAlign: 'center', fontSize: '13px' }}>
                  {argumentBreakdownWarning}
                </p>
              )}

	              {!isArgumentBreakdownLoading && (kfGroupOptions.length > 0 || kfIdeaGroupOptions.length > 0) && (
	                <div style={{ marginTop: '16px', display: 'grid', gap: '14px' }}>
	                  {!argumentBreakdownError && kfGroupOptions.length > 0 && (
	                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
	                      <label htmlFor="kf-group-filter" style={{ fontWeight: 700, color: '#1F4060' }}>
	                        Group
	                      </label>
	                      <select
	                        id="kf-group-filter"
	                        value={selectedKfGroup}
	                        onChange={(event) => {
	                          const nextGroupId = event.target.value;
	                          setSelectedKfGroup(nextGroupId);
	                          if (kfIdeaGroupOptions.includes(nextGroupId)) {
	                            setSelectedKfIdeaGroup(nextGroupId);
	                          }
	                        }}
	                        style={{
	                          minWidth: '140px',
	                          height: '38px',
	                          borderRadius: '10px',
	                          border: '1px solid #cdd8e6',
	                          padding: '0 10px',
	                          fontSize: '14px',
	                          color: '#1B314A',
	                          backgroundColor: '#fff',
	                        }}
	                      >
	                        {kfGroupOptions.map((group) => (
	                          <option key={group.groupId} value={group.groupId}>
	                            {group.groupId}
	                          </option>
	                        ))}
	                      </select>
	                    </div>
	                  )}

	                  {!argumentBreakdownError && selectedKfGroupData && (() => {
                    const support = Number(selectedKfGroupData?.counts?.support || 0);
                    const oppose = Number(selectedKfGroupData?.counts?.oppose || 0);
                    const evidence = Number(selectedKfGroupData?.counts?.evidence || 0);
                    const total = support + oppose + evidence;

                    const supportPct = total > 0 ? Math.round((support / total) * 100) : 0;
                    const opposePct = total > 0 ? Math.round((oppose / total) * 100) : 0;
                    const evidencePct = Math.max(0, 100 - supportPct - opposePct);

                    const renderCountLine = (label, value, color) => {
                      const isWarning = value < WARNING_COUNT_THRESHOLD;
                      return (
                        <div style={{ color: isWarning ? '#C0392B' : '#294865', fontSize: '14px', fontWeight: isWarning ? 700 : 500 }}>
                          <span style={{ color, fontWeight: 700 }}>{label}</span>
                          {`: ${value}`}
                          {isWarning ? ' (Need Attention)' : ''}
                        </div>
                      );
                    };

	                    return (
	                      <div
                        key={selectedKfGroupData.groupId}
                        style={{
                          border: '1px solid #E3EBF4',
                          borderRadius: '14px',
                          padding: '14px',
                          background: '#FCFEFF',
                          maxWidth: '980px',
                          width: '100%',
                          margin: '0 auto',
                        }}
                      >
                        <h3 style={{ margin: 0, color: '#173F63', fontSize: '18px', textAlign: 'center' }}>{selectedKfGroupData.groupId}</h3>
                        <div style={{ marginTop: '10px', display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
                              <div
                                style={{
                                  width: '112px',
                                  height: '112px',
                                  borderRadius: '50%',
                                  background: buildArgumentPieBackground(selectedKfGroupData.counts),
                                  position: 'relative',
                                  flexShrink: 0,
                                }}
                              >
                                <div
                                  style={{
                                    position: 'absolute',
                                    inset: '22px',
                                    borderRadius: '50%',
                                    backgroundColor: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    color: '#1A3A5A',
                                  }}
                                >
                                  <strong style={{ fontSize: '20px', lineHeight: 1 }}>{total}</strong>
                                  <span style={{ fontSize: '11px' }}>Total</span>
                                </div>
                              </div>

                              <div style={{ display: 'grid', gap: '6px' }}>
                                {renderCountLine('Support', support, ARGUMENT_COLORS.support)}
                                {renderCountLine('Oppose', oppose, ARGUMENT_COLORS.oppose)}
                                {renderCountLine('Evidence', evidence, ARGUMENT_COLORS.evidence)}
                              </div>
                            </div>
                            <p style={{ margin: '10px 0 0', color: '#567089', fontSize: '12px', textAlign: 'center' }}>
                              Ratio: Support {supportPct}% | Oppose {opposePct}% | Evidence {evidencePct}%
                            </p>
                          </div>

                          <div style={{ display: 'grid', gap: '8px' }}>
                            <p style={{ margin: 0, color: '#173F63', fontWeight: 700, fontSize: '15px' }}>各學生論證參與比例</p>
                            <div style={{ display: 'grid', gap: '8px' }}>
                              {selectedGroupStudents.length === 0 && (
                                <p style={{ margin: 0, color: '#6A8096', fontSize: '13px' }}>尚無學生貢獻資料</p>
                              )}
                              {selectedGroupStudents.map((student, index) => (
                                <div key={`${student.name}-${index}`} style={{ border: '1px solid #E6ECF3', borderRadius: '10px', padding: '8px 10px', background: '#fff' }}>
                                  <p style={{ margin: 0, color: '#1F4060', fontSize: '13px', fontWeight: 700 }}>{student.name}</p>
                                  <div style={{ marginTop: '6px', display: 'grid', gap: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ width: '64px', color: ARGUMENT_COLORS.support, fontSize: '12px', fontWeight: 700 }}>Support</span>
                                      <div style={{ flex: 1, height: '10px', borderRadius: '999px', background: '#EAF2FB', overflow: 'hidden' }}>
                                        <div style={{ width: `${(student.counts.support / studentBarMax) * 100}%`, height: '100%', background: ARGUMENT_COLORS.support }} />
                                      </div>
                                      <span style={{ width: '28px', textAlign: 'right', color: '#294865', fontSize: '12px' }}>{student.counts.support}</span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ width: '64px', color: ARGUMENT_COLORS.oppose, fontSize: '12px', fontWeight: 700 }}>Oppose</span>
                                      <div style={{ flex: 1, height: '10px', borderRadius: '999px', background: '#FDF2E7', overflow: 'hidden' }}>
                                        <div style={{ width: `${(student.counts.oppose / studentBarMax) * 100}%`, height: '100%', background: ARGUMENT_COLORS.oppose }} />
                                      </div>
                                      <span style={{ width: '28px', textAlign: 'right', color: '#294865', fontSize: '12px' }}>{student.counts.oppose}</span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ width: '64px', color: ARGUMENT_COLORS.evidence, fontSize: '12px', fontWeight: 700 }}>Evidence</span>
                                      <div style={{ flex: 1, height: '10px', borderRadius: '999px', background: '#E9F8EF', overflow: 'hidden' }}>
                                        <div style={{ width: `${(student.counts.evidence / studentBarMax) * 100}%`, height: '100%', background: ARGUMENT_COLORS.evidence }} />
                                      </div>
                                      <span style={{ width: '28px', textAlign: 'right', color: '#294865', fontSize: '12px' }}>{student.counts.evidence}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
	                      </div>
	                    );
	                  })()}

	                  {kfIdeaGroupOptions.length > 0 && (
	                    <div style={{ marginTop: '4px', border: '1px solid #E3EBF4', borderRadius: '14px', padding: '14px', background: '#FCFEFF', maxWidth: '980px', width: '100%', marginInline: 'auto' }}>
	                      <h3 style={{ margin: 0, color: '#173F63', fontSize: '18px', textAlign: 'center' }}>各小組KF鷹架使用狀況</h3>
	                      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
	                        <label htmlFor="kf-idea-group-filter" style={{ fontWeight: 700, color: '#1F4060' }}>
	                          Group
	                        </label>
	                        <select
	                          id="kf-idea-group-filter"
	                          value={selectedKfIdeaGroup}
	                          onChange={(event) => {
	                            const nextGroupId = event.target.value;
	                            setSelectedKfIdeaGroup(nextGroupId);
	                            if (nextGroupId !== KF_IDEA_ALL_OPTION && kfGroupOptions.some((group) => group.groupId === nextGroupId)) {
	                              setSelectedKfGroup(nextGroupId);
	                            }
	                          }}
	                          style={{
	                            minWidth: '140px',
	                            height: '38px',
	                            borderRadius: '10px',
	                            border: '1px solid #cdd8e6',
	                            padding: '0 10px',
	                            fontSize: '14px',
	                            color: '#1B314A',
	                            backgroundColor: '#fff',
	                          }}
	                        >
	                          {kfIdeaGroupOptions.map((groupId) => (
	                            <option key={groupId} value={groupId}>
	                              {groupId === KF_IDEA_ALL_OPTION ? 'All' : groupId}
	                            </option>
	                          ))}
	                        </select>
	                      </div>
	                      <p style={{ margin: '6px 0 0', color: '#6A8096', fontSize: '12px', textAlign: 'center' }}>
	                        類別次數小於 {KF_IDEA_WARNING_THRESHOLD} 會以紅字標示
	                      </p>

	                      {selectedKfIdeaCounts && (() => {
	                        const maxCount = Math.max(
	                          1,
	                          ...KF_IDEA_CATEGORY_CONFIGS.map((item) => Number(selectedKfIdeaCounts[item.key] || 0))
	                        );
	                        const totalCount = KF_IDEA_CATEGORY_CONFIGS.reduce(
	                          (sum, item) => sum + Number(selectedKfIdeaCounts[item.key] || 0),
	                          0
	                        );
	                        const myIdeaCount = Number(selectedKfIdeaCounts.myIdea || 0);
	                        const myIdeaRatioPct = totalCount > 0 ? (myIdeaCount / totalCount) * 100 : 0;
	                        const discussionQualityComment =
	                          totalCount <= 0
	                            ? '目前尚無可分析資料。'
	                            : myIdeaRatioPct >= 80
	                              ? '小組討論多以個人意見表達為主，成員雖積極提出想法，但較少出現進一步的論點修正、批判思考或知識整合，整體討論深度較有限。'
	                              : myIdeaRatioPct >= 51
	                                ? '小組除了提出個人觀點外，也開始出現部分論點修正、提問或知識整合行為，顯示討論具有一定互動性，但深層論證與批判思考仍有提升空間。'
	                                : '小組討論不僅停留於個人觀點表達，成員之間具有較多的論點修正、批判分析與知識整合互動，展現較高層次的協作論證與知識建構歷程。';
	                        const supportCount = Number(selectedKfGroupData?.counts?.support || 0);
	                        const opposeCount = Number(selectedKfGroupData?.counts?.oppose || 0);
	                        const evidenceCount = Number(selectedKfGroupData?.counts?.evidence || 0);
	                        const participationComment =
	                          !selectedKfGroupData
	                            ? '目前尚無可分析資料。'
	                            : supportCount > 6 && opposeCount > 6 && evidenceCount > 3
	                              ? '小組在正反論點與證據提供上皆展現高度參與，成員能從不同立場提出多元觀點，並搭配適當證據支持論述。'
	                              : (supportCount <= 6 || opposeCount <= 6) && evidenceCount > 3
	                                ? '小組已具備基本的證據支持能力，但在正反論點的討論數量仍略顯不足，可能導致觀點多樣性與論證深度受到限制，建議進一步擴展不同立場的討論。'
	                                : supportCount > 6 && opposeCount > 6 && evidenceCount <= 3
	                                  ? '小組能提出多元的正反論點，顯示成員具有積極的討論參與，但證據使用較少，部分論述缺乏具體資料支持，建議增加數據、案例或研究資訊以提升論證可信度。'
	                                  : '小組整體論證參與程度較低，無論在正反論點或證據提供上皆較不足，討論可能仍停留在初步想法交流階段，建議增加觀點互動與具體證據支持，以提升討論完整性。';
	                        const pieSize = 250;
	                        const pieRadius = 78;
	                        const pieCenter = pieSize / 2;
	                        let pieStartRatio = 0;
	                        const pieSlices = KF_IDEA_CATEGORY_CONFIGS.map((item) => {
	                          const count = Number(selectedKfIdeaCounts[item.key] || 0);
	                          const ratio = totalCount > 0 ? count / totalCount : 0;
	                          const startRatio = pieStartRatio;
	                          const endRatio = pieStartRatio + ratio;
	                          pieStartRatio = endRatio;

	                          const startAngle = startRatio * Math.PI * 2 - Math.PI / 2;
	                          const endAngle = endRatio * Math.PI * 2 - Math.PI / 2;
	                          const isFullSlice = ratio >= 0.999999;
	                          const x1 = pieCenter + pieRadius * Math.cos(startAngle);
	                          const y1 = pieCenter + pieRadius * Math.sin(startAngle);
	                          const x2 = pieCenter + pieRadius * Math.cos(endAngle);
	                          const y2 = pieCenter + pieRadius * Math.sin(endAngle);
	                          const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
	                          const pathData = isFullSlice
	                            ? ''
	                            : `M ${pieCenter} ${pieCenter} L ${x1} ${y1} A ${pieRadius} ${pieRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
	                          const midAngle = (startAngle + endAngle) / 2;
	                          const labelRadius = pieRadius * 0.62;
	                          const labelX = pieCenter + labelRadius * Math.cos(midAngle);
	                          const labelY = pieCenter + labelRadius * Math.sin(midAngle);
	                          const edgeX = pieCenter + pieRadius * Math.cos(midAngle);
	                          const edgeY = pieCenter + pieRadius * Math.sin(midAngle);
	                          const outerLabelRadius = pieRadius * 1.25;
	                          const outerLabelX = pieCenter + outerLabelRadius * Math.cos(midAngle);
	                          const outerLabelY = pieCenter + outerLabelRadius * Math.sin(midAngle);
	                          return {
	                            ...item,
	                            count,
	                            ratio,
	                            pathData,
	                            isFullSlice,
	                            midAngle,
	                            labelX,
	                            labelY,
	                            edgeX,
	                            edgeY,
	                            outerLabelX,
	                            outerLabelY,
	                          };
	                        });

	                        return (
	                          <div style={{ marginTop: '14px', display: 'grid', gap: '12px' }}>
	                            <div style={{ display: 'grid', gap: '10px' }}>
	                              {KF_IDEA_CATEGORY_CONFIGS.map((item) => {
	                                const count = Number(selectedKfIdeaCounts[item.key] || 0);
	                                const widthPct = Math.max(0, Math.min(100, Math.round((count / maxCount) * 100)));
	                                const shouldHighlight =
	                                  selectedKfIdeaGroup === KF_IDEA_ALL_OPTION
	                                    ? Boolean(kfIdeaHasAnyLowCountByCategory[item.key])
	                                    : count < KF_IDEA_WARNING_THRESHOLD;
	                                return (
	                                  <div key={`kf-idea-${item.key}`} style={{ display: 'grid', gap: '6px' }}>
	                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#1F4060', fontSize: '13px', fontWeight: 700 }}>
	                                      <span>{item.label}</span>
	                                      <span style={{ color: shouldHighlight ? '#C0392B' : '#1F4060' }}>{count}</span>
	                                    </div>
	                                    <div style={{ width: '100%', height: '12px', borderRadius: '999px', background: '#EAF0F7', overflow: 'hidden' }}>
	                                      <div style={{ width: `${widthPct}%`, height: '100%', borderRadius: '999px', background: item.color }} />
	                                    </div>
	                                  </div>
	                                );
	                              })}
	                            </div>

	                            <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '250px minmax(0, 1fr)', alignItems: 'start' }}>
	                              <div style={{ border: '1px solid #E6ECF3', borderRadius: '12px', background: '#fff', padding: '10px', display: 'grid', gap: '8px', justifyItems: 'center' }}>
	                                <div style={{ color: '#1F4060', fontSize: '13px', fontWeight: 700 }}>六大項比例</div>
	                                <svg width={pieSize} height={pieSize} viewBox={`0 0 ${pieSize} ${pieSize}`} aria-label="KF idea category pie chart">
	                                  {totalCount > 0 ? (
	                                    pieSlices.map((slice) => (
	                                      <g key={`pie-slice-${slice.key}`}>
	                                        {slice.isFullSlice ? (
	                                          <circle cx={pieCenter} cy={pieCenter} r={pieRadius} fill={slice.color} stroke="#ffffff" strokeWidth="1.2" />
	                                        ) : (
	                                          <path d={slice.pathData} fill={slice.color} stroke="#ffffff" strokeWidth="1.2" />
	                                        )}
	                                        {slice.count > 0 && slice.ratio >= 0.1 && (
	                                          <text
	                                            x={slice.labelX}
	                                            y={slice.labelY}
	                                            textAnchor="middle"
	                                            dominantBaseline="middle"
	                                            fontSize="11"
	                                            fontWeight="700"
	                                            fill="#1F4060"
	                                          >
	                                            {(slice.ratio * 100).toFixed(1)}%
	                                          </text>
	                                        )}
	                                        {slice.count > 0 && slice.ratio < 0.1 && (
	                                          <>
	                                            <line
	                                              x1={slice.edgeX}
	                                              y1={slice.edgeY}
	                                              x2={slice.outerLabelX}
	                                              y2={slice.outerLabelY}
	                                              stroke="#6A8096"
	                                              strokeWidth="1"
	                                            />
	                                            <text
	                                              x={slice.outerLabelX}
	                                              y={slice.outerLabelY}
	                                              textAnchor={Math.cos(slice.midAngle) >= 0 ? 'start' : 'end'}
	                                              dominantBaseline="middle"
	                                              fontSize="10"
	                                              fontWeight="700"
	                                              fill="#1F4060"
	                                            >
	                                              {(slice.ratio * 100).toFixed(1)}%
	                                            </text>
	                                          </>
	                                        )}
	                                      </g>
	                                    ))
	                                  ) : (
	                                    <circle cx={pieCenter} cy={pieCenter} r={pieRadius} fill="#EAF0F7" />
	                                  )}
	                                </svg>
	                                <div style={{ width: '100%', display: 'grid', gap: '4px' }}>
	                                  {pieSlices.map((slice) => (
	                                    <div key={`pie-legend-${slice.key}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#1F4060' }}>
	                                      <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: slice.color, flexShrink: 0 }} />
	                                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
	                                        {slice.label}
	                                      </span>
	                                    </div>
	                                  ))}
	                                </div>
	                              </div>
	                              <div style={{ border: '1px solid #E3EBF4', borderRadius: '12px', padding: '12px', background: '#FFFFFF', minHeight: '120px' }}>
	                                <h4 style={{ margin: 0, color: '#173F63', fontSize: '20px', fontWeight: 700 }}>小組論證分析</h4>
	                                <div style={{ marginTop: '10px', color: '#1F4060', lineHeight: 1.6 }}>
	                                  <div style={{ fontSize: '16px', fontWeight: 700 }}>一.討論品質:</div>
	                                  <div style={{ fontSize: '16px' }}>{discussionQualityComment}</div>
	                                </div>
	                                <div style={{ marginTop: '10px', color: '#1F4060', lineHeight: 1.6 }}>
	                                  <div style={{ fontSize: '16px', fontWeight: 700 }}>二.論證參與狀況:</div>
	                                  <div style={{ fontSize: '16px' }}>{participationComment}</div>
	                                </div>
	                              </div>
	                            </div>

	                            <div style={{ border: '1px solid #E3EBF4', borderRadius: '12px', background: '#FFFFFF', padding: '12px' }}>
	                              <h4 style={{ margin: 0, color: '#173F63', fontSize: '18px', fontWeight: 700 }}>
	                                Word Cloud ({selectedKfIdeaGroup === KF_IDEA_ALL_OPTION ? 'All Groups' : selectedKfIdeaGroup || '-'})
	                              </h4>
	                              {kfWordCloudTerms.length > 0 ? (
	                                <div style={{ marginTop: '10px', border: '1px solid #E6ECF3', borderRadius: '12px', background: '#FCFEFF', padding: '10px' }}>
	                                  <div style={{ minHeight: '220px', display: 'flex', flexWrap: 'wrap', gap: '8px 12px', alignItems: 'center', alignContent: 'flex-start' }}>
	                                    {(() => {
	                                      const maxWordCount = Math.max(1, ...kfWordCloudTerms.map((item) => item.count));
	                                      return kfWordCloudTerms.map((item, index) => {
	                                        const scale = item.count / maxWordCount;
	                                        const fontSize = Math.round(16 + scale * 48);
	                                        const opacity = Math.min(1, 0.65 + scale * 0.35);
	                                        const color = KF_WORDCLOUD_COLORS[index % KF_WORDCLOUD_COLORS.length];
	                                        return (
	                                          <span
	                                            key={`kf-word-${item.word}-${index}`}
	                                            style={{
	                                              display: 'inline-flex',
	                                              fontSize: `${fontSize}px`,
	                                              fontWeight: 700,
	                                              color,
	                                              opacity,
	                                              lineHeight: 1.05,
	                                              whiteSpace: 'nowrap',
	                                              writingMode: 'horizontal-tb',
	                                              textOrientation: 'mixed',
	                                            }}
	                                            title={`${item.word}: ${item.count}`}
	                                          >
	                                            {item.word}
	                                          </span>
	                                        );
	                                      });
	                                    })()}
	                                  </div>
	                                </div>
	                              ) : (
	                                <p style={{ margin: '10px 0 0', color: '#6A8096', fontSize: '13px' }}>此組目前無可用發言內容可產生文字雲。</p>
	                              )}
	                            </div>
	                          </div>
	                        );
	                      })()}
	                    </div>
	                  )}
	                </div>
	              )}
	            </article>
	          )}
        </section>
      </main>
    </div>
  );
}
