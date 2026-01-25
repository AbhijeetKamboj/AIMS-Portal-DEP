import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { apiFetch } from "../../services/api";
// import Alert.alert from "react-hot-Alert.alert";

export default function StudentGrading() {
  const [offerings, setOfferings] = useState([]);
  const [selectedOffering, setSelectedOffering] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState("");

  useEffect(() => {
    apiFetch("/courses/offerings").then(res => {
      if (!res?.error) setOfferings(res);
    });
  }, []);

  const loadEnrollments = async (offeringId) => {
    const off = offerings.find(o => o.id === offeringId);
    if (!off) return;

    setSelectedOffering(off);
    setLoading(true);
    const res = await apiFetch(`/courses/enrollments?offering_id=${off.id}`);
    if (!res?.error) setEnrollments(res);
    setLoading(false);
  };

  const submitGrade = async () => {
    if (!grading || !selectedGrade) return;

    const res = await apiFetch("/admin/submit-grade", "POST", {
      student_id: grading.students.user_id,
      offering_id: selectedOffering.id,
      grade: selectedGrade,
    });

    if (res?.error) {
      Alert.alert.error(res.error);
    } else {
      Alert.alert.success("Grade submitted");
      setGrading(null);
      setSelectedGrade("");
      loadEnrollments(selectedOffering.id);
    }
  };

  const gradeOptions = ["A", "A-", "B", "B-", "C", "C-", "D", "F", "W"];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📝 Student Grading</Text>

      {/* Course Picker */}
      <View style={styles.card}>
        <Text style={styles.label}>Select Course</Text>
        <Picker
          selectedValue={selectedOffering?.id || ""}
          onValueChange={val => loadEnrollments(val)}
        >
          <Picker.Item label="-- Select Course --" value="" />
          {offerings.map(o => (
            <Picker.Item
              key={o.id}
              label={`${o.courses?.course_code} - ${o.courses?.course_name}`}
              value={o.id}
            />
          ))}
        </Picker>
      </View>

      {/* Enrollments */}
      {selectedOffering && (
        <View style={styles.card}>
          <Text style={styles.subtitle}>
            {selectedOffering.courses?.course_name}
          </Text>

          {loading ? (
            <ActivityIndicator size="large" />
          ) : enrollments.length === 0 ? (
            <Text style={styles.empty}>No enrolled students</Text>
          ) : (
            <FlatList
              data={enrollments}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => (
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>
                      {item.students?.user?.name}
                    </Text>
                    <Text style={styles.roll}>
                      {item.students?.roll_number}
                    </Text>
                  </View>

                  {item.status === "enrolled" && (
                    <Pressable
                      style={styles.gradeBtn}
                      onPress={() => {
                        setGrading(item);
                        setSelectedGrade("");
                      }}
                    >
                      <Text style={styles.gradeBtnText}>Grade</Text>
                    </Pressable>
                  )}
                </View>
              )}
            />
          )}
        </View>
      )}

      {/* Grade Modal */}
      <Modal visible={!!grading} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Assign Grade</Text>

            <Text style={styles.modalName}>
              {grading?.students?.user?.name}
            </Text>
            <Text style={styles.modalRoll}>
              {grading?.students?.roll_number}
            </Text>

            <View style={styles.gradeGrid}>
              {gradeOptions.map(g => (
                <Pressable
                  key={g}
                  onPress={() => setSelectedGrade(g)}
                  style={[
                    styles.gradeBox,
                    selectedGrade === g && styles.gradeSelected,
                  ]}
                >
                  <Text
                    style={
                      selectedGrade === g
                        ? styles.gradeTextSelected
                        : styles.gradeText
                    }
                  >
                    {g}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setGrading(null)}
              >
                <Text>Cancel</Text>
              </Pressable>

              <Pressable
                disabled={!selectedGrade}
                style={[
                  styles.submitBtn,
                  !selectedGrade && styles.disabled,
                ]}
                onPress={submitGrade}
              >
                <Text style={styles.submitText}>Submit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 16,
  },
  label: { fontWeight: "600", marginBottom: 6 },
  subtitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },

  empty: { textAlign: "center", color: "#6b7280", padding: 20 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  name: { fontWeight: "600" },
  roll: { color: "#6b7280", fontSize: 12 },

  gradeBtn: {
    backgroundColor: "#000",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  gradeBtnText: { color: "#fff", fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  modalName: { fontSize: 16, fontWeight: "700" },
  modalRoll: { color: "#6b7280", marginBottom: 16 },

  gradeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  gradeBox: {
    width: "30%",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  gradeSelected: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  gradeText: { color: "#374151", fontWeight: "600" },
  gradeTextSelected: { color: "#fff", fontWeight: "700" },

  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  submitBtn: {
    flex: 1,
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "700" },
  disabled: { opacity: 0.5 },
});
