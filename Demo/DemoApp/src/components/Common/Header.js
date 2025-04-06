import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const Header = ({ onMenuPress }) => {
  return (
    <View style={styles.header}>
      {/* White circle with logo on left */}
      <View style={styles.logoCircle}>
        <Image
          source={require("./logo.png")} // Update with your actual logo path
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Centered title */}
      <Text style={styles.title}>Excel Travels & Tours</Text>

      {/* Hamburger menu on right */}
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <Icon name="menu" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#800000", // Maroon theme
    paddingVertical: 12,
    paddingHorizontal: 15,
    elevation: 4,
    justifyContent: "space-between",
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logo: {
    width: 30,
    height: 30,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  menuButton: {
    padding: 8,
    marginLeft: 10,
  },
});

export default Header;
