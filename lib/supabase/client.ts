import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://owkaxsvxjiqdznenhncr.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93a2F4c3Z4amlxZHpuZW5obmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MzEyMzQsImV4cCI6MjEwMjIwNzIzNH0.8CRZfsknRsZGYidHI0f5DBpek-hpypQF2XFP8HPeDRk";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  return createBrowserClient(url, anonKey);
}
