import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'trello-backup-db';
const STORE_NAME = 'handles';
const HANDLE_KEY = 'backupDir';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore(STORE_NAME);
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

async function getStoredHandle() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(HANDLE_KEY);
    req.onsuccess = (e) => resolve(e.target.result ?? null);
    req.onerror = (e) => reject(e.target.error);
  });
}

async function storeHandle(handle) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(handle, HANDLE_KEY);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });
}

async function deleteStoredHandle() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).delete(HANDLE_KEY);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });
}

export function useBackup() {
  const isSupported = 'showDirectoryPicker' in window;
  const [dirHandle, setDirHandle] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  // Restore persisted handle on mount (only if permission is already granted)
  useEffect(() => {
    if (!isSupported) return;
    getStoredHandle().then(async (handle) => {
      if (!handle) return;
      const perm = await handle.queryPermission({ mode: 'readwrite' });
      if (perm === 'granted') setDirHandle(handle);
    }).catch(() => {});
  }, [isSupported]);

  const setBackupFolder = useCallback(async () => {
    if (!isSupported) return false;
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      await storeHandle(handle);
      setDirHandle(handle);
      return true;
    } catch (e) {
      if (e.name !== 'AbortError') console.error('Failed to set backup folder:', e);
      return false;
    }
  }, [isSupported]);

  const backup = useCallback(async (state) => {
    if (!dirHandle) return false;
    try {
      const perm = await dirHandle.queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted') {
        const newPerm = await dirHandle.requestPermission({ mode: 'readwrite' });
        if (newPerm !== 'granted') return false;
      }
      const fileHandle = await dirHandle.getFileHandle('trello-backup.json', { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(state, null, 2));
      await writable.close();
      setLastSaved(new Date());
      return true;
    } catch (e) {
      console.error('Auto-backup failed:', e);
      return false;
    }
  }, [dirHandle]);

  const clearBackupFolder = useCallback(async () => {
    await deleteStoredHandle();
    setDirHandle(null);
    setLastSaved(null);
  }, []);

  return {
    isSupported,
    hasFolder: !!dirHandle,
    folderName: dirHandle?.name ?? null,
    lastSaved,
    setBackupFolder,
    backup,
    clearBackupFolder,
  };
}
