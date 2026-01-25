import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { apiFetch } from "../../services/api";
// import Alert.alert from "react-hot-Alert.alert";

export default function ApproveOfferings() {
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchOfferings = async () => {
    setLoading(true);
    const res = await apiFetch("/courses/all-offerings");
    if (!res?.error) {
      setOfferings(res.filter(o => o.status === "pending"));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOfferings();
  }, []);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAction = async (offering_id, status) => {
    try {
      await apiFetch("/courses/approve-offering", "POST", {
        offering_id,
        status,
      });
      Alert.alert(`Offering ${status}`);
      fetchOfferings();
    } catch (err) {
      Alert.alert.error(err.message);
    }
  };

  const handleBulkAction = async (status) => {
    if (selectedIds.size === 0) {
      Alert.alert.error("Select at least one offering");
      return;
    }

    Alert.alert(
      `${status === "approved" ? "Approve" : "Reject"} Offerings`,
      `Apply to ${selectedIds.size} offerings?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setBulkLoading(true);
            try {
              for (const id of selectedIds) {
                await apiFetch("/courses/approve-offering", "POST", {
                  offering_id: id,
                  status,
                });
              }
              Alert.alert.success("Bulk action completed");
              setSelectedIds(new Set());
              fetchOfferings();
            } catch (err) {
              Alert.alert.error(err.message);
            } finally {
              setBulkLoading(false);
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
        <Text style={styles.muted}>Loading offerings...</Text>
      </View>
    );
  }

  if (offerings.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>No pending course offerings</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <View style={styles.bulkBar}>
          <Text style={styles.bulkText}>
            {selectedIds.size} selected
          </Text>

          <View style={styles.row}>
            <Pressable
              style={[styles.bulkBtn, styles.reject]}
              disabled={bulkLoading}
              onPress={() => handleBulkAction("rejected")}
            >
              <Text style={styles.bulkBtnText}>Reject</Text>
            </Pressable>

            <Pressable
              style={[styles.bulkBtn, styles.approve]}
              disabled={bulkLoading}
              onPress={() => handleBulkAction("approved")}
            >
              <Text style={styles.bulkBtnText}>Approve</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* List */}
      <FlatList
        data={offerings}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => {
          const selected = selectedIds.has(item.id);

          return (
            <Pressable
              onPress={() => toggleSelect(item.id)}
              style={[
                styles.card,
                selected && styles.cardSelected,
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.code}>
                  {item.courses.course_code}
                </Text>
                <Text style={styles.name}>
                  {item.courses.course_name}
                </Text>
              </View>

              <Text style={styles.meta}>
                Faculty: {item.faculty?.users?.name || "N/A"}
              </Text>

              <Text style={styles.meta}>
                Credits: {item.courses.credits} | L-T-P-S:
                {` ${item.courses.l}-${item.courses.t}-${item.courses.p}-${item.courses.s}`}
              </Text>

              <View style={styles.actions}>
                <Pressable
                  style={[styles.smallBtn, styles.reject]}
                  onPress={() => handleAction(item.id, "rejected")}
                >
                  <Text style={styles.smallText}>Reject</Text>
                </Pressable>

                <Pressable
                  style={[styles.smallBtn, styles.approve]}
                  onPress={() => handleAction(item.id, "approved")}
                >
                  <Text style={styles.smallText}>Approve</Text>
                </Pressable>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  muted: {
    marginTop: 8,
    color: "#777",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  cardSelected: {
    borderColor: "#000",
    backgroundColor: "#f5f5f5",
  },
  cardHeader: {
    marginBottom: 6,
  },
  code: {
    fontWeight: "700",
    fontSize: 16,
  },
  name: {
    fontSize: 14,
    color: "#444",
  },
  meta: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  smallText: {
    fontSize: 12,
    fontWeight: "700",
  },
  approve: {
    backgroundColor: "#000",
  },
  reject: {
    backgroundColor: "#fee2e2",
  },
  bulkBar: {
    backgroundColor: "#eef2ff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  bulkText: {
    fontWeight: "700",
    marginBottom: 8,
  },
  bulkBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  bulkBtnText: {
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
});
