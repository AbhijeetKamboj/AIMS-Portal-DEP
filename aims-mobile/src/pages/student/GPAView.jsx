import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { apiFetch } from "../../services/api";

export default function GPAView() {
  const [cgpa, setCgpa] = useState(null);
  const [semesterGPA, setSemesterGPA] = useState([]);
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [cgpaRes, sgpaRes, transcriptRes] = await Promise.all([
        apiFetch("/student/cgpa"),
        apiFetch("/student/semester-gpa"),
        apiFetch("/student/transcript"),
      ]);

      if (!cgpaRes?.error) setCgpa(cgpaRes);
      if (!sgpaRes?.error) setSemesterGPA(sgpaRes);
      if (!transcriptRes?.error) setTranscript(transcriptRes);

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Top Summary */}
      <View style={styles.statsRow}>
        <StatCard label="CGPA" value={cgpa?.cgpa?.toFixed(2) || "N/A"} suffix="/10" />
        <StatCard
          label="Credits"
          value={cgpa?.total_credits || 0}
        />
        <StatCard
          label="Semesters"
          value={transcript?.semesters?.length || 0}
        />
      </View>

      <Text style={styles.sectionTitle}>Academic Record</Text>

      {!transcript?.semesters || transcript.semesters.length === 0 ? (
        <Text style={styles.emptyText}>No academic records available</Text>
      ) : (
        transcript.semesters.map((sem, idx) => (
          <View key={idx} style={styles.semesterCard}>
            <View style={styles.semesterHeader}>
              <Text style={styles.semesterTitle}>{sem.semester_name}</Text>
              <Text style={styles.semesterMeta}>
                SGPA: {sem.sgpa} | Credits: {sem.credits}
              </Text>
            </View>

            {sem.courses.map((course, cIdx) => (
              <View key={cIdx} style={styles.courseRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseCode}>{course.code}</Text>
                  <Text style={styles.courseName}>{course.name}</Text>
                  <Text style={styles.courseMeta}>{course.ltpsc}</Text>
                </View>

                <View style={styles.courseRight}>
                  <Text style={styles.courseStatus}>
                    {course.status || "Enrolled"}
                  </Text>
                  <Text style={styles.courseGrade}>
                    {course.grade || "-"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

/* ---------- Helper Components ---------- */

function StatCard({ label, value, suffix }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        {value} {suffix || ""}
      </Text>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9fafb",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#111827",
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 40,
  },
  semesterCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  semesterHeader: {
    marginBottom: 8,
  },
  semesterTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  semesterMeta: {
    fontSize: 12,
    color: "#6b7280",
  },
  courseRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingVertical: 10,
    marginTop: 8,
  },
  courseCode: {
    fontWeight: "bold",
    fontSize: 14,
  },
  courseName: {
    fontSize: 13,
    color: "#374151",
  },
  courseMeta: {
    fontSize: 11,
    color: "#9ca3af",
  },
  courseRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  courseStatus: {
    fontSize: 11,
    color: "#2563eb",
    marginBottom: 4,
  },
  courseGrade: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
