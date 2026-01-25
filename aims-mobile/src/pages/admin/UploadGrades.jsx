import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { apiFetch } from "../../services/api";
// import Alert.alert from "react-hot-Alert.alert";

export default function UploadGrades() {
  const [inputMode, setInputMode] = useState("csv"); // csv | json
  const [csvInput, setCsvInput] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);

  const parseCSV = (csv) => {
    const lines = csv.trim().split("\n");
    if (lines.length < 2) throw new Error("CSV must have header and data");

    const headers = lines[0]
      .split(",")
      .map(h => h.trim().toLowerCase());

    const required = ["roll_number", "course_code", "semester_id", "grade"];
    required.forEach(r => {
      if (!headers.includes(r)) {
        throw new Error(`Missing column: ${r}`);
      }
    });

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(",").map(v => v.trim());
      if (vals.length !== headers.length) continue;

      const row = {};
      headers.forEach((h, idx) => {
        row[h] = h === "semester_id" ? parseInt(vals[idx]) : vals[idx];
      });
      data.push(row);
    }
    return data;
  };

  const handlePreview = () => {
    try {
      const grades =
        inputMode === "csv"
          ? parseCSV(csvInput)
          : JSON.parse(jsonInput);

      if (!Array.isArray(grades) || grades.length === 0) {
        throw new Error("No valid grades found");
      }

      setPreview(grades);
      setResult(null);
    } catch (err) {
      Alert.alert.error(err.message);
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!preview?.length) return Alert.alert.error("Preview data first");

    setLoading(true);
    setResult(null);
    try {
      const res = await apiFetch("/admin/upload-grades", "POST", {
        grades: preview,
      });

      if (res.error) throw new Error(res.error);

      setResult(res.results);
      if (res.results.failed === 0) {
        Alert.alert.success(`Uploaded ${res.results.success} grades`);
        setCsvInput("");
        setJsonInput("");
        setPreview(null);
      } else {
        Alert.alert.error(`Success ${res.results.success}, Failed ${res.results.failed}`);
      }
    } catch (err) {
      Alert.alert.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Bulk Grade Upload</Text>

      {/* Mode Toggle */}
      <View style={styles.toggle}>
        <Pressable
          onPress={() => setInputMode("csv")}
          style={[
            styles.toggleBtn,
            inputMode === "csv" && styles.toggleActive,
          ]}
        >
          <Text style={styles.toggleText}>CSV</Text>
        </Pressable>
        <Pressable
          onPress={() => setInputMode("json")}
          style={[
            styles.toggleBtn,
            inputMode === "json" && styles.toggleActive,
          ]}
        >
          <Text style={styles.toggleText}>JSON</Text>
        </Pressable>
      </View>

      {/* Input */}
      <View style={styles.card}>
        <Text style={styles.label}>
          {inputMode === "csv" ? "Paste CSV Data" : "Paste JSON Data"}
        </Text>

        <TextInput
          multiline
          style={styles.input}
          placeholder={
            inputMode === "csv"
              ? "roll_number,course_code,semester_id,grade\n2023csb1094,CS101,1,A"
              : '[{"roll_number":"2023csb1094","course_code":"CS101","semester_id":1,"grade":"A"}]'
          }
          value={inputMode === "csv" ? csvInput : jsonInput}
          onChangeText={t =>
            inputMode === "csv" ? setCsvInput(t) : setJsonInput(t)
          }
        />

        <Pressable
          onPress={handlePreview}
          disabled={loading}
          style={styles.previewBtn}
        >
          <Text style={styles.previewText}>Preview</Text>
        </Pressable>
      </View>

      {/* Preview */}
      {preview && (
        <View style={styles.card}>
          <Text style={styles.subtitle}>
            Preview ({preview.length} records)
          </Text>

          <FlatList
            data={preview}
            keyExtractor={(_, i) => String(i)}
            style={{ maxHeight: 300 }}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.roll}>{item.roll_number}</Text>
                <Text style={styles.course}>{item.course_code}</Text>
                <Text style={styles.sem}>{item.semester_id}</Text>
                <Text style={styles.grade}>{item.grade}</Text>
              </View>
            )}
          />
        </View>
      )}

      {/* Result */}
      {result && (
        <View style={styles.card}>
          <Text style={styles.subtitle}>Upload Result</Text>
          <Text style={styles.success}>Success: {result.success}</Text>
          <Text style={styles.fail}>Failed: {result.failed}</Text>

          {result.errors?.length > 0 && (
            <FlatList
              data={result.errors}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => (
                <Text style={styles.error}>
                  {item.item?.roll_number} ({item.item?.course_code}): {item.error}
                </Text>
              )}
            />
          )}
        </View>
      )}

      {/* Upload */}
      <Pressable
        onPress={handleUpload}
        disabled={loading || !preview}
        style={[styles.uploadBtn, (!preview || loading) && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.uploadText}>
            Upload {preview?.length || 0} Grades
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },

  toggle: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  toggleActive: {
    backgroundColor: "#fff",
  },
  toggleText: { fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  label: { fontWeight: "600", marginBottom: 6 },
  input: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    fontFamily: "monospace",
    marginBottom: 12,
  },

  previewBtn: {
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  previewText: { fontWeight: "700" },

  subtitle: { fontWeight: "700", marginBottom: 8 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  roll: { fontWeight: "700", fontFamily: "monospace" },
  course: { color: "#374151" },
  sem: { color: "#6b7280" },
  grade: { fontWeight: "700" },

  success: { color: "#047857", fontWeight: "700" },
  fail: { color: "#b91c1c", fontWeight: "700" },
  error: { fontSize: 12, color: "#b91c1c" },

  uploadBtn: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  uploadText: { color: "#fff", fontWeight: "700" },
  disabled: { opacity: 0.5 },
});
