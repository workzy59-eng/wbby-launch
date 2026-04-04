import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import admin from 'firebase-admin';
import firebaseConfig from './firebase-applet-config.json';

dotenv.config();

// Initialize Firebase Admin
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

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isImage = file.mimetype.startsWith('image/');
    return {
      folder: 'webbylaunch_uploads',
      resource_type: isImage ? 'image' : 'raw',
      public_id: `${Date.now()}_${file.originalname.split('.')[0]}`,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  // API Routes
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      res.json({
        success: true,
        url: req.file.path,
        secure_url: (req.file as any).path,
        public_id: (req.file as any).filename,
        format: (req.file as any).format
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message || "Failed to upload file" });
    }
  });

  // Legacy upload for onboarding flow
  app.post("/api/upload-onboarding", upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'documents', maxCount: 5 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (!files || (!files.logo && !files.documents)) {
        return res.status(400).json({ error: "No files uploaded" });
      }
      
      const logoUrl = files.logo ? files.logo[0].path : null;
      const documentUrls = files.documents ? files.documents.map(f => f.path) : [];

      res.json({
        success: true,
        logoUrl: logoUrl,
        documentsUrl: documentUrls.join(',')
      });
    } catch (error: any) {
      console.error("Onboarding upload error:", error);
      res.status(500).json({ error: error.message || "Failed to upload files" });
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
