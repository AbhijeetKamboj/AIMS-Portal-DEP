import { useState } from "react";
import { apiFetch } from "../../services/api";
import { FiSend } from "react-icons/fi";
import { FaRobot } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";

export default function StudentChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
        {
          sender: "bot",
          text: res?.answer || "No response available.",
        },
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
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-80 h-96 bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-2 text-gray-800 font-medium">
                <FaRobot className="text-gray-700" />
                Academic Assistant
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <MdClose />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 px-3 py-2 overflow-y-auto space-y-2 text-sm">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-md max-w-[75%] leading-relaxed ${
                      m.sender === "user"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="text-gray-400 text-xs">Assistant is typing…</div>
              )}
            </div>

            {/* Input */}
            <div className="border-t px-3 py-2 flex gap-2 bg-white">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Ask about rules, credits, attendance…"
              />
              <button
                onClick={sendMessage}
                className="bg-black text-white px-3 py-2 rounded-md hover:bg-gray-800"
              >
                <FiSend size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800"
        aria-label="Open Chatbot"
      >
        <FaRobot size={22} />
      </button>
    </div> 
  );
}
