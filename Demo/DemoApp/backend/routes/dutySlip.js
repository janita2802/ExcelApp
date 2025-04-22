const express = require("express");
const router = express.Router();
const DutySlip = require("../models/DutySlip");
const multer = require("multer");
const { storage } = require("../config/firebase");
const path = require("path");

// Configure multer for memory storage with file filtering
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
    }
  }
});

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

router.post(
  "/:dutySlipId/image",
  upload.single("image"),
  async (req, res) => {
    try {
      const { dutySlipId } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Get the driver's current data
      const dutySlip = await DutySlip.findOne({ dutySlipId });
      if (!dutySlip) {
        return res.status(404).json({ error: "duty Slip not found" });
      }

      // Create consistent filename using driverId
      const fileExtension = path.extname(req.file.originalname) || '.jpg';
      let newFileName = req.file.originalname.replaceAll("_", "/");
      if (req.file.originalname.includes("start-km")) {
        newFileName = `duty-slips/${dutySlipId}/start-km${fileExtension}`;
      }
      else if (req.file.originalname.includes("end-km")) {
        newFileName = `duty-slips/${dutySlipId}/end-km${fileExtension}`;
      }
      else if (req.file.originalname.includes("signature")) {
        newFileName = `duty-slips/${dutySlipId}/signature${fileExtension}`;
      }
      const fileRef = storage.bucket().file(newFileName);

      // Upload metadata
      const metadata = {
        contentType: req.file.mimetype,
        cacheControl: 'public, max-age=31536000', // 1 year cache
      };

      // Upload the new file
      await fileRef.save(req.file.buffer, {
        metadata,
        public: true, // Make the file publicly accessible
      });

      // Get the public URL
      const downloadURL = `https://storage.googleapis.com/${
        storage.bucket().name
      }/${fileRef.name}`;

      res.json({
        message: "Image uploaded successfully",
        image: downloadURL,
      });
    } catch (err) {
      console.error("Error uploading image:", err);
      res.status(500).json({ 
        error: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  }
);

module.exports = router;