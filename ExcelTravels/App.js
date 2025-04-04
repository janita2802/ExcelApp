import React from "react";
import { StyleSheet, Text, View, Button, Alert } from "react-native";

export default function App() {
  const handlePress = () => {
    Alert.alert("Hello!", "You pressed the button!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to My First React Native App!</Text>
      <Button title="Click Me" onPress={handlePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 22,
    marginBottom: 20,
  },
});
