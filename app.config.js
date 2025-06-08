require('dotenv').config();

export default {
  expo: {
    name: "Excel Tours & Travels",
    slug: "ExcelApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logo.png",
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
      package: "com.exceltt.ExcelApp",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      // Dynamically inject .env variables here!
      API_BASE_URL: process.env.API_BASE_URL,
      eas: {
        projectId: "43ba56e3-b5f9-4733-9de6-b071ffc2358d"
      }
    },
    owner: "exceltt"
  },
  assetBundlePatterns: ["**/*"]
};