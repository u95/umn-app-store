import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import { INITIAL_APPS } from "./src/data/initialApps";
import { AppModel } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API Client safely (Lazy / conditional on start to prevent crash if not set)
let aiClient: GoogleGenAI | null = null;
const getAiClient = (): GoogleGenAI => {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Please define it in your environment variables via Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
};

// Check if AI is enabled
app.get("/api/ai/enabled", (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    res.json({ enabled: !!apiKey });
  } catch (e) {
    res.json({ enabled: false });
  }
});

// App Store Chatbot Assistant
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getAiClient();
    
    // System instruction to guide the AI chatbot
    const systemInstruction = `You are "UMN AI Companion", an intelligent, polite, and friendly AI assistant for the UMN App Store (an Android Play Store inspired applet for UMN Ministry and student community).
Your goal is to help users explore apps, understand how to download/install APKs, and provide usage support.
Key instructions:
- You must always respond primarily in Tamil (தமிழ்) and English (as a hybrid or matching the user's language). If the user speaks in Tamil, respond in fluent, polite, and elegant Tamil.
- Introduce yourself as "UMN AI Companion" (UMN விளையாட்டுக் கூடத்தின் செயற்கை நுண்ணறிவு உதவியாளர்).
- You have detailed knowledge of the initial apps in the catalog:
  1. "UMN Holy Bible Daily" (Category: Bible, APK Link: https://github.com/umnministry/bible-app/releases/download/v2.1.0/umn-bible-daily.apk): Features devotional readings, offline Scripture, highlighting, and search in elegant typography.
  2. "UMN Hymnal & Praise" (Category: Music, APK Link: https://github.com/umnministry/hymnal-praise/releases/download/v3.0.1/hymnal-praise.apk): Over 2,000 hymns, interactive chords, sheet music, transposable keys.
  3. "Christian Trivia Quest" (Category: Games, APK Link: https://github.com/umnministry/trivia-quest/releases/download/v1.0.5/trivia-quest.apk): Quiz quest spanning Old/New Testament, church history, global leaderboards.
  4. "UMN Study Connect" (Category: Education, APK Link: https://github.com/umnministry/study-connect/releases/download/v1.4.2/umn-study-connect.apk): Official academic companion to locate study groups, notes, assignments.
  
- If a user asks "Image URL எப்படி சேர்ப்பது" (How to add Image URL), explain step-by-step in Tamil:
  1. Upload your screenshot/image to a public hosting site like Imgur, Unsplash, postimages, or use any public image URL ending in .png, .jpg, or .jpeg.
  2. Log in to the "Console" with the email (admin@umn.edu) and password (admin123).
  3. Go to the "Play Console" Dashboard.
  4. Click "Upload New App" or Edit an existing one.
  5. Enter the public image link in the "App Icon URL" or "Screenshots (comma-separated)" fields.
  6. Click "Publish App" and it will immediately display on the App Store home screen.

- If a user asks about installing the App Store as an APK/App ("எப்படி பயன்படுத்துவது" or "ஏபிகே பைலாக" - how to use or as an APK file), explain in Tamil:
  1. Inform them they can install this entire UMN App Store website directly on their Android phone as a Progressive Web App (PWA) which acts exactly like a native APK.
  2. To do this, click the brand new "Install App Store (செயலியை நிறுவு)" button added in the top header or bottom footer of the screen.
  3. Or on their Android Chrome browser, click the three dots (...) and select "Add to Home screen" (முகப்புத் திரையில் சேர்).
  4. Once added, it will run as a full-screen, offline-supported mobile app with its own beautiful launcher icon!

Always keep your replies friendly, structured with clear bullet points, visually elegant, and encouraging.`;

    // Construct contents for generateContent
    const contents = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const h of chatHistory) {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        });
      }
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ response: response.text });
  } catch (error: any) {
    console.error("AI Chatbot Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with Gemini AI." });
  }
});

