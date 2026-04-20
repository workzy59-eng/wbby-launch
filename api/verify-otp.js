export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP required" });
  }

  return res.status(200).json({ 
    success: true, 
    message: "OTP Verification Route Found. Logic is currently handled by server.ts if running locally."
  });
}
