import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

/**
 * Explicitly load .env for ESM
 */
dotenv.config({
  path: new URL("../.env", import.meta.url),
});

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL missing in backend/.env");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY missing in backend/.env");
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
