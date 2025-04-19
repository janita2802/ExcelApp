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
import api from "../../utils/api";
import { getDriverId } from "../../utils/auth";

const ProfileInfo = ({ navigation, route }) => {
  const [profile, setProfile] = useState({
    driverId: "",
    name: "",
    email: "",
    contact: "",
    age: "",
    address: "",
    licenseNumber: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profilePic, setProfilePic] = useState(
    require("./.././../../assets/profile.png")
  );
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (route.params?.driver) {
      const { driver } = route.params;
      setProfile((prev) => ({
        ...prev,
        driverId: driver.driverId || "",
        name: driver.name || "",
        email: driver.email || "",
        contact: driver.contact || driver.phone || "",
        age: String(driver.age) || "",
        address: driver.address || "",
        licenseNumber: driver.licenseNumber || "",
      }));

      if (driver.profilePic) {
        setProfilePic({ uri: driver.profilePic });
      }
    }
  }, [route.params?.driver]);

  useEffect(() => {
    const fetchDriverProfile = async () => {
      try {
        const driverId = await getDriverId();
        if (!driverId) {
          navigation.navigate("Login");
          return;
        }

        const response = await api.get(`/drivers/${driverId}`);
        const driverData = response.data;

        setProfile((prev) => ({
          ...prev,
          driverId: driverData.driverId || "",
          name: driverData.name || "",
          email: driverData.email || "",
          contact: driverData.contact || "",
          age: String(driverData.age) || "",
          address: driverData.address || "",
          licenseNumber: driverData.licenseNumber || "",
        }));

        if (driverData.profilePic) {
          setProfilePic({ uri: driverData.profilePic });
        }
      } catch (error) {
        console.error("Failed to fetch driver profile:", error);
        Alert.alert("Error", "Could not load profile data");
      }
    };

    if (!route.params?.driver) {
      fetchDriverProfile();
    }
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

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };
  const handleSave = async () => {
    // Validate password fields
    if (
      profile.newPassword ||
      profile.confirmPassword ||
      profile.currentPassword
    ) {
      if (!profile.currentPassword) {
        Alert.alert("Error", "Please enter your current password");
        return;
      }

      if (profile.newPassword !== profile.confirmPassword) {
        Alert.alert("Error", "New passwords don't match");
        return;
      }

      if (profile.newPassword.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters long");
        return;
      }
    }

    try {
      // Get the driver's contact number from profile
      const contact = profile.contact;
      if (!contact) {
        Alert.alert("Error", "Could not find your contact information");
        return;
      }

      // Prepare data to send - matches your backend endpoint
      const dataToSend = {
        contact,
        newPassword: profile.newPassword,
        confirmPassword: profile.confirmPassword,
        currentPassword: profile.currentPassword,
        isReset: false, // Since this is a profile password change, not a reset
      };

      // Use the correct endpoint from your backend
      const response = await api.post("/auth/change-password", dataToSend);

      if (response.data.success) {
        Alert.alert("Success", "Password updated successfully", [
          {
            text: "OK",
            onPress: () => {
              // Clear password fields after successful update
              setProfile((prev) => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              }));
            },
          },
        ]);
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to update password"
        );
      }
    } catch (error) {
      console.error("Password update error:", error);
      let errorMessage = "Failed to update password";

      if (error.response) {
        // Handle different status codes
        if (error.response.status === 404) {
          errorMessage =
            "Password update endpoint not found. Please contact support.";
        } else if (error.response.status === 401) {
          errorMessage = "Current password is incorrect";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage =
          "No response from server. Please check your internet connection.";
      }

      Alert.alert("Error", errorMessage);
    }
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

      {/* Disabled fields - shown for reference but not editable */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>ID</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={profile.driverId}
          editable={false}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>User Name</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={profile.name}
          editable={false}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={profile.email}
          editable={false}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={profile.contact}
          editable={false}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={profile.age}
          editable={false}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={profile.address}
          editable={false}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Driver License Number</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={profile.licenseNumber}
          editable={false}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>Password Settings</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Current Password</Text>
        <View
          style={[
            styles.passwordInputContainer,
            focusedField === "currentPassword" && styles.inputFocusedContainer,
          ]}
        >
          <TextInput
            style={styles.passwordInput}
            value={profile.currentPassword}
            onChangeText={(text) => handleChange("currentPassword", text)}
            placeholder="Enter current password"
            secureTextEntry={!showPassword.current}
            onFocus={() => handleFocus("currentPassword")}
            onBlur={handleBlur}
          />
          <TouchableOpacity
            onPress={() => togglePasswordVisibility("current")}
            style={styles.eyeIcon}
          >
            <Icon
              name={showPassword.current ? "visibility" : "visibility-off"}
              size={20}
              color="#800000"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>New Password</Text>
        <View
          style={[
            styles.passwordInputContainer,
            focusedField === "newPassword" && styles.inputFocusedContainer,
          ]}
        >
          <TextInput
            style={styles.passwordInput}
            value={profile.newPassword}
            onChangeText={(text) => handleChange("newPassword", text)}
            placeholder="Enter new password"
            secureTextEntry={!showPassword.new}
            onFocus={() => handleFocus("newPassword")}
            onBlur={handleBlur}
          />
          <TouchableOpacity
            onPress={() => togglePasswordVisibility("new")}
            style={styles.eyeIcon}
          >
            <Icon
              name={showPassword.new ? "visibility" : "visibility-off"}
              size={20}
              color="#800000"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Confirm New Password</Text>
        <View
          style={[
            styles.passwordInputContainer,
            focusedField === "confirmPassword" && styles.inputFocusedContainer,
          ]}
        >
          <TextInput
            style={styles.passwordInput}
            value={profile.confirmPassword}
            onChangeText={(text) => handleChange("confirmPassword", text)}
            placeholder="Confirm new password"
            secureTextEntry={!showPassword.confirm}
            onFocus={() => handleFocus("confirmPassword")}
            onBlur={handleBlur}
          />
          <TouchableOpacity
            onPress={() => togglePasswordVisibility("confirm")}
            style={styles.eyeIcon}
          >
            <Icon
              name={showPassword.confirm ? "visibility" : "visibility-off"}
              size={20}
              color="#800000"
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Update Password</Text>
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
  disabledInput: {
    color: "#888",
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
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  inputFocusedContainer: {
    borderColor: "#800000",
    borderWidth: 2,
  },
  eyeIcon: {
    padding: 5,
  },
});

export default ProfileInfo;
