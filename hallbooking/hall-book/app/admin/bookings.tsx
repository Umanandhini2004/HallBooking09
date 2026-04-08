import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput, Modal } from "react-native";
import { useState, useMemo } from "react";
import { bookingsAPI } from "../../api/api";
import { useEffect } from "react";
import { BookingStatus } from "../../context/booking-context";
import { formatTime } from "../../hooks/useFormatTime";
import { useTheme } from "../../context/theme-context";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors, mode, toggleMode } = useTheme();
  const styles = createStyles(colors);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<"start" | "end" | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await bookingsAPI.getBookings();
      setBookings(data.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: BookingStatus) => {
    try {
      await bookingsAPI.updateBooking(id, status);
      fetchBookings(); // Refresh
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const openNotesModal = (id: string, notes = "") => {
    setSelectedBookingId(id);
    setNotesText(notes);
    setNotesModalVisible(true);
  };

  const saveNotes = async () => {
    if (selectedBookingId) {
      try {
        fetchBookings();
        setNotesModalVisible(false);
      } catch (error) {
        console.error('Failed to save notes:', error);
      }
    }
  };

  // Helpers
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  const parseDate = (dateString: string) => {
    if (!dateString) return null;
    const value = dateString.trim();

    // Try built-in parsing first (works for ISO and many common formats)
    const builtIn = new Date(value);
    if (!isNaN(builtIn.getTime())) return builtIn;

    // Try parsing common human-readable formats like "Mar 15, 2026" or "March 15, 2026"
    const monthMatch = value.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
    if (monthMatch) {
      const monthNames: Record<string, number> = {
        jan: 0,
        january: 0,
        feb: 1,
        february: 1,
        mar: 2,
        march: 2,
        apr: 3,
        april: 3,
        may: 4,
        jun: 5,
        june: 5,
        jul: 6,
        july: 6,
        aug: 7,
        august: 7,
        sep: 8,
        sept: 8,
        september: 8,
        oct: 9,
        october: 9,
        nov: 10,
        november: 10,
        dec: 11,
        december: 11,
      };

      const month = monthNames[monthMatch[1].toLowerCase()];
      const day = parseInt(monthMatch[2], 10);
      const year = parseInt(monthMatch[3], 10);
      if (month !== undefined) {
        return new Date(year, month, day);
      }
    }

    // Try common numeric formats (MM/DD/YYYY)
    const numericMatch = value.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (numericMatch) {
      const month = parseInt(numericMatch[1], 10) - 1;
      const day = parseInt(numericMatch[2], 10);
      const year = parseInt(numericMatch[3], 10);
      return new Date(year, month, day);
    }

    return null;
  };

  const getMonthDays = (year: number, month: number) => {
    const days = new Date(year, month + 1, 0).getDate();
    return days;
  };

  const getCalendarGrid = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const totalDays = getMonthDays(year, month);

    const grid: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) grid.push(null);
    for (let day = 1; day <= totalDays; day++) grid.push(new Date(year, month, day));
    return grid;
  };

  const goToPrevMonth = () => {
    setCalendarDate((prev) => {
      const year = prev.getFullYear();
      const month = prev.getMonth();
      return new Date(year, month - 1, 1);
    });
  };

  const goToNextMonth = () => {
    setCalendarDate((prev) => {
      const year = prev.getFullYear();
      const month = prev.getMonth();
      return new Date(year, month + 1, 1);
    });
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const bookingDate = parseDate(booking.date);

      const matchesSearch =
        booking.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.hall.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bookingDate ? formatDate(bookingDate) : booking.date)
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === "All" || booking.status === filterStatus;

      const matchesStartDate =
        !startDate ||
        (bookingDate && bookingDate.getTime() >= startDate.getTime());

      const matchesEndDate =
        !endDate ||
        (bookingDate && bookingDate.getTime() <= endDate.getTime());

      return (
        matchesSearch &&
        matchesStatus &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }, [bookings, searchQuery, filterStatus, startDate, endDate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "#4caf50";
      case "Rejected":
        return "#f44336";
      default:
        return "#ff9800";
    }
  };



  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return "✅";
      case "Rejected":
        return "❌";
      default:
        return "⏳";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Booking Requests</Text>
          <TouchableOpacity
            style={styles.themeToggle}
            onPress={toggleMode}
            accessibilityLabel="Toggle dark mode"
          >
            <Text style={styles.themeToggleText}>{mode === "dark" ? "🌙" : "☀️"}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Manage all hall bookings</Text>
      </View>

      {/* Search Bar */}
      <TextInput
        style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        placeholder="Search by username, hall, or date..."
        placeholderTextColor={colors.placeholder}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Advanced filters */}
      <View style={styles.advancedFilters}>
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={[styles.dateSelector, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              setDatePickerMode("start");
              setDatePickerVisible(true);
            }}
          >
            <Text style={[styles.dateText, { color: colors.text }]}>From: {startDate ? formatDate(startDate) : "Any"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateSelector, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              setDatePickerMode("end");
              setDatePickerVisible(true);
            }}
          >
            <Text style={[styles.dateText, { color: colors.text }]}>To: {endDate ? formatDate(endDate) : "Any"}</Text>
          </TouchableOpacity>
        </View>
        {(startDate || endDate) && (
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: colors.border }]}
            onPress={() => {
              setStartDate(null);
              setEndDate(null);
            }}
          >
            <Text style={[styles.clearButtonText, { color: colors.text }]}>Clear dates</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {["All", "Pending", "Approved", "Rejected"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filterStatus === status && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === status && styles.filterButtonTextActive,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.userName}>{item.user?.name || 'Unknown User'}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>🏛️</Text>
                <View>
                  <Text style={styles.detailLabel}>Hall</Text>
                  <Text style={styles.detailValue}>{item.hall?.name || item.hall}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📅</Text>
                <View>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{item.date}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>🕐</Text>
                <View>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>{`${formatTime(item.startTime) || 'N/A'} - ${formatTime(item.endTime) || 'N/A'}`}</Text>
                </View>
              </View>
            </View>

            {/* Notes Display */}
            {item.notes && (
              <View style={styles.notesDisplay}>
                <Text style={styles.notesLabel}>📝 Notes:</Text>
                <Text style={styles.notesText}>{item.notes}</Text>
              </View>
            )}

            {item.status === "Pending" && (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#4caf50" }]}
                  onPress={() => updateStatus(item.id, "Approved")}
                >
                  <Text style={styles.actionButtonText}>✓ Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#f44336" }]}
                  onPress={() => updateStatus(item.id, "Rejected")}
                >
                  <Text style={styles.actionButtonText}>✕ Reject</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Notes Button */}
            <TouchableOpacity
              style={styles.notesButton}
              onPress={() => openNotesModal(item.id)}
            >
              <Text style={styles.notesButtonText}>
                {item.notes ? "✏️ Edit Notes" : "📝 Add Notes"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        }
      />

      {/* Date picker modal */}
      <Modal
        visible={datePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <TouchableOpacity onPress={goToPrevMonth} style={styles.monthNavButton}>
                  <Text style={styles.monthNav}>◀</Text>
                </TouchableOpacity>

                <View>
                  <Text style={styles.modalTitle}>
                    Select {datePickerMode === "start" ? "start" : "end"} date
                  </Text>
                  <Text style={styles.modalSubTitle}>
                    {calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </Text>
                </View>

                <TouchableOpacity onPress={goToNextMonth} style={styles.monthNavButton}>
                  <Text style={styles.monthNav}>▶</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calendarGrid}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <Text key={day} style={styles.weekdayLabel}>
                  {day}
                </Text>
              ))}
              {getCalendarGrid(calendarDate).map((day, index) => {
                const dayLabel = day ? day.getDate().toString() : "";
                const isSelected =
                  day &&
                  ((datePickerMode === "start" && startDate && day.toDateString() === startDate.toDateString()) ||
                    (datePickerMode === "end" && endDate && day.toDateString() === endDate.toDateString()));

                return (
                  <TouchableOpacity
                    key={`${index}-${dayLabel}`}
                    style={[
                      styles.calendarCell,
                      isSelected && styles.calendarCellSelected,
                    ]}
                    disabled={!day}
                    onPress={() => {
                      if (!day) return;
                      if (datePickerMode === "start") setStartDate(day);
                      else setEndDate(day);
                      setDatePickerVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.calendarCellText,
                        isSelected && styles.calendarCellTextSelected,
                      ]}
                    >
                      {dayLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Notes Modal */}
      <Modal
        visible={notesModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Admin Notes</Text>
              <TouchableOpacity onPress={() => setNotesModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.notesInput}
              placeholder="Add special instructions, rejection reason, or notes..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              value={notesText}
              onChangeText={setNotesText}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setNotesModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#2196F3" }]}
                onPress={saveNotes}
              >
                <Text style={styles.modalButtonText}>Save Notes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
      marginBottom: 16,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
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
    searchInput: {
      backgroundColor: colors.card,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
    },
    advancedFilters: {
      marginBottom: 16,
    },
    filterInput: {
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    dateRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },
    dateSelector: {
      flex: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dateText: {
      color: colors.text,
    },
    clearButton: {
      alignSelf: "flex-start",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
    },
    clearButtonText: {
      fontSize: 12,
      fontWeight: "600",
    },
    filterContainer: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 16,
      justifyContent: "space-between",
    },
    filterButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterButtonActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    filterButtonText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.subText,
    },
    filterButtonTextActive: {
      color: colors.accentText,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    userName: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    userRole: {
      fontSize: 12,
      color: colors.subText,
      marginTop: 2,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    statusIcon: {
      fontSize: 14,
      marginRight: 4,
    },
    statusText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "600",
    },
    detailsContainer: {
      gap: 12,
      marginBottom: 12,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    detailIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    detailLabel: {
      fontSize: 12,
      color: colors.subText,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginTop: 2,
    },
    notesDisplay: {
      backgroundColor: "#fff3cd",
      borderLeftWidth: 4,
      borderLeftColor: "#ff9800",
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 12,
      borderRadius: 4,
    },
    notesLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: "#ff6f00",
      marginBottom: 4,
    },
    notesText: {
      fontSize: 13,
      color: "#333",
      lineHeight: 18,
    },
    actionsRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 10,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: "center",
    },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  notesButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  notesButtonText: {
    color: colors.accent,
    fontWeight: "600",
    fontSize: 13,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalBackground,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  monthNavButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthNav: {
    fontSize: 16,
    color: colors.text,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  modalSubTitle: {
    fontSize: 12,
    color: colors.subText,
  },
  closeButton: {
    fontSize: 24,
    color: colors.subText,
  },
  notesInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    textAlignVertical: "top",
    color: colors.text,
  },
  calendarContainer: {
    marginBottom: 16,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  calendarNav: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calendarNavText: {
    fontSize: 18,
    color: colors.text,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  weekdayLabel: {
    width: "14.28%",
    textAlign: "center",
    fontSize: 12,
    color: colors.subText,
    marginBottom: 6,
  },
  calendarCell: {
    width: "14.28%",
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 6,
  },
  calendarCellSelected: {
    backgroundColor: colors.accent,
  },
  calendarCellText: {
    color: colors.text,
  },
  calendarCellTextSelected: {
    color: colors.accentText,
    fontWeight: "700",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});