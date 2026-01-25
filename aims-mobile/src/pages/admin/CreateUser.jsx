import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { apiFetch } from "../../services/api";
// import Alert.alert from "react-hot-Alert.alert";

export default function CreateUser() {
  const [type, setType] = useState("student");
  const [form, setForm] = useState({
    department: "",
    name: "",
    email: "",
    roll_number: "",
    batch: "",
    employee_id: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const endpoint =
      type === "student"
        ? "/admin/create-student"
        : "/admin/create-faculty";

    try {
      const res = await apiFetch(endpoint, "POST", form);
      if (res.error) throw new Error(res.error);

      Alert.alert.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} created successfully!`
      );

      setForm({
        department: "",
        name: "",
        email: "",
        roll_number: "",
        batch: "",
        employee_id: "",
      });
    } catch (err) {
      Alert.alert.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create New User</Text>

      {/* User Type Toggle */}
      <View style={styles.toggleContainer}>
        <Pressable
          onPress={() => setType("student")}
          style={[
            styles.toggleButton,
            type === "student" && styles.activeToggle,
          ]}
        >
          <Text
            style={[
              styles.toggleText,
              type === "student" && styles.activeToggleText,
            ]}
          >
            Student
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setType("faculty")}
          style={[
            styles.toggleButton,
            type === "faculty" && styles.activeToggle,
          ]}
        >
          <Text
            style={[
              styles.toggleText,
              type === "faculty" && styles.activeToggleText,
            ]}
          >
            Faculty
          </Text>
        </Pressable>
      </View>

      {/* Common Fields */}
      <View style={styles.field}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          value={form.name}
          onChangeText={(v) => update("name", v)}
          placeholder="John Doe"
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          value={form.email}
          onChangeText={(v) => update("email", v)}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="john@example.com"
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Department</Text>
        <TextInput
          value={form.department}
          onChangeText={(v) => update("department", v)}
          placeholder="CSE"
          style={styles.input}
        />
      </View>

      {/* Dynamic Fields */}
      {type === "student" ? (
        <>
          <View style={styles.field}>
            <Text style={styles.label}>Roll Number</Text>
            <TextInput
              value={form.roll_number}
              onChangeText={(v) => update("roll_number", v)}
              placeholder="2023CS01"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Batch</Text>
            <TextInput
              value={form.batch}
              onChangeText={(v) => update("batch", v)}
              keyboardType="numeric"
              placeholder="2023"
              style={styles.input}
            />
          </View>
        </>
      ) : (
        <View style={styles.field}>
          <Text style={styles.label}>Employee ID</Text>
          <TextInput
            value={form.employee_id}
            onChangeText={(v) => update("employee_id", v)}
            placeholder="EMP001"
            style={styles.input}
          />
        </View>
      )}

      {/* Submit */}
      <Pressable
        onPress={submit}
        disabled={loading}
        style={[styles.button, loading && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            Create {type === "student" ? "Student" : "Faculty"}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  activeToggle: {
    backgroundColor: "#fff",
  },
  toggleText: {
    fontWeight: "700",
    color: "#6b7280",
  },
  activeToggleText: {
    color: "#000",
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
});
