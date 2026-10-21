import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import Index from './Index';
import { fetchJoinedStudentTopics } from '../services/studentTopicService';
import { fetchNotificationStatus } from '../services/essayNotificationService';
jest.mock('@mui/material', () => {
  const React = require('react');
  const Container = React.forwardRef(({ children, role }, ref) => React.createElement('div', { ref, role }, children));
  return {
    Box: Container, CircularProgress: () => null,
    Dialog: ({ open, children }) => open ? React.createElement('div', null, children) : null,
    DialogContent: Container, DialogTitle: Container, IconButton: Container,
    useMediaQuery: () => false, useTheme: () => ({ breakpoints: { down: () => '' } }),
  };
});
jest.mock('@mui/icons-material', () => ({ ChevronLeft: () => null, ChevronRight: () => null }));
jest.mock('socket.io-client', () => jest.fn());
jest.mock('../components/Navbar_Student', () => () => null);
jest.mock('../components/JoinActivityForm', () => ({ JoinActivityForm: () => null }));
jest.mock('../components/ActivityCard', () => ({ activity }) => activity.ActivityGroup.Group.groupName);
jest.mock('../utils/urlConfig', () => ({ __esModule: true, default: { backendHost: '/' } }));
jest.mock('../services/studentTopicService', () => ({ fetchJoinedStudentTopics: jest.fn() }));
jest.mock('../services/essayNotificationService', () => ({ fetchNotificationStatus: jest.fn() }));
const activities = [
  { id: 1, ActivityGroup: { Activity: { id: 1, title: '1151 Reading and Writing' }, Group: { id: 1, groupName: 'Nuclear energy' } } },
  { id: 2, ActivityGroup: { Activity: { id: 2, title: '1132B', endDate: '2020-01-01' }, Group: { id: 2, groupName: 'Previous topic' } } },
];
beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  localStorage.setItem('name', 'Student');
  fetchNotificationStatus.mockResolvedValue({ hasNotification: false });
});
test('home uses one class-load request for current and previously joined topics', async () => {
  fetchJoinedStudentTopics.mockResolvedValue({ activities, notionSyncStatus: 'success' });
  await act(async () => { render(<Index />); });
  expect(fetchJoinedStudentTopics).toHaveBeenCalledTimes(1);
  expect(screen.getByText('Nuclear energy')).toBeTruthy();
  expect(screen.getByText('Previous topic')).toBeTruthy();
  expect(screen.queryByRole('alert')).toBeNull();
});
test('a failed save keeps topics visible and retries through the same class-load path', async () => {
  fetchJoinedStudentTopics
    .mockResolvedValueOnce({ activities, notionSyncStatus: 'failed' })
    .mockResolvedValueOnce({ activities, notionSyncStatus: 'success' });
  await act(async () => { render(<Index />); });
  expect(screen.getByText('Nuclear energy')).toBeTruthy();
  expect(screen.getByRole('alert')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Retry saving' }));
  await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  expect(fetchJoinedStudentTopics).toHaveBeenCalledTimes(2);
});
