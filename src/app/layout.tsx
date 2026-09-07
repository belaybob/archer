import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Archer — Tournament Registration & Management",
  description:
    "Register for and manage archery tournaments and competitions, in every common format.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
