import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const DutySlipScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const passedId = route.params?.dutySlipId || "";

  const [submitted, setSubmitted] = useState(false);
  const [dutySlipId, setDutySlipId] = useState(passedId);

  useEffect(() => {
    if (passedId) {
      setSubmitted(true);
    }
  }, [passedId]);

  const mockDutyInfo = {
    party: "Mr. John Doe",
    address: "123 Main Street, Mumbai, MH 400001",
    contact: "+91 9876543210",
    id: dutySlipId,
    category: "Sedan AC",
    pickupTime: "10:30 AM, 4th April 2025",
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : null}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.innerWrapper}>
          <View style={styles.logoContainer}>
            <Image source={require("../assets/logo.png")} style={styles.logo} />
          </View>

          {submitted ? (
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Duty Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Duty Slip ID:</Text>
                <Text style={styles.infoValue}>{mockDutyInfo.id}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Category:</Text>
                <Text style={styles.infoValue}>{mockDutyInfo.category}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Pickup Time:</Text>
                <Text style={styles.infoValue}>{mockDutyInfo.pickupTime}</Text>
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Customer Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Party:</Text>
                <Text style={styles.infoValue}>{mockDutyInfo.party}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>{mockDutyInfo.address}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Contact No.:</Text>
                <Text style={styles.infoValue}>{mockDutyInfo.contact}</Text>
              </View>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={() =>
                  // navigation.navigate("VehicleDetailScreen", {
                  //   dutySlipId: dutySlipId,
                  // })
                  Alert.alert("ok")
                }
              >
                <Text style={styles.nextButtonText}>Next →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.heading}>No Duty Slip ID provided.</Text>
          )}
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
  },
  innerWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoContainer: {
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
  infoCard: {
    backgroundColor: "#FFF7F0",
    padding: 20,
    borderRadius: 16,
    width: width * 0.9,
    maxWidth: 400,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FF7A45",
    marginBottom: 16,
    textAlign: "center",
    textTransform: "uppercase",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  infoLabel: {
    fontWeight: "600",
    width: 120,
    color: "#333",
  },
  infoValue: {
    flex: 1,
    color: "#555",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 20,
  },
  nextButton: {
    marginTop: 30,
    paddingVertical: 14,
    backgroundColor: "#FF7A45",
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default DutySlipScreen;
