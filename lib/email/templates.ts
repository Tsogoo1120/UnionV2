import "server-only";

/**
 * Email templates for transactional and content notifications.
 *
 * Each template returns { subject, html, text }. Plain-text bodies
 * are required for spam-filter scoring and accessibility — never
 * skip them.
 *
 * Copy is in Mongolian (mn-MN) to match the product UI.
 *
 * Colors:
 *   - Ember (CTA): #e84a1f (matches the Union brand palette in
 *     app/globals.css --u-ember).
 *   - Ink:         #2a2520
 *   - Surface:     #fbf9f3
 *   - Background:  #f2eee3
 */

export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

// ─── Shared layout ──────────────────────────────────────────────────────────

function layout(opts: {
  title: string;
  greeting: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
  footerNote?: string;
}): string {
  const cta =
    opts.ctaLabel && opts.ctaHref
      ? `<p style="margin:24px 0;">
           <a href="${opts.ctaHref}"
              style="background:#e84a1f;color:#fbf9f3;padding:12px 24px;
                     text-decoration:none;border-radius:6px;
                     display:inline-block;font-weight:600;">
             ${opts.ctaLabel}
           </a>
         </p>`
      : "";

  const footer = opts.footerNote
    ? `<p style="color:#8e887e;font-size:12px;margin-top:32px;">
         ${opts.footerNote}
       </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="utf-8" />
  <title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background:#f2eee3;font-family:
             -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:#f2eee3;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0"
               style="background:#fbf9f3;border-radius:12px;padding:32px;
                      max-width:560px;">
          <tr><td>
            <h1 style="margin:0 0 16px;font-size:22px;color:#2a2520;">
              ${opts.title}
            </h1>
            <p style="margin:0 0 16px;color:#5c564d;">${opts.greeting}</p>
            ${opts.bodyHtml}
            ${cta}
            ${footer}
            <hr style="border:none;border-top:1px solid #e0d9c8;margin:24px 0;" />
            <p style="color:#8e887e;font-size:12px;margin:0;">
              Union — Дотоод гэрэл, гадаад үйл.
            </p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function formatMongolianDate(iso: string): string {
  // 2026-06-12T... → "2026 оны 6 сарын 12"
  const d = new Date(iso);
  return `${d.getFullYear()} оны ${d.getMonth() + 1} сарын ${d.getDate()}`;
}

function formatMongolianDateTime(iso: string): string {
  const d = new Date(iso);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${d.getFullYear()} оны ${d.getMonth() + 1} сарын ${d.getDate()}, ${hh}:${mm}`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const greet = (fullName: string | null) =>
  fullName ? `Сайн уу ${fullName},` : "Сайн уу,";

// ─── 1. Welcome (NEW in v2) ─────────────────────────────────────────────────

export function welcomeTemplate(opts: {
  fullName: string | null;
  siteUrl: string;
}): EmailTemplate {
  const greeting = greet(opts.fullName);
  return {
    subject: "Union-д тавтай морил",
    html: layout({
      title: "Union-д тавтай морил",
      greeting,
      bodyHtml: `
        <p style="margin:0 0 16px;color:#5c564d;">
          Та Union-д амжилттай бүртгүүлсэн байна. Бүх агуулгад нэвтрэхийн
          тулд эхлээд сарын багцаа төлж идэвхжүүлээрэй.
        </p>
        <p style="margin:0 0 16px;color:#5c564d;">
          Танд хүлээгдэж буй 5 үйлчилгээ: видео хичээл, хамтын уншилт,
          эссэ, сэтгэл судлалын тест, нийгэмлэг — мөн хувийн коучинг.
        </p>
      `,
      ctaLabel: "Багц идэвхжүүлэх",
      ctaHref: `${opts.siteUrl}/payment`,
    }),
    text:
      `${greeting}\n\n` +
      `Union-д амжилттай бүртгүүлсэн байна. Багцаа идэвхжүүлэхийн тулд:\n` +
      `${opts.siteUrl}/payment\n\n` +
      `— Union`,
  };
}

// ─── 1b. Admin: new payment pending ─────────────────────────────────────────

export function adminNewPaymentTemplate(opts: {
  userEmail: string;
  userFullName: string | null;
  amount: number;
  currency: string;
  submittedAt: string;
  siteUrl: string;
}): EmailTemplate {
  const submittedHuman = formatMongolianDateTime(opts.submittedAt);
  const userLabel = opts.userFullName
    ? `${escapeHtml(opts.userFullName)} (${escapeHtml(opts.userEmail)})`
    : escapeHtml(opts.userEmail);
  const amountLabel = `${opts.amount.toLocaleString("mn-MN")} ${escapeHtml(opts.currency)}`;
  const dashboardHref = `${opts.siteUrl}/admin/dashboard?tab=payments`;

  return {
    subject: "Шинэ төлбөр хяналтад хүлээгдэж байна",
    html: layout({
      title: "Шинэ төлбөр ирлээ",
      greeting: "Сайн байна уу, Админ,",
      bodyHtml: `
        <p style="margin:0 0 16px;color:#5c564d;">
          Хэрэглэгч шинэ төлбөрийн баримт илгээлээ. Төлбөрийг шалгаад
          батлах эсвэл татгалзах шаардлагатай.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0"
               style="margin:0 0 16px;color:#5c564d;font-size:14px;">
          <tr>
            <td style="padding:4px 12px 4px 0;vertical-align:top;">
              <strong>Хэрэглэгч:</strong>
            </td>
            <td style="padding:4px 0;">${userLabel}</td>
          </tr>
          <tr>
            <td style="padding:4px 12px 4px 0;vertical-align:top;">
              <strong>Дүн:</strong>
            </td>
            <td style="padding:4px 0;">${amountLabel}</td>
          </tr>
          <tr>
            <td style="padding:4px 12px 4px 0;vertical-align:top;">
              <strong>Илгээсэн:</strong>
            </td>
            <td style="padding:4px 0;">${submittedHuman}</td>
          </tr>
        </table>
      `,
      ctaLabel: "Төлбөрүүдийг шалгах",
      ctaHref: dashboardHref,
    }),
    text:
      `Сайн байна уу, Админ,\n\n` +
      `Шинэ төлбөр хяналтад хүлээгдэж байна.\n\n` +
      `Хэрэглэгч: ${opts.userFullName ? `${opts.userFullName} (${opts.userEmail})` : opts.userEmail}\n` +
      `Дүн: ${opts.amount} ${opts.currency}\n` +
      `Илгээсэн: ${submittedHuman}\n\n` +
      `Шалгах: ${dashboardHref}\n\n` +
      `— Union`,
  };
}

// ─── 1c. Payment received (under review) ────────────────────────────────────

export function paymentReceivedTemplate(opts: {
  fullName: string | null;
  siteUrl: string;
  amount: number;
  currency: string;
}): EmailTemplate {
  const greeting = greet(opts.fullName);
  const amountLabel = `${opts.amount.toLocaleString("mn-MN")} ${escapeHtml(opts.currency)}`;

  return {
    subject: "Таны хүсэлт хүлээн авлаа",
    html: layout({
      title: "Төлбөр хүлээн авлаа",
      greeting,
      bodyHtml: `
        <p style="margin:0 0 16px;color:#5c564d;">
          Таны төлбөрийн баримт амжилттай хүлээн авлаа. Одоогоор
          <strong>${amountLabel}</strong> дүнтэй төлбөр хяналтад байна.
        </p>
        <p style="margin:0 0 16px;color:#5c564d;">
          Бид таны шилжүүлгийг шалгаж байна. Шалгалт дууссаны дараа
          үр дүнг имэйлээр мэдэгдэнэ.
        </p>
      `,
      ctaLabel: "Хүлээгдэж буй төлөв харах",
      ctaHref: `${opts.siteUrl}/status/pending`,
    }),
    text:
      `${greeting}\n\n` +
      `Таны төлбөрийн баримт хүлээн авлаа (${opts.amount} ${opts.currency}). ` +
      `Төлбөр одоогоор хяналтад байна.\n\n` +
      `Шалгалт дууссаны дараа үр дүнг имэйлээр мэдэгдэнэ.\n\n` +
      `Төлөв: ${opts.siteUrl}/status/pending\n\n` +
      `— Union`,
  };
}

// ─── 2. Payment approved ────────────────────────────────────────────────────

export function paymentApprovedTemplate(opts: {
  fullName: string | null;
  siteUrl: string;
  expiresAt: string;
}): EmailTemplate {
  const greeting = greet(opts.fullName);
  const expiresHuman = formatMongolianDate(opts.expiresAt);

  return {
    subject: "Таны төлбөр төлөлт амжилттай боллоо",
    html: layout({
      title: "Төлбөр баталгаажлаа",
      greeting,
      bodyHtml: `
        <p style="margin:0 0 16px;color:#5c564d;">
          Таны төлбөр төлөлт амжилттай боллоо — таны эрх идэвхжсэн байна.
          Багцын хүчинтэй хугацаа: <strong>${expiresHuman}</strong> хүртэл.
        </p>
        <p style="margin:0 0 16px;color:#5c564d;">
          Та одоо бүх төлбөртэй агуулгыг ашиглах боломжтой.
        </p>
      `,
      ctaLabel: "Хяналтын самбар руу орох",
      ctaHref: `${opts.siteUrl}/dashboard`,
    }),
    text:
      `${greeting}\n\n` +
      `Таны төлбөр төлөлт амжилттай боллоо. Таны эрх идэвхжсэн.\n` +
      `Хүчинтэй хугацаа: ${expiresHuman} хүртэл.\n\n` +
      `Хяналтын самбар: ${opts.siteUrl}/dashboard\n\n` +
      `— Union`,
  };
}

// ─── 3. Payment denied ──────────────────────────────────────────────────────

export function paymentDeniedTemplate(opts: {
  fullName: string | null;
  siteUrl: string;
  adminNote: string | null;
}): EmailTemplate {
  const greeting = greet(opts.fullName);
  const noteBlock = opts.adminNote
    ? `<p style="margin:0 0 16px;color:#5c564d;">
         <strong>Админы тайлбар:</strong><br />
         <span style="white-space:pre-wrap;">${escapeHtml(opts.adminNote)}</span>
       </p>`
    : "";

  return {
    subject: "Таны төлбөрийг дахин шалгах шаардлагатай байна",
    html: layout({
      title: "Төлбөр батлагдаагүй",
      greeting,
      bodyHtml: `
        <p style="margin:0 0 16px;color:#5c564d;">
          Уучлаарай, таны сүүлийн төлбөр төлөлтийг батлах боломжгүй боллоо.
          Та шинэ баримтыг дансны хуудаснаас дахин илгээнэ үү.
        </p>
        ${noteBlock}
      `,
      ctaLabel: "Төлбөрөө дахин илгээх",
      ctaHref: `${opts.siteUrl}/status/denied`,
    }),
    text:
      `${greeting}\n\n` +
      `Таны сүүлийн төлбөр төлөлтийг батлах боломжгүй боллоо. ` +
      `Та шинэ баримтыг дансны хуудаснаас дахин илгээнэ үү.\n\n` +
      (opts.adminNote ? `Админы тайлбар:\n${opts.adminNote}\n\n` : "") +
      `Дахин илгээх: ${opts.siteUrl}/status/denied\n\n` +
      `— Union`,
  };
}

// ─── 4. Subscription expiring (3-day & 1-day warnings) ──────────────────────

export function subscriptionExpiringTemplate(opts: {
  fullName: string | null;
  siteUrl: string;
  expiresAt: string;
  daysLeft: 1 | 3;
}): EmailTemplate {
  const greeting = greet(opts.fullName);
  const expiresHuman = formatMongolianDate(opts.expiresAt);
  const lead =
    opts.daysLeft === 1
      ? "Таны эрхийн хугацаа маргааш дуусах гэж байна."
      : `Таны эрхийн хугацаа дуусахад ${opts.daysLeft} хоног үлдлээ.`;

  return {
    subject: "Таны эрхийн хугацаа дуусаж байна",
    html: layout({
      title: "Эрхийн хугацаа дуусах гэж байна",
      greeting,
      bodyHtml: `
        <p style="margin:0 0 16px;color:#5c564d;">
          ${lead} Багцын хүчинтэй хугацаа: <strong>${expiresHuman}</strong> хүртэл.
        </p>
        <p style="margin:0 0 16px;color:#5c564d;">
          Үргэлжлүүлэн ашиглахын тулд төлбөрөө сунгана уу.
        </p>
      `,
      ctaLabel: "Эрхээ сунгах",
      ctaHref: `${opts.siteUrl}/payment`,
      footerNote:
        "Энэхүү сануулга нь идэвхтэй багцтай хэрэглэгчдэд илгээгддэг. " +
        "Профайл тохиргооноосоо имэйл сануулгыг хаах боломжтой.",
    }),
    text:
      `${greeting}\n\n` +
      `${lead}\nХүчинтэй хугацаа: ${expiresHuman} хүртэл.\n\n` +
      `Эрхээ сунгах: ${opts.siteUrl}/payment\n\n` +
      `— Union`,
  };
}

// ─── 5. Subscription expired (NEW in v2) ────────────────────────────────────

export function subscriptionExpiredTemplate(opts: {
  fullName: string | null;
  siteUrl: string;
}): EmailTemplate {
  const greeting = greet(opts.fullName);

  return {
    subject: "Таны эрхийн хугацаа дууслаа",
    html: layout({
      title: "Эрхийн хугацаа дууссан байна",
      greeting,
      bodyHtml: `
        <p style="margin:0 0 16px;color:#5c564d;">
          Таны Union багцын хугацаа өнөөдөр дууслаа. Төлбөртэй агуулга
          түр хаагдсан байна.
        </p>
        <p style="margin:0 0 16px;color:#5c564d;">
          Шинэ багцаа идэвхжүүлбэл бүх агуулгад дахин хандах болно.
        </p>
      `,
      ctaLabel: "Эрхээ сэргээх",
      ctaHref: `${opts.siteUrl}/payment`,
    }),
    text:
      `${greeting}\n\n` +
      `Таны багцын хугацаа өнөөдөр дууслаа.\n\n` +
      `Эрхээ сэргээх: ${opts.siteUrl}/payment\n\n` +
      `— Union`,
  };
}

// ─── 6. Video lesson published ──────────────────────────────────────────────

export function videoLessonPublishedTemplate(opts: {
  fullName: string | null;
  siteUrl: string;
  title: string;
  slug: string;
  description: string | null;
}): EmailTemplate {
  const greeting = greet(opts.fullName);
  const desc = opts.description
    ? `<p style="margin:0 0 16px;color:#5c564d;">${escapeHtml(opts.description)}</p>`
    : "";

  return {
    subject: `Шинэ видео хичээл: ${opts.title}`,
    html: layout({
      title: "Шинэ видео хичээл орлоо",
      greeting,
      bodyHtml: `
        <p style="margin:0 0 16px;color:#5c564d;">
          Таны хичээлийн санд шинэ видео нэмэгдлээ:
        </p>
        <p style="margin:0 0 16px;color:#2a2520;font-size:18px;font-weight:600;">
          ${escapeHtml(opts.title)}
        </p>
        ${desc}
      `,
      ctaLabel: "Хичээлийг үзэх",
      ctaHref: `${opts.siteUrl}/dashboard/video-lessons/${opts.slug}`,
      footerNote:
        "Та идэвхтэй багцтай тул энэ мэдэгдлийг хүлээн авч байна. " +
        "Профайл тохиргооноосоо контент имэйлийг хаах боломжтой.",
    }),
    text:
      `${greeting}\n\n` +
      `Шинэ видео хичээл: ${opts.title}\n\n` +
      (opts.description ? `${opts.description}\n\n` : "") +
      `Үзэх: ${opts.siteUrl}/dashboard/video-lessons/${opts.slug}\n\n` +
      `— Union`,
  };
}

// ─── 7. Collective reading published (NEW — replaces v1 tarot template) ─────

export function collectiveReadingPublishedTemplate(opts: {
  fullName: string | null;
  siteUrl: string;
  title: string;
  slug: string;
  description: string | null;
}): EmailTemplate {
  const greeting = greet(opts.fullName);
  const desc = opts.description
    ? `<p style="margin:0 0 16px;color:#5c564d;">${escapeHtml(opts.description)}</p>`
    : "";

  return {
    subject: `Шинэ хамтын уншилт: ${opts.title}`,
    html: layout({
      title: "Шинэ хамтын уншилт орлоо",
      greeting,
      bodyHtml: `
        <p style="margin:0 0 16px;color:#5c564d;">
          Хамтын тарот уншилгийн шинэ дугаар нэмэгдлээ:
        </p>
        <p style="margin:0 0 16px;color:#2a2520;font-size:18px;font-weight:600;">
          ${escapeHtml(opts.title)}
        </p>
        ${desc}
      `,
      ctaLabel: "Уншилтыг үзэх",
      ctaHref: `${opts.siteUrl}/dashboard/collective-readings/${opts.slug}`,
      footerNote:
        "Та идэвхтэй багцтай тул энэ мэдэгдлийг хүлээн авч байна. " +
        "Профайл тохиргооноосоо контент имэйлийг хаах боломжтой.",
    }),
    text:
      `${greeting}\n\n` +
      `Шинэ хамтын уншилт: ${opts.title}\n\n` +
      (opts.description ? `${opts.description}\n\n` : "") +
      `Үзэх: ${opts.siteUrl}/dashboard/collective-readings/${opts.slug}\n\n` +
      `— Union`,
  };
}

// ─── 8. Article published (NEW in v2) ───────────────────────────────────────

export function articlePublishedTemplate(opts: {
  fullName: string | null;
  siteUrl: string;
  title: string;
  slug: string;
  excerpt: string | null;
}): EmailTemplate {
  const greeting = greet(opts.fullName);
  const desc = opts.excerpt
    ? `<p style="margin:0 0 16px;color:#5c564d;">${escapeHtml(opts.excerpt)}</p>`
    : "";

  return {
    subject: `Шинэ эссэ: ${opts.title}`,
    html: layout({
      title: "Шинэ эссэ орлоо",
      greeting,
      bodyHtml: `
        <p style="margin:0 0 16px;color:#5c564d;">
          Уран бичлэгийн санд шинэ эссэ нэмэгдлээ:
        </p>
        <p style="margin:0 0 16px;color:#2a2520;font-size:18px;font-weight:600;">
          ${escapeHtml(opts.title)}
        </p>
        ${desc}
      `,
      ctaLabel: "Эссэг унших",
      ctaHref: `${opts.siteUrl}/dashboard/articles/${opts.slug}`,
      footerNote:
        "Та идэвхтэй багцтай тул энэ мэдэгдлийг хүлээн авч байна. " +
        "Профайл тохиргооноосоо контент имэйлийг хаах боломжтой.",
    }),
    text:
      `${greeting}\n\n` +
      `Шинэ эссэ: ${opts.title}\n\n` +
      (opts.excerpt ? `${opts.excerpt}\n\n` : "") +
      `Унших: ${opts.siteUrl}/dashboard/articles/${opts.slug}\n\n` +
      `— Union`,
  };
}

// ─── 9. Psychology test published ───────────────────────────────────────────

export function psychologyTestPublishedTemplate(opts: {
  fullName: string | null;
  siteUrl: string;
  title: string;
  slug: string;
  description: string | null;
}): EmailTemplate {
  const greeting = greet(opts.fullName);
  const desc = opts.description
    ? `<p style="margin:0 0 16px;color:#5c564d;">${escapeHtml(opts.description)}</p>`
    : "";

  return {
    subject: `Шинэ тест: ${opts.title}`,
    html: layout({
      title: "Шинэ сэтгэл судлалын тест",
      greeting,
      bodyHtml: `
        <p style="margin:0 0 16px;color:#5c564d;">
          Сэтгэл судлалын шинэ тест нэмэгдлээ:
        </p>
        <p style="margin:0 0 16px;color:#2a2520;font-size:18px;font-weight:600;">
          ${escapeHtml(opts.title)}
        </p>
        ${desc}
      `,
      ctaLabel: "Тестийг үзэх",
      ctaHref: `${opts.siteUrl}/dashboard/tests/${opts.slug}`,
      footerNote:
        "Та идэвхтэй багцтай тул энэ мэдэгдлийг хүлээн авч байна. " +
        "Профайл тохиргооноосоо контент имэйлийг хаах боломжтой.",
    }),
    text:
      `${greeting}\n\n` +
      `Шинэ тест: ${opts.title}\n\n` +
      (opts.description ? `${opts.description}\n\n` : "") +
      `Үзэх: ${opts.siteUrl}/dashboard/tests/${opts.slug}\n\n` +
      `— Union`,
  };
}

// ─── 10. Coaching approved (NEW in v2) ──────────────────────────────────────

export function coachingApprovedTemplate(opts: {
  fullName: string | null;
  siteUrl: string;
  slotStartAt: string;
  slotEndAt: string;
  adminNote: string | null;
}): EmailTemplate {
  const greeting = greet(opts.fullName);
  const startHuman = formatMongolianDateTime(opts.slotStartAt);
  const endHuman = formatMongolianDateTime(opts.slotEndAt);
  const noteBlock = opts.adminNote
    ? `<p style="margin:0 0 16px;color:#5c564d;">
         <strong>Админы тэмдэглэл:</strong><br />
         <span style="white-space:pre-wrap;">${escapeHtml(opts.adminNote)}</span>
       </p>`
    : "";

  return {
    subject: "Таны коучингын цаг баталгаажлаа",
    html: layout({
      title: "Коучингын цаг баталгаажлаа",
      greeting,
      bodyHtml: `
        <p style="margin:0 0 16px;color:#5c564d;">
          Таны хувийн коучингын захиалга баталгаажлаа.
          <br />Хуваарь: <strong>${startHuman}</strong> – ${endHuman}
        </p>
        <p style="margin:0 0 16px;color:#5c564d;">
          Удахгүй админ тань тантай шууд холбогдох болно (мессеж эсвэл утсаар).
        </p>
        ${noteBlock}
      `,
      ctaLabel: "Хяналтын самбар руу орох",
      ctaHref: `${opts.siteUrl}/dashboard`,
    }),
    text:
      `${greeting}\n\n` +
      `Таны коучингын захиалга баталгаажлаа.\n` +
      `Хуваарь: ${startHuman} – ${endHuman}\n\n` +
      `Удахгүй админ тантай шууд холбогдох болно.\n\n` +
      (opts.adminNote ? `Тэмдэглэл:\n${opts.adminNote}\n\n` : "") +
      `— Union`,
  };
}

// ─── 11. Coaching denied (NEW in v2) ────────────────────────────────────────

export function coachingDeniedTemplate(opts: {
  fullName: string | null;
  siteUrl: string;
  slotStartAt: string;
  adminNote: string | null;
}): EmailTemplate {
  const greeting = greet(opts.fullName);
  const startHuman = formatMongolianDateTime(opts.slotStartAt);
  const noteBlock = opts.adminNote
    ? `<p style="margin:0 0 16px;color:#5c564d;">
         <strong>Админы тайлбар:</strong><br />
         <span style="white-space:pre-wrap;">${escapeHtml(opts.adminNote)}</span>
       </p>`
    : "";

  return {
    subject: "Коучингын захиалга батлагдаагүй",
    html: layout({
      title: "Захиалга батлагдаагүй",
      greeting,
      bodyHtml: `
        <p style="margin:0 0 16px;color:#5c564d;">
          Уучлаарай, таны <strong>${startHuman}</strong>-ийн коучингын
          захиалгыг батлах боломжгүй боллоо. Цаг дахин нээгдсэн байна;
          та шинэ цагийг сонгож захиалах боломжтой.
        </p>
        ${noteBlock}
      `,
      ctaLabel: "Бусад цаг харах",
      ctaHref: `${opts.siteUrl}/dashboard/coaching`,
    }),
    text:
      `${greeting}\n\n` +
      `Таны ${startHuman}-ийн коучингын захиалгыг батлах боломжгүй боллоо.\n\n` +
      (opts.adminNote ? `Тайлбар:\n${opts.adminNote}\n\n` : "") +
      `Бусад цаг: ${opts.siteUrl}/dashboard/coaching\n\n` +
      `— Union`,
  };
}
