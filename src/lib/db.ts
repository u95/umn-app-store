/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps as getFirebaseApps, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, Auth, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, Firestore, increment } from 'firebase/firestore';
import { AppModel, FirebaseConfigType } from '../types';
import { INITIAL_APPS } from '../data/initialApps';

const CONFIG_KEY = 'UMN_FIREBASE_CONFIG';
const LOCAL_DB_KEY = 'UMN_APPS_DB';
const ADMIN_USER_KEY = 'UMN_ADMIN_USER';

// Safe localStorage fallback interface for restricted/sandboxed iframe environments
class MemoryStorage {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
}

let safeStorage: {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

try {
  const testKey = '__storage_test__';
  window.localStorage.setItem(testKey, testKey);
  window.localStorage.removeItem(testKey);
  safeStorage = window.localStorage;
} catch (e) {
  console.warn("localStorage is not accessible (likely due to sandbox iframe restrictions). Falling back to in-memory store.");
  safeStorage = new MemoryStorage();
}

class DatabaseService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private firestore: Firestore | null = null;
  private config: FirebaseConfigType | null = null;
  private authListeners: ((user: { uid: string; email: string } | null) => void)[] = [];

  constructor() {
    this.loadConfig();
    this.initFirebase();
    this.initLocalDB();
  }

  // --- Configuration Management ---
  private loadConfig() {
    // 1. Try reading from Vite environment variables first (Standard production practice)
    const envConfig: FirebaseConfigType = {
      apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || '',
      authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || '',
    };

    if (envConfig.apiKey && !envConfig.apiKey.includes('placeholder')) {
      this.config = envConfig;
      console.log("Using Firebase config from environment variables.");
      return;
    }

    // 2. Fallback to LocalStorage (Useful for instant web-interface settings overrides)
    try {
      const saved = safeStorage.getItem(CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.apiKey && !parsed.apiKey.includes('MY_') && !parsed.apiKey.includes('placeholder')) {
          this.config = parsed;
          console.log("Using Firebase config from localStorage.");
        }
      }
    } catch (e) {
      console.error("Failed to parse saved Firebase config", e);
    }
  }

  public getFirebaseConfig(): FirebaseConfigType | null {
    return this.config;
  }

  public saveFirebaseConfig(config: FirebaseConfigType | null) {
    try {
      if (config) {
        safeStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      } else {
        safeStorage.removeItem(CONFIG_KEY);
      }
    } catch (e) {
      console.error("Failed to save Firebase config", e);
    }
    // Reload page to reinitialize
    window.location.reload();
  }

  public isFirebaseConnected(): boolean {
    return this.app !== null && this.firestore !== null && this.auth !== null;
  }

  // --- Initialization ---
  private initFirebase() {
    if (!this.config) return;

    try {
      // Check if already initialized to avoid re-init error
      const apps = getFirebaseApps();
      if (apps.length > 0) {
        this.app = apps[0];
      } else {
        this.app = initializeApp(this.config);
      }
      this.auth = getAuth(this.app);
      this.firestore = getFirestore(this.app);
      console.log("Firebase initialized successfully in database service.");
    } catch (e) {
      console.error("Firebase failed to initialize with provided config, falling back to local mode.", e);
      this.app = null;
      this.auth = null;
      this.firestore = null;
    }
  }

  private initLocalDB() {
    try {
      if (!safeStorage.getItem(LOCAL_DB_KEY)) {
        safeStorage.setItem(LOCAL_DB_KEY, JSON.stringify(INITIAL_APPS));
      }
    } catch (e) {
      console.error("Failed to initialize local DB in safeStorage", e);
    }
  }

  // --- Local Database Helpers ---
  private getLocalApps(): AppModel[] {
    try {
      const data = safeStorage.getItem(LOCAL_DB_KEY);
      return data ? JSON.parse(data) : INITIAL_APPS;
    } catch (e) {
      return INITIAL_APPS;
    }
  }

  private saveLocalApps(apps: AppModel[]) {
    try {
      safeStorage.setItem(LOCAL_DB_KEY, JSON.stringify(apps));
    } catch (e) {
      console.error("Failed to save local apps in safeStorage", e);
    }
  }

  // --- Unified App APIs ---
  public async getApps(): Promise<AppModel[]> {
    if (this.isFirebaseConnected() && this.firestore) {
      try {
        const querySnapshot = await getDocs(collection(this.firestore, 'apps'));
        const list: AppModel[] = [];
        querySnapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as AppModel);
        });
        
        // If Firestore is empty, seed it with initial apps for convenience
        if (list.length === 0) {
          console.log("Firestore 'apps' collection is empty. Seeding initial apps...");
          for (const app of INITIAL_APPS) {
            await setDoc(doc(this.firestore, 'apps', app.id), app);
            list.push(app);
          }
        }
        return list;
      } catch (e) {
        console.error("Failed to fetch from Firestore, falling back to local data.", e);
        return this.getLocalApps();
      }
    } else {
      // Simulate network latency for beautiful loading skeleton visibility
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.getLocalApps());
        }, 500);
      });
    }
  }

  public async getAppById(id: string): Promise<AppModel | null> {
    if (this.isFirebaseConnected() && this.firestore) {
      try {
        const docRef = doc(this.firestore, 'apps', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as AppModel;
        }
        return null;
      } catch (e) {
        console.error("Firestore getAppById failed, reading locally", e);
        const apps = this.getLocalApps();
        return apps.find(a => a.id === id) || null;
      }
    } else {
      const apps = this.getLocalApps();
      return apps.find(a => a.id === id) || null;
    }
  }

  public async addApp(appData: Omit<AppModel, 'id'>): Promise<string> {
    const id = appData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `app-${Date.now()}`;
    
    const newApp: AppModel = {
      ...appData,
      id,
      downloads: appData.downloads || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: appData.status || 'published',
      rating: appData.rating || 4.5
    };

    if (this.isFirebaseConnected() && this.firestore) {
      try {
        await setDoc(doc(this.firestore, 'apps', id), newApp);
        return id;
      } catch (e) {
        console.error("Firestore addApp failed, writing locally", e);
      }
    }

    const apps = this.getLocalApps();
    // Check if ID already exists
    const finalId = apps.some(a => a.id === id) ? `${id}-${Date.now()}` : id;
    newApp.id = finalId;
    apps.unshift(newApp);
    this.saveLocalApps(apps);
    return finalId;
  }

  public async updateApp(id: string, updatedData: Partial<AppModel>): Promise<void> {
    const cleanUpdate = {
      ...updatedData,
      updatedAt: new Date().toISOString()
    };

    if (this.isFirebaseConnected() && this.firestore) {
      try {
        const docRef = doc(this.firestore, 'apps', id);
        await updateDoc(docRef, cleanUpdate);
        return;
      } catch (e) {
        console.error("Firestore updateApp failed, updating locally", e);
      }
    }

    const apps = this.getLocalApps();
    const index = apps.findIndex(a => a.id === id);
    if (index !== -1) {
      apps[index] = { ...apps[index], ...cleanUpdate };
      this.saveLocalApps(apps);
    }
  }

  public async deleteApp(id: string): Promise<void> {
    if (this.isFirebaseConnected() && this.firestore) {
      try {
        await deleteDoc(doc(this.firestore, 'apps', id));
        return;
      } catch (e) {
        console.error("Firestore deleteApp failed, deleting locally", e);
      }
    }

    let apps = this.getLocalApps();
    apps = apps.filter(a => a.id !== id);
    this.saveLocalApps(apps);
  }

  public async incrementDownloads(id: string): Promise<void> {
    if (this.isFirebaseConnected() && this.firestore) {
      try {
        const docRef = doc(this.firestore, 'apps', id);
        await updateDoc(docRef, {
          downloads: increment(1)
        });
        return;
      } catch (e) {
        console.error("Firestore incrementDownloads failed, updating locally", e);
      }
    }

    const apps = this.getLocalApps();
    const index = apps.findIndex(a => a.id === id);
    if (index !== -1) {
      apps[index].downloads = (apps[index].downloads || 0) + 1;
      this.saveLocalApps(apps);
    }
  }

  // --- Authentication APIs ---
  public async login(email: string, password: string): Promise<{ uid: string; email: string }> {
    if (this.isFirebaseConnected() && this.auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
        const user = userCredential.user;
        return {
          uid: user.uid,
          email: user.email || email
        };
      } catch (e: any) {
        console.error("Firebase auth login failed", e);
        throw new Error(e.message || "Failed to log in via Firebase Authentication.");
      }
    } else {
      // Offline/Mock Auth Mode
      // We accept admin@umn.edu / admin123 as the default, but also allow custom mock login
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email === 'admin@umn.edu' && password === 'admin123') {
            const mockUser = { uid: 'mock-admin-id', email: 'admin@umn.edu' };
            try {
              safeStorage.setItem(ADMIN_USER_KEY, JSON.stringify(mockUser));
            } catch (e) {}
            this.notifyAuthListeners(mockUser);
            resolve(mockUser);
          } else if (email.startsWith('admin') && password.length >= 6) {
            // General admin logins are also supported for flexibility
            const mockUser = { uid: `mock-id-${Date.now()}`, email };
            try {
              safeStorage.setItem(ADMIN_USER_KEY, JSON.stringify(mockUser));
            } catch (e) {}
            this.notifyAuthListeners(mockUser);
            resolve(mockUser);
          } else {
            reject(new Error("Invalid email or password. Use: admin@umn.edu / admin123"));
          }
        }, 800);
      });
    }
  }

  public async logout(): Promise<void> {
    if (this.isFirebaseConnected() && this.auth) {
      try {
        await firebaseSignOut(this.auth);
      } catch (e) {
        console.error("Firebase logout failed", e);
      }
    }
    
    try {
      safeStorage.removeItem(ADMIN_USER_KEY);
    } catch (e) {}
    this.notifyAuthListeners(null);
  }

  public getCurrentUser(): { uid: string; email: string } | null {
    if (this.isFirebaseConnected() && this.auth) {
      const fbUser = this.auth.currentUser;
      if (fbUser) {
        return { uid: fbUser.uid, email: fbUser.email || '' };
      }
    }
    try {
      const saved = safeStorage.getItem(ADMIN_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  public subscribeToAuth(callback: (user: { uid: string; email: string } | null) => void): () => void {
    this.authListeners.push(callback);
    
    // Trigger initial value
    callback(this.getCurrentUser());

    let unsubscribeFirebase: (() => void) | null = null;
    if (this.isFirebaseConnected() && this.auth) {
      unsubscribeFirebase = onAuthStateChanged(this.auth, (user: FirebaseUser | null) => {
        if (user) {
          const u = { uid: user.uid, email: user.email || '' };
          try {
            safeStorage.setItem(ADMIN_USER_KEY, JSON.stringify(u));
          } catch (e) {}
          callback(u);
        } else {
          try {
            safeStorage.removeItem(ADMIN_USER_KEY);
          } catch (e) {}
          callback(null);
        }
      });
    }

    // Unsubscribe wrapper
    return () => {
      this.authListeners = this.authListeners.filter(cb => cb !== callback);
      if (unsubscribeFirebase) unsubscribeFirebase();
    };
  }

  private notifyAuthListeners(user: { uid: string; email: string } | null) {
    this.authListeners.forEach(cb => cb(user));
  }
}

export const dbService = new DatabaseService();
