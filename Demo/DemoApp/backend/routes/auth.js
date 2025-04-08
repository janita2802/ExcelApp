const express = require("express");
const router = express.Router();
const Driver = require("../models/Driver");

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Case-insensitive search
    const driver = await Driver.findOne({
      name: { $regex: new RegExp(`^${username}$`, "i") },
    });

    if (!driver) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare with contact number
    if (driver.contact !== password) {
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
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
