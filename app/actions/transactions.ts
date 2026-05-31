"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getTransaction,
  listTransactions,
  type ListTransactionsOpts,
  type TransactionDetail,
  type TransactionKind,
} from "@/lib/queries/transactions";
import { formatDate, formatMNT, statusLabel } from "@/lib/format";

export type ExportTransactionsInput = Pick<
  ListTransactionsOpts,
  "from" | "to" | "statuses" | "kind"
>;

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function slotTimeExportLabel(row: {
  kind: TransactionKind;
  related: { slot_start_at?: string | null; slot_end_at?: string | null };
}): string {
  if (row.kind !== "coaching") return "";
  const start = row.related.slot_start_at;
  if (!start) return "";
  const end = row.related.slot_end_at;
  const startTxt = formatDate(start, { withTime: true });
  if (!end) return startTxt;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return startTxt;
  const mins = Math.round(ms / 60000);
  return `${startTxt} (${mins} min)`;
}

/**
 * Read-only export: SELECT via `listTransactions` batches, returns UTF-8 CSV.
 */
export async function exportTransactionsCSV(
  opts: ExportTransactionsInput,
): Promise<{ csv?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const listOpts: ListTransactionsOpts = {
    userId: user.id,
    from: opts.from,
    to: opts.to,
    statuses: opts.statuses,
    kind: opts.kind ?? "all",
  };

  const batchSize = 200;
  const rows = [];
  for (let offset = 0; ; offset += batchSize) {
    const batch = await listTransactions(supabase, {
      ...listOpts,
      limit: batchSize,
      offset,
    });
    rows.push(...batch);
    if (batch.length < batchSize) break;
  }

  const header = [
    "Date",
    "Type",
    "Amount (₮)",
    "Status",
    "Reference",
    "Coaching time",
  ];
  const lines = [header.join(",")];

  for (const row of rows) {
    const kindMn =
      row.kind === "subscription" ? "Membership" : "Coaching";
    const statusMn = statusLabel(row.status, "payment").label;
    const date = formatDate(row.submitted_at, { withTime: true });
    const ref = row.bank_reference ?? "";
    lines.push(
      [
        csvEscape(date),
        csvEscape(kindMn),
        csvEscape(formatMNT(row.amount)),
        csvEscape(statusMn),
        csvEscape(ref),
        csvEscape(slotTimeExportLabel(row)),
      ].join(","),
    );
  }

  return { csv: "\uFEFF" + lines.join("\n") };
}

export type TransactionDetailResult =
  | { error: string }
  | {
      detail: TransactionDetail;
      reviewerFullName: string | null;
      isAdmin: boolean;
    };

export async function fetchTransactionDetail(
  id: string,
  kind: TransactionKind,
): Promise<TransactionDetailResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." as const };

  const { data: prof, error: pe } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (pe) return { error: pe.message };

  const isAdmin = prof?.role === "admin";
  const detail = await getTransaction(supabase, id, kind, {
    viewerId: user.id,
    isAdmin: Boolean(isAdmin),
  });
  if (!detail) return { error: "Not found." as const };

  let reviewerFullName: string | null = null;
  if (isAdmin && detail.reviewed_by) {
    const { data: rev } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", detail.reviewed_by)
      .maybeSingle();
    const fn = rev?.full_name?.trim();
    reviewerFullName = fn && fn.length > 0 ? fn : rev?.email ?? null;
  }

  return { detail, reviewerFullName, isAdmin: Boolean(isAdmin) };
}
