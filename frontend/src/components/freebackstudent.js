import React, { useEffect, useState } from 'react';
import { Box, Button, TextField } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar_Student';

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

  const blackBorderFieldSx = {
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#000',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#000',
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#000',
    },
  };

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
        setTeacherFeedback(normalizeFieldValue(notionData?.teacherFeedback));
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
    <div style={{ backgroundColor: '#fff' }}>
      <Navbar />

      <Box
        sx={{
          display: 'flex',
          minHeight: 'calc(100vh - 120px)',
          padding: '10px',
          gap: '10px',
          backgroundColor: '#fff',
        }}
      >
        <Box
          sx={{
            width: '100%',
            border: '1px solid #000',
            borderRadius: '0',
            backgroundColor: '#fff',
            boxSizing: 'border-box',
            position: 'relative',
            minHeight: { md: '600px', sm: '800px', xs: 'auto' },
            display: 'flex',
            flexDirection: 'row',
            '@media (max-width: 700px)': {
              width: '100%',
              padding: '10px',
              border: '1px solid #000',
            },
          }}
        >
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Box
              sx={{
                width: '100%',
                minHeight: '100px',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                backgroundColor: '#fff',
                borderBottom: '1px solid #000',
                fontSize: '22px',
                fontWeight: 500,
                padding: '10px',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ fontSize: '22px', fontWeight: 500, lineHeight: 1.2, fontFamily: 'inherit' }}>
                  {`Student: ${studentName || '-'}`}
                </Box>
                <Box sx={{ fontSize: '22px', fontWeight: 500, lineHeight: 1.2, fontFamily: 'inherit' }}>
                  {`Class: ${activityTitle || '-'}`}
                </Box>
                <Box sx={{ fontSize: '22px', fontWeight: 500, lineHeight: 1.2, fontFamily: 'inherit' }}>
                  {`Topic: ${groupName || '-'}`}
                </Box>
              </Box>
            </Box>

            {isEssayLoading && (
              <Box sx={{ px: 1.5, py: 1, fontSize: '14px', color: '#334155' }}>
                正在載入學生文章...
              </Box>
            )}

            {!isEssayLoading && essayLoadError && (
              <Box sx={{ px: 1.5, py: 1, fontSize: '14px', color: '#b91c1c' }}>
                {essayLoadError}
              </Box>
            )}

            <Box sx={{ flex: 1, overflowY: 'auto', minHeight: '300px', backgroundColor: 'white', width: '100%' }}>
              <TextField
                multiline
                fullWidth
                minRows={10}
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                placeholder=""
                sx={{
                  height: '100%',
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    height: '100%',
                    alignItems: 'flex-start',
                    '& fieldset': {
                      border: 'none',
                    },
                    '&:hover fieldset': {
                      border: 'none',
                    },
                    '&.Mui-focused fieldset': {
                      border: 'none',
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ pt: 1, width: '100%' }}>
              <Box
                sx={{
                  borderTop: '1px solid #000',
                  borderBottom: '1px solid #000',
                  backgroundColor: '#fff',
                  minHeight: '140px',
                  p: 2,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <Box
                  sx={{
                    fontSize: '22px',
                    fontWeight: 500,
                    lineHeight: 1.2,
                    fontFamily: 'inherit',
                    pb: 1,
                    mb: 1,
                    mx: -2,
                    px: 2,
                    borderBottom: '1px solid #000',
                  }}
                >
                  Teacher feedback
                </Box>
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  value={teacherFeedback}
                  InputProps={{ readOnly: true }}
                  onChange={(e) => setTeacherFeedback(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        border: 'none',
                      },
                      '&:hover fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused fieldset': {
                        border: 'none',
                      },
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 2,
                }}
              >
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: '90px' }}>Claims</Box>
                    <TextField
                      size="small"
                      value={claimsCount}
                      InputProps={{ readOnly: true }}
                      onChange={(e) => setClaimsCount(e.target.value)}
                      sx={{ width: '80px', ...blackBorderFieldSx }}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      value={claimsText}
                      InputProps={{ readOnly: true }}
                      onChange={(e) => setClaimsText(e.target.value)}
                      sx={blackBorderFieldSx}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: '90px' }}>Grounds</Box>
                    <TextField
                      size="small"
                      value={groundsCount}
                      InputProps={{ readOnly: true }}
                      onChange={(e) => setGroundsCount(e.target.value)}
                      sx={{ width: '80px', ...blackBorderFieldSx }}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      value={groundsText}
                      InputProps={{ readOnly: true }}
                      onChange={(e) => setGroundsText(e.target.value)}
                      sx={blackBorderFieldSx}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: '90px' }}>Rebuttals</Box>
                    <TextField
                      size="small"
                      value={rebuttalsCount}
                      InputProps={{ readOnly: true }}
                      onChange={(e) => setRebuttalsCount(e.target.value)}
                      sx={{ width: '80px', ...blackBorderFieldSx }}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      value={rebuttalsText}
                      InputProps={{ readOnly: true }}
                      onChange={(e) => setRebuttalsText(e.target.value)}
                      sx={blackBorderFieldSx}
                    />
                  </Box>
                </Box>

                <Box sx={{ width: '140px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ fontWeight: 'bold' }}>Score</Box>
                  <TextField
                    size="small"
                    value={score}
                    InputProps={{ readOnly: true }}
                    onChange={(e) => setScore(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    onClick={() => navigate(-1)}
                    sx={{
                      width: '30%',
                      minWidth: '90px',
                      alignSelf: 'center',
                      color: '#000',
                      fontWeight: 'bold',
                      border: '1px solid #000',
                      backgroundColor: 'rgba(204, 149, 101, 0.3)',
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(204, 149, 101, 0.45)',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    Back
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default WritingArea;


