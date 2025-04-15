import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
import api from "../../../utils/api";

const MainScreen = ({ navigation, route }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [dutySlipId, setDutySlipId] = useState("");
  const [dutySlipIdFocused, setDutySlipIdFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get driver details from route params if available
  const driver = route.params?.driver || {};
  const userName = driver.name || "Driver";
  const driverId = driver.driverId; // Assuming the driver object has an _id field

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Show alert and wait for user input
        Alert.alert(
          "Logout",
          "Are you sure you want to logout?",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => {}, // do nothing
            },
            {
              text: "Yes",
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              },
            },
          ],
          { cancelable: true }
        );
        return true; // Important: prevent default back behavior
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => backHandler.remove();
    }, [navigation])
  );

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
      const response = await api.get(`/duty-slips/${dutySlipId.trim()}`, {
        timeout: 10000,
      });

      const slip = response.data;

      if (!slip) {
        Alert.alert("Error", "Duty slip not found.");
        return;
      }

      console.log("Slip driverId:", slip.driverId);
      console.log("Logged-in driverId:", driverId);

      // Check if this slip belongs to the logged-in driver
      if (slip.driverId !== driverId) {
        Alert.alert("Access Denied", "This duty slip is not assigned to you.");
        return;
      }

      // If check passed, navigate to the next screen
      navigation.navigate("DutySlipInfo", {
        dutySlipData: slip,
        driverName: userName,
        driverId: driverId,
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
      setIsLoading(false);
    }
  };

  // const handleSubmit = async () => {
  //   if (!dutySlipId.trim()) {
  //     Alert.alert("Error", "Please enter a Duty Slip ID");
  //     return;
  //   }

  //   try {
  //     const response = await api.get(`/duty-slips/${dutySlipId.trim()}`, {
  //       timeout: 10000,
  //     });

  //     if (response.data) {
  //       navigation.navigate("DutySlipInfo", {
  //         dutySlipData: response.data,
  //         driverName: userName,
  //         driverId: driverId,
  //       });
  //       clearInput();
  //     }
  //   } catch (error) {
  //     let errorMessage = "An error occurred";
  //     if (error.response) {
  //       errorMessage =
  //         error.response.status === 404
  //           ? "Duty slip not found"
  //           : error.response.data.message || errorMessage;
  //     } else if (error.request) {
  //       errorMessage = "Could not connect to server. Check your network.";
  //     }
  //     Alert.alert("Error", errorMessage);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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
