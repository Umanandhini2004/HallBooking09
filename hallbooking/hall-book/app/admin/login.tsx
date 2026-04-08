import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { useTheme } from "../../context/theme-context";
import { router } from "expo-router";
import { authAPI } from "../../api/api";
import { useAuth } from "../../context/auth-context";

export default function Login() {
  const { colors, mode, toggleMode } = useTheme();
  const styles = createStyles(colors);
  const { user, setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await authAPI.adminLogin(email, password);
      setUser(data);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed. Please try again.");
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
        <View style={styles.header}>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleMode}>
            <Text style={styles.themeToggleText}>{mode === "dark" ? "🌙" : "☀️"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>👑</Text>
          </View>
          <Text style={styles.title}>Admin Login</Text>
          <Text style={styles.subtitle}>Access admin panel</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>📧</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder="admin@example.com"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

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

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.accent },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: colors.accentText }]}>
              {isLoading ? "Signing in..." : "Admin Sign In"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* <View style={styles.footer}>
          <Text style={styles.footerText}>New admin?</Text>
          <TouchableOpacity onPress={() => router.push("/admin/register")}>
            <Text style={[styles.footerLink, { color: colors.accent }]}>Register here</Text>
          </TouchableOpacity>
        </View> */}

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
      marginBottom: 32,
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
      marginBottom: 18,
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
    forgotButton: {
      alignSelf: "flex-end",
      marginBottom: 20,
    },
    forgotText: {
      fontSize: 14,
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

