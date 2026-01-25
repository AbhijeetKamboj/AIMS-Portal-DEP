import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getMyRole } from "../services/api";

export default function ProtectedRoute({ children, allow }) {
  const navigation = useNavigation();
  const { session, loading: authLoading } = useAuth();
  const [status, setStatus] = useState("loading"); // loading | ok | forbidden

  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      navigation.replace("Login");
      return;
    }

    getMyRole().then((res) => {
      if (res?.role && allow.includes(res.role)) {
        setStatus("ok");
      } else {
        setStatus("forbidden");
        navigation.replace("Login");
      }
    });
  }, [session, authLoading, allow]);

  if (authLoading || status === "loading") {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Checking access…</Text>
      </View>
    );
  }

  if (status !== "ok") {
    return null;
  }

  return children;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
});
