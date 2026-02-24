import React, { useEffect, useState } from 'react';
import { Box, Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar_Student';

const WritingArea = () => {
  const navigate = useNavigate();

  const [editorContent, setEditorContent] = useState('');
  const [activityTitle, setActivityTitle] = useState('');
  const [groupName, setGroupName] = useState('');

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
    setActivityTitle(localStorage.getItem('activityTitle') || '');
    setGroupName(localStorage.getItem('groupName') || '');
  }, []);

  return (
    <div>
      <Navbar />

      <Box
        sx={{
          display: 'flex',
          minHeight: 'calc(100vh - 120px)',
          padding: '10px',
          gap: '10px',
        }}
      >
        <Box
          sx={{
            width: '100%',
            borderLeft: 'none',
            position: 'relative',
            height: { md: '600px', sm: '800px', xs: 'auto' },
            display: 'flex',
            flexDirection: 'row',
            '@media (max-width: 700px)': {
              width: '100%',
              padding: '10px',
              height: '800px',
              borderLeft: 'none',
            },
          }}
        >
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Box
              sx={{
                width: '100%',
                height: '100px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#ada695',
                fontSize: '18px',
                fontWeight: 'bold',
                padding: '0 10px',
              }}
            >
              <Box>
                <span style={{ fontSize: '20px' }}>
                  {`Class: ${activityTitle || '-'}`}
                  {'  |  '}
                  {`Topic: ${groupName || '-'}`}
                </span>
              </Box>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', minHeight: '300px', backgroundColor: 'white', width: '100%' }}>
              <TextField
                multiline
                fullWidth
                minRows={10}
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                placeholder="請在這裡撰寫內容..."
                sx={{
                  height: '100%',
                  width: '100%',
                  '& .MuiInputBase-root': {
                    height: '100%',
                    alignItems: 'flex-start',
                  },
                }}
              />
            </Box>

            <Box sx={{ pt: 1, width: '100%' }}>
              <Box
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  minHeight: '140px',
                  p: 2,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <Box sx={{ fontSize: '16px', fontWeight: 'bold', mb: 1 }}>Teacher feedback</Box>
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  value={teacherFeedback}
                  onChange={(e) => setTeacherFeedback(e.target.value)}
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
                      onChange={(e) => setClaimsCount(e.target.value)}
                      sx={{ width: '80px', ...blackBorderFieldSx }}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      value={claimsText}
                      onChange={(e) => setClaimsText(e.target.value)}
                      sx={blackBorderFieldSx}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: '90px' }}>Grounds</Box>
                    <TextField
                      size="small"
                      value={groundsCount}
                      onChange={(e) => setGroundsCount(e.target.value)}
                      sx={{ width: '80px', ...blackBorderFieldSx }}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      value={groundsText}
                      onChange={(e) => setGroundsText(e.target.value)}
                      sx={blackBorderFieldSx}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: '90px' }}>Rebuttals</Box>
                    <TextField
                      size="small"
                      value={rebuttalsCount}
                      onChange={(e) => setRebuttalsCount(e.target.value)}
                      sx={{ width: '80px', ...blackBorderFieldSx }}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      value={rebuttalsText}
                      onChange={(e) => setRebuttalsText(e.target.value)}
                      sx={blackBorderFieldSx}
                    />
                  </Box>
                </Box>

                <Box sx={{ width: '140px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ fontWeight: 'bold' }}>Score</Box>
                  <TextField size="small" value={score} onChange={(e) => setScore(e.target.value)} />
                  <Button
                    variant="contained"
                    onClick={() => navigate(-1)}
                    sx={{
                      width: '30%',
                      minWidth: '90px',
                      color: '#000',
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
