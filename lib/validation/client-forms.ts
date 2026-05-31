import { z } from "zod";
import {
  ALLOWED_SCREENSHOT_TYPES,
  MAX_COMMUNITY_IMAGE_BYTES,
  MAX_SCREENSHOT_BYTES,
  PAYMENT_INFO,
} from "@/lib/constants";

const allowedMime = new Set<string>(ALLOWED_SCREENSHOT_TYPES as unknown as string[]);

function addScreenshotIssues(
  file: unknown,
  maxBytes: number,
  ctx: z.RefinementCtx,
  path: (string | number)[],
  emptyMsg: string,
  typeMsg: string,
  sizeMsg: string,
) {
  if (!(file instanceof File) || file.size === 0) {
    ctx.addIssue({ code: "custom", message: emptyMsg, path });
    return;
  }
  if (!allowedMime.has(file.type)) {
    ctx.addIssue({ code: "custom", message: typeMsg, path });
    return;
  }
  if (file.size > maxBytes) {
    ctx.addIssue({ code: "custom", message: sizeMsg, path });
  }
}

const bankRefSchema = z
  .string()
  .max(200, "Лавлагаа 200 тэмдэгтээс урт байж болохгүй.")
  .transform((s) => s.trim());

export const paymentFormClientSchema = z.object({
  amount: z.preprocess(
    (v) => (typeof v === "string" ? Number(v) : v),
    z.number().refine((n) => Number.isFinite(n) && n >= 1, "Дүн 1-ээс багагүй байх ёстой."),
  ),
  bank_reference: bankRefSchema,
  screenshot: z.custom<File>().superRefine((file, ctx) => {
    addScreenshotIssues(
      file,
      MAX_SCREENSHOT_BYTES,
      ctx,
      ["screenshot"],
      "Дансны дэлгэцийн зураг сонгоно уу.",
      "Зөвхөн JPEG, PNG эсвэл WebP зураг сонгоно уу.",
      `Зургийн хэмжээ ${Math.round(MAX_SCREENSHOT_BYTES / (1024 * 1024))} MB-аас хэтрэхгүй байх ёстой.`,
    );
  }),
});

export function parsePaymentFormData(fd: FormData) {
  const shot = fd.get("screenshot");
  const rawAmount = fd.get("amount");
  return paymentFormClientSchema.safeParse({
    amount: rawAmount !== null ? rawAmount : String(PAYMENT_INFO.amount),
    bank_reference: String(fd.get("bank_reference") ?? ""),
    screenshot: shot,
  });
}

export const communityPostClientSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Гарчиг оруулна уу.")
    .max(200, "Гарчиг хэт урт байна."),
  body: z
    .string()
    .trim()
    .min(1, "Текст бичнэ үү.")
    .max(20000, "Текст хэт урт байна."),
  image: z.custom<File | null>().optional(),
});

export function parseCommunityPostFormData(fd: FormData) {
  const title = fd.get("title");
  const body = fd.get("body");
  const img = fd.get("image");
  return communityPostClientSchema.safeParse({
    title: typeof title === "string" ? title : "",
    body: typeof body === "string" ? body : "",
    image: img instanceof File && img.size > 0 ? img : null,
  });
}

export function communityImageRefine(file: File | null | undefined) {
  if (!file || file.size === 0) return { ok: true as const };
  if (!allowedMime.has(file.type)) {
    return { ok: false as const, message: "Зураг зөвхөн JPEG, PNG эсвэл WebP байх ёстой." };
  }
  if (file.size > MAX_COMMUNITY_IMAGE_BYTES) {
    return {
      ok: false as const,
      message: `Зургийн хэмжээ ${Math.round(MAX_COMMUNITY_IMAGE_BYTES / (1024 * 1024))} MB-аас хэтрэхгүй байх ёстой.`,
    };
  }
  return { ok: true as const };
}

export const coachingBookClientSchema = z.object({
  bank_reference: bankRefSchema,
  screenshot: z.custom<File>().superRefine((file, ctx) => {
    addScreenshotIssues(
      file,
      MAX_SCREENSHOT_BYTES,
      ctx,
      ["screenshot"],
      "Дансны дэлгэцийн зураг сонгоно уу.",
      "Зөвхөн JPEG, PNG эсвэл WebP зураг сонгоно уу.",
      `Зургийн хэмжээ ${Math.round(MAX_SCREENSHOT_BYTES / (1024 * 1024))} MB-аас хэтрэхгүй байх ёстой.`,
    );
  }),
});

export function parseCoachingBookFormData(fd: FormData) {
  return coachingBookClientSchema.safeParse({
    bank_reference: String(fd.get("bank_reference") ?? ""),
    screenshot: fd.get("screenshot"),
  });
}

export function validateAllTestAnswersAnswered(
  questionIds: string[],
  answers: Record<string, string>,
): { ok: true } | { ok: false; message: string } {
  for (const id of questionIds) {
    const v = answers[id]?.trim();
    if (!v) return { ok: false, message: "Бүх асуултад хариулсны дараа илгээнэ үү." };
  }
  return { ok: true };
}

export const onboardingFormClientSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, "Нэрээ оруулна уу.")
    .max(120, "Нэр хэт урт байна."),
  phone: z
    .string()
    .trim()
    .min(6, "Утасны дугаар буруу байна.")
    .max(32, "Утасны дугаар хэт урт байна."),
});

export function parseOnboardingFormData(fd: FormData) {
  return onboardingFormClientSchema.safeParse({
    full_name: String(fd.get("full_name") ?? ""),
    phone: String(fd.get("phone") ?? ""),
  });
}

export const adminCoachingSlotClientSchema = z
  .object({
    start: z.string().min(1, "Эхлэх цаг сонгоно уу."),
    end: z.string().min(1, "Дуусах цаг сонгоно уу."),
    price: z.string().min(1, "Үнэ оруулна уу."),
    description: z.string().max(500, "Тайлбар хэт урт байна.").optional(),
  })
  .superRefine((data, ctx) => {
    const a = new Date(data.start);
    const b = new Date(data.end);
    if (Number.isNaN(a.getTime())) {
      ctx.addIssue({ code: "custom", message: "Эхлэх цаг буруу байна.", path: ["start"] });
    }
    if (Number.isNaN(b.getTime())) {
      ctx.addIssue({ code: "custom", message: "Дуусах цаг буруу байна.", path: ["end"] });
    }
    if (!Number.isNaN(a.getTime()) && !Number.isNaN(b.getTime()) && b <= a) {
      ctx.addIssue({ code: "custom", message: "Дуусах цаг эхлэхээс хойш байх ёстой.", path: ["end"] });
    }
    const n = Number(data.price.replace(/\s/g, ""));
    if (!Number.isFinite(n) || n <= 0) {
      ctx.addIssue({ code: "custom", message: "Үнэ зөв тоо байх ёстой.", path: ["price"] });
    }
  });

export const adminCoachingSlotsMultiClientSchema = z.object({
  serviceType: z.enum(["1vs1_coaching", "tarot_reading"], {
    message: "Үйлчилгээний төрөл сонгоно уу.",
  }),
  dates: z
    .array(z.string().min(1, "Огноо хоосон байна."))
    .min(1, "Огноо сонгоно уу.")
    .max(30, "Хамгийн ихдээ 30 огноо сонгох боломжтой."),
  startTimes: z
    .array(z.string().min(1, "Цаг хоосон байна."))
    .min(1, "Цаг оруулна уу.")
    .max(20, "Хамгийн ихдээ 20 цаг оруулах боломжтой."),
});
