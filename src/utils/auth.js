import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeDriverData = async (driverData) => {
  try {
    await AsyncStorage.setItem('driverData', JSON.stringify(driverData));
  } catch (error) {
    console.error('Error storing driver data:', error);
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
    console.error('Error getting driver ID:', error);
    return null;
  }
};

export const clearDriverData = async () => {
  try {
    await AsyncStorage.removeItem('driverData');
  } catch (error) {
    console.error('Error clearing driver data:', error);
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
    // Consider adding error handling/recovery here
  }
};