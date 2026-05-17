import express from "express";
import cors from "cors";
import path from "path";
import { google } from "googleapis";
import admin from "firebase-admin";
import Razorpay from "razorpay";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// OAuth2 Client setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "https://webbylaunch.vercel.app/api/google/callback"
);

// Firebase Admin setup
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    // Robust parsing for the private key
    // 1. Handle literal \n and real newlines
    let formattedKey = privateKey.replace(/\\n/g, '\n');
    
    // 2. Remove any wrapping quotes if they exist
    if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
      formattedKey = formattedKey.substring(1, formattedKey.length - 1);
    }

    // 3. Ensure the key has the correct PEM headers/footers
    if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----')) {
      formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}`;
    }
    if (!formattedKey.includes('-----END PRIVATE KEY-----')) {
      formattedKey = `${formattedKey}\n-----END PRIVATE KEY-----`;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedKey,
      }),
    });
    console.log("Firebase Admin initialized with Service Account Credentials");
  } else {
    // Fallback to ADC if running in a Google Cloud environment with permissions
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log("Firebase Admin initialized with Application Default Credentials");
  }
}

const db = admin.firestore();

app.use(cors());
app.use(express.json());

const apiRouter = express.Router();

apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok", domain: "webbylaunch" });
});

// Google OAuth Auth URL
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

// Google OAuth Callback
apiRouter.get("/google/callback", async (req, res) => {
  const { code, state: userId } = req.query;
  if (!code) return res.status(400).send("Missing code");

  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    
    if (userId && userId !== 'anonymous') {
      const updateData: any = {
        googleCalendarEnabled: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      if (tokens.refresh_token) {
        updateData.googleRefreshToken = tokens.refresh_token;
      }
      await db.collection('users').doc(String(userId)).update(updateData);
    }

    res.send(`
      <html>
        <body style="background: #111; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
          <div style="text-align: center; background: #222; padding: 2rem; border-radius: 2rem; border: 1px solid #c7c42a;">
            <h2 style="color: #c7c42a;">Sync Authorized!</h2>
            <p>Your calendar is now connected to webbylaunch.</p>
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

// Sync Meeting to Google Calendar
apiRouter.post("/meetings/sync-google", async (req, res) => {
  const { meetingId, userId } = req.body;
  if (!meetingId || !userId) return res.status(400).json({ error: "Missing data" });

  try {
    const userDoc = await db.collection('users').doc(userId).get();
    const refreshToken = userDoc.data()?.googleRefreshToken;

    if (!refreshToken) return res.status(404).json({ error: "Google Calendar not connected" });

    const meetingDoc = await db.collection('meetings').doc(meetingId).get();
    const meeting = meetingDoc.data();
    if (!meeting) return res.status(404).json({ error: "Meeting not found" });

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    auth.setCredentials({ refresh_token: refreshToken });

    const calendar = google.calendar({ version: 'v3', auth });
    
    const startTime = new Date(`${meeting.date}T${meeting.time}`);
    const endTime = new Date(startTime.getTime() + (meeting.duration || 60) * 60 * 1000);

    const event = {
      summary: `[webbylaunch] ${meeting.title}`,
      description: `${meeting.notes}\n\nJoin Link: ${meeting.meetingLink}`,
      location: meeting.meetingLink,
      start: { dateTime: startTime.toISOString() },
      end: { dateTime: endTime.toISOString() },
      attendees: [
        ...(meeting.clientEmail ? [{ email: meeting.clientEmail }] : []),
        ...(meeting.developerEmail ? [{ email: meeting.developerEmail }] : []),
      ],
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    await db.collection('meetings').doc(meetingId).update({
      googleEventId: response.data.id,
      syncStatus: 'synced'
    });

    res.json({ success: true, eventId: response.data.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.use("/api", apiRouter);

async function startServer() {
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
    console.log(`webbylaunch server running on port ${PORT}`);
  });
}

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer();
}

export default app;
