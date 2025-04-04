import React, { createContext, useContext, useState } from "react";
import { Appearance } from "react-native";

const ThemeContext = createContext();

const lightTheme = {
  background: "#F5F7FA",
  text: "#2D3748",
  card: "#FFF7F0",
  accent: "#FF7A45",
};

const darkTheme = {
  background: "#1A1A1A",
  text: "#F5F7FA",
  card: "#2A2A2A",
  accent: "#FF7A45",
};

export const ThemeProvider = ({ children }) => {
  const colorScheme = Appearance.getColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === "dark");

  const toggleTheme = () => setIsDark(!isDark);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
