import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import admin from 'firebase-admin';
import firebaseConfig from './firebase-applet-config.json';

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  if (clientEmail) {
    clientEmail = clientEmail.trim().replace(/^["']|["']$/g, '');
  }
  const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;

  let privateKey = rawKey;
  if (privateKey) {
    // Remove wrapping quotes if they exist
    privateKey = privateKey.trim();
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.substring(1, privateKey.length - 1);
    } else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
      privateKey = privateKey.substring(1, privateKey.length - 1);
    }
    
    // Replace literal \n strings with actual newline characters
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // Ensure the key has the correct PEM structure if it's flattened
    if (privateKey.includes('-----BEGIN PRIVATE KEY-----') && !privateKey.includes('\n', privateKey.indexOf('-----BEGIN PRIVATE KEY-----') + 25)) {
      // It looks like a flattened key (no newlines after the header)
      privateKey = privateKey
        .replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
        .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
    }
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
  
  // In-memory OTP store (for demo purposes)
  const otpStore = new Map<string, { code: string, expires: number }>();

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/send-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email, { code, expires });
    
    console.log(`[OTP] Code for ${email}: ${code}`);
    
    res.json({ success: true, message: "OTP logged to console (Email verification disabled)" });
  });

  app.post("/api/verify-otp", (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: "Email and code are required" });

    const stored = otpStore.get(email);
    if (!stored) return res.status(400).json({ error: "No OTP found for this email" });

    if (Date.now() > stored.expires) {
      otpStore.delete(email);
      return res.status(400).json({ error: "OTP has expired" });
    }

    if (stored.code !== code) {
      return res.status(400).json({ error: "Invalid OTP code" });
    }

    otpStore.delete(email);
    res.json({ success: true, message: "OTP verified successfully" });
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
