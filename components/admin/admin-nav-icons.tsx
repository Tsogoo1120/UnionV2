/** Inline admin nav icons — 24×24, stroke currentColor */

const stroke = { stroke: "currentColor", strokeWidth: 1.6, fill: "none" as const };

export function IconOverview() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  );
}

export function IconPayments() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8M12 8v8" strokeWidth={1.4} />
      <path d="M7.5 9.5c1.2-1.5 2.8-2 4.5-2s3.3.5 4.5 2" />
    </svg>
  );
}

export function IconSlots() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
      <circle cx="12" cy="15" r="2.5" />
      <path d="M12 13.5V15l1.2 1.2" />
    </svg>
  );
}

export function IconBookings() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  );
}

export function IconLessons() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 9.5v5l5-2.5-5-2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconReadings() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M4 6h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V6z" />
      <path d="M8 10h8M8 14h5" />
    </svg>
  );
}

export function IconArticles() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M6 4h12v16H6z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
  );
}

export function IconTests() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M5 19V5h14v14H5z" />
      <path d="M8 16v-5M12 16V8M16 16v-3" />
    </svg>
  );
}

export function IconCommunity() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="9" cy="9" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M4 19v-1a5 5 0 015-5h0a5 5 0 015 5v1M14 19v-1a4 4 0 014-3.5" />
    </svg>
  );
}

export function IconUsers() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="12" cy="9" r="4" />
      <path d="M5 20c.6-3.5 3-6 7-6s6.4 2.5 7 6" />
    </svg>
  );
}

export function IconEmail() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 8l9 6 9-6" />
    </svg>
  );
}

export function IconSettings() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function IconHamburger() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
