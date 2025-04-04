import { createStackNavigator } from "@react-navigation/stack";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext"; // New context

import { NavigationContainer } from "@react-navigation/native";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

import LoginScreen from "./components/LoginScreen";
import WelcomeScreen from "./components/WelcomeScreen";
import DutySlipScreen from "./components/DutySlipScreen";

const Stack = createStackNavigator();

const ThemeToggleFloating = () => {
  const { toggleTheme, theme } = useTheme();
  const { toggleLanguage, currentLanguage } = useLanguage(); // New language hook

  return (
    <View style={styles.floatingContainer}>
      <TouchableOpacity
        onPress={toggleLanguage}
        style={[styles.floatingBtn, { backgroundColor: theme.button }]}
      >
        <Text style={{ color: "#fff", fontSize: 18 }}>
          {currentLanguage === "en"
            ? "🌐"
            : currentLanguage === "es"
            ? "🇪🇸"
            : "🇮🇳"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={toggleTheme}
        style={[
          styles.floatingBtn,
          { backgroundColor: theme.button, marginLeft: 10 },
        ]}
      >
        <Text style={{ color: "#fff", fontSize: 18 }}>🌓</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        {" "}
        {/* Wrap with LanguageProvider */}
        <NavigationContainer>
          <View style={{ flex: 1, position: "relative" }}>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="DutySlipInfo"
                component={DutySlipScreen}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>

            {/* Floating buttons placed outside screen content */}
            <ThemeToggleFloating />
          </View>
        </NavigationContainer>
      </LanguageProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    top: 40,
    right: 20,
    flexDirection: "row",
    zIndex: 9999,
  },
  floatingBtn: {
    padding: 12,
    borderRadius: 30,
    elevation: 5,
  },
});
