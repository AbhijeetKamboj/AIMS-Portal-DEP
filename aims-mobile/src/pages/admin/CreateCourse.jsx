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

export default function CreateCourse() {
  const [form, setForm] = useState({
    course_code: "",
    course_name: "",
    credits: 0,
    l: 3,
    t: 0,
    p: 0,
    s: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        credits:
          +form.credits ||
          (+form.l + +form.t + +form.p + +form.s),
        l: +form.l,
        t: +form.t,
        p: +form.p,
        s: +form.s,
      };

      const res = await apiFetch("/courses/create", "POST", payload);
      if (res.error) throw new Error(res.error);

      Alert.alert.success("Course Created!");
      setForm({
        course_code: "",
        course_name: "",
        credits: 0,
        l: 3,
        t: 0,
        p: 0,
        s: 0,
      });
    } catch (err) {
      Alert.alert.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create New Course</Text>

      {/* Course Code */}
      <View style={styles.field}>
        <Text style={styles.label}>Course Code</Text>
        <TextInput
          value={form.course_code}
          onChangeText={(v) => handleChange("course_code", v)}
          placeholder="CS101"
          style={styles.input}
        />
      </View>

      {/* Course Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Course Name</Text>
        <TextInput
          value={form.course_name}
          onChangeText={(v) => handleChange("course_name", v)}
          placeholder="Introduction to Programming"
          style={styles.input}
        />
      </View>

      {/* Course Structure */}
      <View style={styles.structure}>
        <Text style={styles.sectionTitle}>Course Structure</Text>

        <View style={styles.row}>
          {["l", "t", "p", "s"].map((key) => (
            <View key={key} style={styles.smallField}>
              <Text style={styles.smallLabel}>{key.toUpperCase()}</Text>
              <TextInput
                keyboardType="numeric"
                value={String(form[key])}
                onChangeText={(v) => handleChange(key, v)}
                style={styles.numberInput}
              />
            </View>
          ))}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Credits</Text>
          <TextInput
            keyboardType="numeric"
            value={String(form.credits)}
            onChangeText={(v) => handleChange("credits", v)}
            style={styles.creditsInput}
          />
          <Text style={styles.helper}>
            Leave 0 to auto-calculate from L-T-P-S
          </Text>
        </View>
      </View>

      {/* Submit */}
      <Pressable
        onPress={submit}
        disabled={loading}
        style={[styles.button, loading && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Course</Text>
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
  structure: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  smallField: {
    width: "22%",
  },
  smallLabel: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 4,
  },
  numberInput: {
    backgroundColor: "#fff",
    textAlign: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  creditsInput: {
    backgroundColor: "#000",
    color: "#fff",
    textAlign: "center",
    padding: 12,
    borderRadius: 12,
    fontWeight: "700",
  },
  helper: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 6,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
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
