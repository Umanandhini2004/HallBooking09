import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useFormatTime, formatTime } from "../../hooks/useFormatTime";
import { useTheme } from "../../context/theme-context";
import { bookingsAPI } from "../../api/api";
import { useState,useEffect } from "react";

const statusConfig: Record<string, { color: string; bgColor: string; icon: string }> = {
  Pending: { color: "#ff9800", bgColor: "#fff3e0", icon: "⏳" },
  Approved: { color: "#4caf50", bgColor: "#e8f5e9", icon: "✅" },
  Rejected: { color: "#f44336", bgColor: "#ffebee", icon: "❌" },
};

export default function MyBookings() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      const data = await bookingsAPI.getMyBookings();
      setMyBookings(data.data || []);
    } catch (error) {
      console.error('Failed to fetch my bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = activeTab === "All" 
    ? myBookings 
    : myBookings.filter((b) => b.status === activeTab);

  const cancelBooking = async (id: string) => {
    try {
      await bookingsAPI.deleteBooking(id);
      setMyBookings((prev) => prev.filter((booking) => (booking._id || booking.id) !== id));
      Alert.alert("Success", "Booking cancelled successfully");
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      Alert.alert('Error', 'Failed to cancel booking. Please try again.');
    }
  };

  const handleCancel = (id: string) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: () => cancelBooking(id)
        },
      ]
    );
  };

  const renderBookingCard = ({ item }: { item: typeof myBookings[0] }) => {
    const formatTimeLocal = formatTime;
    const config = statusConfig[item.status] || statusConfig.Pending;

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.hallInfo}>
            <Text style={styles.hallIcon}>🏛️</Text>
            <View>
              <Text style={styles.hallName}>{item.hall?.name || item.hall}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
            <Text style={styles.statusIcon}>{config.icon}</Text>
            <Text style={[styles.statusText, { color: config.color }]}>{item.status}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{item.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🕐</Text>
            <Text style={styles.detailLabel}>Time</Text>
<Text style={styles.detailValue}>{formatTimeLocal(item.startTime)} - {formatTimeLocal(item.endTime)}</Text>
          </View>
          {item.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>📋 Note:</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {item.status === "Pending" && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancel(item.id)}
          >
            <Text style={styles.cancelButtonText}>🗑️ Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const tabs: Array<"All" | "Pending" | "Approved" | "Rejected"> = ["All", "Pending", "Approved", "Rejected"];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>View and manage your reservations</Text>
      </View>

      {/* Status Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.tabActive,
              activeTab === tab && { backgroundColor: colors.accent },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && { color: colors.accentText },
                activeTab !== tab && { color: colors.subText },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings Count */}
      <Text style={styles.resultsText}>
        {filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""}
      </Text>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item._id || item.id}
        renderItem={renderBookingCard}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No bookings found</Text>
            <Text style={styles.emptySubtext}>
              {activeTab !== "All" 
                ? `You don't have any ${activeTab.toLowerCase()} bookings`
                : "Start by booking a hall"
              }
            </Text>
          </View>
        }
      />
    </View>
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
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.subText,
    },
    tabsContainer: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 4,
      marginBottom: 16,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: "center",
    },
    tabActive: {},
    tabText: {
      fontSize: 13,
      fontWeight: "600",
    },
    resultsText: {
      fontSize: 13,
      color: colors.subText,
      marginBottom: 12,
    },
    list: {
      paddingBottom: 24,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    hallInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    hallIcon: {
      fontSize: 28,
      marginRight: 12,
    },
    hallName: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    statusIcon: {
      fontSize: 12,
      marginRight: 4,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "700",
    },
    cardDetails: {
      gap: 10,
      marginBottom: 14,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    detailIcon: {
      fontSize: 16,
      marginRight: 10,
      width: 24,
    },
    detailLabel: {
      fontSize: 13,
      color: colors.subText,
      width: 60,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      flex: 1,
    },
    notesContainer: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 10,
      marginTop: 4,
    },
    notesLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.subText,
      marginBottom: 4,
    },
    notesText: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 18,
    },
    cancelButton: {
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#f44336",
      backgroundColor: "#f4433620",
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#f44336",
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyIcon: {
      fontSize: 56,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 6,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.subText,
      textAlign: "center",
    },
  });

