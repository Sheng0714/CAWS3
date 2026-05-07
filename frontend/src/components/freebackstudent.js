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
  const [claimsCount, setClaimsCount] = useState('');
  const [claimsText, setClaimsText] = useState('');
  const [groundsCount, setGroundsCount] = useState('');
  const [groundsText, setGroundsText] = useState('');
  const [rebuttalsCount, setRebuttalsCount] = useState('');
  const [rebuttalsText, setRebuttalsText] = useState('');
  const [score, setScore] = useState('');

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
      setClaimsCount('');
      setClaimsText('');
      setGroundsCount('');
      setGroundsText('');
      setRebuttalsCount('');
      setRebuttalsText('');
      setScore('');

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
            notionData?.teacherFeedback || notionData?.humanComment || notionData?.aiComment
          )
        );
        setClaimsCount(normalizeFieldValue(notionData?.claimsScore));
        setClaimsText(normalizeFieldValue(notionData?.claimsComment));
        setGroundsCount(normalizeFieldValue(notionData?.groundsScore));
        setGroundsText(normalizeFieldValue(notionData?.groundsComment));
        setRebuttalsCount(normalizeFieldValue(notionData?.rebuttalsScore));
        setRebuttalsText(normalizeFieldValue(notionData?.rebuttalsComment));
        setScore(normalizeFieldValue(notionData?.totalScore));
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
          <div className="fbs-section-card">
            <div className="fbs-subtitle">Feedback</div>
            <div className="fbs-feedback-content">
              {teacherFeedback || 'No feedback available yet.'}
            </div>
          </div>

          <div className="fbs-section-card">
            <div className="fbs-subtitle">Detailed Feedback</div>

            <Box className="fbs-detail-block">
              <Box className="fbs-detail-head">
                <span>Claims</span>
                <span>{`Score: ${claimsCount || '-'}`}</span>
              </Box>
              <Box className="fbs-detail-body">{claimsText || 'No claims feedback.'}</Box>
            </Box>

            <Box className="fbs-detail-block">
              <Box className="fbs-detail-head">
                <span>Grounds</span>
                <span>{`Score: ${groundsCount || '-'}`}</span>
              </Box>
              <Box className="fbs-detail-body">{groundsText || 'No grounds feedback.'}</Box>
            </Box>

            <Box className="fbs-detail-block">
              <Box className="fbs-detail-head">
                <span>Rebuttals</span>
                <span>{`Score: ${rebuttalsCount || '-'}`}</span>
              </Box>
              <Box className="fbs-detail-body">{rebuttalsText || 'No rebuttals feedback.'}</Box>
            </Box>
          </div>

          <div className="fbs-footer">
            <div className="fbs-total-score">{`Total Score: ${score || '-'}`}</div>
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


