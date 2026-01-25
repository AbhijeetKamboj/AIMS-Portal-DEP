import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
} from "react-native";
import { apiFetch } from "../../services/api";

export default function StudentAcademics() {
  const [data, setData] = useState({});
  const [droppingId, setDroppingId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await apiFetch("/student/transcript");
    if (!res?.error) setData(res);
    setLoading(false);
  };

  const handleDrop = (enrollmentId, courseName) => {
    Alert.alert(
      "Confirm Drop",
      `Drop "${courseName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Drop",
          style: "destructive",
          onPress: async () => {
            setDroppingId(enrollmentId);
            const res = await apiFetch("/student/drop-course", "POST", {
              enrollment_id: enrollmentId,
            });

            if (res?.error) {
              Alert.alert("Error", res.error);
            } else {
              Alert.alert("Success", "Course withdrawn successfully");
              fetchData();
            }
            setDroppingId(null);
          },
        },
      ]
    );
  };

  const semesters = data.semesters || [];
  const currentSemester = semesters.length > 0 ? semesters[0] : null;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Info Banner */}
      <View style={styles.note}>
        <Text style={styles.noteTitle}>Important Note</Text>
        <Text style={styles.noteText}>
          Some grades may be pending approval. Official records from the
          academic office take precedence.
        </Text>
      </View>

      {currentSemester ? (
        <View style={styles.semesterCard}>
          <View style={styles.semHeader}>
            <Text style={styles.semTitle}>
              {currentSemester.semester_name}
            </Text>
            <Text style={styles.semMeta}>
              SGPA {currentSemester.sgpa} · Credits{" "}
              {currentSemester.registered_credits} · CGPA{" "}
              {currentSemester.cgpa}
            </Text>
          </View>

          {currentSemester.courses.map((c, idx) => (
            <Pressable
              key={idx}
              style={styles.courseCard}
              onPress={() => setSelectedCourse(c)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.courseCode}>{c.code}</Text>
                <Text style={styles.courseName}>{c.name}</Text>
                <Text style={styles.courseMeta}>{c.ltpsc}</Text>
              </View>

              <View style={styles.right}>
                <Text style={styles.status}>{c.status || "Enrolled"}</Text>

                {c.status === "enrolled" && !c.grade && (
                  <Pressable
                    style={styles.dropBtn}
                    disabled={droppingId === c.enrollment_id}
                    onPress={() =>
                      handleDrop(
                        c.enrollment_id,
                        `${c.code} - ${c.name}`
                      )
                    }
                  >
                    <Text style={styles.dropText}>
                      {droppingId === c.enrollment_id ? "..." : "Drop"}
                    </Text>
                  </Pressable>
                )}

                <Text style={styles.grade}>{c.grade || "-"}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>
          No current semester courses found.
        </Text>
      )}

      {/* Course Info Modal (Simplified) */}
      <Modal visible={!!selectedCourse} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {selectedCourse?.code}
            </Text>
            <Text style={styles.modalName}>
              {selectedCourse?.name}
            </Text>
            <Text style={styles.modalMeta}>
              {selectedCourse?.ltpsc}
            </Text>

            <Pressable
              style={styles.closeBtn}
              onPress={() => setSelectedCourse(null)}
            >
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  note: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  noteTitle: { fontWeight: "bold", marginBottom: 4 },
  noteText: { fontSize: 12, color: "#92400e" },

  semesterCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
  },
  semHeader: { marginBottom: 12 },
  semTitle: { fontSize: 16, fontWeight: "bold" },
  semMeta: { fontSize: 12, color: "#6b7280" },

  courseCard: {
    flexDirection: "row",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  courseCode: { fontWeight: "bold" },
  courseName: { fontSize: 13 },
  courseMeta: { fontSize: 11, color: "#9ca3af" },

  right: { alignItems: "flex-end" },
  status: { fontSize: 11, color: "#2563eb" },
  grade: { fontWeight: "bold", marginTop: 4 },

  dropBtn: {
    marginTop: 6,
    backgroundColor: "#fee2e2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dropText: { color: "#b91c1c", fontSize: 12 },

  empty: { textAlign: "center", marginTop: 40, color: "#9ca3af" },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  modalName: { marginTop: 4 },
  modalMeta: { fontSize: 12, color: "#6b7280", marginBottom: 12 },
  closeBtn: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 8,
  },
  closeText: { color: "#fff", textAlign: "center" },
});
