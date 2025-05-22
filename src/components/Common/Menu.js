import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getDriverData } from "../../utils/auth";

const { width } = Dimensions.get("window");
const MENU_WIDTH = width * 0.7;

const Menu = ({ onSelect, onLogout, visible, onClose }) => {
  const [driverName, setDriverName] = React.useState("User");
  const [profilePic, setProfilePic] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const slideAnim = React.useRef(new Animated.Value(MENU_WIDTH)).current;

  const menuItems = [
    {
      title: "My Profile",
      icon: "person-outline",
      screen: "Profile",
    },
    {
      title: "Duty History",
      icon: "history",
      screen: "History",
    },
    {
      title: "Logout",
      icon: "exit-to-app",
      action: () => showLogoutConfirmation(),
    },
  ];

  const showLogoutConfirmation = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            onClose();
            onLogout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  React.useEffect(() => {
    if (visible) {
      // Animate slide-in
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Fetch driver data
      fetchDriverData();
    } else {
      // Animate slide-out
      Animated.timing(slideAnim, {
        toValue: MENU_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      const driverData = await getDriverData();

      if (driverData) {
        setDriverName(driverData?.name || "User");
        // Set profile picture if available, otherwise use default
        if (driverData.profilePic) {
          setProfilePic({ uri: driverData.profilePic });
        } else {
          setProfilePic(require(".././../../assets/profile.png")); // Your default profile image
        }
      }
    } catch (error) {
      console.error("Error fetching driver data:", error);
      setProfilePic(require(".././../../assets/profile.png")); // Fallback to default image
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {visible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
      )}
      <Animated.View
        style={[
          styles.menuContainer,
          {
            transform: [{ translateX: slideAnim }],
            backgroundColor: "#800000", // Maroon background
          },
        ]}
      >
        {/* Close Button at Top Right */}
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>

        {/* User Profile Section */}
        <View style={styles.profileSection}>
          {loading ? (
            <View style={styles.profilePicContainer}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : (
            <View style={styles.profilePicContainer}>
              <Image
                source={profilePic || require(".././../../assets/profile.png")}
                style={styles.profilePic}
              />
            </View>
          )}
          <Text style={styles.greetingText}>Hello,</Text>
          <Text style={styles.userName}>{driverName}</Text>
        </View>

        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => {
              item.action ? item.action() : onSelect(item.screen);
              if (!item.action) onClose();
            }}
          >
            <Icon name={item.icon} size={22} color="#fff" style={styles.icon} />
            <Text style={styles.menuText}>{item.title}</Text>
            <Icon name="chevron-right" size={20} color="#fff" />
          </TouchableOpacity>
        ))}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
  menuContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    width: MENU_WIDTH,
    height: "100%",
    zIndex: 2,
    paddingTop: 50,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
    zIndex: 3,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 20,
  },
  profilePicContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    overflow: "hidden",
  },
  profilePic: {
    width: "100%",
    height: "100%",
  },
  greetingText: {
    color: "#fff",
    fontSize: 16,
  },
  userName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  menuText: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
    marginLeft: 15,
  },
  icon: {
    width: 24,
    textAlign: "center",
  },
});

export default Menu;
