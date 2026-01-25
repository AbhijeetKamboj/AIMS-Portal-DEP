import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { apiFetch } from "../../services/api";
// import Alert.alert from "react-hot-Alert.alert";

export default function BulkAssignAdvisor() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleProcess = async () => {
    setLoading(true);
    setResult(null);

    const lines = input.trim().split("\n");
    const assignments = [];

    for (const line of lines) {
      const parts = line.split(",").map(p => p.trim());
      if (parts.length < 2) continue;

      const [student_roll, faculty_email] = parts;
      assignments.push({ student_roll, faculty_email });
    }

    if (assignments.length === 0) {
      Alert.alert.error("No valid assignments found");
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch("/admin/bulk-advisors", "POST", {
        assignments,
      });

      if (res.error) {
        Alert.alert.error(res.error);
      } else {
        setResult(res.results);
        Alert.alert.success(`Processed ${res.results.success} assignments`);
      }
    } catch (err) {
      Alert.alert.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Bulk Assign Advisors</Text>
      <Text style={styles.subtitle}>
        Paste CSV data (one per line):
        {"\n"}
        <Text style={styles.code}>
          student_roll_number, faculty_email
        </Text>
      </Text>

      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder={
          "CS2401, prof.smith@univ.edu\nCS2402, prof.doe@univ.edu"
        }
        multiline
        textAlignVertical="top"
        autoCapitalize="none"
        style={styles.textarea}
      />

      <Pressable
        onPress={handleProcess}
        disabled={loading || !input.trim()}
        style={({ pressed }) => [
          styles.button,
          pressed && !loading && styles.pressed,
          (loading || !input.trim()) && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Assign Advisors</Text>
        )}
      </Pressable>

      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.success}>
            Success: {result.success}
          </Text>
          <Text style={styles.failed}>
            Failed: {result.failed}
          </Text>

          {result.errors?.length > 0 && (
            <View style={styles.errorList}>
              {result.errors.map((e, i) => (
                <Text key={i} style={styles.errorText}>
                  {e.student_roll} → {e.faculty_email}: {e.error}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#555",
    marginBottom: 14,
    lineHeight: 18,
  },
  code: {
    fontFamily: "monospace",
    backgroundColor: "#eee",
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  textarea: {
    height: 220,
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    padding: 14,
    fontFamily: "monospace",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 16,
  },
  button: {
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
  resultBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
  },
  success: {
    color: "green",
    fontWeight: "700",
    marginBottom: 4,
  },
  failed: {
    color: "red",
    fontWeight: "700",
  },
  errorList: {
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: "red",
    marginBottom: 2,
  },
});
