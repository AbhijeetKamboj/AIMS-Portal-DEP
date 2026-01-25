import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { apiFetch } from "../../services/api";

export default function FacultyApprovals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequests, setSelectedRequests] = useState(new Set());

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/faculty/requests");
      if (res?.error) {
        setError(res.error);
        setRequests([]);
      } else {
        setRequests(res || []);
      }
    } catch (err) {
      setError(err.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (student_id, offering_id, status) => {
    setLoading(true);
    try {
      const res = await apiFetch("/faculty/approve-enrollment", "POST", {
        student_id,
        offering_id,
        status,
      });
      if (res?.error) throw new Error(res.error);
      Alert.alert(
        "Success",
        status === "pending_advisor"
          ? "Request approved"
          : "Request rejected"
      );
      fetchRequests();
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleRequestSelection = (key) => {
    setSelectedRequests((prev) => {
      const s = new Set(prev);
      s.has(key) ? s.delete(key) : s.add(key);
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRequests.size === requests.length) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(requests.map((_, i) => i.toString())));
    }
  };

  const handleBulkApprove = async (status) => {
    if (selectedRequests.size === 0) {
      return Alert.alert("Error", "Select at least one request");
    }

    setLoading(true);
    try {
      const selectedArray = Array.from(selectedRequests).map(
        (idx) => requests[parseInt(idx)]
      );

      for (const req of selectedArray) {
        const res = await apiFetch("/faculty/approve-enrollment", "POST", {
          student_id: req.students.user_id,
          offering_id: req.offering.id,
          status,
        });
        if (res?.error) throw new Error(res.error);
      }

      Alert.alert(
        "Success",
        `${selectedArray.length} request(s) ${
          status === "pending_advisor" ? "approved" : "rejected"
        }`
      );
      setSelectedRequests(new Set());
      fetchRequests();
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!requests.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No pending enrollment requests.</Text>
      </View>
    );
  }

  // Group by offering
  const grouped = {};
  requests.forEach((req, idx) => {
    const oid = req.offering.id;
    if (!grouped[oid]) {
      grouped[oid] = {
        courseCode: req.offering.courses.course_code,
        requests: [],
      };
    }
    grouped[oid].requests.push({ ...req, globalIdx: idx });
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pending Enrollment Requests</Text>
        <Pressable onPress={toggleSelectAll} style={styles.selectAll}>
          <Text style={styles.selectAllText}>
            {selectedRequests.size === requests.length
              ? "Unselect All"
              : "Select All"}
          </Text>
        </Pressable>
      </View>

      {selectedRequests.size > 0 && (
        <View style={styles.bulkBar}>
          <Text style={styles.bulkText}>
            {selectedRequests.size} selected
          </Text>
          <View style={styles.bulkButtons}>
            <Pressable
              style={[styles.btn, styles.approve]}
              onPress={() => handleBulkApprove("pending_advisor")}
            >
              <Text style={styles.btnText}>Approve</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.reject]}
              onPress={() => handleBulkApprove("rejected")}
            >
              <Text style={styles.btnText}>Reject</Text>
            </Pressable>
          </View>
        </View>
      )}

      {Object.values(grouped).map((group) => (
        <View key={group.courseCode} style={styles.card}>
          <Text style={styles.course}>{group.courseCode}</Text>

          {group.requests.map((req) => {
            const key = req.globalIdx.toString();
            const selected = selectedRequests.has(key);

            return (
              <View
                key={key}
                style={[
                  styles.row,
                  selected && styles.rowSelected,
                ]}
              >
                <Pressable
                  onPress={() => toggleRequestSelection(key)}
                  style={[
                    styles.checkbox,
                    selected && styles.checkboxChecked,
                  ]}
                />

                <View style={{ flex: 1 }}>
                  <Text style={styles.roll}>
                    {req.students.roll_number}
                  </Text>
                  <Text style={styles.name}>
                    {req.students.user?.name}
                  </Text>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    style={[styles.actionBtn, styles.approve]}
                    onPress={() =>
                      handleAction(
                        req.students.user_id,
                        req.offering.id,
                        "pending_advisor"
                      )
                    }
                  >
                    <Text style={styles.actionText}>Approve</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, styles.reject]}
                    onPress={() =>
                      handleAction(
                        req.students.user_id,
                        req.offering.id,
                        "rejected"
                      )
                    }
                  >
                    <Text style={styles.actionText}>Reject</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    color: "#6b7280",
    fontSize: 14,
  },
  header: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  selectAll: {
    padding: 6,
  },
  selectAllText: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "600",
  },
  bulkBar: {
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  bulkText: {
    fontWeight: "600",
    marginBottom: 8,
  },
  bulkButtons: {
    flexDirection: "row",
    gap: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  course: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f9fafb",
    marginBottom: 8,
  },
  rowSelected: {
    backgroundColor: "#eff6ff",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 4,
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: "#2563eb",
  },
  roll: {
    fontWeight: "600",
  },
  name: {
    fontSize: 12,
    color: "#6b7280",
  },
  actions: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  btn: {
    padding: 10,
    borderRadius: 8,
  },
  approve: {
    backgroundColor: "#16a34a",
  },
  reject: {
    backgroundColor: "#dc2626",
  },
});
