import { View, StyleSheet } from "react-native";
import StudentTabs from "../../navigation/StudentTabs.jsx";
import StudentChatbot from "./StudentChatbot.jsx";

export default function StudentDashboard() {
  return (
    <View style={styles.container}>
      <StudentTabs />
      <StudentChatbot />
    </View>
  );
}

// leave some padding at the top of the dashboard
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25, // ← very small top padding
  },
});
