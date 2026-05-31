# User Dashboard UI kit

Authenticated, subscription-gated user surface. Five-service hub + service detail screens.

## Screens
- **Hub** (`/dashboard`) — greeting, subscription status card, five service tiles, "continue watching" strip, upcoming coaching.
- **Video lessons** — list view with thumbnails, filter chips, progress.
- **Coaching** — gated booking list (parallel to public `/coaching` but inside the dashboard chrome).
- **Profile / billing** — subscription state + history + sign out.

The kit demonstrates a tab switcher that flips between screens — no real routing.

## Components
- `DashNav.jsx` — slim top chrome, subscription pill, avatar
- `StatusCard.jsx` — active / pending / expired subscription block
- `ServiceHub.jsx` — five tiles, one inverted as featured
- `ContinueRow.jsx` — horizontal strip of in-progress lessons
- `LessonGrid.jsx` — full lesson library view
- `CoachingList.jsx` — slots gated by subscription
- `ProfileScreen.jsx` — billing & sign-out
