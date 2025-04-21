const express = require("express");
const router = express.Router();
const Driver = require("../models/Driver");
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

// Middleware to verify driver ownership/authentication
const authenticateDriver = async (req, res, next) => {
  try {
    // Implement your authentication logic here
    // For example, verify Firebase ID token or session
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

router.post(
  "/:driverId/profile-pic",
  authenticateDriver,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const { driverId } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Get the driver's current data
      const driver = await Driver.findOne({ driverId });
      if (!driver) {
        return res.status(404).json({ error: "Driver not found" });
      }

      // Delete old profile picture if it exists
      await deleteProfilePicture(driver.profilePic);

      // Create consistent filename using driverId
      const fileExtension = path.extname(req.file.originalname) || '.jpg';
      const newFileName = `driver-profiles/${driverId}/profile-pic-${Date.now()}${fileExtension}`;
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

      // Update driver record
      const updatedDriver = await Driver.findOneAndUpdate(
        { driverId },
        { profilePic: downloadURL },
        { new: true }
      );

      res.json({
        message: "Profile picture uploaded successfully",
        profilePic: downloadURL,
      });
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      res.status(500).json({ 
        error: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  }
);

// Helper function to delete profile picture
async function deleteProfilePicture(profilePicUrl) {
  if (!profilePicUrl) return;

  try {
    // Extract the actual file path from either signed URL or public URL
    let filePath;
    
    // Handle signed URLs (contains query parameters)
    if (profilePicUrl.includes('storage.googleapis.com')) {
      const url = new URL(profilePicUrl);
      filePath = decodeURIComponent(url.pathname.split('/').slice(3).join('/'));
    } 
    // Handle Firebase Storage URLs
    else if (profilePicUrl.includes('firebasestorage.googleapis.com')) {
      const url = new URL(profilePicUrl);
      filePath = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
    }
    
    if (filePath) {
      filePath = "driver-profiles/" + filePath;
      const fileRef = storage.bucket().file(filePath);
      await fileRef.delete();
    }
  } catch (deleteError) {
    // Ignore 404 errors (file already doesn't exist)
    if (deleteError.code !== 404) {
      console.error("Error deleting old profile picture:", deleteError);
      // Consider logging to error tracking service
    }
  }
}

// Create Driver
router.post("/", async (req, res) => {
  try {
    const newDriver = new Driver(req.body);
    await newDriver.save();
    res.status(201).json(newDriver);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get All Drivers
router.get("/", async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate a unique driverId
router.get("/generate-driver-id", async (req, res) => {
  try {
    const driverId = await generateDriverId();
    res.json({ driverId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper function to generate a unique driverId
async function generateDriverId() {
  try {
    // Find the highest driverId in the database
    const lastDriver = await Driver.findOne().sort({ driverId: -1 });

    let nextIdNumber = 1; // Default starting number

    if (lastDriver && lastDriver.driverId) {
      // Extract the numeric part of the last driverId and increment it
      const lastIdNumber = parseInt(lastDriver.driverId.replace("D", ""), 10);
      nextIdNumber = lastIdNumber + 1;
    }

    // Generate the next driverId
    let nextId = `D${String(nextIdNumber).padStart(3, "0")}`;

    // Check if the generated ID already exists
    const existingDriver = await Driver.findOne({ driverId: nextId });

    // If the ID exists, increment and check again
    if (existingDriver) {
      return await generateUniqueDriverId(nextIdNumber); // Recursively find a unique ID
    }

    return nextId; // Return the unique ID
  } catch (err) {
    console.error("Error generating driverId:", err.message);
    throw err;
  }
}

// Helper function to recursively find a unique ID
async function generateUniqueDriverId(startingNumber) {
  let nextIdNumber = startingNumber + 1; // Increment the number
  let nextId = `D${String(nextIdNumber).padStart(3, "0")}`;

  // Check if the new ID exists
  const existingDriver = await Company.findOne({ driverId: nextId });

  if (existingDriver) {
    return await generateUniqueDriverId(nextIdNumber); // Recursively check again
  }

  return nextId; // Return the unique ID
}

// Get a Single Driver
router.get("/:driverId", async (req, res) => {
  try {
    const { driverId } = req.params;
    const driver = await Driver.findOne({ driverId });
    if (!driver) return res.status(404).json({ error: "Not Found" });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Driver
router.put("/:driverId", async (req, res) => {
  try {
    const { driverId } = req.params;
    const updatedDriver = await Driver.findOneAndUpdate(
      { driverId },
      req.body,
      { new: true }
    );
    res.json(updatedDriver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Driver
router.delete("/:driverId", authenticateDriver, async (req, res) => {
  try {
    const { driverId } = req.params;

    // Find the driver first to get the profile picture URL
    const driver = await Driver.findOne({ driverId });
    
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    // Delete the profile picture if it exists
    await deleteProfilePicture(driver.profilePic);

    // Delete all files in the driver's profile directory
    try {
      const directoryPath = `driver-profiles/${driverId}/`;
      const [files] = await storage.bucket().getFiles({ prefix: directoryPath });
      
      const deletePromises = files.map(file => file.delete());
      await Promise.all(deletePromises);
    } catch (storageError) {
      console.error("Error deleting driver's storage files:", storageError);
      // Continue with driver deletion even if storage cleanup fails
    }

    // Delete the driver record
    await Driver.findOneAndDelete({ driverId });

    res.json({ 
      message: "Driver deleted successfully",
      deletedResources: {
        databaseRecord: true,
        profilePicture: !!driver.profilePic,
        storageFiles: true
      }
    });
  } catch (err) {
    console.error("Error deleting driver:", err);
    res.status(500).json({ 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router;