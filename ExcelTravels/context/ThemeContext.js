import React, { createContext, useContext, useState, useEffect } from "react";
import { Appearance } from "react-native";

const ThemeContext = createContext();

const lightTheme = {
  background: "#F5F7FA",
  text: "#2D3748",
  card: "#FFF7F0",
  accent: "#FF7A45",
  // button: "#FF7A45", // Added button color for the toggle buttons
};

const darkTheme = {
  background: "#1A1A1A",
  text: "#F5F7FA",
  card: "#2A2A2A",
  accent: "#FF7A45",
  // button: "#FF7A45", // Added button color for the toggle buttons
};

export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(
    Appearance.getColorScheme() === "dark"
  );

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDarkTheme(colorScheme === "dark");
    });
    return () => subscription.remove();
  }, []);

  const toggleTheme = () => setIsDarkTheme(!isDarkTheme);

  const theme = isDarkTheme ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        isDarkTheme, // Make sure to provide this value
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
