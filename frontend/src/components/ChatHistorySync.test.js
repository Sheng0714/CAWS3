import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Newchat from './Newchat';
import Chathistory from './Chathistory';
import { readPendingToolkitSnapshot, readToolkitContentByScope } from '../utils/ragflowChatHistory';

let mockChatbotEntryMode = 'kf_analysis';

jest.mock('axios', () => ({ get: jest.fn(), post: jest.fn(), patch: jest.fn() }));
jest.mock('react-router-dom', () => ({ useLocation: () => ({ state: { chatbotEntryMode: mockChatbotEntryMode } }), useNavigate: () => jest.fn() }));
jest.mock('./Navbar_Student', () => () => null);
jest.mock('./StudentLeftSidebar', () => () => null);
jest.mock('./RagflowMarkdown', () => ({ content }) => content);
jest.mock('../utils/urlConfig', () => ({ __esModule: true, default: { backendHost: '/' } }));

const originalFetch = global.fetch;
const apiResponse = (data) => ({ ok: true, json: async () => data });

beforeAll(() => {
  HTMLElement.prototype.scrollTo = jest.fn();
  HTMLElement.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  jest.resetAllMocks();
  mockChatbotEntryMode = 'kf_analysis';
  localStorage.clear();
  sessionStorage.clear();
  for (const [key, value] of Object.entries({ userId: '42', name: 'Student', activityId: '1', groupId: '2', activityTitle: '1151 Reading and Writing', groupName: 'Nuclear energy' })) {
    localStorage.setItem(key, value);
  }
  axios.get.mockImplementation(async (requestUrl) => requestUrl.endsWith('/chat-history')
    ? { data: { success: true, data: { chatHistory: [] } } }
    : { data: { title: '1151 Reading and Writing', Groups: [{ id: 2, groupName: 'Nuclear energy' }] } });
  axios.post.mockResolvedValue({ data: { success: true, data: { sessionCount: 1 } } });
  axios.patch.mockResolvedValue({ data: { success: true } });
  global.fetch = jest.fn(async (requestUrl) => {
    if (requestUrl.endsWith('/chat-title/generate')) return apiResponse({ title: '' });
    if (requestUrl.endsWith('/completions')) return apiResponse({ code: 0, data: { answer: 'Ordinary reply without a toolkit trigger' } });
    return apiResponse({ code: 0, data: { id: 'new-session' } });
  });
});

afterAll(() => { global.fetch = originalFetch; });

test('an ordinary new-chat reply automatically saves both roles under its class and topic', async () => {
  await act(async () => { render(<Newchat />); });
  const input = await screen.findByRole('textbox');
  fireEvent.change(input, { target: { value: 'My question about nuclear energy' } });
  await act(async () => { fireEvent.keyDown(input, { key: 'Enter' }); });
  await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
  const [requestUrl, payload] = axios.post.mock.calls[0];
  expect(requestUrl).toBe('/api/activities/myJoined/42/chat-history');
  expect(payload.className).toBe('1151 Reading and Writing');
  expect(payload.theme).toBe('Nuclear energy');
  expect(payload.chatHistory[0].messages.map(({ role, content }) => ({ role, content }))).toEqual([
    { role: 'user', content: 'My question about nuclear energy' },
    { role: 'assistant', content: 'Ordinary reply without a toolkit trigger' },
  ]);
  expect(axios.patch).not.toHaveBeenCalled();
});

test('opening history backfills existing conversations, and a failed Notion save offers a working retry', async () => {
  const sourceSession = {
    id: 'existing-session', name: 'Previous discussion', create_time: 1000, update_time: 2000,
    messages: [{ role: 'user', content: 'Previous question' }, { role: 'assistant', content: 'Previous answer' }],
  };
  global.fetch.mockResolvedValue(apiResponse({ code: 0, data: [sourceSession] }));
  axios.post.mockRejectedValueOnce(new Error('Notion unavailable'));
  await act(async () => { render(<Chathistory />); });
  await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
  expect(screen.getByText('Previous discussion')).toBeTruthy();
  expect(axios.post.mock.calls[0][1].chatHistory[0].messages).toHaveLength(2);
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Retry saving' })); });
  await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  expect(axios.post).toHaveBeenCalledTimes(2);
  expect(axios.post.mock.calls[1][1].chatHistory[0].sessionId).toBe('existing-session');
});

