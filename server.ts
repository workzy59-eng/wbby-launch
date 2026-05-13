import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import admin from 'firebase-admin';
import Razorpay from "razorpay";
import firebaseConfig from './firebase-applet-config.json';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config();

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
    const folder = req.body?.folder || 'webbylaunch';
    return {
      folder: folder,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'pdf', 'doc', 'docx', 'txt', 'mp3', 'wav', 'webm'],
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
    } as any;
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
    privateKey = privateKey.trim();
    while ((privateKey.startsWith('"') && privateKey.endsWith('"')) || 
           (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
      privateKey = privateKey.slice(1, -1).trim();
    }
    privateKey = privateKey.replace(/\\n/g, '\n');
    privateKey = privateKey.replace(/\\\\n/g, '\n');
    
    if (!privateKey.includes('\n') && privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      privateKey = privateKey
        .replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
        .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
    }
    
    if (privateKey.includes('BEGIN PRIVATE KEY') && !privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
       privateKey = '-----BEGIN PRIVATE KEY-----\n' + privateKey.split('BEGIN PRIVATE KEY-----')[1];
    }
  }
  
  const hasValidKey = privateKey && privateKey.includes('-----BEGIN PRIVATE KEY-----');
  const hasClientEmail = clientEmail && clientEmail.includes('@');

  if (hasValidKey && hasClientEmail) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey!,
        }),
        storageBucket: firebaseConfig.storageBucket
      });
    } catch (initErr: any) {
      console.error("Firebase Admin initialization error:", initErr.message);
      try {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          storageBucket: firebaseConfig.storageBucket
        });
      } catch (fallbackErr) {
        console.error("Firebase Admin fallback failed:", fallbackErr);
      }
    }
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: firebaseConfig.storageBucket
      });
    } catch (initErr) {
      console.warn("Firebase Admin initialized with application default fail.");
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security configuration
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com", "https://www.gstatic.com", "https://checkout.razorpay.com", "https://cdn.razorpay.com", "https://www.googletagmanager.com", "https://res.cloudinary.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://*.gstatic.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:", "https://res.cloudinary.com", "https://*.mixkit.co", "https://*.googleapis.com"],
        connectSrc: ["'self'", "https://*.googleapis.com", "https://*.firebaseio.com", "https://*.firebaseapp.com", "wss://*.firebaseio.com", "https://*.mixkit.co", "https://res.cloudinary.com"],
        frameSrc: ["'self'", "https://checkout.razorpay.com", "https://*.firebaseapp.com"],
        mediaSrc: ["'self'", "https://assets.mixkit.co", "https://res.cloudinary.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  app.use(cors());
  app.use(express.json());

  const dbAdmin = admin.firestore();
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
  });

  const apiRouter = express.Router();
  
  apiRouter.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  apiRouter.post("/upload", (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || "File upload error" });
      }
      next();
    });
  }, (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ url: (req.file as any).path || (req.file as any).secure_url });
  });

  apiRouter.post("/razorpay/create-order", async (req, res) => {
    try {
      const { amount, currency = "INR", receipt } = req.body;
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
      const { projectId, amount, userId, developerId, orderId, paymentId } = req.body;
      const totalAmount = Number(amount);
      const developerShare = totalAmount * 0.7;
      
      await dbAdmin.collection('payments').add({
        orderId, paymentId, projectId, userId, developerId, amount: totalAmount,
        adminShare: totalAmount * 0.3, developerShare, status: 'completed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await dbAdmin.collection('projects').doc(projectId).update({
        paymentStatus: 'Paid', status: 'In Development',
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (developerId) {
        const devRef = dbAdmin.collection('users').doc(developerId);
        await dbAdmin.runTransaction(async (transaction) => {
          const devDoc = await transaction.get(devRef);
          if (devDoc.exists) {
            transaction.update(devRef, {
              earnings: (devDoc.data()?.earnings || 0) + developerShare,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
        });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.use("/api", apiRouter);

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
