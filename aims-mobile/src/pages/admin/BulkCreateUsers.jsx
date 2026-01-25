import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { apiFetch } from "../../services/api";
// import Alert.alert from "react-hot-Alert.alert";

export default function BulkCreateUsers() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleProcess = async () => {
    setLoading(true);
    setResult(null);

    const lines = input.trim().split("\n");
    const users = [];

    for (const line of lines) {
      const parts = line.split(",").map(p => p.trim());
      if (parts.length < 4) continue;

      const [
        email,
        password,
        name,
        role_id,
        id_code,
        department,
        batch,
      ] = parts;

      users.push({
        email,
        password,
        name,
        role_id: parseInt(role_id),
        employee_id: role_id == 2 ? id_code : undefined,
        roll_number: role_id == 1 ? id_code : undefined,
        department,
        batch: batch ? parseInt(batch) : undefined,
      });
    }

    if (users.length === 0) {
      Alert.alert.error("No valid users found in input");
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch("/admin/bulk-users", "POST", { users });

      if (res.error) {
        Alert.alert.error(res.error);
      } else {
        setResult(res.results);
        Alert.alert.success(`Processed ${res.results.success} users`);
      }
    } catch (err) {
      Alert.alert.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Bulk Create Users</Text>

      <Text style={styles.subtitle}>
        Paste CSV data (no header)
      </Text>

      <Text style={styles.codeBlock}>
        email, password, name, role_id(1=Stu / 2=Fac / 3=Adm), roll/emp_id,
        department, batch
      </Text>

      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder={
          "student@test.com, pass123, John Doe, 1, CS2401, CSE, 2024\n" +
          "prof@test.com, pass123, Dr. Smith, 2, FAC01, CSE,"
        }
        multiline
        textAlignVertical="top"
        autoCapitalize="none"
        style={styles.textarea}
      />

      <Pressable
        onPress={handleProcess}
        disabled={loading || !input.trim()}
        style={({ pressed }) => [
          styles.button,
          pressed && !loading && styles.pressed,
          (loading || !input.trim()) && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Users</Text>
        )}
      </Pressable>

      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.success}>
            Success: {result.success}
          </Text>
          <Text style={styles.failed}>
            Failed: {result.failed}
          </Text>

          {result.errors?.length > 0 && (
            <View style={styles.errorList}>
              <Text style={styles.errorTitle}>Errors:</Text>
              {result.errors.map((e, i) => (
                <Text key={i} style={styles.errorText}>
                  {e.email}: {e.error}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#555",
    marginBottom: 6,
  },
  codeBlock: {
    fontSize: 12,
    fontFamily: "monospace",
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 8,
    marginBottom: 14,
  },
  textarea: {
    height: 240,
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    padding: 14,
    fontFamily: "monospace",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  resultBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
  },
  success: {
    color: "green",
    fontWeight: "700",
    marginBottom: 4,
  },
  failed: {
    color: "red",
    fontWeight: "700",
  },
  errorList: {
    marginTop: 8,
  },
  errorTitle: {
    fontWeight: "700",
    marginBottom: 4,
    color: "#444",
  },
  errorText: {
    fontSize: 12,
    color: "red",
    marginBottom: 2,
  },
});
