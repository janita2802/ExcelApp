import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Modal,
  ScrollView,
  Platform,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
// import axios from "axios";
import api from "../../../utils/api";

const { width, height } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);

  const resetAllFields = () => {
    setUsername("");
    setPassword("");
    setMobileNumber("");
    setOtp(["", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const otpInputRefs = useRef([]);

  const forgotPasswordAnim = useRef({
    fade: new Animated.Value(0),
    scale: new Animated.Value(0.95),
  }).current;
  const otpVerificationAnim = useRef({
    fade: new Animated.Value(0),
    scale: new Animated.Value(0.95),
  }).current;
  const resetPasswordAnim = useRef({
    fade: new Animated.Value(0),
    scale: new Animated.Value(0.95),
  }).current;

  const animateModalIn = (animRef) => {
    Animated.parallel([
      Animated.timing(animRef.fade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animRef.scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateModalOut = (animRef, callback) => {
    Animated.parallel([
      Animated.timing(animRef.fade, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animRef.scale, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => callback && callback());
  };

  const handleFocus = (inputName) => setFocusedInput(inputName);
  const handleBlur = () => setFocusedInput(null);

  const handleLogin = async () => {
    try {
      // Basic validation
      if (!username.trim() || !password.trim()) {
        Alert.alert("Error", "Please enter both username and password");
        return;
      }

      const response = await api.post("/auth/login", {
          username: username.trim(),
          password: password.trim(),
      });

      if (response.data.message === "Login successful") {
        resetAllFields();
        navigation.navigate("Main", {
          driver: response.data.driver,
        });
      }
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "An error occurred during login";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "Could not connect to server";
      }

      Alert.alert("Error", errorMessage);
    }
  };

  const handleSendOTP = async () => {
    // Basic validation
    if (!mobileNumber.trim()) {
      Alert.alert("Error", "Please enter mobile number");
      return;
    }
    const response = await api.post("/auth/send-otp", {
        contact: mobileNumber.trim(),
    });

    if (response.data.message === "OTP sent successfully") {
      animateModalOut(forgotPasswordAnim, () => {
        setShowForgotPassword(false);
        setShowOtpVerification(true);
        animateModalIn(otpVerificationAnim);
      });
    }
  };

  const handleVerifyOTP = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length === 5) {
      try {
        const response = await api.post("/auth/verify-otp", {
        contact: mobileNumber.trim(),
        otp: enteredOtp.trim(),
        });

        if (
          response.data.success &&
          response.data.message === "OTP verified successfully"
        ) {
      animateModalOut(otpVerificationAnim, () => {
        setShowOtpVerification(false);
        setShowResetPassword(true);
        animateModalIn(resetPasswordAnim);
      });
        } else {
          alert(response.data.message || "OTP verification failed");
        }
      } catch (error) {
        console.error("OTP verification error:", error);
        alert(
          error.response?.data?.message ||
            "Something went wrong during OTP verification"
        );
    }
    } else {
      alert("Please enter complete OTP");
    }
  };

  const handleResetPassword = async () => {
    const response = await api.post("/auth/change-password", {
        contact: mobileNumber.trim(),
        newPassword: newPassword.trim(), 
        confirmPassword: confirmPassword.trim(), 
      isReset: true,
    });

    if (response.data.message === "Password changed successfully") {
      animateModalOut(resetPasswordAnim, () => {
        setShowResetPassword(false);
        resetAllFields(); // Clear all fields
        alert("Password changed successfully!");
      });
    }
  };

  const closeModal = () => {
    if (showForgotPassword) {
      animateModalOut(forgotPasswordAnim, () => {
        setShowForgotPassword(false);
        setMobileNumber(""); // Clear mobile number
      });
    } else if (showOtpVerification) {
      animateModalOut(otpVerificationAnim, () => {
        setShowOtpVerification(false);
        setOtp(["", "", "", "", ""]); // Clear OTP fields
        setMobileNumber(""); // Also clear mobile number
      });
    } else if (showResetPassword) {
      animateModalOut(resetPasswordAnim, () => {
        setShowResetPassword(false);
        setNewPassword(""); // Clear new password
        setConfirmPassword(""); // Clear confirm password
        setOtp(["", "", "", "", ""]); // Clear OTP
        setMobileNumber(""); // Clear mobile number
      });
    }
  };

  const openForgotPassword = () => {
    setShowForgotPassword(true);
    animateModalIn(forgotPasswordAnim);
  };

  const renderModalContent = (content, animRef) => (
    <Animated.View
      style={[
        styles.modalContent,
        {
          opacity: animRef.fade,
          transform: [{ scale: animRef.scale }],
        },
      ]}
    >
      <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
        <Icon name="close" size={24} color="#800000" />
      </TouchableOpacity>
      {content}
    </Animated.View>
  );

  const getInputStyle = (inputName) => [
    styles.input,
    focusedInput === inputName && styles.inputFocused,
  ];

  const getInputContainerStyle = (inputName) => [
    styles.inputContainer,
    focusedInput === inputName && styles.inputContainerFocused,
  ];

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next input if current input is filled
    if (text && index < 4) {
      otpInputRefs.current[index + 1].focus();
      setActiveOtpIndex(index + 1);
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
      setActiveOtpIndex(index - 1);
    }
  };

  const renderOtpInputs = () => {
    return (
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.otpInput,
              activeOtpIndex === index && styles.activeOtpInput,
            ]}
            onPress={() => {
              otpInputRefs.current[index].focus();
              setActiveOtpIndex(index);
            }}
          >
            <TextInput
              ref={(ref) => (otpInputRefs.current[index] = ref)}
              style={styles.otpText}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleOtpKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentWrapper}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBorder}>
              <Image
                source={require("../Common/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>Excel Tours & Travels</Text>
            <View style={styles.underline} />
            <Text style={styles.motto}>Travel at its Finest</Text>
            <View style={styles.mottoUnderline} />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Username</Text>
            <View style={getInputContainerStyle("username")}>
              <Icon
                name="person"
                size={20}
                color="#800000"
                style={styles.icon}
              />
              <TextInput
                style={getInputStyle("username")}
                placeholder="Enter your username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                onFocus={() => handleFocus("username")}
                onBlur={handleBlur}
                returnKeyType="next"
              />
              {username.length > 0 && (
                <TouchableOpacity
                  onPress={() => setUsername("")}
                  style={styles.clearIcon}
                >
                  <Icon name="close" size={20} color="#800000" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={getInputContainerStyle("password")}>
              <Icon name="lock" size={20} color="#800000" style={styles.icon} />
              <TextInput
                style={getInputStyle("password")}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => handleFocus("password")}
                onBlur={handleBlur}
                returnKeyType="done"
              />
              {password.length > 0 && (
                <TouchableOpacity
                  onPress={() => setPassword("")}
                  style={styles.clearIcon}
                >
                  <Icon name="close" size={20} color="#800000" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={20}
                  color="#800000"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>LOGIN</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={openForgotPassword}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showForgotPassword || showOtpVerification || showResetPassword}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          {showForgotPassword &&
            renderModalContent(
              <>
                <Text style={styles.modalTitle}>Reset Password</Text>
                <Text style={styles.modalSubtitle}>
                  Enter your registered mobile number to receive OTP
                </Text>
                <View style={getInputContainerStyle("mobile")}>
                  <Icon
                    name="phone"
                    size={20}
                    color="#800000"
                    style={styles.icon}
                  />
                  <TextInput
                    style={getInputStyle("mobile")}
                    placeholder="Mobile Number"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    onFocus={() => handleFocus("mobile")}
                    onBlur={handleBlur}
                    returnKeyType="done"
                  />
                  {mobileNumber.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setMobileNumber("")}
                      style={styles.clearIcon}
                    >
                      <Icon name="close" size={20} color="#800000" />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.otpButton}
                  onPress={handleSendOTP}
                >
                  <Text style={styles.otpButtonText}>SEND OTP</Text>
                </TouchableOpacity>
              </>,
              forgotPasswordAnim
            )}

          {showOtpVerification &&
            renderModalContent(
              <>
                <Text style={styles.modalTitle}>Verify OTP</Text>
                <Text style={styles.modalSubtitle}>
                  Enter the OTP sent to {mobileNumber}
                </Text>
                {renderOtpInputs()}
                <TouchableOpacity
                  onPress={() => setOtp(["", "", "", "", ""])}
                  style={styles.clearOtpButton}
                >
                  <Text style={styles.clearOtpButtonText}>Clear OTP</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSendOTP}
                  style={styles.clearOtpButton}
                >
                  <Text style={styles.clearOtpButtonText}>Resend OTP</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.otpButton}
                  onPress={handleVerifyOTP}
                >
                  <Text style={styles.otpButtonText}>VERIFY OTP</Text>
                </TouchableOpacity>
              </>,
              otpVerificationAnim
            )}

          {showResetPassword &&
            renderModalContent(
              <>
                <Text style={styles.modalTitle}>Create New Password</Text>
                <Text style={styles.modalSubtitle}>
                  Enter your new password
                </Text>
                <View style={getInputContainerStyle("newPassword")}>
                  <Icon
                    name="lock"
                    size={20}
                    color="#800000"
                    style={styles.icon}
                  />
                  <TextInput
                    style={getInputStyle("newPassword")}
                    placeholder="New Password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    onFocus={() => handleFocus("newPassword")}
                    onBlur={handleBlur}
                    returnKeyType="next"
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeIcon}
                  >
                    <Icon
                      name={showNewPassword ? "visibility" : "visibility-off"}
                      size={20}
                      color="#800000"
                    />
                  </TouchableOpacity>
                </View>
                <View style={getInputContainerStyle("confirmPassword")}>
                  <Icon
                    name="lock-outline"
                    size={20}
                    color="#800000"
                    style={styles.icon}
                  />
                  <TextInput
                    style={getInputStyle("confirmPassword")}
                    placeholder="Confirm Password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => handleFocus("confirmPassword")}
                    onBlur={handleBlur}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Icon
                      name={
                        showConfirmPassword ? "visibility" : "visibility-off"
                      }
                      size={20}
                      color="#800000"
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetPassword}
                >
                  <Text style={styles.resetButtonText}>RESET PASSWORD</Text>
                </TouchableOpacity>
              </>,
              resetPasswordAnim
            )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // position: "absolute",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentWrapper: {
    padding: 40,
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  logoBorder: {
    width: 130,
    height: 130,
    borderRadius: "50%",
    borderWidth: 3,
    borderColor: "#800000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#800000",
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#800000",
    marginTop: 10,
    textShadowColor: "rgba(128, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  motto: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#555",
    textAlign: "center",
    marginTop: 5,
  },
  underline: {
    height: 3,
    width: 150,
    backgroundColor: "#800000",
    alignSelf: "center",
    marginTop: 5,
    borderRadius: 2,
    opacity: 0.7,
  },
  mottoUnderline: {
    height: 1,
    width: 100,
    backgroundColor: "#800000",
    alignSelf: "center",
    marginTop: 5,
    borderRadius: 1,
    opacity: 0.4,
  },
  formContainer: {
    width: "100%",
    marginTop: 20,
  },
  label: {
    color: "#800000",
    marginBottom: 8,
    fontWeight: "600",
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#800000",
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    height: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  inputContainerFocused: {
    borderColor: "#b30000",
    borderWidth: 2,
    shadowColor: "#800000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#333",
    fontSize: 15,
  },
  inputFocused: {
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#800000",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#800000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  forgotPassword: {
    color: "#800000",
    textAlign: "center",
    marginTop: 20,
    textDecorationLine: "underline",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 5,
    marginBottom: 10,
  },
  modalTitle: {
    color: "#800000",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
    fontSize: 14,
    lineHeight: 20,
  },
  otpButton: {
    backgroundColor: "#800000",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#800000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  otpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#800000",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  activeOtpInput: {
    borderWidth: 2,
    borderColor: "#b30000",
    shadowColor: "#800000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  otpText: {
    fontSize: 20,
    color: "#800000",
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
  },
  resetButton: {
    backgroundColor: "#800000",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#800000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  clearIcon: {
    marginLeft: 10,
    padding: 5,
  },
  clearOtpButton: {
    alignSelf: "flex-end",
    marginBottom: 15,
  },
  clearOtpButtonText: {
    color: "#800000",
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
