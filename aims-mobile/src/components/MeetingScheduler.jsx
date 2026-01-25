import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { apiFetch } from "../services/api";
import Toast from "react-native-toast-message";

export default function MeetingScheduler({ userRole }) {
  const [meetings, setMeetings] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [date, setDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reason, setReason] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchMeetings();
    if (userRole === "student") fetchFacultyList();
  }, [userRole]);

  useEffect(() => {
    if (selectedFaculty && date) fetchAvailableSlots();
    else {
      setAvailableSlots([]);
      setSelectedSlot("");
    }
  }, [selectedFaculty, date]);

  const fetchMeetings = async () => {
    const endpoint =
      userRole === "student" ? "/student/meetings" : "/faculty/meetings";
    const res = await apiFetch(endpoint);
    if (!res.error) setMeetings(res);
  };

  const fetchFacultyList = async () => {
    const res = await apiFetch("/student/faculty-list");
    if (!res.error) setFacultyList(res || []);
  };

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    const res = await apiFetch(
      `/student/available-slots?faculty_id=${selectedFaculty}&date=${date}`
    );
    setAvailableSlots(res || []);
    setLoadingSlots(false);
  };

  const handleRequest = async () => {
    if (!selectedFaculty || !date || !selectedSlot || !reason) {
      Toast.show({ type: "error", text1: "Fill all fields" });
      return;
    }

    const res = await apiFetch("/student/meetings", "POST", {
      faculty_id: selectedFaculty,
      date,
      time: selectedSlot,
      reason,
      duration: 30,
    });

    if (res.error) Toast.show({ type: "error", text1: res.error });
    else {
      Toast.show({ type: "success", text1: "Meeting requested" });
      setShowForm(false);
      resetForm();
      fetchMeetings();
    }
  };

  const handleCancel = (id) => {
    Alert.alert("Cancel Meeting", "Are you sure?", [
      { text: "No" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          const res = await apiFetch(
            "/student/meetings/cancel",
            "POST",
            { meeting_id: id }
          );
          if (!res.error) {
            Toast.show({ type: "success", text1: "Meeting cancelled" });
            fetchMeetings();
          }
        },
      },
    ]);
  };

  const handleRespond = async (id, status) => {
    const res = await apiFetch("/faculty/meetings/respond", "POST", {
      request_id: id,
      status,
      response: status === "approved" ? "Approved" : "Rejected",
    });

    if (!res.error) {
      Toast.show({ type: "success", text1: `Meeting ${status}` });
      fetchMeetings();
    }
  };

  const resetForm = () => {
    setDate("");
    setSelectedFaculty("");
    setSelectedSlot("");
    setReason("");
    setAvailableSlots([]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meeting Schedule</Text>

        {userRole === "student" && (
          <Pressable
            style={[styles.primaryBtn, showForm && styles.secondaryBtn]}
            onPress={() => setShowForm(!showForm)}
          >
            <Text style={styles.btnText}>
              {showForm ? "Cancel" : "Request Meeting"}
            </Text>
          </Pressable>
        )}
      </View>

      {showForm && userRole === "student" && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>New Meeting</Text>

          <TextInput
            placeholder="Faculty ID"
            value={selectedFaculty}
            onChangeText={setSelectedFaculty}
            style={styles.input}
          />

          <TextInput
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
            style={styles.input}
          />

          {loadingSlots && <ActivityIndicator />}

          <View style={styles.slotWrap}>
            {availableSlots.map((s) => (
              <Pressable
                key={s.slot_time}
                onPress={() => setSelectedSlot(s.slot_time)}
                style={[
                  styles.slot,
                  selectedSlot === s.slot_time && styles.slotSelected,
                ]}
              >
                <Text
                  style={[
                    styles.slotText,
                    selectedSlot === s.slot_time && styles.slotTextSelected,
                  ]}
                >
                  {s.slot_time.slice(0, 5)}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            placeholder="Reason"
            value={reason}
            onChangeText={setReason}
            style={[styles.input, styles.textArea]}
            multiline
          />

          <Pressable
            onPress={handleRequest}
            style={[styles.primaryBtn, !selectedSlot && styles.disabled]}
            disabled={!selectedSlot}
          >
            <Text style={styles.btnText}>Submit</Text>
          </Pressable>
        </View>
      )}

      {meetings.map((m) => (
        <View key={m.id} style={styles.card}>
          <Text style={styles.name}>
            {userRole === "faculty"
              ? m.students?.user?.name
              : m.faculty?.user?.name}
          </Text>

          <Text style={styles.meta}>
            {m.requested_date} • {m.requested_time}
          </Text>

          <Text style={styles.reason}>{m.reason}</Text>

          <View style={styles.actionRow}>
            {userRole === "student" &&
              (m.status === "pending" || m.status === "approved") && (
                <Pressable
                  style={styles.dangerBtn}
                  onPress={() => handleCancel(m.id)}
                >
                  <Text style={styles.btnText}>Cancel</Text>
                </Pressable>
              )}

            {userRole === "faculty" && m.status === "pending" && (
              <>
                <Pressable
                  style={styles.dangerBtn}
                  onPress={() => handleRespond(m.id, "rejected")}
                >
                  <Text style={styles.btnText}>Reject</Text>
                </Pressable>
                <Pressable
                  style={styles.successBtn}
                  onPress={() => handleRespond(m.id, "approved")}
                >
                  <Text style={styles.btnText}>Approve</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "800" },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
  },

  sectionTitle: { fontWeight: "700", marginBottom: 12 },

  input: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  textArea: { minHeight: 80 },

  slotWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  slot: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },

  slotSelected: { backgroundColor: "#000" },
  slotText: { fontWeight: "600" },
  slotTextSelected: { color: "#fff" },

  name: { fontSize: 16, fontWeight: "700" },
  meta: { fontSize: 12, color: "#6b7280", marginVertical: 4 },
  reason: { fontStyle: "italic", marginBottom: 8 },

  actionRow: { flexDirection: "row", gap: 8 },

  primaryBtn: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  secondaryBtn: { backgroundColor: "#e5e7eb" },
  successBtn: { backgroundColor: "#16a34a", padding: 10, borderRadius: 10 },
  dangerBtn: { backgroundColor: "#dc2626", padding: 10, borderRadius: 10 },

  btnText: { color: "#fff", fontWeight: "700" },
  disabled: { opacity: 0.5 },
});
