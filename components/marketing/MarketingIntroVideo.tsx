import { MarketingReveal } from "./MarketingReveal";

type Props = {
  introVideoUrl: string | null;
  posterUrl?: string | null;
};

export function MarketingIntroVideo({ introVideoUrl, posterUrl }: Props) {
  return (
    <MarketingReveal
      className="bg-[var(--u-ink)] text-[var(--u-dark-ink)] [content-visibility:auto]"
      style={{ containIntrinsicSize: "auto 720px" }}
    >
      <div className="mx-auto max-w-container px-[var(--u-gutter)] py-[var(--u-s-12)] sm:py-[var(--u-s-20)]">
        <div className="u-eyebrow text-[var(--u-dark-ink-2)]">Union · Танилцуулга</div>
        <h2 className="mt-3 max-w-[24ch] text-balance font-[family-name:var(--u-display)] text-[clamp(2.25rem,6vw,4rem)] font-bold leading-[1.02] tracking-[-0.02em]">
          Бид юу хийдэг вэ?
        </h2>
        <p className="mb-[var(--u-s-10)] mt-4 max-w-[35ch] font-[var(--u-body-l)] leading-[1.55] text-[var(--u-dark-ink-2)] text-pretty sm:max-w-[560px]">
          Union нь видео хичээл, хамтын уншилт, нийгэмлэг болон 1:1 коучингийг нэг дороос авах
          гишүүнчлэлийн платформ юм. Доорх богино танилцуулгаар үйлчилгээгээ танилцуулж байна.
        </p>

        <div className="aspect-video overflow-hidden rounded-[var(--u-r-3)] border border-[var(--u-dark-rule)] bg-[var(--u-dark-2)] shadow-[var(--u-shadow-1)] transition-shadow duration-[var(--u-dur-2)] ease-[var(--u-ease)] hover:shadow-[var(--u-shadow-3)] motion-reduce:transition-none">
          {introVideoUrl ? (
            <video
              controls
              playsInline
              poster={posterUrl ?? undefined}
              src={introVideoUrl}
              className="block h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-[var(--u-body)] text-[var(--u-dark-ink-2)]">
              Танилцуулгын видео удахгүй нэмэгдэнэ.
            </div>
          )}
        </div>
      </div>
    </MarketingReveal>
  );
}
