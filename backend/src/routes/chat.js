import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { supabaseAdmin } from "../config/supabaseAdmin.js";

const router = express.Router();

/* ================= GEMINI ================= */

async function askGemini(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  const json = await res.json();

  console.log("🤖 Gemini raw response:", JSON.stringify(json, null, 2));

  if (!json.candidates || !json.candidates.length) {
    return "No answer found in the handbook.";
  }

  return json.candidates[0].content.parts[0].text;
}

/* ================= ROUTE ================= */

router.post("/ask", authMiddleware, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Question required" });
    }

    /* 1️⃣ Fetch handbook text */
    const { data, error } = await supabaseAdmin
      .from("handout_chunks")
      .select("content")
      .limit(320); // enough context

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return res.json({
        question,
        answer: "Handbook data not available."
      });
    }

    /* 2️⃣ Build context */
    const context = data.map(d => d.content).join("\n\n");

    const prompt = `
You are an academic assistant for IIT Ropar students.

Answer ONLY using the handbook text below.
If the answer is not present, reply:
"Not specified in the handbook."

HANDBOOK:
${context}

QUESTION:
${question}
`;

    /* 3️⃣ Ask Gemini */
    const answer = await askGemini(prompt);

    return res.json({ question, answer });

  } catch (err) {
    console.error("🔥 CHAT ERROR:", err);
    return res.status(500).json({
      error: "Chat request failed",
      details: err.message
    });
  }
});

export default router;
