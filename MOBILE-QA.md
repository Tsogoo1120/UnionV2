# Mobile QA checklist (Phase 6)

**Орчин:** Chrome DevTools — 375×667 (iPhone SE) болон 390×844 (iPhone 14). Нэмэлтээр бодит утас дээр давтан шалгасан.  
**Огноо:** 2026-05-15

Доорх бүх зүйлсийг шалгаж, ажиллагаа, товчлуурын хэмжээ (дор хаяж 44px), хэвтээ гүйлгээний гажуудалтгүй байдлыг баталгаажуулсан.

## Checklist

- [x] Marketing home: hamburger works, drawer scrolls
- [x] Sign-in flow completes
- [x] `/dashboard`: bottom nav switches tabs, no horizontal scroll, lesson cards readable
- [x] `/transactions`: filters open as bottom sheet, rows tappable, detail sheet opens, screenshot zooms
- [x] `/payment`: form submits, file picker works (Safari iOS quirks), success redirects
- [x] `/lessons/[slug]`: video plays, controls reachable, fullscreen works
- [x] `/tests/[slug]`: one question per screen, prev/next work, submit works
- [x] `/community`: feed scrolls, FAB doesn't overlap content, composer opens
- [x] `/admin/dashboard`: hamburger opens sidebar, every tab functional, payment approval works on mobile
- [x] Landscape orientation: nothing breaks
- [x] Tap targets ≥44px on every interactive element (зорилтот хуудсууд)

## Тэмдэглэл

- **Slow 3G:** `app/loading.tsx` болон хуудасны `loading.tsx` файлууд skeleton харуулж байгааг шалгасан.
- **Глобал алдаа:** серверийн алдааны үед `app/error.tsx` дээрх «Дахин оролдох» товч ажиллана.
- **A11y:** доод самбар, шүүлтийн sheet зэрэгт `aria-label` / `role="dialog"` тохируулга хийгдсэн.
