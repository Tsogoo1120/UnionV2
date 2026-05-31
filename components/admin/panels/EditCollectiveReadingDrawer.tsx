"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { updateCollectiveReading } from "@/app/actions/collective-readings";
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
import { uploadVideoToR2 } from "@/lib/admin/client-uploads";
import { slugFromTitle } from "@/lib/admin/slug";
import { mapServerErrorToMn } from "@/lib/i18n/action-feedback";
import type { CollectiveReading } from "@/lib/types";

type Props = {
  open: boolean;
  item: CollectiveReading | null;
  onClose: () => void;
};

export function EditCollectiveReadingDrawer({ open, item, onClose }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
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
      setDescription(item.description ?? "");
      setBody(item.body ?? "");
      setCardFile(null);
      setHeroFile(null);
      setDescriptionFile(null);
      setVideoFile(null);
      setUploadStatus("");
      setErr(null);
    }
  }, [open, item]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!item) return;
    setErr(null);

    startTransition(async () => {
      setUploadStatus("Uploading…");
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

      let video_r2_key = item.video_r2_key;
      if (videoFile) {
        const vid = await uploadVideoToR2(videoFile, "collective-readings");
        if (vid.error || !vid.key) {
          const m = mapServerErrorToMn(vid.error ?? "Failed to upload video.");
          setErr(m);
          toast(m, "error");
          setUploadStatus("");
          return;
        }
        video_r2_key = vid.key;
      }

      const patch: Parameters<typeof updateCollectiveReading>[1] = {
        title,
        slug: s,
        description,
        body,
        video_r2_key,
      };
      if (imgs.cardPath) patch.cover_image_path = imgs.cardPath;
      if (imgs.heroPath) patch.hero_image_path = imgs.heroPath;
      if (imgs.descriptionPath) patch.description_image_path = imgs.descriptionPath;

      const res = await updateCollectiveReading(item.id, patch);
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
      title="Edit collective reading"
      onSubmit={submit}
      footer={
        <>
          <DrawerCancelButton onClick={onClose} disabled={pending} />
          <DrawerSubmitButton pending={pending} label="Save" />
        </>
      }
    >
      <AdminFieldLabel htmlFor="ecr-title">
        Title *
        <input
          id="ecr-title"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={adminInputStyle}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="ecr-slug">
        Slug *
        <input
          id="ecr-slug"
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

      <AdminFieldLabel htmlFor="ecr-desc">
        Description
        <textarea
          id="ecr-desc"
          maxLength={1000}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...adminInputStyle, resize: "vertical" }}
        />
      </AdminFieldLabel>

      <AdminFieldLabel htmlFor="ecr-body">
        Content (Markdown)
        <textarea
          id="ecr-body"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{ ...adminInputStyle, resize: "vertical" }}
        />
      </AdminFieldLabel>

      <AdminContentImageFields
        prefix="ecr"
        cardPath={item?.cover_image_path}
        heroPath={item?.hero_image_path}
        descriptionPath={item?.description_image_path}
        onCardFile={setCardFile}
        onHeroFile={setHeroFile}
        onDescriptionFile={setDescriptionFile}
      />

      <AdminFieldLabel htmlFor="ecr-video">
        Replace video (MP4/WebM, optional)
        <input
          id="ecr-video"
          type="file"
          accept="video/mp4,video/webm"
          onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
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
