import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
// import Alert.alert from "react-hot-Alert.alert";
import { apiFetch } from "../../services/api";

export default function MeetingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(null); // approved | rejected
  const [response, setResponse] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const res = await apiFetch("/faculty/meetings");
    if (!res?.error) setRequests(res);
    setLoading(false);
  };

  const openModal = (req, status) => {
    setSelected(req);
    setAction(status);
    setResponse("");
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
    setSelected(null);
    setAction(null);
    setResponse("");
  };

  const submitResponse = async () => {
    if (action === "rejected" && !response.trim()) {
      Alert.alert.error("Rejection reason is required");
      return;
    }

    setProcessingId(selected.id);

    const res = await apiFetch("/faculty/meetings/respond", "POST", {
      request_id: selected.id,
      status: action,
      response,
    });

    if (res.error) {
      Alert.alert.error(res.error);
    } else {
      Alert.alert.success(`Request ${action}`);
      fetchRequests();
      closeModal();
    }

    setProcessingId(null);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>
        {item.students.user.name}{" "}
        <Text style={styles.roll}>({item.students.roll_number})</Text>
      </Text>

      <Text style={styles.meta}>
        {item.requested_date} • {item.requested_time}
      </Text>

      <View style={styles.reasonBox}>
        <Text style={styles.reasonText}>{item.reason}</Text>
      </View>

      {item.response && (
        <Text style={styles.response}>
          <Text style={{ fontWeight: "600" }}>Response: </Text>
          {item.response}
        </Text>
      )}

      <View style={styles.actions}>
        <Text
          style={[
            styles.status,
            item.status === "pending"
              ? styles.pending
              : item.status === "approved"
              ? styles.approved
              : styles.rejected,
          ]}
        >
          {item.status.toUpperCase()}
        </Text>

        {item.status === "pending" && (
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              style={[styles.btn, styles.rejectBtn]}
              onPress={() => openModal(item, "rejected")}
            >
              <Text style={styles.btnText}>Reject</Text>
            </Pressable>

            <Pressable
              style={[styles.btn, styles.approveBtn]}
              onPress={() => openModal(item, "approved")}
            >
              <Text style={styles.btnText}>Approve</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.header}>Meeting Requests</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.empty}>No meeting requests</Text>
          }
        />
      )}

      {/* MODAL */}
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {action === "approved" ? "Approve Meeting" : "Reject Meeting"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder={
                action === "approved"
                  ? "Optional response"
                  : "Rejection reason (required)"
              }
              value={response}
              onChangeText={setResponse}
              multiline
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={closeModal}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.submitBtn}
                onPress={submitResponse}
                disabled={processingId === selected?.id}
              >
                {processingId === selected?.id ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Submit</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
  },
  roll: {
    fontSize: 12,
    color: "#666",
  },
  meta: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  reasonBox: {
    backgroundColor: "#f4f4f4",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  reasonText: {
    fontStyle: "italic",
  },
  response: {
    marginTop: 8,
    fontSize: 13,
    color: "#444",
  },
  actions: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  status: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pending: { backgroundColor: "#FEF3C7", color: "#92400E" },
  approved: { backgroundColor: "#DCFCE7", color: "#166534" },
  rejected: { backgroundColor: "#FEE2E2", color: "#991B1B" },

  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  approveBtn: { backgroundColor: "#DCFCE7" },
  rejectBtn: { backgroundColor: "#FEE2E2" },
  btnText: { fontSize: 12, fontWeight: "700" },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    minHeight: 90,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 10,
  },
  cancelBtn: {
    padding: 10,
  },
  cancelText: {
    fontWeight: "700",
    color: "#444",
  },
  submitBtn: {
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
  },
});
