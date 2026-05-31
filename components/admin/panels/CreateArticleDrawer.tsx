"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { createArticle } from "@/app/actions/admin/createArticle";
import {
  AdminDrawer,
  AdminFieldLabel,
  DrawerCancelButton,
  DrawerSubmitButton,
  adminInputStyle,
} from "@/components/admin/shared/AdminDrawer";
import { useToast } from "@/components/shell/Toast";
import {
  AdminContentImageFields,
  uploadContentImages,
} from "@/components/admin/shared/AdminContentImageFields";
import { slugFromTitle } from "@/lib/admin/slug";
import { mapServerErrorToMn } from "@/lib/i18n/action-feedback";

type Props = {
  open: boolean;
  onClose: () => void;
};

function estimateReadingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function CreateArticleDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [readingMinutes, setReadingMinutes] = useState("1");
  const [readingTouched, setReadingTouched] = useState(false);
  const [publish, setPublish] = useState(false);
  const [cardFile, setCardFile] = useState<File | null>(null);
  const [cardTouched, setCardTouched] = useState(false);
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
    if (!open) {
      setTitle("");
      setSlug("");
      setSlugTouched(false);
      setExcerpt("");
      setDescription("");
      setBody("");
      setReadingMinutes("1");
      setReadingTouched(false);
      setPublish(false);
      setCardFile(null);
      setCardTouched(false);
      setHeroFile(null);
      setDescriptionFile(null);
      setUploadStatus("");
      setErr(null);
    }
  }, [open]);

  function handleHeroFile(file: File | null) {
    setHeroFile(file);
    if (!cardTouched) setCardFile(file);
  }

  function handleCardFile(file: File | null) {
    setCardTouched(true);
    setCardFile(file);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);

    startTransition(async () => {
      setUploadStatus("Uploading…");
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

      const fd = new FormData();
      fd.set("title", title);
      fd.set("slug", s);
      fd.set("excerpt", excerpt);
      fd.set("description", description);
      fd.set("body", body);
      fd.set("cover_image_path", imgs.cardPath ?? "");
      fd.set("hero_image_path", imgs.heroPath ?? "");
      fd.set("description_image_path", imgs.descriptionPath ?? "");
      fd.set("reading_minutes", readingMinutes);
      fd.set("publish_immediately", publish ? "true" : "false");

      const res = await createArticle(fd);
      setUploadStatus("");

      if (res.error) {
        const m = mapServerErrorToMn(res.error);
        setErr(m);
        toast(m, "error");
        return;
      }

      toast("Added successfully", "success");
      onClose();
      router.refresh();
    });
  }

  return (
    <AdminDrawer
      open={open}
      onClose={onClose}
      title="New article"
      width={640}
      onSubmit={submit}
      footer={
        <>
          <DrawerCancelButton onClick={onClose} disabled={pending} />
          <DrawerSubmitButton pending={pending} label="Add" />
        </>
      }
    >
      <AdminFieldLabel htmlFor="ar-title">
        Title *
        <input
          id="ar-title"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={adminInputStyle}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="ar-slug">
        Slug *
        <input
          id="ar-slug"
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

      <AdminFieldLabel htmlFor="ar-excerpt">
        Excerpt *
        <textarea
          id="ar-excerpt"
          required
          maxLength={500}
          rows={3}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          style={{ ...adminInputStyle, resize: "vertical" }}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="ar-description">
        Description
        <textarea
          id="ar-description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...adminInputStyle, resize: "vertical" }}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="ar-body">
        Content (Markdown) *
        <textarea
          id="ar-body"
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

      <AdminFieldLabel htmlFor="ar-minutes">
        Reading time (minutes) *
        <input
          id="ar-minutes"
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
        prefix="ar"
        onCardFile={handleCardFile}
        onHeroFile={handleHeroFile}
        onDescriptionFile={setDescriptionFile}
      />

      <label style={{ display: "flex", alignItems: "center", gap: 8, font: "var(--u-body-s)" }}>
        <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
        Publish immediately
      </label>

      {uploadStatus ? (
        <p style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>{uploadStatus}</p>
      ) : null}
      {err ? <p style={{ color: "var(--u-danger)", font: "var(--u-body-s)" }}>{err}</p> : null}
    </AdminDrawer>
  );
}
