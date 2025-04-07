import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import LoginScreen from "../components/Screens/LoginScreen";
import MainScreen from "../components/Screens/MainScreen";
import DutySlipInfoScreen from "../components/Screens/DutySlipInfoScreen";
import TripLogScreen from "../components/Screens/TripLogScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="DutySlipInfo" component={DutySlipInfoScreen} />
        <Stack.Screen name="SignatureScreen" component={TripLogScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
