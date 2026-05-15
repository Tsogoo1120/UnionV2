---
name: union-design
description: Use this skill to generate well-branded interfaces and assets for Union — a Mongolian-language wellness/personal-development platform with video lessons, collective readings, psychology tests, articles, community, and 1:1 coaching. Editorial-modern aesthetic: warm cream paper, deep ink, one ember accent, Instrument Serif display + Geist UI. NOT mystic. Useful for production code or throwaway prototypes/mocks.
user-invocable: true
---

Read `README.md` for the full brand guide, then explore:

- `colors_and_type.css` — every token (`--u-*`) plus semantic element styles. Import once at the root.
- `assets/` — wordmark + monogram SVGs. Copy them out when needed.
- `preview/` — 20 small reference cards: type scale, color palettes, spacing/radii/shadows, components, brand mark.
- `ui_kits/marketing` — public landing reference
- `ui_kits/user-dashboard` — subscriber surface reference
- `ui_kits/admin-dashboard` — admin surface reference (indigo chrome — subscriber surfaces never use indigo)

## Operating rules — must-follow

- Copy is **Mongolian**. Set `lang="mn"` on the root. Headlines lean editorial: 700 first phrase, 300 second phrase (weight contrast replaces italics).
- **No mystic visual cues.** No stars, glow, gradients-on-purple, candles, tarot imagery. The platform is reflective but not occult.
- **No emoji.** Status uses semantic color + a tiny dot + text.
- **No italics.** Use weight contrast (700 → 300) for editorial pairings instead. Bricolage Grotesque has no italic.
- **Two type families:** Geist (display + UI) and Geist Mono (code/IDs/prices). No second family. Display is Geist 700 with tight tracking (-0.03 to -0.045em). The light 300 weight does the "second-clause whisper".
- **One accent** on subscriber surfaces: ember `#E84A1F`. Reserve for CTAs, the brand dot, single-link emphasis. Admin chrome adds **indigo `#1F2B4C`** as a chrome color only.
- **Cream paper, warm-dark ink.** Page `#F2EEE3`. Ink `#2A2520` (NOT pure black — black is too cold against cream). Cards `#FBF9F3`. Elevated white only on dialogs.
- **Borders before shadows.** Default card = `1px solid var(--u-rule)` + radius 12, no shadow.
- **Radii:** 4 (inputs/chips) · 8 (buttons) · 12 (cards) · 20 (heros/modals) · pill (status badges only). Buttons are NOT pills.
- **No bounces** in animation. Fade + slide, durations 120/200/320ms, cubic-bezier(.2,.7,.2,1).
- **Numbered indices** (`01 / 05`) are a brand motif — use them on service tiles, lesson cards, hero eyebrows.

## When invoked

- For **HTML artifacts** (prototypes, mocks, decks, throwaway designs): copy `colors_and_type.css` and any needed assets into the working directory, then `<link rel="stylesheet" href="colors_and_type.css">`. Pull components from the UI kits as reference.
- For **production code** (Next.js + Tailwind + Radix per the unionV2 spec): port the tokens in `colors_and_type.css` into `tailwind.config.ts` as theme extensions, then build components that match the visual rules above.

If the user invokes this skill without other context, ask what they want to build (page? feature? deck?), confirm 2–3 specifics (audience, length, any specific service area), then act as an expert designer who outputs polished HTML or production code.
