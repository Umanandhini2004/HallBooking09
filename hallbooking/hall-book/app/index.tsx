import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../context/theme-context";

export default function Home() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hall Booking</Text>
        <Text style={styles.subtitle}>Manage your college events</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🏛️</Text>
          <Text style={styles.featureTitle}>Easy Booking</Text>
          <Text style={styles.featureText}>Reserve halls with just a few taps</Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>⚙️</Text>
          <Text style={styles.featureTitle}>Admin Control</Text>
          <Text style={styles.featureText}>Manage bookings and hall availability</Text>
        </View>
      </View>

      {/* USER LOGIN */}
      <TouchableOpacity
  style={styles.userButton}
  onPress={() => router.push("/user/login")}
>
  <Text style={styles.loginButtonText}>User Login</Text>
</TouchableOpacity>

      {/* ADMIN LOGIN */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push("/admin")}
      >
        <Text style={styles.loginButtonText}>Admin Login</Text>
      </TouchableOpacity>

    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingTop: 60,
    },

    header: {
      marginBottom: 40,
      alignItems: "center",
    },

    title: {
      fontSize: 36,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 8,
    },

    subtitle: {
      fontSize: 16,
      color: colors.subText,
      fontWeight: "500",
    },

    contentContainer: {
      gap: 16,
      marginBottom: 40,
      flex: 1,
      justifyContent: "center",
    },

    featureCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },

    featureIcon: {
      fontSize: 48,
      marginBottom: 12,
    },

    featureTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },

    featureText: {
      fontSize: 14,
      color: colors.subText,
      textAlign: "center",
    },

    userButton: {
      backgroundColor: colors.primary || "#4CAF50",
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      marginBottom: 15,
    },
    userButtonText: {
      color: colors.primaryText || "white",
      fontSize: 16,
      fontWeight: "700",
    },

    loginButton: {
      backgroundColor: colors.accent,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      marginBottom: 30,
    },

    loginButtonText: {
      color: colors.accentText,
      fontSize: 16,
      fontWeight: "700",
    },
  });