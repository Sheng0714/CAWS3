import axios from 'axios';
import {
  upsertRagflowChatSession, syncRagflowChatHistoryToNotion, syncToolkitSnapshotToNotion,
  syncKfSummaryFromAssistantReply, syncWritingOutlineFromAssistantReply,
  readToolkitContentByScope, writeToolkitContentByScope,
  readPendingToolkitSnapshot, savePendingToolkitSnapshot,
} from './ragflowChatHistory';

jest.mock('axios', () => ({ post: jest.fn(), patch: jest.fn() }));
jest.mock('./urlConfig', () => ({ __esModule: true, default: { backendHost: '/' } }));

const scope = { activityId: '1', groupId: '2', className: '1151 Reading and Writing', topicName: 'Nuclear energy' };
const messages = Array.from({ length: 45 }, (_, index) => ({ role: index % 2 ? 'assistant' : 'user', content: `Message ${index}`, createdAt: 1000 + index }));
const toolkitScope = { studentName: 'Student', className: scope.className, topicName: scope.topicName };
const summary = '**Supporting Arguments:**\n1. Nuclear power produces low-carbon electricity.\n\n**Opposing Arguments:**\n1. Waste requires long-term storage.\n\n**Evidence:**\n1. The group compared emissions and waste data.';

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

test.each([
  summary,
  '贊成論點：\n核能提供穩定供電。\n反對論點：\n核廢料需要長期儲存。\n證據：\n小組提供了發電數據。',
  'Supporting Argument(贊成論點): Lower emissions.\nOpposing Argument(反對論點): Waste storage.\nEvidence(證據): Group data.',
  '你們的討論已經足夠，KF討論摘要已自動匯入。',
])('imports completed KF summaries without depending on one closing sentence: %s', (reply) => {
  expect(syncKfSummaryFromAssistantReply('kf_analysis', reply, toolkitScope)).toBe(true);
  expect(readToolkitContentByScope('kfAnalysisData', toolkitScope)).toBe(reply);
  expect(readToolkitContentByScope('outlineData', toolkitScope)).toBe('');
  expect(readToolkitContentByScope('kfAnalysisData', { ...toolkitScope, topicName: 'Other topic' })).toBe('');
});

test.each([
  'Please share your KF discussion.',
  'Please provide supporting arguments, opposing arguments, and evidence.',
  'Supporting Arguments:\n\nOpposing Arguments:\n\nEvidence:',
  'Supporting Arguments:\nOne argument.\nEvidence:\nSome data.',
])('keeps the existing summary while the discussion is incomplete: %s', (reply) => {
  writeToolkitContentByScope('kfAnalysisData', 'Previous summary', toolkitScope);
  expect(syncKfSummaryFromAssistantReply('kf_analysis', reply, toolkitScope)).toBe(false);
  expect(readToolkitContentByScope('kfAnalysisData', toolkitScope)).toBe('Previous summary');
});

test('routes each chatbot output to its own toolkit field', () => {
  expect(syncKfSummaryFromAssistantReply('writing_analysis', summary, toolkitScope)).toBe(false);
  expect(syncKfSummaryFromAssistantReply('writing_assistant', summary, toolkitScope)).toBe(false);
  expect(syncWritingOutlineFromAssistantReply('writing_assistant', '寫作大綱已自動匯入', toolkitScope)).toBe(true);
  expect(readToolkitContentByScope('outlineData', toolkitScope)).toBe('寫作大綱已自動匯入');
  expect(readToolkitContentByScope('kfAnalysisData', toolkitScope)).toBe('');
});

test('imports only the changed summary, regardless of unrelated cached writing', async () => {
  localStorage.setItem('essayData', 'Essay from another topic');
  writeToolkitContentByScope('outlineData', 'Cached outline', toolkitScope);
  await syncToolkitSnapshotToNotion({ scopeInput: toolkitScope, kfSummaryContent: summary });
  expect(axios.patch.mock.calls[0][1]).toEqual({
    studentName: 'Student', className: scope.className, theme: scope.topicName, kfAnalysisContent: summary,
  });
});

test('tries the HTTPS proxy alias when the first route returns an HTML page', async () => {
  axios.patch.mockResolvedValueOnce({ data: '<html>Frontend fallback</html>' });
  await expect(syncToolkitSnapshotToNotion({ scopeInput: toolkitScope, kfSummaryContent: summary })).resolves.toBe(true);
  expect(axios.patch.mock.calls.map(([requestUrl]) => requestUrl)).toEqual([
    '/notion-api/api/update-note', '/api/notion/api/update-note',
  ]);
});

test('does not report a toolkit import as saved without confirmation', async () => {
  axios.patch.mockResolvedValue({ data: '<html>Wrong route</html>' });
  await expect(syncToolkitSnapshotToNotion({ scopeInput: toolkitScope, kfSummaryContent: summary })).rejects.toThrow('did not confirm');
});

test('missing toolkit scope is reported before attempting a save', async () => {
  await expect(syncToolkitSnapshotToNotion({ scopeInput: { ...toolkitScope, topicName: '' }, kfSummaryContent: summary })).rejects.toThrow('student, class and topic');
  expect(axios.patch).not.toHaveBeenCalled();
});

test('retains unsaved imports per student/topic and removes only the confirmed version', async () => {
  savePendingToolkitSnapshot({ scopeInput: toolkitScope, kfSummaryContent: 'Older summary' });
  savePendingToolkitSnapshot({ scopeInput: toolkitScope, kfSummaryContent: summary, outlineContent: 'Unsaved outline' });
  expect(readPendingToolkitSnapshot({ ...toolkitScope, studentName: 'Other student' })).toBeNull();
  expect(readPendingToolkitSnapshot({ ...toolkitScope, topicName: 'Other topic' })).toBeNull();
  await syncToolkitSnapshotToNotion({ scopeInput: toolkitScope, kfSummaryContent: 'Older summary' });
  expect(readPendingToolkitSnapshot(toolkitScope).kfSummaryContent).toBe(summary);
  await syncToolkitSnapshotToNotion({ scopeInput: toolkitScope, kfSummaryContent: summary });
  expect(readPendingToolkitSnapshot(toolkitScope)).toEqual({ scopeInput: toolkitScope, outlineContent: 'Unsaved outline' });
  axios.patch.mockRejectedValue(new Error('Offline'));
  await expect(syncToolkitSnapshotToNotion({ scopeInput: toolkitScope, outlineContent: 'Unsaved outline' })).rejects.toThrow('Offline');
  expect(readPendingToolkitSnapshot(toolkitScope).outlineContent).toBe('Unsaved outline');
  axios.patch.mockResolvedValue({ data: { success: true } });
  await syncToolkitSnapshotToNotion({ scopeInput: toolkitScope, outlineContent: 'Unsaved outline' });
  expect(readPendingToolkitSnapshot(toolkitScope)).toBeNull();
});
