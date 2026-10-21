import React from 'react';
import { act, render } from '@testing-library/react';
import axios from 'axios';
import Index from './Index';
import { syncJoinedStudentTopicsToNotion } from '../services/studentTopicService';
import { fetchNotificationStatus } from '../services/essayNotificationService';

jest.mock('axios', () => ({ get: jest.fn() }));
jest.mock('@mui/material', () => {
  const React = require('react');
  const Container = React.forwardRef(({ children }, ref) => React.createElement('div', { ref }, children));
  return {
    Box: Container,
    CircularProgress: () => null,
    Dialog: ({ open, children }) => open ? React.createElement('div', null, children) : null,
    DialogContent: Container,
    DialogTitle: Container,
    IconButton: Container,
    useMediaQuery: () => false,
    useTheme: () => ({ breakpoints: { down: () => '' } }),
  };
});
jest.mock('@mui/icons-material', () => ({ ChevronLeft: () => null, ChevronRight: () => null }));
jest.mock('socket.io-client', () => jest.fn());
jest.mock('../components/Navbar_Student', () => () => null);
jest.mock('../components/JoinActivityForm', () => ({ JoinActivityForm: () => null }));
jest.mock('../components/ActivityCard', () => () => null);
jest.mock('../utils/urlConfig', () => ({ __esModule: true, default: { backendHost: '/' } }));
jest.mock('../services/studentTopicService', () => ({ syncJoinedStudentTopicsToNotion: jest.fn() }));
jest.mock('../services/essayNotificationService', () => ({ fetchNotificationStatus: jest.fn() }));

test('loading the student home backfills all previously joined topics without rejoining', async () => {
  localStorage.clear();
  localStorage.setItem('userId', '42');
  localStorage.setItem('name', '測試學生');
  const activities = [
    { id: 1, ActivityGroup: { Activity: { id: 1, title: '1142B' }, Group: { id: 1, groupName: 'AI 學習' } } },
    { id: 2, ActivityGroup: { Activity: { id: 2, title: '1132B', endDate: '2020-01-01' }, Group: { id: 2, groupName: '舊主題' } } },
  ];
  axios.get.mockResolvedValue({ data: activities });
  syncJoinedStudentTopicsToNotion.mockResolvedValue({ synced: [], failed: [] });
  fetchNotificationStatus.mockResolvedValue({ hasNotification: false });

  await act(async () => { render(<Index />); });

  expect(syncJoinedStudentTopicsToNotion).toHaveBeenCalledWith({
    studentName: '測試學生',
    activities,
  });
  expect(syncJoinedStudentTopicsToNotion).toHaveBeenCalledTimes(1);
});
