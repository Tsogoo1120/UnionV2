/**
 * Public email API. All functions here are best-effort:
 * they log on failure but never throw — an email outage must
 * not break a payment approval, lesson publish, or cron run.
 *
 * Callers should NOT wrap these in try/catch; that's already done.
 *
 * Rate-limit strategy (fanOut): batches of 8 with a 1.1 s gap
 * (≈7.3 emails/sec) to stay under Resend's 10 rps cap.
 */
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { EMAIL_FROM, SITE_URL, getResendClient } from "./client";
import {
  adminNewPaymentTemplate,
  articlePublishedTemplate,
  coachingApprovedTemplate,
  coachingDeniedTemplate,
  collectiveReadingPublishedTemplate,
  paymentApprovedTemplate,
  paymentDeniedTemplate,
  paymentReceivedTemplate,
  psychologyTestPublishedTemplate,
  subscriptionExpiredTemplate,
  subscriptionExpiringTemplate,
  videoLessonPublishedTemplate,
  welcomeTemplate,
  type EmailTemplate,
} from "./templates";

// ─── Low-level sender ───────────────────────────────────────────────────────

async function sendOne(opts: {
  to: string;
  template: EmailTemplate;
}): Promise<void> {
  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: opts.to,
      subject: opts.template.subject,
      html: opts.template.html,
      text: opts.template.text,
    });
    if (error) {
      console.error("[email] Resend returned error:", error);
    }
  } catch (err) {
    console.error("[email] sendOne failed:", err);
  }
}

// ─── Fan-out helper (used by content notifications) ─────────────────────────

type Recipient = { email: string; full_name: string | null };

async function fanOut(
  recipients: Recipient[],
  buildTemplate: (r: Recipient) => EmailTemplate,
): Promise<void> {
  const BATCH = 8;
  for (let i = 0; i < recipients.length; i += BATCH) {
    const slice = recipients.slice(i, i + BATCH);
    await Promise.allSettled(
      slice.map((r) => sendOne({ to: r.email, template: buildTemplate(r) })),
    );
    if (i + BATCH < recipients.length) {
      await new Promise((r) => setTimeout(r, 1100));
    }
  }
}

async function fetchActiveSubscribers(): Promise<Recipient[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("email, full_name")
    .eq("subscription_status", "active")
    .eq("email_notifications", true);
  return (data ?? []).filter((r): r is Recipient => !!r?.email);
}

// ─── 1. Welcome (transactional — bypass opt-out) ────────────────────────────

export async function sendWelcomeEmail(opts: {
  userId: string;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("id", opts.userId)
      .single();

    if (!profile?.email) return;
    await sendOne({
      to: profile.email,
      template: welcomeTemplate({
        fullName: profile.full_name,
        siteUrl: SITE_URL,
      }),
    });
  } catch (err) {
    console.error("[email] sendWelcomeEmail failed:", err);
  }
}

// ─── 1c. Payment received (transactional) ───────────────────────────────────

export async function sendPaymentReceivedEmail(opts: {
  userId: string;
  amount: number;
  currency: string;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("id", opts.userId)
      .single();

    if (!profile?.email) return;
    await sendOne({
      to: profile.email,
      template: paymentReceivedTemplate({
        fullName: profile.full_name,
        siteUrl: SITE_URL,
        amount: opts.amount,
        currency: opts.currency,
      }),
    });
  } catch (err) {
    console.error("[email] sendPaymentReceivedEmail failed:", err);
  }
}

// ─── 2. Payment approved (transactional) ────────────────────────────────────

export async function sendPaymentApprovedEmail(opts: {
  userId: string;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name, subscription_expires_at")
      .eq("id", opts.userId)
      .single();

    if (!profile?.email || !profile.subscription_expires_at) return;
    await sendOne({
      to: profile.email,
      template: paymentApprovedTemplate({
        fullName: profile.full_name,
        siteUrl: SITE_URL,
        expiresAt: profile.subscription_expires_at,
      }),
    });
  } catch (err) {
    console.error("[email] sendPaymentApprovedEmail failed:", err);
  }
}

// ─── 2b. Admin: new payment pending (transactional) ───────────────────────

export async function sendAdminNewPaymentEmail(opts: {
  userId: string;
  paymentId: string;
}): Promise<void> {
  try {
    const admin = createAdminClient();

    const [{ data: admins }, { data: userProfile }, { data: payment }] =
      await Promise.all([
        admin.from("profiles").select("email").eq("role", "admin"),
        admin
          .from("profiles")
          .select("email, full_name")
          .eq("id", opts.userId)
          .single(),
        admin
          .from("payments")
          .select("amount, currency, submitted_at")
          .eq("id", opts.paymentId)
          .single(),
      ]);

    const adminEmails = (admins ?? [])
      .map((a) => a.email)
      .filter((e): e is string => !!e);
    if (adminEmails.length === 0 || !userProfile?.email || !payment) return;

    const template = adminNewPaymentTemplate({
      userEmail: userProfile.email,
      userFullName: userProfile.full_name,
      amount: Number(payment.amount),
      currency: payment.currency,
      submittedAt: payment.submitted_at,
      siteUrl: SITE_URL,
    });

    await Promise.allSettled(
      adminEmails.map((to) => sendOne({ to, template })),
    );
  } catch (err) {
    console.error("[email] sendAdminNewPaymentEmail failed:", err);
  }
}

