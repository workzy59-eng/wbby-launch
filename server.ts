import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import multer from "multer";
import admin from 'firebase-admin';
import firebaseConfig from './firebase-applet-config.json';

dotenv.config();

// Initialize Firebase Admin
// On Vercel, you should set these environment variables:
// FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
if (!admin.apps.length) {
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = rawKey ? rawKey.replace(/\\n/g, '\n').replace(/^"(.*)"$/, '$1').trim() : undefined;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;

  if (privateKey && clientEmail) {
    try {
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
      console.error("Firebase Admin initialization error:", initErr);
    }
  } else {
    // Fallback to application default for local development
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: firebaseConfig.storageBucket
      });
      console.log("Firebase Admin initialized with application default");
    } catch (initErr: any) {
      console.error("Firebase Admin fallback initialization error:", initErr);
    }
  }
}

const bucket = admin.storage().bucket();

// Configure Multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  // API Routes
  app.post("/api/upload", upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'documents', maxCount: 5 }
  ]), async (req, res) => {
    try {
      // Check if Firebase is initialized
      if (!admin.apps.length) {
        throw new Error("Firebase Admin not initialized. Check environment variables.");
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (!files || (!files.logo && !files.documents)) {
        return res.status(400).json({ error: "No files uploaded" });
      }
      
      const uploadToFirebase = async (file: Express.Multer.File) => {
        try {
          const timestamp = Date.now();
          const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
          const fileName = `uploads/${timestamp}_${cleanName}`;
          const blob = bucket.file(fileName);
          
          const blobStream = blob.createWriteStream({
            metadata: {
              contentType: file.mimetype,
              cacheControl: 'public, max-age=31536000'
            },
            resumable: false
          });

          return new Promise<string>((resolve, reject) => {
            blobStream.on('error', (err) => {
              console.error('Blob stream error:', err);
              reject(new Error(`Storage error: ${err.message}`));
            });
            
            blobStream.on('finish', async () => {
              try {
                // Try to make the file public
                try {
                  await blob.makePublic();
                } catch (publicErr) {
                  console.warn('Could not make file public, bucket might have public access prevention:', publicErr);
                  // If makePublic fails, we'll try to return a signed URL or just the public link anyway
                }
                
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                resolve(publicUrl);
              } catch (err: any) {
                console.error('Post-upload error:', err);
                reject(new Error(`Post-upload error: ${err.message}`));
              }
            });
            
            blobStream.end(file.buffer);
          });
        } catch (err: any) {
          throw new Error(`Upload process failed: ${err.message}`);
        }
      };

      const logoUrl = files.logo ? await uploadToFirebase(files.logo[0]) : null;
      const documentUrls = files.documents ? await Promise.all(files.documents.map(f => uploadToFirebase(f))) : [];

      res.json({
        success: true,
        logoUrl: logoUrl,
        documentsUrl: documentUrls.join(',')
      });
    } catch (error: any) {
      console.error("Full upload error details:", error);
      res.status(500).json({ 
        error: error.message || "Failed to upload files",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
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
