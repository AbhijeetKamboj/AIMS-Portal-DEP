import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { apiFetch } from "../../services/api";

import FacultyAnnouncements from "./FacultyAnnouncements";
import CourseMaterials from "./CourseMaterials";
import CourseEnrollmentsModal from "./CourseEnrollmentsModal";
import GradeUploadModal from "./GradeUploadModal";
import CourseInfoModal from "../../components/CourseInfoModal";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("active"); // active | completed
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ type: null, offering: null });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    let data =
      tab === "active"
        ? courses.filter(c => c.status === "approved")
        : courses.filter(c => c.status === "completed");

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(c =>
        c.courses.course_code.toLowerCase().includes(q) ||
        c.courses.course_name.toLowerCase().includes(q)
      );
    }

    setFiltered(data);
  }, [courses, search, tab]);

  const fetchCourses = async () => {
    setLoading(true);
    const res = await apiFetch("/faculty/my-courses");
    if (!res?.error) setCourses(res);
    setLoading(false);
  };

  const openModal = (type, offering) =>
    setModal({ type, offering });

  const closeModal = () =>
    setModal({ type: null, offering: null });

  const renderCourse = ({ item }) => (
    <Pressable
      style={[
        styles.card,
        item.status === "completed" && styles.completed,
      ]}
      onPress={() => openModal("info", item)}
    >
      <View>
        <View style={styles.row}>
          <Text style={styles.code}>{item.courses.course_code}</Text>
          <Text
            style={[
              styles.badge,
              item.status === "completed"
                ? styles.badgeGray
                : styles.badgeGreen,
            ]}
          >
            {item.status === "completed" ? "COMPLETED" : "ACTIVE"}
          </Text>
        </View>

        <Text style={styles.name}>{item.courses.course_name}</Text>
        <Text style={styles.sem}>📅 {item.semesters.name}</Text>
      </View>

      <View style={styles.actions}>
        <Action label="📢 Announcements" onPress={() => openModal("announcements", item)} />
        <Action label="📚 Materials" onPress={() => openModal("materials", item)} />
        <Action label="👥 Enrollments" onPress={() => openModal("enrollments", item)} />
        {item.status === "approved" && (
          <Action label="📝 Grades" onPress={() => openModal("grades", item)} />
        )}
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading courses…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Courses</Text>

        <View style={styles.tabs}>
          <Tab label="Active" active={tab === "active"} onPress={() => setTab("active")} />
          <Tab label="Completed" active={tab === "completed"} onPress={() => setTab("completed")} />
        </View>
      </View>

      {/* Search */}
      <TextInput
        placeholder="Search courses…"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        renderItem={renderCourse}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No {tab === "active" ? "active" : "completed"} courses
          </Text>
        }
      />

      {/* Modals */}
      {modal.type === "info" && (
        <CourseInfoModal course={modal.offering} onClose={closeModal} />
      )}
      {modal.type === "announcements" && (
        <FacultyAnnouncements offering={modal.offering} onClose={closeModal} />
      )}
      {modal.type === "materials" && (
        <CourseMaterials offering={modal.offering} onClose={closeModal} />
      )}
      {modal.type === "enrollments" && (
        <CourseEnrollmentsModal offering={modal.offering} onClose={closeModal} />
      )}
      {modal.type === "grades" && (
        <GradeUploadModal offering={modal.offering} onClose={closeModal} />
      )}
    </View>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

const Tab = ({ label, active, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[styles.tab, active && styles.tabActive]}
  >
    <Text style={[styles.tabText, active && styles.tabTextActive]}>
      {label}
    </Text>
  </Pressable>
);

const Action = ({ label, onPress }) => (
  <Pressable onPress={onPress} style={styles.actionBtn}>
    <Text style={styles.actionText}>{label}</Text>
  </Pressable>
);

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "700" },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tabActive: {
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  tabText: { fontSize: 13, color: "#666" },
  tabTextActive: { fontWeight: "700", color: "#000" },

  search: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  completed: { backgroundColor: "#f5f5f5" },

  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  code: { fontSize: 18, fontWeight: "700" },
  name: { fontSize: 15, color: "#444", marginTop: 2 },
  sem: { fontSize: 12, color: "#777", marginTop: 4 },

  badge: {
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontWeight: "700",
  },
  badgeGreen: { backgroundColor: "#DCFCE7", color: "#166534" },
  badgeGray: { backgroundColor: "#E5E7EB", color: "#374151" },

  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  actionText: { fontSize: 12, fontWeight: "600" },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#888",
  },
});
