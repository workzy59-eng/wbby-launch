import admin from 'firebase-admin';

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

    // 3. Send Email via EmailJS REST API
    const serviceId = process.env.EMAILJS_SERVICE_ID || 'service_swbnsgq';
    const templateId = process.env.EMAILJS_TEMPLATE_ID || 'template_ashsijc';
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || 'vOnX0vXEzyWfWDgQL';
    const privateKey = process.env.EMAILJS_PRIVATE_KEY || 'GP8QbhOyjwCHLoOBtyra2';

    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: {
          to_email: email,
          otp_code: otp,
          otp: otp,
          code: otp,
          app_name: 'WebbyLaunch'
        }
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("EmailJS API Error:", errorText);
      return res.status(500).json({ error: "Failed to send email", details: errorText });
    }

    console.log(`✅ OTP sent to ${email}: ${otp}`);
    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP Endpoint Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
