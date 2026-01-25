import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";

export default function Navbar({ title }) {
  const navigation = useNavigation();
  const { session, role } = useAuth();

  const userName =
    role === "admin"
      ? "Admin"
      : session?.user?.user_metadata?.name || "User";

  const logout = async () => {
    await supabase.auth.signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>A</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.right}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.role}>
            {role ? role.charAt(0).toUpperCase() + role.slice(1) : "User"}
          </Text>
        </View>

        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    paddingTop: 48, // status bar safe
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 6,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    color: "#fff",
    fontWeight: "800",
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  userInfo: {
    alignItems: "flex-end",
  },

  userName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  role: {
    fontSize: 11,
    color: "#9ca3af",
  },

  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  logoutText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
