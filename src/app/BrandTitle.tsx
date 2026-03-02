"use client";

import { usePathname } from "next/navigation";

export function BrandTitle() {
  const pathname = usePathname();
  if (pathname === "/race") {
    return (
      <div>
        <span className="font-pixel text-sm bg-gradient-to-r from-yellow-400 to-orange-600 bg-clip-text text-transparent">
          HERE COMES THE RUN
        </span>
        <p className="text-[8px] text-indigo-300 font-mono tracking-widest uppercase">
          AI Market Prediction Race
        </p>
      </div>
    );
  }
  return (
    <span className="font-pixel text-sm bg-gradient-to-r from-neon-purple to-neon-amber bg-clip-text text-transparent">
      BRAIN TRUST
    </span>
  );
}
