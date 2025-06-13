import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export const storeDriverData = async (driverData, token) => {
  try {
    await AsyncStorage.setItem('driverData', JSON.stringify(driverData));
    await SecureStore.setItemAsync('authToken', token);
  } catch (error) {
    console.error('Error storing driver data:', error);
    throw error;
  }
};

export const getDriverId = async () => {
  try {
    const driverData = await AsyncStorage.getItem('driverData');
    return driverData ? JSON.parse(driverData).driverId : null;
  } catch (error) {
    console.error('Error getting driver ID:', error);
    return null;
  }
};

export const getDriverData = async () => {
  try {
    const driverData = await AsyncStorage.getItem('driverData');
    return driverData ? JSON.parse(driverData) : null;
  } catch (error) {
    console.error('Error getting driver data:', error);
    return null;
  }
};

// Get stored auth token
export const getAuthToken = async () => {
  try {
    return await SecureStore.getItemAsync('authToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Clear all auth data
export const clearDriverData = async () => {
  try {
    await AsyncStorage.removeItem('driverData');
    await SecureStore.deleteItemAsync('authToken');
  } catch (error) {
    console.error('Error clearing driver data:', error);
    throw error;
  }
};

// Verify token validity (optional - could be used for periodic checks)
export const verifyToken = async () => {
  try {
    const token = await getAuthToken();
    if (!token) return false;
    
    // Here you could add logic to verify token with backend
    // or check expiration if you store it in the token
    return true;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};

export const updateDriverProfilePic = async (profilePic) => {
  try {
    const driverData = await getDriverData();
    
    // Check if driverData exists and is valid
    if (!driverData) {
      throw new Error('No driver data found');
    }

    // Ensure profilePic is a valid string
    if (typeof profilePic !== 'string' || profilePic.trim() === '') {
      throw new Error('Invalid profile picture URL');
    }

    // Create a new object with updated profile picture
    const updatedDriverData = {
      ...driverData,
      profilePic: profilePic
    };

    await storeDriverData(updatedDriverData);
  } catch (error) {
    console.error('Error updating driver profile picture:', error);
    throw error;
  }
};