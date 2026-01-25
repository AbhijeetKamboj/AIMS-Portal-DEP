import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { apiFetch } from "../../services/api";
// import Alert.alert from "react-hot-Alert.alert";

export default function OfferCourse() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [offeredIds, setOfferedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    course_id: "",
    semester_id: "",
    offering_dept_id: "",
    allowed_dept_ids: [],
    slot: "",
  });

  useEffect(() => {
    apiFetch("/courses/list").then(r => !r.error && setCourses(r));
    apiFetch("/departments/list").then(r => !r.error && setDepartments(r));
    apiFetch("/courses/semesters").then(r => !r.error && setSemesters(r));
  }, []);

  useEffect(() => {
    if (form.semester_id) {
      apiFetch(`/courses/offered-courses?semester_id=${form.semester_id}`)
        .then(r => Array.isArray(r) && setOfferedIds(r));
    }
  }, [form.semester_id]);

  const availableCourses = courses.filter(c => !offeredIds.includes(c.id));

  const toggleDept = (id) => {
    setForm(prev => ({
      ...prev,
      allowed_dept_ids: prev.allowed_dept_ids.includes(id)
        ? prev.allowed_dept_ids.filter(d => d !== id)
        : [...prev.allowed_dept_ids, id],
    }));
  };

  const submit = async () => {
    if (!form.course_id || !form.semester_id || !form.offering_dept_id) {
      Alert.alert.error("Select semester, department, and course");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/courses/offer", "POST", {
        ...form,
        course_id: +form.course_id,
        semester_id: +form.semester_id,
        offering_dept_id: +form.offering_dept_id,
      });

      if (res.error) throw new Error(res.error);

      Alert.alert.success("Course offered (Pending Approval)");
      setForm(p => ({ ...p, course_id: "", allowed_dept_ids: [] }));
    } catch (err) {
      Alert.alert.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Offer New Course</Text>

      {/* Semester */}
      <Text style={styles.label}>Target Semester</Text>
      <Picker
        selectedValue={form.semester_id}
        onValueChange={v =>
          setForm({ ...form, semester_id: v, course_id: "" })
        }
        style={styles.picker}
      >
        <Picker.Item label="Select semester..." value="" />
        {semesters.map(s => (
          <Picker.Item
            key={s.id}
            label={`${s.name} (${s.start_date})`}
            value={s.id}
          />
        ))}
      </Picker>

      {/* Department */}
      <Text style={styles.label}>Offering Department</Text>
      <Picker
        selectedValue={form.offering_dept_id}
        onValueChange={v => setForm({ ...form, offering_dept_id: v })}
        style={styles.picker}
      >
        <Picker.Item label="Select department..." value="" />
        {departments.map(d => (
          <Picker.Item key={d.id} label={`${d.code} - ${d.name}`} value={d.id} />
        ))}
      </Picker>

      {/* Course */}
      <Text style={styles.label}>Course</Text>
      <Picker
        enabled={!!form.semester_id}
        selectedValue={form.course_id}
        onValueChange={v => setForm({ ...form, course_id: v })}
        style={[styles.picker, !form.semester_id && styles.disabled]}
      >
        <Picker.Item
          label={form.semester_id ? "Select course..." : "Select semester first"}
          value=""
        />
        {availableCourses.map(c => (
          <Picker.Item
            key={c.id}
            label={`${c.course_code}: ${c.course_name}`}
            value={c.id}
          />
        ))}
      </Picker>

      {/* Slot */}
      <Text style={styles.label}>Time Slot</Text>
      <TextInput
        value={form.slot}
        onChangeText={t => setForm({ ...form, slot: t })}
        placeholder="e.g. A, Mon 10–11"
        style={styles.input}
      />

      {/* ACL */}
      <View style={styles.aclHeader}>
        <Text style={styles.label}>Allowed Departments</Text>
        <Pressable
          onPress={() =>
            setForm(p => ({
              ...p,
              allowed_dept_ids: departments.map(d => d.id),
            }))
          }
        >
          <Text style={styles.link}>Select All</Text>
        </Pressable>
      </View>

      <View style={styles.aclBox}>
        {departments.map(d => {
          const selected = form.allowed_dept_ids.includes(d.id);
          return (
            <Pressable
              key={d.id}
              onPress={() => toggleDept(d.id)}
              style={[
                styles.deptChip,
                selected && styles.deptChipActive,
              ]}
            >
              <Text
                style={[
                  styles.deptText,
                  selected && styles.deptTextActive,
                ]}
              >
                {d.code}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Submit */}
      <Pressable
        onPress={submit}
        disabled={loading}
        style={styles.submit}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Submit Offering</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },

  label: { fontSize: 14, fontWeight: "600", marginTop: 14, marginBottom: 6 },

  picker: {
    backgroundColor: "#f4f4f4",
    borderRadius: 10,
  },
  disabled: { opacity: 0.5 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },

  aclHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  link: { color: "#007AFF", fontWeight: "600" },

  aclBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  deptChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  deptChipActive: {
    backgroundColor: "#000",
  },
  deptText: { fontSize: 13, fontWeight: "600", color: "#444" },
  deptTextActive: { color: "#fff" },

  submit: {
    marginTop: 28,
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
