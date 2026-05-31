import { LessonPlayer } from "@/components/lessons/LessonPlayer";
import { requireActive } from "@/lib/auth/requireSession";
import { getLessonBySlug } from "@/lib/queries/lessons";
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

  const getUrl = (p: string | null) =>
    p ? supabase.storage.from("media-thumbnails").getPublicUrl(p).data.publicUrl : null;

  return (
    <LessonPlayer
      title={lesson.title}
      lessonId={lesson.id}
      kind="video"
      posterUrl={getUrl(lesson.thumbnail_path)}
      heroImageUrl={getUrl(lesson.hero_image_path)}
      descriptionImageUrl={getUrl(lesson.description_image_path)}
      descriptionMd={lesson.description}
    />
  );
}
