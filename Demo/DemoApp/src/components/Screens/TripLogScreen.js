import React, { useState, useRef, useEffect } from "react";
import DutyInfoPreview from "./DutyInfoPreview";
// import axios from "axios";
import api from "../../utils/api";
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
  Keyboard,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import SignatureScreen from "react-native-signature-canvas";
import Header from "../Common/Header";
import Footer from "../Common/Footer";
import Menu from "../Common/Menu";

const TripLogScreen = ({ navigation, route }) => {
  const { dutySlipData } = route.params;
  const dutySlipId = dutySlipData?.id || "N/A";

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
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signatureRef = useRef();
  const scrollViewRef = useRef();

  const validateTripData = () => {
    if (!startKmImage || !manualStartKm) {
      Alert.alert("Validation Error", "Please provide start KM data");
      return false;
    }
    if (!endKmImage || !manualEndKm) {
      Alert.alert("Validation Error", "Please provide end KM data");
      return false;
    }
    if (!signature) {
      Alert.alert("Validation Error", "Please provide customer signature");
      return false;
    }
    return true;
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (signature) {
      setIsSignatureSaved(true);
    }
  }, [signature]);

  const handleLogout = () => {
    navigation.navigate("Login");
  };

  const handleImageSelection = (type) => {
    setCurrentImageType(type);
    setShowImagePicker(true);
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Permission required", "Camera access is needed");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const uri = result.assets[0].uri;
      if (currentImageType === "start") {
        setStartKmImage(uri);
      } else {
        setEndKmImage(uri);
      }
    }
    setShowImagePicker(false);
  };

  const handleSelectFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Permission required", "Gallery access is needed");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const uri = result.assets[0].uri;
      if (currentImageType === "start") {
        setStartKmImage(uri);
      } else {
        setEndKmImage(uri);
      }
    }
    setShowImagePicker(false);
  };

  const handleSaveSignature = () => {
    signatureRef.current?.readSignature();
  };

  const handleSavedSignature = async (signatureResult) => {
    try {
      if (!signatureResult) {
        throw new Error("No signature data received.");
      }

      const base64Signature = signatureResult.replace(
        "data:image/png;base64,",
        ""
      );
      setSignature(base64Signature);
      setIsSignatureSaved(true);
      Alert.alert("Success", "Signature saved successfully");
    } catch (error) {
      console.error("Error saving signature:", error);
      Alert.alert("Error", "Failed to save signature");
    }
  };

  const handleClearSignature = () => {
    signatureRef.current?.clearSignature();
    setSignature(null);
    setIsSignatureSaved(false);
  };

  const allStepsCompleted = () => {
    return (
      startKmImage &&
      manualStartKm &&
      isSignatureSaved &&
      endKmImage &&
      manualEndKm
    );
  };

  const handleCompleteStep = () => {
    switch (activeTab) {
      case "startKm":
        if (startKmImage && manualStartKm) {
          setActiveTab("customerSign");
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        } else {
          Alert.alert(
            "Required",
            "Both odometer image and manual entry are required for start KM"
          );
        }
        break;
      case "customerSign":
        if (isSignatureSaved) {
          setActiveTab("endKm");
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        } else {
          Alert.alert("Required", "Please save customer signature first");
        }
        break;
      case "endKm":
        if (endKmImage && manualEndKm) {
          // All steps completed
        } else {
          Alert.alert(
            "Required",
            "Both odometer image and manual entry are required for end KM"
          );
        }
        break;
    }
  };

  const submitTripData = async () => {
    setIsSubmitting(true);

    if (!validateTripData()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const getCurrentTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
      };

      const formData = new FormData();

      // Start KM Image
      if (startKmImage) {
        formData.append("startKmImage", {
          uri: startKmImage,
          type: "image/jpeg",
          name: "start_km.jpg",
        });
      }

      // End KM Image
      if (endKmImage) {
        formData.append("endKmImage", {
          uri: endKmImage,
          type: "image/jpeg",
          name: "end_km.jpg",
        });
      }

      // Add signature (as base64 string, since no file uri)
      if (signature) {
        formData.append(
          "customerSignature",
          `data:image/png;base64,${signature}`
        );
      }

      // Add other fields
      formData.append("manualStartKm", manualStartKm);
      formData.append("manualEndKm", manualEndKm);
      formData.append("timestampStart", getCurrentTime());
      formData.append("timestampEnd", getCurrentTime());
      formData.append("tollFees", "0");
      formData.append("parkingFees", "0");

      console.log("📤 Submitting trip data as FormData...");

      const response = await api.post(
        `/duty-slips/${dutySlipId}/complete`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          maxContentLength: 50 * 1024 * 1024,
          maxBodyLength: 50 * 1024 * 1024,
          timeout: 30000,
        }
      );

      console.log("✅ API Response:", response.data);

      if (
        response.data.success ||
        response.data.message === "Trip data saved successfully"
      ) {
        Alert.alert("Success", "Trip data submitted successfully!", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Main"),
          },
        ]);
      } else {
        throw new Error(
          response.data.message || "Unexpected response from server"
        );
      }
    } catch (error) {
      console.error("❌ Submission error:", error);

      let errorMessage = "Failed to submit trip data. Please try again.";

      if (error.response) {
        errorMessage =
          error.response.data.message ||
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage =
          "No response from server. Check your network connection.";
      } else {
        errorMessage = error.message || "An unexpected error occurred";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header onMenuPress={() => setMenuVisible(true)} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={activeTab !== "customerSign"}
        >
          <View style={styles.container}>
            <Text style={styles.title}>Trip Log - #{dutySlipId}</Text>

            <View style={styles.stepsContainer}>
              <TouchableOpacity
                style={[
                  styles.step,
                  activeTab === "startKm" && styles.activeStep,
                  startKmImage && manualStartKm && styles.completedStep,
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
                  endKmImage && manualEndKm && styles.completedStep,
                ]}
                onPress={() => setActiveTab("endKm")}
              >
                <Text style={styles.stepText}>End KM</Text>
              </TouchableOpacity>
            </View>

            {activeTab === "startKm" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Starting Kilometer</Text>

                <View style={styles.imageOptionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.imageOptionButton,
                      styles.captureButton,
                      !startKmImage && styles.requiredField,
                    ]}
                    onPress={() => handleImageSelection("start")}
                  >
                    <Text style={styles.buttonText}>
                      {startKmImage
                        ? "Odometer Image Added"
                        : "Add Odometer Image*"}
                    </Text>
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

                <Text style={styles.orText}>AND</Text>

                <TextInput
                  style={[styles.input, !manualStartKm && styles.requiredField]}
                  placeholder="Enter KM manually*"
                  placeholderTextColor="#999"
                  value={manualStartKm}
                  onChangeText={setManualStartKm}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>
            )}

            {activeTab === "customerSign" && (
              <View style={styles.signatureSection}>
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
                    imageType="image/png"
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
                    <Text style={styles.signatureButtonText}>
                      Save Signature
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {activeTab === "endKm" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ending Kilometer</Text>

                <View style={styles.imageOptionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.imageOptionButton,
                      styles.captureButton,
                      !endKmImage && styles.requiredField,
                    ]}
                    onPress={() => handleImageSelection("end")}
                  >
                    <Text style={styles.buttonText}>
                      {endKmImage
                        ? "Odometer Image Added"
                        : "Add Odometer Image*"}
                    </Text>
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

                <Text style={styles.orText}>AND</Text>

                <TextInput
                  style={[styles.input, !manualEndKm && styles.requiredField]}
                  placeholder="Enter KM manually*"
                  placeholderTextColor="#999"
                  value={manualEndKm}
                  onChangeText={setManualEndKm}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>
            )}
          </View>
          <View style={styles.actionButtonsContainer}>
            {activeTab !== "endKm" ? (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleCompleteStep}
              >
                <Text style={styles.buttonText}>NEXT STEP</Text>
              </TouchableOpacity>
            ) : allStepsCompleted() ? (
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>COMPLETE TRIP</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.nextButton, styles.disabledButton]}
                disabled={true}
              >
                <Text style={styles.buttonText}>
                  COMPLETE ALL FIELDS TO CONTINUE
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
              onPress={handleTakePhoto}
            >
              <Text style={styles.imagePickerOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imagePickerOption}
              onPress={handleSelectFromGallery}
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

      <Modal visible={showPreview} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Trip Preview</Text>

          <ScrollView style={styles.previewContent}>
            <DutyInfoPreview
              id={dutySlipData.id}
              category={dutySlipData.category}
              pickupTime={dutySlipData.pickupTime}
              party={dutySlipData.party}
              address={dutySlipData.address}
              contact={dutySlipData.contact}
              driverName={dutySlipData.driverName}
              carNumber={dutySlipData.carNumber}
              tripRoute={dutySlipData.tripRoute}
            />
            <View style={styles.previewSection}>
              <Text style={styles.previewSectionTitle}>Start KM</Text>
              {startKmImage && (
                <Image
                  source={{ uri: startKmImage }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              )}
              <Text style={styles.previewText}>
                Manual Entry: {manualStartKm} km
              </Text>
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.previewSectionTitle}>Customer Signature</Text>
              {signature ? (
                <Image
                  source={{ uri: `data:image/png;base64,${signature}` }}
                  style={styles.signaturePreview}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.previewText}>No signature saved</Text>
              )}
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.previewSectionTitle}>End KM</Text>
              {endKmImage && (
                <Image
                  source={{ uri: endKmImage }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              )}
              <Text style={styles.previewText}>
                Manual Entry: {manualEndKm} km
              </Text>
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
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  container: {
    padding: 20,
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
  signatureSection: {
    marginBottom: 10,
  },
  signatureContainer: {
    height: 200,
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
  requiredField: {
    borderColor: "#f44336",
    borderWidth: 2,
  },
  signatureButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    backgroundColor: "#8B0000",
  },
  saveButton: {
    backgroundColor: "#6B8E23",
  },
  signatureButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  signaturePreview: {
    width: "100%",
    height: 150,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#f5f5f5",
  },
  actionButtonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  nextButton: {
    backgroundColor: "#800000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  completionButtons: {
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
    backgroundColor: "#8B0000",
  },
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
