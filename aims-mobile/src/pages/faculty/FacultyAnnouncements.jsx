import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { apiFetch } from "../../services/api";

export default function FacultyAnnouncements({ offering, onClose }) {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, [offering]);

  const fetchAnnouncements = async () => {
    const res = await apiFetch(
      `/faculty/announcements?offering_id=${offering.id}`
    );
    if (!res?.error) setAnnouncements(res);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      return Alert.alert("Error", "Title and message are required");
    }

    setLoading(true);
    const res = await apiFetch("/faculty/announcements", "POST", {
      offering_id: offering.id,
      title,
      content,
    });
    setLoading(false);

    if (res?.error) {
      Alert.alert("Error", res.error);
    } else {
      Alert.alert("Success", "Announcement posted");
      setTitle("");
      setContent("");
      fetchAnnouncements();
    }
  };

  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Announcements</Text>
              <Text style={styles.subtitle}>
                {offering.courses.course_code}:{" "}
                {offering.courses.course_name}
              </Text>
            </View>

            <Pressable onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
            {/* Create */}
            <View style={styles.form}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Announcement title"
                style={styles.input}
              />

              <Text style={styles.label}>Message</Text>
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Write your announcement..."
                style={[styles.input, styles.textarea]}
                multiline
              />

              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                style={[
                  styles.button,
                  loading && styles.buttonDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    Post Announcement
                  </Text>
                )}
              </Pressable>
            </View>

            {/* List */}
            {announcements.length === 0 ? (
              <Text style={styles.empty}>No announcements yet.</Text>
            ) : (
              announcements.map((a) => (
                <View key={a.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{a.title}</Text>
                  <Text style={styles.cardText}>{a.content}</Text>
                  <Text style={styles.cardDate}>
                    {new Date(a.created_at).toLocaleDateString()}{" "}
                    {new Date(a.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 16,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 18,
    maxHeight: "90%",
    overflow: "hidden",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  close: {
    fontSize: 22,
    color: "#6b7280",
  },
  form: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  empty: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 32,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 6,
    color: "#111827",
  },
  cardText: {
    fontSize: 14,
    color: "#374151",
  },
  cardDate: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 8,
  },
});
