import type { SupabaseClient } from "@supabase/supabase-js";

export type TransactionKind = "subscription" | "coaching";

export interface TransactionRelated {
  slot_id?: string;
  slot_start_at?: string | null;
  slot_end_at?: string | null;
  slot_description?: string | null;
}

export interface TransactionRow {
  id: string;
  kind: TransactionKind;
  amount: number;
  currency: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  screenshot_path: string;
  bank_reference: string | null;
  admin_note: string | null;
  related: TransactionRelated;
}

export interface TransactionDetail extends TransactionRow {
  screenshot_url: string | null;
  reviewed_by: string | null;
}

export type TransactionAccess = {
  viewerId: string;
  isAdmin: boolean;
};

export interface ListTransactionsOpts {
  userId?: string;
  from?: string;
  to?: string;
  /** @deprecated Prefer `statuses` — kept for single-status callers */
  status?: string;
  /** When non-empty, rows must match one of these payment/booking statuses */
  statuses?: string[];
  kind?: "all" | "subscription" | "coaching";
  limit?: number;
  offset?: number;
}

type PaymentRow = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  screenshot_path: string;
  bank_reference: string | null;
  admin_note: string | null;
};

type BookingRow = PaymentRow & { slot_id: string };

type SlotRow = {
  id: string;
  start_at: string;
  end_at: string;
  description: string | null;
};

function applyPaymentFilters(
  supabase: SupabaseClient,
  opts: ListTransactionsOpts,
) {
  let q = supabase
    .from("payments")
    .select(
      "id, amount, currency, status, submitted_at, reviewed_at, screenshot_path, bank_reference, admin_note",
    );
  if (opts.userId) q = q.eq("user_id", opts.userId);
  const multi =
    opts.statuses && opts.statuses.length > 0 ? opts.statuses : null;
  if (multi) q = q.in("status", multi);
  else if (opts.status) q = q.eq("status", opts.status);
  if (opts.from) q = q.gte("submitted_at", opts.from);
  if (opts.to) q = q.lte("submitted_at", opts.to);
  return q;
}

function applyBookingFilters(
  supabase: SupabaseClient,
  opts: ListTransactionsOpts,
) {
  let q = supabase
    .from("coaching_bookings")
    .select(
      "id, slot_id, amount, currency, status, submitted_at, reviewed_at, screenshot_path, bank_reference, admin_note",
    );
  if (opts.userId) q = q.eq("user_id", opts.userId);
  const multi =
    opts.statuses && opts.statuses.length > 0 ? opts.statuses : null;
  if (multi) q = q.in("status", multi);
  else if (opts.status) q = q.eq("status", opts.status);
  if (opts.from) q = q.gte("submitted_at", opts.from);
  if (opts.to) q = q.lte("submitted_at", opts.to);
  return q;
}

async function signUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string | null,
): Promise<string | null> {
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60);

  if (error) return null;
  return data?.signedUrl ?? null;
}

/**
 * Unified payment + coaching booking rows, newest first.
 * Pagination: fetches `offset + limit` candidates from each source, merges, then slices.
 */
export async function listTransactions(
  supabase: SupabaseClient,
  opts: ListTransactionsOpts = {},
): Promise<TransactionRow[]> {
  const kind = opts.kind ?? "all";
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;
  const need = Math.max(offset + limit, 1);

  const paymentsPromise =
    kind === "coaching"
      ? Promise.resolve({ data: [] as PaymentRow[], error: null as null })
      : applyPaymentFilters(supabase, opts)
          .order("submitted_at", { ascending: false })
          .range(0, need - 1);

  const bookingsPromise =
    kind === "subscription"
      ? Promise.resolve({ data: [] as BookingRow[], error: null as null })
      : applyBookingFilters(supabase, opts)
          .order("submitted_at", { ascending: false })
          .range(0, need - 1);

  const [paymentsRes, bookingsRes] = await Promise.all([
    paymentsPromise,
    bookingsPromise,
  ]);

  if (paymentsRes.error) throw new Error(paymentsRes.error.message);
  if (bookingsRes.error) throw new Error(bookingsRes.error.message);

  const paymentsResult = paymentsRes.data ?? [];
  const bookingsResult = bookingsRes.data ?? [];

  const bookingSlotIds = bookingsResult.map((b) => b.slot_id);
  const slotsById = new Map<string, SlotRow>();

  if (bookingSlotIds.length > 0) {
    const { data: slots } = await supabase
      .from("coaching_slots")
      .select("id, start_at, end_at, description")
      .in("id", bookingSlotIds);

    for (const slot of slots ?? []) {
      slotsById.set(slot.id, slot);
    }
  }

  const transactionRows: TransactionRow[] = [
    ...paymentsResult.map((payment) => ({
      id: payment.id,
      kind: "subscription" as const,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      submitted_at: payment.submitted_at,
      reviewed_at: payment.reviewed_at,
      screenshot_path: payment.screenshot_path,
      bank_reference: payment.bank_reference,
      admin_note: payment.admin_note,
      related: {} satisfies TransactionRelated,
    })),
    ...bookingsResult.map((booking) => {
      const slot = booking.slot_id ? slotsById.get(booking.slot_id) : undefined;
      return {
        id: booking.id,
        kind: "coaching" as const,
        amount: Number(booking.amount),
        currency: booking.currency,
        status: booking.status,
        submitted_at: booking.submitted_at,
        reviewed_at: booking.reviewed_at,
        screenshot_path: booking.screenshot_path,
        bank_reference: booking.bank_reference,
        admin_note: booking.admin_note,
        related: {
          slot_id: booking.slot_id,
          slot_start_at: slot?.start_at ?? null,
          slot_end_at: slot?.end_at ?? null,
          slot_description: slot?.description ?? null,
        },
      };
    }),
  ];

  transactionRows.sort((a, b) =>
    b.submitted_at.localeCompare(a.submitted_at),
  );

  return transactionRows.slice(offset, offset + limit);
}

