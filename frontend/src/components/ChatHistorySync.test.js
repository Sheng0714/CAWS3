import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Newchat from './Newchat';
import Chathistory from './Chathistory';

jest.mock('axios', () => ({ get: jest.fn(), post: jest.fn(), patch: jest.fn() }));
jest.mock('react-router-dom', () => ({ useLocation: () => ({ state: { chatbotEntryMode: 'kf_analysis' } }), useNavigate: () => jest.fn() }));
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
  localStorage.clear();
  sessionStorage.clear();
  for (const [key, value] of Object.entries({ userId: '42', name: 'Student', activityId: '1', groupId: '2', activityTitle: '1151 Reading and Writing', groupName: 'Nuclear energy' })) {
    localStorage.setItem(key, value);
  }
  axios.get.mockResolvedValue({ data: { title: '1151 Reading and Writing', Groups: [{ id: 2, groupName: 'Nuclear energy' }] } });
  axios.post.mockResolvedValue({ data: { success: true, data: { sessionCount: 1 } } });
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
