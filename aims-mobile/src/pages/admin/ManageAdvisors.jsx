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

export default function ManageAdvisors() {
  const [tab, setTab] = useState("single");

  // Single
  const [singleForm, setSingleForm] = useState({
    student_roll: "",
    faculty_email: "",
  });
  const [singleLoading, setSingleLoading] = useState(false);

  // Bulk
  const [bulkInput, setBulkInput] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  /* ---------------- Single Assign ---------------- */

  const assignSingle = async () => {
    if (!singleForm.student_roll || !singleForm.faculty_email) {
      Alert.alert.error("Fill all required fields");
      return;
    }

    setSingleLoading(true);
    try {
      const res = await apiFetch("/admin/assign-advisor", "POST", singleForm);
      if (res.error) throw new Error(res.error);

      Alert.alert.success("Advisor assigned successfully");
      setSingleForm({ student_roll: "", faculty_email: "" });
    } catch (err) {
      Alert.alert.error(err.message);
    } finally {
      setSingleLoading(false);
    }
  };

  /* ---------------- Bulk Assign ---------------- */

  const assignBulk = async () => {
    setBulkLoading(true);
    setBulkResult(null);

    const lines = bulkInput.trim().split("\n");
    const assignments = [];

    for (const line of lines) {
      const [student_roll, faculty_email] = line.split(",").map(v => v?.trim());
      if (student_roll && faculty_email) {
        assignments.push({ student_roll, faculty_email });
      }
    }

    if (assignments.length === 0) {
      Alert.alert.error("No valid rows found");
      setBulkLoading(false);
      return;
    }

    try {
      const res = await apiFetch("/admin/bulk-advisors", "POST", { assignments });
      if (res.error) throw new Error(res.error);

      setBulkResult(res.results || res);
      Alert.alert.success(`Processed ${res.results?.success || 0} assignments`);
      setBulkInput("");
    } catch (err) {
      Alert.alert.error(err.message);
      setBulkResult({
        success: 0,
        failed: assignments.length,
        errors: [{ error: err.message }],
      });
    } finally {
      setBulkLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setTab("single")}
          style={[styles.tab, tab === "single" && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === "single" && styles.tabTextActive]}>
            Single
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setTab("bulk")}
          style={[styles.tab, tab === "bulk" && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === "bulk" && styles.tabTextActive]}>
            Bulk
          </Text>
        </Pressable>
      </View>

      {/* -------- Single -------- */}
      {tab === "single" && (
        <View style={styles.card}>
          <Text style={styles.title}>Assign Faculty Advisor</Text>

          <TextInput
            placeholder="Student Roll Number"
            value={singleForm.student_roll}
            onChangeText={v => setSingleForm({ ...singleForm, student_roll: v })}
            style={styles.input}
          />

          <TextInput
            placeholder="Faculty Email"
            value={singleForm.faculty_email}
            onChangeText={v => setSingleForm({ ...singleForm, faculty_email: v })}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Pressable
            onPress={assignSingle}
            disabled={singleLoading}
            style={[styles.primaryBtn, singleLoading && styles.disabled]}
          >
            {singleLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>Assign Advisor</Text>
            )}
          </Pressable>
        </View>
      )}

      {/* -------- Bulk -------- */}
      {tab === "bulk" && (
        <View style={styles.card}>
          <Text style={styles.title}>Bulk Assign Advisors</Text>

          <Text style={styles.hint}>
            Paste CSV data (one per line):{"\n"}
            student_roll, faculty_email
          </Text>

          <TextInput
            multiline
            numberOfLines={8}
            placeholder={`2023CS01, faculty1@uni.edu\n2023CS02, faculty2@uni.edu`}
            value={bulkInput}
            onChangeText={setBulkInput}
            style={styles.textarea}
          />

          <Pressable
            onPress={assignBulk}
            disabled={bulkLoading || !bulkInput.trim()}
            style={[styles.primaryBtn, bulkLoading && styles.disabled]}
          >
            {bulkLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>Process Bulk Assignment</Text>
            )}
          </Pressable>

          {bulkResult && (
            <View style={styles.resultBox}>
              <Text style={styles.success}>
                Success: {bulkResult.success || 0}
              </Text>
              <Text style={styles.error}>
                Failed: {bulkResult.failed || 0}
              </Text>

              {bulkResult.errors?.length > 0 && (
                <View style={styles.errorBox}>
                  {bulkResult.errors.map((e, i) => (
                    <Text key={i} style={styles.errorItem}>
                      {e.student_roll || `Row ${i + 1}`}: {e.error}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: { padding: 16 },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: "#fff",
  },
  tabText: {
    fontWeight: "600",
    color: "#6b7280",
  },
  tabTextActive: {
    color: "#000",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    marginBottom: 12,
  },
  textarea: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    height: 160,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.5,
  },
  hint: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  resultBox: {
    marginTop: 12,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 12,
  },
  success: {
    color: "#15803d",
    fontWeight: "700",
  },
  error: {
    color: "#b91c1c",
    fontWeight: "700",
  },
  errorBox: {
    marginTop: 6,
  },
  errorItem: {
    fontSize: 12,
    color: "#b91c1c",
  },
});
