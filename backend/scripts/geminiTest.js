import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY missing in .env");
  process.exit(1);
}

async function testGemini() {
  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: "In one sentence, explain what CGPA means."
                }
              ]
            }
          ]
        })
      }
    );

    const json = await res.json();

    if (!json.candidates || json.candidates.length === 0) {
      console.error("❌ Gemini returned no candidates:", json);
      return;
    }

    const answer = json.candidates[0].content.parts[0].text;
    console.log("\n✅ GEMINI RESPONSE:\n");
    console.log(answer);
  } catch (err) {
    console.error("❌ GEMINI FAILED:\n", err);
  }
}

testGemini();
