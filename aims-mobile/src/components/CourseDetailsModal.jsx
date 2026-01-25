import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Toast from "react-native-toast-message";
import { apiFetch } from "../services/api";

export default function CourseDetailsModal({ offering, onClose, userRole }) {
  const [detailsData, setDetailsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingStudent, setGradingStudent] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState("");

  useEffect(() => {
    fetchEnrollments();
  }, [offering]);

  const fetchEnrollments = async () => {
    setLoading(true);
    const res = await apiFetch(
      `/courses/enrollments?offering_id=${offering.id}`
    );
    if (!res?.error) setDetailsData(res);
    setLoading(false);
  };

  const handleGradeSubmit = async () => {
    if (!selectedGrade || !gradingStudent) return;

    const res = await apiFetch("/faculty/submit-grade", "POST", {
      student_id: gradingStudent.students.user_id,
      offering_id: offering.id,
      grade: selectedGrade,
      attempt: 1,
    });

    if (res?.error) {
      Toast.show({ type: "error", text1: res.error });
    } else {
      Toast.show({ type: "success", text1: "Grade submitted" });
      setGradingStudent(null);
      setSelectedGrade("");
      fetchEnrollments();
    }
  };

  const gradeOptions = ["A", "A-", "B", "B-", "C", "C-", "D", "F", "W"];

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{offering.courses.course_name}</Text>
              <Text style={styles.code}>{offering.courses.course_code}</Text>
              <Text style={styles.subText}>
                {offering.faculty?.users?.name}
              </Text>
            </View>

            <Pressable onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          {/* Course Info */}
          <View style={styles.info}>
            <Text style={styles.label}>Course Structure</Text>
            <Text style={styles.value}>
              {offering.courses.l}-{offering.courses.t}-{offering.courses.p}-
              {offering.courses.s} ({offering.courses.credits} credits)
            </Text>
          </View>

          {/* Enrollment List */}
          <Text style={styles.section}>
            Enrollments ({detailsData.length})
          </Text>

          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <ScrollView>
              {detailsData.map((e, idx) => (
                <View key={idx} style={styles.card}>
                  <View>
                    <Text style={styles.name}>
                      {e.students.user.name}
                    </Text>
                    <Text style={styles.roll}>
                      {e.students.roll_number}
                    </Text>
                    <Text style={styles.status}>{e.status}</Text>
                  </View>

                  {userRole === "faculty" && e.status === "enrolled" && (
                    <Pressable
                      style={styles.gradeBtn}
                      onPress={() => {
                        setGradingStudent(e);
                        setSelectedGrade("");
                      }}
                    >
                      <Text style={styles.gradeBtnText}>Grade</Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      {/* Grading Modal */}
      {gradingStudent && (
        <Modal visible transparent animationType="slide">
          <View style={styles.overlay}>
            <View style={styles.gradeModal}>
              <Text style={styles.title}>Assign Grade</Text>

              <Text style={styles.name}>
                {gradingStudent.students.user.name}
              </Text>
              <Text style={styles.roll}>
                {gradingStudent.students.roll_number}
              </Text>

              <View style={styles.gradeGrid}>
                {gradeOptions.map((g) => (
                  <Pressable
                    key={g}
                    style={[
                      styles.gradeOption,
                      selectedGrade === g && styles.gradeSelected,
                    ]}
                    onPress={() => setSelectedGrade(g)}
                  >
                    <Text
                      style={[
                        styles.gradeText,
                        selectedGrade === g && { color: "#fff" },
                      ]}
                    >
                      {g}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.actions}>
                <Pressable
                  style={styles.cancel}
                  onPress={() => setGradingStudent(null)}
                >
                  <Text>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.submit,
                    !selectedGrade && { opacity: 0.5 },
                  ]}
                  disabled={!selectedGrade}
                  onPress={handleGradeSubmit}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    Submit
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
}


const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      padding: 16,
    },
    container: {
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 16,
      maxHeight: "85%",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    code: {
      fontSize: 20,
      fontWeight: "700",
    },
    subtitle: {
      fontSize: 12,
      color: "#666",
    },
    close: {
      fontSize: 20,
      color: "#555",
    },
    content: {
      marginVertical: 8,
    },
    card: {
      padding: 12,
      backgroundColor: "#f7f7f7",
      borderRadius: 10,
      marginBottom: 10,
    },
    label: {
      fontSize: 11,
      color: "#777",
      fontWeight: "600",
      marginBottom: 4,
    },
    value: {
      fontSize: 15,
      fontWeight: "600",
    },
    button: {
      marginTop: 12,
      backgroundColor: "#4f46e5",
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontWeight: "700",
    },
  });
  