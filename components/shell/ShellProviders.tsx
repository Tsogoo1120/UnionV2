"use client";

import { ToastProvider } from "@/components/shell/Toast";

export function ShellProviders({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
