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
  const getUrl = (p: string | null | undefined) =>
    p ? supabase.storage.from("media-thumbnails").getPublicUrl(p).data.publicUrl : null;

  const cover = "cover_image_path" in lesson ? lesson.cover_image_path : null;
  const hero = "hero_image_path" in lesson ? lesson.hero_image_path : null;
  const descImg = "description_image_path" in lesson ? lesson.description_image_path : null;

  return (
    <LessonPlayer
      title={lesson.title}
      streamUrl={streamUrl}
      posterUrl={getUrl(cover)}
      heroImageUrl={getUrl(hero)}
      descriptionImageUrl={getUrl(descImg)}
      descriptionMd={lesson.description}
    />
  );
}
