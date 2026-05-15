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
    
    // Replace literal \n with real newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // Some environments might double escape it
    privateKey = privateKey.replace(/\\\\n/g, '\n');
    
    // Ensure it starts with the header on its own line if it's there
    if (!privateKey.includes('\n') && privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      // If it's a single line key with spaces instead of newlines, fix it
      privateKey = privateKey
        .replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
        .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
    }
    
    // Final check to ensure header and footer are present and correct
    if (privateKey.includes('BEGIN PRIVATE KEY') && !privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
       privateKey = '-----BEGIN PRIVATE KEY-----\n' + privateKey.split('BEGIN PRIVATE KEY-----')[1];
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
