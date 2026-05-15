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
  fallback?: true;
};

const PREVIEW_LIMIT = 3;

const FALLBACKS: Record<ServiceId, ServicePreviewItem[]> = {
  lessons: [
    {
      id: "fallback-lessons-1",
      title: "Өглөөний зуршил",
      description: "Өдрийн архитектураа тэнцвэртэй эхлүүлэх энгийн дасгалууд",
      imageUrl: null,
      fallback: true,
    },
    {
      id: "fallback-lessons-2",
      title: "Анхаарал төвлөрөл",
      description: "Сурлага, ажил, харилцаандаа төвлөрөх дасгалын цуврал",
      imageUrl: null,
      fallback: true,
    },
    {
      id: "fallback-lessons-3",
      title: "Сэтгэлийн тэнхээ",
      description: "Дотоод тэвчээр, тэнцвэрийг бэхжүүлэх 7 хоногийн хичээл",
      imageUrl: null,
      fallback: true,
    },
  ],
  readings: [
    {
      id: "fallback-readings-1",
      title: "7 хоногийн уншлага",
      description: "Энэ долоо хоногийн ерөнхий энергийн чиглэл",
      imageUrl: null,
      fallback: true,
    },
    {
      id: "fallback-readings-2",
      title: "Сарын тойм",
      description: "Сар тутмын тарот тойм — анхаарах сэдвүүд",
      imageUrl: null,
      fallback: true,
    },
    {
      id: "fallback-readings-3",
      title: "Хайр харилцаа",
      description: "Хайр, харилцааны хүрээний коллектив уншлага",
      imageUrl: null,
      fallback: true,
    },
  ],
  community: [
    {
      id: "fallback-community-1",
      title: "Эхний алхам",
      description: "Гишүүд өөрийн туршлагаа хуваалцаж эхэлж байна",
      imageUrl: null,
      fallback: true,
    },
    {
      id: "fallback-community-2",
      title: "Долоо хоногийн тойм",
      description: "Олон нийтийн дунд хуваалцагдсан сэдвүүд",
      imageUrl: null,
      fallback: true,
    },
    {
      id: "fallback-community-3",
      title: "Хариулт ба дэмжлэг",
      description: "Бусдын асуултанд хариулж, дэмжлэг үзүүлэх орон зай",
      imageUrl: null,
      fallback: true,
    },
  ],
  tests: [
    {
      id: "fallback-tests-1",
      title: "Хувийн зан төлөв",
      description: "Өөрийнхөө зан төлөвийг танихад чиглэсэн тест",
      imageUrl: null,
      fallback: true,
    },
    {
      id: "fallback-tests-2",
      title: "Стресс хэмжүүр",
      description: "Одоогийн стресс түвшнээ үнэлэх богино тест",
      imageUrl: null,
      fallback: true,
    },
    {
      id: "fallback-tests-3",
      title: "Сэтгэл санааны төлөв",
      description: "Сэтгэл санааны өнөөгийн төлөвийг шинжлэх тест",
      imageUrl: null,
      fallback: true,
    },
  ],
  articles: [
    {
      id: "fallback-articles-1",
      title: "Зорилго ба тэвчээр",
      description: "Урт хугацааны зорилгод хүрэх замын тухай эссэ",
      imageUrl: null,
      fallback: true,
    },
    {
      id: "fallback-articles-2",
      title: "Өглөөний 20 минут",
      description: "Өдрийн архитектурын тухай товч нийтлэл",
      imageUrl: null,
      fallback: true,
    },
    {
      id: "fallback-articles-3",
      title: "Мэдрэлийн систем ба амьсгал",
      description: "Уур уцаар, амьсгалын дасгалын тухай судалгаа",
      imageUrl: null,
      fallback: true,
    },
  ],
};

function padWithFallback(
  serviceId: ServiceId,
  items: ServicePreviewItem[],
): ServicePreviewItem[] {
  if (items.length >= PREVIEW_LIMIT) return items.slice(0, PREVIEW_LIMIT);
  const need = PREVIEW_LIMIT - items.length;
  return [...items, ...FALLBACKS[serviceId].slice(0, need)];
}

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
  serviceId: ServiceId,
  loader: () => Promise<ServicePreviewItem[]>,
): Promise<ServicePreviewItem[]> {
  try {
    const items = await loader();
    return padWithFallback(serviceId, items);
  } catch {
    return FALLBACKS[serviceId];
  }
}

export async function getServicePreviews(
  supabase: SupabaseClient,
): Promise<Record<ServiceId, ServicePreviewItem[]>> {
  const [lessons, readings, community, tests, articles] = await Promise.all([
    safeFetch("lessons", async () => {
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
    safeFetch("readings", async () => {
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
    safeFetch("community", async () => {
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
    safeFetch("tests", async () => {
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
    safeFetch("articles", async () => {
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
