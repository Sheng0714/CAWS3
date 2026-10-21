import { useCallback, useEffect, useRef, useState } from 'react';
import { syncRagflowChatHistoryToNotion } from './ragflowChatHistory';

export default function useNotionChatHistorySync(scope) {
  const [notionSyncError, setNotionSyncError] = useState('');
  const [isNotionSyncing, setIsNotionSyncing] = useState(false);
  const requestNumber = useRef(0);
  const syncChatHistory = useCallback(async () => {
    const currentRequest = ++requestNumber.current;
    setIsNotionSyncing(true);
    setNotionSyncError('');
    try {
      await syncRagflowChatHistoryToNotion(scope);
      return true;
    } catch (error) {
      if (requestNumber.current === currentRequest) {
        setNotionSyncError(error?.response?.data?.error || 'Chat history is kept in this browser, but saving it to Notion failed.');
      }
      return false;
    } finally {
      if (requestNumber.current === currentRequest) setIsNotionSyncing(false);
    }
  }, [scope]);

  useEffect(() => {
    const retry = () => { void syncChatHistory(); };
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [syncChatHistory]);

  return { syncChatHistory, notionSyncError, isNotionSyncing };
}
