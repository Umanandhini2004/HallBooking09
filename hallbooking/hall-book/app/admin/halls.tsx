import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Modal, Platform, Alert, ActivityIndicator } from "react-native";
import { useTheme } from "../../context/theme-context";
import { hallsAPI } from "../../api/api";
const Halls = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Add modal
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit modal
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAvailable, setEditAvailable] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const { colors } = useTheme();
  const styles = createStyles(colors);

  const fetchHalls = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hallsAPI.getHalls();
      setHalls(data.map(hall => ({ ...hall, id: hall._id })));
    } catch (err) {
      console.error('Fetch halls error:', err);
      setError(err.response?.data?.message || 'Failed to fetch halls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalls();
  }, []);

  const addHall = async () => {
    if (!name || !capacity || !location) {
      Alert.alert('Error', 'Name, capacity and location are required');
      return;
    }
    try {
      await hallsAPI.createHall({
        name,
        capacity: parseInt(capacity),
        location,
        description,
        available: true
      });
      setName("");
      setCapacity("");
      setLocation("");
      setDescription("");
      setShowAddModal(false);
      fetchHalls();
      Alert.alert('Success', 'Hall added successfully');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add hall');
    }
  };

  const openAddModal = () => {
    setName("");
    setCapacity("");
    setLocation("");
    setDescription("");
    setShowAddModal(true);
  };

  const startEdit = (hall) => {
    setEditingId(hall._id);
    setEditName(hall.name);
    setEditCapacity(hall.capacity.toString());
    setEditLocation(hall.location);
    setEditDescription(hall.description || "");
    setEditAvailable(hall.available);
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!editName || !editCapacity || !editLocation) {
      Alert.alert('Error', 'Name, capacity and location are required');
      return;
    }
    try {
      await hallsAPI.updateHall(editingId, {
        name: editName,
        capacity: parseInt(editCapacity),
        location: editLocation,
        description: editDescription,
        available: editAvailable
      });
      setShowEditModal(false);
      setEditingId(null);
      fetchHalls();
      Alert.alert('Success', 'Hall updated successfully');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update hall');
    }
  };

  const deleteHall = async (id) => {
    Alert.alert(
      'Delete Hall',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await hallsAPI.deleteHall(id);
              fetchHalls();
              Alert.alert('Success', 'Hall deleted');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete hall');
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHalls();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ActivityIndicator size="large" color={colors.accent} style={{ flex: 1, justifyContent: 'center' }} />
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Manage Halls</Text>
        <Text style={styles.subtitle}>Add and manage available halls</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchHalls} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={halls}
        keyExtractor={(item) => item._id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={() => (
          <Text style={styles.hallsTitle}>Available Halls ({halls.length})</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.hallCard}>
            <View style={styles.hallContent}>
              <View style={styles.hallIcon}>
                <Text style={styles.hallIconText}>🏛️</Text>
              </View>
              <View style={styles.hallInfo}>
                <Text style={styles.hallName}>{item.name}</Text>
                <View style={styles.capacityBadge}>
                  <Text style={styles.capacityIcon}>👥</Text>
                  <Text style={styles.capacityText}>{item.capacity} people</Text>
                </View>
                <View style={styles.locationBadge}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.locationText}>{item.location}</Text>
                </View>
                {item.description && <Text style={styles.descriptionText}>{item.description}</Text>}
                <View style={[styles.statusBadge, { backgroundColor: item.available ? '#4caf5020' : '#f4433630' }]}>
                  <Text style={{ color: item.available ? '#4caf50' : '#f44336', fontWeight: '600' }}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.editButton} onPress={() => startEdit(item)}>
                <Text style={styles.editButtonText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteHall(item._id)}>
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏛️</Text>
            <Text style={styles.emptyText}>No halls yet</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.floatingAddButton} onPress={openAddModal}>
        <Text style={styles.floatingAddButtonText}>+</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Hall</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalInputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Hall name" />
            </View>
            <View style={styles.modalInputGroup}>
              <Text style={styles.label}>Capacity</Text>
              <TextInput style={styles.input} value={capacity} onChangeText={setCapacity} keyboardType="numeric" placeholder="100" />
            </View>
            <View style={styles.modalInputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Building A" />
            </View>
            <View style={styles.modalInputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} multiline placeholder="Optional" />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addHall}>
                <Text style={styles.saveButtonText}>Add Hall</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Hall</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalInputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput style={styles.input} value={editName} onChangeText={setEditName} />
            </View>
            <View style={styles.modalInputGroup}>
              <Text style={styles.label}>Capacity</Text>
              <TextInput style={styles.input} value={editCapacity} onChangeText={setEditCapacity} keyboardType="numeric" />
            </View>
            <View style={styles.modalInputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput style={styles.input} value={editLocation} onChangeText={setEditLocation} />
            </View>
            <View style={styles.modalInputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, { height: 80 }]} value={editDescription} onChangeText={setEditDescription} multiline />
            </View>
            <View style={styles.modalInputGroup}>
              <Text style={styles.label}>Available</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity style={[styles.toggleOption, !editAvailable && styles.toggleOptionActive]} onPress={() => setEditAvailable(false)}>
                  <Text style={[styles.toggleText, !editAvailable && styles.toggleTextActive]}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.toggleOption, editAvailable && styles.toggleOptionActive]} onPress={() => setEditAvailable(true)}>
                  <Text style={[styles.toggleText, editAvailable && styles.toggleTextActive]}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveEdit}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.subText,
    marginTop: 4,
  },
  hallsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    margin: 20,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: colors.accentText,
    fontWeight: '600',
  },
  hallCard: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  hallContent: {
    flexDirection: 'row',
  },
  hallIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  hallIconText: {
    fontSize: 28,
  },
  hallInfo: {
    flex: 1,
  },
  hallName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
    width: 120,
  },
  capacityIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  capacityText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
    color: colors.subText,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.subText,
    marginBottom: 12,
    lineHeight: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    backgroundColor: colors.accent + '20',
    padding: 10,
    borderRadius: 10,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#f4433620',
    padding: 10,
    borderRadius: 10,
  },
  editButtonText: {
    fontSize: 20,
    color: colors.accent,
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#f44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.subText,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    fontSize: 24,
    color: colors.subText,
  },
  modalInputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 25,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  toggleOptionActive: {
    backgroundColor: colors.accent,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.subText,
  },
  toggleTextActive: {
    color: colors.accentText,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.subText,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
 saveButtonText: {
  fontSize: 16,
  fontWeight: '600',
  color: colors.accentText,
},

floatingAddButton: {
  position: 'absolute',
  bottom: 30,
  right: 20,
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: colors.accent,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 5,
},

floatingAddButtonText: {
  fontSize: 30,
  color: colors.accentText,
  fontWeight: 'bold',
},

});

export default Halls;

