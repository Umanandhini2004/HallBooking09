import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { useTheme } from "../../context/theme-context";
import { router } from "expo-router";
import { useAuth } from "../../context/auth-context";

export default function Register() {
  const { colors, mode, toggleMode } = useTheme();
  const styles = createStyles(colors);
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("student");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState(""); 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await register(name, email, password, role, phone, department);
      alert("🎉 Account created successfully!");
      router.push("/user/login");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleMode}>
            <Text style={styles.themeToggleText}>{mode === "dark" ? "🌙" : "☀️"}</Text>
          </TouchableOpacity>
        </View>

        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🎉</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and start booking halls</Text>
        </View>

        {/* Register Form */}
        <View style={styles.card}>
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📧</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.placeholder}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIcon}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Role Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Role</Text>
            <View style={[styles.inputContainer, styles.segmentedContainer]}>
              <TouchableOpacity 
                style={[styles.segmentButton, role === 'student' && styles.segmentActive]}
                onPress={() => setRole('student')}
              >
                <Text style={[styles.segmentText, role === 'student' && {color: colors.accentText}]}>👨‍🎓 Student</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.segmentButton, role === 'faculty' && styles.segmentActive]}
                onPress={() => setRole('faculty')}
              >
                <Text style={[styles.segmentText, role === 'faculty' && {color: colors.accentText}]}>👨‍🏫 Faculty</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone (Optional)</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📱</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                placeholder="9876543210"
                placeholderTextColor={colors.placeholder}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>
          </View>

          {/* Department Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Department (Optional)</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🏫</Text>
              <TextInput
                value={department}
                onChangeText={setDepartment}
                style={styles.input}
                placeholder="e.g. Computer Science"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔐</Text>
              <TextInput
                secureTextEntry={!showConfirm}
                value={confirm}
                onChangeText={setConfirm}
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.placeholder}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowConfirm(!showConfirm)}
              >
                <Text style={styles.eyeIcon}>{showConfirm ? "👁️" : "👁️‍🗨️"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms */}
          <View style={styles.termsContainer}>
            <View style={styles.checkbox}>
              <Text style={styles.checkboxIcon}>✓</Text>
            </View>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Register Button */}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.accent },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: colors.accentText }]}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/user/login")}>
            <Text style={[styles.footerLink, { color: colors.accent }]}>Sign in</Text>
          </TouchableOpacity>
        </View>

        {/* Back to Home */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/")}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    segmentedContainer: {
      flexDirection: 'row',
      paddingHorizontal: 0,
    },
    segmentButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: colors.card,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    segmentActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    segmentText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.subText,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 20,
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
    logoSection: {
      alignItems: "center",
      marginBottom: 28,
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 24,
      backgroundColor: colors.accent + "20",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    logoIcon: {
      fontSize: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 15,
      color: colors.subText,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
    },
    inputIcon: {
      fontSize: 18,
      marginRight: 10,
    },
    input: {
      flex: 1,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
    },
    eyeButton: {
      padding: 4,
    },
    eyeIcon: {
      fontSize: 18,
    },
    termsContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 20,
      marginTop: 4,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
      marginTop: 2,
    },
    checkboxIcon: {
      color: colors.accentText,
      fontSize: 12,
      fontWeight: "700",
    },
    termsText: {
      flex: 1,
      fontSize: 13,
      color: colors.subText,
      lineHeight: 20,
    },
    termsLink: {
      color: colors.accent,
      fontWeight: "600",
    },
    errorContainer: {
      backgroundColor: "#FEE2E2",
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      color: "#DC2626",
      fontSize: 14,
      textAlign: "center",
    },
    button: {
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      fontSize: 17,
      fontWeight: "700",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 24,
      gap: 6,
    },
    footerText: {
      color: colors.subText,
      fontSize: 15,
    },
    footerLink: {
      fontSize: 15,
      fontWeight: "700",
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 24,
      paddingVertical: 12,
    },
    backIcon: {
      fontSize: 18,
      color: colors.subText,
      marginRight: 6,
    },
    backText: {
      fontSize: 14,
      color: colors.subText,
      fontWeight: "500",
    },
  });

