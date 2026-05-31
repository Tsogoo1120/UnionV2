"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getSiteSettingsAdmin,
  presignIntroVideoUpload,
  saveIntroPosterPath,
  saveIntroVideoKey,
} from "@/app/actions/admin/site-settings";
import { useToast } from "@/components/shell/Toast";
import { uploadMediaThumbnail } from "@/lib/admin/client-uploads";
import { mapServerErrorToMn } from "@/lib/i18n/action-feedback";

export function SiteSettingsPanel() {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [introVideoR2Key, setIntroVideoR2Key] = useState<string | null>(null);
  const [introPosterPath, setIntroPosterPath] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    startTransition(async () => {
      const res = await getSiteSettingsAdmin();
      if (res.error) toast(mapServerErrorToMn(res.error), "error");
      else {
        setIntroVideoR2Key(res.introVideoR2Key);
        setIntroPosterPath(res.introPosterPath);
      }
    });
  }, [toast]);

  function uploadIntroVideo() {
    if (!videoFile) {
      toast("Please select an intro video.", "error");
      return;
    }
    startTransition(async () => {
      setStatus("Uploading video…");
      const presign = await presignIntroVideoUpload(videoFile.type);
      if (presign.error || !presign.uploadUrl) {
        toast(mapServerErrorToMn(presign.error ?? "Error"), "error");
        setStatus("");
        return;
      }
      const put = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": videoFile.type },
        body: videoFile,
      });
      if (!put.ok) {
        toast("Failed to upload video.", "error");
        setStatus("");
        return;
      }
      const save = await saveIntroVideoKey();
      setStatus("");
      if (save.error) {
        toast(mapServerErrorToMn(save.error), "error");
        return;
      }
      setIntroVideoR2Key(presign.key ?? "site/intro.mp4");
      setVideoFile(null);
      toast("Intro video saved", "success");
    });
  }

  function uploadPoster() {
    if (!posterFile) {
      toast("Please select a poster image.", "error");
      return;
    }
    startTransition(async () => {
      setStatus("Uploading poster…");
      const ext = (posterFile.name.split(".").pop() ?? "jpg").toLowerCase();
      const path = `site/intro-poster.${ext}`;
      const up = await uploadMediaThumbnail(path, posterFile);
      if (up.error) {
        toast(mapServerErrorToMn(up.error), "error");
        setStatus("");
        return;
      }
      const save = await saveIntroPosterPath(path);
      setStatus("");
      if (save.error) {
        toast(mapServerErrorToMn(save.error), "error");
        return;
      }
      setIntroPosterPath(path);
      setPosterFile(null);
      toast("Poster saved", "success");
    });
  }

  return (
    <section style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <div className="u-eyebrow">Intro</div>
        <h2 style={{ font: "var(--u-h3)", margin: "8px 0 0" }}>Homepage video</h2>
        <p style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)", margin: "8px 0 16px" }}>
          R2 key: <code style={{ fontFamily: "var(--u-mono)" }}>site/intro.mp4</code>
          {introVideoR2Key ? (
            <>
              <br />
              Current: {introVideoR2Key}
            </>
          ) : null}
        </p>
        <label style={{ display: "block", font: "var(--u-body-s)", marginBottom: 8 }}>
          Video (MP4/WebM)
          <input
            type="file"
            accept="video/mp4,video/webm"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            style={{ display: "block", marginTop: 6, width: "100%" }}
          />
        </label>
        <button
          type="button"
          disabled={pending}
          onClick={uploadIntroVideo}
          style={{
            marginTop: 12,
            padding: "10px 16px",
            borderRadius: "var(--u-r-2)",
            border: "none",
            background: "var(--u-ink)",
            color: "var(--u-bg)",
            fontWeight: 600,
            cursor: pending ? "wait" : "pointer",
          }}
        >
          Save video
        </button>
      </div>

      <div style={{ borderTop: "1px solid var(--u-rule)", paddingTop: 24 }}>
        <h3 style={{ font: "var(--u-h4)", margin: "0 0 8px" }}>Video poster</h3>
        {introPosterPath ? (
          <p style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)", margin: "0 0 12px" }}>
            Current: {introPosterPath}
          </p>
        ) : null}
        <label style={{ display: "block", font: "var(--u-body-s)", marginBottom: 8 }}>
          Poster (JPEG/PNG/WebP, 3MB)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setPosterFile(e.target.files?.[0] ?? null)}
            style={{ display: "block", marginTop: 6, width: "100%" }}
          />
        </label>
        <button
          type="button"
          disabled={pending}
          onClick={uploadPoster}
          style={{
            marginTop: 12,
            padding: "10px 16px",
            borderRadius: "var(--u-r-2)",
            border: "none",
            background: "var(--u-ink)",
            color: "var(--u-bg)",
            fontWeight: 600,
            cursor: pending ? "wait" : "pointer",
          }}
        >
          Save poster
        </button>
      </div>

      {status ? (
        <p style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>{status}</p>
      ) : null}
    </section>
  );
}
