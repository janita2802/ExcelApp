require("dotenv").config();
const { initializeApp, cert } = require("firebase-admin/app");
const { getStorage } = require("firebase-admin/storage");

const firebaseConfig = {
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // ✅ from .env
};

// Initialize Firebase Admin with your service account credentials
const serviceAccount = require("../config/serviceAccountKey.json");

const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Replace with your bucket name
});

const storage = getStorage(app);

module.exports = { storage };
