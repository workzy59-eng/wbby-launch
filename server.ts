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
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

const dbAdmin = admin.firestore();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_live_SrTt4UUFFqETs8';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'cvaeGiWKoL6N5bXPPuyeaSD5';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret_456776540909';

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

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

apiRouter.post("/razorpay/create-payment-link", async (req, res) => {
  try {
    const { projectId, plan, amount, customerName, customerEmail, customerPhone } = req.body;
    if (!projectId || !amount || !plan) {
      return res.status(400).json({ error: "Missing required core parameters (projectId, amount, plan)" });
    }

    // Standardize amount for Razorpay (convert to paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    // Make Razorpay Payment Link
    console.log(`Creating dynamic Razorpay Payment Link for Project: ${projectId}, Plan: ${plan}, Amount: ${amount}`);
    const host = process.env.APP_URL || 'https://ais-dev-cxnuohxnxotikhimmakonv-628570041945.asia-southeast1.run.app';
    const callbackUrl = `${host.endsWith('/') ? host.slice(0, -1) : host}/dashboard?success=true&projectId=${projectId}`;

    const paymentLink = await razorpay.paymentLink.create({
      amount: amountInPaise,
      currency: "INR",
      accept_partial: false,
      first_min_partial_amount: amountInPaise,
      description: `Payment for WebbyLaunch ${plan.toUpperCase()} Plan`,
      customer: {
        name: customerName || "Customer",
        email: customerEmail || "customer@example.com",
        contact: customerPhone ? (customerPhone.startsWith('+') ? customerPhone : `+91${customerPhone}`) : "+919999999999",
      },
      notify: {
        sms: false,
        email: true
      },
      reminder_enable: true,
      notes: {
        projectId,
        plan,
      },
      callback_url: callbackUrl,
      callback_method: "get"
    });

    console.log(`Payment Link created successfully. ID: ${paymentLink.id}, URL: ${paymentLink.short_url}`);

    // Save detailed parameters as requested in Requirement 2 & 9:
    // "Save: payment_link_id, customer name, email, phone, selected plan, payment status"
    await dbAdmin.collection('payments').doc(paymentLink.id).set({
      payment_link_id: paymentLink.id,
      customerName: customerName || "Customer",
      email: customerEmail || "customer@example.com",
      phone: customerPhone || "+919999999999",
      selectedPlan: plan,
      paymentStatus: 'pending',
      status: 'pending',
      amount: Number(amount),
      projectId: projectId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update the project document as well so it is aware of the active paymentLink
    await dbAdmin.collection('projects').doc(projectId).update({
      paymentStatus: 'pending',
      paymentLink: paymentLink.short_url,
      paymentLinkId: paymentLink.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      paymentLink: paymentLink.short_url,
      paymentLinkId: paymentLink.id,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay Payment Link:", error);
    res.status(500).json({ error: error.message || "Failed to create payment link" });
  }
});

apiRouter.post("/razorpay-webhook", async (req: any, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      console.error("Webhook verification failed: Missing x-razorpay-signature header");
      return res.status(400).json({ error: "Missing x-razorpay-signature header" });
    }

    // Verify webhook signature securely
    const shasum = crypto.createHmac("sha256", RAZORPAY_WEBHOOK_SECRET);
    if (req.rawBody) {
      shasum.update(req.rawBody);
    } else {
      shasum.update(JSON.stringify(req.body));
    }
    const digest = shasum.digest("hex");

    if (digest !== signature) {
      console.error("Webhook signature mismatch. Validation failed.");
      return res.status(400).json({ error: "Invalid signature" });
    }

    const { event: eventType, payload } = req.body;
    console.log(`Razorpay webhook verified: event: ${eventType}`);

    // We only process 'payment_link.paid' and 'payment.captured'
    if (eventType !== 'payment_link.paid' && eventType !== 'payment.captured') {
      return res.json({ success: true, message: `Skipping unhandled webhook event: ${eventType}` });
    }

    let projectId = "";
    let plan = "";
    let amount = 0;
    let paymentId = "";
    let paymentLinkId = "";
    let customerName = "";
    let email = "";
    let phone = "";

    if (eventType === 'payment_link.paid') {
      const plEntity = payload?.payment_link?.entity;
      const payEntity = payload?.payment?.entity;
      
      if (plEntity) {
        paymentLinkId = plEntity.id;
        projectId = plEntity.notes?.projectId || "";
        plan = plEntity.notes?.plan || "";
        amount = plEntity.amount ? plEntity.amount / 100 : 0;
        customerName = plEntity.customer?.name || "";
        email = plEntity.customer?.email || "";
        phone = plEntity.customer?.contact || "";
      }
      if (payEntity) {
        paymentId = payEntity.id;
      }
    } else if (eventType === 'payment.captured') {
      const payEntity = payload?.payment?.entity;
      if (payEntity) {
        paymentId = payEntity.id;
        paymentLinkId = payEntity.payment_link_id || "";
        projectId = payEntity.notes?.projectId || "";
        plan = payEntity.notes?.plan || "";
        amount = payEntity.amount ? payEntity.amount / 100 : 0;
        email = payEntity.email || "";
        phone = payEntity.contact || "";
      }
    }

    // Error handling of missing core fields
    if (!paymentLinkId && !paymentId) {
      console.error("Webhook processing error: Missing payment identifiers.");
      return res.status(400).json({ error: "Missing payment identifiers in webhook payload" });
    }

    // Resilient fallback logic: lookup project details in existing payment collections
    if (!projectId && paymentLinkId) {
      const paymentCheck = await dbAdmin.collection('payments')
        .where('payment_link_id', '==', paymentLinkId)
        .limit(1)
        .get();
      if (!paymentCheck.empty) {
        const payData = paymentCheck.docs[0].data();
        projectId = payData.projectId || "";
        if (!plan) plan = payData.selectedPlan || "";
        if (!amount) amount = payData.amount || 0;
        if (!customerName) customerName = payData.customerName || "";
        if (!email) email = payData.email || "";
        if (!phone) phone = payData.phone || "";
      }
    }

    // Duplicate webhook protection
    if (paymentId) {
      const duplicateCheck = await dbAdmin.collection('payments')
        .where('payment_id', '==', paymentId)
        .where('paymentStatus', '==', 'paid')
        .limit(1)
        .get();
      if (!duplicateCheck.empty) {
        console.warn(`Duplicate webhook discarded: payment_id ${paymentId} is already completed.`);
        return res.json({ success: true, message: "Webhook already processed (duplicate)" });
      }
    }

    console.log(`Processing valid payment: Link ID: ${paymentLinkId}, Payment ID: ${paymentId}, Project: ${projectId}, Plan: ${plan}`);

    // Fetch information from Project to notify correct developer & get correct project metadata
    let developerId = "";
    let projectName = "Premium Website Design";
    if (projectId) {
      const projectDoc = await dbAdmin.collection('projects').doc(projectId).get();
      if (projectDoc.exists) {
        const projData = projectDoc.data();
        developerId = projData?.developerId || projData?.assignedTo || "";
        projectName = projData?.businessName || projData?.websiteName || "Premium Website Design";
      }
    }

    // 6. If payment verified:
    // - update database payment status to PAID
    // - activate selected plan
    // - unlock dashboard/services
    // - save payment_id
    // - save paidAt timestamp
    // - notify developer/admin
    if (projectId) {
      await dbAdmin.collection('projects').doc(projectId).update({
        paymentStatus: 'paid',
        status: 'Under Review', // Activates plan and triggers start
        isLocked: false,       // Unlock dashboard/services
        paymentId: paymentId || "",
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`Unlocked project dashboard and set paymentStatus to paid for Project ID: ${projectId}`);
    }

    if (paymentLinkId) {
      const paymentsQuery = await dbAdmin.collection('payments')
        .where('payment_link_id', '==', paymentLinkId)
        .limit(1)
        .get();

      if (!paymentsQuery.empty) {
        const payDocId = paymentsQuery.docs[0].id;
        await dbAdmin.collection('payments').doc(payDocId).update({
          paymentStatus: 'paid',
          status: 'completed',
          payment_id: paymentId || "",
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        await dbAdmin.collection('payments').add({
          payment_link_id: paymentLinkId,
          payment_id: paymentId || "",
          projectId: projectId || "",
          customerName: customerName || "Customer",
          email: email || "customer@example.com",
          phone: phone || "+919999999999",
          selectedPlan: plan || "basic",
          paymentStatus: 'paid',
          status: 'completed',
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    // Create notifications to notify developer/admin
    // Admin notification
    await dbAdmin.collection('notifications').add({
      userId: 'admin',
      title: 'Payment Received',
      description: `Payment of ₹${amount} received successfully for "${projectName}". Plan: ${plan}.`,
      type: 'admin',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Developer notification
    if (developerId) {
      await dbAdmin.collection('notifications').add({
        userId: developerId,
        title: 'Project Funded & Active',
        description: `Client payment validated for "${projectName}". You can now complete development tasks.`,
        type: 'progress',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json({ success: true, message: "Webhook processed and payment verified successfully" });
  } catch (err: any) {
    console.error("Critical Webhook processing error:", err);
    res.status(500).json({ error: err.message || "Internal server webhook processing error" });
  }
});

apiRouter.get("/payment-status/:paymentLinkId", async (req, res) => {
  const { paymentLinkId } = req.params;
  try {
    if (!paymentLinkId) {
      return res.status(400).json({ error: "Missing paymentLinkId" });
    }

    // 1. Look up in Firestore payments collection
    const paymentsQuery = await dbAdmin.collection('payments')
      .where('payment_link_id', '==', paymentLinkId)
      .limit(1)
      .get();

    if (!paymentsQuery.empty) {
      const payData = paymentsQuery.docs[0].data();
      const st = String(payData.paymentStatus || payData.status).toLowerCase();
      if (st === 'paid' || st === 'completed') {
        return res.json({
          success: true,
          status: "paid"
        });
      }
    }

    // 2. Look up in projects collection
    const projectsQuery = await dbAdmin.collection('projects')
      .where('paymentLinkId', '==', paymentLinkId)
      .limit(1)
      .get();

    if (!projectsQuery.empty) {
      const projData = projectsQuery.docs[0].data();
      const st = String(projData.paymentStatus).toLowerCase();
      if (st === 'paid') {
        return res.json({
          success: true,
          status: "paid"
        });
      }
    }

    // 3. Resilience fallback: Query Razorpay Payment Link API directly
    try {
      const linkDetails = await razorpay.paymentLink.fetch(paymentLinkId);
      if (linkDetails && linkDetails.status === 'paid') {
        return res.json({
          success: true,
          status: "paid"
        });
      }
    } catch (apiErr) {
      console.warn("Direct Razorpay Payment Link query fallback failed:", apiErr);
    }

    res.json({
      success: true,
      status: "pending"
    });
  } catch (error: any) {
    console.error(`Error checking payment status for id ${paymentLinkId}:`, error);
    res.status(500).json({ success: false, error: error.message });
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
