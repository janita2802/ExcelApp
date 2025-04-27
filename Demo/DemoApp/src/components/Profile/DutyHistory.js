import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import api from "../../utils/api";
import { getDriverId } from "../../utils/auth";

const DutyHistory = ({ navigation }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [counts, setCounts] = useState({ local: 0, outstation: 0 });
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchCompletedTrips();
  }, []);

  const fetchCompletedTrips = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const driverId = await getDriverId();
      const params = { driverId: driverId };
      const response = await api.get("/duty-slips/history/completed", {
        params,
      });

      const localCount = response.data.filter(
        (trip) => trip.dutyType === "Local"
      ).length;
      const outstationCount = response.data.filter(
        (trip) => trip.dutyType === "Outstation"
      ).length;

      setTrips(response.data);
      setCounts({ local: localCount, outstation: outstationCount });
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setInitialLoading(false);
    }
  };

  const onRefresh = () => {
    fetchCompletedTrips(true);
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
    <TouchableOpacity style={styles.tripItem}>
      <View style={styles.dutySlipIdContainer}>
        <Text style={styles.dutySlipIdText}>
          Duty Slip ID: {item.dutySlipId}
        </Text>
      </View>
      <View style={styles.tripHeader}>
        <Text style={styles.tripDate}>{formatDate(item.dateFrom)}</Text>
        <Text style={styles.tripTime}>
          {item.startTime} - {item.endTime}
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
          <Text style={styles.locationText}>
            Route: {item.tripRoute || "N/A"}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.dutyTypeText}>
            Duty Type:{" "}
            <Text
              style={[
                styles.typeText,
                item.dutyType === "local"
                  ? styles.localType
                  : styles.outstationType,
              ]}
            >
              {item.dutyType?.toUpperCase() || "N/A"}
            </Text>
          </Text>
        </View>
      </View>

      <View style={styles.tripFooter}>
        <View style={styles.footerItem}>
          <Icon name="directions-car" size={16} color="#666" />
          <Text style={styles.footerText}>{item.endKM - item.startKM} km</Text>
        </View>
        <View style={styles.footerItem}>
          <Icon name="calendar-today" size={16} color="#666" />
          <Text style={styles.footerText}>{formatDate(item.dateFrom)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.skeletonItem}>
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonTextShort} />
            <View style={styles.skeletonTextMedium} />
            <View style={styles.skeletonBadge} />
          </View>
          <View style={styles.skeletonRoute}>
            <View style={styles.skeletonDot} />
            <View style={styles.skeletonRouteDetails}>
              <View style={styles.skeletonTextLong} />
              <View style={styles.skeletonDivider} />
              <View style={styles.skeletonTextMedium} />
            </View>
          </View>
          <View style={styles.skeletonFooter}>
            <View style={styles.skeletonFooterItem} />
            <View style={styles.skeletonFooterItem} />
          </View>
        </View>
      ))}
    </View>
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

      {/* Summary Section with Loading State */}
      {initialLoading ? (
        <View style={[styles.summaryContainer, styles.skeletonSummary]}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.skeletonSummaryItem}>
              <View style={styles.skeletonSummaryLabel} />
              <View style={styles.skeletonSummaryValue} />
            </View>
          ))}
        </View>
      ) : (
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
      )}

      {initialLoading ? (
        renderLoadingSkeleton()
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#800000" />
          <Text style={styles.loadingText}>Loading your trip history...</Text>
        </View>
      ) : trips.length > 0 ? (
        <FlatList
          data={trips}
          renderItem={renderTripItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#800000"]}
              tintColor="#800000"
            />
          }
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
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.refreshButtonText}>Refresh</Text>
            )}
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    color: "#800000",
    fontSize: 16,
  },
  skeletonContainer: {
    padding: 15,
  },
  skeletonItem: {
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
  skeletonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  skeletonTextShort: {
    height: 14,
    width: 80,
    backgroundColor: "#eee",
    borderRadius: 4,
  },
  skeletonTextMedium: {
    height: 14,
    width: 100,
    backgroundColor: "#eee",
    borderRadius: 4,
  },
  skeletonTextLong: {
    height: 14,
    width: "80%",
    backgroundColor: "#eee",
    borderRadius: 4,
    marginBottom: 5,
  },
  skeletonBadge: {
    width: 70,
    height: 20,
    backgroundColor: "#eee",
    borderRadius: 12,
  },
  skeletonRoute: {
    flexDirection: "row",
    marginBottom: 15,
  },
  skeletonDot: {
    width: 18,
    height: 18,
    backgroundColor: "#eee",
    borderRadius: 9,
    marginRight: 10,
  },
  skeletonRouteDetails: {
    flex: 1,
  },
  skeletonDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },
  skeletonFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  skeletonFooterItem: {
    width: 100,
    height: 14,
    backgroundColor: "#eee",
    borderRadius: 4,
  },
  skeletonSummary: {
    backgroundColor: "#f5f5f5",
  },
  skeletonSummaryItem: {
    alignItems: "center",
  },
  skeletonSummaryLabel: {
    width: 60,
    height: 14,
    backgroundColor: "#eee",
    borderRadius: 4,
  },
  skeletonSummaryValue: {
    width: 40,
    height: 20,
    backgroundColor: "#eee",
    borderRadius: 4,
    marginTop: 5,
  },
  refreshButton: {
    backgroundColor: "#800000",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    width: 150,
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default DutyHistory;
