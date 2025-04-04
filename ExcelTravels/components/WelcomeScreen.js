import React, { useState } from "react";

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

const WelcomeScreen = ({ navigation }) => {
  const [dutySlipId, setDutySlipId] = useState("");
  const [dutySlipIdFocused, setDutySlipIdFocused] = useState(false);

  const handleSubmit = () => {
    if (dutySlipId) {
      Alert.alert("Success", `Duty Slip ID ${dutySlipId} submitted!`);
      navigation.navigate("DutySlipInfo", { dutySlipId });
    } else {
      Alert.alert("Error", "Please enter Duty Slip ID");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : null}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Circle Logo */}
          <View style={styles.logoContainer}>
            <Image source={require("../assets/logo.png")} style={styles.logo} />
          </View>

          <View style={styles.spacer} />

          <View style={styles.table}>
            {/* Heading Row */}
            <View style={styles.row}>
              <Text style={styles.headingCell}>Duty Slip Form</Text>
            </View>

            {/* Input Row */}
            <View style={[styles.row, styles.inputRow]}>
              <View style={styles.cellLeft}>
                <Text style={styles.label}>ID</Text>
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
                  keyboardType="numeric"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          <View style={styles.spacer} />

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.9}
          >
            <Text style={styles.submitButtonText}>SUBMIT</Text>
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
  },
  content: {
    paddingHorizontal: 40,
    paddingBottom: 40,
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
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2D3748",
    textAlign: "center",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  boxId: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "500",
  },
  input: {
    width: "100%",
    height: 44,
    borderColor: "#E2E8F0",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#FFF",
    color: "#2D3748",
  },
  submitButton: {
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
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  table: {
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 30,
    borderColor: "#FF7A45",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FDFDFD",
  },

  headingCell: {
    flex: 1,
    paddingVertical: 16,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: "#2D3748",
    backgroundColor: "#FFE5D0",
    textTransform: "uppercase",
  },

  inputRow: {
    backgroundColor: "#FFF",
  },

  cellLeft: {
    flex: 1,
    padding: 14,
    borderRightWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },

  cellRight: {
    flex: 3,
    paddingHorizontal: 14,
    height: 70, // Fixed height to help center
    justifyContent: "center",
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
  },

  inputFocused: {
    borderColor: "#FF7A45",
    borderWidth: 2,
  },
  spacer: {
    height: 20,
  },
});

export default WelcomeScreen;
