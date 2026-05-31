# Marketing UI kit

The public-facing landing for Union — explains the platform, lists services, surfaces upcoming coaching slots, drives Google OAuth sign-up.

## Routes recreated
- `/` — hero, services index, coaching strip, recent articles, footer
- `/coaching` — list of available 1:1 coaching slots (signed-out is fine)
- `/login` and `/register` — Google OAuth screens

## Components
- `Nav.jsx` — fixed top bar with wordmark, primary nav, sign-in + CTA
- `Hero.jsx` — serif hero, single ember CTA, eyebrow + dateline
- `ServiceList.jsx` — five numbered service rows (editorial table-of-contents feel)
- `CoachingStrip.jsx` — horizontally-listed available slots
- `ArticleRow.jsx` — latest article card
- `Footer.jsx` — dark inverse footer with wordmark + links

## Run
Open `index.html`. React 18 via UMD + Babel standalone.
