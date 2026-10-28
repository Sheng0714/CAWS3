import axios from 'axios';
import { fetchWritingScope, readWritingSelection } from './writingScopeService';

jest.mock('axios', () => ({ get: jest.fn() }));
jest.mock('../utils/urlConfig', () => ({ __esModule: true, default: { backendHost: '/' } }));

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

test('loads the authoritative student/class/topic using the selected activity and group IDs', async () => {
  localStorage.setItem('userId', '42');
  localStorage.setItem('jwtToken', 'student-token');
  const selection = { activityId: '1', groupId: '2', className: 'Stale class', theme: '' };
  const scope = { studentName: 'Student', className: 'Class A', theme: 'Topic A' };
  axios.get.mockResolvedValue({ data: { success: true, data: scope } });
  await expect(fetchWritingScope(selection)).resolves.toEqual(scope);
  expect(axios.get).toHaveBeenCalledWith('/api/activities/myJoined/42/writing-scope', {
    params: selection, headers: { Authorization: 'Bearer student-token' }, timeout: 15000,
  });
});

test('reads cached selection aliases and restores missing IDs from the session', () => {
  localStorage.setItem('groupId', 'undefined');
  localStorage.setItem('selectedClassName', 'Class A');
  localStorage.setItem('selectedTopicName', 'Topic A');
  sessionStorage.setItem('activityId', '1');
  sessionStorage.setItem('groupId', '2');
  expect(readWritingSelection()).toEqual({ activityId: '1', groupId: '2', className: 'Class A', theme: 'Topic A' });
});

test('does not attempt a request without a logged-in user', async () => {
  await expect(fetchWritingScope({})).rejects.toThrow('登入');
  expect(axios.get).not.toHaveBeenCalled();
});

test.each([{ studentName: 'Student', className: 'Class A' }, null])('rejects incomplete scope instead of saving under cached names', async (scope) => {
  localStorage.setItem('userId', '42');
  axios.get.mockResolvedValue({ data: { success: true, data: scope } });
  await expect(fetchWritingScope({ activityId: '1', groupId: '2' })).rejects.toThrow('班級與主題');
});
