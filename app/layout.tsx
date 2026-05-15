import type { Metadata } from "next";
import "../union-design-system/colors_and_type.css";
import "./globals.css";
import "../components/shell/responsive.css";
import { ShellProviders } from "@/components/shell/ShellProviders";

export const metadata: Metadata = {
  title: "Union — Дотоод гэрэл, гадаад үйл",
  description:
    "Видео хичээл, хамтын уншилт, сэтгэл судлалын тест, эссэ, нийгэмлэг — Union.",
  icons: { icon: "/union-monogram.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body className="antialiased">
        <ShellProviders>{children}</ShellProviders>
      </body>
    </html>
  );
}
