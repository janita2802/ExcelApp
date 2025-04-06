import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import Header from "../Common/Header";
import Footer from "../Common/Footer";
import Menu from "../Common/Menu";

const MainScreen = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLogout = () => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header onMenuPress={() => setMenuVisible(true)} />

        <View style={styles.content}>{/* Your main content goes here */}</View>

        <View style={styles.footerContainer}>
          <Footer />
        </View>

        <Menu
          onSelect={(screen) => navigation.navigate(screen)}
          onLogout={handleLogout}
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  footerContainer: {
    width: "100%",
  },
});

export default MainScreen;
