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

    if (dutySlip.status === 'completed') {
      return res.status(400).json({ message: 'Duty slip is already completed' });
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
      status: dutySlip.status // Include status in response
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
      startTime,  // Add startTime parameter
      endTime,    // Add endTime parameter
    } = req.body;

    // Validate required fields
    if (!manualStartKm || !manualEndKm || !startKmImageUrl || !endKmImageUrl) {
      return res
        .status(400)
        .json({ message: "Missing required fields or image URLs" });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (startTime && !timeRegex.test(startTime)) {
      return res.status(400).json({ message: "Invalid start time format. Use HH:MM (24-hour format)" });
    }
    if (endTime && !timeRegex.test(endTime)) {
      return res.status(400).json({ message: "Invalid end time format. Use HH:MM (24-hour format)" });
    }

    // Check if duty slip exists and isn't already completed
    const existingSlip = await DutySlip.findOne({ dutySlipId: id });
    if (!existingSlip) {
      return res.status(404).json({ message: "Duty slip not found" });
    }
    if (existingSlip.status === 'completed') {
      return res.status(400).json({ message: 'Duty slip is already completed' });
    }

    // Update the duty slip with completion data
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
          startTime: startTime || null,  // Store start time
          endTime: endTime || null,      // Store end time
          modifiedAt: new Date(),
          status: "completed",
        },
      },
      { new: true }
    );

    res.json({
      message: "Trip completed and saved successfully",
      dutySlip: {
        id: updatedSlip.dutySlipId,
        status: updatedSlip.status,
        startKM: updatedSlip.startKM,
        endKM: updatedSlip.endKM,
        startTime: updatedSlip.startTime,  // Include in response
        endTime: updatedSlip.endTime,      // Include in response
        completedAt: updatedSlip.modifiedAt
      },
    });
  } catch (error) {
    console.error("Error completing trip:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT endpoint to update duty slip
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if duty slip exists
    const existingSlip = await DutySlip.findOne({ dutySlipId: id });
    if (!existingSlip) {
      return res.status(404).json({ message: "Duty slip not found" });
    }

    // Prevent updating completed slips
    if (existingSlip.status === 'completed') {
      return res.status(400).json({ message: 'Completed duty slips cannot be modified' });
    }

    // Validate time formats if provided
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (updateData.startTime && !timeRegex.test(updateData.startTime)) {
      return res.status(400).json({ message: "Invalid start time format. Use HH:MM (24-hour format)" });
    }
    if (updateData.endTime && !timeRegex.test(updateData.endTime)) {
      return res.status(400).json({ message: "Invalid end time format. Use HH:MM (24-hour format)" });
    }

    // If marking as complete, ensure required fields are present
    if (updateData.status === 'completed') {
      if (!updateData.startKM || !updateData.endKM || !updateData.startKMPhoto || !updateData.endKMPhoto) {
        return res.status(400).json({ message: "Missing required fields for completion" });
      }
      if (!updateData.startTime || !updateData.endTime) {
        return res.status(400).json({ message: "Start and end times are required for completion" });
      }
    }

    const updatedSlip = await DutySlip.findOneAndUpdate(
      { dutySlipId: id },
      {
        ...updateData,
        modifiedAt: new Date()
      },
      { new: true }
    );

    res.json({
      message: "Duty slip updated successfully",
      dutySlip: {
        id: updatedSlip.dutySlipId,
        status: updatedSlip.status,
        startTime: updatedSlip.startTime,
        endTime: updatedSlip.endTime,
        // Include other relevant fields
      }
    });
  } catch (error) {
    console.error("Error updating duty slip:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Image upload endpoint
router.post(
  "/:dutySlipId/image",
  upload.single("image"),
  async (req, res) => {
    try {
      const { dutySlipId } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Get the duty slip's current data
      const dutySlip = await DutySlip.findOne({ dutySlipId });
      if (!dutySlip) {
        return res.status(404).json({ error: "Duty slip not found" });
      }

      // Prevent uploading images for completed slips
      if (dutySlip.status === 'completed') {
        return res.status(400).json({ error: "Cannot upload images for completed duty slips" });
      }

      // Create consistent filename
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

      // Upload the file
      await fileRef.save(req.file.buffer, {
        metadata,
        public: true,
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

// GET completed duty slips
router.get("/history/completed", async (req, res) => {
  try {
    const { startDate, endDate, driverId } = req.query;
    
    // Build query
    const query = { status: "completed" };
    
    if (startDate && endDate) {
      query.dateFrom = { 
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (driverId) {
      query.driverId = driverId;
    }

    const completedTrips = await DutySlip.find(query)
      .sort({ dateFrom: -1 }) // Sort by date descending (newest first)
      .select("dutySlipId dateFrom dateTo startTime endTime tripRoute dutyType startKM endKM driverName carNumber")
      .lean();

    // Calculate duration for each trip
    const tripsWithDuration = completedTrips.map(trip => {
      let duration = "N/A";
      if (trip.startTime && trip.endTime) {
        const [startH, startM] = trip.startTime.split(':').map(Number);
        const [endH, endM] = trip.endTime.split(':').map(Number);
        
        let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
        if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle overnight
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        duration = `${hours}h ${minutes}m`;
      }
      
      return {
        ...trip,
        duration
      };
    });

    res.json(tripsWithDuration);
  } catch (error) {
    console.error("Error fetching completed trips:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;