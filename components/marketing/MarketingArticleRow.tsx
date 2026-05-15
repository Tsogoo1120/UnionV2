import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MarketingReveal } from "./MarketingReveal";

const articles = [
  { date: "Бямба, 5/10", min: "7 мин", title: "Зорилго — тэвчээрийн уртын асуудал", cat: "Эссэ" },
  { date: "Мяг., 5/06", min: "4 мин", title: "Өглөөний 20 минут — өдрийн архитектур", cat: "Дадал" },
  { date: "Пүр., 5/01", min: "9 мин", title: "Уур уцаар, мэдрэлийн систем, амьсгал", cat: "Сэтгэл судлал" },
];

const cardClass =
  "group flex flex-col overflow-hidden rounded-[var(--u-r-3)] border border-[var(--u-rule)] bg-[var(--u-surface-2)] text-inherit no-underline shadow-[var(--u-shadow-1)] transition-[transform,box-shadow] duration-[var(--u-dur-2)] ease-[var(--u-ease)] hover:-translate-y-px hover:shadow-[var(--u-shadow-3)] motion-reduce:transition-none motion-reduce:hover:translate-y-0";

const gradients = [
  "bg-[linear-gradient(135deg,var(--u-ember),var(--u-danger))]",
  "bg-[linear-gradient(135deg,var(--u-indigo),var(--u-dark))]",
  "bg-[linear-gradient(135deg,var(--u-ink-2),var(--u-dark))]",
] as const;

export function MarketingArticleRow() {
  return (
    <MarketingReveal
      id="articles"
      className="mx-auto max-w-container px-[var(--u-gutter)] py-[var(--u-s-12)] sm:py-[var(--u-s-20)] md:py-[var(--u-s-24)] [content-visibility:auto]"
      style={{ containIntrinsicSize: "auto 800px" }}
    >
      <div className="mb-[var(--u-s-8)] flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-balance font-[family-name:var(--u-display)] text-[clamp(2.25rem,8vw,4rem)] font-bold leading-none tracking-[-0.02em]">
          Нийтлэл
        </h2>
        <Link
          href="/dashboard"
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 self-start rounded-[var(--u-r-pill)] border border-[var(--u-rule-2)] px-3.5 py-2.5 font-[var(--u-body-s)] font-medium text-[var(--u-ink-2)] no-underline transition-[border-color,color,box-shadow] duration-[var(--u-dur-2)] ease-[var(--u-ease)] hover:border-[var(--u-ink-3)] hover:text-[var(--u-ink)] hover:shadow-[var(--u-shadow-1)] sm:self-auto"
        >
          Бүгдийг үзэх <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-[var(--u-s-6)]">
        {articles.map((a, i) => (
          <Link key={a.title} href="/dashboard" className={cardClass}>
            <div
              className={cn(
                "relative",
                i === 0 ? "aspect-[16/10]" : "aspect-video",
                gradients[i]
              )}
            >
              <Image
                src="/union-monogram.svg"
                alt="Union — нийтлэлийн зураг"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                loading="lazy"
                className="object-contain p-[14%_18%] opacity-[0.14]"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2.5 p-5 pb-6 sm:p-6">
              <div className="flex flex-wrap gap-2.5 font-[var(--u-body-s)] text-[var(--u-ink-3)]">
                <span className="font-medium text-[var(--u-ember)]">{a.cat}</span>
                <span aria-hidden>·</span>
                <span>{a.date}</span>
                <span aria-hidden>·</span>
                <span>{a.min}</span>
              </div>
              <div
                className={cn(
                  "font-[family-name:var(--u-display)] font-bold leading-[1.05] tracking-[-0.015em]",
                  i === 0 ? "text-[clamp(1.5rem,4vw,2.25rem)]" : "text-[clamp(1.25rem,3vw,1.625rem)]"
                )}
              >
                {a.title}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </MarketingReveal>
  );
}
