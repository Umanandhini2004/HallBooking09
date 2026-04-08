import { Stack } from "expo-router";

export default function UserLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="login" options={{ title: "User Login" }} />
      <Stack.Screen name="register" options={{ title: "User Register" }} />
      <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Stack.Screen name="halls" options={{ title: "View Halls" }} />
      <Stack.Screen name="book-hall" options={{ title: "Book Hall" }} />
      <Stack.Screen name="my-bookings" options={{ title: "My Bookings" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
    </Stack>
  );
}