const storedSession = {
  sessionId: 'notion-only', name: 'Saved discussion', chatbotEntryMode: 'kf_analysis',
  createdAt: 1760000000000, updatedAt: 1760000010000,
  messages: [
    { role: 'user', content: 'Question saved in Notion', created_at: '2025-10-09T08:53:20Z' },
    { role: 'assistant', content: 'Answer saved in Notion', created_at: '2025-10-09T08:53:21Z' },
  ],
};

function useNotionHistory(sessions = [storedSession]) {
  axios.get.mockImplementation(async (requestUrl) => requestUrl.endsWith('/chat-history')
    ? { data: { success: true, data: { chatHistory: sessions } } }
    : { data: { title: '1151 Reading and Writing', Groups: [{ id: 2, groupName: 'Nuclear energy' }] } });
}

test('shows Notion-only sessions and both message roles even when RAGFLOW is offline', async () => {
  useNotionHistory([storedSession, { ...storedSession, sessionId: 'other-mode', name: 'Writing history', chatbotEntryMode: 'writing_analysis' }]);
  global.fetch.mockRejectedValue(new Error('RAGFLOW is offline'));
  await act(async () => { render(<Chathistory />); });
  expect(screen.getByText('Saved discussion')).toBeTruthy();
  expect(screen.queryByText('Writing history')).toBeNull();
  expect(screen.queryByRole('alert')).toBeNull();
  const [, requestOptions] = axios.get.mock.calls.find(([requestUrl]) => requestUrl.endsWith('/chat-history'));
  expect(requestOptions.params).toEqual({ activityId: '1', groupId: '2', className: '1151 Reading and Writing', theme: 'Nuclear energy' });
  fireEvent.click(screen.getByText('Saved discussion'));
  expect(screen.getByText('Question saved in Notion')).toBeTruthy();
  expect(screen.getByText('Answer saved in Notion')).toBeTruthy();
  expect(axios.post).not.toHaveBeenCalled();
});

test('renders Notion history while the optional RAGFLOW request is still pending', async () => {
  useNotionHistory();
  let finishUpstream;
  global.fetch.mockImplementation(() => new Promise((resolve) => { finishUpstream = resolve; }));
  await act(async () => { render(<Chathistory />); });
  expect(screen.getByText('Saved discussion')).toBeTruthy();
  expect(screen.queryByText('Loading saved chat history...')).toBeNull();
  await act(async () => { finishUpstream(apiResponse({ code: 0, data: [] })); });
});

test('a Notion load error offers a retry instead of claiming the database history is empty', async () => {
  let fail = true;
  axios.get.mockImplementation(async (requestUrl) => {
    if (!requestUrl.endsWith('/chat-history')) return { data: { title: '1151 Reading and Writing', Groups: [{ id: 2, groupName: 'Nuclear energy' }] } };
    if (fail) { fail = false; throw new Error('Notion unavailable'); }
    return { data: { success: true, data: { chatHistory: [storedSession] } } };
  });
  global.fetch.mockRejectedValue(new Error('RAGFLOW unavailable'));
  await act(async () => { render(<Chathistory />); });
  expect(screen.getByRole('alert').textContent).toContain('could not be loaded from Notion');
  expect(screen.queryByText('No chat history yet.')).toBeNull();
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Retry loading' })); });
  expect(screen.getByText('Saved discussion')).toBeTruthy();
  expect(screen.queryByRole('alert')).toBeNull();
});

