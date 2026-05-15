"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { onboardingFormClientSchema } from "@/lib/validation/client-forms";

export async function submitOnboarding(
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const parsed = onboardingFormClientSchema.safeParse({
    full_name: String(formData.get("full_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Мэдээллээ шалгана уу.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/auth/onboarding");
  revalidatePath("/payment");
  revalidatePath("/dashboard");
  return {};
}
