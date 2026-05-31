"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { updateVideoLesson } from "@/app/actions/video-lessons";
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
import {
  readVideoDurationSeconds,
  uploadVideoToR2,
} from "@/lib/admin/client-uploads";
import { slugFromTitle } from "@/lib/admin/slug";
import { mapServerErrorToMn } from "@/lib/i18n/action-feedback";
import type { VideoLesson } from "@/lib/types";

type Props = {
  open: boolean;
  item: VideoLesson | null;
  onClose: () => void;
  categories: string[];
};

export function EditVideoLessonDrawer({ open, item, onClose, categories }: Props) {
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
  const [cardFile, setCardFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [descriptionFile, setDescriptionFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    if (!slugTouched && title) setSlug(slugFromTitle(title));
  }, [title, slugTouched]);

  useEffect(() => {
    if (open && item) {
      setTitle(item.title);
      setSlug(item.slug);
      setSlugTouched(false);
      setCategory(item.category ?? "");
      setDescription(item.description ?? "");
      setBody(item.body ?? "");
      setSortOrder(String(item.sort_order ?? 0));
      setDuration(item.duration_seconds != null ? String(item.duration_seconds) : "");
      setCardFile(null);
      setHeroFile(null);
      setDescriptionFile(null);
      setVideoFile(null);
      setUploadStatus("");
      setErr(null);
    }
  }, [open, item]);

  useEffect(() => {
    if (!videoFile) return;
    readVideoDurationSeconds(videoFile).then((sec) => {
      if (sec != null) setDuration(String(sec));
    });
  }, [videoFile]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!item) return;
    setErr(null);

    startTransition(async () => {
      setUploadStatus("Uploading…");
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

      let video_r2_key = item.video_r2_key;
      if (videoFile) {
        const vid = await uploadVideoToR2(videoFile, "video-lessons");
        if (vid.error || !vid.key) {
          const m = mapServerErrorToMn(vid.error ?? "Failed to upload video.");
          setErr(m);
          toast(m, "error");
          setUploadStatus("");
          return;
        }
        video_r2_key = vid.key;
      }

      const patch: Parameters<typeof updateVideoLesson>[1] = {
        title,
        slug: s,
        category,
        description,
        body,
        sort_order: Number.parseInt(sortOrder, 10) || 0,
        video_r2_key,
        duration_seconds: duration ? Number.parseInt(duration, 10) : null,
      };
      if (imgs.cardPath) patch.thumbnail_path = imgs.cardPath;
      if (imgs.heroPath) patch.hero_image_path = imgs.heroPath;
      if (imgs.descriptionPath) patch.description_image_path = imgs.descriptionPath;

      const res = await updateVideoLesson(item.id, patch);
      setUploadStatus("");

      if (res.error) {
        const m = mapServerErrorToMn(res.error);
        setErr(m);
        toast(m, "error");
        return;
      }

      toast("Saved successfully", "success");
      onClose();
      router.refresh();
    });
  }

  return (
    <AdminDrawer
      open={open}
      onClose={onClose}
      title="Edit video lesson"
      onSubmit={submit}
      footer={
        <>
          <DrawerCancelButton onClick={onClose} disabled={pending} />
          <DrawerSubmitButton pending={pending} label="Save" />
        </>
      }
    >
      <AdminFieldLabel htmlFor="evl-title">
        Title *
        <input
          id="evl-title"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={adminInputStyle}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="evl-slug">
        Slug *
        <input
          id="evl-slug"
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

      <AdminFieldLabel htmlFor="evl-category">
        Category *
        <input
          id="evl-category"
          required
          list="evl-categories"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={adminInputStyle}
        />
        <datalist id="evl-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="evl-desc">
        Description
        <textarea
          id="evl-desc"
          maxLength={1000}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...adminInputStyle, resize: "vertical" }}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="evl-body">
        Content (Markdown)
        <textarea
          id="evl-body"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{ ...adminInputStyle, resize: "vertical" }}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="evl-sort">
        Sort order
        <input
          id="evl-sort"
          type="number"
          min={0}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={adminInputStyle}
        />
      </AdminFieldLabel>

      <AdminContentImageFields
        prefix="evl"
        cardLabel="Card image"
        cardPath={item?.thumbnail_path}
        heroPath={item?.hero_image_path}
        descriptionPath={item?.description_image_path}
        onCardFile={setCardFile}
        onHeroFile={setHeroFile}
        onDescriptionFile={setDescriptionFile}
      />

      <AdminFieldLabel htmlFor="evl-video">
        Replace video (MP4/WebM, optional)
        <input
          id="evl-video"
          type="file"
          accept="video/mp4,video/webm"
          onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
          style={adminInputStyle}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="evl-duration">
        Duration (seconds)
        <input
          id="evl-duration"
          type="number"
          min={0}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          style={adminInputStyle}
        />
      </AdminFieldLabel>

      {uploadStatus ? (
        <p style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>{uploadStatus}</p>
      ) : null}
      {err ? <p style={{ color: "var(--u-danger)", font: "var(--u-body-s)" }}>{err}</p> : null}
    </AdminDrawer>
  );
}
