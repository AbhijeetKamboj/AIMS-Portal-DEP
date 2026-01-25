import { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getMyRole } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function RoleLoader() {
  const navigation = useNavigation();
  const { role, setRole } = useAuth();

  useEffect(() => {
    const resolveRole = async () => {
      try {
        const res = await getMyRole();

        if (!res?.role) {
          alert("Role not found. Contact admin.");
          return;
        }

        setRole(res.role);

        if (res.role === "student") {
          navigation.replace("StudentHome");
        } else if (res.role === "faculty") {
          navigation.replace("FacultyHome");
        } else if (res.role === "admin") {
          navigation.replace("AdminHome");
        } else {
          alert("Invalid role");
        }
      } catch (err) {
        console.log("Role resolution failed:", err);
        alert("Failed to verify access");
      }
    };

    // If role already exists (from SecureStore), skip API call
    if (role) {
      if (role === "student") navigation.replace("StudentHome");
      else if (role === "faculty") navigation.replace("FacultyHome");
      else if (role === "admin") navigation.replace("AdminHome");
      return;
    }

    resolveRole();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>Verifying access…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  text: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
});
