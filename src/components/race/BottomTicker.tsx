"use client";

import { AGENTS_CONFIG } from "@/lib/mockRaceData";
import type { AgentId, RaceEvent } from "@/lib/mockRaceData";

interface BottomTickerProps {
  dayEvents: RaceEvent[];
  onOpenModal: (event: RaceEvent) => void;
}

export default function BottomTicker({ dayEvents, onOpenModal }: BottomTickerProps) {
  if (dayEvents.length === 0) {
    return (
      <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="bg-[#0a0616]/90 backdrop-blur-xl border-t border-indigo-500/20 px-4 py-2.5 flex items-center gap-3">
          <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex-shrink-0">
            LIVE
          </span>
          <span className="text-gray-500 text-xs font-mono">Awaiting first prediction...</span>
        </div>
      </div>
    );
  }

  // Double the items for seamless loop
  const items = [...dayEvents, ...dayEvents];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50">
      <div className="bg-[#0a0616]/90 backdrop-blur-xl border-t border-indigo-500/20 overflow-hidden">
        <div className="flex items-center h-10">
          {/* BREAKING label */}
          <div className="bg-red-600 text-white text-[10px] font-black px-3 py-2.5 uppercase tracking-wider flex-shrink-0 z-10 h-full flex items-center">
            BREAKING
          </div>
          {/* Scrolling items */}
          <div className="flex-1 overflow-hidden relative">
            <div
              className="flex items-center gap-6 whitespace-nowrap pointer-events-auto"
              style={{
                animation: `marquee ${Math.max(15, dayEvents.length * 5)}s linear infinite`,
              }}
            >
              {items.map((ev, i) => {
                const config = AGENTS_CONFIG[ev.agentId];
                return (
                  <button
                    key={`${ev.id}-${i}`}
                    onClick={() => onOpenModal(ev)}
                    className="flex items-center gap-2 text-xs font-mono hover:opacity-80 transition cursor-pointer flex-shrink-0 px-2"
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: config.color }} />
                    <span style={{ color: config.color }} className="font-bold">{config.name}:</span>
                    <span className="text-gray-300">{ev.action}</span>
                    <span className={`font-bold ${ev.eloChange > 0 ? "text-green-400" : "text-red-400"}`}>
                      {ev.eloChange > 0 ? "+" : ""}{ev.eloChange}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
