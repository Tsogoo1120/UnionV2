/**
 * Shared TypeScript types for the unionV2 backend.
 *
 * These mirror the SQL schema in supabase/migrations/. When you change the
 * schema, update the matching type here.
 */

// -----------------------------------------------------------------------------
// Enums (must match the SQL CREATE TYPE statements)
// -----------------------------------------------------------------------------

export type UserRole = "user" | "admin";

export type SubscriptionStatus =
  | "inactive"
  | "pending"
  | "active"
  | "expired"
  | "denied";

export type PaymentStatus = "pending" | "approved" | "denied";

export type CoachingSlotStatus =
  | "available"
  | "pending"
  | "booked"
  | "expired"
  | "cancelled";

// -----------------------------------------------------------------------------
// Core entities
// -----------------------------------------------------------------------------

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  subscription_status: SubscriptionStatus;
  subscription_expires_at: string | null;
  email_notifications: boolean;
  expiry_reminder_stage: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  screenshot_path: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  bank_reference: string | null;
  admin_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

// -----------------------------------------------------------------------------
// Content
// -----------------------------------------------------------------------------

export interface VideoLesson {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  body: string | null;
  category: string | null;
  thumbnail_path: string | null;
  hero_image_path: string | null;
  description_image_path: string | null;
  video_r2_key: string;
  duration_seconds: number | null;
  sort_order: number;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollectiveReading {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  body: string | null;
  cover_image_path: string | null;
  hero_image_path: string | null;
  description_image_path: string | null;
  video_r2_key: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  description: string | null;
  body: string;
  cover_image_path: string | null;
  hero_image_path: string | null;
  description_image_path: string | null;
  author_id: string | null;
  reading_minutes: number | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PsychologyTest {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image_path: string | null;
  hero_image_path: string | null;
  description_image_path: string | null;
  questions: TestQuestion[];
  scoring_rules: TestScoringRules;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TestQuestion {
  id: string;
  text: string;
  options: { id: string; text: string; value: number }[];
  meta?: { trait?: string; reverse?: boolean };
}

export interface SimpleTestScoringRules {
  type?: "simple";
  ranges: { min: number; max: number; result: string }[];
}

export interface BigFiveTraitDef {
  name: string;
  base: number;
  items: { id: string; operation: "add" | "subtract" }[];
}

export interface BigFiveTraitInfo {
  title: string;
  shortDescription: string;
  highScoreMeaning: string;
  lowScoreMeaning: string;
}

export interface BigFiveTestScoringRules {
  type: "big_five";
  traits: Record<string, BigFiveTraitDef>;
  traitInfo: Record<string, BigFiveTraitInfo>;
  resultLevels: { min: number; max: number; level: string; meaning: string }[];
  resultSummaryTemplate: Record<string, string>;
}

export type TestScoringRules = SimpleTestScoringRules | BigFiveTestScoringRules;

export interface TestResult {
  id: string;
  user_id: string;
  test_id: string;
  answers: Record<string, string | number>;
  result_summary: string | null;
  score: Record<string, number> | null;
  created_at: string;
}

// -----------------------------------------------------------------------------
// Community
// -----------------------------------------------------------------------------

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  body: string;
  image_path: string | null;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

// -----------------------------------------------------------------------------
// Coaching
// -----------------------------------------------------------------------------

export interface CoachingSlot {
  id: string;
  start_at: string;
  end_at: string;
  price: number;
  currency: string;
  description: string | null;
  status: CoachingSlotStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CoachingBooking {
  id: string;
  slot_id: string;
  user_id: string;
  amount: number;
  currency: string;
  screenshot_path: string;
  bank_reference: string | null;
  status: PaymentStatus;
  admin_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}
