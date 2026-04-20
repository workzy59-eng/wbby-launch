import admin from 'firebase-admin';

// Initialize Firebase Admin
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP required" });
  }

  try {
    const docRef = db.collection('otps').doc(email.toLowerCase());
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(400).json({ error: "No OTP found. Please request a new one." });
    }

    const data = doc.data();
    if (Date.now() > data.expiry) {
      await docRef.delete();
      return res.status(400).json({ error: "OTP expired" });
    }

    if (data.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP code" });
    }

    // Success - clean up
    await docRef.delete();
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Verify OTP Endpoint Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
