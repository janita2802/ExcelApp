import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState("en");

  const toggleLanguage = async () => {
    const newLanguage =
      currentLanguage === "en" ? "es" : currentLanguage === "es" ? "hi" : "en";
    setCurrentLanguage(newLanguage);
    await AsyncStorage.setItem("@languagePreference", newLanguage);
  };

  // Make sure to return only valid React elements
  return (
    <LanguageContext.Provider value={{ currentLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