// ─── 3. Payment denied (transactional) ──────────────────────────────────────

export async function sendPaymentDeniedEmail(opts: {
  userId: string;
  adminNote: string | null;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("id", opts.userId)
      .single();

    if (!profile?.email) return;
    await sendOne({
      to: profile.email,
      template: paymentDeniedTemplate({
        fullName: profile.full_name,
        siteUrl: SITE_URL,
        adminNote: opts.adminNote,
      }),
    });
  } catch (err) {
    console.error("[email] sendPaymentDeniedEmail failed:", err);
  }
}

// ─── 4. Subscription expiring (cron, idempotent via reminder_stage) ─────────

export async function sendExpiryReminders(): Promise<{
  sent3Day: number;
  sent1Day: number;
  errors: number;
}> {
  let sent3Day = 0;
  let sent1Day = 0;
  let errors = 0;

  try {
    const admin = createAdminClient();
    const now = new Date();
    const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // 3-day reminders: expiry in (now+1d, now+3d], stage = 0
    const { data: threeDay } = await admin
      .from("profiles")
      .select("id, email, full_name, subscription_expires_at")
      .eq("subscription_status", "active")
      .eq("email_notifications", true)
      .eq("expiry_reminder_stage", 0)
      .gt("subscription_expires_at", in1Day.toISOString())
      .lte("subscription_expires_at", in3Days.toISOString());

    for (const u of threeDay ?? []) {
      if (!u.email || !u.subscription_expires_at) continue;
      try {
        await sendOne({
          to: u.email,
          template: subscriptionExpiringTemplate({
            fullName: u.full_name,
            siteUrl: SITE_URL,
            expiresAt: u.subscription_expires_at,
            daysLeft: 3,
          }),
        });
        await admin
          .from("profiles")
          .update({ expiry_reminder_stage: 1 })
          .eq("id", u.id);
        sent3Day += 1;
      } catch (err) {
        errors += 1;
        console.error("[email] 3-day reminder failed for", u.id, err);
      }
    }

    // 1-day reminders: expiry in (now, now+1d], stage <= 1
    const { data: oneDay } = await admin
      .from("profiles")
      .select("id, email, full_name, subscription_expires_at")
      .eq("subscription_status", "active")
      .eq("email_notifications", true)
      .lte("expiry_reminder_stage", 1)
      .gt("subscription_expires_at", now.toISOString())
      .lte("subscription_expires_at", in1Day.toISOString());

    for (const u of oneDay ?? []) {
      if (!u.email || !u.subscription_expires_at) continue;
      try {
        await sendOne({
          to: u.email,
          template: subscriptionExpiringTemplate({
            fullName: u.full_name,
            siteUrl: SITE_URL,
            expiresAt: u.subscription_expires_at,
            daysLeft: 1,
          }),
        });
        await admin
          .from("profiles")
          .update({ expiry_reminder_stage: 2 })
          .eq("id", u.id);
        sent1Day += 1;
      } catch (err) {
        errors += 1;
        console.error("[email] 1-day reminder failed for", u.id, err);
      }
    }
  } catch (err) {
    errors += 1;
    console.error("[email] sendExpiryReminders failed:", err);
  }

  return { sent3Day, sent1Day, errors };
}

// ─── 5. Subscription expired (cron, batch on transition) ────────────────────

/**
 * Called by /api/cron/subscription-expire after it flips a batch of users
 * from 'active' to 'expired'. Receives the userIds that were just expired
 * so we don't repeatedly email the same users every day.
 */
export async function sendSubscriptionExpiredEmails(opts: {
  userIds: string[];
}): Promise<{ sent: number; errors: number }> {
  if (opts.userIds.length === 0) return { sent: 0, errors: 0 };

  let sent = 0;
  let errors = 0;
  try {
    const admin = createAdminClient();
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, email, full_name")
      .in("id", opts.userIds);

    for (const p of profiles ?? []) {
      if (!p.email) continue;
      try {
        await sendOne({
          to: p.email,
          template: subscriptionExpiredTemplate({
            fullName: p.full_name,
            siteUrl: SITE_URL,
          }),
        });
        sent += 1;
      } catch (err) {
        errors += 1;
        console.error("[email] expired email failed for", p.id, err);
      }
    }
  } catch (err) {
    errors += 1;
    console.error("[email] sendSubscriptionExpiredEmails failed:", err);
  }
  return { sent, errors };
}

// ─── 6. Video lesson published (fan-out, respects opt-out) ──────────────────

