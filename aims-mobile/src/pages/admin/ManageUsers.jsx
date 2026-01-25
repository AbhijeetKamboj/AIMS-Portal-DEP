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
import BulkImportPanel from "./BulkImportPanel.jsx"; // ⚠️ see note below

export default function ManageUsers() {
  const [subTab, setSubTab] = useState("single");
  const [userType, setUserType] = useState("student");
  const [singleForm, setSingleForm] = useState({
    department: "",
    name: "",
    email: "",
  });
  const [singleLoading, setSingleLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  const expectedFields =
    userType === "student"
      ? ["email", "name", "department", "roll_number", "batch"]
      : ["email", "name", "department", "employee_id"];

  /* ---------------- Single User ---------------- */

  const handleSingleSubmit = async () => {
    if (!singleForm.name || !singleForm.email || !singleForm.department) {
      Alert.alert.error("Please fill all required fields");
      return;
    }

    setSingleLoading(true);
    const endpoint =
      userType === "student"
        ? "/admin/create-student"
        : "/admin/create-faculty";

    try {
      const res = await apiFetch(endpoint, "POST", singleForm);
      if (res.error) throw new Error(res.error);

      Alert.alert.success(
        `${userType === "student" ? "Student" : "Faculty"} created`
      );
      setSingleForm({ department: "", name: "", email: "" });
    } catch (err) {
      Alert.alert.error(err.message);
    } finally {
      setSingleLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSingleForm(prev => ({ ...prev, [key]: value }));
  };

  /* ---------------- Bulk Import ---------------- */

  const handleBulkImport = async (data) => {
    setBulkLoading(true);
    setBulkResult(null);

    try {
      const users = data.map(row => ({
        ...row,
        role_id: userType === "student" ? 1 : 2,
        batch: row.batch ? parseInt(row.batch) : undefined,
      }));

      const res = await apiFetch("/admin/bulk-users", "POST", { users });

      if (res.error) throw new Error(res.error);

      setBulkResult(res.results || res);
      Alert.alert.success(`Created ${res.results?.success || 0} users`);
    } catch (err) {
      Alert.alert.error(err.message);
      setBulkResult({
        success: 0,
        failed: data.length,
        errors: [{ error: err.message }],
      });
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setSubTab("single")}
          style={[styles.tab, subTab === "single" && styles.activeTab]}
        >
          <Text style={subTab === "single" ? styles.activeText : styles.tabText}>
            Add Single User
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSubTab("bulk")}
          style={[styles.tab, subTab === "bulk" && styles.activeTab]}
        >
          <Text style={subTab === "bulk" ? styles.activeText : styles.tabText}>
            Bulk Import
          </Text>
        </Pressable>
      </View>

      {/* ---------------- SINGLE USER ---------------- */}
      {subTab === "single" && (
        <View style={styles.card}>
          <Text style={styles.title}>Create New User</Text>

          {/* User Type Toggle */}
          <View style={styles.toggleRow}>
            <Pressable
              onPress={() => setUserType("student")}
              style={[
                styles.toggleBtn,
                userType === "student" && styles.toggleActive,
              ]}
            >
              <Text
                style={
                  userType === "student"
                    ? styles.toggleTextActive
                    : styles.toggleText
                }
              >
                Student
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setUserType("faculty")}
              style={[
                styles.toggleBtn,
                userType === "faculty" && styles.toggleActive,
              ]}
            >
              <Text
                style={
                  userType === "faculty"
                    ? styles.toggleTextActive
                    : styles.toggleText
                }
              >
                Faculty
              </Text>
            </Pressable>
          </View>

          <TextInput
            placeholder="Full Name"
            value={singleForm.name}
            onChangeText={v => handleChange("name", v)}
            style={styles.input}
          />

          <TextInput
            placeholder="Email"
            value={singleForm.email}
            onChangeText={v => handleChange("email", v)}
            style={styles.input}
            keyboardType="email-address"
          />

          <TextInput
            placeholder="Department (e.g. CSE)"
            value={singleForm.department}
            onChangeText={v => handleChange("department", v)}
            style={styles.input}
          />

          {userType === "student" && (
            <>
              <TextInput
                placeholder="Roll Number"
                value={singleForm.roll_number || ""}
                onChangeText={v => handleChange("roll_number", v)}
                style={styles.input}
              />

              <TextInput
                placeholder="Batch"
                keyboardType="numeric"
                value={singleForm.batch || ""}
                onChangeText={v => handleChange("batch", v)}
                style={styles.input}
              />
            </>
          )}

          {userType === "faculty" && (
            <TextInput
              placeholder="Employee ID"
              value={singleForm.employee_id || ""}
              onChangeText={v => handleChange("employee_id", v)}
              style={styles.input}
            />
          )}

          <Pressable
            onPress={handleSingleSubmit}
            disabled={singleLoading}
            style={[styles.button, singleLoading && styles.disabled]}
          >
            {singleLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create User</Text>
            )}
          </Pressable>
        </View>
      )}

      {/* ---------------- BULK ---------------- */}
      {subTab === "bulk" && (
        <View style={styles.card}>
          <Text style={styles.title}>Bulk Import Users</Text>

          {/* ⚠️ WEB-ONLY COMPONENT */}
          <BulkImportPanel
            expectedFields={expectedFields}
            onImport={handleBulkImport}
            dataType="users"
          />

          {bulkLoading && <ActivityIndicator style={{ marginTop: 16 }} />}

          {bulkResult && (
            <View style={styles.resultBox}>
              <Text style={styles.success}>
                Success: {bulkResult.success || 0}
              </Text>
              <Text style={styles.error}>
                Failed: {bulkResult.failed || 0}
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: { padding: 16 },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    marginBottom: 16,
  },
  tab: { flex: 1, padding: 10, alignItems: "center" },
  activeTab: { backgroundColor: "#fff", borderRadius: 10 },
  tabText: { color: "#6b7280", fontWeight: "600" },
  activeText: { color: "#000", fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 20,
  },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 12 },

  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    marginBottom: 12,
  },
  toggleBtn: { flex: 1, padding: 10, alignItems: "center" },
  toggleActive: { backgroundColor: "#fff", borderRadius: 10 },
  toggleText: { color: "#6b7280", fontWeight: "600" },
  toggleTextActive: { color: "#000", fontWeight: "700" },

  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  disabled: { opacity: 0.5 },

  resultBox: { marginTop: 16 },
  success: { color: "#16a34a", fontWeight: "700" },
  error: { color: "#dc2626", fontWeight: "700" },
});
