import Link from "next/link";
import type { CoachingSlot } from "@/lib/types";
import { formatMNT } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MarketingReveal } from "./MarketingReveal";

type Props = {
  slots: CoachingSlot[];
  signedIn?: boolean;
};

function formatSlotDisplay(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = dayNames[start.getDay()] ?? "";
  const date = String(start.getDate());
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][start.getMonth()] ?? "";
  const time = `${start.toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" })} — ${end.toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" })}`;
  return { day, date, month, time };
}

const slotCardClass =
  "block rounded-[var(--u-r-3)] border border-[var(--u-dark-rule)] bg-[var(--u-dark-2)] p-6 text-inherit no-underline shadow-[var(--u-shadow-1)] transition-[transform,box-shadow,border-color] duration-[var(--u-dur-2)] ease-[var(--u-ease)] hover:-translate-y-px hover:shadow-[var(--u-shadow-3)] motion-reduce:transition-none motion-reduce:hover:translate-y-0";

export function MarketingCoachingStrip({ slots, signedIn = false }: Props) {
  const display = slots.slice(0, 4);

  return (
    <MarketingReveal
      id="coaching"
      className="bg-[var(--u-ink)] text-[var(--u-dark-ink)] [content-visibility:auto]"
      style={{ containIntrinsicSize: "auto 640px" }}
    >
      <div className="mx-auto max-w-container px-[var(--u-gutter)] py-[var(--u-s-12)] sm:py-[var(--u-s-20)]">
        <div className="mb-[var(--u-s-10)] grid items-end gap-[var(--u-s-8)] md:grid-cols-2 md:gap-[var(--u-s-16)]">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div className="u-eyebrow text-[var(--u-dark-ink-2)]">1:1 online meeting</div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  background: "rgba(255,255,255,0.12)",
                  color: "var(--u-dark-ink-2)",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                </svg>
                Not included in membership
              </span>
            </div>
            <h2 className="mt-1 max-w-[16ch] text-balance font-[family-name:var(--u-display)] text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.02] tracking-[-0.02em]">
              Book a session.
              <br />
              <span className="font-light text-[var(--u-dark-ink-2)]">Pick your time.</span>
            </h2>
          </div>
          <div>
            <p className="m-0 max-w-[26ch] font-[var(--u-body-l)] text-[var(--u-dark-ink-2)] text-pretty sm:max-w-[420px]">
              The hour is split in two. In the first half, I answer 3 questions of your choice with the tarot cards. In the second half, we talk through your situation in detail and give guidance.
            </p>
            <p className="mt-4 m-0 font-[var(--u-body-s)] text-[var(--u-dark-ink-2)] opacity-75">
              This is a one-time, bookable service that is separate from the membership.
            </p>
          </div>
        </div>

        {display.length === 0 ? (
          <p className="font-[var(--u-body)] text-[var(--u-dark-ink-2)]">
            No open slots right now. More will be added soon.
          </p>
        ) : (
          <div
            className={cn(
              "grid gap-4",
              display.length === 1 && "grid-cols-1",
              display.length === 2 && "grid-cols-1 sm:grid-cols-2",
              display.length === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
              display.length >= 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            )}
          >
            {display.map((slot) => {
              const { day, date, month, time } = formatSlotDisplay(slot.start_at, slot.end_at);
              const href = signedIn
                ? `/coaching/book/${slot.id}`
                : `/auth?next=${encodeURIComponent(`/coaching/book/${slot.id}`)}`;

              return (
                <Link key={slot.id} href={href} className={slotCardClass}>
                  <div className="mb-6 flex items-baseline gap-2">
                    <span className="font-[family-name:var(--u-display)] text-[clamp(2.5rem,8vw,3.5rem)] font-bold leading-none tracking-[-0.02em] text-[var(--u-dark-ink)]">
                      {date}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-[var(--u-body-s)] text-[var(--u-dark-ink-2)]">{month}</span>
                      <span className="font-[var(--u-body-s)] font-semibold text-[var(--u-dark-ink)]">{day}</span>
                    </div>
                  </div>
                  <div className="font-[var(--u-body)] font-medium text-[var(--u-dark-ink)]">{time}</div>
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--u-dark-rule)] pt-4">
                    <span className="font-[var(--u-body-s)] text-[var(--u-dark-ink-2)]">{formatMNT(slot.price)}</span>
                    <span className="text-[13px] font-medium text-[var(--u-ember)]">Book →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </MarketingReveal>
  );
}
