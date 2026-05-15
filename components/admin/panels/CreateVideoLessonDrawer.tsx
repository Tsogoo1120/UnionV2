"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { createVideoLesson } from "@/app/actions/admin/createVideoLesson";
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
import { readVideoDurationSeconds, uploadVideoToR2 } from "@/lib/admin/client-uploads";
import { slugFromTitle } from "@/lib/admin/slug";
import { mapServerErrorToMn } from "@/lib/i18n/action-feedback";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: string[];
};

export function CreateVideoLessonDrawer({ open, onClose, categories }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [duration, setDuration] = useState("");
  const [publish, setPublish] = useState(false);
  const [cardFile, setCardFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [descriptionFile, setDescriptionFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    if (!slugTouched && title) {
      setSlug(slugFromTitle(title));
    }
  }, [title, slugTouched]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setSlug("");
      setSlugTouched(false);
      setCategory("");
      setDescription("");
      setBody("");
      setSortOrder("0");
      setDuration("");
      setPublish(false);
      setCardFile(null);
      setHeroFile(null);
      setDescriptionFile(null);
      setVideoFile(null);
      setUploadStatus("");
      setErr(null);
    }
  }, [open]);

  useEffect(() => {
    if (!videoFile) return;
    readVideoDurationSeconds(videoFile).then((sec) => {
      if (sec != null) setDuration(String(sec));
    });
  }, [videoFile]);

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
        basePath: "lessons",
        slug: s,
        cardName: "thumbnail",
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

      const vid = await uploadVideoToR2(videoFile, "video-lessons");
      if (vid.error || !vid.key) {
        const m = mapServerErrorToMn(vid.error ?? "Видео байршуулахад алдаа.");
        setErr(m);
        toast(m, "error");
        setUploadStatus("");
        return;
      }

      const fd = new FormData();
      fd.set("title", title);
      fd.set("slug", slug);
      fd.set("category", category);
      fd.set("description", description);
      fd.set("body", body);
      fd.set("sort_order", sortOrder);
      fd.set("thumbnail_path", imgs.cardPath ?? "");
      fd.set("hero_image_path", imgs.heroPath ?? "");
      fd.set("description_image_path", imgs.descriptionPath ?? "");
      fd.set("video_r2_key", vid.key);
      fd.set("duration_seconds", duration);
      fd.set("publish_immediately", publish ? "true" : "false");

      const res = await createVideoLesson(fd);
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
      title="Шинэ видео хичээл"
      onSubmit={submit}
      footer={
        <>
          <DrawerCancelButton onClick={onClose} disabled={pending} />
          <DrawerSubmitButton pending={pending} label="Нэмэх" />
        </>
      }
    >
      <AdminFieldLabel htmlFor="vl-title">
        Гарчиг *
        <input
          id="vl-title"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={adminInputStyle}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="vl-slug">
        Slug *
        <input
          id="vl-slug"
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

      <AdminFieldLabel htmlFor="vl-category">
        Ангилал *
        <input
          id="vl-category"
          required
          list="vl-categories"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={adminInputStyle}
        />
        <datalist id="vl-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="vl-desc">
        Тайлбар
        <textarea
          id="vl-desc"
          maxLength={1000}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...adminInputStyle, resize: "vertical" }}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="vl-body">
        Агуулга (Markdown)
        <textarea
          id="vl-body"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{ ...adminInputStyle, resize: "vertical" }}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="vl-sort">
        Эрэмбэ
        <input
          id="vl-sort"
          type="number"
          min={0}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={adminInputStyle}
        />
      </AdminFieldLabel>

      <AdminContentImageFields
        prefix="vl"
        onCardFile={setCardFile}
        onHeroFile={setHeroFile}
        onDescriptionFile={setDescriptionFile}
      />

      <AdminFieldLabel htmlFor="vl-video">
        Видео (MP4/WebM, 2GB хүртэл) *
        <input
          id="vl-video"
          type="file"
          accept="video/mp4,video/webm"
          onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
          style={adminInputStyle}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="vl-duration">
        Үргэлжлэх хугацаа (секунд)
        <input
          id="vl-duration"
          type="number"
          min={0}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
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
