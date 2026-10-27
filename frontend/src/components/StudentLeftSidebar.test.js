import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import axios from 'axios';
import StudentLeftSidebar from './StudentLeftSidebar';
import {
  readToolkitContentByScope,
  savePendingToolkitSnapshot,
  syncKfSummaryFromAssistantReply,
} from '../utils/ragflowChatHistory';

jest.mock('axios', () => ({ get: jest.fn(), patch: jest.fn() }));
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }));
jest.mock('./RagflowMarkdown', () => ({ content }) => <span>{content}</span>);
jest.mock('./WritingStageStepper', () => () => null);
jest.mock('../utils/urlConfig', () => ({ __esModule: true, default: { backendHost: '/' } }));

const scope = { studentName: 'Student', className: 'Class A', topicName: 'Topic A' };
const summary = '你們的討論已經足夠，這是目前的 KF 摘要。';

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  localStorage.setItem('name', scope.studentName);
  localStorage.setItem('activityTitle', scope.className);
  localStorage.setItem('groupName', scope.topicName);
  axios.get.mockResolvedValue({ data: { success: true, data: { kfAnalysisContent: '', outlineContent: 'Existing outline', noteContent: 'Existing notes' } } });
});

test('an imported summary appears immediately in KF Summary and survives a stale database reload', async () => {
  await act(async () => { render(<StudentLeftSidebar />); });
  await act(async () => {
    syncKfSummaryFromAssistantReply('kf_analysis', summary, scope);
    savePendingToolkitSnapshot({ scopeInput: scope, kfSummaryContent: summary });
  });
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'menu-toggle' })); });
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: /KF Summary-expand/ })); });
  expect(screen.getByText(summary)).toBeTruthy();
  expect(readToolkitContentByScope('kfAnalysisData', scope)).toBe(summary);
  expect(readToolkitContentByScope('outlineData', scope)).toBe('Existing outline');
  expect(axios.get.mock.calls[0][1].params).toEqual({ className: scope.className, theme: scope.topicName });
});

test('the sidebar skips an HTML fallback and reads the HTTPS Notion route', async () => {
  axios.get.mockResolvedValueOnce({ data: '<html>Wrong route</html>' });
  await act(async () => { render(<StudentLeftSidebar />); });
  expect(axios.get.mock.calls.map(([requestUrl]) => requestUrl)).toEqual([
    '/notion-api/api/get-essay/Student', '/api/notion/api/get-essay/Student',
  ]);
  expect(readToolkitContentByScope('outlineData', scope)).toBe('Existing outline');
});
