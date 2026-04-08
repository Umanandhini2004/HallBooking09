import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { BookingProvider } from "../context/booking-context";
import { AuthProvider } from "../context/auth-context";
import { ThemeProvider } from "../context/theme-context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BookingProvider>
          <>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />

              <Stack.Screen name="admin" />

              <Stack.Screen name="user" />

              <Stack.Screen
                name="modal"
                options={{ presentation: "modal" }}
              />
            </Stack>

            <StatusBar style="dark" />
          </>
        </BookingProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}