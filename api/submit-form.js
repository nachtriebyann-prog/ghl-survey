const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);
const otpStore = new Map();

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, formData } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number required' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, { otp, formData, timestamp: Date.now() });

  try {
    await client.messages.create({
      body: `Your OTP code is: ${otp}. Valid for 10 minutes.`,
      from: twilioNumber,
      to: phone
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      phone: phone
    });
  } catch (error) {
    console.error('Twilio error:', error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
};
