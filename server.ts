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

  const dbAdmin = admin.firestore();

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // OTP Endpoints
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: "Valid email required" });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

      // Store OTP in Firestore for persistence across serverless environments
      await dbAdmin.collection('otps').doc(email.toLowerCase()).set({
        otp,
        expiry,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 🔥 OTP DEBUG LOG - VERY VISIBLE
      console.log("\n" + "=".repeat(30));
      console.log(`🔑 OTP FOR: ${email}`);
      console.log(`👉 CODE:    ${otp}`);
      console.log("=".repeat(30) + "\n");

      // Send OTP via EmailJS REST API
      const serviceId = process.env.EMAILJS_SERVICE_ID || 'service_swbnsgq';
      const templateId = process.env.EMAILJS_TEMPLATE_ID || 'template_ashsijc'; 
      const publicKey = process.env.EMAILJS_PUBLIC_KEY || 'vOnX0vXEzyWfWDgQL'; 
      const privateKey = process.env.EMAILJS_PRIVATE_KEY || 'GP8QbhOyjwCHLoOBtyra2'; 

      const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          accessToken: privateKey,
          template_params: {
            to_email: email,
            email: email,
            otp_code: otp,
            otp: otp,
            code: otp,
            app_name: 'WebbyLaunch'
          }
        })
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error("EmailJS Error:", errorText);
        return res.status(500).json({ 
          error: "Failed to send email", 
          debug: errorText 
        });
      }

      res.status(200).json({ success: true, message: "OTP sent to your email!" });
    } catch (err) {
      console.error("Send OTP Error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/send-otp", (req, res) => {
    res.status(405).json({ error: "Method not allowed. Please use POST." });
  });

  app.post("/api/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ error: "Email and OTP required" });
      }

      const docRef = dbAdmin.collection('otps').doc(email.toLowerCase());
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(400).json({ error: "No OTP found for this email. Please request a new one." });
      }

      const data = doc.data();
      if (!data) return res.status(400).json({ error: "Invalid OTP data" });

      if (Date.now() > data.expiry) {
        await docRef.delete();
        return res.status(400).json({ error: "OTP has expired. Please request a new one." });
      }

      if (data.otp === otp) {
        await docRef.delete(); // Clear after success
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: "Invalid OTP code" });
    } catch (err) {
      console.error("Verify OTP Error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/verify-otp", (req, res) => {
    res.status(405).json({ error: "Method not allowed. Please use POST." });
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
