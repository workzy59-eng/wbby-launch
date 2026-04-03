import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";

dotenv.config();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `${timestamp}_${cleanName}`);
  }
});

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
  
  // Serve uploads statically
  app.use('/uploads', express.static(uploadDir));

  // API Routes
  app.post("/api/upload", upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'documents', maxCount: 5 }
  ]), (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const logoPath = files.logo ? `/uploads/${files.logo[0].filename}` : null;
      const documentPaths = files.documents ? files.documents.map(f => `/uploads/${f.filename}`) : [];

      res.json({
        success: true,
        logoUrl: logoPath,
        documentsUrl: documentPaths.join(',') // Store as comma-separated string for simplicity
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
