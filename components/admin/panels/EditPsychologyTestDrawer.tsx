"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { updateTest } from "@/app/actions/tests";
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
import {
  parseQuestionsJson,
  parseScoringRulesJson,
} from "@/components/admin/panels/CreatePsychologyTestDrawer";
import { useToast } from "@/components/shell/Toast";
import { slugFromTitle } from "@/lib/admin/slug";
import { mapServerErrorToMn } from "@/lib/i18n/action-feedback";
import type { PsychologyTest } from "@/lib/types";

type Props = {
  open: boolean;
  item: PsychologyTest | null;
  onClose: () => void;
};

const monoTextareaStyle: React.CSSProperties = {
  ...adminInputStyle,
  resize: "vertical",
  minHeight: 160,
  fontFamily: "var(--u-mono)",
  fontSize: 13,
};

export function EditPsychologyTestDrawer({ open, item, onClose }: Props) {
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
    if (open && item) {
      setTitle(item.title);
      setSlug(item.slug);
      setSlugTouched(false);
      setDescription(item.description ?? "");
      setQuestionsJson(JSON.stringify(item.questions, null, 2));
      setScoringJson(JSON.stringify(item.scoring_rules, null, 2));
      setCardFile(null);
      setHeroFile(null);
      setDescriptionFile(null);
      setUploadStatus("");
      setErr(null);
    }
  }, [open, item]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!item) return;
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

      const patch: Parameters<typeof updateTest>[1] = {
        slug: s,
        title: title.trim(),
        description: description.trim() || null,
        questions: questionsResult.data!,
        scoring_rules: scoringResult.data!,
      };
      if (imgs.cardPath) patch.cover_image_path = imgs.cardPath;
      if (imgs.heroPath) patch.hero_image_path = imgs.heroPath;
      if (imgs.descriptionPath) patch.description_image_path = imgs.descriptionPath;

      const res = await updateTest(item.id, patch);
      setUploadStatus("");

      if (res.error) {
        const m = mapServerErrorToMn(res.error);
        setErr(m);
        toast(m, "error");
        return;
      }

      toast("Амжилттай хадгаллаа", "success");
      onClose();
      router.refresh();
    });
  }

  return (
    <AdminDrawer
      open={open}
      onClose={onClose}
      title="Тест засах"
      width={640}
      onSubmit={submit}
      footer={
        <>
          <DrawerCancelButton onClick={onClose} disabled={pending} />
          <DrawerSubmitButton pending={pending} label="Хадгалах" />
        </>
      }
    >
      <AdminFieldLabel htmlFor="ept-title">
        Гарчиг *
        <input
          id="ept-title"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={adminInputStyle}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="ept-slug">
        Slug *
        <input
          id="ept-slug"
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

      <AdminFieldLabel htmlFor="ept-desc">
        Тайлбар
        <textarea
          id="ept-desc"
          maxLength={1000}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...adminInputStyle, resize: "vertical" }}
        />
      </AdminFieldLabel>

      <AdminContentImageFields
        prefix="ept"
        cardPath={item?.cover_image_path}
        heroPath={item?.hero_image_path}
        descriptionPath={item?.description_image_path}
        onCardFile={setCardFile}
        onHeroFile={setHeroFile}
        onDescriptionFile={setDescriptionFile}
      />

      <AdminFieldLabel htmlFor="ept-questions">
        Асуултууд (JSON) *
        <textarea
          id="ept-questions"
          required
          rows={10}
          value={questionsJson}
          onChange={(e) => setQuestionsJson(e.target.value)}
          style={monoTextareaStyle}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="ept-scoring">
        Оноолтын дүрэм (JSON) *
        <textarea
          id="ept-scoring"
          required
          rows={8}
          value={scoringJson}
          onChange={(e) => setScoringJson(e.target.value)}
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
