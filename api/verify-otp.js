const axios = require('axios');

const ghlSecret = process.env.GHL_API_SECRET;
const otpStore = new Map();

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP required' });
  }

  const stored = otpStore.get(phone);

  if (!stored) {
    return res.status(400).json({ error: 'No OTP found for this phone' });
  }

  const elapsed = Date.now() - stored.timestamp;
  if (elapsed > 10 * 60 * 1000) {
    otpStore.delete(phone);
    return res.status(400).json({ error: 'OTP expired' });
  }

  if (stored.otp !== otp) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  const { formData } = stored;
  otpStore.delete(phone);

  try {
    await axios.post(
      `https://rest.gohighlevel.com/v1/contacts/`,
      {
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        email: formData.email || '',
        phone: phone,
        customField: {
          survey_response: formData.surveyResponse,
          survey_data: JSON.stringify(formData)
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${ghlSecret}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Data saved to GHL'
    });
  } catch (error) {
    console.error('GHL error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to save data' });
  }
};
