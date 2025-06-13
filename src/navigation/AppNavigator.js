import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { AuthContext } from "../context/AuthContext"; // You'll need to create this

// Screens
import LoginScreen from "../components/Screens/LoginScreen";
import MainScreen from "../components/Screens/MainScreen";
import DutySlipInfoScreen from "../components/Screens/DutySlipInfoScreen";
import TripLogScreen from "../components/Screens/TripLogScreen";
import ProfileInfo from "../components/Profile/ProfileInfo";
import DutyHistory from "../components/Profile/DutyHistory";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          // Authenticated screens
          <>
            <Stack.Screen name="Main">
              {(props) => <MainScreen {...props} />}
            </Stack.Screen>
            <Stack.Screen name="DutySlipInfo" component={DutySlipInfoScreen} />
            <Stack.Screen name="TripLog" component={TripLogScreen} />
            <Stack.Screen name="Profile" component={ProfileInfo} />
            <Stack.Screen name="History" component={DutyHistory} />
          </>
        ) : (
          // Auth screen
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}