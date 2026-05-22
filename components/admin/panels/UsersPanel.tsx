"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type CSSProperties, type FormEvent } from "react";
import { z } from "zod";
import { setUserRole } from "@/app/actions/admin";
import type { AdminUserListRow } from "@/lib/queries/admin";
import { formatDate, statusLabel } from "@/lib/format";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { EmptyState } from "@/components/ui/empty-state";

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
  const isDesktop = useMediaQuery("(min-width: 641px)");

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

  const pillBtn = (active: boolean): CSSProperties => ({
    minHeight: 44,
    padding: "8px 16px",
    borderRadius: "var(--u-r-pill)",
    border: active ? "none" : "1px solid var(--u-rule-2)",
    background: active ? "var(--u-ink)" : "transparent",
    color: active ? "var(--u-bg)" : "var(--u-ink-2)",
    font: "var(--u-body-s)",
    fontWeight: 500,
    cursor: "pointer",
  });

  return (
    <div>
      <form onSubmit={submitSearch} style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="И-мэйл эсвэл нэрээр хайх"
          aria-invalid={Boolean(searchErr)}
          className={searchErr ? "u-field u-field--error" : "u-field"}
          style={{ flex: "1 1 200px" }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            borderRadius: "var(--u-r-2)",
            background: "var(--u-ink)",
            color: "var(--u-bg)",
            border: "none",
            cursor: "pointer",
            minHeight: 48,
            font: "var(--u-body-s)",
            fontWeight: 600,
          }}
        >
          Хайх
        </button>
      </form>
      {searchErr ? <p className="u-field-error" style={{ marginTop: 0, marginBottom: 12 }}>{searchErr}</p> : null}

      <div style={{ border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-3)", overflow: "hidden" }}>
        {users.length === 0 ? (
          <EmptyState title="Хэрэглэгч олдсонгүй" body="Хайлтын нөхцөлөө өөрчлөн дахин оролдоно уу." />
        ) : null}
        {users.map((u, i) => {
          const sub = statusLabel(u.subscription_status, "subscription");
          return isDesktop ? (
            <div
              key={u.id}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr) auto auto auto",
                gap: 10,
                padding: "12px 14px",
                borderTop: i === 0 && users.length > 0 ? "none" : "1px solid var(--u-rule)",
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
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => roleAct(u.id, "admin")}
                    style={{ fontSize: 12, padding: "8px 10px", minHeight: 44, cursor: "pointer", borderRadius: "var(--u-r-2)", border: "1px solid var(--u-rule-2)" }}
                  >
                    Админ болгох
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => roleAct(u.id, "user")}
                    style={{ fontSize: 12, padding: "8px 10px", minHeight: 44, cursor: "pointer", borderRadius: "var(--u-r-2)", border: "1px solid var(--u-rule-2)" }}
                  >
                    Админ цуцлах
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              key={u.id}
              style={{
                padding: 16,
                borderTop: i === 0 && users.length > 0 ? "none" : "1px solid var(--u-rule)",
                background: "var(--u-surface-2)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                font: "var(--u-body-s)",
              }}
            >
              <div style={{ fontWeight: 700 }}>{u.full_name ?? "—"}</div>
              <div style={{ color: "var(--u-ink-3)" }}>{u.email}</div>
              <div style={{ fontFamily: "var(--u-mono)", fontSize: 11 }}>
                {u.subscription_expires_at ? formatDate(u.subscription_expires_at) : "—"}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ padding: "2px 8px", borderRadius: 999, background: "var(--u-rule)", fontWeight: 600 }}>{u.role}</span>
                <span style={{ color: "var(--u-ink-2)" }}>{sub.label}</span>
              </div>
              {u.role === "user" ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => roleAct(u.id, "admin")}
                  style={{ minHeight: 44, padding: "10px 14px", borderRadius: "var(--u-r-2)", border: "1px solid var(--u-rule-2)", background: "transparent", cursor: "pointer", width: "100%" }}
                >
                  Админ болгох
                </button>
              ) : (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => roleAct(u.id, "user")}
                  style={{ minHeight: 44, padding: "10px 14px", borderRadius: "var(--u-r-2)", border: "1px solid var(--u-rule-2)", background: "transparent", cursor: "pointer", width: "100%" }}
                >
                  Админ цуцлах
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>
          Хуудас {page + 1} / {pages} (нийт {total})
        </span>
        <button type="button" disabled={page <= 0} onClick={() => goPage(page - 1)} style={pillBtn(false)}>
          Өмнөх
        </button>
        <button type="button" style={pillBtn(true)} aria-current="page">
          {page + 1}
        </button>
        <button type="button" disabled={page + 1 >= pages} onClick={() => goPage(page + 1)} style={pillBtn(false)}>
          Дараах
        </button>
      </div>
    </div>
  );
}
