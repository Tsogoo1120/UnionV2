import { createClient } from "@/lib/supabase/client";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_THUMB_BYTES = 3 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024;

export async function uploadMediaThumbnail(
  storagePath: string,
  file: File,
): Promise<{ path?: string; error?: string }> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: "Зөвхөн JPEG, PNG эсвэл WebP зураг сонгоно уу." };
  }
  if (file.size > MAX_THUMB_BYTES) {
    return { error: "Зургийн хэмжээ 3 MB-аас хэтрэхгүй байх ёстой." };
  }

  const supabase = createClient();
  const { error } = await supabase.storage
    .from("media-thumbnails")
    .upload(storagePath, file, { contentType: file.type, upsert: true });

  if (error) return { error: error.message };
  return { path: storagePath };
}

export async function uploadVideoToR2(
  file: File,
  kind: "video-lessons" | "collective-readings",
): Promise<{ key?: string; error?: string }> {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return { error: "Зөвхөн MP4 эсвэл WebM видео сонгоно уу." };
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return { error: "Видеоны хэмжээ 2 GB-аас хэтрэхгүй байх ёстой." };
  }

  const presignRes = await fetch("/api/r2/presign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      kind,
    }),
  });

  if (!presignRes.ok) {
    const err = await presignRes.text();
    return { error: `Видео бэлтгэхэд алдаа: ${presignRes.status} ${err}` };
  }

  const { key, uploadUrl } = (await presignRes.json()) as {
    key: string;
    uploadUrl: string;
  };

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!putRes.ok) {
    return { error: `Видео байршуулахад алдаа: ${putRes.status}` };
  }

  return { key };
}

/** Read video duration in seconds from a File (browser only). */
export function readVideoDurationSeconds(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      const d = video.duration;
      resolve(Number.isFinite(d) && d > 0 ? Math.round(d) : null);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    video.src = url;
  });
}
