import { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { apiFetch } from "../../services/api";

export default function CourseMaterials({ offering, visible, onClose }) {
  const [materials, setMaterials] = useState([]);
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (offering && visible) {
      fetchMaterials();
    }
  }, [offering, visible]);

  const fetchMaterials = async () => {
    const res = await apiFetch(
      `/faculty/materials?offering_id=${offering.id}`
    );
    if (!res?.error) setMaterials(res || []);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !fileUrl.trim()) {
      Alert.alert("Error", "Title and URL are required");
      return;
    }

    let urlToSave = fileUrl.trim();
    if (
      !urlToSave.startsWith("http://") &&
      !urlToSave.startsWith("https://")
    ) {
      urlToSave = "https://" + urlToSave;
    }

    setLoading(true);
    const res = await apiFetch("/faculty/materials", "POST", {
      offering_id: offering.id,
      title,
      file_url: urlToSave,
    });
    setLoading(false);

    if (res?.error) {
      Alert.alert("Error", res.error);
    } else {
      Alert.alert("Success", "Material added");
      setTitle("");
      setFileUrl("");
      fetchMaterials();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Course Materials</Text>
              <Text style={styles.subtitle}>
                {offering.courses.course_code} –{" "}
                {offering.courses.course_name}
              </Text>
            </View>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
            {/* Upload Form */}
            <View style={styles.form}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Lecture 1 Slides"
                style={styles.input}
              />

              <Text style={styles.label}>File / Link URL</Text>
              <TextInput
                value={fileUrl}
                onChangeText={setFileUrl}
                placeholder="https://drive.google.com/..."
                style={styles.input}
                autoCapitalize="none"
              />

              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                style={[
                  styles.submitBtn,
                  loading && styles.disabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Add Material</Text>
                )}
              </Pressable>
            </View>

            {/* List */}
            <View style={styles.list}>
              {materials.length === 0 ? (
                <Text style={styles.empty}>No materials yet.</Text>
              ) : (
                materials.map((m) => (
                  <View key={m.id} style={styles.item}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{m.title}</Text>
                      <Text style={styles.itemMeta}>
                        {new Date(m.uploaded_at).toLocaleDateString()} •{" "}
                        {new Date(m.uploaded_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => Linking.openURL(m.file_url)}
                      style={styles.openBtn}
                    >
                      <Text style={styles.openText}>Open</Text>
                    </Pressable>
                  </View>
                ))
              )}
            </View>
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
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    maxHeight: "90%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  title: { fontSize: 20, fontWeight: "bold" },
  subtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  close: { fontSize: 22, color: "#6b7280" },
  form: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
    backgroundColor: "#f9fafb",
  },
  label: { fontWeight: "600", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "bold" },
  disabled: { opacity: 0.5 },
  list: { padding: 16 },
  empty: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 40,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    marginBottom: 10,
  },
  itemTitle: { fontWeight: "600", fontSize: 15 },
  itemMeta: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  openBtn: {
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 12,
  },
  openText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
});
