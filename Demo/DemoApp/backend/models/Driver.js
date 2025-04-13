const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const DriverSchema = new mongoose.Schema({
  driverId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  contact: { type: String, required: true },
  address: { type: String, required: true },
  emergencyName: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
  branch: { type: String, required: true },
  aadharNumber: { type: String, required: true, unique: true },
  panNumber: { type: String, required: true, unique: true },
  licenseNumber: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  password: { type: String, required: true },
});

// Hash password before saving
DriverSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    if (!this.password) {
      this.password = this.contact;
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password
DriverSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Driver", DriverSchema);
