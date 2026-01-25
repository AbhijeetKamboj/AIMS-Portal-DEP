import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { apiFetch } from "../../services/api";

export default function CreateCourseCatalog() {
  const [formData, setFormData] = useState({
    course_code: "",
    course_name: "",
    credits: 0,
    department: "",
    l: 0,
    t: 0,
    p: 0,
    s: 0,
  });
  const [loading, setLoading] = useState(false);

  const update = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]:
        ["l", "t", "p", "s", "credits"].includes(key)
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.course_code.trim())
      return Alert.alert("Error", "Course code is required");
    if (!formData.course_name.trim())
      return Alert.alert("Error", "Course name is required");
    if (!formData.department.trim())
      return Alert.alert("Error", "Department is required");
    if (!formData.credits || formData.credits < 1)
      return Alert.alert("Error", "Credits must be at least 1");

    setLoading(true);
    const res = await apiFetch("/courses/create", "POST", formData);
    setLoading(false);

    if (res?.error) {
      Alert.alert("Error", res.error);
    } else {
      Alert.alert(
        "Success",
        "Course created successfully.\nPending admin approval."
      );
      setFormData({
        course_code: "",
        course_name: "",
        credits: 0,
        department: "",
        l: 0,
        t: 0,
        p: 0,
        s: 0,
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Add Course to Catalog</Text>
        <Text style={styles.subtitle}>
          Create a new course for future offerings. Admin approval required.
        </Text>
      </View>

      {/* Form */}
      <View style={styles.card}>
        {/* Course Code */}
        <Text style={styles.label}>Course Code</Text>
        <TextInput
          value={formData.course_code}
          onChangeText={(v) => update("course_code", v)}
          placeholder="CS305"
          style={styles.input}
        />

        {/* Department */}
        <Text style={styles.label}>Department</Text>
        <TextInput
          value={formData.department}
          onChangeText={(v) => update("department", v)}
          placeholder="CSE"
          style={styles.input}
        />

        {/* Course Name */}
        <Text style={styles.label}>Course Name</Text>
        <TextInput
          value={formData.course_name}
          onChangeText={(v) => update("course_name", v)}
          placeholder="Software Engineering"
          style={styles.input}
        />

        {/* Credits */}
        <Text style={styles.section}>Credits</Text>
        <TextInput
          keyboardType="numeric"
          value={String(formData.credits)}
          onChangeText={(v) => update("credits", v)}
          style={styles.inputCentered}
        />

        {/* L-T-P-S */}
        <Text style={styles.section}>L – T – P – S</Text>
        <View style={styles.ltpsRow}>
          {["l", "t", "p", "s"].map((key) => (
            <View key={key} style={styles.ltpsItem}>
              <Text style={styles.ltpsLabel}>{key.toUpperCase()}</Text>
              <TextInput
                keyboardType="numeric"
                value={String(formData[key])}
                onChangeText={(v) => update(key, v)}
                style={styles.ltpsInput}
              />
            </View>
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Note: This course will be submitted for admin approval before
            becoming active.
          </Text>
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={[
            styles.submitBtn,
            loading && styles.disabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Create Course</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#6b7280",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
  },
  inputCentered: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
  section: {
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 6,
  },
  ltpsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ltpsItem: {
    width: "22%",
    alignItems: "center",
  },
  ltpsLabel: {
    fontWeight: "600",
    marginBottom: 4,
  },
  ltpsInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    width: "100%",
    textAlign: "center",
    padding: 8,
    fontWeight: "bold",
  },
  infoBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#eff6ff",
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#1e3a8a",
  },
  submitBtn: {
    marginTop: 20,
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});
