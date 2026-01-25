import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { apiFetch } from "../../services/api";

export default function GradeUploadModal({ offering, onClose }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [manualEntry, setManualEntry] = useState({
    roll_number: "",
    grade: "",
  });

  /* ---------- CSV PARSER ---------- */
  const parseCSV = (text) => {
    const rows = text.trim().split("\n");
    let start = 0;

    if (rows[0].toLowerCase().includes("roll")) start = 1;

    return rows.slice(start).map((r) => {
      const [roll, grade] = r.split(",");
      return {
        roll_number: roll?.trim(),
        grade: grade?.trim(),
      };
    }).filter(g => g.roll_number && g.grade);
  };

  /* ---------- FILE PICK ---------- */
  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: "text/csv",
      copyToCacheDirectory: true,
    });

    if (!res.canceled) {
      setFile(res.assets[0]);
      setMessage(null);
    }
  };

  /* ---------- BULK UPLOAD ---------- */
  const handleBulkUpload = async () => {
    if (!file) return;

    setLoading(true);
    setMessage(null);

    try {
      const csvText = await FileSystem.readAsStringAsync(file.uri);
      const grades = parseCSV(csvText);

      if (grades.length === 0) {
        throw new Error("No valid rows found in CSV");
      }

      const res = await apiFetch("/faculty/upload-grades", "POST", {
        offering_id: offering.id,
        grades,
      });

      if (res.error) throw new Error(res.error);

      setMessage({
        type: "success",
        text: `Uploaded: ${res.results.success}, Failed: ${res.results.failed}`,
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- MANUAL ENTRY ---------- */
  const handleManualSubmit = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await apiFetch("/faculty/upload-grades", "POST", {
        offering_id: offering.id,
        grades: [manualEntry],
      });

      if (res.error) throw new Error(res.error);
      if (res.results.failed > 0) {
        throw new Error(res.results.errors[0].error);
      }

      setMessage({
        type: "success",
        text: "Grade submitted (pending approval)",
      });
      setManualEntry({ roll_number: "", grade: "" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Upload Grades</Text>
              <Text style={styles.subtitle}>
                {offering.courses.course_code}
              </Text>
            </View>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {message && (
              <View
                style={[
                  styles.message,
                  message.type === "success"
                    ? styles.success
                    : styles.error,
                ]}
              >
                <Text>{message.text}</Text>
              </View>
            )}

            {/* MANUAL ENTRY */}
            <Text style={styles.sectionTitle}>Single Entry</Text>
            <View style={styles.row}>
              <TextInput
                placeholder="Roll Number"
                value={manualEntry.roll_number}
                onChangeText={(v) =>
                  setManualEntry({ ...manualEntry, roll_number: v })
                }
                style={styles.input}
              />
              <TextInput
                placeholder="Grade"
                value={manualEntry.grade}
                onChangeText={(v) =>
                  setManualEntry({ ...manualEntry, grade: v })
                }
                style={[styles.input, styles.grade]}
              />
            </View>

            <Pressable
              onPress={handleManualSubmit}
              style={styles.primaryBtn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Submit</Text>
              )}
            </Pressable>

            <View style={styles.divider} />

            {/* BULK UPLOAD */}
            <Text style={styles.sectionTitle}>Bulk Upload (CSV)</Text>

            <Pressable onPress={pickFile} style={styles.fileBtn}>
              <Text>
                {file ? file.name : "Select CSV File"}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleBulkUpload}
              disabled={!file || loading}
              style={[
                styles.successBtn,
                (!file || loading) && styles.disabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Upload CSV</Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    maxHeight: "90%",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 12,
  },
  close: {
    fontSize: 28,
    color: "#9ca3af",
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: "800",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
  },
  grade: {
    width: 80,
  },
  primaryBtn: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  successBtn: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 20,
  },
  fileBtn: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  message: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  success: {
    backgroundColor: "#dcfce7",
  },
  error: {
    backgroundColor: "#fee2e2",
  },
  disabled: {
    opacity: 0.5,
  },
});
