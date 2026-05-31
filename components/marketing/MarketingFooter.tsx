import Link from "next/link";
import { MarketingReveal } from "./MarketingReveal";

const cols = [
  { h: "Үйлчилгээ", l: ["Видео хичээл", "Хамтын уншилт", "Нийгэмлэг", "Тест", "Нийтлэл"] },
  {
    h: "Холбоос",
    l: [
      { label: "Instagram", href: "https://www.instagram.com/tsogoo_1120/" },
      { label: "Facebook", href: "https://www.facebook.com/altan.tsog.373688/" },
      { label: "YouTube", href: "https://www.youtube.com/@tsogoo_1120" },
    ],
  },
];

const footerLinkClass =
  "font-[var(--u-body)] text-[var(--u-dark-ink)] no-underline transition-[color,opacity] duration-[var(--u-dur-2)] ease-[var(--u-ease)] hover:text-[var(--u-ember)]";

export function MarketingFooter() {
  return (
    <MarketingReveal
      id="about"
      className="mt-[var(--u-s-16)] bg-[var(--u-ink)] text-[var(--u-dark-ink)] [content-visibility:auto]"
      style={{ containIntrinsicSize: "auto 520px" }}
    >
      <div className="mx-auto max-w-container px-[var(--u-gutter)] pb-10 pt-[var(--u-s-12)] sm:pt-[var(--u-s-20)]">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-10">
          <div>
            <div className="flex items-baseline">
              <span className="font-[family-name:var(--u-display)] text-[clamp(2.5rem,8vw,3.5rem)] font-bold tracking-[-0.04em]">
                Union
              </span>
              <span className="ml-px text-[clamp(2.5rem,8vw,3.5rem)] font-bold leading-none text-[var(--u-ember)]">
                .
              </span>
            </div>
            <p className="mt-5 max-w-[22ch] font-[var(--u-body-l)] text-[var(--u-dark-ink-2)] text-pretty sm:max-w-[360px]">
              Өөрийгөө хөгжүүлэх зорилготой платформ
            </p>
            <p className="mt-4 font-[var(--u-body-s)] text-[var(--u-dark-ink-2)]">
              <Link href="/dashboard" className={footerLinkClass}>
                Хяналтын самбар
              </Link>
              {" · "}
              <Link href="/admin/dashboard" className={footerLinkClass}>
                Админ
              </Link>
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <div className="u-eyebrow mb-4 text-[var(--u-dark-ink-2)]">{c.h}</div>
<ul className="m-0 flex list-none flex-col gap-2.5 p-0">
  {c.l.map((x) => (
    <li key={typeof x === "string" ? x : x.label}>
      <Link href={typeof x === "string" ? "/dashboard" : x.href} className={footerLinkClass}>
        {typeof x === "string" ? x : x.label}
      </Link>
    </li>
  ))}
</ul>
            </div>
          ))}
        </div>
        <div className="mt-[var(--u-s-16)] flex flex-col gap-3 border-t border-[var(--u-dark-rule)] pt-6 font-[var(--u-body-s)] text-[var(--u-dark-ink-2)] sm:flex-row sm:justify-between sm:gap-4">
          <span className="text-pretty">© 2026 Union · Улаанбаатар Г.Алтанцог энэ өөрөө энэ вэбсайт хийв</span>
          <span className="shrink-0">Сар бүрийн гишүүнчлэл · 50,000₮</span>
        </div>
      </div>
    </MarketingReveal>
  );
}