export async function sendVideoLessonPublishedEmail(opts: {
  lessonId: string;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: lesson } = await admin
      .from("video_lessons")
      .select("id, title, slug, description, is_published")
      .eq("id", opts.lessonId)
      .single();

    if (!lesson || !lesson.is_published) return;

    const recipients = await fetchActiveSubscribers();
    if (recipients.length === 0) return;

    await fanOut(recipients, (r) =>
      videoLessonPublishedTemplate({
        fullName: r.full_name,
        siteUrl: SITE_URL,
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description ?? null,
      }),
    );
  } catch (err) {
    console.error("[email] sendVideoLessonPublishedEmail failed:", err);
  }
}

// ─── 7. Collective reading published (fan-out) ──────────────────────────────

export async function sendCollectiveReadingPublishedEmail(opts: {
  readingId: string;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: reading } = await admin
      .from("collective_readings")
      .select("id, title, slug, description, is_published")
      .eq("id", opts.readingId)
      .single();

    if (!reading || !reading.is_published) return;

    const recipients = await fetchActiveSubscribers();
    if (recipients.length === 0) return;

    await fanOut(recipients, (r) =>
      collectiveReadingPublishedTemplate({
        fullName: r.full_name,
        siteUrl: SITE_URL,
        title: reading.title,
        slug: reading.slug,
        description: reading.description ?? null,
      }),
    );
  } catch (err) {
    console.error("[email] sendCollectiveReadingPublishedEmail failed:", err);
  }
}

// ─── 8. Article published (fan-out) ─────────────────────────────────────────

export async function sendArticlePublishedEmail(opts: {
  articleId: string;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: article } = await admin
      .from("articles")
      .select("id, title, slug, excerpt, is_published")
      .eq("id", opts.articleId)
      .single();

    if (!article || !article.is_published) return;

    const recipients = await fetchActiveSubscribers();
    if (recipients.length === 0) return;

    await fanOut(recipients, (r) =>
      articlePublishedTemplate({
        fullName: r.full_name,
        siteUrl: SITE_URL,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt ?? null,
      }),
    );
  } catch (err) {
    console.error("[email] sendArticlePublishedEmail failed:", err);
  }
}

// ─── 9. Psychology test published (fan-out) ─────────────────────────────────

export async function sendPsychologyTestPublishedEmail(opts: {
  testId: string;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: test } = await admin
      .from("psychology_tests")
      .select("id, title, slug, description, is_published")
      .eq("id", opts.testId)
      .single();

    if (!test || !test.is_published) return;

    const recipients = await fetchActiveSubscribers();
    if (recipients.length === 0) return;

    await fanOut(recipients, (r) =>
      psychologyTestPublishedTemplate({
        fullName: r.full_name,
        siteUrl: SITE_URL,
        title: test.title,
        slug: test.slug,
        description: test.description ?? null,
      }),
    );
  } catch (err) {
    console.error("[email] sendPsychologyTestPublishedEmail failed:", err);
  }
}

// ─── 10. Coaching approved (transactional) ──────────────────────────────────

export async function sendCoachingApprovedEmail(opts: {
  bookingId: string;
  adminNote: string | null;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: booking } = await admin
      .from("coaching_bookings")
      .select("id, user_id, slot_id")
      .eq("id", opts.bookingId)
      .single();
    if (!booking) return;

    const [{ data: profile }, { data: slot }] = await Promise.all([
      admin
        .from("profiles")
        .select("email, full_name")
        .eq("id", booking.user_id)
        .single(),
      admin
        .from("coaching_slots")
        .select("start_at, end_at")
        .eq("id", booking.slot_id)
        .single(),
    ]);

    if (!profile?.email || !slot) return;
    await sendOne({
      to: profile.email,
      template: coachingApprovedTemplate({
        fullName: profile.full_name,
        siteUrl: SITE_URL,
        slotStartAt: slot.start_at,
        slotEndAt: slot.end_at,
        adminNote: opts.adminNote,
      }),
    });
  } catch (err) {
    console.error("[email] sendCoachingApprovedEmail failed:", err);
  }
}

// ─── 11. Coaching denied (transactional) ────────────────────────────────────

export async function sendCoachingDeniedEmail(opts: {
  bookingId: string;
  adminNote: string | null;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: booking } = await admin
      .from("coaching_bookings")
      .select("id, user_id, slot_id")
      .eq("id", opts.bookingId)
      .single();
    if (!booking) return;

    const [{ data: profile }, { data: slot }] = await Promise.all([
      admin
        .from("profiles")
        .select("email, full_name")
        .eq("id", booking.user_id)
        .single(),
      admin
        .from("coaching_slots")
        .select("start_at")
        .eq("id", booking.slot_id)
        .single(),
    ]);

    if (!profile?.email || !slot) return;
    await sendOne({
      to: profile.email,
      template: coachingDeniedTemplate({
        fullName: profile.full_name,
        siteUrl: SITE_URL,
        slotStartAt: slot.start_at,
        adminNote: opts.adminNote,
      }),
    });
  } catch (err) {
    console.error("[email] sendCoachingDeniedEmail failed:", err);
  }
}
