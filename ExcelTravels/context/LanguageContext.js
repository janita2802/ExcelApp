import React, { createContext, useState, useContext } from "react";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState("en"); // default to English

  const toggleLanguage = () => {
    setCurrentLanguage((prev) => {
      if (prev === "en") return "es"; // English to Spanish
      if (prev === "es") return "hi"; // Spanish to Hindi
      return "en"; // Hindi back to English
    });
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