// App description/metadata generator for Publisher Portal (Admin dashboard)
app.post("/api/ai/generate-description", async (req, res) => {
  try {
    const { name, category, features } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: "App Name and Category are required to generate descriptions." });
    }

    const ai = getAiClient();
    const prompt = `Write a compelling, professional, and visually stunning app description for an Android App Store listing in English.
App Details:
- Name: ${name}
- Category: ${category}
- Key Highlights / Features requested: ${features || "General Android app utilities"}

The description should include:
1. An exciting hook paragraph explaining the app's core purpose.
2. A bulleted list of 4 key features with elegant, premium-sounding sub-headers.
3. A friendly closing message welcoming users to try it.

Make it sound professional, modern, and in line with high-quality Play Store editorial guidelines.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.8,
      },
    });

    res.json({ description: response.text });
  } catch (error: any) {
    console.error("AI Description Generator Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with Gemini AI." });
  }
});

// --- Server-Side Persistent JSON Database for UMN Play Store ---
const DB_FILE_PATH = path.join(process.cwd(), "apps_db.json");

// Helper to get all apps
function getAppsFromDb(): AppModel[] {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading apps DB file, using fallback:", error);
  }
  
  // Seed file if it doesn't exist
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(INITIAL_APPS, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to seed apps DB file:", e);
  }
  return INITIAL_APPS as AppModel[];
}

// Helper to save all apps
function saveAppsToDb(apps: AppModel[]) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(apps, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing apps DB file:", error);
  }
}

// 1. Get all apps
app.get("/api/apps", (req, res) => {
  try {
    const apps = getAppsFromDb();
    res.json(apps);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to load apps" });
  }
});

// 2. Get app by ID
app.get("/api/apps/:id", (req, res) => {
  try {
    const apps = getAppsFromDb();
    const appItem = apps.find(a => a.id === req.params.id);
    if (!appItem) {
      return res.status(404).json({ error: "App not found" });
    }
    res.json(appItem);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to retrieve app" });
  }
});

// 3. Add app
app.post("/api/apps", (req, res) => {
  try {
    const appData = req.body;
    if (!appData.name || !appData.developer || !appData.category) {
      return res.status(400).json({ error: "Name, developer, and category are required." });
    }
    
    const id = appData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `app-${Date.now()}`;
    const apps = getAppsFromDb();
    
    // Ensure unique ID
    let finalId = id;
    if (apps.some(a => a.id === id)) {
      finalId = `${id}-${Date.now()}`;
    }
    
    const newApp: AppModel = {
      ...appData,
      id: finalId,
      downloads: appData.downloads || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: appData.status || 'published',
      rating: appData.rating || 4.5
    };
    
    apps.unshift(newApp);
    saveAppsToDb(apps);
    res.status(201).json(newApp);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to save app" });
  }
});

// 4. Update app
app.put("/api/apps/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const apps = getAppsFromDb();
    
    const index = apps.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "App not found" });
    }
    
    const cleanUpdate = {
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    apps[index] = { ...apps[index], ...cleanUpdate };
    saveAppsToDb(apps);
    res.json(apps[index]);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to update app" });
  }
});

// 5. Delete app
app.delete("/api/apps/:id", (req, res) => {
  try {
    const { id } = req.params;
    let apps = getAppsFromDb();
    
    const index = apps.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "App not found" });
    }
    
    apps = apps.filter(a => a.id !== id);
    saveAppsToDb(apps);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to delete app" });
  }
});

// 6. Download (Increment Downloads)
app.post("/api/apps/:id/download", (req, res) => {
  try {
    const { id } = req.params;
    const apps = getAppsFromDb();
    
    const index = apps.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "App not found" });
    }
    
    apps[index].downloads = (apps[index].downloads || 0) + 1;
    saveAppsToDb(apps);
    res.json(apps[index]);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Failed to increment download count" });
  }
});

// Vite middleware for development or Static Assets for production and server listener
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static assets with tailored caching strategies
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html') || filePath.endsWith('sw.js') || filePath.endsWith('manifest.json')) {
          // Never cache entry-point scripts or HTML, ensuring instant PWA updates
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        } else {
          // Fingerprinted asset bundles can be safely cached for 1 year
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));

    // In Express v4, use get('*')
    app.get("*", (req, res) => {
      // If the request points to a non-existent asset or static file, return 404 instead of index.html.
      // This completely prevents the "Unexpected token '<'" / Blank Screen error when older index.html files request deleted JS chunks.
      // We exclude .html files so that index.html or multi-page redirections aren't treated as missing assets.
      const isAsset = (req.path.startsWith('/assets/') || (req.path.includes('.') && !req.path.endsWith('.html'))) && !req.path.endsWith('/sw.js') && !req.path.endsWith('/manifest.json');
      if (isAsset) {
        res.status(404).send('Not Found');
      } else {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        res.sendFile(path.join(distPath, "index.html"));
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
