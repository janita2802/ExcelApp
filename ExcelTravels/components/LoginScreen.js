import React, { useState, useEffect } from "react";
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
  Dimensions,
} from "react-native";

// Import translations
import enTranslations from "../locales/en.json";
import hiTranslations from "../locales/hi.json";

const translations = {
  en: enTranslations,
  hi: hiTranslations,
  // Default to English if translation is missing
  default: enTranslations,
};

const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { currentLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  // State for form fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Safe translation function
  const t = (key) => {
    const lang = translations[currentLanguage] || translations.default;
    return lang[key] || key;
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleLogin = () => {
    if (username && password) {
      navigation.navigate("Welcome");
    } else {
      Alert.alert(t("loginErrorAlertTitle"), t("loginErrorAlertMessage"));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : null}
      style={[styles.container, { backgroundColor: theme.background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        // scrollEnabled={false}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image source={require("../assets/logo.png")} style={styles.logo} />
          </View>

          {/* Heading Group */}
          <View style={styles.headingGroup}>
            <Text style={[styles.heading, { color: theme.text }]}>
              {t("EXCELVENDOR")}
            </Text>
            <View style={styles.headingUnderline} />
            <Text style={[styles.motto, { color: theme.text }]}>
              {t("travelMotto")}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <TextInput
              style={[styles.input, isUsernameFocused && styles.inputFocused]}
              placeholder={t("usernamePlaceholder")}
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
              placeholder={t("passwordPlaceholder")}
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
              <Text style={styles.forgotPasswordText}>
                {t("forgotPassword")}
              </Text>
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
                    {otpSent ? t("enterOtpTitle") : t("forgotPasswordTitle")}
                  </Text>

                  <View style={styles.modalContent}>
                    {!otpSent ? (
                      <>
                        <Text style={styles.modalLabel}>
                          {t("phoneNumberLabel")}
                        </Text>
                        <TextInput
                          style={styles.modalInput}
                          keyboardType="phone-pad"
                          placeholder={t("phoneNumberPlaceholder")}
                          value={phoneNumber}
                          onChangeText={setPhoneNumber}
                          maxLength={10}
                        />
                        <TouchableOpacity
                          style={styles.modalButton}
                          onPress={() => {
                            if (!phoneNumber.match(/^\d{10}$/)) {
                              Alert.alert(
                                t("invalidPhoneAlertTitle"),
                                t("invalidPhoneAlertMessage")
                              );
                              return;
                            }
                            setOtpSent(true);
                            Alert.alert(
                              t("otpSentAlertTitle"),
                              `${t("otpSentAlertMessage")}${phoneNumber}`
                            );
                            setPhoneNumber("");
                          }}
                        >
                          <Text style={styles.modalButtonText}>
                            {t("sendOtp")}
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <Text style={styles.modalLabel}>{t("otpLabel")}</Text>
                        <TextInput
                          style={styles.modalInput}
                          keyboardType="numeric"
                          placeholder={t("otpPlaceholder")}
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
                              Alert.alert(
                                t("invalidOtpAlertTitle"),
                                t("invalidOtpAlertMessage")
                              );
                            }
                          }}
                        >
                          <Text style={styles.modalButtonText}>
                            {t("verifyOtp")}
                          </Text>
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
                    <Text style={styles.modalCancelText}>{t("cancel")}</Text>
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
                  <Text style={styles.modalTitle}>
                    {t("resetPasswordTitle")}
                  </Text>

                  <View style={styles.modalContent}>
                    <Text style={styles.modalLabel}>
                      {t("newPasswordLabel")}
                    </Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder={t("newPasswordPlaceholder")}
                      secureTextEntry
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />

                    <Text style={styles.modalLabel}>
                      {t("confirmPasswordLabel")}
                    </Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder={t("confirmPasswordPlaceholder")}
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />

                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => {
                        if (!newPassword || !confirmPassword) {
                          Alert.alert(
                            t("emptyFieldsAlertTitle"),
                            t("emptyFieldsAlertMessage")
                          );
                          return;
                        }

                        if (newPassword !== confirmPassword) {
                          Alert.alert(
                            t("passwordMismatchAlertTitle"),
                            t("passwordMismatchAlertMessage")
                          );
                          return;
                        }

                        Alert.alert(
                          t("passwordResetSuccessAlertTitle"),
                          t("passwordResetSuccessAlertMessage")
                        );
                        setNewPassword("");
                        setConfirmPassword("");
                        setShowResetModal(false);
                      }}
                    >
                      <Text style={styles.modalButtonText}>
                        {t("resetPassword")}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => setShowResetModal(false)}
                    style={styles.modalCancelButton}
                  >
                    <Text style={styles.modalCancelText}>{t("cancel")}</Text>
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
            <Text style={styles.loginButtonText}>{t("signIn")}</Text>
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
    paddingTop: 100,
  },

  content: {
    // height: Dimensions.get("window").height, // This ensures fixed height
    // width: "100%",
    paddingHorizontal: 40,
    // paddingTop: 40,
    justifyContent: "center",
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
