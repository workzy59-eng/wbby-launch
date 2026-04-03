import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Razorpay from "razorpay";
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
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;

  if (privateKey && clientEmail) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: firebaseConfig.storageBucket
    });
  } else {
    // Fallback to application default for local development
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: firebaseConfig.storageBucket
    });
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

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

if (!key_id || !key_secret) {
  console.warn("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing from environment variables.");
}

const razorpay = new Razorpay({
  key_id: key_id || "",
  key_secret: key_secret || "",
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
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      const uploadToFirebase = async (file: Express.Multer.File) => {
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
            reject(err);
          });
          
          blobStream.on('finish', async () => {
            try {
              // Make the file public and get the URL
              await blob.makePublic();
              const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
              resolve(publicUrl);
            } catch (err) {
              console.error('Make public error:', err);
              reject(err);
            }
          });
          
          blobStream.end(file.buffer);
        });
      };

      const logoUrl = files.logo ? await uploadToFirebase(files.logo[0]) : null;
      const documentUrls = files.documents ? await Promise.all(files.documents.map(f => uploadToFirebase(f))) : [];

      res.json({
        success: true,
        logoUrl: logoUrl,
        documentsUrl: documentUrls.join(',')
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message || "Failed to upload files" });
    }
  });

  app.post("/api/payment/create-order", async (req, res) => {
    try {
      const { plan } = req.body;
      let amount = 0;

      if (plan === "Basic") {
        amount = 999900; // ₹9999
      } else if (plan === "Pro") {
        amount = 1999900; // ₹19999
      } else {
        return res.status(400).json({ error: "Invalid plan" });
      }

      const options = {
        amount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.post("/api/payment/verify", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
        .update(body.toString())
        .digest("hex");

      if (expectedSignature === razorpay_signature) {
        res.json({ status: "success" });
      } else {
        res.status(400).json({ error: "Invalid signature" });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ error: "Failed to verify payment" });
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
