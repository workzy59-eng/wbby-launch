import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import admin from 'firebase-admin';
import crypto from "crypto";
import firebaseConfig from './firebase-applet-config.json';

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  if (clientEmail) {
    clientEmail = clientEmail.trim().replace(/^["']|["']$/g, '');
  }
  let projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;
  if (projectId) {
    projectId = projectId.trim().replace(/^["']|["']$/g, '');
  }

  let privateKey = rawKey;
  if (privateKey) {
    // 1. Basic trim and quote removal
    privateKey = privateKey.trim();
    if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || 
        (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
      privateKey = privateKey.slice(1, -1);
    }
    
    // 2. Critical: Replace literal \n with real newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // 3. If it's a multi-line string with dashes, it's ready. 
    // No more aggressive regex reformatting to avoid truncating the key.
  }
  
  const hasValidKey = privateKey && privateKey.includes('-----BEGIN PRIVATE KEY-----');
  const hasClientEmail = clientEmail && clientEmail.includes('@');

  if (hasValidKey && hasClientEmail) {
    try {
      console.log(`Initializing Firebase Admin for project: ${projectId} with client email: ${clientEmail}`);
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: firebaseConfig.storageBucket
      });
      console.log("Firebase Admin initialized successfully with cert");
    } catch (initErr: any) {
      console.error("Firebase Admin initialization error (cert):", initErr.message || initErr);
      // Fallback to application default if cert fails
      try {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          storageBucket: firebaseConfig.storageBucket
        });
        console.log("Firebase Admin initialized with application default (fallback)");
      } catch (fallbackErr) {
        console.error("Firebase Admin fallback initialization failed:", fallbackErr);
      }
    }
  } else {
    try {
      console.log("No valid service account credentials found. Attempting application default initialization...");
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: firebaseConfig.storageBucket
      });
      console.log("Firebase Admin initialized with application default");
    } catch (initErr: any) {
      console.warn("Firebase Admin application default initialization failed. Admin features may be unavailable.");
      console.warn("To enable Admin features, please provide FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL in secrets.");
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // In-memory OTP store (email -> { otp, expiry })
  // Using global to persist across potential server restarts during development
  (global as any).otpStore = (global as any).otpStore || {};

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // OTP Endpoints
  app.post("/api/send-otp", (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: "Valid email required" });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP with 5-minute expiry
      (global as any).otpStore[email.toLowerCase()] = {
        otp,
        expiry: Date.now() + 5 * 60 * 1000
      };

      // 🔥 OTP DEBUG LOG - VERY VISIBLE
      console.log("\n" + "=".repeat(30));
      console.log(`🔑 OTP FOR: ${email}`);
      console.log(`👉 CODE:    ${otp}`);
      console.log("=".repeat(30) + "\n");

      res.status(200).json({ success: true, message: "OTP sent (check server logs for code)" });
    } catch (err) {
      console.error("Send OTP Error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/verify-otp", (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ error: "Email and OTP required" });
      }

      const stored = (global as any).otpStore[email.toLowerCase()];

      if (!stored) {
        return res.status(400).json({ error: "No OTP found for this email. Please request a new one." });
      }

      if (Date.now() > stored.expiry) {
        delete (global as any).otpStore[email.toLowerCase()];
        return res.status(400).json({ error: "OTP has expired. Please request a new one." });
      }

      if (stored.otp === otp) {
        delete (global as any).otpStore[email.toLowerCase()]; // Clear after success
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: "Invalid OTP code" });
    } catch (err) {
      console.error("Verify OTP Error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // LEGACY OTP - Help debug cached JS bundles
  app.post("/api/send-otp", (req, res) => {
    console.warn("LEGACY API HIT: /api/send-otp. This app now uses Frontend-Only OTP. Please HARD REFRESH your browser (Ctrl+F5/Cmd+Shift+R).");
    res.status(410).json({ error: "API DEPRECATED: Please hard reload your browser (Ctrl+F5) to use the new frontend OTP logic." });
  });

  app.post("/api/verify-otp", (req, res) => {
    res.status(410).json({ error: "API DEPRECATED: Please hard reload your browser (Ctrl+F5) to use the new frontend OTP logic." });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
