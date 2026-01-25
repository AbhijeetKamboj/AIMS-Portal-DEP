import { View, Text, StyleSheet } from "react-native";
import { FileText } from "lucide-react-native";

export default function StudentDocuments() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Documents</Text>

      <View style={styles.emptyCard}>
        <View style={styles.iconWrapper}>
          <FileText size={32} color="#d1d5db" />
        </View>

        <Text style={styles.heading}>No Documents Available</Text>

        <Text style={styles.description}>
          Check back later for course materials, transcripts, and administrative documents.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },

  emptyCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },

  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
    textAlign: "center",
  },

  description: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
  },
});
