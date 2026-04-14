import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import admin from 'firebase-admin';
import { Resend } from 'resend';
import firebaseConfig from './firebase-applet-config.json';

dotenv.config();

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Initialize Firebase Admin
if (!admin.apps.length) {
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;

  let privateKey = rawKey ? rawKey.replace(/\\n/g, '\n').trim() : undefined;
  
  // Handle case where the key might be wrapped in quotes from the environment
  if (privateKey && privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.substring(1, privateKey.length - 1).replace(/\\n/g, '\n').trim();
  }

  // Only attempt cert initialization if we have a key that looks like a PEM key
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
    
    if (resend) {
      try {
        await resend.emails.send({
          from: "WebbyLaunch <onboarding@resend.dev>",
          to: email,
          subject: "Your WebbyLaunch Verification Code",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 16px;">
              <h1 style="color: #6366F1; font-size: 24px; font-weight: bold; margin-bottom: 16px;">Verify your email</h1>
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 24px;">Use the following code to sign in to your WebbyLaunch account. This code will expire in 10 minutes.</p>
              <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111827;">
                ${code}
              </div>
              <p style="color: #9ca3af; font-size: 14px; margin-top: 32px;">If you didn't request this code, you can safely ignore this email.</p>
            </div>
          `,
        });
        res.json({ success: true, message: "OTP sent successfully to your email" });
      } catch (error) {
        console.error("Resend error:", error);
        res.status(500).json({ error: "Failed to send email. Please check server logs." });
      }
    } else {
      console.warn("RESEND_API_KEY not found. OTP logged to console only.");
      res.json({ success: true, message: "OTP sent successfully (check server logs for demo)" });
    }
  });

  app.post("/api/send-email", async (req, res) => {
    const { to, subject, html } = req.body;
    
    if (!resend) {
      return res.status(500).json({ error: "Resend is not configured. Please add RESEND_API_KEY to secrets." });
    }

    try {
      const data = await resend.emails.send({
        from: "WebbyLaunch <onboarding@resend.dev>",
        to: to || "user@example.com",
        subject: subject || "Welcome to WebbyLaunch",
        html: html || "<h1>Your project is ready 🚀</h1>",
      });

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error });
    }
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
