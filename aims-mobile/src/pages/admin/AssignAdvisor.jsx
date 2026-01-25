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

export default function AssignAdvisor() {
  const [form, setForm] = useState({
    student_roll: "",
    faculty_email: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.student_roll || !form.faculty_email) {
      Alert.alert.error("Fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/admin/assign-advisor", "POST", form);
      if (res.error) throw new Error(res.error);
      Alert.alert.success(res.message || "Advisor assigned");
      setForm({ student_roll: "", faculty_email: "" });
    } catch (err) {
      Alert.alert.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assign Faculty Advisor</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Student Roll Number</Text>
        <TextInput
          value={form.student_roll}
          onChangeText={(v) => setForm({ ...form, student_roll: v })}
          placeholder="2023CSB1094"
          autoCapitalize="characters"
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Faculty Email</Text>
        <TextInput
          value={form.faculty_email}
          onChangeText={(v) => setForm({ ...form, faculty_email: v })}
          placeholder="faculty@iitrpr.ac.in"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
      </View>

      <Pressable
        onPress={submit}
        disabled={loading}
        style={({ pressed }) => [
          styles.button,
          pressed && !loading && styles.pressed,
          loading && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Assign Advisor</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 24,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    color: "#444",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 15,
  },
  button: {
    marginTop: 12,
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
