import { LessonPlayer } from "@/components/lessons/LessonPlayer";
import { requireActive } from "@/lib/auth/requireSession";
import { getLessonBySlug, getLessonStreamUrl } from "@/lib/queries/lessons";
import { createClient } from "@/lib/supabase/server";
import type { VideoLesson } from "@/lib/types";
import { redirect } from "next/navigation";

export default async function LessonPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();
  await requireActive();

  const lessonRow = await getLessonBySlug(supabase, params.slug, "video");
  if (!lessonRow) {
    redirect("/status/inactive");
  }
  const lesson = lessonRow as VideoLesson;

  const streamUrl = await getLessonStreamUrl(supabase, lesson.id, "video");
  const posterUrl = lesson.thumbnail_path
    ? supabase.storage.from("media-thumbnails").getPublicUrl(lesson.thumbnail_path).data.publicUrl
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
