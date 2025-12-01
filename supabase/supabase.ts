import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 🔍 Debug: Check if environment variables are loaded
console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("Supabase key loaded:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
