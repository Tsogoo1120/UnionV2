"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { createCollectiveReading } from "@/app/actions/admin/createCollectiveReading";
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
import { uploadVideoToR2 } from "@/lib/admin/client-uploads";
import { slugFromTitle } from "@/lib/admin/slug";
import { mapServerErrorToMn } from "@/lib/i18n/action-feedback";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreateCollectiveReadingDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [publish, setPublish] = useState(false);
  const [cardFile, setCardFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [descriptionFile, setDescriptionFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
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
      setBody("");
      setPublish(false);
      setCardFile(null);
      setHeroFile(null);
      setDescriptionFile(null);
      setVideoFile(null);
      setUploadStatus("");
      setErr(null);
    }
  }, [open]);

  function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!videoFile) {
      const m = "Видео файл сонгоно уу.";
      setErr(m);
      toast(m, "error");
      return;
    }

    startTransition(async () => {
      setUploadStatus("Байршуулж байна…");
      const s = slug || slugFromTitle(title);

      const imgs = await uploadContentImages({
        basePath: "readings",
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

      const vid = await uploadVideoToR2(videoFile, "collective-readings");
      if (vid.error || !vid.key) {
        const m = mapServerErrorToMn(vid.error ?? "Видео байршуулахад алдаа.");
        setErr(m);
        toast(m, "error");
        setUploadStatus("");
        return;
      }

      const fd = new FormData();
      fd.set("title", title);
      fd.set("slug", s);
      fd.set("description", description);
      fd.set("body", body);
      fd.set("cover_image_path", imgs.cardPath ?? "");
      fd.set("hero_image_path", imgs.heroPath ?? "");
      fd.set("description_image_path", imgs.descriptionPath ?? "");
      fd.set("video_r2_key", vid.key);
      fd.set("publish_immediately", publish ? "true" : "false");

      const res = await createCollectiveReading(fd);
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
      title="Шинэ хамтын уншилт"
      onSubmit={submit}
      footer={
        <>
          <DrawerCancelButton onClick={onClose} disabled={pending} />
          <DrawerSubmitButton pending={pending} label="Нэмэх" />
        </>
      }
    >
      <AdminFieldLabel htmlFor="cr-title">
        Гарчиг *
        <input
          id="cr-title"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={adminInputStyle}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="cr-slug">
        Slug *
        <input
          id="cr-slug"
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

      <AdminFieldLabel htmlFor="cr-desc">
        Тайлбар
        <textarea
          id="cr-desc"
          maxLength={1000}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...adminInputStyle, resize: "vertical" }}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="cr-body">
        Агуулга (Markdown)
        <textarea
          id="cr-body"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{ ...adminInputStyle, resize: "vertical" }}
        />
      </AdminFieldLabel>

      <AdminContentImageFields
        prefix="cr"
        onCardFile={setCardFile}
        onHeroFile={setHeroFile}
        onDescriptionFile={setDescriptionFile}
      />

      <AdminFieldLabel htmlFor="cr-video">
        Видео (MP4/WebM) *
        <input
          id="cr-video"
          type="file"
          accept="video/mp4,video/webm"
          onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
          style={adminInputStyle}
        />
      </AdminFieldLabel>

      <label style={{ display: "flex", alignItems: "center", gap: 8, font: "var(--u-body-s)" }}>
        <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
        Шууд нийтлэх
      </label>

      {uploadStatus ? (
        <p style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>{uploadStatus}</p>
      ) : null}
      {err ? <p style={{ color: "var(--u-danger)", font: "var(--u-body-s)" }}>{err}</p> : null}
    </AdminDrawer>
  );
}
