import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useTheme, ThemeColors } from "../../context/theme-context";
import { useAuth } from "../../context/auth-context";
import { router } from "expo-router";
import ProfileEditModal from "../modal/ProfileEditModal";
import { authAPI } from "../../api/api";

function Profile() {
  const { colors, mode, toggleMode } = useTheme();
  const { user, loading, logout, refreshUser } = useAuth();
  const styles = createStyles(colors);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.replace("/user/login");
    }
  }, [loading, user]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  const initials = user.name ? user.name.split(' ').map(n => n[0].toUpperCase()).join('').slice(0, 2) : '??';
  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';

  const [editModalVisible, setEditModalVisible] = React.useState(false);

  const initialModalData = {
    name: user.name || '',
    phone: user.phone || '',
    department: user.department || ''
  };

  const menuItems = [
    {
      icon: '✏️',
      title: 'Edit Profile',
      subtitle: 'Update your information',
      onPress: () => setEditModalVisible(true)
    },
    {
      icon: '�',
      title: 'My Bookings',
      subtitle: 'View booking history',
      onPress: () => router.push('/user/my-bookings')
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.themeToggle} onPress={toggleMode}>
          <Text style={styles.themeToggleText}>{mode === 'dark' ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editAvatarButton}
            onPress={() => setEditModalVisible(true)}
          >
            <Text style={styles.editAvatarIcon}>📷</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{user.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user.email || ''}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user.role || 'User'}</Text>
        </View>
      </View>

      {/* User Info */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Text style={styles.infoIcon}>📧</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email || 'Not set'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Text style={styles.infoIcon}>📱</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{user.phone || 'Not set'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Text style={styles.infoIcon}>📅</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>{memberSince}</Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuCard}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index < menuItems.length - 1 && styles.menuItemBorder,
            ]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Logout", 
                style: "destructive", 
                onPress: async () => {
                  await logout();
                  router.replace("/user/login");
                }
              },
            ]
          );
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />

      <ProfileEditModal 
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        initialData={initialModalData}
        onSave={async (data) => {
          try {
            await authAPI.updateProfile(data);
            await refreshUser(); // Refresh user data to reflect changes
            Alert.alert('Success', 'Profile updated successfully');
          } catch (error) {
            console.error('Failed to update profile:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
          }
        }}
      />
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.text,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 20,
      marginBottom: 24,
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
    profileCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      alignItems: "center",
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    avatarContainer: {
      position: "relative",
      marginBottom: 16,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.accentText,
    },
    editAvatarButton: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.card,
    },
    editAvatarIcon: {
      fontSize: 14,
    },
    userName: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: colors.subText,
      marginBottom: 12,
    },
    roleBadge: {
      backgroundColor: colors.accent + "20",
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
    },
    roleText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.accent,
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    infoIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    infoIcon: {
      fontSize: 18,
    },
    infoContent: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 12,
      color: colors.subText,
      marginBottom: 2,
    },
    infoValue: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    menuCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
    },
    menuItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    menuIcon: {
      fontSize: 18,
    },
    menuContent: {
      flex: 1,
    },
    menuTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    menuSubtitle: {
      fontSize: 12,
      color: colors.subText,
    },
    menuArrow: {
      fontSize: 24,
      color: colors.subText,
      fontWeight: "300",
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: "#f44336",
      gap: 8,
    },
    logoutIcon: {
      fontSize: 18,
    },
    logoutText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#f44336",
    },
    bottomSpacer: {
      height: 30,
    },
  });

export default Profile;