test('continuing a Notion-loaded conversation saves new turns and keeps them through a stale reload', async () => {
  useNotionHistory();
  global.fetch.mockImplementation(async (requestUrl) => {
    if (requestUrl.endsWith('/completions')) return apiResponse({ code: 0, data: { answer: 'New answer after loading from Notion' } });
    throw new Error('RAGFLOW history unavailable');
  });
  await act(async () => { render(<Chathistory />); });
  fireEvent.click(screen.getByText('Saved discussion'));
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'Follow-up to Notion history' } });
  await act(async () => { fireEvent.keyDown(input, { key: 'Enter' }); });
  expect(screen.getByText('New answer after loading from Notion')).toBeTruthy();
  expect(axios.post.mock.calls[0][1].chatHistory[0].messages.map((message) => message.content)).toEqual([
    'Question saved in Notion', 'Answer saved in Notion', 'Follow-up to Notion history', 'New answer after loading from Notion',
  ]);
});

test('legacy Notion sessions without mode metadata remain readable', async () => {
  useNotionHistory([{ ...storedSession, chatbotEntryMode: undefined }]);
  global.fetch.mockRejectedValue(new Error('RAGFLOW history unavailable'));
  await act(async () => { render(<Chathistory />); });
  fireEvent.click(screen.getByText('Saved discussion'));
  expect(screen.getByText('Answer saved in Notion')).toBeTruthy();
  expect(screen.getByRole('textbox').disabled).toBe(true);
});

test('an unconfirmed Notion read response is shown as a load error', async () => {
  axios.get.mockImplementation(async (requestUrl) => requestUrl.endsWith('/chat-history')
    ? { data: '<html>Wrong route</html>' }
    : { data: { title: '1151 Reading and Writing', Groups: [{ id: 2, groupName: 'Nuclear energy' }] } });
  await act(async () => { render(<Chathistory />); });
  expect(screen.getByRole('button', { name: 'Retry loading' })).toBeTruthy();
  expect(screen.queryByText('No chat history yet.')).toBeNull();
});

const toolkitScope = { studentName: 'Student', className: '1151 Reading and Writing', topicName: 'Nuclear energy' };
const completedSummary = '**Supporting Arguments:**\nLow-carbon electricity.\n**Opposing Arguments:**\nWaste storage.\n**Evidence:**\nGroup research data.';

test('a completed new-chat summary is imported locally and into KF摘要 for the current class/topic', async () => {
  global.fetch.mockImplementation(async (requestUrl) => {
    if (requestUrl.endsWith('/chat-title/generate')) return apiResponse({ title: '' });
    if (requestUrl.endsWith('/completions')) return apiResponse({ code: 0, data: { answer: completedSummary } });
    return apiResponse({ code: 0, data: { id: 'new-session' } });
  });
  await act(async () => { render(<Newchat />); });
  const input = await screen.findByRole('textbox');
  fireEvent.change(input, { target: { value: 'Summarize our KF discussion' } });
  await act(async () => { fireEvent.keyDown(input, { key: 'Enter' }); });
  expect(readToolkitContentByScope('kfAnalysisData', toolkitScope)).toBe(completedSummary);
  expect(axios.patch.mock.calls[0][1]).toEqual({
    studentName: 'Student', className: toolkitScope.className, theme: toolkitScope.topicName, kfAnalysisContent: completedSummary,
  });
  expect(readPendingToolkitSnapshot(toolkitScope)).toBeNull();
  expect(screen.queryByRole('button', { name: 'Retry importing' })).toBeNull();
});

test('a completed summary from a continued history chat follows the same import path', async () => {
  useNotionHistory();
  global.fetch.mockImplementation(async (requestUrl) => {
    if (requestUrl.endsWith('/completions')) return apiResponse({ code: 0, data: { answer: completedSummary } });
    throw new Error('RAGFLOW history unavailable');
  });
  await act(async () => { render(<Chathistory />); });
  fireEvent.click(screen.getByText('Saved discussion'));
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'Finish our summary' } });
  await act(async () => { fireEvent.keyDown(input, { key: 'Enter' }); });
  expect(readToolkitContentByScope('kfAnalysisData', toolkitScope)).toBe(completedSummary);
  expect(axios.patch.mock.calls[0][1].kfAnalysisContent).toBe(completedSummary);
  expect(axios.patch.mock.calls[0][1]).not.toHaveProperty('outlineContent');
});

