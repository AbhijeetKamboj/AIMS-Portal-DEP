import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import { apiFetch } from "../../services/api";

export default function Offerings() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);

  const [selectedOffering, setSelectedOffering] = useState(null);
  const [enrollType, setEnrollType] = useState("credit");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [myEnrollments, setMyEnrollments] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let res = data;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      res = res.filter(
        o =>
          o.courses.course_code.toLowerCase().includes(q) ||
          o.courses.course_name.toLowerCase().includes(q) ||
          o.faculty?.users?.name?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      res = res.filter(o => {
        const status = myEnrollments[o.id];
        if (statusFilter === "enrolled") return status === "enrolled";
        if (statusFilter === "pending")
          return status === "pending_faculty" || status === "pending_advisor";
        if (statusFilter === "backlog") return status === "backlog";
        if (statusFilter === "available") return !status;
        return true;
      });
    }

    setFilteredData(res);
  }, [searchQuery, statusFilter, data, myEnrollments]);

  const fetchData = async () => {
    setLoading(true);

    const [offerings, enrolls] = await Promise.all([
      apiFetch("/student/offerings"),
      apiFetch("/student/my-enrollments"),
    ]);

    if (!offerings?.error) setData(offerings);

    if (Array.isArray(enrolls)) {
      const map = {};
      enrolls.forEach(e => {
        if (e.semester_status === "locked" || e.semester_status === "completed") {
          map[e.offering_id] = "completed";
        } else {
          map[e.offering_id] = e.status;
        }
      });
      setMyEnrollments(map);
    }

    setLoading(false);
  };

  const confirmEnroll = async () => {
    const offering = selectedOffering;
    setSelectedOffering(null);
    setLoadingId(offering.id);

    const res = await apiFetch("/student/enroll", "POST", {
      offering_id: offering.id,
      enrollment_type: enrollType,
    });

    if (res?.error) {
      Alert.alert("Enrollment Failed", res.error);
    } else {
      Alert.alert("Success", "Enrollment request sent");
      setMyEnrollments(prev => ({
        ...prev,
        [offering.id]: "pending_faculty",
      }));
    }

    setLoadingId(null);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Course Registration</Text>

      <TextInput
        placeholder="Search course or faculty"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.search}
      />

      {filteredData.length === 0 ? (
        <Text style={styles.empty}>No courses found</Text>
      ) : (
        filteredData.map(o => {
          const status = myEnrollments[o.id];

          return (
            <Pressable
              key={o.id}
              style={styles.card}
              onPress={() => setSelectedOffering(o)}
            >
              <Text style={styles.code}>{o.courses.course_code}</Text>
              <Text style={styles.name}>{o.courses.course_name}</Text>
              <Text style={styles.meta}>
                {o.faculty?.users?.name} · Credits {o.courses.credits}
              </Text>

              <View style={styles.row}>
                <Text style={styles.status}>
                  {status || "Available"}
                </Text>

                {!status && (
                  <Pressable
                    style={styles.button}
                    disabled={loadingId === o.id}
                    onPress={() => setSelectedOffering(o)}
                  >
                    <Text style={styles.buttonText}>
                      {loadingId === o.id ? "..." : "Register"}
                    </Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          );
        })
      )}

      {/* Enroll Modal */}
      <Modal visible={!!selectedOffering} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Confirm Registration</Text>
            <Text style={styles.modalText}>
              {selectedOffering?.courses.course_code} –{" "}
              {selectedOffering?.courses.course_name}
            </Text>

            <View style={styles.typeRow}>
              {["credit", "minor", "concentration"].map(t => (
                <Pressable
                  key={t}
                  style={[
                    styles.typeBtn,
                    enrollType === t && styles.typeActive,
                  ]}
                  onPress={() => setEnrollType(t)}
                >
                  <Text
                    style={{
                      color: enrollType === t ? "#fff" : "#000",
                    }}
                  >
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.confirmBtn} onPress={confirmEnroll}>
              <Text style={styles.confirmText}>Confirm</Text>
            </Pressable>

            <Pressable onPress={() => setSelectedOffering(null)}>
              <Text style={styles.cancel}>Cancel</Text>
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
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  search: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  empty: { textAlign: "center", marginTop: 40, color: "#666" },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  code: { fontWeight: "bold" },
  name: { fontSize: 15 },
  meta: { color: "#666", fontSize: 12, marginTop: 4 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  status: { fontSize: 12, color: "#2563eb" },
  button: {
    backgroundColor: "#000",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: { color: "#fff" },

  modalBackdrop: {
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
  modalText: { marginVertical: 10 },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  typeBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
    marginHorizontal: 4,
    alignItems: "center",
  },
  typeActive: {
    backgroundColor: "#000",
  },
  confirmBtn: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  confirmText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  cancel: { textAlign: "center", color: "#666" },
});
