import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { NavLink } from "./NavLink";
import { BrandTitle } from "./BrandTitle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brain Trust | OpenClaw Demo",
  description: "AI market prediction agents compete head-to-head. Watch them trade, predict, and evolve.",
};

const TABS = [
  { href: "/", label: "Trading Floor" },
  { href: "/race", label: "Race" },
  { href: "/predictions", label: "Predictions" },
  { href: "/accuracy", label: "Accuracy" },
  { href: "/reflections", label: "Reflections" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart.variable} antialiased`}
      >
        <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-neon-indigo/30 shadow-[0_1px_8px_rgba(99,102,241,0.1)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <BrandTitle />
              </Link>

              <div className="flex items-center gap-1">
                {TABS.map((tab) => (
                  <NavLink key={tab.href} href={tab.href} label={tab.label} />
                ))}
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
