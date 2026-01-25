import { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { apiFetch } from "../../services/api";

export default function CourseEnrollmentsModal({ offering, visible, onClose }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (offering && visible) {
      fetchEnrollments();
    }
  }, [offering, visible]);

  const fetchEnrollments = async () => {
    setLoading(true);
    const res = await apiFetch(
      `/courses/enrollments?offering_id=${offering.id}`
    );
    if (!res?.error) setEnrollments(res || []);
    setLoading(false);
  };

  const downloadCSV = async () => {
    if (!enrollments.length) return;

    const headers = ["Roll Number", "Name", "Email", "Status", "Type"];
    const rows = enrollments.map((e) => [
      e.students.roll_number,
      e.students.user.name,
      e.students.user.email || "N/A",
      e.status,
      e.enrollment_type,
    ]);

    const csv =
      headers.join(",") +
      "\n" +
      rows.map((r) => r.join(",")).join("\n");

    const fileUri =
      FileSystem.documentDirectory +
      `${offering.courses.course_code}_enrollments.csv`;

    await FileSystem.writeAsStringAsync(fileUri, csv);

    await Sharing.shareAsync(fileUri, {
      mimeType: "text/csv",
      dialogTitle: "Share enrollments CSV",
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Student Enrollments</Text>
              <Text style={styles.subtitle}>
                {offering.courses.course_code} –{" "}
                {offering.courses.course_name}
              </Text>
            </View>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" />
            </View>
          ) : enrollments.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.empty}>No students enrolled yet.</Text>
            </View>
          ) : (
            <>
              {/* Summary */}
              <View style={styles.summary}>
                <Text style={styles.count}>
                  Total: {enrollments.length}
                </Text>
                <Pressable onPress={downloadCSV} style={styles.downloadBtn}>
                  <Text style={styles.downloadText}>Download CSV</Text>
                </Pressable>
              </View>

              {/* List */}
              <ScrollView>
                {enrollments.map((e, i) => (
                  <View key={i} style={styles.row}>
                    <Text style={styles.roll}>
                      {e.students.roll_number}
                    </Text>
                    <Text style={styles.name}>
                      {e.students.user.name}
                    </Text>
                    <Text style={styles.email}>
                      {e.students.user.email || "N/A"}
                    </Text>

                    <View style={styles.metaRow}>
                      <Text style={styles.type}>
                        {e.enrollment_type}
                      </Text>
                      <Text
                        style={[
                          styles.status,
                          e.status === "enrolled"
                            ? styles.enrolled
                            : e.status.includes("pending")
                            ? styles.pending
                            : styles.other,
                        ]}
                      >
                        {e.status.replace("_", " ")}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </>
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
    borderRadius: 14,
    maxHeight: "90%",
    paddingBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  title: { fontSize: 20, fontWeight: "bold" },
  subtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  close: { fontSize: 22, color: "#6b7280" },
  center: { padding: 40, alignItems: "center" },
  empty: { color: "#9ca3af", fontWeight: "500" },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  count: { fontWeight: "600" },
  downloadBtn: {
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  downloadText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  row: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  roll: { fontFamily: "monospace", color: "#374151" },
  name: { fontWeight: "600", fontSize: 15 },
  email: { color: "#6b7280", fontSize: 12 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  type: { fontSize: 12, fontWeight: "500" },
  status: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  enrolled: { color: "#16a34a" },
  pending: { color: "#d97706" },
  other: { color: "#374151" },
});
