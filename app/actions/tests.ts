"use server";

/**
 * Server actions for the psychology-tests service.
 *
 * Admin CRUD: tests are JSONB blobs (questions + scoring rules).
 * Subscriber: submitTestResult() inserts a per-attempt result row and
 * runs the scoring rules to produce a `result_summary`.
 */

import { revalidatePath } from "next/cache";
import { verifyAdmin } from "./admin";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canAccessSubscriberContent } from "@/lib/subscription";
import { sendPsychologyTestPublishedEmail } from "@/lib/email/send";
import type { TestQuestion, TestScoringRules } from "@/lib/types";

export type PsychologyTestInput = {
  slug: string;
  title: string;
  description?: string | null;
  cover_image_path?: string | null;
  hero_image_path?: string | null;
  description_image_path?: string | null;
  questions: TestQuestion[];
  scoring_rules: TestScoringRules;
};

export async function createTest(
  input: PsychologyTestInput,
): Promise<{ id?: string; error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("psychology_tests")
      .insert({
        slug: input.slug,
        title: input.title,
        description: input.description ?? null,
        cover_image_path: input.cover_image_path ?? null,
        questions: input.questions,
        scoring_rules: input.scoring_rules,
        is_published: false,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };
    revalidatePath("/admin/tests");
    return { id: data.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function updateTest(
  id: string,
  input: Partial<PsychologyTestInput>,
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();
    const { error } = await admin
      .from("psychology_tests")
      .update(input)
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/tests");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

/** Alias used by admin edit flows. */
export const updatePsychologyTest = updateTest;

export async function deleteTest(id: string): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();
    const { error } = await admin
      .from("psychology_tests")
      .delete()
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/tests");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function toggleTestPublished(
  id: string,
  publish: boolean,
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();

    const patch: Record<string, unknown> = { is_published: publish };
    if (publish) patch.published_at = new Date().toISOString();
    else patch.published_at = null;

    const { error } = await admin
      .from("psychology_tests")
      .update(patch)
      .eq("id", id);
    if (error) return { error: error.message };

    if (publish) {
      await sendPsychologyTestPublishedEmail({ testId: id });
    }

    revalidatePath("/admin/tests");
    revalidatePath("/dashboard/tests");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

// ─── Subscriber: submit a test attempt ──────────────────────────────────────

/**
 * Computes the result for a set of answers using the test's scoring rules.
 * Sum all option values, then map the total into a `result` bucket.
 */
function scoreAnswers(
  questions: TestQuestion[],
  scoringRules: TestScoringRules,
  answers: Record<string, string>,
): { total: number; summary: string | null } {
  let total = 0;
  for (const q of questions) {
    const chosenOptionId = answers[q.id];
    if (!chosenOptionId) continue;
    const opt = q.options.find((o) => o.id === chosenOptionId);
    if (opt) total += opt.value;
  }
  const bucket = scoringRules.ranges.find(
    (r) => total >= r.min && total <= r.max,
  );
  return { total, summary: bucket?.result ?? null };
}

export async function submitTestResult(
  testId: string,
  answers: Record<string, string>,
): Promise<{ resultId?: string; summary?: string | null; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, subscription_status, subscription_expires_at")
      .eq("id", user.id)
      .single();

    if (!canAccessSubscriberContent(profile)) {
      return { error: "Subscription required." };
    }

    const { data: test } = await supabase
      .from("psychology_tests")
      .select("id, questions, scoring_rules, is_published")
      .eq("id", testId)
      .single();

    if (!test || !test.is_published) return { error: "Test not found." };

    const { total, summary } = scoreAnswers(
      test.questions as TestQuestion[],
      test.scoring_rules as TestScoringRules,
      answers,
    );

    const { data: row, error } = await supabase
      .from("test_results")
      .insert({
        user_id: user.id,
        test_id: testId,
        answers,
        result_summary: summary,
        score: { value: total },
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    revalidatePath(`/dashboard/tests`);
    revalidatePath(`/tests`);
    return { resultId: row.id, summary };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

/** Alias for client code — identical to `submitTestResult`. */
export async function submitTestAnswers(
  testId: string,
  answers: Record<string, string>,
): Promise<{ resultId?: string; summary?: string | null; error?: string }> {
  return submitTestResult(testId, answers);
}
