import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { apiFetch } from "../../services/api";

export default function AdvisorApprovals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(new Set());

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/faculty/advisor/requests");
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

  const handleAction = async (req, status) => {
    setLoading(true);
    try {
      const res = await apiFetch("/faculty/advisor-approve", "POST", {
        student_id: req.students.user_id,
        offering_id: req.offering.id,
        status,
      });
      if (res?.error) throw new Error(res.error);
      Alert.alert(
        "Success",
        `Request ${status === "enrolled" ? "approved" : "rejected"}`
      );
      fetchRequests();
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (idx) => {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(idx) ? s.delete(idx) : s.add(idx);
      return s;
    });
  };

  const handleBulk = async (status) => {
    if (selected.size === 0) {
      Alert.alert("Select at least one request");
      return;
    }

    Alert.alert(
      "Confirm",
      `Apply "${status}" to ${selected.size} request(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setLoading(true);
            try {
              for (const idx of selected) {
                const req = requests[idx];
                const res = await apiFetch(
                  "/faculty/advisor-approve",
                  "POST",
                  {
                    student_id: req.students.user_id,
                    offering_id: req.offering.id,
                    status,
                  }
                );
                if (res?.error) throw new Error(res.error);
              }
              Alert.alert("Success", "Bulk action completed");
              setSelected(new Set());
              fetchRequests();
            } catch (err) {
              Alert.alert("Error", err.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.card}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  if (!requests.length) {
    return (
      <View style={styles.card}>
        <Text style={styles.empty}>No pending advisor approvals</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <View style={styles.bulkBar}>
          <Text style={styles.bulkText}>
            {selected.size} selected
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              style={[styles.bulkBtn, styles.approve]}
              onPress={() => handleBulk("enrolled")}
            >
              <Text style={styles.bulkBtnText}>Approve</Text>
            </Pressable>
            <Pressable
              style={[styles.bulkBtn, styles.reject]}
              onPress={() => handleBulk("rejected")}
            >
              <Text style={styles.bulkBtnText}>Reject</Text>
            </Pressable>
          </View>
        </View>
      )}

      <ScrollView style={styles.container}>
        {requests.map((req, idx) => {
          const isSelected = selected.has(idx);
          return (
            <Pressable
              key={idx}
              style={[
                styles.requestCard,
                isSelected && styles.selectedCard,
              ]}
              onPress={() => toggleSelect(idx)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.roll}>
                  {req.students.roll_number}
                </Text>
                <Text style={styles.name}>
                  {req.students.user?.name}
                </Text>
                <Text style={styles.course}>
                  Course: {req.offering.courses.course_code}
                </Text>
              </View>

              <View style={styles.actions}>
                <Pressable
                  style={[styles.smallBtn, styles.approve]}
                  onPress={() => handleAction(req, "enrolled")}
                >
                  <Text style={styles.smallText}>Approve</Text>
                </Pressable>
                <Pressable
                  style={[styles.smallBtn, styles.reject]}
                  onPress={() => handleAction(req, "rejected")}
                >
                  <Text style={styles.smallText}>Reject</Text>
                </Pressable>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    margin: 16,
  },
  empty: {
    textAlign: "center",
    color: "#6b7280",
  },
  error: {
    color: "#b91c1c",
  },
  requestCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    gap: 12,
  },
  selectedCard: {
    backgroundColor: "#eff6ff",
  },
  roll: {
    fontWeight: "bold",
  },
  name: {
    fontSize: 13,
    color: "#374151",
  },
  course: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  actions: {
    justifyContent: "space-between",
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  smallText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  approve: {
    backgroundColor: "#dcfce7",
  },
  reject: {
    backgroundColor: "#fee2e2",
  },
  bulkBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  bulkText: {
    fontWeight: "bold",
  },
  bulkBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bulkBtnText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
