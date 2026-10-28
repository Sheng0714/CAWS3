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
const writingScope = { studentName: scope.studentName, className: scope.className, theme: scope.topicName };
const scopeResponse = { data: { success: true, data: writingScope } };
let quill;

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  for (const [key, value] of Object.entries({ userId: '42', activityId: '1', groupId: '2', name: scope.studentName, activityTitle: scope.className, groupName: scope.topicName })) {
    localStorage.setItem(key, value);
  }
  window.Quill = function (element) {
    quill = this;
    this.root = element;
    this.enable = jest.fn();
    this.on = jest.fn();
  };
  axios.get.mockImplementation((url) => Promise.resolve(url.endsWith('/writing-scope') ? scopeResponse : { data: { success: true, data: {
    essayContent: 'Existing essay', kfAnalysisContent: 'Old summary', outlineContent: 'Outline', noteContent: 'Notes',
  } } }));
  axios.patch.mockResolvedValue({ data: { success: true } });
});

afterEach(() => { delete window.Quill; jest.restoreAllMocks(); });

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
    axios.get.mockImplementation((url) => url.endsWith('/writing-scope')
      ? Promise.resolve(scopeResponse)
      : Promise.reject({ response: { status: 404, data: { success: false } } }));
  }
  await act(async () => { render(<WritingArea />); });
  expect(readToolkitContentByScope('kfAnalysisData', scope)).toBe('Unsaved KF summary');
  expect(readPendingToolkitSnapshot(scope).kfSummaryContent).toBe('Unsaved KF summary');
});

test('recovers missing cached names by IDs, then fetches and saves to the confirmed class/topic', async () => {
  localStorage.removeItem('name');
  localStorage.removeItem('activityTitle');
  localStorage.removeItem('groupName');
  await act(async () => { render(<WritingArea />); });
  expect(axios.get.mock.calls[0][0]).toBe('/api/activities/myJoined/42/writing-scope');
  expect(axios.get.mock.calls[0][1].params).toMatchObject({ activityId: '1', groupId: '2' });
  expect(axios.get.mock.calls[1][1].params).toEqual({ className: scope.className, theme: scope.topicName });
  expect(localStorage.getItem('activityTitle')).toBe(scope.className);
  expect(sessionStorage.getItem('groupName')).toBe(scope.topicName);
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save' })); });
  expect(axios.get.mock.calls.filter(([url]) => url.endsWith('/writing-scope'))).toHaveLength(2);
  expect(axios.patch.mock.calls[0][1]).toMatchObject({ ...writingScope, essayContent: 'Existing essay' });
  expect(axios.get.mock.invocationCallOrder.at(-1)).toBeLessThan(axios.patch.mock.invocationCallOrder[0]);
});

test('cannot save before the current class/topic has finished loading', async () => {
  let resolveScope;
  axios.get.mockImplementationOnce(() => new Promise((resolve) => { resolveScope = resolve; }));
  await act(async () => { render(<WritingArea />); });
  expect(screen.getByRole('button', { name: 'Save' }).disabled).toBe(true);
  expect(axios.patch).not.toHaveBeenCalled();
  await act(async () => { resolveScope(scopeResponse); });
  expect(screen.getByRole('button', { name: 'Save' }).disabled).toBe(false);
});

test('failed class/topic resolution preserves the draft and does not write an essay', async () => {
  const alert = jest.spyOn(window, 'alert').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  await act(async () => { render(<WritingArea />); });
  act(() => {
    quill.root.innerHTML = 'My unsaved draft';
    quill.on.mock.calls.find(([event]) => event === 'text-change')[1]();
  });
  axios.get.mockRejectedValue({ response: { status: 403, data: { success: false, error: 'Class topic is unavailable' } } });
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save' })); });
  expect(axios.patch).not.toHaveBeenCalled();
  expect(localStorage.getItem('essayData::Student::Class%20A::Topic%20A')).toBe('My unsaved draft');
  expect(alert).toHaveBeenCalledWith(expect.stringContaining('Class topic is unavailable'));
});

test('an actionable database error is reported without trying another database', async () => {
  const alert = jest.spyOn(window, 'alert').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  await act(async () => { render(<WritingArea />); });
  axios.patch.mockRejectedValue({ response: { status: 400, data: { success: false, error: 'Save failed', details: 'Missing writing field' } } });
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save' })); });
  expect(axios.patch).toHaveBeenCalledTimes(1);
  expect(alert).toHaveBeenCalledWith(expect.stringContaining('Missing writing field'));
  expect(localStorage.getItem('essayData::Student::Class%20A::Topic%20A')).toBe('Existing essay');
});
