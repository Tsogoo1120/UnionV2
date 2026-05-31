import { Suspense } from "react";
import { TransactionsView } from "@/components/transactions/TransactionsView";
import { requireSession } from "@/lib/auth/requireSession";
import { listTransactions, countTransactions } from "@/lib/queries/transactions";
import { createClient } from "@/lib/supabase/server";
import {
  parseDayToFromIso,
  parseDayToToIso,
  parseStatusesParam,
  parseKindParam,
  parsePageParam,
} from "@/lib/transactions/parse-filters";

function TransactionsFallback() {
  return (
    <div
      style={{
        minHeight: "50vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        font: "var(--u-body)",
        color: "var(--u-ink-2)",
      }}
    >
      Loading…
    </div>
  );
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const supabase = await createClient();
  const profile = await requireSession();

  const fromRaw =
    typeof searchParams.from === "string" ? searchParams.from : undefined;
  const toRaw = typeof searchParams.to === "string" ? searchParams.to : undefined;
  const from = parseDayToFromIso(fromRaw);
  const to = parseDayToToIso(toRaw);
  const statuses = parseStatusesParam(searchParams.status);
  const kind = parseKindParam(
    typeof searchParams.kind === "string" ? searchParams.kind : undefined,
  );
  const page = parsePageParam(
    typeof searchParams.page === "string" ? searchParams.page : undefined,
  );
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const baseOpts = {
    userId: profile.id,
    from,
    to,
    statuses,
    kind,
  };

  const [rows, total] = await Promise.all([
    listTransactions(supabase, { ...baseOpts, limit: pageSize, offset }),
    countTransactions(supabase, baseOpts),
  ]);

  return (
    <Suspense fallback={<TransactionsFallback />}>
      <TransactionsView
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        subscriptionStatus={profile.subscription_status}
        initialFilters={{
          from: fromRaw,
          to: toRaw,
          statuses: statuses ?? [],
          kind,
        }}
      />
    </Suspense>
  );
}
