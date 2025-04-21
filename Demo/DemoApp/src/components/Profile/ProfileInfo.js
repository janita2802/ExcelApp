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
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
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
  });

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [uploadStatus, setUploadStatus] = useState(null);
  const [profilePic, setProfilePic] = useState(
    require("./.././../../assets/profile.png")
  );
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

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
          profilePic: driverData.profilePic || null,
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

  const pickImage = async () => {
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
              quality: 0.7,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
              try {
                const compressedImage = await ImageManipulator.manipulateAsync(
                  result.assets[0].uri,
                  [{ resize: { width: 500 } }],
                  { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
                );
                setProfilePic({ uri: compressedImage.uri });
                await uploadProfilePicture(compressedImage.uri); // Immediately upload
              } catch (error) {
                console.error("Image processing error:", error);
                setUploadStatus({
                  type: "error",
                  message: "Failed to process image",
                });
              }
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
              quality: 0.7,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
              try {
                const compressedImage = await ImageManipulator.manipulateAsync(
                  result.assets[0].uri,
                  [{ resize: { width: 500 } }],
                  { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
                );
                setProfilePic({ uri: compressedImage.uri });
                await uploadProfilePicture(compressedImage.uri); // Immediately upload
              } catch (error) {
                console.error("Image processing error:", error);
                setUploadStatus({
                  type: "error",
                  message: "Failed to process image",
                });
              }
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

  const handleProfileChange = (name, value) => {
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (name, value) => {
    setPassword((prev) => ({ ...prev, [name]: value }));
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

  const uploadProfilePicture = async (imageUri) => {
    if (!imageUri || !imageUri.startsWith("file://")) {
      return null;
    }

    try {
      setUploadStatus({ type: "loading", message: "Uploading..." });

      const driverId = await getDriverId();
      const formData = new FormData();
      formData.append("profilePic", {
        uri: imageUri,
        name: `profile-${driverId}.jpg`,
        type: "image/jpeg",
      });

      const response = await api.post(
        `/drivers/${driverId}/profile-pic`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfilePic({ uri: response.data.profilePic });
      setUploadStatus({ type: "success", message: "Profile picture updated!" });

      // Clear the status after 3 seconds
      setTimeout(() => setUploadStatus(null), 3000);

      return response.data.profilePic;
    } catch (error) {
      console.error("Profile picture upload error:", error);
      setUploadStatus({ type: "error", message: "Upload failed" });
      throw new Error("Failed to upload profile picture");
    }
  };

  const updateProfile = async () => {
    setIsLoading(true);
    try {
      // Upload profile picture if changed
      let newProfilePicUrl = null;
      if (profilePic.uri && profilePic.uri.startsWith("file://")) {
        newProfilePicUrl = await uploadProfilePicture();
      }

      // Update local state if picture was uploaded
      if (newProfilePicUrl) {
        setProfilePic({ uri: newProfilePicUrl });
      }

      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async () => {
    setIsPasswordLoading(true);
    try {
      // Validate password fields
      if (!password.currentPassword) {
        throw new Error("Current password is required");
      }

      if (!password.newPassword) {
        throw new Error("New password is required");
      }

      if (password.newPassword !== password.confirmPassword) {
        throw new Error("New passwords don't match");
      }

      if (password.newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      // Prepare data to send
      const dataToSend = {
        contact: profile.contact,
        newPassword: password.newPassword,
        currentPassword: password.currentPassword,
        isReset: false,
      };

      const response = await api.post("/auth/change-password", dataToSend);

      if (response.data.success) {
        Alert.alert("Success", "Password updated successfully", [
          {
            text: "OK",
            onPress: () => {
              // Clear password fields after successful update
              setPassword({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
            },
          },
        ]);
      } else {
        throw new Error(response.data.message || "Failed to update password");
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
      } else {
        errorMessage = error.message || "Failed to update password";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsPasswordLoading(false);
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
        {uploadStatus && (
          <Text
            style={[
              styles.uploadStatus,
              uploadStatus.type === "success"
                ? styles.uploadSuccess
                : uploadStatus.type === "error"
                ? styles.uploadError
                : styles.uploadLoading,
            ]}
          >
            {uploadStatus.message}
          </Text>
        )}

        <Text style={styles.changePhotoText}>Change Profile Photo</Text>
      </View>

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
        <Text style={styles.sectionHeaderText}>Change Password</Text>
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
            value={password.currentPassword}
            onChangeText={(text) =>
              handlePasswordChange("currentPassword", text)
            }
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
            value={password.newPassword}
            onChangeText={(text) => handlePasswordChange("newPassword", text)}
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
            value={password.confirmPassword}
            onChangeText={(text) =>
              handlePasswordChange("confirmPassword", text)
            }
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

      <TouchableOpacity
        style={styles.saveButton}
        onPress={changePassword}
        disabled={isPasswordLoading}
      >
        {isPasswordLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Change Password</Text>
        )}
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
  uploadStatus: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
  },
  uploadSuccess: {
    color: "green",
  },
  uploadError: {
    color: "red",
  },
  uploadLoading: {
    color: "#800000",
  },
});

export default ProfileInfo;
