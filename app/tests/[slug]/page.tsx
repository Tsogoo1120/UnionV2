import { TestRunner } from "@/components/tests/TestRunner";
import { requireActive } from "@/lib/auth/requireSession";
import { getTestBySlug } from "@/lib/queries/tests";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function TestPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();
  await requireActive();

  const test = await getTestBySlug(supabase, params.slug);
  if (!test) {
    redirect("/status/inactive");
  }

  return (
    <TestRunner
      testId={test.id}
      slug={test.slug}
      title={test.title}
      description={test.description}
      questions={test.questions}
    />
  );
}
