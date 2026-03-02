"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  // basePath is stripped from pathname by Next.js
  const isActive =
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
        isActive
          ? "bg-neon-indigo/15 text-neon-purple border border-neon-purple/30 shadow-[0_0_8px_rgba(168,85,247,0.15)]"
          : "text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent"
      }`}
    >
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
