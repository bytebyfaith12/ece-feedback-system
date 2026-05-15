import { isSupabaseConfigured, requireSupabase, supabase } from "@/lib/supabaseClient";
import type { EchoUser } from "@/store/useFeedbackStore";

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
};

function devUser(email: string): EchoUser {
  return {
    id: `dev-${email}`,
    name: email.split("@")[0] || "Admin",
    email,
    role: "Admin",
    loginTime: new Date().toISOString(),
  };
}

export async function signInAdmin(email: string, password: string): Promise<EchoUser> {
  if (!isSupabaseConfigured) {
    if (import.meta.env.PROD) {
      throw new Error("Admin authentication is not configured. Add Supabase auth environment variables in Vercel.");
    }
    if (!email.trim() || !password.trim()) throw new Error("Email and password are required.");
    return devUser(email.trim());
  }

  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error(error?.message ?? "Could not sign in.");

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", data.user.id)
    .single();

  if (profileError) throw new Error(profileError.message);
  const row = profile as ProfileRow;
  if ((row.role ?? "").toLowerCase() !== "admin") {
    await client.auth.signOut();
    throw new Error("This account does not have admin dashboard access.");
  }

  return {
    id: data.user.id,
    name: row.full_name || data.user.email || "Admin",
    email: row.email || data.user.email || email,
    role: "Admin",
    loginTime: new Date().toISOString(),
  };
}

export async function getCurrentAdmin(): Promise<EchoUser | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase.from("profiles").select("id, full_name, email, role").eq("id", data.user.id).single();
  const row = profile as ProfileRow | null;
  if (!row || (row.role ?? "").toLowerCase() !== "admin") return null;
  return {
    id: data.user.id,
    name: row.full_name || data.user.email || "Admin",
    email: row.email || data.user.email || "",
    role: "Admin",
    loginTime: new Date().toISOString(),
  };
}

export async function signOutAdmin() {
  if (supabase) {
    await supabase.auth.signOut();
  }
}
