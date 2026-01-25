import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { apiFetch } from "../../services/api";

export default function DirectEnroll() {
  const [form, setForm] = useState({
    roll_number: "",
    offering_id: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.roll_number.trim()) {
      return Alert.alert("Error", "Roll number is required");
    }
    if (!form.offering_id) {
      return Alert.alert("Error", "Offering ID is required");
    }

    setLoading(true);
    try {
      const res = await apiFetch("/faculty/direct-enroll", "POST", {
        roll_number: form.roll_number,
        offering_id: Number(form.offering_id),
      });

      if (res?.error) throw new Error(res.error);

      Alert.alert("Success", "Student enrolled successfully");
      setForm({ roll_number: "", offering_id: "" });
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Direct Enroll Student</Text>

      {/* Roll Number */}
      <View style={styles.field}>
        <Text style={styles.label}>Student Roll Number</Text>
        <TextInput
          value={form.roll_number}
          onChangeText={(v) =>
            setForm((f) => ({ ...f, roll_number: v }))
          }
          placeholder="2023CS01"
          style={styles.input}
          autoCapitalize="characters"
        />
      </View>

      {/* Offering ID */}
      <View style={styles.field}>
        <Text style={styles.label}>Offering ID</Text>
        <TextInput
          value={form.offering_id}
          onChangeText={(v) =>
            setForm((f) => ({ ...f, offering_id: v }))
          }
          placeholder="10"
          keyboardType="numeric"
          style={styles.input}
        />
      </View>

      {/* Submit */}
      <Pressable
        onPress={submit}
        disabled={loading}
        style={[
          styles.button,
          loading && styles.buttonDisabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Enroll Student</Text>
        )}
      </Pressable>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#111827",
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  button: {
    marginTop: 12,
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
