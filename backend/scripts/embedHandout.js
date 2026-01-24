import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const EMBEDDING_MODEL = "models/text-embedding-004";

async function embedText(text) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${EMBEDDING_MODEL}:embedContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: { parts: [{ text }] }
      })
    }
  );

  const json = await res.json();
  return json.embedding.values;
}

async function run() {
  const { data: chunks, error } = await supabase
    .from("handout_chunks")
    .select("id, content")
    .is("embedding", null);

  if (error) throw error;

  console.log(`Embedding ${chunks.length} chunks...`);

  for (const chunk of chunks) {
    const embedding = await embedText(chunk.content);

    await supabase
      .from("handout_chunks")
      .update({ embedding })
      .eq("id", chunk.id);
  }

  console.log("✅ Embeddings complete");
}

run().catch(console.error);
