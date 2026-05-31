# Admin Dashboard UI kit

Internal-only admin surface. Indigo chrome distinguishes it from user dashboard.

## Screens
- **Overview** — KPI strip + pending queue + recent activity
- **Payments** — approval queue with screenshot preview
- **Coaching → Slots** — calendar / list + create-slot dialog
- **Coaching → Bookings** — approval queue
- **Content** — video lessons / readings / articles CMS list

The kit demonstrates tab-switching between screens — no real data.

## Components
- `AdminNav.jsx` — sidebar nav, indigo
- `AdminTopbar.jsx` — page title, search, profile
- `KPIStrip.jsx` — overview KPIs
- `PaymentsQueue.jsx` — payment approval table with screenshot preview pane
- `SlotsView.jsx` — coaching slots list + new-slot drawer
- `BookingsView.jsx` — booking approval queue
- `ContentList.jsx` — admin CMS list (video lessons)
