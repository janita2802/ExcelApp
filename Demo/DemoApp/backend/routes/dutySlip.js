const express = require("express");
const router = express.Router();
const DutySlip = require("../models/DutySlip");

// GET duty slip by ID
router.get("/:id", async (req, res) => {
  try {
    const dutySlip = await DutySlip.findOne({ dutySlipId: req.params.id })
      .select("-__v -createdAt -modifiedAt") // Exclude unnecessary fields
      .lean();

    if (!dutySlip) {
      return res.status(404).json({ message: "Duty slip not found" });
    }

    // Format the response data
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
      // Add other fields you want to display
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching duty slip:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      startKm,
      endKm,
      customerSignature,
      tollFees = 0,
      parkingFees = 0,
    } = req.body;

    // Validate required fields
    if (!startKm || !endKm || !customerSignature) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find and update the duty slip
    const updatedSlip = await DutySlip.findOneAndUpdate(
      { dutySlipId: id },
      {
        $set: {
          startKM: startKm.manualValue,
          startKMPhoto: startKm.image,
          endKM: endKm.manualValue,
          endKMPhoto: endKm.image,
          customerSignature: customerSignature,
          tollFees: parseFloat(tollFees) || 0,
          parkingFees: parseFloat(parkingFees) || 0,
          startTime: startKm.timestamp,
          endTime: endKm.timestamp,
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
