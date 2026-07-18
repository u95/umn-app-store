/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps as getFirebaseApps, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, Auth, User as FirebaseUser } from 'firebase/auth';
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

// Dynamically resolve full API URL for compiled standalone Android APKs and nested frames
export const getApiUrl = (path: string): string => {
  // Try retrieving a manually set host overriding standard defaults first
  try {
    const savedHost = safeStorage.getItem('UMN_API_HOST');
    if (savedHost) {
      return `${savedHost}${path}`;
    }
  } catch (e) {}

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  const defaultDeployedUrl = "https://ais-pre-lylxthadxlxgt6af2lv63x-944323294103.asia-southeast1.run.app";

  // If hosted on GitHub Pages or custom standalone external client, route directly to Cloud Run
  if (hostname.endsWith('github.io')) {
    return `${defaultDeployedUrl}${path}`;
  }

  // If running in a web browser context (with standard http/https), use standard relative paths
  // to ensure local dev server and sandbox previews work seamlessly on their respective hosts.
  if (protocol === 'http:' || protocol === 'https:') {
    return path;
  }

  return `${defaultDeployedUrl}${path}`;
};

class DatabaseService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private firestore: Firestore | null = null;
  private config: FirebaseConfigType | null = null;
  private authListeners: ((user: { uid: string; email: string } | null) => void)[] = [];
  private configLoadedPromise: Promise<void> | null = null;

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

  public async ensureConfigLoaded() {
    if (this.config) return;
    if (this.configLoadedPromise) return this.configLoadedPromise;

    this.configLoadedPromise = (async () => {
      try {
        const res = await fetch(getApiUrl("/api/config/firebase"));
        if (res.ok) {
          const serverConfig = await res.json();
          if (serverConfig && serverConfig.apiKey && !serverConfig.apiKey.includes('placeholder')) {
            this.config = serverConfig;
            this.initFirebase();
            console.log("Dynamically initialized Firebase from server config.");
          }
        }
      } catch (e) {
        console.warn("Failed to retrieve Firebase config from server, using local fallback", e);
      }
    })();

    return this.configLoadedPromise;
  }

  public getFirebaseConfig(): FirebaseConfigType | null {
    return this.config;
  }

  public async saveFirebaseConfig(config: FirebaseConfigType | null) {
    try {
      if (config) {
        safeStorage.setItem(CONFIG_KEY, JSON.stringify(config));
        
        // Also save on server for syncing to other devices
        await fetch(getApiUrl("/api/config/firebase"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config)
        }).catch((err) => {
          console.error("Failed to post config to server:", err);
        });
      } else {
        safeStorage.removeItem(CONFIG_KEY);
        // Clear on server
        await fetch(getApiUrl("/api/config/firebase"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey: "" })
        }).catch(() => {});
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

  private getCustomUserApps(): AppModel[] {
    try {
      const data = safeStorage.getItem('UMN_CUSTOM_USER_APPS');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  private saveCustomUserApps(apps: AppModel[]) {
    try {
      safeStorage.setItem('UMN_CUSTOM_USER_APPS', JSON.stringify(apps));
    } catch (e) {
      console.error("Failed to save custom user apps", e);
    }
  }

  // Helper utility to race an asynchronous promise against a timeout limit
  private async withTimeout<T>(promise: Promise<T>, ms = 3500): Promise<T> {
    let timeoutId: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${ms}ms`));
      }, ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => {
      clearTimeout(timeoutId);
    });
  }

  // --- Unified App APIs ---
  public async getApps(): Promise<AppModel[]> {
    await this.ensureConfigLoaded();
    if (this.isFirebaseConnected() && this.firestore) {
      try {
        const querySnapshot = await this.withTimeout(getDocs(collection(this.firestore, 'apps')));
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
        } else {
          // Dynamic self-healing: if any baseline apps from INITIAL_APPS are missing in Firestore, sync them!
          const existingIds = new Set(list.map(a => a.id));
          const missingApps = INITIAL_APPS.filter(app => !existingIds.has(app.id));
          if (missingApps.length > 0) {
            console.log(`Syncing ${missingApps.length} missing baseline apps to Firestore...`);
            for (const app of missingApps) {
              try {
                await setDoc(doc(this.firestore, 'apps', app.id), app);
                list.push(app);
              } catch (err) {
                console.error(`Failed to sync missing app ${app.id} to Firestore:`, err);
              }
            }
          }
        }
        return list;
      } catch (e) {
        console.error("Failed to fetch from Firestore, falling back to server database.", e);
        return this.getServerOrLocalApps();
      }
    } else {
      return this.getServerOrLocalApps();
    }
  }

  private async getServerOrLocalApps(): Promise<AppModel[]> {
    const customUserApps = this.getCustomUserApps();
    let baseApps: AppModel[] = [];

    try {
      const res = await fetch(getApiUrl("/api/apps"));
      if (res.ok) {
        baseApps = await res.json();
        this.saveLocalApps(baseApps);
      } else {
        baseApps = this.getLocalApps();
      }
    } catch (e) {
      console.warn("Failed to retrieve apps from server, fallback to local storage", e);
      baseApps = this.getLocalApps();
    }
    
    // Ensure all bundled baseline apps are available
    const baseIds = new Set(baseApps.map(a => a.id));
    const merged = [...baseApps];
    for (const app of INITIAL_APPS) {
      if (!baseIds.has(app.id)) {
        merged.push(app);
        baseIds.add(app.id);
      }
    }

    // Merge in any custom user apps that are saved locally but missing in server/base apps (due to server reset)
    for (const app of customUserApps) {
      if (!baseIds.has(app.id)) {
        merged.unshift(app); // Put custom user uploaded apps at the beginning
        baseIds.add(app.id);
      }
    }

    return merged;
  }

  public async getAppById(id: string): Promise<AppModel | null> {
    await this.ensureConfigLoaded();
    if (this.isFirebaseConnected() && this.firestore) {
      try {
        const docRef = doc(this.firestore, 'apps', id);
        const docSnap = await this.withTimeout(getDoc(docRef));
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as AppModel;
        }
        // If it exists in INITIAL_APPS but not Firestore, auto-sync it to Firestore!
        const baselineApp = INITIAL_APPS.find(a => a.id === id);
        if (baselineApp) {
          console.log(`Auto-syncing single missing app ${id} to Firestore...`);
          try {
            await setDoc(docRef, baselineApp);
            return baselineApp;
          } catch (err) {
            console.error(`Failed to auto-sync missing app ${id} to Firestore:`, err);
          }
        }
        return null;
      } catch (e) {
        console.error("Firestore getAppById failed, reading from server", e);
        return this.getServerOrLocalAppById(id);
      }
    } else {
      return this.getServerOrLocalAppById(id);
    }
  }

  private async getServerOrLocalAppById(id: string): Promise<AppModel | null> {
    try {
      const res = await fetch(getApiUrl(`/api/apps/${encodeURIComponent(id)}`));
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Failed to get app from server, fallback to local storage", e);
    }
    const custom = this.getCustomUserApps();
    const foundCustom = custom.find(a => a.id === id);
    if (foundCustom) return foundCustom;

    const apps = this.getLocalApps();
    return apps.find(a => a.id === id) || INITIAL_APPS.find(a => a.id === id) || null;
  }

  public async addApp(appData: Omit<AppModel, 'id'>): Promise<string> {
    await this.ensureConfigLoaded();
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

    // Save in local custom user apps backup to guarantee browser-level persistence across server restarts
    const customApps = this.getCustomUserApps();
    if (!customApps.some(a => a.id === id)) {
      customApps.unshift(newApp);
      this.saveCustomUserApps(customApps);
    }

    if (this.isFirebaseConnected() && this.firestore) {
      try {
        await setDoc(doc(this.firestore, 'apps', id), newApp);
        return id;
      } catch (e) {
        console.error("Firestore addApp failed, writing to server", e);
      }
    }

    try {
      const res = await fetch(getApiUrl("/api/apps"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newApp)
      });
      if (res.ok) {
        const savedApp = await res.json();
        return savedApp.id;
      }
    } catch (e) {
      console.warn("Failed to save app to server, saving locally", e);
    }

    const apps = this.getLocalApps();
    const finalId = apps.some(a => a.id === id) ? `${id}-${Date.now()}` : id;
    newApp.id = finalId;
    apps.unshift(newApp);
    this.saveLocalApps(apps);
    return finalId;
  }

  public async updateApp(id: string, updatedData: Partial<AppModel>): Promise<void> {
    await this.ensureConfigLoaded();
    const cleanUpdate = {
      ...updatedData,
      updatedAt: new Date().toISOString()
    };

    // Update in local custom user apps backup list
    const customApps = this.getCustomUserApps();
    const customIndex = customApps.findIndex(a => a.id === id);
    if (customIndex !== -1) {
      customApps[customIndex] = { ...customApps[customIndex], ...cleanUpdate };
      this.saveCustomUserApps(customApps);
    }

    if (this.isFirebaseConnected() && this.firestore) {
      try {
        const docRef = doc(this.firestore, 'apps', id);
        await updateDoc(docRef, cleanUpdate);
        return;
      } catch (e) {
        console.error("Firestore updateApp failed, updating on server", e);
      }
    }

    try {
      const res = await fetch(getApiUrl(`/api/apps/${encodeURIComponent(id)}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        return;
      }
    } catch (e) {
      console.warn("Failed to update app on server, updating locally", e);
    }

    const apps = this.getLocalApps();
    const index = apps.findIndex(a => a.id === id);
    if (index !== -1) {
      apps[index] = { ...apps[index], ...cleanUpdate };
      this.saveLocalApps(apps);
    }
  }

  public async deleteApp(id: string): Promise<void> {
    await this.ensureConfigLoaded();

    // Delete from local custom user apps backup list
    const customApps = this.getCustomUserApps();
    const filteredCustom = customApps.filter(a => a.id !== id);
    this.saveCustomUserApps(filteredCustom);

    if (this.isFirebaseConnected() && this.firestore) {
      try {
        await deleteDoc(doc(this.firestore, 'apps', id));
        return;
      } catch (e) {
        console.error("Firestore deleteApp failed, deleting on server", e);
      }
    }

    try {
      const res = await fetch(getApiUrl(`/api/apps/${encodeURIComponent(id)}`), {
        method: "DELETE"
      });
      if (res.ok) {
        return;
      }
    } catch (e) {
      console.warn("Failed to delete app from server, deleting locally", e);
    }

    let apps = this.getLocalApps();
    apps = apps.filter(a => a.id !== id);
    this.saveLocalApps(apps);
  }

  public async incrementDownloads(id: string): Promise<void> {
    await this.ensureConfigLoaded();
    if (this.isFirebaseConnected() && this.firestore) {
      try {
        const docRef = doc(this.firestore, 'apps', id);
        await updateDoc(docRef, {
          downloads: increment(1)
        });
        return;
      } catch (e) {
        console.error("Firestore incrementDownloads failed, incrementing on server", e);
      }
    }

    try {
      const res = await fetch(getApiUrl(`/api/apps/${encodeURIComponent(id)}/download`), {
        method: "POST"
      });
      if (res.ok) {
        return;
      }
    } catch (e) {
      console.warn("Failed to increment downloads on server, incrementing locally", e);
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
    await this.ensureConfigLoaded();
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

  public async register(email: string, password: string): Promise<{ uid: string; email: string }> {
    await this.ensureConfigLoaded();
    if (this.isFirebaseConnected() && this.auth) {
      try {
        const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
        const user = userCredential.user;
        return {
          uid: user.uid,
          email: user.email || email
        };
      } catch (e: any) {
        console.error("Firebase auth registration failed", e);
        throw new Error(e.message || "Failed to register via Firebase Authentication.");
      }
    } else {
      // Offline/Mock Auth Mode
      throw new Error("Registration is only supported when connected to a custom Firebase project. For sandbox/local testing, any email starting with 'admin' is pre-authorized (e.g. admin@umn.edu / admin123).");
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
