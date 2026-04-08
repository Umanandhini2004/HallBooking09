import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useEffect } from 'react';
import { router } from "expo-router";
import { useTheme } from "../../context/theme-context";
import { useBookings } from "../../context/booking-context";

export default function Dashboard() {
  const { colors, mode, toggleMode } = useTheme();
  const { bookings } = useBookings();
  const styles = createStyles(colors);

  useEffect(() => {}, []); // Ensure bookings load

  // Calculate user stats (filtering for demo - in real app, filter by current user)
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "Pending").length;
  const approvedBookings = bookings.filter((b) => b.status === "Approved").length;
  const rejectedBookings = bookings.filter((b) => b.status === "Rejected").length;


  const stats = [
    { label: "Total", value: totalBookings, icon: "📋", color: "#5e35b1" },
    { label: "Pending", value: pendingBookings, icon: "⏳", color: "#ff9800" },
{ label: "Approved", value: approvedBookings, icon: "✅", color: "#4caf50" },
    { label: "Rejected", value: rejectedBookings, icon: "❌", color: "#f44336" },
  ];

  const quickActions = [
    {
      title: "View Halls",
      icon: "🏛️",
      route: "/user/halls",
      color: "#5e35b1",
      description: "Browse available halls",
    },
    {
      title: "My Bookings",
      icon: "📅",
      route: "/user/my-bookings",
      color: "#3f51b5",
      description: "View your reservations",
    },
    {
      title: "Profile",
      icon: "👤",
      route: "/user/profile",
      color: "#00bcd4",
      description: "Manage your account",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Welcome back! 👋</Text>
            <Text style={styles.title}>User Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleMode}>
            <Text style={styles.themeToggleText}>{mode === "dark" ? "🌙" : "☀️"}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Manage your hall bookings</Text>
      </View>

      {/* Stats Cards */}
      <Text style={styles.sectionTitle}>Your Bookings</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: stat.color + "20" }]}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsContainer}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionCard}
            onPress={() => router.push(action.route as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: action.color + "20" }]}>
              <Text style={styles.actionIcon}>{action.icon}</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => router.replace("/user/login")}
      >
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
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
      marginBottom: 24,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    greeting: {
      fontSize: 14,
      color: colors.subText,
      marginBottom: 4,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
    },
    themeToggle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeToggleText: {
      fontSize: 20,
    },
    subtitle: {
      fontSize: 14,
      color: colors.subText,
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 16,
    },
    statsGrid: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 32,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    statIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    statIcon: {
      fontSize: 20,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.subText,
      fontWeight: "500",
    },
    actionsContainer: {
      gap: 12,
    },
    actionCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    actionIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    actionIcon: {
      fontSize: 26,
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 2,
    },
    actionDescription: {
      fontSize: 13,
      color: colors.subText,
    },
    actionArrow: {
      fontSize: 20,
      color: colors.subText,
      fontWeight: "600",
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 14,
      marginTop: 24,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    logoutIcon: {
      fontSize: 18,
    },
    logoutText: {
      fontSize: 15,
      fontWeight: "600",
      color: "#f44336",
    },
    bottomSpacer: {
      height: 30,
    },
  });

