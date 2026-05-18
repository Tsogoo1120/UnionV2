import type { SupabaseClient } from "@supabase/supabase-js";
import { listPublishedArticles } from "./articles";
import { listFeed } from "./community";
import { listPublishedLessons } from "./lessons";
import { listPublishedTests } from "./tests";
import type {
  Article,
  CollectiveReading,
  CommunityPost,
  PsychologyTest,
  VideoLesson,
} from "@/lib/types";

export type ServiceId =
  | "lessons"
  | "readings"
  | "community"
  | "tests"
  | "articles";

export type ServicePreviewItem = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
};

const PREVIEW_LIMIT = 3;

function publicUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string | null,
): string | null {
  if (!path) return null;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl ?? null;
}

function truncate(text: string | null, max = 140): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

async function safeFetch(
  loader: () => Promise<ServicePreviewItem[]>,
): Promise<ServicePreviewItem[]> {
  try {
    const items = await loader();
    return items.slice(0, PREVIEW_LIMIT);
  } catch {
    return [];
  }
}

export async function getServicePreviews(
  supabase: SupabaseClient,
): Promise<Record<ServiceId, ServicePreviewItem[]>> {
  const [lessons, readings, community, tests, articles] = await Promise.all([
    safeFetch(async () => {
      const rows = (await listPublishedLessons(supabase, "video", {
        limit: PREVIEW_LIMIT,
      })) as VideoLesson[];
      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        description: truncate(r.description),
        imageUrl: publicUrl(supabase, "media-thumbnails", r.thumbnail_path),
      }));
    }),
    safeFetch(async () => {
      const rows = (await listPublishedLessons(supabase, "collective", {
        limit: PREVIEW_LIMIT,
      })) as CollectiveReading[];
      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        description: truncate(r.description),
        imageUrl: publicUrl(supabase, "media-thumbnails", r.cover_image_path),
      }));
    }),
    safeFetch(async () => {
      const rows: CommunityPost[] = await listFeed(supabase, {
        limit: PREVIEW_LIMIT,
      });
      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        description: truncate(r.body),
        imageUrl: publicUrl(supabase, "community-images", r.image_path),
      }));
    }),
    safeFetch(async () => {
      const rows: PsychologyTest[] = await listPublishedTests(supabase, {
        limit: PREVIEW_LIMIT,
      });
      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        description: truncate(r.description),
        imageUrl: publicUrl(supabase, "media-thumbnails", r.cover_image_path),
      }));
    }),
    safeFetch(async () => {
      const rows: Article[] = await listPublishedArticles(supabase, {
        limit: PREVIEW_LIMIT,
      });
      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        description: truncate(r.excerpt),
        imageUrl: publicUrl(supabase, "media-thumbnails", r.cover_image_path),
      }));
    }),
  ]);

  return { lessons, readings, community, tests, articles };
}
