import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
// import Alert.alert from "react-hot-Alert.alert";

export default function BulkImportPanel({
  onPreview,
  onImport,
  expectedFields,
  dataType,
}) {
  const [importMethod, setImportMethod] = useState("csv");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ---------- Parsers ---------- */

  const parseCSV = (text) => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      if (!values[0]) continue;

      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || "";
      });
      rows.push(row);
    }
    return rows;
  };

  /* ---------- File Pickers ---------- */

  const pickCSV = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: "text/csv",
      copyToCacheDirectory: true,
    });

    if (res.canceled) return;

    try {
      const text = await FileSystem.readAsStringAsync(res.assets[0].uri);
      const data = parseCSV(text);

      if (!data.length) {
        Alert.alert.error("No valid data in CSV");
        return;
      }

      setPreview({ data, method: "CSV" });
      Alert.alert.success(`Parsed ${data.length} rows`);
    } catch (err) {
      Alert.alert.error("CSV parse error: " + err.message);
    }
  };

  const pickJSON = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    if (res.canceled) return;

    try {
      const text = await FileSystem.readAsStringAsync(res.assets[0].uri);
      const json = JSON.parse(text);
      const data = Array.isArray(json) ? json : [json];

      if (!data.length) {
        Alert.alert.error("No data in JSON");
        return;
      }

      setPreview({ data, method: "JSON" });
      Alert.alert.success(`Parsed ${data.length} records`);
    } catch (err) {
      Alert.alert.error("JSON parse error: " + err.message);
    }
  };

  /* ---------- Import ---------- */

  const handleImport = async () => {
    if (!preview) return Alert.alert.error("No data to import");

    setLoading(true);
    try {
      await onImport(preview.data);
      setPreview(null);
    } catch (err) {
      Alert.alert.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Method Switch */}
      <View style={styles.switchRow}>
        <Pressable
          onPress={() => setImportMethod("csv")}
          style={[
            styles.switchBtn,
            importMethod === "csv" && styles.activeBtn,
          ]}
        >
          <Text style={styles.switchText}>CSV</Text>
        </Pressable>
        <Pressable
          onPress={() => setImportMethod("json")}
          style={[
            styles.switchBtn,
            importMethod === "json" && styles.activeBtn,
          ]}
        >
          <Text style={styles.switchText}>JSON</Text>
        </Pressable>
      </View>

      {/* Upload */}
      <Pressable
        onPress={importMethod === "csv" ? pickCSV : pickJSON}
        style={styles.uploadBox}
      >
        <Text style={styles.uploadTitle}>
          Tap to upload {importMethod.toUpperCase()}
        </Text>
        <Text style={styles.uploadHint}>
          Expected fields: {expectedFields.join(", ")}
        </Text>
      </Pressable>

      {/* Import Button */}
      {preview && (
        <Pressable
          onPress={handleImport}
          disabled={loading}
          style={styles.importBtn}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.importText}>
              Import {preview.data.length} Records
            </Text>
          )}
        </Pressable>
      )}

      {/* Preview */}
      {!preview ? (
        <View style={styles.emptyPreview}>
          <Text style={styles.emptyText}>No preview available</Text>
        </View>
      ) : (
        <View style={styles.previewBox}>
          <Text style={styles.previewTitle}>
            Preview ({preview.data.length})
          </Text>

          {preview.data.slice(0, 10).map((row, idx) => (
            <View key={idx} style={styles.previewCard}>
              {Object.entries(row).map(([k, v]) => (
                <Text key={k} style={styles.previewRow}>
                  <Text style={styles.key}>{k}: </Text>
                  {String(v)}
                </Text>
              ))}
            </View>
          ))}

          {preview.data.length > 10 && (
            <Text style={styles.more}>
              + {preview.data.length - 10} more records
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  switchRow: {
    flexDirection: "row",
    backgroundColor: "#eee",
    borderRadius: 12,
    marginBottom: 16,
  },
  switchBtn: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },
  activeBtn: {
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  switchText: {
    fontWeight: "700",
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#aaa",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  uploadHint: {
    fontSize: 12,
    color: "#555",
    marginTop: 6,
    textAlign: "center",
  },
  importBtn: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  importText: {
    color: "#fff",
    fontWeight: "700",
  },
  emptyPreview: {
    padding: 20,
    borderRadius: 14,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  emptyText: {
    color: "#777",
  },
  previewBox: {
    backgroundColor: "#e0f2fe",
    padding: 12,
    borderRadius: 14,
  },
  previewTitle: {
    fontWeight: "700",
    marginBottom: 8,
    color: "#075985",
  },
  previewCard: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  previewRow: {
    fontSize: 12,
    marginBottom: 2,
  },
  key: {
    fontWeight: "700",
  },
  more: {
    fontSize: 12,
    textAlign: "center",
    color: "#0369a1",
    marginTop: 6,
  },
});
