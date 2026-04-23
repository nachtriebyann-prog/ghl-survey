const express = require('express');
const path = require('path');
const twilio = require('twilio');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const ghlSecret = process.env.GHL_API_SECRET;

const client = twilio(accountSid, authToken);
const otpStore = new Map();

app.post('/api/submit-form', async (req, res) => {
  const { phone, formData } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, { otp, formData, timestamp: Date.now() });

  try {
    await client.messages.create({
      body: `Your OTP code is: ${otp}. Valid for 10 minutes.`,
      from: twilioNumber,
      to: phone
    });
    res.json({ success: true, message: 'OTP sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  const stored = otpStore.get(phone);

  if (!stored || stored.otp !== otp) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  otpStore.delete(phone);

  try {
    await axios.post(
      'https://rest.gohighlevel.com/v1/contacts/',
      {
        firstName: stored.formData.firstName || '',
        lastName: stored.formData.lastName || '',
        email: stored.formData.email || '',
        phone: phone
      },
      {
        headers: {
          'Authorization': `Bearer ${ghlSecret}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => console.log('Server running on port 3000'));
