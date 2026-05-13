import { createBrowserClient, createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { isSupabaseAnonConfigured } from "@/lib/supabase/config";

/**
 * Supabase clients expect the **project URL only** (e.g. https://xyz.supabase.co).
 * Common misconfiguration: pasting the REST or Storage endpoint — that breaks
 * request URL construction and can surface as "Invalid path specified in request URL".
 */
export function normalizeSupabaseUrl(raw: string): string {
  let u = raw.trim().replace(/\/+$/, "");
  u = u.replace(/\/(rest|storage|auth)\/v1\/?$/i, "");
  return u.replace(/\/+$/, "");
}

/** JSON column / metadata shape used by Supabase helpers. */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string;
          avatar_url: string | null;
          share_code: string;
          referred_by: string | null;
          invite_count: number;
          signup_share_source: string | null;
          plan: string;
          payment_status: string;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nickname: string;
          avatar_url?: string | null;
          share_code: string;
          referred_by?: string | null;
          invite_count?: number;
          signup_share_source?: string | null;
          plan?: string;
          payment_status?: string;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nickname?: string;
          avatar_url?: string | null;
          share_code?: string;
          referred_by?: string | null;
          invite_count?: number;
          signup_share_source?: string | null;
          plan?: string;
          payment_status?: string;
          paid_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      votes: {
        Row: {
          id: string;
          profile_id: string;
          tag: string;
          voter_fingerprint: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          tag: string;
          voter_fingerprint: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          tag?: string;
          voter_fingerprint?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "votes_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          id: string;
          event_name: string;
          profile_id: string | null;
          ref_share_code: string | null;
          share_source: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_name: string;
          profile_id?: string | null;
          ref_share_code?: string | null;
          share_source?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_name?: string;
          profile_id?: string | null;
          ref_share_code?: string | null;
          share_source?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          profile_id: string;
          provider: string;
          amount: number;
          currency: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          provider: string;
          amount: number;
          currency: string;
          status: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          provider?: string;
          amount?: number;
          currency?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      replace_votes_for_share: {
        Args: {
          p_share_code: string;
          p_fingerprint: string;
          p_tags: string[];
        };
        Returns: undefined;
      };
      fetch_vote_tag_counts: {
        Args: { p_share_code: string };
        Returns: { tag: string; cnt: number }[];
      };
      fetch_public_engagement: {
        Args: Record<string, never>;
        Returns: { profile_count: number; vote_count: number }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type TypedSupabaseClient = SupabaseClient<Database>;

export function isSupabaseConfigured(): boolean {
  return isSupabaseAnonConfigured();
}

/** Browser / Client Components — anon key only. */
export function createBrowserSupabase(): TypedSupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();
  return createBrowserClient<Database>(url, anonKey);
}

/**
 * Server Components, Route Handlers, and Server Actions (App Router).
 * Uses the Next.js cookie store so auth sessions can be wired in later.
 */
export async function createServerSupabase(): Promise<TypedSupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;
  const [{ cookies }, { createServerClient }] = await Promise.all([
    import("next/headers"),
    import("@supabase/ssr"),
  ]);
  const cookieStore = await cookies();
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();
  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(nextCookies) {
        try {
          nextCookies.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* ignore when invoked from a Server Component without mutable cookies */
        }
      },
    },
  });
}

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type VoteRow = Database["public"]["Tables"]["votes"]["Row"];
