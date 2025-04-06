import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [isReady, setIsReady] = useState(false);

  // Load saved language preference on startup
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("@languagePreference");
        if (savedLanguage) {
          setCurrentLanguage(savedLanguage);
        }
      } catch (error) {
        console.error("Failed to load language preference", error);
      } finally {
        setIsReady(true);
      }
    };

    loadLanguage();
  }, []);

  // Toggle between English and Hindi only
  const toggleLanguage = async () => {
    const newLanguage = currentLanguage === "en" ? "hi" : "en";
    setCurrentLanguage(newLanguage);
    try {
      await AsyncStorage.setItem("@languagePreference", newLanguage);
    } catch (error) {
      console.error("Failed to save language preference", error);
    }
  };

  // Wait until language is loaded before rendering children
  if (!isReady) {
    return null; // or return a loading spinner
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
