import axios from 'axios';
import { upsertRagflowChatSession, syncRagflowChatHistoryToNotion, syncToolkitSnapshotToNotion } from './ragflowChatHistory';

jest.mock('axios', () => ({ post: jest.fn(), patch: jest.fn() }));
jest.mock('./urlConfig', () => ({ __esModule: true, default: { backendHost: '/' } }));

const scope = { activityId: '1', groupId: '2', className: '1151 Reading and Writing', topicName: 'Nuclear energy' };
const messages = Array.from({ length: 45 }, (_, index) => ({ role: index % 2 ? 'assistant' : 'user', content: `Message ${index}`, createdAt: 1000 + index }));

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('userId', '42');
  localStorage.setItem('jwtToken', 'student-token');
  axios.post.mockResolvedValue({ data: { success: true, data: { sessionCount: 12 } } });
  axios.patch.mockResolvedValue({ data: { success: true } });
});

test('saves every session and message for this student/class/topic through the main backend', async () => {
  for (let index = 0; index < 12; index += 1) {
    upsertRagflowChatSession({ sessionId: `session-${index}`, chatbotEntryMode: 'kf_analysis', scope, messages });
  }
  upsertRagflowChatSession({ sessionId: 'different-topic', scope: { ...scope, groupId: '3' }, messages });
  localStorage.setItem('userId', '99');
  upsertRagflowChatSession({ sessionId: 'other-student', scope, messages });
  localStorage.setItem('userId', '42');

  await syncRagflowChatHistoryToNotion(scope);

  expect(axios.post).toHaveBeenCalledTimes(1);
  const [requestUrl, payload, options] = axios.post.mock.calls[0];
  expect(requestUrl).toBe('/api/activities/myJoined/42/chat-history');
  expect(options.headers.Authorization).toBe('Bearer student-token');
  expect(payload.activityId).toBe('1');
  expect(payload.groupId).toBe('2');
  expect(payload.chatHistory).toHaveLength(12);
  expect(payload.chatHistory.every((session) => session.messages.length === 45)).toBe(true);
  expect(payload.chatHistory.flatMap((session) => session.messages).some((message) => !message.created_at)).toBe(false);
  expect(payload).not.toHaveProperty('studentName');
});

test('unowned legacy cache is not attributed to the next logged-in student', async () => {
  localStorage.setItem('ragflow_chat_history_v1', JSON.stringify([{ sessionId: 'legacy', scope, messages }]));
  await syncRagflowChatHistoryToNotion(scope);
  expect(axios.post).not.toHaveBeenCalled();
});

test('a failed save retains the local conversation and can be retried', async () => {
  upsertRagflowChatSession({ sessionId: 'retry-session', scope, messages });
  axios.post.mockRejectedValueOnce(new Error('Notion unavailable'));
  await expect(syncRagflowChatHistoryToNotion(scope)).rejects.toThrow('Notion unavailable');
  expect(JSON.parse(localStorage.getItem('ragflow_chat_history_v1'))[0].messages).toHaveLength(45);
  await expect(syncRagflowChatHistoryToNotion(scope)).resolves.toEqual({ sessionCount: 12 });
});

test('a delayed shorter RAGFLOW snapshot cannot erase unsynced local turns', async () => {
  upsertRagflowChatSession({ sessionId: 'delayed-session', scope, messages });
  const saved = upsertRagflowChatSession({ sessionId: 'delayed-session', scope, messages: messages.slice(0, 2) });
  expect(saved.messages).toHaveLength(45);
  await syncRagflowChatHistoryToNotion(scope);
  expect(axios.post.mock.calls[0][1].chatHistory[0].messages).toHaveLength(45);
});

test('does not accept an unconfirmed HTTP 200 response as a saved history', async () => {
  upsertRagflowChatSession({ sessionId: 'test', scope, messages });
  axios.post.mockResolvedValue({ data: '<html>Wrong route</html>' });
  await expect(syncRagflowChatHistoryToNotion(scope)).rejects.toThrow('did not confirm');
});

test('toolkit snapshots leave chat history to its dedicated save endpoint', async () => {
  await syncToolkitSnapshotToNotion({ scopeInput: { studentName: 'Student', className: scope.className, topicName: scope.topicName }, kfSummaryContent: 'Summary' });
  expect(axios.patch.mock.calls[0][1]).not.toHaveProperty('chatHistory');
});
