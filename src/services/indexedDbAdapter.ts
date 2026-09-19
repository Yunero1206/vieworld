/**
 * VieWorld IndexedDB Storage Adapter
 * Provides high-capacity, asynchronous client-side storage
 * to eliminate the 5MB/10MB synchronous localStorage limit.
 */

const DB_NAME = 'vieworld_db';
const DB_VERSION = 1;
export const STORE_TENANT_STATE = 'tenant_state';
export const STORE_CAPSULES = 'capsules';
export const STORE_CHAT = 'chat_history';

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase | null> | null = null;

function isIndexedDbAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

/**
 * Opens or initializes the IndexedDB database instance
 */
export async function getDb(): Promise<IDBDatabase | null> {
  if (!isIndexedDbAvailable()) return null;
  if (dbInstance) return dbInstance;
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_TENANT_STATE)) {
          db.createObjectStore(STORE_TENANT_STATE, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(STORE_CAPSULES)) {
          db.createObjectStore(STORE_CAPSULES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_CHAT)) {
          db.createObjectStore(STORE_CHAT, { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = () => {
        dbInstance = request.result;
        resolve(dbInstance);
      };

      request.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });

  return dbPromise;
}

/**
 * Asynchronously retrieves a value from IndexedDB
 */
export async function idbGet<T>(storeName: string, key: string): Promise<T | null> {
  const db = await getDb();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve(req.result ? req.result.data : null);
      };
      req.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

/**
 * Asynchronously stores a value into IndexedDB
 */
export async function idbSet<T>(storeName: string, key: string, data: T): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put({ key, data, updatedAt: new Date().toISOString() });

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Asynchronously clears data for a specific key
 */
export async function idbDelete(storeName: string, key: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Aliases and additional async helpers conforming to implementation plan
 */
export async function getAsync<T>(storeName: string, key: string): Promise<T | null> {
  return idbGet<T>(storeName, key);
}

export async function setAsync<T>(storeName: string, key: string, data: T): Promise<boolean> {
  return idbSet<T>(storeName, key, data);
}

export async function clearTenantAsync(tenantId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_TENANT_STATE, 'readwrite');
      const store = tx.objectStore(STORE_TENANT_STATE);
      const req = store.openCursor();
      req.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const key = String(cursor.key);
          if (key.includes(tenantId)) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve(true);
        }
      };
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

