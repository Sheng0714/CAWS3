import { useCallback, useEffect, useRef, useState } from 'react';
import {
  readPendingToolkitSnapshot,
  savePendingToolkitSnapshot,
  syncToolkitSnapshotToNotion,
} from './ragflowChatHistory';

export default function useNotionToolkitSync(scope) {
  const [toolkitSyncError, setToolkitSyncError] = useState('');
  const [isToolkitSyncing, setIsToolkitSyncing] = useState(false);
  const saveQueue = useRef(Promise.resolve());
  const requestNumber = useRef(0);

  const syncToolkit = useCallback(async (payload) => {
    const currentRequest = ++requestNumber.current;
    setIsToolkitSyncing(true);
    setToolkitSyncError('');
    try {
      // Keep unsaved content across reloads and serialize writes so an older
      // response cannot overwrite the student's newer summary.
      const pending = savePendingToolkitSnapshot(payload);
      const request = saveQueue.current.then(() => syncToolkitSnapshotToNotion(pending));
      saveQueue.current = request.catch(() => {});
      await request;
      return true;
    } catch (error) {
      if (requestNumber.current === currentRequest) {
        setToolkitSyncError('Your summary or outline is kept in this browser, but saving it failed. Please retry importing.');
      }
      return false;
    } finally {
      if (requestNumber.current === currentRequest) setIsToolkitSyncing(false);
    }
  }, []);

  const retryToolkitSync = useCallback(() => {
    const pending = readPendingToolkitSnapshot(scope);
    return pending ? syncToolkit(pending) : Promise.resolve(true);
  }, [scope, syncToolkit]);

  useEffect(() => {
    void retryToolkitSync();
    const retry = () => { void retryToolkitSync(); };
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [retryToolkitSync]);

  return { syncToolkit, retryToolkitSync, toolkitSyncError, isToolkitSyncing };
}
