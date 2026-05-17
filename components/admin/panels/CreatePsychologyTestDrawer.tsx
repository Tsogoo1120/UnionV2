"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { createTest } from "@/app/actions/tests";
import {
  AdminDrawer,
  AdminFieldLabel,
  DrawerCancelButton,
  DrawerSubmitButton,
  adminInputStyle,
} from "@/components/admin/shared/AdminDrawer";
import {
  AdminContentImageFields,
  uploadContentImages,
} from "@/components/admin/shared/AdminContentImageFields";
import { useToast } from "@/components/shell/Toast";
import { slugFromTitle } from "@/lib/admin/slug";
import { mapServerErrorToMn } from "@/lib/i18n/action-feedback";
import type { TestQuestion, TestScoringRules } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
};

const QUESTIONS_PLACEHOLDER = `[
  {
    "id": "q1",
    "text": "Асуултын текст",
    "options": [
      { "id": "a", "text": "Хариулт A", "value": 1 },
      { "id": "b", "text": "Хариулт B", "value": 2 }
    ]
  }
]`;

const SCORING_PLACEHOLDER = `{
  "ranges": [
    { "min": 0, "max": 5, "result": "Бага" },
    { "min": 6, "max": 10, "result": "Дунд" }
  ]
}`;

const monoTextareaStyle: React.CSSProperties = {
  ...adminInputStyle,
  resize: "vertical",
  minHeight: 160,
  fontFamily: "var(--u-mono)",
  fontSize: 13,
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function parseQuestionsJson(raw: string): { data?: TestQuestion[]; error?: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { error: "Асуултын JSON хоосон байна." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { error: "Асуултын JSON буруу форматтай байна." };
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { error: "Асуултууд хоосон биш массив байх ёстой." };
  }

  const questions: TestQuestion[] = [];
  for (let i = 0; i < parsed.length; i++) {
    const q = parsed[i];
    if (!isRecord(q)) return { error: `Асуулт ${i + 1}: объект байх ёстой.` };
    if (typeof q.id !== "string" || !q.id.trim()) {
      return { error: `Асуулт ${i + 1}: id (string) шаардлагатай.` };
    }
    if (typeof q.text !== "string" || !q.text.trim()) {
      return { error: `Асуулт ${i + 1}: text (string) шаардлагатай.` };
    }
    if (!Array.isArray(q.options) || q.options.length === 0) {
      return { error: `Асуулт ${i + 1}: options хоосон биш массив байх ёстой.` };
    }

    const options: TestQuestion["options"] = [];
    for (let j = 0; j < q.options.length; j++) {
      const o = q.options[j];
      if (!isRecord(o)) return { error: `Асуулт ${i + 1}, сонголт ${j + 1}: объект байх ёстой.` };
      if (typeof o.id !== "string" || !o.id.trim()) {
        return { error: `Асуулт ${i + 1}, сонголт ${j + 1}: id (string) шаардлагатай.` };
      }
      if (typeof o.text !== "string" || !o.text.trim()) {
        return { error: `Асуулт ${i + 1}, сонголт ${j + 1}: text (string) шаардлагатай.` };
      }
      if (typeof o.value !== "number" || Number.isNaN(o.value)) {
        return { error: `Асуулт ${i + 1}, сонголт ${j + 1}: value (number) шаардлагатай.` };
      }
      options.push({ id: o.id, text: o.text, value: o.value });
    }

    questions.push({ id: q.id, text: q.text, options });
  }

  return { data: questions };
}

export function parseScoringRulesJson(raw: string): { data?: TestScoringRules; error?: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { error: "Оноолтын JSON хоосон байна." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { error: "Оноолтын JSON буруу форматтай байна." };
  }

  if (!isRecord(parsed)) {
    return { error: "Оноолтын JSON объект байх ёстой." };
  }

  // Big Five format
  if (parsed.type === "big_five") {
    if (!isRecord(parsed.traits)) {
      return { error: "big_five: traits объект шаардлагатай." };
    }
    if (!Array.isArray(parsed.resultLevels) || parsed.resultLevels.length === 0) {
      return { error: "big_five: resultLevels массив шаардлагатай." };
    }
    return { data: parsed as unknown as TestScoringRules };
  }

  // Simple range format
  if (!Array.isArray(parsed.ranges) || parsed.ranges.length === 0) {
    return { error: "scoring_rules.ranges хоосон биш массив байх ёстой." };
  }

  const ranges: { min: number; max: number; result: string }[] = [];
  for (let i = 0; i < parsed.ranges.length; i++) {
    const r = parsed.ranges[i];
    if (!isRecord(r)) return { error: `Оноолт ${i + 1}: объект байх ёстой.` };
    if (typeof r.min !== "number" || Number.isNaN(r.min)) {
      return { error: `Оноолт ${i + 1}: min (number) шаардлагатай.` };
    }
    if (typeof r.max !== "number" || Number.isNaN(r.max)) {
      return { error: `Оноолт ${i + 1}: max (number) шаардлагатай.` };
    }
    if (typeof r.result !== "string" || !r.result.trim()) {
      return { error: `Оноолт ${i + 1}: result (string) шаардлагатай.` };
    }
    ranges.push({ min: r.min, max: r.max, result: r.result });
  }

  return { data: { ranges } };
}

export function CreatePsychologyTestDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [questionsJson, setQuestionsJson] = useState("");
  const [scoringJson, setScoringJson] = useState("");
  const [cardFile, setCardFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [descriptionFile, setDescriptionFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    if (!slugTouched && title) setSlug(slugFromTitle(title));
  }, [title, slugTouched]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setSlug("");
      setSlugTouched(false);
      setDescription("");
      setQuestionsJson("");
      setScoringJson("");
      setCardFile(null);
      setHeroFile(null);
      setDescriptionFile(null);
      setUploadStatus("");
      setErr(null);
    }
  }, [open]);

  function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);

    const questionsResult = parseQuestionsJson(questionsJson);
    if (questionsResult.error) {
      setErr(questionsResult.error);
      toast(questionsResult.error, "error");
      return;
    }

    const scoringResult = parseScoringRulesJson(scoringJson);
    if (scoringResult.error) {
      setErr(scoringResult.error);
      toast(scoringResult.error, "error");
      return;
    }

    const s = slug.trim() || slugFromTitle(title);

    startTransition(async () => {
      setUploadStatus("Байршуулж байна…");
      const imgs = await uploadContentImages({
        basePath: "tests",
        slug: s,
        cardName: "cover",
        cardFile,
        heroFile,
        descriptionFile,
      });
      if (imgs.error) {
        const m = mapServerErrorToMn(imgs.error);
        setErr(m);
        toast(m, "error");
        setUploadStatus("");
        return;
      }

      const res = await createTest({
        slug: s,
        title: title.trim(),
        description: description.trim() || null,
        cover_image_path: imgs.cardPath ?? null,
        hero_image_path: imgs.heroPath ?? null,
        description_image_path: imgs.descriptionPath ?? null,
        questions: questionsResult.data!,
        scoring_rules: scoringResult.data!,
      });
      setUploadStatus("");

      if (res.error) {
        const m = mapServerErrorToMn(res.error);
        setErr(m);
        toast(m, "error");
        return;
      }

      toast("Амжилттай нэмлээ", "success");
      onClose();
      router.refresh();
    });
  }

  return (
    <AdminDrawer
      open={open}
      onClose={onClose}
      title="Шинэ тест"
      width={640}
      onSubmit={submit}
      footer={
        <>
          <DrawerCancelButton onClick={onClose} disabled={pending} />
          <DrawerSubmitButton pending={pending} label="Нэмэх" />
        </>
      }
    >
      <AdminFieldLabel htmlFor="pt-title">
        Гарчиг *
        <input
          id="pt-title"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={adminInputStyle}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="pt-slug">
        Slug *
        <input
          id="pt-slug"
          required
          maxLength={80}
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          style={adminInputStyle}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="pt-desc">
        Тайлбар
        <textarea
          id="pt-desc"
          maxLength={1000}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...adminInputStyle, resize: "vertical" }}
        />
      </AdminFieldLabel>

      <AdminContentImageFields
        prefix="pt"
        onCardFile={setCardFile}
        onHeroFile={setHeroFile}
        onDescriptionFile={setDescriptionFile}
      />

      <AdminFieldLabel htmlFor="pt-questions">
        Асуултууд (JSON) *
        <textarea
          id="pt-questions"
          required
          rows={10}
          value={questionsJson}
          onChange={(e) => setQuestionsJson(e.target.value)}
          placeholder={QUESTIONS_PLACEHOLDER}
          style={monoTextareaStyle}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="pt-scoring">
        Оноолтын дүрэм (JSON) *
        <textarea
          id="pt-scoring"
          required
          rows={8}
          value={scoringJson}
          onChange={(e) => setScoringJson(e.target.value)}
          placeholder={SCORING_PLACEHOLDER}
          style={monoTextareaStyle}
        />
      </AdminFieldLabel>

      {uploadStatus ? (
        <p style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>{uploadStatus}</p>
      ) : null}
      {err ? <p style={{ color: "var(--u-danger)", font: "var(--u-body-s)" }}>{err}</p> : null}
    </AdminDrawer>
  );
}
