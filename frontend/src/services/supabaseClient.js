import { createClient } from "@supabase/supabase-js";

// const { data } = await supabase.from("users").select("*");
// console.log(data);

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
