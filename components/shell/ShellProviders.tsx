"use client";

import { ToastProvider } from "@/components/shell/Toast";
import { ProgressBar } from "@/components/shell/ProgressBar";

export function ShellProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ProgressBar />
      {children}
    </ToastProvider>
  );
}
