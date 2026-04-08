import { Stack } from "expo-router";
import { useAuth } from "../../context/auth-context";
import { useEffect } from "react";
import { router } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function AdminLayout() {
  const { user, loading: authLoading, isAdmin } = useAuth();

  // No special admin privileges needed - treat same as user
  if (authLoading) {
    return (
      <View style={styles.loader}>
        <Text style={styles.loaderText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="bookings" />
      <Stack.Screen name="halls" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loaderText: {
    fontSize: 16,
    color: "#666",
  },
});
