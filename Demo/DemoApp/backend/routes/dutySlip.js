const express = require("express");
const router = express.Router();
const DutySlip = require("../models/DutySlip");

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
      customerPhoneNumber: dutySlip.customerPhoneNumber,
      address: `${dutySlip.address}, ${dutySlip.city}`,
      contact: dutySlip.phoneNumber,
      category: dutySlip.carBooked,
      pickupTime: dutySlip.pickupTime,
      driverName: dutySlip.driverName,
      driverId: dutySlip.driverId,
      carNumber: dutySlip.carNumber,
      tripRoute: dutySlip.tripRoute,
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching duty slip:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST trip completion (with Firebase Storage URLs)
router.post("/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      manualStartKm,
      manualEndKm,
      startKmImageUrl,
      endKmImageUrl,
      customerSignatureUrl,
      tollFees = 0,
      parkingFees = 0,
      timestampStart,
      timestampEnd,
    } = req.body;

    if (!manualStartKm || !manualEndKm || !startKmImageUrl || !endKmImageUrl) {
      return res
        .status(400)
        .json({ message: "Missing required fields or image URLs" });
    }

    const updatedSlip = await DutySlip.findOneAndUpdate(
      { dutySlipId: id },
      {
        $set: {
          startKM: manualStartKm,
          startKMPhoto: startKmImageUrl,
          endKM: manualEndKm,
          endKMPhoto: endKmImageUrl,
          customerSignature: customerSignatureUrl || null,
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
});

module.exports = router;