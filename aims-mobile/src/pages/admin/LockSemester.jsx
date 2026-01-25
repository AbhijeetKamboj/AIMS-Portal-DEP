import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { apiFetch } from "../../services/api";
// import Alert.alert from "react-hot-Alert.alert";

export default function LockSemester() {
  const [semesterId, setSemesterId] = useState("");
  const [loading, setLoading] = useState(false);

  const lock = async () => {
    if (!semesterId) {
      Alert.alert.error("Enter Semester ID");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/admin/lock-semester", "POST", {
        semester_id: +semesterId,
      });

      if (res.error) throw new Error(res.error);

      Alert.alert.success("Semester locked successfully");
      setSemesterId("");
    } catch (err) {
      Alert.alert.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lock Semester Grades</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Semester ID</Text>

        <TextInput
          value={semesterId}
          onChangeText={setSemesterId}
          keyboardType="numeric"
          placeholder="e.g. 1"
          style={styles.input}
        />

        <Pressable
          onPress={lock}
          disabled={loading}
          style={[
            styles.lockButton,
            loading && styles.disabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.lockText}>Lock Semester</Text>
          )}
        </Pressable>

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>⚠️ Warning</Text>
          <Text style={styles.warningText}>
            Locking a semester will permanently finalize all grades and prevent
            any further changes.
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 14,
  },
  lockButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  lockText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  disabled: {
    opacity: 0.5,
  },
  warningBox: {
    marginTop: 14,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  warningTitle: {
    fontWeight: "700",
    color: "#991b1b",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: "#7f1d1d",
    lineHeight: 16,
  },
});
