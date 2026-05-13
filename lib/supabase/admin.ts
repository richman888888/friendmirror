import "server-only";

import { createClient } from "@supabase/supabase-js";

import { isSupabaseServiceConfigured } from "@/lib/supabase/config";
import { normalizeSupabaseUrl, type Database } from "@/lib/supabase";

export type ServiceSupabaseClient = ReturnType<typeof createServiceClient>;

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url?.trim() || !key?.trim()) {
    throw new Error("Supabase service client: missing URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient<Database>(normalizeSupabaseUrl(url), key.trim(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function tryCreateServiceClient(): ServiceSupabaseClient | null {
  if (!isSupabaseServiceConfigured()) return null;
  return createServiceClient();
}
