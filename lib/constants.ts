/**
 * Project-wide constants. Imported by both server and client code, so this
 * file must NOT pull in any server-only modules.
 */

// -----------------------------------------------------------------------------
// Subscription payment (50,000 MNT / month)
// -----------------------------------------------------------------------------

export const PAYMENT_INFO = {
  amount: 50_000,
  currency: "MNT",
  bankName: "Голомт банк",
  accountName: "Гэрэлцэцэг Алтанцог",
  accountNumber: "2705130475",
  iban: "37001500",
} as const;

export const SUBSCRIPTION_DURATION_DAYS = 30;

// -----------------------------------------------------------------------------
// Coaching defaults (per plan §18.4)
// -----------------------------------------------------------------------------

export const DEFAULT_COACHING_PRICE = 150_000;
export const DEFAULT_COACHING_CURRENCY = "MNT";

export const COACHING_SERVICE_TYPES = {
  "1vs1_coaching": {
    label: "1 vs 1 Коучинг",
    price: 150_000,
    durationMinutes: 60,
    currency: "MNT",
  },
  tarot_reading: {
    label: "Хувийн таро уншлага",
    price: 75_000,
    durationMinutes: 30,
    currency: "MNT",
  },
} as const;

export type CoachingServiceType = keyof typeof COACHING_SERVICE_TYPES;

// -----------------------------------------------------------------------------
// 5-service hub metadata (used by the dashboard tile grid)
// -----------------------------------------------------------------------------

export const SERVICES = [
  {
    key: "video-lessons",
    title: "Видео хичээл",
    description: "Self-hosted video courses",
    href: "/dashboard/video-lessons",
  },
  {
    key: "collective-readings",
    title: "Хамтын уншилт",
    description: "Collective tarot readings",
    href: "/dashboard/collective-readings",
  },
  {
    key: "articles",
    title: "Эссэ",
    description: "Long-form articles",
    href: "/dashboard/articles",
  },
  {
    key: "tests",
    title: "Сэтгэл судлалын тест",
    description: "Psychology self-assessments",
    href: "/dashboard/tests",
  },
  {
    key: "community",
    title: "Нийгэмлэг",
    description: "Community posts and discussion",
    href: "/dashboard/community",
  },
] as const;

// -----------------------------------------------------------------------------
// Upload limits
// -----------------------------------------------------------------------------

/** Max payment / coaching screenshot size in bytes (5 MB). */
export const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;

/** Allowed screenshot MIME types. */
export const ALLOWED_SCREENSHOT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

/** Max community post image size in bytes (3 MB). */
export const MAX_COMMUNITY_IMAGE_BYTES = 3 * 1024 * 1024;

/** Presigned R2 video upload URL TTL (15 minutes). */
export const R2_UPLOAD_URL_TTL_SECONDS = 15 * 60;

/** Presigned R2 video download URL TTL (1 hour). */
export const R2_DOWNLOAD_URL_TTL_SECONDS = 60 * 60;
