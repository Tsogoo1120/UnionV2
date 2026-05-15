"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { updateArticle } from "@/app/actions/articles";
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
import type { Article } from "@/lib/types";

type Props = {
  open: boolean;
  item: Article | null;
  onClose: () => void;
};

function estimateReadingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function EditArticleDrawer({ open, item, onClose }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [readingMinutes, setReadingMinutes] = useState("1");
  const [readingTouched, setReadingTouched] = useState(false);
  const [cardFile, setCardFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [descriptionFile, setDescriptionFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const autoMinutes = useMemo(() => estimateReadingMinutes(body), [body]);

  useEffect(() => {
    if (!slugTouched && title) setSlug(slugFromTitle(title));
  }, [title, slugTouched]);

  useEffect(() => {
    if (!readingTouched) setReadingMinutes(String(autoMinutes));
  }, [autoMinutes, readingTouched]);

  useEffect(() => {
    if (open && item) {
      setTitle(item.title);
      setSlug(item.slug);
      setSlugTouched(false);
      setExcerpt(item.excerpt ?? "");
      setBody(item.body);
      setReadingMinutes(String(item.reading_minutes ?? 1));
      setReadingTouched(false);
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

    startTransition(async () => {
      setUploadStatus("Байршуулж байна…");
      const s = slug || slugFromTitle(title);

      const imgs = await uploadContentImages({
        basePath: "articles",
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

      const patch: Parameters<typeof updateArticle>[1] = {
        title,
        slug: s,
        excerpt,
        body,
        reading_minutes: Number.parseInt(readingMinutes, 10) || autoMinutes,
      };
      if (imgs.cardPath) patch.cover_image_path = imgs.cardPath;
      if (imgs.heroPath) patch.hero_image_path = imgs.heroPath;
      if (imgs.descriptionPath) patch.description_image_path = imgs.descriptionPath;

      const res = await updateArticle(item.id, patch);
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
      title="Нийтлэл засах"
      width={640}
      onSubmit={submit}
      footer={
        <>
          <DrawerCancelButton onClick={onClose} disabled={pending} />
          <DrawerSubmitButton pending={pending} label="Хадгалах" />
        </>
      }
    >
      <AdminFieldLabel htmlFor="ear-title">
        Гарчиг *
        <input
          id="ear-title"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={adminInputStyle}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="ear-slug">
        Slug *
        <input
          id="ear-slug"
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

      <AdminFieldLabel htmlFor="ear-excerpt">
        Товч тайлбар *
        <textarea
          id="ear-excerpt"
          required
          maxLength={500}
          rows={3}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          style={{ ...adminInputStyle, resize: "vertical" }}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="ear-body">
        Агуулга (Markdown) *
        <textarea
          id="ear-body"
          required
          rows={12}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{
            ...adminInputStyle,
            resize: "vertical",
            minHeight: 300,
            fontFamily: "var(--u-mono)",
            fontSize: 13,
          }}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="ear-minutes">
        Унших цаг (минут) *
        <input
          id="ear-minutes"
          type="number"
          min={1}
          required
          value={readingMinutes}
          onChange={(e) => {
            setReadingTouched(true);
            setReadingMinutes(e.target.value);
          }}
          style={adminInputStyle}
        />
      </AdminFieldLabel>

      <AdminContentImageFields
        prefix="ear"
        cardPath={item?.cover_image_path}
        heroPath={item?.hero_image_path}
        descriptionPath={item?.description_image_path}
        onCardFile={setCardFile}
        onHeroFile={setHeroFile}
        onDescriptionFile={setDescriptionFile}
      />

      {uploadStatus ? (
        <p style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>{uploadStatus}</p>
      ) : null}
      {err ? <p style={{ color: "var(--u-danger)", font: "var(--u-body-s)" }}>{err}</p> : null}
    </AdminDrawer>
  );
}
