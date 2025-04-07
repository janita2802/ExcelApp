import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import Header from "../Common/Header";
import Footer from "../Common/Footer";
import Menu from "../Common/Menu";

const { width } = Dimensions.get("window");

const DutySlipInfoScreen = ({ navigation, route }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  //   const { dutySlipId } = route.params;
  const { dutySlipId } = 1111;
  const submitted = true;

  const handleLogout = () => {
    navigation.navigate("Login");
  };

  const handleAddressPress = (address) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  };

  const handlePhonePress = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "Phone calls are not supported on this device");
      }
    });
  };

  const mockDutyInfo = {
    party: "Mr. John Doe",
    address: "123 Main Street, Mumbai, MH 400001",
    contact: "+91 9876543210",
    id: dutySlipId,
    category: "Sedan AC",
    pickupTime: "10:30 AM, 4th April 2025",
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Header onMenuPress={() => setMenuVisible(true)} />

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.innerWrapper}>
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
                  <Text style={styles.infoValue}>
                    {mockDutyInfo.pickupTime}
                  </Text>
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Customer Information</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Party:</Text>
                  <Text style={styles.infoValue}>{mockDutyInfo.party}</Text>
                </View>

                {/* Enhanced Address Field */}
                <View style={styles.infoRow}>
                  <View style={styles.iconLabelContainer}>
                    <MaterialIcons
                      name="location-on"
                      size={20}
                      color="#800000"
                      style={styles.icon}
                    />
                    <Text style={styles.infoLabel}>Address:</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.clickableField}
                    onPress={() => handleAddressPress(mockDutyInfo.address)}
                  >
                    <Text
                      style={[styles.infoValue, styles.linkText]}
                      numberOfLines={2}
                    >
                      {mockDutyInfo.address}
                    </Text>
                    <MaterialIcons
                      name="directions"
                      size={20}
                      color="#0066cc"
                    />
                  </TouchableOpacity>
                </View>

                {/* Enhanced Phone Field */}
                <View style={styles.infoRow}>
                  <View style={styles.iconLabelContainer}>
                    <FontAwesome
                      name="phone"
                      size={18}
                      color="#800000"
                      style={styles.icon}
                    />
                    <Text style={styles.infoLabel}>Contact No.:</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.clickableField}
                    onPress={() => handlePhonePress(mockDutyInfo.contact)}
                  >
                    <Text style={[styles.infoValue, styles.linkText]}>
                      {mockDutyInfo.contact}
                    </Text>
                    <MaterialIcons name="call" size={20} color="#0066cc" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={() => navigation.navigate("SignatureScreen")}
                >
                  <Text style={styles.nextButtonText}>Next →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.heading}>No Duty Slip ID provided.</Text>
            )}
          </View>
        </ScrollView>

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
  scrollContainer: {
    flexGrow: 1,
  },
  innerWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  logoContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#800000",
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
    backgroundColor: "#FFF5F5",
    padding: 25,
    borderRadius: 16,
    width: width * 0.9,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#800000",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#800000",
    marginBottom: 20,
    textAlign: "center",
    textTransform: "uppercase",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 15,
    flexWrap: "wrap",
    alignItems: "center",
  },
  iconLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 120,
  },
  icon: {
    marginRight: 8,
  },
  infoLabel: {
    fontWeight: "600",
    color: "#800000",
    fontSize: 16,
  },
  infoValue: {
    flex: 1,
    color: "#333",
    fontSize: 16,
  },
  clickableField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  linkText: {
    color: "#0066cc",
    flexShrink: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#800000",
    marginVertical: 20,
    opacity: 0.3,
  },
  nextButton: {
    marginTop: 15,
    paddingVertical: 14,
    backgroundColor: "#800000",
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#800000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  footerContainer: {
    width: "100%",
  },
});

export default DutySlipInfoScreen;
