import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { authAPI, bookingsAPI } from "../../api/api";
import { useAuth } from "../../context/auth-context";
import { useState, useCallback, useEffect, useRef } from "react";
import { useTheme } from "../../context/theme-context";

export default function BookHall() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { user } = useAuth();

  const { name, capacity, id: hallId } = useLocalSearchParams();

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("AM");
  const [endTime, setEndTime] = useState("");
  const [endPeriod, setEndPeriod] = useState<"AM" | "PM">("PM");
  const [startMinute, setStartMinute] = useState("");
  const [endMinute, setEndMinute] = useState("");
  const [purpose, setPurpose] = useState("");
  const [people, setPeople] = useState("");
  const [mics, setMics] = useState("");
  const [projectorRequired, setProjectorRequired] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successDetails, setSuccessDetails] = useState({ hall: '', date: '', time: '', people: 0 });

  // Real-time availability check
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilityError, setAvailabilityError] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const debounceRef = useRef<any>(null);

  const checkAvailability = useCallback(async () => {
    if (!date || !startTime || !endTime || !startMinute || !endMinute || !hallId) {
      setIsAvailable(true);
      setAvailabilityError("");
      return;
    }

    // Convert 12hr to 24hr for backend
    const startHour12 = Number(startTime);
    const endHour12 = Number(endTime);
    const startMin = Number(startMinute);
    const endMin = Number(endMinute);

    let startHour24 = startHour12 % 12 + (startPeriod === "PM" ? 12 : 0);
    let endHour24 = endHour12 % 12 + (endPeriod === "PM" ? 12 : 0);

    const startTime24 = `${startHour24.toString().padStart(2, '0')}:${startMinute.padStart(2, '0')}`;
    const endTime24 = `${endHour24.toString().padStart(2, '0')}:${endMinute.padStart(2, '0')}`;

    setCheckingAvailability(true);
    try {
      const response = await bookingsAPI.checkAvailability({
        hall: String(hallId),
        date,
        startTime: startTime24,
        endTime: endTime24
      });
      setIsAvailable(response.available);
      setAvailabilityError(response.available ? "" : response.message || "Time slot unavailable");
    } catch (error) {
      console.error("Availability check failed:", error);
      setIsAvailable(true);
      setAvailabilityError("");
    } finally {
      setCheckingAvailability(false);
    }
  }, [date, startTime, startPeriod, startMinute, endTime, endPeriod, endMinute, hallId]);

  const getMonthDays = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
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

  const formatDisplayDate = (d: Date) => d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

  // Debounced availability check
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(checkAvailability, 800);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [date, startTime, startPeriod, startMinute, endTime, endPeriod, endMinute, checkAvailability]);

  const submitBooking = async () => {
    const peopleNum = Number(people);
    const timeRange = `${startTime.padStart(2,'0')}:${startMinute.padStart(2,'0')} ${startPeriod} - ${endTime.padStart(2,'0')}:${endMinute.padStart(2,'0')} ${endPeriod}`;
    
    if (!date || !startTime || !endTime || !startMinute || !endMinute || !purpose || !people || !hallId || !user) {
      alert("Please log in and fill all required fields.");
      return;
    }
    
    const startHour12 = Number(startTime);
    const endHour12 = Number(endTime);
    const startMin = Number(startMinute);
    const endMin = Number(endMinute);
    if (isNaN(startHour12) || startHour12 < 1 || startHour12 > 12 || 
        isNaN(endHour12) || endHour12 < 1 || endHour12 > 12 ||
        isNaN(startMin) || startMin > 59 || 
        isNaN(endMin) || endMin > 59) {
      alert("Please enter valid time (hours 1-12, minutes 0-59).");
      return;
    }
    
    if (Number(capacity) && peopleNum > Number(capacity)) {
      alert(`Capacity exceeded. Maximum: ${capacity} people`);
      return;
    }
    if (mics && (isNaN(Number(mics)) || Number(mics) < 0)) {
      alert("Please enter a valid number of mics.");
      return;
    }

    try {
      // Convert 12hr to 24hr (reuse validation vars)
      let startHour24 = startHour12 % 12 + (startPeriod === "PM" ? 12 : 0);
      let endHour24 = endHour12 % 12 + (endPeriod === "PM" ? 12 : 0);

      const startTime24 = `${startHour24.toString().padStart(2, '0')}:${startMinute.padStart(2, '0')}`;
      const endTime24 = `${endHour24.toString().padStart(2, '0')}:${endMinute.padStart(2, '0')}`;

      console.log('=== BOOKING DEBUG ===');
      console.log('User start:', startTime, startPeriod, startMinute, '→', startHour24);
      console.log('User end:', endTime, endPeriod, endMinute, '→', endHour24);
      console.log('Sending startTime24:', startTime24);
      console.log('Sending endTime24:', endTime24);
      console.log('===================');

      const bookingData = {
        hall: String(hallId),
        purpose,
        people: peopleNum,
        mics: Number(mics) || 0,
        projector: projectorRequired,
        date: date,
        startTime: startTime24,
        endTime: endTime24,
      }; 

      await bookingsAPI.createBooking(bookingData);
      setSuccessDetails({ hall: String(name), date, time: timeRange, people: peopleNum });
      setSuccessModalVisible(true);
    } catch (error) {
      console.error(error);
      alert("Booking failed: " + (error.response?.data?.message || error.message || "Try again"));
    }
  };
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hall Info Card */}
      <View style={styles.hallInfoCard}>
        <View style={styles.hallIconContainer}>
          <Text style={styles.hallIcon}>🏛️</Text>
        </View>
        <View style={styles.hallInfoContent}>
          <Text style={styles.hallName}>{name}</Text>
          <View style={styles.hallMeta}>
            <Text style={styles.hallMetaText}>👥 Capacity: {capacity} people</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Booking Details</Text>

      {/* Date Selection */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>📅 Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setDatePickerVisible(true)}
        >
          <Text style={[styles.dateButtonText, !date && styles.placeholder]}>
            {date || "Select a date"}
          </Text>
          <Text style={styles.dateIcon}>📆</Text>
        </TouchableOpacity>
      </View>

      {/* Time Selection - From To with AM/PM */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>🕐 Time</Text>
        <View style={styles.timeContainer}>
          {/* From */}
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>From</Text>
            <View style={styles.timeInputRow}>
              <TextInput
                style={styles.timeInput}
                placeholder="9"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={startTime}
                onChangeText={setStartTime}
                maxLength={2}
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={styles.timeInput}
                placeholder="15"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={startMinute}
                onChangeText={setStartMinute}
                maxLength={2}
              />
              <View style={styles.periodSelector}>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    startPeriod === "AM" && styles.periodButtonActive,
                    { backgroundColor: startPeriod === "AM" ? colors.accent : colors.background }
                  ]}
                  onPress={() => setStartPeriod("AM")}
                >
                  <Text style={[
                    styles.periodText,
                    { color: startPeriod === "AM" ? colors.accentText : colors.subText }
                  ]}>AM</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    startPeriod === "PM" && styles.periodButtonActive,
                    { backgroundColor: startPeriod === "PM" ? colors.accent : colors.background }
                  ]}
                  onPress={() => setStartPeriod("PM")}
                >
                  <Text style={[
                    styles.periodText,
                    { color: startPeriod === "PM" ? colors.accentText : colors.subText }
                  ]}>PM</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* To */}
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>To</Text>
            <View style={styles.timeInputRow}>
              <TextInput
                style={styles.timeInput}
                placeholder="2"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={endTime}
                onChangeText={setEndTime}
                maxLength={2}
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={styles.timeInput}
                placeholder="20"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={endMinute}
                onChangeText={setEndMinute}
                maxLength={2}
              />
              <View style={styles.periodSelector}>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    endPeriod === "AM" && styles.periodButtonActive,
                    { backgroundColor: endPeriod === "AM" ? colors.accent : colors.background }
                  ]}
                  onPress={() => setEndPeriod("AM")}
                >
                  <Text style={[
                    styles.periodText,
                    { color: endPeriod === "AM" ? colors.accentText : colors.subText }
                  ]}>AM</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    endPeriod === "PM" && styles.periodButtonActive,
                    { backgroundColor: endPeriod === "PM" ? colors.accent : colors.background }
                  ]}
                  onPress={() => setEndPeriod("PM")}
                >
                  <Text style={[
                    styles.periodText,
                    { color: endPeriod === "PM" ? colors.accentText : colors.subText }
                  ]}>PM</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Purpose */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>📝 Purpose</Text>
        <TextInput
          placeholder="e.g., Workshop, Meeting, Event"
          placeholderTextColor={colors.placeholder}
          style={styles.input}
          value={purpose}
          onChangeText={setPurpose}
        />
      </View>

      {/* Number of People */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>👥 Number of People</Text>
        <TextInput
          placeholder={`Max: ${capacity} people`}
          placeholderTextColor={colors.placeholder}
          style={styles.input}
          keyboardType="numeric"
          value={people}
          onChangeText={setPeople}
        />
      </View>

      {/* Mics */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>🎤 Number of Mics</Text>
        <TextInput
          placeholder="0"
          placeholderTextColor={colors.placeholder}
          style={styles.input}
          keyboardType="numeric"
          value={mics}
          onChangeText={setMics}
        />
      </View>

      {/* Projector Switch */}
      <View style={styles.switchContainer}>
        <View style={styles.switchLeft}>
          <Text style={styles.switchIcon}>📽️</Text>
          <View>
            <Text style={styles.switchLabel}>Projector Required</Text>
            <Text style={styles.switchSubtext}>
              {projectorRequired ? "Equipment will be arranged" : "No projector needed"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.switch,
            projectorRequired && { backgroundColor: colors.accent },
          ]}
          onPress={() => setProjectorRequired(!projectorRequired)}
        >
          <View style={[
            styles.switchThumb,
            projectorRequired && { transform: [{ translateX: 20 }] },
          ]} />
        </TouchableOpacity>
      </View>

      {/* Availability Status */}
      {availabilityError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {availabilityError}</Text>
        </View>
      ) : checkingAvailability ? (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>🔄 Checking availability...</Text>
        </View>
      ) : null}

      {/* Submit Button */}
      <TouchableOpacity
        disabled={!isAvailable || checkingAvailability}
        style={[
          styles.submitButton, 
          { 
            backgroundColor: isAvailable && !checkingAvailability ? colors.accent : colors.border 
          }
        ]}
        onPress={submitBooking}
        activeOpacity={0.8}
      >
        <Text style={styles.submitButtonText}>
          ✓ Submit {checkingAvailability ? '(Checking...)' : 'Booking Request'}
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />

      {/* Date Picker Modal */}
      <Modal
        visible={datePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.monthNav}
                onPress={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
              >
                <Text style={styles.monthNavText}>◀</Text>
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </Text>
              <TouchableOpacity
                style={styles.monthNav}
                onPress={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
              >
                <Text style={styles.monthNavText}>▶</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calendarGrid}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <Text key={day} style={styles.weekdayLabel}>{day}</Text>
              ))}
              {getCalendarGrid(calendarDate).map((day, index) => {
                const isSelected = day && date === formatDisplayDate(day);
                const isToday = day && day.toDateString() === new Date().toDateString();
                const isPast = day && day < new Date() && day.toDateString() !== new Date().toDateString();
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.calendarCell,
                      isSelected && { backgroundColor: colors.accent },
                      isToday && !isSelected && styles.calendarCellToday,
                      isPast && styles.calendarCellDisabled,
                    ]}
                    disabled={isPast || !day}
                    onPress={() => {
                      if (day) {
                        setDate(formatDisplayDate(day));
                        setDatePickerVisible(false);
                      }
                    }}
                  >
                    <Text style={[
                      styles.calendarCellText,
                      isSelected && { color: colors.accentText },
                      isToday && !isSelected && { color: colors.accent },
                      isPast && styles.calendarCellTextDisabled,
                    ]}>
                      {day ? day.getDate() : ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Booking Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertModal}>
            <Text style={styles.alertTitle}>Booking Confirmed!</Text>
            <Text style={styles.alertSubtitle}>Your request has been submitted.</Text>
            <View style={styles.alertDetailRow}>
              <Text style={styles.alertDetailLabel}>Hall</Text>
              <Text style={styles.alertDetailValue}>{successDetails.hall}</Text>
            </View>
            <View style={styles.alertDetailRow}>
              <Text style={styles.alertDetailLabel}>Date</Text>
              <Text style={styles.alertDetailValue}>{successDetails.date}</Text>
            </View>
            <View style={styles.alertDetailRow}>
              <Text style={styles.alertDetailLabel}>Time</Text>
              <Text style={styles.alertDetailValue}>{successDetails.time}</Text>
            </View>
            <View style={styles.alertDetailRow}>
              <Text style={styles.alertDetailLabel}>People</Text>
              <Text style={styles.alertDetailValue}>{successDetails.people}</Text>
            </View>
            <Text style={styles.alertStatus}>Pending Admin Approval</Text>
            <TouchableOpacity
              style={styles.alertButton}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.alertButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderWidth: 1,
    borderColor: '#ff6b6b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 15,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  infoText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  hallInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  hallIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.accent + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  hallIcon: {
    fontSize: 28,
  },
  hallInfoContent: {
    flex: 1,
  },
  hallName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  hallMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  hallMetaText: {
    fontSize: 13,
    color: colors.subText,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  dateButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholder: {
    color: colors.placeholder,
  },
  dateIcon: {
    fontSize: 20,
  },
  timeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  timeBlock: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: colors.subText,
    fontWeight: "600",
    marginBottom: 8,
  },
  timeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  timeInput: {
    width: 32,
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    paddingVertical: 0,
  },
  timeSeparator: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.subText,
  },
  periodSelector: {
    flexDirection: "row",
    marginLeft: 8,
    gap: 4,
  },
  periodButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodButtonActive: {
    borderColor: colors.accent,
  },
  periodText: {
    fontSize: 12,
    fontWeight: "600",
  },
  timeInputFull: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.card,
    color: colors.text,
    height: 44,
    marginBottom: 4,
  },
  timeInputError: {
    borderColor: '#ff6b6b',
    backgroundColor: 'rgba(255,107,107,0.1)',
  },
  parsedTime: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
  errorTextSmall: {
    fontSize: 11,
    color: '#ff4444',
    marginTop: 2,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  switchSubtext: {
    fontSize: 12,
    color: colors.subText,
    marginTop: 2,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    padding: 3,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  submitButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: colors.accentText,
    fontSize: 17,
    fontWeight: "700",
  },
  bottomSpacer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 360,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  closeButton: {
    fontSize: 24,
    color: colors.subText,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  monthNav: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  monthNavText: {
    fontSize: 16,
    color: colors.text,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  weekdayLabel: {
    width: "14.28%",
    textAlign: "center",
    fontSize: 12,
    color: colors.subText,
    marginBottom: 8,
  },
  calendarCell: {
    width: "14.28%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  calendarCellToday: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  calendarCellSelected: {},
  calendarCellDisabled: {
    opacity: 0.3,
  },
  calendarCellText: {
    fontSize: 14,
    color: colors.text,
  },
  calendarCellTextDisabled: {
    color: colors.subText,
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertModal: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  alertSubtitle: {
    fontSize: 15,
    color: colors.subText,
    textAlign: 'center',
    marginBottom: 20,
  },
  alertDetailRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  alertDetailLabel: {
    color: colors.subText,
    fontSize: 14,
    fontWeight: '600',
  },
  alertDetailValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    maxWidth: '60%',
  },
  alertStatus: {
    marginTop: 6,
    marginBottom: 20,
    fontSize: 13,
    color: colors.accent,
    fontWeight: '700',
  },
  alertButton: {
    width: '100%',
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  alertButtonText: {
    color: colors.accentText,
    fontSize: 16,
    fontWeight: '700',
  },
});
