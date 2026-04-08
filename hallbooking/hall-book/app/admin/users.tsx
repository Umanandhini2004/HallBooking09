import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { useState, useEffect } from "react";
import { useTheme } from "../../context/theme-context";
import { usersAPI } from "../../api/api";

export default function Users() {
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getUsers();
      // Transform backend data to UI format and filter out admins
      const transformedUsers = response.data.map((u) => ({
        id: u._id,
        name: u.name,
        role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
        email: u.email,
        phone: u.phone || 'N/A',
        department: u.department || 'N/A',
        hallBooked: 'N/A',
        bookingDate: formatDate(new Date(u.createdAt)),
      })).filter((u) => u.role.toLowerCase() !== 'admin');
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const deleteUser = async (id: string) => {
    try {
      await usersAPI.deleteUser(id);
      // Optimistic update
      setUsers(users.filter((u) => u.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
      // Refetch on error
      fetchUsers();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hall Booking Users</Text>
        <Text style={styles.subtitle}>Users who have booked halls</Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        scrollEnabled={true}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.userContent}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatar}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.userPhone}>📱 {item.phone}</Text>
                <View style={styles.detailsRow}>
                  <View style={styles.roleBadge}>
                    <Text style={styles.badgeText}>{item.role}</Text>
                  </View>
                  <View style={styles.departmentBadge}>
                    <Text style={styles.badgeText}>{item.department}</Text>
                  </View>
                  <View style={styles.bookingBadge}>
                    <Text style={styles.bookingText}>🏛️ {item.hallBooked}</Text>
                  </View>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteUser(item.id)}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>No users found</Text>
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
  userCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  userContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    marginTop: 2,
  },
  avatar: {
    color: colors.accentText,
    fontSize: 20,
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: colors.subText,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 13,
    color: colors.subText,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  departmentBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "600",
  },
  bookingBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookingText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "600",
  },
  bookingDate: {
    fontSize: 12,
    color: colors.subText,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 18,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.subText,
  },
});
