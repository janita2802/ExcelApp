import { createStackNavigator } from "@react-navigation/stack";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { NavigationContainer } from "@react-navigation/native";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import LoginScreen from "./components/LoginScreen";
import WelcomeScreen from "./components/WelcomeScreen";
import DutySlipScreen from "./components/DutySlipScreen";

const Stack = createStackNavigator();

const ThemeToggleFloating = () => {
  const { toggleTheme, theme, isDarkTheme } = useTheme();
  const { toggleLanguage, currentLanguage } = useLanguage();

  return (
    <View style={styles.floatingContainer}>
      <TouchableOpacity
        onPress={toggleLanguage}
        style={[styles.floatingBtn, { backgroundColor: theme.button }]}
      >
        <Text style={{ color: "#fff", fontSize: 18, lineHeight: 40 }}>
          {currentLanguage === "en" ? "🌐" : "🇮🇳"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={toggleTheme}
        style={[styles.floatingBtn, { backgroundColor: theme.button }]}
      >
        <Text
          style={{
            color: isDarkTheme ? "#000" : "#FFF",
            fontSize: 18,
            lineHeight: 40,
          }}
        >
          {isDarkTheme ? "🌙" : "☀️"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        cardStyle: { backgroundColor: "transparent" },
      }}
    >
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
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: "transparent" },
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="DutySlipInfo" component={DutySlipScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        <ThemeToggleFloating />
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
