import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = () => {
    // Add MongoDB authentication logic here
    navigation.navigate("Main");
  };

  const handleSendOTP = () => {
    // Add MongoDB OTP sending logic here
    setShowForgotPassword(false);
    setShowOtpVerification(true);
  };

  const handleVerifyOTP = () => {
    setShowOtpVerification(false);
    setShowResetPassword(true);
  };

  const handleResetPassword = () => {
    // Add MongoDB password reset logic here
    setShowResetPassword(false);
    alert("Password changed successfully!");
  };

  const renderModalContent = (content) => (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            setShowForgotPassword(false);
            setShowOtpVerification(false);
            setShowResetPassword(false);
          }}
        >
          <Icon name="close" size={24} color="#800000" />
        </TouchableOpacity>
        {content}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Logo with maroon border */}
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

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputContainer}>
            <Icon name="person" size={20} color="#800000" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#800000" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowForgotPassword(true)}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      // {/* Forgot Password Modal */}
      <Modal visible={showForgotPassword} transparent animationType="slide">
        {renderModalContent(
          <View>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalSubtitle}>
              Enter your registered mobile number to receive OTP
            </Text>

            <View style={styles.inputContainer}>
              <Icon
                name="phone"
                size={20}
                color="#800000"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                keyboardType="phone-pad"
                value={mobileNumber}
                onChangeText={setMobileNumber}
              />
            </View>

            <TouchableOpacity style={styles.otpButton} onPress={handleSendOTP}>
              <Text style={styles.otpButtonText}>SEND OTP</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
      {/* OTP Verification Modal */}
      <Modal visible={showOtpVerification} transparent animationType="slide">
        {renderModalContent(
          <View>
            <Text style={styles.modalTitle}>Verify OTP</Text>
            <Text style={styles.modalSubtitle}>
              Enter the OTP sent to {mobileNumber}
            </Text>

            <View style={styles.inputContainer}>
              <Icon name="sms" size={20} color="#800000" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                keyboardType="numeric"
                value={otp}
                onChangeText={setOtp}
              />
            </View>

            <TouchableOpacity
              style={styles.otpButton}
              onPress={handleVerifyOTP}
            >
              <Text style={styles.otpButtonText}>VERIFY OTP</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
      {/* Reset Password Modal */}
      <Modal visible={showResetPassword} transparent animationType="slide">
        {renderModalContent(
          <View>
            <Text style={styles.modalTitle}>Create New Password</Text>
            <Text style={styles.modalSubtitle}>Enter your new password</Text>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#800000" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon
                name="lock-outline"
                size={20}
                color="#800000"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetPassword}
            >
              <Text style={styles.resetButtonText}>RESET PASSWORD</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#800000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#800000",
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
  },

  formContainer: {
    width: "100%",
  },
  label: {
    color: "#800000",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#800000",
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#333",
  },
  loginButton: {
    backgroundColor: "#800000",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  forgotPassword: {
    color: "#800000",
    textAlign: "center",
    marginTop: 15,
    textDecorationLine: "underline",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 5,
  },
  modalTitle: {
    color: "#800000",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  modalSubtitle: {
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  otpButton: {
    backgroundColor: "#800000",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  otpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resetButton: {
    backgroundColor: "#800000",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  resetButton: {
    backgroundColor: "#800000",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
});

export default LoginScreen;
