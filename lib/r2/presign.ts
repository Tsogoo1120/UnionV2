/**
 * SERVER-ONLY MODULE — Presigned URL helpers for Cloudflare R2.
 *
 * Two helpers:
 *   - presignUpload: 15-min PUT URL used by admins to upload videos
 *     directly from the browser to R2 (skipping the Next.js server).
 *   - presignDownload: 1-hour GET URL handed to <video> elements for
 *     subscriber playback. Per plan §4.5, never embedded in HTML —
 *     fetched on demand via a server action.
 *
 * Object keys follow the convention:
 *   videos/{video_lessons|collective_readings}/{uuid}.{ext}
 */
import "server-only";
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { R2_BUCKET, getR2Client } from "./client";
import {
  R2_UPLOAD_URL_TTL_SECONDS,
  R2_DOWNLOAD_URL_TTL_SECONDS,
} from "@/lib/constants";

/**
 * Generates an R2 object key under the given prefix.
 * Caller is responsible for picking a sensible prefix
 * (e.g. "video-lessons" or "collective-readings").
 */
export function generateR2Key(prefix: string, filename: string): string {
  const ext = (filename.split(".").pop() ?? "mp4").toLowerCase();
  const uuid = crypto.randomUUID();
  return `videos/${prefix}/${uuid}.${ext}`;
}

/**
 * 15-minute PUT URL the admin's browser uses to upload a video.
 * The R2 bucket is private; only a holder of this signed URL can write.
 */
export async function presignUpload(opts: {
  key: string;
  contentType: string;
}): Promise<string> {
  const client = getR2Client();
  const cmd = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: opts.key,
    ContentType: opts.contentType,
  });
  return getSignedUrl(client, cmd, { expiresIn: R2_UPLOAD_URL_TTL_SECONDS });
}

/**
 * 1-hour GET URL for subscriber video playback. Caller MUST verify
 * the user has subscriber access (canAccessSubscriberContent or admin)
 * before invoking this — there is no role check inside.
 */
export async function presignDownload(opts: { key: string }): Promise<string> {
  const client = getR2Client();
  const cmd = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: opts.key,
  });
  return getSignedUrl(client, cmd, { expiresIn: R2_DOWNLOAD_URL_TTL_SECONDS });
}

/**
 * Removes an R2 object. Used when an admin deletes a video lesson or
 * collective reading (best-effort — DB row deletion is the source of
 * truth, R2 object removal is cleanup).
 */
export async function deleteR2Object(opts: { key: string }): Promise<void> {
  const client = getR2Client();
  await client.send(
    new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: opts.key }),
  );
}
