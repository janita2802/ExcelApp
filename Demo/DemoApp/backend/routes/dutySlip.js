const express = require("express");
const router = express.Router();
const DutySlip = require("../models/DutySlip");
const multer = require("multer");

// Use memory storage to keep uploaded images in memory as buffers
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET duty slip by ID
router.get("/:id", async (req, res) => {
  try {
    const dutySlip = await DutySlip.findOne({ dutySlipId: req.params.id })
      .select("-__v -createdAt -modifiedAt")
      .lean();

    if (!dutySlip) {
      return res.status(404).json({ message: "Duty slip not found" });
    }

    const responseData = {
      id: dutySlip.dutySlipId,
      party: dutySlip.customerName,
      address: `${dutySlip.address}, ${dutySlip.city}`,
      contact: dutySlip.phoneNumber,
      category: dutySlip.carBooked,
      pickupTime: dutySlip.pickupTime,
      driverName: dutySlip.driverName,
      carNumber: dutySlip.carNumber,
      tripRoute: dutySlip.tripRoute,
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching duty slip:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST trip completion (with FormData + images)
router.post(
  "/:id/complete",
  upload.fields([{ name: "startKmImage" }, { name: "endKmImage" }]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        manualStartKm,
        manualEndKm,
        timestampStart,
        timestampEnd,
        customerSignature,
        tollFees = 0,
        parkingFees = 0,
      } = req.body;

      const startKmImage = req.files?.startKmImage?.[0];
      const endKmImage = req.files?.endKmImage?.[0];

      if (!manualStartKm || !manualEndKm || !startKmImage || !endKmImage) {
        return res
          .status(400)
          .json({ message: "Missing required fields or images" });
      }

      const updatedSlip = await DutySlip.findOneAndUpdate(
        { dutySlipId: id },
        {
          $set: {
            startKM: manualStartKm,
            startKMPhoto: startKmImage.buffer, // save as buffer
            endKM: manualEndKm,
            endKMPhoto: endKmImage.buffer, // save as buffer
            customerSignature: customerSignature || null,
            tollFees: parseFloat(tollFees),
            parkingFees: parseFloat(parkingFees),
            startTime: timestampStart,
            endTime: timestampEnd,
            modifiedAt: new Date(),
            status: "completed",
          },
        },
        { new: true }
      );

      if (!updatedSlip) {
        return res.status(404).json({ message: "Duty slip not found" });
      }

      res.json({
        message: "Trip data saved successfully",
        dutySlip: updatedSlip,
      });
    } catch (error) {
      console.error("Error saving trip data:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