test('failed imports remain visible locally, offer retry, and resume after reloading the chat', async () => {
  global.fetch.mockImplementation(async (requestUrl) => {
    if (requestUrl.endsWith('/chat-title/generate')) return apiResponse({ title: '' });
    if (requestUrl.endsWith('/completions')) return apiResponse({ code: 0, data: { answer: completedSummary } });
    return apiResponse({ code: 0, data: { id: 'new-session' } });
  });
  axios.patch.mockRejectedValue(new Error('Notion offline'));
  let view;
  await act(async () => { view = render(<Newchat />); });
  const input = await screen.findByRole('textbox');
  fireEvent.change(input, { target: { value: 'Finish the discussion' } });
  await act(async () => { fireEvent.keyDown(input, { key: 'Enter' }); });
  expect(screen.getByRole('button', { name: 'Retry importing' })).toBeTruthy();
  expect(readToolkitContentByScope('kfAnalysisData', toolkitScope)).toBe(completedSummary);
  expect(readPendingToolkitSnapshot(toolkitScope).kfSummaryContent).toBe(completedSummary);
  axios.patch.mockResolvedValue({ data: { success: true } });
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Retry importing' })); });
  expect(screen.queryByRole('button', { name: 'Retry importing' })).toBeNull();
  expect(readPendingToolkitSnapshot(toolkitScope)).toBeNull();

  // Simulate a browser reload with an unsaved import still on disk.
  const { savePendingToolkitSnapshot } = require('../utils/ragflowChatHistory');
  savePendingToolkitSnapshot({ scopeInput: toolkitScope, kfSummaryContent: completedSummary });
  view.unmount();
  axios.patch.mockClear();
  await act(async () => { render(<Newchat />); });
  expect(axios.patch.mock.calls[0][1].kfAnalysisContent).toBe(completedSummary);
  expect(readPendingToolkitSnapshot(toolkitScope)).toBeNull();
});

test.each(['new chat', 'history'])('Writing Assistant imports its completed outline from %s into 寫作大綱', async (entry) => {
  mockChatbotEntryMode = 'writing_assistant';
  const answer = 'Congratulations! You have completed your writing outline. You can now start writing!';
  useNotionHistory([{ ...storedSession, chatbotEntryMode: 'writing_assistant' }]);
  global.fetch.mockImplementation(async (requestUrl) => {
    if (requestUrl.endsWith('/chat-title/generate')) return apiResponse({ title: '' });
    if (requestUrl.endsWith('/completions')) return apiResponse({ code: 0, data: { data: { content: answer } } });
    if (entry === 'new chat') return apiResponse({ code: 0, data: { id: 'outline-session' } });
    throw new Error('RAGFLOW history unavailable');
  });
  await act(async () => { render(entry === 'new chat' ? <Newchat /> : <Chathistory />); });
  if (entry === 'history') fireEvent.click(screen.getByText('Saved discussion'));
  const input = await screen.findByRole('textbox');
  fireEvent.change(input, { target: { value: 'Finish my writing outline' } });
  await act(async () => { fireEvent.keyDown(input, { key: 'Enter' }); });
  expect(readToolkitContentByScope('outlineData', toolkitScope)).toBe(answer);
  expect(axios.patch.mock.calls[0][1]).toEqual({
    studentName: toolkitScope.studentName, className: toolkitScope.className, theme: toolkitScope.topicName, outlineContent: answer,
  });
  expect(readPendingToolkitSnapshot(toolkitScope)).toBeNull();
});
