import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const DutyHistory = ({ navigation }) => {
  // Sample data - replace with your actual data from API
  const tripData = [
    {
      id: "1",
      date: "2023-05-15",
      time: "08:30 - 17:45",
      from: "Company HQ",
      to: "Airport Terminal",
      status: "Completed",
      distance: "45 km",
      earnings: "$85.50",
    },
    {
      id: "2",
      date: "2023-05-14",
      time: "12:15 - 19:30",
      from: "Downtown",
      to: "Suburb Office Park",
      status: "Completed",
      distance: "32 km",
      earnings: "$72.00",
    },
    {
      id: "3",
      date: "2023-05-12",
      time: "07:00 - 15:20",
      from: "Airport Terminal",
      to: "City Center",
      status: "Completed",
      distance: "28 km",
      earnings: "$68.50",
    },
    {
      id: "4",
      date: "2023-05-10",
      time: "09:45 - 16:10",
      from: "Industrial Zone",
      to: "Train Station",
      status: "Completed",
      distance: "38 km",
      earnings: "$79.00",
    },
    {
      id: "5",
      date: "2023-05-08",
      time: "14:00 - 18:30",
      from: "Shopping Mall",
      to: "Residential Area",
      status: "Completed",
      distance: "22 km",
      earnings: "$65.00",
    },
  ];

  const renderTripItem = ({ item }) => (
    <TouchableOpacity style={styles.tripItem}>
      <View style={styles.tripHeader}>
        <Text style={styles.tripDate}>{item.date}</Text>
        <Text style={styles.tripTime}>{item.time}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === "Completed" ? "#4CAF50" : "#FFC107",
            },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.tripRoute}>
        <View style={styles.locationDot}>
          <Icon name="location-on" size={18} color="#800000" />
        </View>
        <View style={styles.routeDetails}>
          <Text style={styles.locationText}>From: {item.from}</Text>
          <View style={styles.divider} />
          <View style={styles.locationDot}>
            <Icon name="location-on" size={18} color="#800000" />
          </View>
          <Text style={styles.locationText}>To: {item.to}</Text>
        </View>
      </View>

      <View style={styles.tripFooter}>
        <View style={styles.footerItem}>
          <Icon name="directions-car" size={16} color="#666" />
          <Text style={styles.footerText}>{item.distance}</Text>
        </View>
        <View style={styles.footerItem}>
          <Icon name="attach-money" size={16} color="#666" />
          <Text style={styles.footerText}>{item.earnings}</Text>
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

      {tripData.length > 0 ? (
        <FlatList
          data={tripData}
          renderItem={renderTripItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Image
            source={require("../Common/logo.png")} // Add your own image
            style={styles.emptyImage}
          />
          <Text style={styles.emptyText}>No trips recorded yet</Text>
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
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
    marginLeft: 28,
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
});

export default DutyHistory;
