import axios from 'axios';
import { ensureStudentTopicInNotion, syncJoinedStudentTopicsToNotion } from './studentTopicService';

jest.mock('axios', () => ({ post: jest.fn() }));

const activity = (className, theme, endDate = null) => ({
  ActivityGroup: { Activity: { title: className, endDate }, Group: { groupName: theme } },
});

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  axios.post.mockImplementation(async (url, payload) => ({ data: { success: true, data: payload } }));
});

test('backfills ongoing and completed topics, deduplicates memberships and skips incomplete scopes', async () => {
  const result = await syncJoinedStudentTopicsToNotion({
    studentName: ' 測試學生 ',
    activities: [
      activity('1142B', 'AI 學習'),
      activity(' 1142B ', 'AI 學習　'),
      activity('1142B', '已結束主題', '2020-01-01'),
      activity('1142H', 'AI 學習'),
      activity('', '未完成資料'),
      null,
    ],
  });

  expect(result.failed).toEqual([]);
  expect(result.synced).toHaveLength(3);
  expect(axios.post.mock.calls.map(([, payload]) => payload)).toEqual([
    { studentName: '測試學生', className: '1142B', theme: 'AI 學習' },
    { studentName: '測試學生', className: '1142B', theme: '已結束主題' },
    { studentName: '測試學生', className: '1142H', theme: 'AI 學習' },
  ]);
  expect(axios.post.mock.calls.every(([url]) => url.endsWith('/api/ensure-student-topic'))).toBe(true);
});

test('a failed topic does not prevent later topics from being saved and can be retried', async () => {
  const failure = new Error('Notion unavailable');
  axios.post.mockImplementation(async (url, payload) => {
    if (payload.theme === '暫時失敗') throw failure;
    return { data: { success: true, data: payload } };
  });
  const result = await syncJoinedStudentTopicsToNotion({
    studentName: '測試學生',
    activities: [activity('1142B', '暫時失敗'), activity('1142B', '其他主題')],
  });

  expect(result.synced).toHaveLength(1);
  expect(result.synced[0].theme).toBe('其他主題');
  expect(result.failed).toEqual([{ studentName: '測試學生', className: '1142B', theme: '暫時失敗', error: failure }]);

  axios.post.mockResolvedValue({ data: { success: true, data: { created: true } } });
  await expect(ensureStudentTopicInNotion(result.failed[0])).resolves.toEqual({ created: true });
});

test('concurrent saves of the same normalized student/class/topic share a request', async () => {
  let finishSaving;
  axios.post.mockImplementationOnce(() => new Promise((resolve) => { finishSaving = resolve; }));
  const first = ensureStudentTopicInNotion({ studentName: '測試學生', className: '1142B', theme: 'AI 學習' });
  const second = ensureStudentTopicInNotion({ studentName: ' 測試學生 ', className: '1142B', theme: ' AI 學習 ' });
  expect(axios.post).toHaveBeenCalledTimes(1);

  finishSaving({ data: { success: true, data: { created: true } } });
  await expect(Promise.all([first, second])).resolves.toEqual([{ created: true }, { created: true }]);

  await ensureStudentTopicInNotion({ studentName: '測試學生', className: '1142B', theme: 'AI 學習' });
  expect(axios.post).toHaveBeenCalledTimes(2);
});

test('a missing student or membership list does not write to Notion', async () => {
  await syncJoinedStudentTopicsToNotion({ studentName: ' ', activities: [activity('1142B', 'AI 學習')] });
  await syncJoinedStudentTopicsToNotion({ studentName: '測試學生', activities: null });
  expect(axios.post).not.toHaveBeenCalled();
});
