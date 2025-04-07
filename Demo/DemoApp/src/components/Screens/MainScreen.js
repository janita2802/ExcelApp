import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Header from "../Common/Header";
import Footer from "../Common/Footer";
import Menu from "../Common/Menu";

const MainScreen = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [dutySlipId, setDutySlipId] = useState("");
  const [dutySlipIdFocused, setDutySlipIdFocused] = useState(false);
  const [userName] = useState("John Doe"); // Replace with actual user name from your auth state

  const handleLogout = () => {
    navigation.navigate("Login");
  };

  const handleSubmit = () => {
    navigation.navigate("DutySlipInfo");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Header onMenuPress={() => setMenuVisible(true)} />

        <View style={styles.content}>
          {/* Centered content container */}
          <View style={styles.centeredContent}>
            {/* Greeting for logged-in user */}
            <Text style={styles.greeting}>Welcome back, {userName}!</Text>

            {/* Form container */}
            <View style={styles.formContainer}>
              {/* New table component */}
              <View style={styles.table}>
                {/* Heading Row */}
                <View style={styles.headingRow}>
                  <Text style={styles.headingCell}>Duty Slip Form</Text>
                </View>

                {/* Input Row */}
                <View style={[styles.row, styles.inputRow]}>
                  <View style={styles.cellLeft}>
                    <Text style={styles.label}>Duty Slip ID</Text>
                  </View>
                  <View style={styles.cellRight}>
                    <TextInput
                      style={[
                        styles.input,
                        dutySlipIdFocused && styles.inputFocused,
                      ]}
                      placeholder="Enter Duty Slip ID"
                      placeholderTextColor="#A1A1A1"
                      value={dutySlipId}
                      onChangeText={setDutySlipId}
                      onFocus={() => setDutySlipIdFocused(true)}
                      onBlur={() => setDutySlipIdFocused(false)}
                      keyboardType="default" // Changed from numeric to default for alphanumeric
                      autoCapitalize="characters" // Auto capitalize for IDs
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Submit Button Row */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      !dutySlipId.trim() && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                    disabled={!dutySlipId.trim()}
                  >
                    <Text style={styles.submitButtonText}>SUBMIT</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footerContainer}>
          <Footer />
        </View>

        <Menu
          onSelect={(screen) => navigation.navigate(screen)}
          onLogout={handleLogout}
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center", // Center content vertically
  },
  centeredContent: {
    paddingHorizontal: 20,
  },
  formContainer: {
    maxWidth: 500, // Limit form width for better appearance on larger screens
    width: "100%",
    alignSelf: "center", // Center form horizontally
  },
  footerContainer: {
    width: "100%",
  },
  greeting: {
    fontSize: 20,
    fontWeight: "600",
    color: "#800000",
    marginBottom: 25,
    textAlign: "center",
  },
  table: {
    borderWidth: 1,
    borderColor: "#800000",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 30,
    backgroundColor: "#FFF",
  },
  headingRow: {
    backgroundColor: "#800000",
    paddingVertical: 15,
  },
  headingCell: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputRow: {
    paddingVertical: 10,
  },
  cellLeft: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
    alignItems: "flex-start",
    borderRightWidth: 1,
    borderColor: "#E0E0E0",
  },
  cellRight: {
    flex: 2,
    padding: 10,
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginLeft: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  inputFocused: {
    borderColor: "#800000",
    borderWidth: 1.5,
  },
  buttonRow: {
    padding: 15,
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#800000",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: "#cccccc",
    elevation: 0,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});

export default MainScreen;
