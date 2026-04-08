import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/theme-context";
import { useBookings } from "../../context/booking-context";
import { useEffect } from 'react';


import { useAuth } from "../../context/auth-context";
export default function Dashboard() {
  const router = useRouter();
  const { bookings, bookingStats, statsLoading, fetchStats } = useBookings();
  const { colors, toggleMode, mode } = useTheme();
  const { user } = useAuth();
  console.log('Dashboard user:', user);
  const styles = createStyles(colors);
  
  // Removed redundant admin check - handled by /admin/_layout.tsx

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getStatValue = (type: 'total' | 'pending' | 'approved' | 'rejected') => {
    if (statsLoading) return 'Loading...';
    console.log('Stats data:', bookingStats, 'Type:', type, 'Value:', bookingStats[type]);
    return bookingStats[type].toString();
  };

  const totalBookings = getStatValue('total');
  const pendingBookings = getStatValue('pending');
  const approvedBookings = getStatValue('approved');
  const rejectedBookings = getStatValue('rejected');


  const stats = [
    { label: "Total Bookings", value: totalBookings.toString(), icon: "📅", color: "#5e35b1" },
    { label: "Pending Requests", value: pendingBookings.toString(), icon: "⏳", color: "#ff9800" },
    { label: "Approved", value: approvedBookings.toString(), icon: "✅", color: "#4caf50" },
    { label: "Rejected", value: rejectedBookings.toString(), icon: "❌", color: "#f44336" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleMode}>
            <Text style={styles.themeToggleText}>{mode === "dark" ? "🌙" : "☀️"}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Welcome back, Administrator</Text>
      </View>

      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionCard, { borderLeftColor: "#5e35b1" }]}
          onPress={() => router.push("/admin/bookings" as any)}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionTitle}>View Bookings</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionCard, { borderLeftColor: "#3f51b5" }]}
          onPress={() => router.push("/admin/halls" as any)}
        >
          <Text style={styles.actionIcon}>🏛️</Text>
          <Text style={styles.actionTitle}>Manage Halls</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionCard, { borderLeftColor: "#00bcd4" }]}
          onPress={() => router.push("/admin/users" as any)}
        >
          <Text style={styles.actionIcon}>👥</Text>
          <Text style={styles.actionTitle}>User List</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionCard, { borderLeftColor: "#f44336" }]}
          onPress={() => router.replace("/admin" as any)}
        >
          <Text style={styles.actionIcon}>🚪</Text>
          <Text style={styles.actionTitle}>Logout</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 4,
  },
  themeToggle: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  themeToggleText: {
    fontSize: 18,
  },
  subtitle: {
    fontSize: 14,
    color: colors.subText,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.subText,
    textAlign: "center",
  },
  actionsContainer: {
    gap: 12,
    paddingBottom: 30,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 18,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  actionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  actionArrow: {
    fontSize: 20,
    color: colors.subText,
  },
});