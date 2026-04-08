import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useTheme } from "../../context/theme-context";
import { hallsAPI } from "../../api/api";



function Halls() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [searchQuery, setSearchQuery] = useState("");
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHalls = async () => {
    try {
      const data = await hallsAPI.getHalls();
      setHalls(data);
    } catch (error) {
      console.log("Fetch halls error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalls();
  }, []);

  const filteredHalls = halls.filter((hall) =>
    hall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hall.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAvailabilityColor = (available) => available ? "#4caf50" : "#f44336";
  const getAvailabilityText = (available) => available ? "Available" : "Not Available";

  const renderHallCard = ({ item }) => (
    <View style={[styles.card, !item.available && styles.cardDisabled]}>
      <View style={styles.cardHeader}>
        <View style={styles.hallIconContainer}>
          <Text style={styles.hallIcon}>🏛️</Text>
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.hallName}>{item.name}</Text>
          <Text style={styles.hallDescription}>{item.description}</Text>
        </View>
        <View style={[styles.availabilityBadge, { backgroundColor: getAvailabilityColor(item.available) + "20" }]}>
          <View style={[styles.availabilityDot, { backgroundColor: getAvailabilityColor(item.available) }]} />
          <Text style={[styles.availabilityText, { color: getAvailabilityColor(item.available) }]}>
            {getAvailabilityText(item.available)}
          </Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>👥</Text>
          <Text style={styles.detailText}>Capacity: {item.capacity} people</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.bookButton,
          { backgroundColor: item.available ? colors.accent : colors.border },
        ]}
        onPress={() =>
          router.push({
            pathname: "/user/book-hall",
            params: { name: item.name, capacity: item.capacity, id: item._id },
          })
        }
        disabled={!item.available}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.bookButtonText,
          { color: item.available ? colors.accentText : colors.subText }
        ]}>
          {item.available ? "📅 Book Now" : "Not Available"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>  

      <View style={styles.header}>
        <Text style={styles.title}>Available Halls</Text>
        <Text style={styles.subtitle}>Find and book the perfect venue</Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search halls..."
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.resultsText}>
        Showing {filteredHalls.length} hall{filteredHalls.length !== 1 ? "s" : ""}
      </Text>

      <FlatList
        data={filteredHalls}
        keyExtractor={(item) => item._id}
        renderItem={renderHallCard}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏛️</Text>
            <Text style={styles.emptyText}>No halls found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        }
      />
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  clearIcon: {
    fontSize: 16,
    color: colors.subText,
    padding: 4,
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
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDisabled: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  hallIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.accent + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  hallIcon: {
    fontSize: 26,
  },
  cardTitleContainer: {
    flex: 1,
  },
  hallName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  hallDescription: {
    fontSize: 13,
    color: colors.subText,
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: "600",
  },
  cardDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.subText,
    fontWeight: "500",
  },
  bookButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  bookButtonText: {
    fontSize: 15,
    fontWeight: "700",
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
  },
});

export default Halls;

