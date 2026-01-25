import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { apiFetch } from "../../services/api";
// import Alert.alert from "react-hot-Alert.alert";

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: "", code: "" });
  const [loading, setLoading] = useState(false);

  const fetchDepts = async () => {
    const res = await apiFetch("/departments/list");
    if (!res.error) setDepartments(res);
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const create = async () => {
    if (!form.name || !form.code) {
      Alert.alert.error("Fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/departments/create", "POST", form);
      if (res.error) throw new Error(res.error);

      Alert.alert.success("Department added");
      setForm({ name: "", code: "" });
      fetchDepts();
    } catch (err) {
      Alert.alert.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.codeBox}>
        <Text style={styles.code}>{item.code}</Text>
      </View>
      <Text style={styles.name}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Departments</Text>

      {/* Create Department */}
      <View style={styles.form}>
        <TextInput
          placeholder="Department Name (e.g. Chemical Engg)"
          value={form.name}
          onChangeText={v => setForm({ ...form, name: v })}
          style={styles.input}
        />

        <TextInput
          placeholder="Code (e.g. CHE)"
          value={form.code}
          autoCapitalize="characters"
          onChangeText={v => setForm({ ...form, code: v.toUpperCase() })}
          style={styles.input}
        />

        <Pressable
          onPress={create}
          disabled={loading}
          style={[styles.button, loading && styles.disabled]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Add Department</Text>
          )}
        </Pressable>
      </View>

      {/* Department List */}
      {departments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No departments found</Text>
        </View>
      ) : (
        <FlatList
          data={departments}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  codeBox: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  code: {
    fontWeight: "700",
    fontFamily: "monospace",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  empty: {
    marginTop: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#9ca3af",
    fontStyle: "italic",
  },
});
