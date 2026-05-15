"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { z } from "zod";
import { setUserRole } from "@/app/actions/admin";
import type { AdminUserListRow } from "@/lib/queries/admin";
import { formatDate, statusLabel } from "@/lib/format";

export function UsersPanel({
  users,
  total,
  page,
  query,
}: {
  users: AdminUserListRow[];
  total: number;
  page: number;
  query: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(query);
  const [pending, startTransition] = useTransition();
  const [searchErr, setSearchErr] = useState<string | null>(null);

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    setSearchErr(null);
    const parsed = z.string().max(200, "Хайлт 200 тэмдэгтээс урт байж болохгүй.").safeParse(q);
    if (!parsed.success) {
      setSearchErr(parsed.error.issues[0]?.message ?? "");
      return;
    }
    const sp = new URLSearchParams();
    sp.set("tab", "users");
    if (q.trim()) sp.set("q", q.trim());
    sp.set("usersPage", "0");
    router.push(`/admin/dashboard?${sp.toString()}`);
  }

  function goPage(p: number) {
    const sp = new URLSearchParams();
    sp.set("tab", "users");
    if (query.trim()) sp.set("q", query.trim());
    sp.set("usersPage", String(p));
    router.push(`/admin/dashboard?${sp.toString()}`);
  }

  function roleAct(userId: string, role: "admin" | "user") {
    startTransition(async () => {
      const r = await setUserRole(userId, role);
      if (!r.error) window.location.reload();
    });
  }

  const pages = Math.max(1, Math.ceil(total / 25));

  return (
    <div>
      <form onSubmit={submitSearch} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="И-мэйл эсвэл нэрээр хайх"
          aria-invalid={Boolean(searchErr)}
          style={{ flex: 1, padding: 10, borderRadius: "var(--u-r-2)", border: "1px solid var(--u-rule-2)", minHeight: 44 }}
        />
        <button type="submit" style={{ padding: "10px 16px", borderRadius: "var(--u-r-2)", background: "var(--u-ink)", color: "var(--u-bg)", border: "none", cursor: "pointer", minHeight: 44 }}>
          Хайх
        </button>
      </form>
      {searchErr ? <p style={{ color: "var(--u-danger)", font: "var(--u-body-s)", marginTop: 8 }}>{searchErr}</p> : null}

      <div style={{ border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", overflow: "auto" }}>
        {users.map((u, i) => {
          const sub = statusLabel(u.subscription_status, "subscription");
          return (
            <div
              key={u.id}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr) auto auto auto",
                gap: 10,
                padding: "12px 14px",
                borderTop: i === 0 ? "none" : "1px solid var(--u-rule)",
                font: "var(--u-body-s)",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{u.full_name ?? "—"}</div>
                <div style={{ color: "var(--u-ink-3)" }}>{u.email}</div>
              </div>
              <div style={{ fontFamily: "var(--u-mono)", fontSize: 11 }}>
                {u.subscription_expires_at ? formatDate(u.subscription_expires_at) : "—"}
              </div>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "var(--u-rule)",
                  fontWeight: 600,
                }}
              >
                {u.role}
              </span>
              <span style={{ color: "var(--u-ink-2)" }}>{sub.label}</span>
              <div style={{ display: "flex", gap: 6 }}>
                {u.role === "user" ? (
                  <button type="button" disabled={pending} onClick={() => roleAct(u.id, "admin")} style={{ fontSize: 12, padding: "4px 8px", cursor: "pointer" }}>
                    Админ болгох
                  </button>
                ) : (
                  <button type="button" disabled={pending} onClick={() => roleAct(u.id, "user")} style={{ fontSize: 12, padding: "4px 8px", cursor: "pointer" }}>
                    Админ цуцлах
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center" }}>
        <span style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>
          Хуудас {page + 1} / {pages} (нийт {total})
        </span>
        <button type="button" disabled={page <= 0} onClick={() => goPage(page - 1)}>
          Өмнөх
        </button>
        <button type="button" disabled={page + 1 >= pages} onClick={() => goPage(page + 1)}>
          Дараах
        </button>
      </div>
    </div>
  );
}
