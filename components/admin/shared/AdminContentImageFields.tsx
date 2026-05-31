"use client";

import { AdminFieldLabel, adminInputStyle } from "@/components/admin/shared/AdminDrawer";
import { uploadMediaThumbnail } from "@/lib/admin/client-uploads";

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
const IMAGE_HINT = "JPEG/PNG/WebP, up to 3MB";

type ImageFieldProps = {
  id: string;
  label: string;
  currentPath?: string | null;
  onFileChange: (file: File | null) => void;
};

function AdminImageFileField({ id, label, currentPath, onFileChange }: ImageFieldProps) {
  return (
    <AdminFieldLabel htmlFor={id}>
      <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span>{label}</span>
        <span
          style={{
            font: "var(--u-mono)",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            padding: "1px 7px",
            borderRadius: 999,
            background: "var(--u-surface)",
            border: "1px solid var(--u-rule-2)",
            color: "var(--u-ink-3)",
          }}
        >
          Optional
        </span>
      </span>
      <span style={{ display: "block", font: "var(--u-body-s)", color: "var(--u-ink-3)", marginBottom: 2 }}>
        {IMAGE_HINT} · leave empty to skip
      </span>
      {currentPath ? (
        <span style={{ display: "block", font: "var(--u-body-s)", color: "var(--u-ink-3)", marginBottom: 4 }}>
          Current: {currentPath}
        </span>
      ) : null}
      <input
        id={id}
        type="file"
        accept={IMAGE_ACCEPT}
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        style={adminInputStyle}
      />
    </AdminFieldLabel>
  );
}

type Props = {
  prefix: string;
  /** articles/readings: cover_image_path; lessons: thumbnail_path */
  cardLabel?: string;
  cardPath?: string | null;
  heroPath?: string | null;
  descriptionPath?: string | null;
  onCardFile: (file: File | null) => void;
  onHeroFile: (file: File | null) => void;
  onDescriptionFile: (file: File | null) => void;
};

export function AdminContentImageFields({
  prefix,
  cardLabel = "Card image",
  cardPath,
  heroPath,
  descriptionPath,
  onCardFile,
  onHeroFile,
  onDescriptionFile,
}: Props) {
  return (
    <>
      <AdminImageFileField
        id={`${prefix}-card`}
        label={cardLabel}
        currentPath={cardPath}
        onFileChange={onCardFile}
      />
      <AdminImageFileField
        id={`${prefix}-hero`}
        label="Hero image"
        currentPath={heroPath}
        onFileChange={onHeroFile}
      />
      <AdminImageFileField
        id={`${prefix}-desc-img`}
        label="Description image"
        currentPath={descriptionPath}
        onFileChange={onDescriptionFile}
      />
    </>
  );
}

export async function uploadContentImages(opts: {
  basePath: string;
  slug: string;
  /** e.g. "cover" or "thumbnail" */
  cardName: string;
  cardFile: File | null;
  heroFile: File | null;
  descriptionFile: File | null;
}): Promise<{
  cardPath?: string;
  heroPath?: string;
  descriptionPath?: string;
  error?: string;
}> {
  const s = opts.slug || "draft";
  const base = `${opts.basePath}/${s}`;

  async function up(file: File | null, name: string): Promise<string | { error: string } | undefined> {
    if (!file) return undefined;
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const path = `${base}/${name}.${ext}`;
    const res = await uploadMediaThumbnail(path, file);
    if (res.error) return { error: res.error };
    return res.path ?? path;
  }

  const card = await up(opts.cardFile, opts.cardName);
  if (card && typeof card === "object" && "error" in card) return { error: card.error };

  const hero = await up(opts.heroFile, "hero");
  if (hero && typeof hero === "object" && "error" in hero) return { error: hero.error };

  const desc = await up(opts.descriptionFile, "description");
  if (desc && typeof desc === "object" && "error" in desc) return { error: desc.error };

  return {
    cardPath: typeof card === "string" ? card : undefined,
    heroPath: typeof hero === "string" ? hero : undefined,
    descriptionPath: typeof desc === "string" ? desc : undefined,
  };
}
