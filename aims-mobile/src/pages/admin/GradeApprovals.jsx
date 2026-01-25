import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { apiFetch } from "../../services/api";
// import Alert.alert from "react-hot-Alert.alert";

export default function GradeApprovals() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchPendingGrades();
  }, []);

  const fetchPendingGrades = async () => {
    setLoading(true);
    const res = await apiFetch("/admin/pending-grades");
    if (!res.error) setStats(res || []);
    setLoading(false);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleApprove = async () => {
    if (selectedIds.length === 0) return;

    const res = await apiFetch("/admin/approve-grades", "POST", {
      grade_ids: selectedIds,
    });

    if (!res.error) {
      Alert.alert.success(`${selectedIds.length} grades approved`);
      setSelectedIds([]);
      fetchPendingGrades();
    }
  };

  /* Safe helpers */
  const getStudentName = (s) =>
    s.students?.users?.name ||
    s.students?.users?.[0]?.name ||
    "Unknown";

  const getStudentRoll = (s) =>
    s.students?.roll_number || "N/A";

  const getCourseCode = (s) =>
    s.course_offerings?.courses?.course_code || "N/A";

  const getCourseName = (s) =>
    s.course_offerings?.courses?.course_name || "";

  const getFacultyName = (s) =>
    s.course_offerings?.faculty?.users?.name ||
    s.course_offerings?.faculty?.users?.[0]?.name ||
    "N/A";

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Loading pending grades…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pending Grade Approvals</Text>
        <Pressable
          onPress={() => setSelectedIds(stats.map((s) => s.id))}
        >
          <Text style={styles.selectAll}>Select All</Text>
        </Pressable>
      </View>

      {/* Bulk Approve */}
      <Pressable
        onPress={handleApprove}
        disabled={selectedIds.length === 0}
        style={[
          styles.approveBtn,
          selectedIds.length === 0 && styles.disabled,
        ]}
      >
        <Text style={styles.approveText}>
          Approve Selected ({selectedIds.length})
        </Text>
      </Pressable>

      {stats.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.muted}>No pending grades found.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {stats.map((s) => {
            const selected = selectedIds.includes(s.id);

            return (
              <Pressable
                key={s.id}
                onPress={() => toggleSelect(s.id)}
                style={[
                  styles.card,
                  selected && styles.cardSelected,
                ]}
              >
                {/* Top Row */}
                <View style={styles.row}>
                  <Text style={styles.studentName}>
                    {getStudentName(s)}
                  </Text>
                  <View
                    style={[
                      styles.checkbox,
                      selected && styles.checkboxActive,
                    ]}
                  />
                </View>

                <Text style={styles.roll}>
                  {getStudentRoll(s)}
                </Text>

                <View style={styles.divider} />

                <Text style={styles.course}>
                  {getCourseCode(s)} — {getCourseName(s)}
                </Text>

                <Text style={styles.faculty}>
                  Faculty: {getFacultyName(s)}
                </Text>

                <View style={styles.footer}>
                  <View style={styles.gradeBadge}>
                    <Text style={styles.gradeText}>{s.grade}</Text>
                  </View>
                  <Text style={styles.time}>
                    {s.submitted_at
                      ? new Date(s.submitted_at).toLocaleString()
                      : "N/A"}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  muted: {
    color: "#6b7280",
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  selectAll: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563eb",
  },
  approveBtn: {
    backgroundColor: "#000",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  approveText: {
    color: "#fff",
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.4,
  },
  empty: {
    padding: 40,
    alignItems: "center",
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardSelected: {
    borderColor: "#000",
    backgroundColor: "#f9fafb",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  studentName: {
    fontWeight: "700",
    fontSize: 15,
  },
  roll: {
    fontSize: 12,
    color: "#6b7280",
    fontFamily: "monospace",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  course: {
    fontSize: 13,
    fontWeight: "600",
  },
  faculty: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 2,
  },
  footer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gradeBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  gradeText: {
    color: "#1e40af",
    fontWeight: "700",
    fontSize: 12,
  },
  time: {
    fontSize: 11,
    color: "#6b7280",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#9ca3af",
  },
  checkboxActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
});
