# Union Design System

A clean, modern, editorial design system for **Union** — a Mongolian-language wellness & personal-development platform offering a monthly subscription bundle of video lessons, collective tarot/reading content, psychology tests, articles, and a private community, plus 1:1 coaching slots sold à la carte.

> "Дотоод гэрэл, гадаад үйл." — *Inner light, outer work.*

Despite the platform's reflective subject matter, the brand is deliberately **not mystic**. No stars, no glow, no purple-and-gold occult cues. The visual language is editorial-modern: one clean grotesk doing all the work, warm paper, softened warm-dark ink (never pure black), one ember accent.

## Sources & context

This design system was built from the **unionV2 backend architecture spec** (pasted at the start of the project) — no codebase or Figma file was attached. The spec defines:

- Stack: Next.js 14 App Router · Supabase (Auth + Storage + Postgres) · Cloudflare R2 for video · Resend · Tailwind · Vercel
- Five subscriber services: video lessons, collective readings, community, psychology tests, articles
- 1:1 coaching sold per-slot with admin-approved manual MNT payment
- Subscription: 50,000₮/month, manual screenshot verification, 30-day rolling renewal
- Language: hardcoded Mongolian (`lang="mn"`)
- Primary audience: Mongolian-speaking adults, mobile-first banking flow

If/when a real codebase or Figma file becomes available, this system should be reconciled against it — particularly typography decisions and any existing brand mark.

---

## Index

```
README.md                 — this file
SKILL.md                  — agent skill entrypoint
colors_and_type.css       — all tokens + semantic element styles
assets/                   — wordmark + monogram SVGs
fonts/                    — (none on disk — Google Fonts CDN; see "Type")
preview/                  — Design System tab cards (type, color, spacing, components, brand)
ui_kits/
  marketing/              — public landing page
  user-dashboard/         — authenticated subscriber surface
  admin-dashboard/        — internal admin surface (indigo chrome)
```

---

## Content fundamentals

**Language.** Mongolian (Cyrillic). All product copy is in Mongolian; tokens and code identifiers are in English. Some UI metadata is bilingual (e.g. service index shows "Видео хичээл" with a quiet *video lessons* serif italic underneath — an editorial flourish, not a translation aid).

**Voice.** Calm, confident, a little literary. Speaks to the reader as an adult who chose to be here. No exclamation marks. No hustle vocabulary. No mystical language ("energy", "vibrations", "destiny") — even in the readings product, copy describes the *practice*, not the prediction.

**Specific moves:**
- Headlines stand alone as fragments. Often a comma between two clauses, never a period mid-line. Example: *Дотоод гэрэл, гадаад үйл.* / *Долоон минут, нэг бодол.*
- Serif italic is reserved for the **second clause** of a paired headline — it whispers the answer. *Сайн уу, ▸ Алтан-Оч.* (italic) · *Нээлттэй цаг ▸ сонгож захиал.* (italic)
- Numerals are real numerals, never spelled. Prices: `50,000₮` (comma thousands, no space before symbol). References: monospace.
- Dates Mongolian-formatted: `2026.05.16` or `5-р сар · 16 · Лха.`
- Casing: Sentence case for everything. **No ALL CAPS** except the 12px eyebrow label and small monospace tags.
- Pronouns: second-person ("та") for instructions, never "you" — Mongolian polite form by default.
- Emoji: never. Status uses semantic color + a tiny dot or text label.

**Vibe.** Editorial magazine on warm paper, not a SaaS dashboard. Lots of negative space. The page should feel like it could be **read aloud**.

---

## Visual foundations

**Color.** Two paper tones, a ramped ink, one ember accent, one indigo (admin-only), three semantic pairs.

- Paper: `#F2EEE3` (page), `#FBF9F3` (card), `#FFFFFF` (elevated). The cream is doing real work — never use pure white as the page background.
- Ink ramp: `#2A2520` → `#5C564D` → `#8E887E` → `#BAB3A5`. Warm dark, not black — ink has a brown undertone that sits on cream without harshness.
- Hairlines: `#E0D9C8` (rule), `#D2C9B2` (rule-2 / divider).
- Accent: **ember `#E84A1F`** — primary CTAs, the brand-mark dot, hover state of `--u-ink` buttons, single-link emphasis. Used rarely.
- Admin accent: **indigo `#1F2B4C`** — appears only in admin chrome (sidebar, badges). Subscriber surfaces never use it.
- Semantic: success `#2B6B3D` + soft `#DCE8DD` · warn `#B97A12` + `#F3E4C0` · danger `#B8341A` + `#F1D8D2`.

**Type.**
- **One family — Geist** (300–900). Display at weight 700 with tight tracking (-0.03 to -0.045em). UI body at 400. Light 300 handles the second-clause "whisper" in paired headlines.
- **Mono: Geist Mono** for code/IDs/references (`GLM-784521`), small numerals, prices in tables.
- The 12-px **eyebrow** (uppercase, 0.14em tracking, ink-3) is the only consistent UPPERCASE convention.
- **No italics, no second family.** All editorial contrast is delivered through **weight** (700 ↔ 300) and **letter-spacing** (display tight, body neutral).

> **Font substitution flag.** Geist + Geist Mono are loaded from **Google Fonts** (CDN). No `.ttf` files committed. If you have an owned typeface, send it and I'll swap.

**Spacing.** 4-point scale, tokens `--u-s-1`…`--u-s-24`. Most layouts breathe at `s-4`/`s-6`; section padding is `s-16`/`s-20`. Container is **1240px**, gutter 32px on desktop.

**Backgrounds.** Flat color, period. No gradients on subscriber surfaces. **One exception:** placeholder cover gradients on video/article thumbnails (135° two-tone) stand in for real imagery — these become photos once real assets exist. The dark sections use solid ink, not gradients. No textures, no grain, no patterns. Cream paper is the texture.

