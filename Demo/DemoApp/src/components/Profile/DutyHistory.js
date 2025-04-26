import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import api from "../../utils/api";
import { getDriverId } from "../../utils/auth";

const DutyHistory = ({ navigation }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ local: 0, outstation: 0 });

  useEffect(() => {
    fetchCompletedTrips();
  }, []);

  const fetchCompletedTrips = async () => {
    try {
      setLoading(true);

      const driverId = await getDriverId();
      const params = {
        driverId: driverId
      };
      const response = await api.get("/duty-slips/history/completed", { params });
      
      // Process the data to count local vs outstation trips
      const localCount = response.data.filter(
        trip => trip.dutyType === "Local"
      ).length;
      const outstationCount = response.data.filter(
        trip => trip.dutyType === "Outstation"
      ).length;

      setTrips(response.data);
      setCounts({ local: localCount, outstation: outstationCount });
    } catch (error) {
      console.error("Error fetching trips:", error);
      Alert.alert("Error", "Failed to fetch trip history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const time = new Date(timeString);
    return time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderTripItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.tripItem}
    >
        <View style={styles.dutySlipIdContainer}>
        <Text style={styles.dutySlipIdText}>Duty Slip ID: {item.dutySlipId}</Text>
      </View>
      <View style={styles.tripHeader}>
        <Text style={styles.tripDate}>{formatDate(item.dateFrom)}</Text>
        <Text style={styles.tripTime}>
          {formatTime(item.startTime)} - {formatTime(item.endTime)}
        </Text>
        <View style={[styles.statusBadge, styles.completedBadge]}>
          <Text style={styles.statusText}>Completed</Text>
        </View>
      </View>

      <View style={styles.tripRoute}>
        <View style={styles.locationDot}>
          <Icon name="location-on" size={18} color="#800000" />
        </View>
        <View style={styles.routeDetails}>
          <Text style={styles.locationText}>Route: {item.tripRoute || "N/A"}</Text>
          <View style={styles.divider} />
          <Text style={styles.dutyTypeText}>
            Duty Type:{" "}
            <Text style={[
              styles.typeText,
              item.dutyType === "local" ? styles.localType : styles.outstationType
            ]}>
              {item.dutyType?.toUpperCase() || "N/A"}
            </Text>
          </Text>
        </View>
      </View>

      <View style={styles.tripFooter}>
        <View style={styles.footerItem}>
          <Icon name="directions-car" size={16} color="#666" />
          <Text style={styles.footerText}>
            {item.endKM - item.startKM} km
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Icon name="calendar-today" size={16} color="#666" />
          <Text style={styles.footerText}>
            {formatDate(item.dateFrom)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#800000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Duty History</Text>
      </View>

      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Trips</Text>
          <Text style={styles.summaryValue}>{trips.length}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Local</Text>
          <Text style={[styles.summaryValue, styles.localCount]}>
            {counts.local}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Outstation</Text>
          <Text style={[styles.summaryValue, styles.outstationCount]}>
            {counts.outstation}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#800000" />
        </View>
      ) : trips.length > 0 ? (
        <FlatList
          data={trips}
          renderItem={renderTripItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchCompletedTrips}
        />
      ) : (
        <View style={styles.emptyState}>
          <Image
            source={require("../Common/logo.png")}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyText}>No completed trips yet</Text>
          <Text style={styles.emptySubtext}>
            Your completed trips will appear here
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#800000",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#800000",
    marginTop: 5,
  },
  localCount: {
    color: "#4CAF50", // Green for local trips
  },
  outstationCount: {
    color: "#FF5722", // Orange for outstation trips
  },
  listContainer: {
    padding: 15,
  },
  tripItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  tripDate: {
    fontSize: 14,
    color: "#666",
  },
  tripTime: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: "#4CAF50",
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  tripRoute: {
    flexDirection: "row",
    marginBottom: 15,
  },
  locationDot: {
    marginRight: 10,
  },
  routeDetails: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  dutyTypeText: {
    fontSize: 14,
    color: "#333",
  },
  typeText: {
    fontWeight: "bold",
  },
  localType: {
    color: "#4CAF50",
  },
  outstationType: {
    color: "#FF5722",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },
  tripFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 5,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DutyHistory;