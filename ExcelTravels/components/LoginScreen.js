import React, { useState } from "react";
import { Modal } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { currentLanguage } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const translations = {
    en: {
      welcome: "Welcome",
      // other English texts
    },
    es: {
      welcome: "Bienvenido",
      // other Spanish texts
    },
    hi: {
      welcome: "स्वागत हे",
      // other Hindi texts
    },
  };

  const handleLogin = () => {
    if (username && password) {
      navigation.navigate("Welcome");
    } else {
      Alert.alert("Error", "Please enter both username and password");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : null}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { backgroundColor: theme.background },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image source={require("../assets/logo.png")} style={styles.logo} />
          </View>

          {/* Heading Group */}
          <View style={styles.headingGroup}>
            <Text style={{ color: theme.text }}></Text>
            <Text style={[styles.heading, { color: theme.text }]}>
              {translations[currentLanguage].welcome}
              {/* EXCEL VENDOR */}
            </Text>
            <View style={styles.headingUnderline} />
            <Text style={[styles.motto, { color: theme.text }]}>
              Travel at its finest
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <TextInput
              style={[styles.input, isUsernameFocused && styles.inputFocused]}
              placeholder="Username"
              placeholderTextColor="#A1A1A1"
              value={username}
              onChangeText={setUsername}
              onFocus={() => setIsUsernameFocused(true)}
              onBlur={() => setIsUsernameFocused(false)}
              autoCapitalize="none"
            />

            <View style={styles.spacer} />

            <TextInput
              style={[styles.input, isPasswordFocused && styles.inputFocused]}
              placeholder="Password"
              placeholderTextColor="#A1A1A1"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => setShowForgotModal(true)}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            <Modal
              animationType="slide"
              transparent={true}
              visible={showForgotModal}
              onRequestClose={() => setShowForgotModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>
                    {otpSent ? "Enter OTP" : "Forgot Password"}
                  </Text>

                  <View style={styles.modalContent}>
                    {!otpSent ? (
                      <>
                        <Text style={styles.modalLabel}>Phone Number</Text>
                        <TextInput
                          style={styles.modalInput}
                          keyboardType="phone-pad"
                          placeholder="e.g. 9876543210"
                          value={phoneNumber}
                          onChangeText={setPhoneNumber}
                          maxLength={10}
                        />
                        <TouchableOpacity
                          style={styles.modalButton}
                          onPress={() => {
                            if (!phoneNumber.match(/^\d{10}$/)) {
                              Alert.alert(
                                "Invalid",
                                "Enter a valid 10-digit phone number"
                              );
                              return;
                            }
                            setOtpSent(true);
                            Alert.alert(
                              "OTP Sent",
                              `OTP sent to ${phoneNumber}`
                            );
                            setPhoneNumber("");
                          }}
                        >
                          <Text style={styles.modalButtonText}>Send OTP</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <Text style={styles.modalLabel}>OTP</Text>
                        <TextInput
                          style={styles.modalInput}
                          keyboardType="numeric"
                          placeholder="Enter OTP"
                          value={otp}
                          onChangeText={setOtp}
                          maxLength={4}
                        />
                        <TouchableOpacity
                          style={styles.modalButton}
                          onPress={() => {
                            if (otp === "1234") {
                              setShowForgotModal(false);
                              setShowResetModal(true);
                              setOtp("");
                              setOtpSent(false);
                            } else {
                              Alert.alert("Error", "Invalid OTP");
                            }
                          }}
                        >
                          <Text style={styles.modalButtonText}>Verify OTP</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setShowForgotModal(false);
                      setOtp("");
                      setOtpSent(false);
                    }}
                    style={styles.modalCancelButton}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal
              animationType="slide"
              transparent={true}
              visible={showResetModal}
              onRequestClose={() => setShowResetModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Reset Password</Text>

                  <View style={styles.modalContent}>
                    <Text style={styles.modalLabel}>New Password</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="New Password"
                      secureTextEntry
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />

                    <Text style={styles.modalLabel}>Confirm Password</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Confirm Password"
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />

                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => {
                        if (!newPassword || !confirmPassword) {
                          Alert.alert("Error", "Fill in all fields");
                          return;
                        }

                        if (newPassword !== confirmPassword) {
                          Alert.alert("Error", "Passwords do not match");
                          return;
                        }

                        Alert.alert("Success", "Password reset successfully");
                        setNewPassword("");
                        setConfirmPassword("");
                        setShowResetModal(false);
                      }}
                    >
                      <Text style={styles.modalButtonText}>Reset Password</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => setShowResetModal(false)}
                    style={styles.modalCancelButton}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>

          {/* Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.9}
          >
            <Text style={styles.loginButtonText}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  content: {
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignSelf: "center",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FF7A45",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: "contain",
  },
  headingGroup: {
    alignItems: "center",
    marginBottom: 40,
  },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2D3748",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  headingUnderline: {
    width: 50,
    height: 3,
    backgroundColor: "#FF7A45",
    marginVertical: 8,
    borderRadius: 2,
  },
  motto: {
    fontSize: 16,
    color: "#718096",
    fontWeight: "500",
    letterSpacing: 0.5,
    fontStyle: "italic",
    marginTop: 12,
  },
  formContainer: {
    width: "100%",
    marginBottom: 25,
  },
  input: {
    width: "100%",
    height: 52,
    borderColor: "#E2E8F0",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: "#FFF",
    color: "#2D3748",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputFocused: {
    borderColor: "#FF7A45",
    shadowColor: "#FF7A45",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  spacer: {
    height: 20,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: 15,
    padding: 8,
  },
  forgotPasswordText: {
    color: "#FF7A45",
    fontWeight: "600",
    fontSize: 14,
  },
  loginButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#FF7A45",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    shadowColor: "#FF7A45",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    elevation: 10,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },

  modalContent: {
    gap: 16,
  },

  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },

  modalButton: {
    marginTop: 10,
    backgroundColor: "#FF7A45",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  modalCancelButton: {
    marginTop: 20,
    alignItems: "center",
  },

  modalCancelText: {
    color: "#FF7A45",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default LoginScreen;
