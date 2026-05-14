import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar_Student';
import './freebackstudent.css';

const notionApiBases = [
  process.env.REACT_APP_NOTION_API_BASE_URL,
  '/notion-api',
  'http://localhost:4000',
  'http://140.115.126.27:4000',
].filter(Boolean);

const fetchEssayFromNotion = async ({ studentName, className, theme }) => {
  const token = localStorage.getItem('jwtToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let lastError = null;

  for (const base of notionApiBases) {
    const normalizedBase = base.replace(/\/+$/, '');
    const url = `${normalizedBase}/api/get-essay/${encodeURIComponent(studentName)}`;

    try {
      const response = await axios.get(url, {
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

const normalizeFieldValue = (value) => (value === null || value === undefined ? '' : String(value));

const toNumericScoreOrEmpty = (value) => {
  const raw = normalizeFieldValue(value).trim();
  if (!raw || raw === '-') return '';
  const numberMatch = raw.match(/-?\d+(?:\.\d+)?/);
  if (!numberMatch) return '';
  const parsed = Number(numberMatch[0]);
  if (Number.isNaN(parsed)) return '';
  return Number.isInteger(parsed) ? String(parsed) : String(parsed);
};

const computeArgumentScoreFromParts = (claims, grounds, rebuttals) => {
  const claimsNum = Number(toNumericScoreOrEmpty(claims));
  const groundsNum = Number(toNumericScoreOrEmpty(grounds));
  const rebuttalsNum = Number(toNumericScoreOrEmpty(rebuttals));
  if (Number.isNaN(claimsNum) || Number.isNaN(groundsNum) || Number.isNaN(rebuttalsNum)) return '';
  return String(claimsNum + groundsNum + rebuttalsNum);
};

const formatScoreWithScale = (value, scale) => {
  const numericText = toNumericScoreOrEmpty(value);
  return numericText ? `${numericText}/${scale}` : '-';
};

const normalizeEssayText = (content) => {
  if (!content) return '';

  const withBreaks = String(content)
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*\/(p|div|h[1-6]|li|tr)\s*>/gi, '\n')
    .replace(/<\s*li\b[^>]*>/gi, '- ');

  const temp = document.createElement('div');
  temp.innerHTML = withBreaks;

  return (temp.textContent || temp.innerText || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const buildEssayStorageKey = (studentName, className, theme) =>
  `essayData::${encodeURIComponent(studentName || '')}::${encodeURIComponent(className || '')}::${encodeURIComponent(theme || '')}`;

const WritingArea = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [editorContent, setEditorContent] = useState('');
  const [studentName, setStudentName] = useState('');
  const [activityTitle, setActivityTitle] = useState('');
  const [groupName, setGroupName] = useState('');
  const [isEssayLoading, setIsEssayLoading] = useState(false);
  const [essayLoadError, setEssayLoadError] = useState('');

  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [feedbackView, setFeedbackView] = useState('teacher');
  const [claimsCount, setClaimsCount] = useState('');
  const [claimsText, setClaimsText] = useState('');
  const [groundsCount, setGroundsCount] = useState('');
  const [groundsText, setGroundsText] = useState('');
  const [rebuttalsCount, setRebuttalsCount] = useState('');
  const [rebuttalsText, setRebuttalsText] = useState('');
  const [argumentScore, setArgumentScore] = useState('');
  const [totalScore, setTotalScore] = useState('');
  const [aiClaimsCount, setAiClaimsCount] = useState('');
  const [aiClaimsText, setAiClaimsText] = useState('');
  const [aiGroundsCount, setAiGroundsCount] = useState('');
  const [aiGroundsText, setAiGroundsText] = useState('');
  const [aiRebuttalsCount, setAiRebuttalsCount] = useState('');
  const [aiRebuttalsText, setAiRebuttalsText] = useState('');
  const [aiArgumentScore, setAiArgumentScore] = useState('');
  const [aiTotalScore, setAiTotalScore] = useState('');

  useEffect(() => {
    let mounted = true;

    const resolvedStudentName =
      location.state?.studentName ||
      localStorage.getItem('name') ||
      localStorage.getItem('username') ||
      localStorage.getItem('userName') ||
      '';
    const resolvedClassName =
      location.state?.className || localStorage.getItem('activityTitle') || '';
    const resolvedTheme =
      location.state?.theme || location.state?.topicName || localStorage.getItem('groupName') || '';
    const scopedEssayKey = buildEssayStorageKey(resolvedStudentName, resolvedClassName, resolvedTheme);
    const fallbackLocalEssay =
      localStorage.getItem(scopedEssayKey) ||
      localStorage.getItem('essayData') ||
      localStorage.getItem('editorData') ||
      '';

    setStudentName(resolvedStudentName);
    setActivityTitle(resolvedClassName);
    setGroupName(resolvedTheme);
    setEditorContent(normalizeEssayText(fallbackLocalEssay));

    const loadEssay = async () => {
      if (!resolvedStudentName || !resolvedClassName || !resolvedTheme) {
        return;
      }

      setIsEssayLoading(true);
      setEssayLoadError('');
      setTeacherFeedback('');
      setAiFeedback('');
      setClaimsCount('');
      setClaimsText('');
      setGroundsCount('');
      setGroundsText('');
      setRebuttalsCount('');
      setRebuttalsText('');
      setArgumentScore('');
      setTotalScore('');
      setAiClaimsCount('');
      setAiClaimsText('');
      setAiGroundsCount('');
      setAiGroundsText('');
      setAiRebuttalsCount('');
      setAiRebuttalsText('');
      setAiArgumentScore('');
      setAiTotalScore('');

      try {
        const notionData = await fetchEssayFromNotion({
          studentName: resolvedStudentName,
          className: resolvedClassName,
          theme: resolvedTheme,
        });

        if (!mounted) return;
        const fetchedEssay = notionData?.essayContent || '';
        setEditorContent(normalizeEssayText(fetchedEssay || fallbackLocalEssay));
        setTeacherFeedback(
          normalizeFieldValue(
            notionData?.teacherFeedback || notionData?.humanComment
          )
        );
        setAiFeedback(
          normalizeFieldValue(
            notionData?.aiFeedback || notionData?.aiComment
          )
        );
        setClaimsCount(normalizeFieldValue(notionData?.claimsScore));
        setClaimsText(normalizeFieldValue(notionData?.claimsComment));
        setGroundsCount(normalizeFieldValue(notionData?.groundsScore));
        setGroundsText(normalizeFieldValue(notionData?.groundsComment));
        setRebuttalsCount(normalizeFieldValue(notionData?.rebuttalsScore));
        setRebuttalsText(normalizeFieldValue(notionData?.rebuttalsComment));
        const resolvedArgumentScore =
          normalizeFieldValue(notionData?.argumentScore) ||
          normalizeFieldValue(notionData?.teacherArgumentScore) ||
          computeArgumentScoreFromParts(
            notionData?.claimsScore,
            notionData?.groundsScore,
            notionData?.rebuttalsScore
          );
        setArgumentScore(normalizeFieldValue(resolvedArgumentScore));
        setTotalScore(normalizeFieldValue(notionData?.totalScore));
        setAiClaimsCount(normalizeFieldValue(notionData?.aiClaimsScore));
        setAiClaimsText(normalizeFieldValue(notionData?.aiClaimsComment));
        setAiGroundsCount(normalizeFieldValue(notionData?.aiGroundsScore));
        setAiGroundsText(normalizeFieldValue(notionData?.aiGroundsComment));
        setAiRebuttalsCount(normalizeFieldValue(notionData?.aiRebuttalsScore));
        setAiRebuttalsText(normalizeFieldValue(notionData?.aiRebuttalsComment));
        const resolvedAiArgumentScore =
          normalizeFieldValue(notionData?.aiArgumentScore) ||
          normalizeFieldValue(notionData?.aiTotalScore) ||
          computeArgumentScoreFromParts(
            notionData?.aiClaimsScore,
            notionData?.aiGroundsScore,
            notionData?.aiRebuttalsScore
          );
        setAiArgumentScore(normalizeFieldValue(resolvedAiArgumentScore));
        setAiTotalScore(
          normalizeFieldValue(
            notionData?.aiTotalScore100 || notionData?.aiOverallScore || ''
          )
        );
      } catch (error) {
        if (!mounted) return;
        if (error?.code !== 'NOT_FOUND') {
          const errorMessage = error?.response?.data?.error || error?.message || '未知錯誤';
          setEssayLoadError(`載入 Notion 文章失敗：${errorMessage}`);
        }
        setEditorContent(normalizeEssayText(fallbackLocalEssay));
      } finally {
        if (mounted) {
          setIsEssayLoading(false);
        }
      }
    };

    void loadEssay();

    return () => {
      mounted = false;
    };
  }, [location.state]);

  const activeFeedback = feedbackView === 'teacher' ? teacherFeedback : aiFeedback;
  const activeClaimsCount = feedbackView === 'teacher' ? claimsCount : aiClaimsCount;
  const activeClaimsText = feedbackView === 'teacher' ? claimsText : aiClaimsText;
  const activeGroundsCount = feedbackView === 'teacher' ? groundsCount : aiGroundsCount;
  const activeGroundsText = feedbackView === 'teacher' ? groundsText : aiGroundsText;
  const activeRebuttalsCount = feedbackView === 'teacher' ? rebuttalsCount : aiRebuttalsCount;
  const activeRebuttalsText = feedbackView === 'teacher' ? rebuttalsText : aiRebuttalsText;
  const activeArgumentScore = feedbackView === 'teacher' ? argumentScore : aiArgumentScore;
  const activeTotalScore = feedbackView === 'teacher' ? totalScore : (aiTotalScore || totalScore);
  const feedbackEmptyText =
    feedbackView === 'teacher' ? 'No teacher feedback available yet.' : 'No AI feedback available yet.';

  return (
    <div className="fbs-page">
      <Navbar />

      <div className="fbs-workspace">
        <section className="fbs-panel fbs-left-panel">
          <div className="fbs-info-card">
            <div className="fbs-info-row">
              <span className="fbs-info-label">Student</span>
              <span className="fbs-info-value">{studentName || '-'}</span>
            </div>
            <div className="fbs-info-row">
              <span className="fbs-info-label">Class</span>
              <span className="fbs-info-value">{activityTitle || '-'}</span>
            </div>
            <div className="fbs-info-row">
              <span className="fbs-info-label">Topic</span>
              <span className="fbs-info-value">{groupName || '-'}</span>
            </div>
          </div>

          <div className="fbs-essay-card">
            <div className="fbs-card-title">Argumentative Essay</div>
            <div className="fbs-essay-content">
              {isEssayLoading ? (
                <div className="fbs-loading">
                  <CircularProgress size={24} />
                </div>
              ) : (
                editorContent || 'No essay content found for this student.'
              )}
            </div>
            {!isEssayLoading && essayLoadError ? (
              <div className="fbs-error">{essayLoadError}</div>
            ) : null}
          </div>
        </section>

        <section className="fbs-panel fbs-right-panel">
          <div className="fbs-tab-group">
            <button
              type="button"
              className={`fbs-tab-button ${feedbackView === 'teacher' ? 'active' : ''}`}
              onClick={() => setFeedbackView('teacher')}
            >
              Teacher Feedback
            </button>
            <button
              type="button"
              className={`fbs-tab-button ${feedbackView === 'ai' ? 'active' : ''}`}
              onClick={() => setFeedbackView('ai')}
            >
              AI Feedback
            </button>
          </div>

          <div className="fbs-section-card">
            <div className="fbs-subtitle">Feedback</div>
            <div className="fbs-feedback-content">
              {activeFeedback || feedbackEmptyText}
            </div>
          </div>

          <div className="fbs-section-card">
            <div className="fbs-subtitle">Detailed Feedback</div>

            <Box className="fbs-detail-block">
              <Box className="fbs-detail-head">
                <span>Claims</span>
                <span>{`Score: ${activeClaimsCount || '-'}`}</span>
              </Box>
              <Box className="fbs-detail-body">{activeClaimsText || 'No claims feedback.'}</Box>
            </Box>

            <Box className="fbs-detail-block">
              <Box className="fbs-detail-head">
                <span>Grounds</span>
                <span>{`Score: ${activeGroundsCount || '-'}`}</span>
              </Box>
              <Box className="fbs-detail-body">{activeGroundsText || 'No grounds feedback.'}</Box>
            </Box>

            <Box className="fbs-detail-block">
              <Box className="fbs-detail-head">
                <span>Rebuttals</span>
                <span>{`Score: ${activeRebuttalsCount || '-'}`}</span>
              </Box>
              <Box className="fbs-detail-body">{activeRebuttalsText || 'No rebuttals feedback.'}</Box>
            </Box>
          </div>

          <div className="fbs-footer">
            <div className="fbs-score-group">
              <div className="fbs-total-score">{`Argument Score: ${formatScoreWithScale(activeArgumentScore, 8)}`}</div>
              <div className="fbs-total-score">{`Total Score: ${formatScoreWithScale(activeTotalScore, 100)}`}</div>
            </div>
            <Button variant="outlined" onClick={() => navigate(-1)} className="fbs-back-btn">
              Back
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WritingArea;


