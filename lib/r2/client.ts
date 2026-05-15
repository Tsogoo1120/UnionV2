/**
 * SERVER-ONLY MODULE — Cloudflare R2 S3-compatible client.
 *
 * R2 speaks S3, so we use @aws-sdk/client-s3 with:
 *   - region: "auto"  (R2 doesn't have regions; "auto" is the magic value)
 *   - endpoint: https://<account_id>.r2.cloudflarestorage.com
 *   - forcePathStyle: true (bucket-in-path, not subdomain)
 *
 * R2 credentials must NEVER ship to the client. Server actions and
 * route handlers use this client; presigned URLs (lib/r2/presign.ts)
 * are the only thing that crosses to the browser.
 */
import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

let cached: S3Client | null = null;

function envOrThrow(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing environment variable: ${name}. ` +
        `See plan §4.2 for Cloudflare R2 setup and .env.example for the full list.`,
    );
  }
  return v;
}

export function getR2Client(): S3Client {
  if (cached) return cached;

  const accountId = envOrThrow("R2_ACCOUNT_ID");
  // Default endpoint format; allow override via env for custom domains.
  const endpoint =
    process.env.R2_ENDPOINT ??
    `https://${accountId}.r2.cloudflarestorage.com`;

  cached = new S3Client({
    region: "auto",
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: envOrThrow("R2_ACCESS_KEY_ID"),
      secretAccessKey: envOrThrow("R2_SECRET_ACCESS_KEY"),
    },
    // Disable auto-checksum: SDK v3 adds CRC32 by default, which gets baked
    // into presigned URLs as x-amz-checksum-crc32=<empty-body-hash>.
    // Browser PUTs the real video body so the hash mismatches → 403.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return cached;
}

export const R2_BUCKET = process.env.R2_BUCKET ?? "union-videos";