export async function getTransaction(
  supabase: SupabaseClient,
  id: string,
  kind: TransactionKind,
  access?: TransactionAccess,
): Promise<TransactionDetail | null> {
  if (kind === "subscription") {
    let pq = supabase
      .from("payments")
      .select(
        "id, user_id, amount, currency, status, submitted_at, reviewed_at, reviewed_by, screenshot_path, bank_reference, admin_note",
      )
      .eq("id", id);
    if (access && !access.isAdmin) {
      pq = pq.eq("user_id", access.viewerId);
    }
    const { data: payment, error } = await pq.maybeSingle();

    if (error) throw new Error(error.message);
    if (!payment) return null;

    return {
      id: payment.id,
      kind: "subscription",
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      submitted_at: payment.submitted_at,
      reviewed_at: payment.reviewed_at,
      screenshot_path: payment.screenshot_path,
      bank_reference: payment.bank_reference,
      admin_note: payment.admin_note,
      related: {},
      reviewed_by: payment.reviewed_by,
      screenshot_url: await signUrl(
        supabase,
        "payment-screenshots",
        payment.screenshot_path,
      ),
    };
  }

  let bq = supabase
    .from("coaching_bookings")
    .select(
      "id, user_id, slot_id, amount, currency, status, submitted_at, reviewed_at, reviewed_by, screenshot_path, bank_reference, admin_note",
    )
    .eq("id", id);
  if (access && !access.isAdmin) {
    bq = bq.eq("user_id", access.viewerId);
  }
  const { data: booking, error } = await bq.maybeSingle();

  if (error) throw new Error(error.message);
  if (!booking) return null;

  const { data: slot } = await supabase
    .from("coaching_slots")
    .select("id, start_at, end_at, description")
    .eq("id", booking.slot_id)
    .maybeSingle();

  return {
    id: booking.id,
    kind: "coaching",
    amount: Number(booking.amount),
    currency: booking.currency,
    status: booking.status,
    submitted_at: booking.submitted_at,
    reviewed_at: booking.reviewed_at,
    screenshot_path: booking.screenshot_path,
    bank_reference: booking.bank_reference,
    admin_note: booking.admin_note,
    related: {
      slot_id: booking.slot_id,
      slot_start_at: slot?.start_at ?? null,
      slot_end_at: slot?.end_at ?? null,
      slot_description: slot?.description ?? null,
    },
    reviewed_by: booking.reviewed_by,
    screenshot_url: await signUrl(
      supabase,
      "coaching-screenshots",
      booking.screenshot_path,
    ),
  };
}

export async function countTransactions(
  supabase: SupabaseClient,
  opts: ListTransactionsOpts = {},
): Promise<number> {
  const kind = opts.kind ?? "all";

  const countTable = async (table: "payments" | "coaching_bookings") => {
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (opts.userId) q = q.eq("user_id", opts.userId);
    const multi =
      opts.statuses && opts.statuses.length > 0 ? opts.statuses : null;
    if (multi) q = q.in("status", multi);
    else if (opts.status) q = q.eq("status", opts.status);
    if (opts.from) q = q.gte("submitted_at", opts.from);
    if (opts.to) q = q.lte("submitted_at", opts.to);
    const { count, error } = await q;
    if (error) throw new Error(error.message);
    return count ?? 0;
  };

  if (kind === "all") {
    return (await countTable("payments")) + (await countTable("coaching_bookings"));
  }

  return kind === "subscription"
    ? await countTable("payments")
    : await countTable("coaching_bookings");
}
