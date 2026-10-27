import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import axios from 'axios';
import WritingArea from './writing_area';
import {
  readPendingToolkitSnapshot,
  readToolkitContentByScope,
  savePendingToolkitSnapshot,
  writeToolkitContentByScope,
} from '../utils/ragflowChatHistory';

jest.mock('axios', () => ({ get: jest.fn(), patch: jest.fn() }));
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }));
jest.mock('./Navbar_Student', () => () => null);
jest.mock('./StudentLeftSidebar', () => () => null);
jest.mock('../utils/urlConfig', () => ({ __esModule: true, default: { backendHost: '/' } }));
jest.mock('@mui/material', () => {
  const React = require('react');
  const Container = ({ children }) => <div>{children}</div>;
  return {
    Box: Container,
    Button: ({ children, onClick, disabled }) => <button onClick={onClick} disabled={disabled}>{children}</button>,
    Dialog: ({ open, children }) => open ? <div>{children}</div> : null,
    DialogTitle: Container, DialogContent: Container, DialogContentText: Container, DialogActions: Container,
  };
});

const scope = { studentName: 'Student', className: 'Class A', topicName: 'Topic A' };

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  for (const [key, value] of Object.entries({ name: scope.studentName, activityTitle: scope.className, groupName: scope.topicName })) {
    localStorage.setItem(key, value);
  }
  window.Quill = function (element) {
    this.root = element;
    this.enable = jest.fn();
    this.on = jest.fn();
  };
  axios.get.mockResolvedValue({ data: { success: true, data: {
    essayContent: 'Existing essay', kfAnalysisContent: 'Old summary', outlineContent: 'Outline', noteContent: 'Notes',
  } } });
  axios.patch.mockResolvedValue({ data: { success: true } });
});

afterEach(() => { delete window.Quill; });

test('saving writing uses the latest sidebar summary instead of its initial copy', async () => {
  await act(async () => { render(<WritingArea />); });
  writeToolkitContentByScope('kfAnalysisData', 'Newly imported summary', scope);
  savePendingToolkitSnapshot({ scopeInput: scope, kfSummaryContent: 'Newly imported summary' });
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save' })); });
  expect(axios.patch.mock.calls[0][1]).toMatchObject({
    essayContent: 'Existing essay', kfAnalysisContent: 'Newly imported summary', outlineContent: 'Outline', noteContent: 'Notes',
  });
  expect(readToolkitContentByScope('kfAnalysisData', scope)).toBe('Newly imported summary');
  expect(readPendingToolkitSnapshot(scope)).toBeNull();
});

test.each(['stale', 'missing'])('opening writing preserves an unsaved import when the database record is %s', async (recordState) => {
  writeToolkitContentByScope('kfAnalysisData', 'Unsaved KF summary', scope);
  savePendingToolkitSnapshot({ scopeInput: scope, kfSummaryContent: 'Unsaved KF summary' });
  if (recordState === 'missing') {
    axios.get.mockRejectedValue({ response: { status: 404, data: { success: false } } });
  }
  await act(async () => { render(<WritingArea />); });
  expect(readToolkitContentByScope('kfAnalysisData', scope)).toBe('Unsaved KF summary');
  expect(readPendingToolkitSnapshot(scope).kfSummaryContent).toBe('Unsaved KF summary');
});
