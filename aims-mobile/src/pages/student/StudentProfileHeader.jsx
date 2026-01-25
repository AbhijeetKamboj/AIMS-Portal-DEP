import { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { apiFetch } from "../../services/api";

export default function StudentProfileHeader() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await apiFetch("/student/transcript");
      if (!res?.error) {
        setProfile(res);
      }
    }
    load();
  }, []);

  if (!profile) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  const user = profile.student_info || {};
  const initial = (user.name || "A")[0].toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {user.name || "Student Name"}
          </Text>

          <Text style={styles.sub}>
            {user.roll_number || "Roll Number"} ·{" "}
            {user.department || "Department"}
          </Text>

          {/* Details */}
          <View style={styles.infoBlock}>
            <Info label="Email" value={user.email || "email@example.com"} />
            <Info label="Degree" value="B.Tech" />
            <Info label="Year of Entry" value={user.batch || "2023"} />
            <Info label="Status" value="Registered" badge />
          </View>
        </View>
      </View>
    </View>
  );
}

/* -------- Small helper component -------- */

function Info({ label, value, badge }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.label}>{label}</Text>
      {badge ? (
        <Text style={styles.badge}>{value}</Text>
      ) : (
        <Text style={styles.value}>{value}</Text>
      )}
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  sub: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 10,
  },
  infoBlock: {
    marginTop: 6,
  },
  label: {
    fontSize: 11,
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: "#111827",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#dcfce7",
    color: "#166534",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "bold",
  },
});
