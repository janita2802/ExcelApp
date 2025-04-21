const express = require("express");
const router = express.Router();
const Driver = require("../models/Driver");
const OTP = require("../models/OTP");
// const { sendEmail } = require("../utils/sendEmail");
// const { getOTPEmailTemplate } = require("../utils/emailTemplates");
const { sendOtpSms } = require("../services/smsService");
const { generateOtp, formatPhoneNumber } = require("../utils/otpGenerator");
const { otpLimiter } = require("../middleware/rateLimiter");

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const escapeRegex = (text) => {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    const safeUsername = escapeRegex(username);

    const driver = await Driver.findOne({
      name: { $regex: new RegExp(`^${safeUsername}$`, "i") },
    });

    if (!driver) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await driver.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Successful login
    res.json({
      message: "Login successful",
      driver: {
        id: driver._id,
        driverId: driver.driverId, // D001
        name: driver.name,
        email: driver.email,
        contact: driver.contact,
        profilePic: driver.profilePic,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/send-otp", async (req, res) => {
  const { contact } = req.body;

  try {
    let driver;

    // Format phone number
    // const formattedPhone = formatPhoneNumber(contact);

    if (contact) {
      driver = await Driver.findOne({ contact });
    }

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Rest of your existing OTP logic...
    await OTP.deleteMany({ email: contact });

    const otp = Math.floor(10000 + Math.random() * 90000).toString();

    await OTP.create({
      email: contact,
      otp,
      expiresAt: new Date(Date.now() + 600000), // Expires in 10 minutes
    });

    // // Use the HTML template
    // const emailHtml = getOTPEmailTemplate(driver.name || "User", otp);
    // // Make sure the text version is still meaningful
    // const textVersion = `Excel Tours & Travels - Password Reset\n\nDear ${driver.name},\n\nYour OTP is: ${otp}\nValid for 10 minutes.\n\nDo not share this code.`;

    // await sendEmail(
    //   email,
    //   "Your Password Reset OTP - Excel Tours & Travels",
    //   textVersion, // Fallback text version
    //   emailHtml // HTML version
    // );

    // Send OTP via SMS or WhatsApp (choose one)
    const smsSent = await sendOtpSms(contact, otp);
    // OR for WhatsApp:
    // const whatsappSent = await sendOtpWhatsApp(formattedPhone, otp);

    if (!smsSent) {
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP sending error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// Verify OTP (Fixed to trigger modal)
router.post("/verify-otp", async (req, res) => {
  const { contact, otp } = req.body;

  try {
    const normalizedContact = contact.trim(); // Normalize input if needed

    // Find the OTP record
    const otpRecord = await OTP.findOne({ email: normalizedContact, otp });

    if (!otpRecord || otpRecord.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Optional: Check if contact belongs to a valid Driver
    const driver = await Driver.findOne({ contact: normalizedContact });
      if (!driver) {
        return res.status(403).json({
          message: `OTP is not valid for this user`,
        });
      }

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({
      success: true,
      message: "OTP verified successfully",
      showChangePasswordModal: true,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
});

router.post("/change-password", async (req, res) => {
  const { contact, newPassword, currentPassword, isReset } = req.body;

  try {
    if (!contact) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    if (!currentPassword) {
      return res.status(400).json({ message: "Current Password is required" });
    }

    if (newPassword === currentPassword) {
      return res.status(400).json({ message: "New Password must be different" });
    }

    if (newPassword.length < 5) {
      return res.status(400).json({
        message: "Password must be at least 5 characters",
      });
    }

    let driver;
    if (isReset) {
      // For password reset flow
      driver = await Driver.findOne({ contact });
    } else {
      // For regular password change
      driver = await Driver.findOne({ contact });
      const isMatch = await driver.comparePassword(currentPassword);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }
    }

    if (!driver) {
      return res.status(404).json({ message: "User not found" });
    }

    driver.password = newPassword;
    await driver.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
});

module.exports = router;
