// DutyInfoPreview.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const DutyInfoPreview = ({ id, category, pickupTime }) => {
  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Duty ID:</Text>
        <Text style={styles.value}>{id}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Category:</Text>
        <Text style={styles.value}>{category}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Pickup:</Text>
        <Text style={styles.value}>{pickupTime}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    fontWeight: "600",
    width: 80,
    color: "#800000",
  },
  value: {
    flex: 1,
    color: "#333",
  },
});

export default DutyInfoPreview;
