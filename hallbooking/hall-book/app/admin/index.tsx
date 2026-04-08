import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const colors = {
  background: "#f5f7fb",
  accent: "#2563eb",
  text: "#111827",
  subText: "#6b7280",
  card: "#ffffff",
  border: "#d1d5db",
  placeholder: "#9ca3af",
  accentText: "#ffffff",
};
export default function AdminLogin() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isEmailValid = name.trim().toLowerCase().endsWith("@nec.edu.in");
  const isPasswordValid = password.length >= 8;

  const handleLogin = () => {
    // basic validation before navigation
    if (!isEmailValid) {
      setError("Email must end with @nec.edu.in");
      return;
    }
    if (!isPasswordValid) {
      setError("Password must be at least 8 characters long");
      return;
    }

    // clear any previous error and proceed
    setError("");
    router.push("/admin/dashboard" as any);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={[styles.icon, { color: colors.accent }]}>🔐</Text>
          <Text style={[styles.title, { color: colors.text }]}>Admin Portal</Text>
          <Text style={[styles.subtitle, { color: colors.subText }]}>Secure access to manage halls & bookings</Text>
        </View>

        <View style={[styles.formContainer, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>NEC Email</Text>
            <TextInput
              placeholder="Enter your NEC email"
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError("");
              }}
              placeholderTextColor={colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {!isEmailValid && name.length > 0 && (
              <Text style={styles.errorText}>Email must end with @nec.edu.in</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <TextInput
              placeholder="Enter your password"
              secureTextEntry
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError("");
              }}
              placeholderTextColor={colors.placeholder}
            />
            {!isPasswordValid && password.length > 0 && (
              <Text style={styles.errorText}>Password must be at least 8 characters</Text>
            )}
          </View>

          {error ? <Text style={styles.errorTextCenter}>{error}</Text> : null}

          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: colors.accent },
              (!name || !password || !isEmailValid || !isPasswordValid) ? styles.disabledButton : {},
            ]}
            onPress={handleLogin}
            disabled={!name || !password || !isEmailValid || !isPasswordValid}
          >
            <Text style={[styles.loginButtonText, { color: colors.accentText }]}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToHome}
            onPress={() => router.replace("/" as any)}
          >
            <Text style={[styles.backText, { color: colors.subText }]}>Back to home</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.subText }]}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/admin/register" as any)}>
            <Text style={[styles.registerLink, { color: colors.accent }]}>Register Here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  icon: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280,
  },
  formContainer: {
    borderRadius: 18,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.55,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  backToHome: {
    marginTop: 14,
    alignItems: "center",
  },
  backText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  footerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "700",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 12,
    marginTop: 6,
  },
  errorTextCenter: {
    color: "#d32f2f",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
});