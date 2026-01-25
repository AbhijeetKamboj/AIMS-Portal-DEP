import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { apiFetch } from "../../services/api";

export default function Transcript() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await apiFetch("/student/transcript");
      if (!res?.error) {
        setData(res);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!data?.semesters || data.semesters.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.empty}>No transcript data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Transcript</Text>

      {data.semesters.map((sem, i) => (
        <View key={i} style={styles.semesterCard}>
          <Text style={styles.semTitle}>{sem.semester_name}</Text>

          {sem.courses.map((c, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.course}>
                {c.code} – {c.name}
              </Text>
              <Text style={styles.grade}>{c.grade || "-"}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9fafb",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
  },
  empty: {
    textAlign: "center",
    color: "#6b7280",
  },
  semesterCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  semTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingVertical: 8,
  },
  course: {
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  grade: {
    fontWeight: "bold",
  },
});
