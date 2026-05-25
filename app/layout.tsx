import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bread Investment Tracker",
  description: "A goofy live tracker showing what $49.11 invested in QQQ could be worth today."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
