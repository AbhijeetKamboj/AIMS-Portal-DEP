import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { apiFetch } from "../services/api";

export default function CourseInfoModal({ course, onClose }) {
  if (!course) return null;

  const [courseDetails, setCourseDetails] = useState(null);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [course?.id, course?.courses?.id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);

      const courseId = course?.courses?.id || course?.id;
      if (courseId) {
        const res = await apiFetch(`/courses/${courseId}`);
        if (!res?.error) setCourseDetails(res);
      }

      const offeringId = course?.id;
      if (offeringId) {
        try {
          const enrollments = await apiFetch(
            `/courses/enrollments?offering_id=${offeringId}`
          );
          setEnrollmentCount(enrollments?.length || 0);
        } catch {
          setEnrollmentCount(0);
        }
      }
    } catch (err) {
      console.log("Course info fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const data = courseDetails || course;

  const courseCode =
    data.course_code || data.courses?.course_code || "N/A";
  const courseName =
    data.course_name || data.courses?.course_name || "N/A";
  const credits =
    data.credits || data.courses?.credits || "N/A";

  const l = data.l || data.courses?.l || 0;
  const t = data.t || data.courses?.t || 0;
  const p = data.p || data.courses?.p || 0;
  const s = data.s || data.courses?.s || 0;

  const instructor =
    course.faculty?.users?.name || "N/A";
  const semester =
    data.semesters?.name || course.semesters?.name || "N/A";

  const details = [
    { label: "Course Code", value: courseCode },
    { label: "Course Title", value: courseName },
    { label: "Credits", value: credits },
    { label: "L-T-P-S", value: `${l}-${t}-${p}-${s}` },
    { label: "Professor", value: instructor },
    { label: "Semester", value: semester },
    { label: "Enrolled Students", value: enrollmentCount },
  ];

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.code}>{courseCode}</Text>
                  <Text style={styles.subtitle}>Course Details</Text>
                </View>
                <Pressable onPress={onClose}>
                  <Text style={styles.close}>✕</Text>
                </Pressable>
              </View>

              {/* Content */}
              <ScrollView style={styles.content}>
                {details.map((d, i) => (
                  <View key={i} style={styles.card}>
                    <Text style={styles.label}>{d.label}</Text>
                    <Text style={styles.value}>{d.value}</Text>
                  </View>
                ))}
              </ScrollView>

              {/* Footer */}
              <Pressable style={styles.button} onPress={onClose}>
                <Text style={styles.buttonText}>Close</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 16,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "center",
  },
  code: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  close: {
    fontSize: 22,
    color: "#555",
    paddingHorizontal: 6,
  },
  content: {
    marginVertical: 8,
  },
  card: {
    padding: 12,
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    color: "#777",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  button: {
    marginTop: 12,
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