**Imagery (when added).** Plan for editorial photography — warm/natural light, neutral palette, never saturated. B&W is fine. Avoid stock-photo "wellness" tropes (hands holding tea, lit candles, sunsets) and any tarot iconography. Real environments and quiet portraits.

**Animation.** Restrained, purposeful.
- Easing: `cubic-bezier(.2,.7,.2,1)` for state, `cubic-bezier(.16,1,.3,1)` for entries.
- Durations: 120ms (hover), 200ms (state), 320ms (drawer/modal).
- No bounces. No springs. Fades and slides only. The brand never moves more than it must.

**Hover states.**
- Primary button: ink → ember background, no shift.
- Secondary button: surface → surface-tint, border → ink.
- Links: underline thickness stays 1px, color → ember.
- Cards: subtle border darken (rule → rule-2), no scale.

**Press states.** `translateY(0)` (no shift) + `inset 0 1px 0 rgba(20,17,13,.08)`. Buttons get fractionally darker, never lighter. Cards do not press — they're not buttons.

**Borders.** Hairlines first. `1px solid var(--u-rule)` is the default surface treatment. Border carries elevation more than shadow does. The system has no double borders, no colored borders (except focus), no thicker-than-1px decorative rules.

**Shadows.** Four steps, all very soft.
- `shadow-0` — just a 1px ring, no real shadow (default card)
- `shadow-1` — hairline shadow, resting elevated card
- `shadow-2` — raised feature card
- `shadow-3` — modals, drawers, dropdowns
No shadows on subscriber-content tiles. Inverse dark sections use no shadows — the contrast itself carries the elevation.

**Transparency & blur.** One place: the marketing top nav uses `rgba(242,238,227,.85)` + `backdrop-filter: blur(10px)` so headlines pass under it. Nothing else uses blur. No glass cards, no frosted panels.

**Corner radii.** Small and deliberate: 0 / 4 / 8 / 12 / 20 / pill. Buttons are 8px (not pill). Cards are 12px. Inputs are 8px. The hero, search composer, and modal sheets get 20px. **Pill is reserved for status badges and toggle buttons.** Rounded-corner-with-colored-left-accent is forbidden.

**Cards.** `var(--u-surface-2)` background + `1px solid var(--u-rule)` + `border-radius: 12px`. Content padding is 18–28px. No shadow at rest. Optional `shadow-1` only when the card is hover-able and primary.

**Focus.** `box-shadow: 0 0 0 3px rgba(232,74,31,.35)` — ember at 35% alpha. Visible, brand-tinted, sufficient contrast on both cream and dark.

**Layout rules.**
- Fixed top nav on marketing and dashboard, sticky sidebar on admin.
- Hero content lives in the **top-left**; primary CTA in the **bottom-right** of the same hero block — editorial bias.
- Numbered indices (`01 / 05`) are a recurring motif — service hub, hero eyebrows, lesson cards. They give the platform its serial / weekly-publication feel.
- Tables are bordered, not striped. Header row gets `--u-surface`; body rows are `--u-surface-2`.

---

## Iconography

The system uses **inline SVG strokes** at `stroke-width: 1.4–1.6`, set in `currentColor`, drawn as needed in components. Style: thin-line, geometric, **Lucide-adjacent**. No filled icons. No emoji ever.

When more breadth is needed, the recommended CDN drop-in is **Lucide** (https://lucide.dev) — matches the existing stroke weight and editorial weight. No icon font is committed to the project.

A handful of recurring glyphs in the kits:

| Glyph | Use |
|---|---|
| `→` arrow + diagonal `↗` (drawn as SVG path) | "go to" affordance on cards and service tiles |
| Play circle (1.2-stroke circle + triangle) | Lesson covers |
| Magnifying glass | Search composer |
| Chevron down | Selects, accordions |
| Plus | "Шинэ" actions |

The single non-icon **brand glyph** is the **ember dot** following the wordmark (`Union.`) — the only consistent ornament in the system.

---

## What's in here

- **`colors_and_type.css`** — all tokens (`--u-*`), semantic element styles, and `.u-eyebrow` / `.u-serif` utilities. Google Fonts import is at the top. Import once at the root of any HTML file.
- **`assets/`** — Union wordmark (light + dark), monogram U with ember dot, ready to drop in.
- **`preview/`** — 20 small HTML cards that populate the Design System tab. Split by Type / Colors / Spacing / Components / Brand.
- **`ui_kits/marketing`** — public landing: nav, hero, editorial service index, dark coaching strip, articles, footer.
- **`ui_kits/user-dashboard`** — authenticated subscriber surface: hub, lesson library, coaching list, profile/billing. Tab-switch between screens via top nav.
- **`ui_kits/admin-dashboard`** — internal admin: indigo sidebar, overview KPIs, payment approval queue with screenshot pane, coaching slot manager with create-drawer, content CMS.

Each UI kit has its own `README.md` describing the screens and components.

---

## Known caveats / to confirm

1. **No codebase / Figma was provided.** This system is inferred from the backend spec and the user's brief ("clean modern bold minimal creative, not mystic"). Existing brand decisions may differ.
2. **Fonts are Google CDN** — Instrument Serif + Geist + Geist Mono. If you have owned typefaces, send them and I'll switch.
3. **Service naming** uses my Mongolian renderings (e.g. "Хамтын уншилт" for collective readings). Confirm or correct.
4. **Coaching slot copy** assumes 1-hour blocks at 150,000₮ — matches the spec's default but please verify.
5. **The ember dot in the wordmark** is a brand decision I made — single ornament, replaces any other mark. Easy to remove if there's an existing logo.
