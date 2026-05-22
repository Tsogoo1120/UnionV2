"use client";

import type { ReactNode } from "react";
import { MobileDrawer } from "./MobileDrawer";

export type AdminMobileTab = {
  key: string;
  label: string;
  icon: ReactNode;
  sectionHeader?: string;
};

export type AdminMobileSidebarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: AdminMobileTab[];
  open: boolean;
  onClose: () => void;
};

const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";

export function AdminMobileSidebar({
  activeTab,
  onTabChange,
  tabs,
  open,
  onClose,
}: AdminMobileSidebarProps) {
  return (
    <MobileDrawer open={open} onClose={onClose} side="left">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "16px 12px 24px",
          gap: 4,
        }}
      >
        <p
          className="u-eyebrow"
          style={{
            margin: "0 8px 12px",
          }}
        >
          Админ
        </p>
        {tabs.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <div key={tab.key}>
              {tab.sectionHeader ? (
                <div
                  className="u-eyebrow"
                  style={{
                    padding: "12px 10px 6px",
                    marginTop: tab.key === tabs[0]?.key ? 0 : 8,
                  }}
                >
                  {tab.sectionHeader}
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  onTabChange(tab.key);
                  onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  minHeight: 44,
                  padding: "10px 12px",
                  border: "none",
                  borderRadius: "var(--u-r-2)",
                  background: active ? "var(--u-ember-soft)" : "transparent",
                  color: active ? "var(--u-ember)" : "var(--u-ink)",
                  font: "var(--u-body)",
                  fontWeight: active ? 600 : 500,
                  textAlign: "left",
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  transition: `background-color var(--u-dur-2) ${EASE}, color var(--u-dur-2) ${EASE}`,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    display: "flex",
                    width: 44,
                    height: 44,
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "inherit",
                  }}
                >
                  {tab.icon}
                </span>
                <span style={{ flex: 1 }}>{tab.label}</span>
              </button>
            </div>
          );
        })}
      </div>
    </MobileDrawer>
  );
}
