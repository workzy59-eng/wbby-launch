export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: "Valid email required" });
  }

  // NOTE: For Vercel/Serverless deployment, use Redis or a database for OTP storage.
  // In this local environment, the Express server handles the primary logic.
  
  return res.status(200).json({ 
    success: true, 
    message: "OTP Route Found. Logic is currently handled by server.ts if running locally." 
  });
}
