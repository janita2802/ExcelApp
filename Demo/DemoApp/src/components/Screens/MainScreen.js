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
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
// import axios from "axios";
import Header from "../Common/Header";
import Footer from "../Common/Footer";
import Menu from "../Common/Menu";
import api from "../../../utils/api";

const MainScreen = ({ navigation, route }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [dutySlipId, setDutySlipId] = useState("");
  const [dutySlipIdFocused, setDutySlipIdFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get driver name from route params if available
  const userName = route.params?.driver?.name || "Driver";

  const handleLogout = () => {
    navigation.navigate("Login");
  };

  const clearInput = () => {
    setDutySlipId("");
  };

  const handleSubmit = async () => {
    if (!dutySlipId.trim()) {
      Alert.alert("Error", "Please enter a Duty Slip ID");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get(
        `/duty-slips/${dutySlipId.trim()}`,
        { timeout: 10000 }
      );

      if (response.data) {
        navigation.navigate("DutySlipInfo", {
          dutySlipData: response.data,
          driverName: userName, // Pass driver name to next screen
        });
        clearInput();
      }
    } catch (error) {
      let errorMessage = "An error occurred";
      if (error.response) {
        errorMessage =
          error.response.status === 404
            ? "Duty slip not found"
            : error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "Could not connect to server. Check your network.";
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Header onMenuPress={() => setMenuVisible(true)} />

        <View style={styles.content}>
          <View style={styles.centeredContent}>
            <Text style={styles.greeting}>Welcome back, {userName}!</Text>

            <View style={styles.formContainer}>
              <View style={styles.table}>
                <View style={styles.headingRow}>
                  <Text style={styles.headingCell}>Duty Slip Form</Text>
                </View>

                <View style={[styles.row, styles.inputRow]}>
                  <View style={styles.cellLeft}>
                    <Text style={styles.label}>Duty Slip ID</Text>
                  </View>
                  <View style={styles.cellRight}>
                    <View style={styles.inputContainer}>
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
                        keyboardType="default"
                        autoCapitalize="characters"
                        autoCorrect={false}
                        onSubmitEditing={handleSubmit}
                        returnKeyType="search"
                      />
                      {dutySlipId.length > 0 && (
                        <TouchableOpacity
                          style={styles.clearButton}
                          onPress={clearInput}
                        >
                          <MaterialIcons
                            name="close"
                            size={20}
                            color="#800000"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      (!dutySlipId.trim() || isLoading) &&
                        styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!dutySlipId.trim() || isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.submitButtonText}>SUBMIT</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        <Footer />
        <Menu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          onLogout={handleLogout}
          onSelect={(screen) => navigation.navigate(screen)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ... (keep your existing styles)

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
  // Add these new styles:
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: "#FFF",
    paddingRight: 30, // Make space for the clear button
  },
  clearButton: {
    position: "absolute",
    right: 10,
    padding: 5,
  },
});

export default MainScreen;
