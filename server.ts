import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import admin from 'firebase-admin';
import crypto from "crypto";
import firebaseConfig from './firebase-applet-config.json';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

dotenv.config();

// Initialize Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.VITE_CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error("CRITICAL: Cloudinary configuration is incomplete. Uploads will fail.");
  console.log("Status:", { cloudName: !!cloudName, apiKey: !!apiKey, apiSecret: !!apiSecret });
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

// Configure Multer for memory storage (we'll manual upload to Cloudinary for better error handling)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// Initialize Firebase Admin
let isFirebaseAdminCertLoaded = false;

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
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // Sometimes the key might have literal newlines already but is still double escaped or has weird spacing
    // Ensure we don't have dangling whitespace at the end of lines within the key
    privateKey = privateKey.split('\n').map(line => line.trim()).join('\n');
    
    // Ensure the header and footer are correctly formatted with newlines
    if (privateKey.includes('BEGIN PRIVATE KEY')) {
      // Standardize headers
      privateKey = privateKey.replace(/-----BEGIN PRIVATE KEY-----/, '-----BEGIN PRIVATE KEY-----\n');
      privateKey = privateKey.replace(/-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----');
      
      // Remove any double newlines that might have been introduced
      privateKey = privateKey.replace(/\n\n+/g, '\n');
    }
  }
  
  const hasValidKey = privateKey && privateKey.includes('-----BEGIN PRIVATE KEY-----') && privateKey.includes('-----END PRIVATE KEY-----');
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
      isFirebaseAdminCertLoaded = true;
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

// API Routes
const apiRouter = express.Router();

apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

apiRouter.post("/upload", (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({ error: err.message || "File upload error" });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      console.warn("Upload finished but no file in req.file");
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Manual Cloudinary Upload via Stream
    const uploadToCloudinary = (fileBuffer: Buffer, fileName: string, targetFolder: string) => {
      return new Promise((resolve, reject) => {
        if (!cloudName || !apiKey || !apiSecret) {
          return reject(new Error("Cloudinary credentials missing in server environment"));
        }

        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: targetFolder || 'webbylaunch',
            resource_type: 'auto',
            public_id: `${Date.now()}-${fileName.split('.')[0]}`.replace(/[^a-zA-Z0-9-]/g, '_')
          },
          (error, result) => {
            if (error) {
              console.error("Detailed Cloudinary Error:", JSON.stringify(error, null, 2));
              return reject(error);
            }
            resolve(result);
          }
        );
        uploadStream.end(fileBuffer);
      });
    };

    console.log("Uploading file to Cloudinary:", req.file.originalname, "Folder:", req.body.folder);
    
    // Server-side validation
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'pdf', 'zip'];
    const fileExt = req.file.originalname.split('.').pop()?.toLowerCase() || '';
    
    if (!allowedExtensions.includes(fileExt) && !req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: "Invalid file type restricted by server policy." });
    }

    const result: any = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.body.folder);
    
    console.log("File uploaded successfully to:", result.secure_url);
    res.json({ 
      url: result.secure_url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      original_filename: req.file.originalname
    });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    res.status(500).json({ error: error.message || "Upload failed" });
  }
});

app.use("/api", apiRouter);

// Automatic Midnight Auto Punch-Out Sweep
async function runAutoPunchOutCheck() {
  if (!isFirebaseAdminCertLoaded) {
    console.log("[Auto Punch Out] Notice: Server-side background auto-punch-out is inactive because Firebase Admin certificate is not loaded. Safe self-healing continues via client-side rollover.");
    return;
  }

  try {
    const todayStr = new Date().toISOString().split('T')[0];
    console.log(`[Auto Punch Out Check] Service account sweep checking for records older than ${todayStr}...`);
    
    const dbAdmin = admin.firestore();
    const querySnapshot = await dbAdmin.collection("attendance")
      .where("punchOut", "==", null)
      .get();
    
    if (querySnapshot.empty) {
      return;
    }
    
    const batch = dbAdmin.batch();
    let count = 0;
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const docDate = data.date; // e.g. "2026-05-26"
      const userId = data.userId;
      
      // If the attendance doc date is before today UTC
      if (docDate && docDate < todayStr) {
        console.log(`[Auto Punch Out] Resetting outdated punch-in for user ${userId} on date ${docDate}`);
        
        const punchInTime = data.punchIn;
        let punchOutDate = new Date();
        if (punchInTime) {
          const punchInMs = punchInTime.toDate ? punchInTime.toDate().getTime() : 
                            (punchInTime._seconds ? punchInTime._seconds * 1000 : new Date(punchInTime).getTime());
          // Close shift exactly 5 hours after punch in (the minimum shift time) or default to end of that day
          punchOutDate = new Date(punchInMs + 5 * 60 * 60 * 1000);
        }
        
        const punchOutTimestamp = admin.firestore.Timestamp.fromDate(punchOutDate);
        
        const attRef = dbAdmin.collection("attendance").doc(docSnap.id);
        batch.update(attRef, {
          punchOut: punchOutTimestamp,
          status: "completed",
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        if (userId) {
          const userRef = dbAdmin.collection("users").doc(userId);
          batch.set(userRef, {
            isPunchedIn: false,
            status: "online",
            lastPunchOut: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
        
        count++;
      }
    });
    
    if (count > 0) {
      await batch.commit();
      console.log(`[Auto Punch Out] Reset successful. Automatically punched out ${count} outdated developers.`);
    }
  } catch (err) {
    console.error("[Auto Punch Out] Automated sweep failure:", err);
  }
}

// Run sweep on server startup and then every 5 minutes
setTimeout(() => {
  runAutoPunchOutCheck().catch(err => console.error("Initial auto-punch-out sweep failed:", err));
}, 10000);

setInterval(() => {
  runAutoPunchOutCheck().catch(err => console.error("Interval auto-punch-out sweep failed:", err));
}, 5 * 60 * 1000);

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
