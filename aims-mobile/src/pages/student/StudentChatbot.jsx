import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Animated,
  PanResponder,
} from "react-native";
import { apiFetch } from "../../services/api";

export default function StudentChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- DRAG STATE ---------------- */
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, // 👈 allow tap
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5, // 👈 drag only
  
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
  
      onPanResponderRelease: () => {
        pan.extractOffset();
      },
    })
  ).current;
  
  /* ---------------- CHAT LOGIC ---------------- */

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiFetch("/chat/ask", "POST", {
        question: userMsg.text,
      });

      setMessages((m) => [
        ...m,
        { sender: "bot", text: res?.answer || "No response available." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { sender: "bot", text: "Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🟢 DRAGGABLE FLOATING BUTTON */}
      <Animated.View
        style={[
          styles.fab,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable onPress={() => setIsOpen(true)}>
          <Text style={styles.fabText}>🤖</Text>
        </Pressable>
      </Animated.View>

      {/* Chat Modal */}
      <Modal visible={isOpen} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.chatBox}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerText}>Academic Assistant</Text>
              <Pressable onPress={() => setIsOpen(false)}>
                <Text style={styles.close}>✕</Text>
              </Pressable>
            </View>

            {/* Messages */}
            <ScrollView style={styles.messages}>
              {messages.map((m, i) => (
                <View
                  key={i}
                  style={[
                    styles.msgBubble,
                    m.sender === "user"
                      ? styles.userMsg
                      : styles.botMsg,
                  ]}
                >
                  <Text style={{ color: m.sender === "user" ? "#fff" : "#000" }}>
                    {m.text}
                  </Text>
                </View>
              ))}

              {loading && (
                <View style={styles.loading}>
                  <ActivityIndicator size="small" />
                  <Text style={styles.typing}>Assistant is typing…</Text>
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputRow}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask about rules, credits, attendance…"
                style={styles.input}
                onSubmitEditing={sendMessage}
              />
              <Pressable style={styles.sendBtn} onPress={sendMessage}>
                <Text style={styles.sendText}>Send</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#000",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    zIndex: 999,
  },
  fabText: { color: "#fff", fontSize: 24 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  chatBox: {
    backgroundColor: "#fff",
    height: "70%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  headerText: { fontSize: 16, fontWeight: "bold" },
  close: { fontSize: 18, color: "#666" },

  messages: { flex: 1, padding: 12 },

  msgBubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#000",
  },
  botMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
  },

  loading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typing: { fontSize: 11, color: "#6b7280" },

  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  sendBtn: {
    backgroundColor: "#000",
    marginLeft: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontWeight: "bold" },
});
