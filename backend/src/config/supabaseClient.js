import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
console.log("USING SERVICE ROLE:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20));
 