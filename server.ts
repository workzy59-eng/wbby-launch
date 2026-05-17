import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import admin from 'firebase-admin';
import crypto from "crypto";
import Razorpay from "razorpay";
import firebaseConfig from './firebase-applet-config.json';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { google } from 'googleapis';

dotenv.config();

// Google OAuth Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `${process.env.APP_URL}/api/auth/google/callback`
);

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.VITE_CLOUDINARY_API_SECRET
});

// Configure Multer for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    return {
      folder: 'webbylaunch',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'pdf', 'doc', 'docx', 'txt'],
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
    };
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

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
    // Basic sanitization
    privateKey = privateKey.trim();
    
    // Remove surrounding quotes if they exist (could be double or single)
    while ((privateKey.startsWith('"') && privateKey.endsWith('"')) || 
           (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
      privateKey = privateKey.slice(1, -1).trim();
    }
    
    // Replace literal \n with real newlines (handle both \n and \\n)
    privateKey = privateKey.replace(/\\n/g, '\n').replace(/\\n/g, '\n');
    
    // Ensure the header and footer are correctly formatted with newlines
    if (privateKey.includes('BEGIN PRIVATE KEY')) {
      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        // Fix missing dashes if present
        privateKey = privateKey.replace(/.*BEGIN PRIVATE KEY.*/, '-----BEGIN PRIVATE KEY-----');
      }
      
      // Ensure newline after header
      if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----\n')) {
        privateKey = privateKey.replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n');
      }
      
      // Ensure newline before footer
      if (privateKey.includes('-----END PRIVATE KEY-----') && !privateKey.includes('\n-----END PRIVATE KEY-----')) {
        privateKey = privateKey.replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
      }
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
          privateKey: privateKey!,
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

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
  });

  // API Routes
  const apiRouter = express.Router();
  
  apiRouter.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Google Calendar Integration Routes
  apiRouter.get("/auth/google/url", (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID required" });

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      state: String(userId)
    });
    res.json({ url });
  });

  apiRouter.get("/auth/google/callback", async (req, res) => {
    const { code, state: userId } = req.query;
    if (!code || !userId) return res.status(400).send("Missing code or state");

    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      
      // Save tokens to Firestore
      if (tokens.refresh_token) {
        await dbAdmin.collection('users').doc(String(userId)).update({
          googleCalendarEnabled: true,
          googleRefreshToken: tokens.refresh_token,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        await dbAdmin.collection('users').doc(String(userId)).update({
          googleCalendarEnabled: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      res.send(`
        <html>
          <body style="background: #111; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
            <div style="text-align: center; background: #222; padding: 2rem; border-radius: 2rem; border: 1px solid #c7c42a;">
              <h2 style="color: #c7c42a;">Sync Authorized!</h2>
              <p>Your calendar is now connected.</p>
              <button onclick="window.close()" style="background: #c7c42a; border: none; padding: 0.8rem 2rem; border-radius: 1rem; color: black; font-weight: bold; cursor: pointer;">Close Window</button>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS' }, '*');
                setTimeout(() => window.close(), 2000);
              }
            </script>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Google Auth Callback Error:", error);
      res.status(500).send("Authentication failed: " + error.message);
    }
  });

  apiRouter.post("/meetings/sync-google", async (req, res) => {
    const { meetingId, userId } = req.body;
    if (!meetingId || !userId) return res.status(400).json({ error: "Missing data" });

    try {
      const userDoc = await dbAdmin.collection('users').doc(userId).get();
      const userData = userDoc.data();
      const refreshToken = userData?.googleRefreshToken;

      if (!refreshToken) {
        return res.status(404).json({ error: "Google Calendar not connected" });
      }

      const meetingDoc = await dbAdmin.collection('meetings').doc(meetingId).get();
      const meeting = meetingDoc.data();

      if (!meeting) return res.status(404).json({ error: "Meeting not found" });

      // Refresh token and create event
      const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI || `${process.env.APP_URL}/api/auth/google/callback`
      );
      client.setCredentials({ refresh_token: refreshToken });

      const calendar = google.calendar({ version: 'v3', auth: client });
      
      const startTime = new Date(`${meeting.date}T${meeting.time}`);
      const endTime = new Date(startTime.getTime() + (meeting.duration || 60) * 60 * 1000);

      const event = {
        summary: meeting.title,
        description: `${meeting.notes}\n\nJoin Link: ${meeting.meetingLink}`,
        location: meeting.meetingLink,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
        attendees: [
          ...(meeting.clientEmail ? [{ email: meeting.clientEmail }] : []),
          ...(meeting.developerEmail ? [{ email: meeting.developerEmail }] : []),
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 30 },
            { method: 'popup', minutes: 10 },
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      await dbAdmin.collection('meetings').doc(meetingId).update({
        googleEventId: response.data.id,
        syncStatus: 'synced'
      });

      res.json({ success: true, eventId: response.data.id });
    } catch (error: any) {
      console.error("Google Sync Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  apiRouter.post("/upload", (req, res, next) => {
    console.log("DEBUG: POST /api/upload reached");
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("DEBUG: Multer error:", err);
        return res.status(400).json({ error: err.message || "File upload error" });
      }
      next();
    });
  }, (req, res) => {
    try {
      if (!req.file) {
        console.warn("DEBUG: No file in request");
        return res.status(400).json({ error: "No file uploaded" });
      }
      console.log("DEBUG: File uploaded:", (req.file as any).path);
      res.json({ url: (req.file as any).path || (req.file as any).secure_url });
    } catch (error: any) {
      console.error("DEBUG: Route error:", error);
      res.status(500).json({ error: error.message || "Upload failed" });
    }
  });

  apiRouter.post("/razorpay/create-order", async (req, res) => {
    try {
      const { amount, currency = "INR", receipt } = req.body;
      if (!amount) return res.status(400).json({ error: "Amount is required" });
      
      const options = {
        amount: Math.round(amount * 100), // amount in the smallest currency unit
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
      };
      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error: any) {
      console.error("Razorpay order creation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  apiRouter.post("/razorpay/save-payment", async (req, res) => {
    try {
      const { 
        orderId, 
        paymentId, 
        signature, 
        projectId, 
        amount, 
        userId,
        developerId 
      } = req.body;

      if (!projectId || !amount) {
        return res.status(400).json({ error: "Missing required payment fields" });
      }

      const totalAmount = Number(amount);
      const adminShare = totalAmount * 0.3;
      const developerShare = totalAmount * 0.7;

      const paymentData = {
        orderId: orderId || "",
        paymentId: paymentId || "",
        projectId,
        userId: userId || "",
        developerId: developerId || "",
        amount: totalAmount,
        adminShare,
        developerShare,
        status: 'completed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Save payment record
      await dbAdmin.collection('payments').add(paymentData);

      // Update project status
      await dbAdmin.collection('projects').doc(projectId).update({
        paymentStatus: 'Paid',
        status: 'In Development',
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update developer earnings
      if (developerId) {
        const devRef = dbAdmin.collection('users').doc(developerId);
        try {
          await dbAdmin.runTransaction(async (transaction) => {
            const devDoc = await transaction.get(devRef);
            if (devDoc.exists) {
              const currentEarnings = devDoc.data()?.earnings || 0;
              transaction.update(devRef, {
                earnings: currentEarnings + developerShare,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
              });
            }
          });
        } catch (transError) {
          console.error("Error updating developer earnings:", transError);
          // Don't fail the whole payment if just earnings update fails, but log it
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Payment save error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.use("/api", apiRouter);

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
