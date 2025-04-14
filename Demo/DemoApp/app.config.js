require('dotenv').config();

export default {
  expo: {
    name: "DemoApp",
    slug: "DemoApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.exceltt.DemoApp",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      // Dynamically inject .env variables here!
      API_BASE_URL: process.env.API_BASE_URL,
      eas: {
        projectId: "903350f0-d134-4087-a20f-add394266e41",
      },
    },
  },
};