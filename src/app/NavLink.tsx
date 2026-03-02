"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
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
          ? "bg-neon-indigo/20 text-neon-purple neon-text border border-neon-purple/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
          : "text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent"
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
