import React, { useState, useRef, useEffect } from "react";
import DutyInfoPreview from "./DutyInfoPreview";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Alert,
  SafeAreaView,
  Modal,
  Platform,
  PermissionsAndroid,
  KeyboardAvoidingView,
} from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import SignatureScreen from "react-native-signature-canvas";
import Header from "../Common/Header";
import Footer from "../Common/Footer";
import Menu from "../Common/Menu";

const TripLogScreen = ({ navigation, route }) => {
  const dutySlipId = 11;
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("startKm");
  const [startKmImage, setStartKmImage] = useState(null);
  const [endKmImage, setEndKmImage] = useState(null);
  const [signature, setSignature] = useState(null);
  const [manualStartKm, setManualStartKm] = useState("");
  const [manualEndKm, setManualEndKm] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [currentImageType, setCurrentImageType] = useState(null);
  const [isSignatureSaved, setIsSignatureSaved] = useState(false);
  const signatureRef = useRef();

  const dutyInfo = route.params?.dutyInfo || {
    id: "DS-12345",
    category: "Sedan AC",
    pickupTime: "10:30 AM, 4th April 2025",
  };

  useEffect(() => {
    // Update signature saved status when signature changes
    setIsSignatureSaved(!!signature);
  }, [signature]);

  const handleLogout = () => {
    navigation.navigate("Login");
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs access to your camera",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        if (Platform.Version >= 33) {
          const photoGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          );
          return (
            granted === PermissionsAndroid.RESULTS.GRANTED &&
            photoGranted === PermissionsAndroid.RESULTS.GRANTED
          );
        }
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          Platform.Version >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleImageSelection = (type) => {
    setCurrentImageType(type);
    setShowImagePicker(true);
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        "Permission required",
        "Camera permission is needed to take photos"
      );
      return;
    }

    const options = {
      mediaType: "photo",
      quality: 0.8,
      saveToPhotos: true,
      cameraType: "back",
      includeBase64: false,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled camera");
      } else if (response.errorCode) {
        Alert.alert("Error", response.errorMessage || "Camera error occurred");
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        if (currentImageType === "start") {
          setStartKmImage(uri);
        } else {
          setEndKmImage(uri);
        }
      }
    });
  };

  const handleSelectFromGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert(
        "Permission required",
        "Storage permission is needed to access photos"
      );
      return;
    }

    const options = {
      mediaType: "photo",
      quality: 0.8,
      includeBase64: false,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorCode) {
        Alert.alert("Error", response.errorMessage || "Image picker error");
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        if (currentImageType === "start") {
          setStartKmImage(uri);
        } else {
          setEndKmImage(uri);
        }
      }
    });
  };

  const handleSaveSignature = () => {
    signatureRef.current?.readSignature();
  };

  const handleSavedSignature = (signatureResult) => {
    if (signatureResult) {
      setSignature(signatureResult.encoded);
      setIsSignatureSaved(true);
      Alert.alert("Success", "Signature saved successfully");
    }
  };

  const handleClearSignature = () => {
    signatureRef.current?.clearSignature();
    setSignature(null);
    setIsSignatureSaved(false);
  };

  const allStepsCompleted = () => {
    return (
      (startKmImage || manualStartKm) &&
      isSignatureSaved &&
      (endKmImage || manualEndKm)
    );
  };

  const handleCompleteStep = () => {
    switch (activeTab) {
      case "startKm":
        if (startKmImage || manualStartKm) {
          setActiveTab("customerSign");
        } else {
          Alert.alert(
            "Required",
            "Please capture start KM photo or enter manually"
          );
        }
        break;
      case "customerSign":
        if (isSignatureSaved) {
          setActiveTab("endKm");
        } else {
          Alert.alert("Required", "Please save customer signature first");
        }
        break;
      case "endKm":
        if (endKmImage || manualEndKm) {
          // All steps completed, show completion options
        } else {
          Alert.alert(
            "Required",
            "Please capture end KM photo or enter manually"
          );
        }
        break;
    }
  };

  const submitTripData = async () => {
    try {
      const tripData = {
        dutySlipId,
        startKm: {
          image: startKmImage,
          manualValue: manualStartKm,
          timestamp: new Date().toISOString(),
        },
        customerSignature: signature,
        endKm: {
          image: endKmImage,
          manualValue: manualEndKm,
          timestamp: new Date().toISOString(),
        },
        completedAt: new Date().toISOString(),
      };

      console.log("Submitting trip data:", tripData);
      Alert.alert("Success", "Trip data submitted successfully!");
      navigation.navigate("Main");
    } catch (error) {
      console.error("Error submitting trip data:", error);
      Alert.alert("Error", "Failed to submit trip data. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header onMenuPress={() => setMenuVisible(true)} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          scrollEnabled={activeTab !== "customerSign"}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Trip Log - #{dutySlipId}</Text>

          {/* Progress Steps */}
          <View style={styles.stepsContainer}>
            <TouchableOpacity
              style={[
                styles.step,
                activeTab === "startKm" && styles.activeStep,
                (startKmImage || manualStartKm) && styles.completedStep,
              ]}
              onPress={() => setActiveTab("startKm")}
            >
              <Text style={styles.stepText}>Start KM</Text>
            </TouchableOpacity>

            <View style={styles.stepDivider} />

            <TouchableOpacity
              style={[
                styles.step,
                activeTab === "customerSign" && styles.activeStep,
                isSignatureSaved && styles.completedStep,
              ]}
              onPress={() => setActiveTab("customerSign")}
            >
              <Text style={styles.stepText}>Signature</Text>
            </TouchableOpacity>

            <View style={styles.stepDivider} />

            <TouchableOpacity
              style={[
                styles.step,
                activeTab === "endKm" && styles.activeStep,
                (endKmImage || manualEndKm) && styles.completedStep,
              ]}
              onPress={() => setActiveTab("endKm")}
            >
              <Text style={styles.stepText}>End KM</Text>
            </TouchableOpacity>
          </View>

          {/* Start KM Section */}
          {activeTab === "startKm" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Starting Kilometer</Text>

              <View style={styles.imageOptionsContainer}>
                <TouchableOpacity
                  style={[styles.imageOptionButton, styles.captureButton]}
                  onPress={() => handleImageSelection("start")}
                >
                  <Text style={styles.buttonText}>Add Odometer Image</Text>
                </TouchableOpacity>
              </View>

              {startKmImage && (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: startKmImage }}
                    style={styles.imagePreview}
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setStartKmImage(null)}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.orText}>OR</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter KM manually"
                placeholderTextColor="#999"
                value={manualStartKm}
                onChangeText={setManualStartKm}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
          )}

          {/* Customer Signature Section */}
          {activeTab === "customerSign" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Signature</Text>

              <View style={styles.signatureContainer}>
                <SignatureScreen
                  ref={signatureRef}
                  onOK={handleSavedSignature}
                  onEmpty={() => {
                    setSignature(null);
                    setIsSignatureSaved(false);
                  }}
                  descriptionText="Sign above"
                  clearText="Clear"
                  confirmText="Save"
                  webStyle={`.m-signature-pad {background-color: #fff; border: none; box-shadow: none;}`}
                  style={styles.signaturePad}
                  autoClear={false}
                  backgroundColor="white"
                  penColor="black"
                />
              </View>

              <View style={styles.signatureButtons}>
                <TouchableOpacity
                  style={[styles.signatureButton, styles.clearButton]}
                  onPress={handleClearSignature}
                >
                  <Text style={styles.signatureButtonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.signatureButton, styles.saveButton]}
                  onPress={handleSaveSignature}
                >
                  <Text style={styles.signatureButtonText}>Save Signature</Text>
                </TouchableOpacity>
              </View>

              {signature && (
                <View style={styles.signaturePreviewContainer}>
                  <Text style={styles.previewLabel}>Signature Preview:</Text>
                  <Image
                    source={{ uri: `data:image/png;base64,${signature}` }}
                    style={styles.signaturePreview}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>
          )}

          {/* End KM Section */}
          {activeTab === "endKm" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ending Kilometer</Text>

              <View style={styles.imageOptionsContainer}>
                <TouchableOpacity
                  style={[styles.imageOptionButton, styles.captureButton]}
                  onPress={() => handleImageSelection("end")}
                >
                  <Text style={styles.buttonText}>Add Odometer Image</Text>
                </TouchableOpacity>
              </View>

              {endKmImage && (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: endKmImage }}
                    style={styles.imagePreview}
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setEndKmImage(null)}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.orText}>OR</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter KM manually"
                placeholderTextColor="#999"
                value={manualEndKm}
                onChangeText={setManualEndKm}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
          )}

          {activeTab === "endKm" && allStepsCompleted() ? (
            <View style={styles.completionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.previewButton]}
                onPress={() => setShowPreview(true)}
              >
                <Text style={styles.buttonText}>PREVIEW TRIP</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={submitTripData}
              >
                <Text style={styles.buttonText}>COMPLETE TRIP</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleCompleteStep}
            >
              <Text style={styles.buttonText}>
                {activeTab === "endKm" ? "FINISH TRIP" : "NEXT STEP"}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.imagePickerModal}>
          <View style={styles.imagePickerOptions}>
            <Text style={styles.imagePickerTitle}>Select Image Source</Text>
            <TouchableOpacity
              style={styles.imagePickerOption}
              onPress={() => {
                setShowImagePicker(false);
                handleTakePhoto();
              }}
            >
              <Text style={styles.imagePickerOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imagePickerOption}
              onPress={() => {
                setShowImagePicker(false);
                handleSelectFromGallery();
              }}
            >
              <Text style={styles.imagePickerOptionText}>
                Choose from Gallery
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imagePickerCancel}
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.imagePickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal visible={showPreview} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Trip Preview</Text>

          <ScrollView style={styles.previewContent}>
            <DutyInfoPreview
              id={dutyInfo.id}
              category={dutyInfo.category}
              pickupTime={dutyInfo.pickupTime}
            />
            {/* Start KM Preview */}
            <View style={styles.previewSection}>
              <Text style={styles.previewSectionTitle}>Start KM</Text>
              {startKmImage ? (
                <Image
                  source={{ uri: startKmImage }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.previewText}>
                  Manual Entry: {manualStartKm} km
                </Text>
              )}
            </View>

            {/* Signature Preview */}
            <View style={styles.previewSection}>
              <Text style={styles.previewSectionTitle}>Customer Signature</Text>
              {signature && (
                <Image
                  source={{ uri: `data:image/png;base64,${signature}` }}
                  style={styles.signaturePreview}
                  resizeMode="contain"
                />
              )}
            </View>

            {/* End KM Preview */}
            <View style={styles.previewSection}>
              <Text style={styles.previewSectionTitle}>End KM</Text>
              {endKmImage ? (
                <Image
                  source={{ uri: endKmImage }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.previewText}>
                  Manual Entry: {manualEndKm} km
                </Text>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.closeButton]}
              onPress={() => setShowPreview(false)}
            >
              <Text style={styles.buttonText}>CLOSE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton]}
              onPress={() => {
                setShowPreview(false);
                submitTripData();
              }}
            >
              <Text style={styles.buttonText}>SUBMIT TRIP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Footer />

      <Menu
        onSelect={(screen) => navigation.navigate(screen)}
        onLogout={handleLogout}
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#800000",
    textAlign: "center",
    marginBottom: 20,
  },
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  step: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ccc",
  },
  activeStep: {
    borderColor: "#800000",
    backgroundColor: "#FFE5D0",
  },
  completedStep: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
  },
  stepText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  stepDivider: {
    flex: 1,
    height: 2,
    backgroundColor: "#ccc",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#800000",
    marginBottom: 15,
    textAlign: "center",
  },
  imageOptionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  imageOptionButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  captureButton: {
    backgroundColor: "#800000",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 15,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f5f5f5",
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  orText: {
    textAlign: "center",
    color: "#800000",
    marginVertical: 10,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#800000",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  signatureContainer: {
    height: 250,
    borderWidth: 1,
    borderColor: "#800000",
    borderRadius: 8,
    marginBottom: 15,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  signaturePad: {
    flex: 1,
    borderWidth: 0,
  },
  signatureButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  signatureButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  clearButton: {
    backgroundColor: "#8B0000", // firebrick
  },
  saveButton: {
    backgroundColor: "#6B8E23", // olive drab
  },
  signatureButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  signaturePreviewContainer: {
    marginTop: 10,
  },
  previewLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  signaturePreview: {
    width: "100%",
    height: 150,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#f5f5f5",
  },
  nextButton: {
    backgroundColor: "#800000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  completionButtons: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  previewButton: {
    backgroundColor: "#4CAF50",
  },
  completeButton: {
    backgroundColor: "#8B0000", // dark red
  },

  // Image Picker Modal Styles
  imagePickerModal: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  imagePickerOptions: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
  },
  imagePickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#800000",
  },
  imagePickerOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  imagePickerOptionText: {
    fontSize: 16,
    textAlign: "center",
  },
  imagePickerCancel: {
    padding: 15,
    marginTop: 10,
  },
  imagePickerCancelText: {
    fontSize: 16,
    textAlign: "center",
    color: "#f44336",
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#800000",
    textAlign: "center",
    marginBottom: 20,
  },
  previewContent: {
    flex: 1,
  },
  previewSection: {
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 15,
  },
  previewSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#800000",
    marginBottom: 10,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f5f5f5",
  },
  previewText: {
    fontSize: 16,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  closeButton: {
    backgroundColor: "#800000",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
  },
});

export default TripLogScreen;
