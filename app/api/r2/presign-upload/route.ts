/**
 * POST /api/r2/presign-upload
 *
 * Admin-only. Returns `{ key, uploadUrl }` for a fresh R2 object,
 * which the client then uploads to directly via PUT.
 *
 * Body: { filename: string, contentType: string, kind: "video-lessons" | "collective-readings" }
 *
 * Used by the admin video-upload UI in the dashboard / admin panels.
 * The same helper is also called by server actions in
 * app/actions/video-lessons.ts; this HTTP endpoint exists for the
 * direct-fetch case (future external integrations).
 */
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/app/actions/admin";
import { generateR2Key, presignUpload } from "@/lib/r2/presign";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_KINDS = ["video-lessons", "collective-readings"] as const;
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;

export async function POST(req: Request): Promise<NextResponse> {
  try {
    await verifyAdmin();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Not authorized." },
      { status: 401 },
    );
  }

  let body: { filename?: unknown; contentType?: unknown; kind?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const filename =
    typeof body.filename === "string" && body.filename.trim()
      ? body.filename.trim()
      : null;
  const contentType =
    typeof body.contentType === "string" ? body.contentType : null;
  const kind = typeof body.kind === "string" ? body.kind : "video-lessons";

  if (!filename) {
    return NextResponse.json({ error: "Missing filename" }, { status: 400 });
  }
  if (!contentType || !ALLOWED_TYPES.includes(contentType as never)) {
    return NextResponse.json(
      {
        error: `Content-Type must be one of: ${ALLOWED_TYPES.join(", ")}`,
      },
      { status: 400 },
    );
  }
  if (!ALLOWED_KINDS.includes(kind as never)) {
    return NextResponse.json(
      { error: `kind must be one of: ${ALLOWED_KINDS.join(", ")}` },
      { status: 400 },
    );
  }

  const key = generateR2Key(kind, filename);
  const uploadUrl = await presignUpload({ key, contentType });

  return NextResponse.json({ key, uploadUrl });
}
