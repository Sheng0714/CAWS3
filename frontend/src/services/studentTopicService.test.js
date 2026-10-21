import axios from 'axios';
import { fetchJoinedStudentTopics } from './studentTopicService';
jest.mock('axios', () => ({ get: jest.fn(), post: jest.fn() }));
jest.mock('../utils/urlConfig', () => ({ __esModule: true, default: { backendHost: '/' } }));
beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  localStorage.setItem('userId', '42');
});
test('uses the original authenticated class-list path and its verified sync status', async () => {
  localStorage.setItem('jwtToken', 'student-token');
  const activities = [{ ActivityGroup: { Activity: { title: '1151 Reading and Writing' }, Group: { groupName: 'Nuclear energy' } } }];
  axios.get.mockResolvedValue({ data: activities, headers: { 'x-notion-sync-status': 'success' } });
  await expect(fetchJoinedStudentTopics()).resolves.toEqual({ activities, notionSyncStatus: 'success' });
  expect(axios.get).toHaveBeenCalledWith('/api/activities/myJoined/42', { headers: { Authorization: 'Bearer student-token' } });
  expect(axios.post).not.toHaveBeenCalled();
});
test.each(['failed', undefined])('does not report success when the backend returns %s', async (status) => {
  axios.get.mockResolvedValue({ data: [], headers: { 'x-notion-sync-status': status } });
  const result = await fetchJoinedStudentTopics();
  expect(result.activities).toEqual([]);
  expect(result.notionSyncStatus).toBe(status || 'unconfirmed');
});
test('rejects a non-list response instead of hiding a class loading error', async () => {
  axios.get.mockResolvedValue({ data: '<html>Wrong route</html>' });
  await expect(fetchJoinedStudentTopics()).rejects.toThrow('Unable to load');
});
