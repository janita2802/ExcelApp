import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Footer = () => {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        © <Text style={styles.bold}>2025 Excel Tours and Travels</Text>. All
        rights reserved.
      </Text>
      <Text style={styles.footerText}>
        Contact us: <Text style={styles.bold}>excel.travel@rediffmail.com</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#800000",
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#660000",
    width: "100%", // Ensure full width
  },
  footerText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
    marginVertical: 3,
    lineHeight: 18,
  },
  bold: {
    fontWeight: "bold",
  },
});

export default Footer;
