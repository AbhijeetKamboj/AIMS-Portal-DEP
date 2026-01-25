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
// import { Alert.alert } from "react-hot-Alert.alert";

export default function CourseApprovals() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const res = await apiFetch("/courses/list?status=pending");
    if (!res.error) setCourses(res || []);
    setLoading(false);
  };

  /* ---------- Single Action ---------- */

  const handleAction = async (id, status) => {
    const res = await apiFetch("/courses/approve-catalog", "POST", {
      course_id: id,
      status,
    });

    if (res.error) {
      Alert.alert.error(res.error);
    } else {
      Alert.alert.success(`Course ${status}`);
      setCourses(prev => prev.filter(c => c.id !== id));
      setSelectedIds(prev => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };

  /* ---------- Selection ---------- */

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === courses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(courses.map(c => c.id)));
    }
  };

  /* ---------- Bulk Action ---------- */

  const handleBulkAction = async (status) => {
    if (selectedIds.size === 0) {
      Alert.alert.error("Select at least one course");
      return;
    }

    setBulkLoading(true);
    let success = 0;

    for (const id of selectedIds) {
      const res = await apiFetch("/courses/approve-catalog", "POST", {
        course_id: id,
        status,
      });

      if (!res.error) success++;
    }

    Alert.alert.success(`${success} courses ${status}`);
    setCourses(prev => prev.filter(c => !selectedIds.has(c.id)));
    setSelectedIds(new Set());
    setBulkLoading(false);
  };

  /* ---------- UI ---------- */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Loading pending courses…</Text>
      </View>
    );
  }

  if (!courses.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>No pending courses found</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pending Course Approvals</Text>

        <Pressable onPress={toggleSelectAll}>
          <Text style={styles.link}>
            {selectedIds.size === courses.length ? "Clear All" : "Select All"}
          </Text>
        </Pressable>
      </View>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <View style={styles.bulkBar}>
          <Text style={styles.bulkText}>
            {selectedIds.size} selected
          </Text>

          <View style={styles.bulkBtns}>
            <Pressable
              onPress={() => handleBulkAction("rejected")}
              disabled={bulkLoading}
              style={[styles.btn, styles.reject]}
            >
              <Text style={styles.btnText}>Reject</Text>
            </Pressable>

            <Pressable
              onPress={() => handleBulkAction("approved")}
              disabled={bulkLoading}
              style={[styles.btn, styles.approve]}
            >
              <Text style={[styles.btnText, { color: "#fff" }]}>
                Approve
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Course Cards */}
      {courses.map(course => {
        const selected = selectedIds.has(course.id);

        return (
          <Pressable
            key={course.id}
            onPress={() => toggleSelect(course.id)}
            style={[
              styles.card,
              selected && styles.cardSelected,
            ]}
          >
            <View style={styles.row}>
              <Text style={styles.code}>{course.course_code}</Text>
              <Text style={styles.ltp}>
                {course.l}-{course.t}-{course.p}-{course.s}
              </Text>
            </View>

            <Text style={styles.name}>{course.course_name}</Text>
            <Text style={styles.meta}>
              {course.credits} credits · {course.department}
            </Text>

            <View style={styles.actions}>
              <Pressable
                onPress={() => handleAction(course.id, "rejected")}
                style={[styles.smallBtn, styles.reject]}
              >
                <Text style={styles.smallText}>Reject</Text>
              </Pressable>

              <Pressable
                onPress={() => handleAction(course.id, "approved")}
                style={[styles.smallBtn, styles.approve]}
              >
                <Text style={[styles.smallText, { color: "#fff" }]}>
                  Approve
                </Text>
              </Pressable>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  muted: { color: "#666", marginTop: 8 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: "700" },
  link: { color: "#2563eb", fontWeight: "600" },

  bulkBar: {
    backgroundColor: "#e0f2fe",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  bulkText: { fontWeight: "700", marginBottom: 8 },
  bulkBtns: { flexDirection: "row", gap: 10 },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },

  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  code: { fontWeight: "700", fontSize: 16 },
  ltp: {
    fontFamily: "monospace",
    fontSize: 12,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  name: { marginTop: 4, fontWeight: "600" },
  meta: { fontSize: 12, color: "#555", marginTop: 2 },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  smallBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  reject: { backgroundColor: "#fee2e2" },
  approve: { backgroundColor: "#16a34a" },
  btnText: { fontWeight: "700" },
  smallText: { fontWeight: "600" },
});
