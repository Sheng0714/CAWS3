import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { JoinActivityForm } from './JoinActivityForm';

jest.mock('axios', () => ({ put: jest.fn(), get: jest.fn(), post: jest.fn() }));
jest.mock('../utils/urlConfig', () => ({ __esModule: true, default: { backendHost: '/' } }));

const originalLocation = window.location;
const joinedActivities = [{
  ActivityGroup: {
    Activity: { title: '1142B' },
    Group: { joinCode: '12345', groupName: 'AI 學習' },
  },
}];

beforeAll(() => {
  delete window.location;
  window.location = { ...originalLocation, reload: jest.fn() };
});

afterAll(() => {
  window.location = originalLocation;
});

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('userId', '42');
  localStorage.setItem('name', '測試學生');
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  axios.put.mockResolvedValue({ data: { group: { groupName: 'AI 學習' } } });
  axios.get
    .mockResolvedValueOnce({ data: joinedActivities, headers: { 'x-notion-sync-status': 'success' } })
    .mockResolvedValueOnce({ data: { jwtToken: 'renewed-token' } });
});

afterEach(() => {
  jest.restoreAllMocks();
});

function submitInvitationCode(callback = jest.fn()) {
  render(<JoinActivityForm callback_setActivities={callback} />);
  fireEvent.click(screen.getByRole('button', { name: /join topic/i }));
  fireEvent.change(screen.getByRole('textbox'), { target: { name: 'joinCode', value: ' 12345 ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Join' }));
  return callback;
}

test('joining writes the selected class/topic and waits for Notion before reloading', async () => {
  let finishSaving;
  axios.get.mockReset();
  axios.get
    .mockImplementationOnce(() => new Promise((resolve) => { finishSaving = resolve; }))
    .mockResolvedValueOnce({ data: { jwtToken: 'renewed-token' } });
  const callback = submitInvitationCode();

  await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/activities/myJoined/42', { headers: {} }));
  expect(callback).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Joining...' }).disabled).toBe(true);
  expect(window.alert).not.toHaveBeenCalled();
  expect(window.location.reload).not.toHaveBeenCalled();

  await act(async () => finishSaving({ data: joinedActivities, headers: { 'x-notion-sync-status': 'success' } }));

  await waitFor(() => expect(window.location.reload).toHaveBeenCalledTimes(1));
  expect(callback).toHaveBeenCalledWith(joinedActivities);
  expect(axios.post).not.toHaveBeenCalled();
  expect(localStorage.getItem('jwtToken')).toBe('renewed-token');
  expect(window.alert).toHaveBeenCalledWith('Successfully joined the topic!');
});

test('a failed Notion save reports the partial success without reloading', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  axios.get.mockReset();
  axios.get
    .mockResolvedValueOnce({ data: joinedActivities, headers: { 'x-notion-sync-status': 'failed' } })
    .mockResolvedValueOnce({ data: { jwtToken: 'renewed-token' } });
  const callback = submitInvitationCode();

  await waitFor(() => expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('saving the class/topic to Notion failed')));
  expect(callback).toHaveBeenCalledWith(joinedActivities);
  expect(window.location.reload).not.toHaveBeenCalled();
  expect(axios.put).toHaveBeenCalledTimes(1);
});

test('an invalid invitation code does not write a Notion record', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  axios.put.mockRejectedValue(new Error('Group not found'));
  submitInvitationCode();

  await waitFor(() => expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('check the invitation code')));
  expect(axios.post).not.toHaveBeenCalled();
  expect(window.location.reload).not.toHaveBeenCalled();
});
