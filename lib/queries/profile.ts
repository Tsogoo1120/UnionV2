import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { getEffectiveStatus } from "@/lib/auth/getEffectiveStatus";

export type CurrentProfile = Pick<
  Profile,
  | "id"
  | "email"
  | "full_name"
  | "phone"
  | "avatar_url"
  | "role"
  | "subscription_status"
  | "subscription_expires_at"
>;

export async function getCurrentProfile(
  supabase: SupabaseClient,
): Promise<CurrentProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, phone, avatar_url, role, subscription_status, subscription_expires_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export { getEffectiveStatus };
