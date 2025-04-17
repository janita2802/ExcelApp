import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
// import DateTimePicker from "@react-native-community/datetimepicker";
import api from "../../utils/api";
import { getDriverId } from '../../utils/auth';

const ProfileInfo = ({ navigation, route }) => {

  // 1. First try to use data passed through navigation params
  useEffect(() => {
    if (route.params?.driver) {
      const { driver } = route.params;
      setProfile({
        driverId: driver.driverId || "",
        name: driver.name || "",
        email: driver.email || "",
        contact: driver.contact || driver.phone || "",
        age: driver.age || "",
        address: driver.address || "",
        licenseNumber: driver.licenseNumber || "",
        // Keep password fields empty
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      // If driver has a profile picture URL
      if (driver.profilePic) {
        setProfilePic({ uri: driver.profilePic });
      }
    }
  }, [route.params?.driver]);

  // 2. If no params, fetch fresh data from API
  useEffect(() => {
    const fetchDriverProfile = async () => {
      try {
        const driverId = await getDriverId();
        if (!driverId) {
          navigation.navigate('Login');
          return;
        }

        const response = await api.get(`/drivers/${driverId}`);
        const driverData = response.data;
        
        setProfile({
          driverId: driverData.driverId || "",
          name: driverData.name || "",
          email: driverData.email || "",
          contact: driverData.contact || "",
          age: driverData.age || "",
          address: driverData.address || "",
          licenseNumber: driverData.licenseNumber || "",
          // Keep password fields empty
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        if (driverData.profilePic) {
          setProfilePic({ uri: driverData.profilePic });
        }
      } catch (error) {
        console.error("Failed to fetch driver profile:", error);
        Alert.alert("Error", "Could not load profile data");
      }
    };

    // Only fetch if we didn't get data from navigation params
    if (!route.params?.driver) {
      fetchDriverProfile();
    }
  }, []);

  const [profile, setProfile] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profilePic, setProfilePic] = useState(
    require("C:/Users/gaura/WebProjects/ExcelApp/Demo/DemoApp/assets/profile.png")
  );
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const mediaStatus =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (
          mediaStatus.status !== "granted" ||
          cameraStatus.status !== "granted"
        ) {
          Alert.alert(
            "Permission Required",
            "Camera and gallery access needed."
          );
        }
      }
    })();
  }, []);

  const pickImage = () => {
    Alert.alert(
      "Upload Photo",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: async () => {
            const permission =
              await ImagePicker.requestCameraPermissionsAsync();
            if (permission.status !== "granted") {
              Alert.alert("Permission Denied", "Camera access is required.");
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 1,
            });

            if (!result.canceled) {
              setProfilePic({ uri: result.assets[0].uri });
            }
          },
        },
        {
          text: "Choose from Gallery",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 1,
            });

            if (!result.canceled) {
              setProfilePic({ uri: result.assets[0].uri });
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleChange = (name, value) => {
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      handleChange("dob", selectedDate);
    }
  };

  const handleSave = async () => {
    if (
      profile.newPassword &&
      profile.newPassword !== profile.confirmPassword
    ) {
      Alert.alert("Error", "New passwords don't match");
      return;
    }

    // Here you would typically send the data to your backend
    console.log("Profile data to save:", profile);

    const driverId = await getDriverId();
    if (!driverId) {
      navigation.navigate('Login');
      return;
    }

    try {
      await api.put(`/drivers/${driverId}`, profile);
      // await refreshProfile();
      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#800000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profilePicContainer}>
          <Image source={profilePic} style={styles.profilePic} />
          <TouchableOpacity style={styles.cameraIcon} onPress={pickImage}>
            <Icon name="photo-camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.changePhotoBtn} onPress={pickImage}>
          <Text style={styles.changePhotoText}>Change Profile Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>ID</Text>
        <TextInput
          style={[
            styles.input,
            focusedField === "name" && styles.inputFocused,
          ]}
          value={profile.driverId}
          editable={false}
          selectTextOnFocus={false}
          // onChangeText={(text) => handleChange("name", text)}
          placeholder="Enter your ID"
          // onFocus={() => handleFocus("driverId")}
          // onBlur={handleBlur}
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={[
            styles.input,
            focusedField === "name" && styles.inputFocused,
          ]}
          value={profile.name}
          onChangeText={(text) => handleChange("name", text)}
          placeholder="Enter your full name"
          onFocus={() => handleFocus("name")}
          onBlur={handleBlur}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[
            styles.input,
            focusedField === "email" && styles.inputFocused,
          ]}
          value={profile.email}
          onChangeText={(text) => handleChange("email", text)}
          placeholder="Enter your email"
          keyboardType="email-address"
          onFocus={() => handleFocus("email")}
          onBlur={handleBlur}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={[
            styles.input,
            focusedField === "phone" && styles.inputFocused,
          ]}
          value={profile.contact}
          onChangeText={(text) => handleChange("phone", text)}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          onFocus={() => handleFocus("phone")}
          onBlur={handleBlur}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={[
            styles.input,
            focusedField === "age" && styles.inputFocused,
          ]}
          value={profile.age}
          onChangeText={(text) => handleChange("age", text)}
          placeholder="Enter your age"
          keyboardType="phone-pad"
          onFocus={() => handleFocus("age")}
          onBlur={handleBlur}
        />
      </View>

      {/* <View style={styles.formGroup}>
        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity
          style={[
            styles.input,
            styles.dateInput,
            focusedField === "dob" && styles.inputFocused,
          ]}
          onPress={() => {
            setShowDatePicker(true);
            handleFocus("dob");
          }}
        >
          <Text style={styles.dateText}>{formatDate(profile.dob)}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={profile.dob}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </View> */}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[
            styles.input,
            focusedField === "address" && styles.inputFocused,
          ]}
          value={profile.address}
          onChangeText={(text) => handleChange("address", text)}
          placeholder="Enter your address"
          onFocus={() => handleFocus("address")}
          onBlur={handleBlur}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Driver License Number</Text>
        <TextInput
          style={[
            styles.input,
            focusedField === "licenseNumber" && styles.inputFocused,
          ]}
          value={profile.licenseNumber}
          onChangeText={(text) => handleChange("licenseNumber", text)}
          placeholder="Enter your license number"
          onFocus={() => handleFocus("licenseNumber")}
          onBlur={handleBlur}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>Password Settings</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Current Password</Text>
        <TextInput
          style={[
            styles.input,
            focusedField === "currentPassword" && styles.inputFocused,
          ]}
          value={profile.currentPassword}
          onChangeText={(text) => handleChange("currentPassword", text)}
          placeholder="Enter current password"
          secureTextEntry
          onFocus={() => handleFocus("currentPassword")}
          onBlur={handleBlur}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={[
            styles.input,
            focusedField === "newPassword" && styles.inputFocused,
          ]}
          value={profile.newPassword}
          onChangeText={(text) => handleChange("newPassword", text)}
          placeholder="Enter new password"
          secureTextEntry
          onFocus={() => handleFocus("newPassword")}
          onBlur={handleBlur}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          style={[
            styles.input,
            focusedField === "confirmPassword" && styles.inputFocused,
          ]}
          value={profile.confirmPassword}
          onChangeText={(text) => handleChange("confirmPassword", text)}
          placeholder="Confirm new password"
          secureTextEntry
          onFocus={() => handleFocus("confirmPassword")}
          onBlur={handleBlur}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F5",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 15,
    color: "#800000",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profilePicContainer: {
    position: "relative",
    marginBottom: 10,
  },
  profilePic: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: "#800000",
  },
  cameraIcon: {
    position: "absolute",
    right: 5,
    bottom: 5,
    backgroundColor: "#800000",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  changePhotoBtn: {
    padding: 10,
  },
  changePhotoText: {
    color: "#800000",
    fontWeight: "600",
    fontSize: 16,
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginVertical: 15,
    paddingBottom: 5,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#800000",
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    marginBottom: 8,
    fontWeight: "600",
    color: "#555",
    fontSize: 15,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputFocused: {
    borderColor: "#800000",
    borderWidth: 2,
    shadowColor: "#800000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  dateInput: {
    justifyContent: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 2,
  },
  saveButton: {
    backgroundColor: "#800000",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 25,
    marginBottom: 30,
    shadowColor: "#800000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
});

export default ProfileInfo;
