const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

exports.sendOtpSms = async (phoneNumber, otp) => {
  try {
    await client.messages.create({
      body: `Your OTP for password reset is: ${otp}. Valid for 5 minutes.`,
      from: twilioPhoneNumber,
      to: phoneNumber
    });
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

// Optional: WhatsApp version
// exports.sendOtpWhatsApp = async (phoneNumber, otp) => {
//   try {
//     await client.messages.create({
//       body: `Your OTP for password reset is: ${otp}. Valid for 5 minutes.`,
//       from: `whatsapp:${twilioPhoneNumber}`,
//       to: `whatsapp:${phoneNumber}`
//     });
//     return true;
//   } catch (error) {
//     console.error('Error sending WhatsApp message:', error);
//     return false;
//   }
// };