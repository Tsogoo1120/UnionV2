import { redirect } from "next/navigation";
import { LessonPlayer } from "@/components/lessons/LessonPlayer";
import { requireActive } from "@/lib/auth/requireSession";
import { getLessonBySlug, getLessonStreamUrl } from "@/lib/queries/lessons";
import { createClient } from "@/lib/supabase/server";

export default async function ReadingLessonPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();
  await requireActive();

  const lesson = await getLessonBySlug(supabase, params.slug, "collective");
  if (!lesson) {
    redirect("/status/inactive");
  }

  const streamUrl = await getLessonStreamUrl(supabase, lesson.id, "collective");
  const posterUrl =
    "cover_image_path" in lesson && lesson.cover_image_path
      ? supabase.storage.from("media-thumbnails").getPublicUrl(lesson.cover_image_path).data.publicUrl
      : null;

  return (
    <LessonPlayer
      title={lesson.title}
      streamUrl={streamUrl}
      posterUrl={posterUrl}
      descriptionMd={lesson.description}
    />
  );
}
