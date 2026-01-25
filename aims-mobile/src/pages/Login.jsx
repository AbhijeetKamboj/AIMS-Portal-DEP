import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { supabase } from "../services/supabase";
import { getMyRole } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState("password");
  const [otpSent, setOtpSent] = useState(false);

  const navigation = useNavigation();
  const { login, role } = useAuth();

  // Auto redirect if already logged in
  useEffect(() => {
    const redirectIfLoggedIn = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;

      const res = await getMyRole();
      if (res?.role === "student") navigation.replace("Student");
      else if (res?.role === "faculty") navigation.replace("Faculty");
      else if (res?.role === "admin") navigation.replace("Admin");
    };

    redirectIfLoggedIn();
  }, []);

  // Password login
  const loginWithPassword = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password required");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert("Login Failed", error.message);
      setLoading(false);
      return;
    }

    await handlePostLogin(data.session);
  };

  // Send OTP
  const sendOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
      return;
    }

    Alert.alert("Success", "OTP sent to your email!");
    setOtpSent(true);
    setLoading(false);
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      Alert.alert("Verification Failed", error.message);
      setLoading(false);
      return;
    }

    await handlePostLogin(data.session);
  };

  // Common post-login handler
  const handlePostLogin = async (session) => {
    try {
      const roleRes = await getMyRole();

      if (!roleRes?.role) {
        Alert.alert("Error", "Role not found. Contact admin.");
        setLoading(false);
        return;
      }

      await login(session, roleRes.role);
    } finally {
      setLoading(false); 
    }
  };

  const switchMethod = (method) => {
    setLoginMethod(method);
    setOtpSent(false);
    setOtp("");
    setPassword("");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>AIMS</Text>
        <Text style={styles.subtitle}>
          Academic Information Management System
        </Text>
      </View>

      {/* Login Card */}
      <View style={styles.card}>
        <Text style={styles.welcomeText}>Welcome Back</Text>

        {/* Login Method Toggle */}
        <View style={styles.toggleContainer}>
          <Pressable
            style={[
              styles.toggleBtn,
              loginMethod === "password" && styles.toggleActive,
            ]}
            onPress={() => switchMethod("password")}
          >
            <Text
              style={[
                styles.toggleText,
                loginMethod === "password" && styles.toggleTextActive,
              ]}
            >
              Password
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.toggleBtn,
              loginMethod === "otp" && styles.toggleActive,
            ]}
            onPress={() => switchMethod("otp")}
          >
            <Text
              style={[
                styles.toggleText,
                loginMethod === "otp" && styles.toggleTextActive,
              ]}
            >
              Email OTP
            </Text>
          </Pressable>
        </View>

        {/* Email Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!(loginMethod === "otp" && otpSent)}
          />
        </View>

        {/* Password Input */}
        {loginMethod === "password" && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        )}

        {/* OTP Input */}
        {loginMethod === "otp" && otpSent && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter OTP</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              placeholder="000000"
              value={otp}
              onChangeText={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))}
              keyboardType="numeric"
              maxLength={6}
            />
            <Text style={styles.helperText}>
              Check your email for a 6-digit code
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
        ) : loginMethod === "password" ? (
          <Pressable style={styles.primaryBtn} onPress={loginWithPassword}>
            <Text style={styles.btnText}>Sign In</Text>
          </Pressable>
        ) : !otpSent ? (
          <Pressable style={styles.primaryBtn} onPress={sendOtp}>
            <Text style={styles.btnText}>Send OTP</Text>
          </Pressable>
        ) : (
          <View>
            <Pressable style={styles.primaryBtn} onPress={verifyOtp}>
              <Text style={styles.btnText}>Verify & Sign In</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => setOtpSent(false)}
            >
              <Text style={styles.secondaryBtnText}>← Change email</Text>
            </Pressable>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>Secure login powered by Supabase</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#111827",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  toggleTextActive: {
    color: "#111827",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  otpInput: {
    textAlign: "center",
    fontSize: 24,
    letterSpacing: 8,
    fontFamily: "monospace",
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  loader: {
    marginTop: 24,
  },
  primaryBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  secondaryBtnText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 24,
  },
});
