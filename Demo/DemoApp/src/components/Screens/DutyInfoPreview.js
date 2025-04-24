// DutyInfoPreview.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

// import PropTypes from "prop-types";

// DutyInfoPreview.propTypes = {
//   id: PropTypes.string.isRequired,
//   category: PropTypes.string.isRequired,
//   pickupTime: PropTypes.string.isRequired,
//   party: PropTypes.string,
//   address: PropTypes.string,
//   contact: PropTypes.string,
//   driverName: PropTypes.string,
//   carNumber: PropTypes.string,
//   tripRoute: PropTypes.string,
// };

const DutyInfoPreview = ({
  id,
  category,
  pickupTime,
  party,
  address,
  contact,
  driverName,
  tripRoute,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
      <View style={styles.infoRow}>
      <Text style={styles.label}>Duty Slip Id:</Text>
      <Text style={styles.value}>#{id}</Text>
      </View>
        <View style={styles.infoRow}>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Driver:</Text>
          <Text style={styles.value}>{driverName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Pickup Time:</Text>
          <Text style={styles.value}>{pickupTime}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Route:</Text>
          <Text style={styles.value}>{tripRoute}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Customer Name:</Text>
          <Text style={styles.value}>{party}</Text>
        </View>
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
