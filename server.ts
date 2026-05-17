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
  process.env.GOOGLE_REDIRECT_URI
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
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: firebaseConfig.storageBucket
      });
      console.log("Firebase Admin initialized with application default");
    } catch (initErr: any) {
      console.warn("Firebase Admin fallback failed");
    }
  }
}

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
// Alias for Vercel consistency as requested by user
apiRouter.get("/google/auth-url", (req, res) => {
  const { userId } = req.query;
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state: String(userId || 'anonymous')
  });
  res.json({ url });
});

// Callback for Google OAuth
apiRouter.get("/google/callback", async (req, res) => {
  const { code, state: userId } = req.query;
  if (!code) return res.status(400).send("Missing code");

  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    
    // If we have a userId (from state), save tokens
    if (userId && userId !== 'anonymous') {
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
            } else {
              document.body.innerHTML += '<p>You can now return to the app.</p>';
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
      process.env.GOOGLE_REDIRECT_URI
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
  upload.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || "File upload error" });
    next();
  });
}, (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ url: (req.file as any).path || (req.file as any).secure_url });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Upload failed" });
  }
});

apiRouter.post("/razorpay/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    if (!amount) return res.status(400).json({ error: "Amount is required" });
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    });
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post("/razorpay/save-payment", async (req, res) => {
  try {
    const { 
      projectId, 
      amount, 
      userId,
      developerId 
    } = req.body;

    if (!projectId || !amount) return res.status(400).json({ error: "Missing fields" });

    const totalAmount = Number(amount);
    const adminShare = totalAmount * 0.3;
    const developerShare = totalAmount * 0.7;

    await dbAdmin.collection('payments').add({
      projectId,
      userId: userId || "",
      developerId: developerId || "",
      amount: totalAmount,
      adminShare,
      developerShare,
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await dbAdmin.collection('projects').doc(projectId).update({
      paymentStatus: 'Paid',
      status: 'In Development',
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    if (developerId) {
      await dbAdmin.collection('users').doc(developerId).update({
        earnings: admin.firestore.FieldValue.increment(developerShare),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.use("/api", apiRouter);

async function startServer() {
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

// Only run the server if not imported (e.g. for Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer();
}

export default app;
