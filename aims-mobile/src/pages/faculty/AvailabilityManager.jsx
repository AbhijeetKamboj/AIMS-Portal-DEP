import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Linking,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { apiFetch } from "../../services/api";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function AvailabilityManager() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [settings, setSettings] = useState({
    calendar_sync_enabled: false,
  });

  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [slotDuration, setSlotDuration] = useState(30);

  useEffect(() => {
    fetchSlots();
    fetchSettings();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    const res = await apiFetch("/faculty/availability");
    if (!res?.error) setSlots(res || []);
    setLoading(false);
  };

  const fetchSettings = async () => {
    const res = await apiFetch("/faculty/settings");
    if (!res?.error) setSettings(res);
  };

  const initiateGoogleConnect = async () => {
    const stored = await SecureStore.getItemAsync("session");
    const session = stored ? JSON.parse(stored) : null;
    const token = session?.access_token;

    if (!token) {
      Alert.alert("Error", "Authentication token missing");
      return;
    }

    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    Linking.openURL(`${BACKEND_URL}/auth/google?token=${token}`);
  };

  const handleAdd = async () => {
    if (startTime >= endTime) {
      Alert.alert("Invalid time", "End time must be after start time");
      return;
    }

    const res = await apiFetch("/faculty/availability", "POST", {
      day_of_week: Number(dayOfWeek),
      start_time: startTime,
      end_time: endTime,
      slot_duration: Number(slotDuration),
    });

    if (res?.error) {
      Alert.alert("Error", res.error);
    } else {
      Alert.alert("Success", "Availability added");
      setShowForm(false);
      fetchSlots();
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm",
      "Remove this availability slot?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const res = await apiFetch(
              `/faculty/availability/${id}`,
              "DELETE"
            );
            if (res?.error) {
              Alert.alert("Error", res.error);
            } else {
              fetchSlots();
            }
          },
        },
      ]
    );
  };

  const handleToggle = async (slot) => {
    const res = await apiFetch(
      `/faculty/availability/${slot.id}`,
      "PUT",
      { is_active: !slot.is_active }
    );
    if (!res?.error) fetchSlots();
  };

  const groupedSlots = DAYS.map((day, index) => ({
    day,
    dayNum: index,
    slots: slots.filter((s) => s.day_of_week === index),
  })).filter((g) => g.slots.length > 0);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Availability Schedule</Text>
        <Text style={styles.subtitle}>
          Set weekly availability for student meetings
        </Text>

        <Pressable
          onPress={initiateGoogleConnect}
          disabled={settings.calendar_sync_enabled}
          style={[
            styles.googleBtn,
            settings.calendar_sync_enabled && styles.googleConnected,
          ]}
        >
          <Text style={styles.googleText}>
            {settings.calendar_sync_enabled
              ? "Google Calendar Connected"
              : "Connect Google Calendar"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setShowForm(!showForm)}
          style={styles.addBtn}
        >
          <Text style={styles.addText}>
            {showForm ? "Cancel" : "+ Add Slot"}
          </Text>
        </Pressable>
      </View>

      {/* Add Form */}
      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>New Slot</Text>

          <Text style={styles.label}>Day</Text>
          <ScrollView horizontal>
            {DAYS.map((d, i) => (
              <Pressable
                key={i}
                onPress={() => setDayOfWeek(i)}
                style={[
                  styles.dayBtn,
                  dayOfWeek === i && styles.dayActive,
                ]}
              >
                <Text>{d}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.label}>Start Time</Text>
          <TextInput
            value={startTime}
            onChangeText={setStartTime}
            style={styles.input}
            placeholder="HH:MM"
          />

          <Text style={styles.label}>End Time</Text>
          <TextInput
            value={endTime}
            onChangeText={setEndTime}
            style={styles.input}
            placeholder="HH:MM"
          />

          <Text style={styles.label}>Slot Duration (min)</Text>
          <TextInput
            value={String(slotDuration)}
            onChangeText={setSlotDuration}
            style={styles.input}
            keyboardType="numeric"
          />

          <Pressable style={styles.saveBtn} onPress={handleAdd}>
            <Text style={styles.saveText}>Add Availability</Text>
          </Pressable>
        </View>
      )}

      {/* Slots */}
      {groupedSlots.length === 0 ? (
        <Text style={styles.empty}>No availability set</Text>
      ) : (
        groupedSlots.map((group) => (
          <View key={group.dayNum} style={styles.dayGroup}>
            <Text style={styles.dayTitle}>{group.day}</Text>

            {group.slots.map((slot) => (
              <View key={slot.id} style={styles.slotCard}>
                <Text style={styles.slotText}>
                  {slot.start_time.slice(0, 5)} -{" "}
                  {slot.end_time.slice(0, 5)} (
                  {slot.slot_duration} min)
                </Text>

                <View style={styles.actions}>
                  <Pressable
                    onPress={() => handleToggle(slot)}
                    style={styles.toggleBtn}
                  >
                    <Text>
                      {slot.is_active ? "Disable" : "Enable"}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(slot.id)}
                    style={styles.deleteBtn}
                  >
                    <Text>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "bold" },
  subtitle: { color: "#6b7280", marginBottom: 8 },
  googleBtn: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  googleConnected: { backgroundColor: "#dcfce7" },
  googleText: { fontWeight: "500" },
  addBtn: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  addText: { color: "#fff", fontWeight: "bold" },
  form: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  formTitle: { fontWeight: "bold", marginBottom: 8 },
  label: { marginTop: 10, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  saveBtn: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 8,
    marginTop: 14,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "bold" },
  dayBtn: {
    padding: 8,
    marginRight: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  dayActive: { backgroundColor: "#e5e7eb" },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#6b7280",
  },
  dayGroup: { marginBottom: 16 },
  dayTitle: { fontWeight: "bold", marginBottom: 6 },
  slotCard: {
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  slotText: { marginBottom: 6 },
  actions: { flexDirection: "row", gap: 8 },
  toggleBtn: {
    backgroundColor: "#e5e7eb",
    padding: 6,
    borderRadius: 6,
  },
  deleteBtn: {
    backgroundColor: "#fee2e2",
    padding: 6,
    borderRadius: 6,
  },
});
