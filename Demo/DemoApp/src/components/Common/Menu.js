import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");
const MENU_WIDTH = width * 0.7;

const Menu = ({ onSelect, onLogout, visible, onClose }) => {
  const menuItems = [
    {
      title: "Personal Information",
      icon: "person-outline",
      screen: "Profile",
    },
    {
      title: "Duty History",
      icon: "history",
      screen: "History",
    },
    {
      title: "Language Settings",
      icon: "language",
      screen: "Language",
    },
    {
      title: "Logout",
      icon: "exit-to-app",
      action: onLogout,
    },
  ];

  const slideAnim = React.useRef(new Animated.Value(MENU_WIDTH)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: MENU_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

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
          <View style={styles.profilePicContainer}>
            <Image
              source={require("./logo.png")} // Replace with your image
              style={styles.profilePic}
            />
          </View>
          <Text style={styles.greetingText}>Hello,</Text>
          <Text style={styles.userName}>Driver Name</Text>
        </View>

        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => {
              item.action ? item.action() : onSelect(item.screen);
              onClose();
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 99,
  },
  menuContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: MENU_WIDTH,
    paddingTop: 20, // Reduced padding to accommodate close button
    zIndex: 100,
  },
  closeButton: {
    position: "absolute",
    right: 15,
    top: 15,
    padding: 8,
    zIndex: 101,
  },
  profileSection: {
    padding: 20,
    paddingTop: 40, // Added space for close button
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#660000",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#660000",
  },
  menuText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 15,
    flex: 1,
  },
  icon: {
    width: 24,
    textAlign: "center",
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
    opacity: 0.8,
  },
  userName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },
});

export default Menu;
