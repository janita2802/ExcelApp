import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { TouchableWithoutFeedback, Keyboard } from "react-native";
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
  BackHandler,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Header from "../Common/Header";
import Footer from "../Common/Footer";
import Menu from "../Common/Menu";
import api from "../../utils/api";

const MainScreen = ({ navigation, route }) => {
  // State management
  const [state, setState] = useState({
    menuVisible: false,
    dutySlipId: "",
    dutySlipIdFocused: false,
    isLoading: false,
  });

  // Derived values from route params.
  const driver = route?.params?.driver || {};
  const userName = driver?.name || "Driver";
  const driverId = driver.driverId;

  // Memoized handlers
  const handleLogout = useCallback(
    () => navigation.navigate("Login"),
    [navigation]
  );
  const clearInput = useCallback(
    () => setState((prev) => ({ ...prev, dutySlipId: "" })),
    []
  );
  const toggleMenu = useCallback(
    () => setState((prev) => ({ ...prev, menuVisible: !prev.menuVisible })),
    []
  );

  // Back handler effect
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          "Logout",
          "Are you sure you want to logout?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Yes",
              onPress: () =>
                navigation.reset({ index: 0, routes: [{ name: "Login" }] }),
            },
          ],
          { cancelable: true }
        );
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => backHandler.remove();
    }, [navigation])
  );

  // Form submission handler
  const handleSubmit = async () => {
    if (!state.dutySlipId.trim()) {
      Alert.alert("Error", "Please enter a Duty Slip ID");
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await api.get(`/duty-slips/${state.dutySlipId.trim()}`, {
        timeout: 10000,
      });
      const slip = response.data;

      if (!slip) {
        Alert.alert("Error", "Duty slip not found.");
        return;
      }

      if (slip.driverId !== driverId) {
        Alert.alert("Access Denied", "This duty slip is not assigned to you.");
        return;
      }

      navigation.navigate("DutySlipInfo", {
        dutySlipData: slip,
        driverName: userName,
        driverId,
      });
      clearInput();
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
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Input change handler
  const handleInputChange = (text) => {
    setState((prev) => ({ ...prev, dutySlipId: text }));
  };

  // Input focus handlers
  const handleInputFocus = () =>
    setState((prev) => ({ ...prev, dutySlipIdFocused: true }));
  const handleInputBlur = () =>
    setState((prev) => ({ ...prev, dutySlipIdFocused: false }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <Header onMenuPress={toggleMenu} />

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
                            state.dutySlipIdFocused && styles.inputFocused,
                          ]}
                          placeholder="Enter Duty Slip ID"
                          placeholderTextColor="#A1A1A1"
                          value={state.dutySlipId}
                          onChangeText={handleInputChange}
                          onFocus={handleInputFocus}
                          onBlur={handleInputBlur}
                          keyboardType="default"
                          autoCapitalize="characters"
                          autoCorrect={false}
                          onSubmitEditing={handleSubmit}
                          returnKeyType="search"
                          underlineColorAndroid="transparent"
                        />
                        {state.dutySlipId.length > 0 && (
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
                        (!state.dutySlipId.trim() || state.isLoading) &&
                          styles.submitButtonDisabled,
                      ]}
                      onPress={handleSubmit}
                      disabled={!state.dutySlipId.trim() || state.isLoading}
                    >
                      {state.isLoading ? (
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
            visible={state.menuVisible}
            onClose={toggleMenu}
            onLogout={handleLogout}
            onSelect={(screen) => navigation.navigate(screen)}
          />
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

// Styles remain the same as in your original code
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
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  centeredContent: {
    alignItems: "center",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#800000",
    marginBottom: 30,
  },
  formContainer: {
    width: "100%",
    maxWidth: 500,
  },
  table: {
    borderWidth: 1,
    borderColor: "#800000",
    borderRadius: 5,
    overflow: "hidden",
  },
  headingRow: {
    backgroundColor: "#800000",
    paddingVertical: 10,
  },
  headingCell: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  inputRow: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  cellLeft: {
    flex: 1,
    justifyContent: "center",
  },
  cellRight: {
    flex: 2,
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#800000",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: "#333",
  },
  inputFocused: {
    borderColor: "#b30000",
  },
  clearButton: {
    padding: 5,
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
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MainScreen;
