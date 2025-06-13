import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { storeDriverData, clearDriverData } from "../utils/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [driver, setDriver] = useState(null); // Add driver state

  useEffect(() => {
    // Check for existing token on app start
    const bootstrapAsync = async () => {
      let token;
      try {
        token = await SecureStore.getItemAsync('userToken');
      } catch (e) {
        console.log('Restoring token failed', e);
      }
      setUserToken(token);
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    signIn: async (token, driverData) => {
      await SecureStore.setItemAsync('userToken', token);
      await storeDriverData(driverData, token); // Store in AsyncStorage
      setUserToken(token);
      setDriver(driverData); // Set driver data in context
    },
    signOut: async () => {
      try {
        await SecureStore.deleteItemAsync('userToken');
        await clearDriverData();
        setUserToken(null);
        setDriver(null); // Clear driver data
      } catch (error) {
        console.error("Sign out error:", error);
        throw error;
      }
    },
    userToken,
    isLoading,
    driver
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};