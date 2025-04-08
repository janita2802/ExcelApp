const mongoose = require("mongoose");

const DutySlipSchema = new mongoose.Schema(
  {
    dutySlipId: { type: String, required: true, unique: true },
    companyId: { type: String, required: true },
    companyName: { type: String, required: true },
    driverId: { type: String, required: true },
    customerName: { type: String, required: true },
    city: { type: String },
    address: { type: String },
    carBooked: { type: String },
    phoneNumber: { type: String },
    dutyType: { type: String },
    driverName: { type: String },
    carNumber: { type: String },
    pickupTime: { type: String },
    dateFrom: { type: Date },
    dateTo: { type: Date },
    tripRoute: { type: String },
    startKM: Number,
    startKMPhoto: String,
    endKM: Number,
    endKMPhoto: String,
    customerSignature: String,
    tollFees: { type: Number, default: 0 },
    parkingFees: { type: Number, default: 0 },
    startTime: String,
    endTime: String,
    createdAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    modifiedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("DutySlip", DutySlipSchema);
