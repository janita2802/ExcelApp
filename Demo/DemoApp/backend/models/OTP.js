const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure OTP expires automatically after 10 minutes
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model("OTP", otpSchema);
