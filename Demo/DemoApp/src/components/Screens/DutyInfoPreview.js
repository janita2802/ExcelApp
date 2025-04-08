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
  carNumber,
  tripRoute,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Duty Slip #{id}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trip Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Vehicle:</Text>
          <Text style={styles.value}>
            {category} ({carNumber})
          </Text>
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
        <Text style={styles.sectionTitle}>Customer Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{party}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Contact:</Text>
          <Text style={styles.value}>{contact}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{address}</Text>
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
