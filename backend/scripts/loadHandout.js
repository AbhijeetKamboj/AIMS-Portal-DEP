import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

dotenv.config();

/* ================= PATH SETUP ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= SUPABASE CLIENT ================= */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

/* ================= TEXT CHUNKING ================= */
const CHUNK_SIZE = 800;

function chunkText(text) {
  const chunks = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}

/* ================= LOAD HANDOUT ================= */
async function load() {
  try {
    const pdfPath = path.join(__dirname, "../data/course_handout.pdf");

    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF not found at ${pdfPath}`);
    }

    // IMPORTANT: pdfjs requires Uint8Array, NOT Buffer
    const data = new Uint8Array(fs.readFileSync(pdfPath));

    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;

    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(" ");
      fullText += pageText + "\n";
    }

    const chunks = chunkText(fullText);

    for (const chunk of chunks) {
      await supabase.from("handout_chunks").insert({ content: chunk });
    }

    console.log(`✅ Loaded ${chunks.length} chunks into Supabase`);
  } catch (err) {
    console.error("❌ Failed to load handout:", err.message);
    process.exit(1);
  }
}

load();
