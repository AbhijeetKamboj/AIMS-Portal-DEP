import { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { apiFetch } from "../../services/api";

export default function BulkEnroll({ offering, visible, onClose }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    const rollNumbers = input
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (rollNumbers.length === 0) {
      Alert.alert("Error", "Please enter roll numbers");
      return;
    }

    setLoading(true);
    setResult(null);

    const res = await apiFetch("/faculty/bulk-enroll", "POST", {
      offering_id: offering.id,
      roll_numbers: rollNumbers,
    });

    setLoading(false);

    if (res?.error) {
      Alert.alert("Error", res.error);
    } else {
      setResult(res.results);
      if (res.results.success > 0) {
        Alert.alert(
          "Success",
          `Enrolled ${res.results.success} students`
        );
        setInput("");
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Bulk Enroll Students</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          {/* Course Info */}
          <View style={styles.courseInfo}>
            <Text style={styles.label}>Course</Text>
            <Text style={styles.courseText}>
              {offering.courses.course_code} –{" "}
              {offering.courses.course_name}
            </Text>
          </View>

          {/* Input */}
          <Text style={styles.label}>
            Roll Numbers (comma or newline separated)
          </Text>
          <TextInput
            multiline
            value={input}
            onChangeText={setInput}
            placeholder={`2023CSB1094\n2023CSB1095`}
            style={styles.textarea}
            textAlignVertical="top"
          />

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={loading || !input.trim()}
            style={[
              styles.submitBtn,
              (loading || !input.trim()) && styles.disabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Enroll Students</Text>
            )}
          </Pressable>

          {/* Results */}
          {result && (
            <View style={styles.resultBox}>
              <View style={styles.resultRow}>
                <Text style={styles.success}>
                  Success: {result.success}
                </Text>
                <Text style={styles.failed}>
                  Failed: {result.failed}
                </Text>
              </View>

              {result.errors.length > 0 && (
                <ScrollView style={styles.errorList}>
                  {result.errors.map((e, i) => (
                    <Text key={i} style={styles.errorText}>
                      {e.roll_number}: {e.error}
                    </Text>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    paddingBottom: 6,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  close: { fontSize: 20, color: "#6b7280" },
  courseInfo: { marginBottom: 12 },
  label: { fontWeight: "600", marginBottom: 4 },
  courseText: { color: "#111827" },
  textarea: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    height: 140,
    marginBottom: 12,
    fontFamily: "monospace",
  },
  submitBtn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "bold" },
  disabled: { opacity: 0.5 },
  resultBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  success: { color: "#16a34a", fontWeight: "bold" },
  failed: { color: "#dc2626", fontWeight: "bold" },
  errorList: { maxHeight: 100 },
  errorText: { fontSize: 12, color: "#dc2626" },
});
