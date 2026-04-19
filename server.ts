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
    // Remove wrapping quotes if they exist
    privateKey = privateKey.trim();
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      try {
        // Handle double-escaped keys by parsing as JSON string
        privateKey = JSON.parse(privateKey);
      } catch (e) {
        privateKey = privateKey.substring(1, privateKey.length - 1);
      }
    } else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
      privateKey = privateKey.substring(1, privateKey.length - 1);
    }
    
    // Replace literal \n strings with actual newline characters
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // Reformat to standard PEM if it looks like one
    if (privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      const header = '-----BEGIN PRIVATE KEY-----';
      const footer = '-----END PRIVATE KEY-----';
      
      let content = privateKey
        .substring(privateKey.indexOf(header) + header.length)
        .replace(footer, '')
        .replace(/\s/g, ''); // Remove all whitespace
        
      const lines = content.match(/.{1,64}/g) || [];
      privateKey = `${header}\n${lines.join('\n')}\n${footer}\n`;
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

  // Secure OTP Store
  interface OTP {
    hash: string;
    expires: number;
    attempts: number;
    lastSent: number;
  }
  const otpStore = new Map<string, OTP>();

  // Helper for SHA-256 hashing
  const hashOTP = (otp: string) => {
    return crypto.createHash('sha256').update(otp).digest('hex');
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/send-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const now = Date.now();
    const existing = otpStore.get(email);

    // Limit resend: 30 seconds
    if (existing && now < existing.lastSent + 30000) {
      const wait = Math.ceil((existing.lastSent + 30000 - now) / 1000);
      return res.status(429).json({ error: `Please wait ${wait} seconds before resending` });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = hashOTP(otp);
    const expires = now + 5 * 60 * 1000; // 5 minutes

    otpStore.set(email, { hash, expires, attempts: 0, lastSent: now });
    
    // Send via email if configuration exists
    const sendEmail = async () => {
      // 1. Try Resend first if available
      if (process.env.RESEND_API_KEY) {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
              from: process.env.RESEND_FROM_EMAIL || 'support@webbylaunch.com',
              to: [email],
              subject: 'Your OTP Code – WebbyLaunch',
              html: `
                <div style="font-family: 'Arial', sans-serif; background:#0f0f0f; padding:30px; color:#ffffff;">
                  <div style="max-width:500px; margin:auto; background:#1a1a1a; border-radius:12px; padding:25px; text-align:center;">
                    <h2 style="color:#c7c42a; margin-bottom:5px;">WebbyLaunch</h2>
                    <p style="font-size:13px; color:#aaa; margin-bottom:20px;">Secure OTP Verification</p>
                    <p style="font-size:14px; color:#ddd;">Hi,<br><br>Your verification code is:</p>
                    <div style="margin:25px 0; padding:15px; background:#000; border-radius:10px; border:1px solid #c7c42a;">
                      <span style="font-size:30px; letter-spacing:6px; font-weight:bold; color:#c7c42a;">${otp}</span>
                    </div>
                    <p style="font-size:13px; color:#bbb;">This code is valid for <b>5 minutes</b>.</p>
                    <p style="font-size:12px; color:#777; margin-top:15px;">If you didn’t request this, you can safely ignore this email.</p>
                    <hr style="border:none; border-top:1px solid #333; margin:20px 0;" />
                    <p style="font-size:11px; color:#555;">© 2026 WebbyLaunch. All rights reserved.</p>
                  </div>
                </div>
              `
            })
          });
          if (res.ok) {
            console.log(`[RESEND] Email sent to ${email}`);
            return true;
          }
        } catch (e) {
          console.error('[RESEND ERROR]', e);
        }
      }

      // 2. Try EmailJS if available (Secure REST API call)
      if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY) {
        try {
          const data = {
            service_id: process.env.EMAILJS_SERVICE_ID,
            template_id: process.env.EMAILJS_TEMPLATE_ID,
            user_id: process.env.EMAILJS_PUBLIC_KEY,
            accessToken: process.env.EMAILJS_PRIVATE_KEY, // Optional but recommended for server-side
            template_params: {
              otp: otp,
              to_email: email
            }
          };

          const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

          if (res.ok) {
            console.log(`[EMAILJS] Email sent to ${email}`);
            return true;
          } else {
            const err = await res.text();
            console.error('[EMAILJS ERROR RESPONSE]', err);
          }
        } catch (e) {
          console.error('[EMAILJS ERROR]', e);
        }
      }

      return false;
    };

    // Trigger email send (don't await to avoid blocking response)
    sendEmail().then(sent => {
      if (!sent) {
        console.log(`[SECURE OTP FALLBACK] Code for ${email}: ${otp}`);
      }
    });

    res.json({ success: true, message: "OTP sent successfully" });
  });

  app.post("/api/verify-otp", (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: "Email and code are required" });

    const stored = otpStore.get(email);
    if (!stored) return res.status(404).json({ error: "No OTP record found" });

    const now = Date.now();

    // Check expiry
    if (now > stored.expires) {
      otpStore.delete(email);
      return res.status(410).json({ error: "OTP has expired" });
    }

    // Check attempts limit (max 3)
    if (stored.attempts >= 3) {
      otpStore.delete(email);
      return res.status(429).json({ error: "Too many failed attempts. Please request a new OTP." });
    }

    const inputHash = hashOTP(code);

    if (stored.hash !== inputHash) {
      stored.attempts += 1;
      otpStore.set(email, stored);
      return res.status(401).json({ error: "Invalid OTP code", attemptsRemaining: 3 - stored.attempts });
    }

    // Success
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
