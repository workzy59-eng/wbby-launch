import admin from 'firebase-admin';
import { Resend } from 'resend';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin Init Error in API:', error);
  }
}

const db = admin.firestore();
const resend = new Resend(process.env.RESEND_API_KEY || 're_MddR7kGm_8aE7G7aZJnPBXdLyRT7WNYqt');

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: "Valid email required" });
  }

  try {
    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    // 2. Store OTP in Firestore for serverless persistence
    await db.collection('otps').doc(email.toLowerCase()).set({
      otp,
      expiry,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 3. Send Email via Resend
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    const { data, error } = await resend.emails.send({
      from: `WebbyLaunch <${fromEmail}>`,
      to: [email],
      subject: `Your Verification Code: ${otp}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
          <p style="font-size: 16px; color: #555;">Hello,</p>
          <p style="font-size: 16px; color: #555;">Your verification code for <strong>WebbyLaunch</strong> is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000; border-radius: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #888;">This code will expire in 5 minutes.</p>
          <p style="font-size: 14px; color: #888;">If you did not request this code, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; 2026 WebbyLaunch. All rights reserved.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return res.status(500).json({ error: "Failed to send email", details: error });
    }

    console.log(`✅ OTP sent to ${email} via Resend: ${otp}`);
    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP Endpoint Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
