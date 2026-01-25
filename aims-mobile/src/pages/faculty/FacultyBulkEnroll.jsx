import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { apiFetch } from "../../services/api";

export default function FacultyBulkEnroll() {
  const [offerings, setOfferings] = useState([]);
  const [selectedOffering, setSelectedOffering] = useState("");
  const [rollNumbersInput, setRollNumbersInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [inputMethod, setInputMethod] = useState("manual");

  useEffect(() => {
    fetchOfferings();
  }, []);

  const fetchOfferings = async () => {
    const res = await apiFetch("/faculty/my-courses");
    if (!res?.error) {
      setOfferings(res);
      if (res.length > 0) setSelectedOffering(res[0].id);
    }
  };

  const handleEnroll = async () => {
    if (!selectedOffering) {
      return Alert.alert("Error", "Please select a course offering");
    }

    const rollNumbers = rollNumbersInput
      .split(/[\n,]+/)
      .map((r) => r.trim())
      .filter(Boolean);

    if (rollNumbers.length === 0) {
      return Alert.alert("Error", "Enter at least one roll number");
    }

    setLoading(true);
    setResult(null);

    const res = await apiFetch("/faculty/bulk-enroll", "POST", {
      offering_id: selectedOffering,
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
        setRollNumbersInput("");
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Course Picker */}
      <Text style={styles.label}>Select Course Offering</Text>
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={selectedOffering}
          onValueChange={setSelectedOffering}
        >
          <Picker.Item label="-- Select Course --" value="" />
          {offerings.map((o) => (
            <Picker.Item
              key={o.id}
              label={`${o.courses.course_code} - ${o.courses.course_name} (${o.semesters.name})`}
              value={o.id}
            />
          ))}
        </Picker>
      </View>

      {/* Input Method Toggle */}
      <View style={styles.toggle}>
        {["manual", "paste"].map((m) => (
          <Pressable
            key={m}
            onPress={() => setInputMethod(m)}
            style={[
              styles.toggleBtn,
              inputMethod === m && styles.toggleActive,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                inputMethod === m && styles.toggleTextActive,
              ]}
            >
              {m === "manual" ? "Manual Entry" : "Paste List"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.infoText}>
          • Rejected students will not be enrolled{"\n"}
          • Pending requests continue normal approval flow
        </Text>
      </View>

      {/* Roll Numbers Input */}
      <Text style={styles.label}>Student Roll Numbers</Text>
      <TextInput
        value={rollNumbersInput}
        onChangeText={setRollNumbersInput}
        placeholder={"2023CSB1001\n2023CSB1002\n2023CSB1003"}
        multiline
        numberOfLines={8}
        style={styles.textArea}
      />

      {/* Submit */}
      <Pressable
        onPress={handleEnroll}
        disabled={loading || !selectedOffering}
        style={[
          styles.submit,
          (loading || !selectedOffering) && styles.submitDisabled,
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
          <Text style={styles.resultTitle}>Enrollment Results</Text>

          <View style={styles.badges}>
            <Text style={styles.success}>
              {result.success} Success
            </Text>
            <Text style={styles.failed}>
              {result.failed} Failed
            </Text>
          </View>

          {result.errors?.length > 0 ? (
            result.errors.map((e, i) => (
              <View key={i} style={styles.errorRow}>
                <Text style={styles.roll}>{e.roll_number}</Text>
                <Text style={styles.errorText}>{e.error}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.allGood}>
              All students enrolled successfully!
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    marginBottom: 16,
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: "#fff",
  },
  toggleText: {
    color: "#6b7280",
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#000",
  },
  info: {
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    color: "#1e40af",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 20,
    fontFamily: "monospace",
  },
  submit: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  submitDisabled: {
    backgroundColor: "#d1d5db",
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
  },
  resultBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  resultTitle: {
    fontWeight: "700",
    marginBottom: 10,
  },
  badges: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  success: {
    color: "#16a34a",
    fontWeight: "600",
  },
  failed: {
    color: "#dc2626",
    fontWeight: "600",
  },
  errorRow: {
    marginBottom: 6,
  },
  roll: {
    fontWeight: "600",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
  },
  allGood: {
    textAlign: "center",
    color: "#16a34a",
    fontWeight: "600",
    marginTop: 12,
  },
});
