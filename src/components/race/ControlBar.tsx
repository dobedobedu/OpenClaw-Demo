"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AGENTS_CONFIG } from "@/lib/mockRaceData";
import type { AgentId } from "@/lib/mockRaceData";
import type { LeaderboardItem } from "./types";

interface ControlBarProps {
  leaderboard: LeaderboardItem[];
  sliderIndex: number;
  maxSlider: number;
  onSliderChange: (val: number) => void;
  goNextDay: () => void;
  goPrevDay: () => void;
  resetCamera: () => void;
  tokenCounts: Record<AgentId, string[]>;
}

function TokenBreakdown({ tokens }: { tokens: string[] }) {
  if (tokens.length === 0) return null;
  const strawberries = tokens.filter(t => t === "🍓").length;
  const diamonds = tokens.filter(t => t === "💎").length;
  const subs = tokens.filter(t => t === "🟡").length;
  return (
    <div className="flex items-center gap-2 pl-2 ml-2 border-l border-white/15">
      {strawberries > 0 && (
        <span className="text-[10px] whitespace-nowrap">🍓<span className="text-gray-300 font-mono ml-0.5">x{strawberries}</span></span>
      )}
      {diamonds > 0 && (
        <span className="text-[10px] whitespace-nowrap">💎<span className="text-gray-300 font-mono ml-0.5">x{diamonds}</span></span>
      )}
      {subs > 0 && (
        <span className="text-[10px] flex items-center gap-0.5 whitespace-nowrap">
          <img src="/visualization/yellow-submarine.png" alt="Sub" className="w-4 h-auto inline" />
          <span className="text-gray-300 font-mono">x{subs}</span>
        </span>
      )}
    </div>
  );
}

function LeaderboardChip({ item, index, tokens, config }: {
  item: LeaderboardItem;
  index: number;
  tokens: string[];
  config: typeof AGENTS_CONFIG[AgentId];
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      className="flex items-center gap-2 bg-[#0d0914] px-3 py-1.5 rounded-lg border-l-4 shadow-lg flex-shrink-0 hover:bg-[#14101f] transition-colors cursor-default"
      style={{ borderLeftColor: config.color }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="text-sm font-black text-gray-600">{index + 1}</span>
      <div className="w-8 h-10 flex items-end justify-center overflow-visible">
        <img
          src={config.pixelIcon}
          alt={config.name}
          className="h-full w-auto object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]"
        />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-xs leading-none" style={{ color: config.color }}>
          {config.name}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-300 font-mono font-bold">{item.elo}</span>
          {tokens.length > 0 && (
            <span className="text-[10px]">
              {tokens.length}✨
            </span>
          )}
        </div>
      </div>
      <AnimatePresence>
        {hovered && tokens.length > 0 && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="overflow-hidden"
          >
            <TokenBreakdown tokens={tokens} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ControlBar({
  leaderboard,
  sliderIndex,
  maxSlider,
  onSliderChange,
  goNextDay,
  goPrevDay,
  resetCamera,
  tokenCounts,
}: ControlBarProps) {
  const progress = maxSlider > 0 ? (sliderIndex / maxSlider) * 100 : 0;

  return (
    <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="bg-[#0a0616]/85 backdrop-blur-xl border-b border-indigo-500/20 shadow-[0_4px_30px_rgba(99,102,241,0.1)]">
        <div className="flex items-center gap-6 px-6 py-3">
          {/* Leaderboard chips */}
          <div className="flex gap-2 flex-1 overflow-x-auto pointer-events-auto">
            {leaderboard.map((item, index) => {
              const config = AGENTS_CONFIG[item.id];
              const tokens = tokenCounts[item.id] ?? [];
              return (
                <LeaderboardChip
                  key={item.id}
                  item={item}
                  index={index}
                  tokens={tokens}
                  config={config}
                />
              );
            })}
          </div>

          {/* Right: Slider + nav + reset camera */}
          <div className="flex items-center gap-2 flex-shrink-0 pointer-events-auto">
            <button
              onClick={goPrevDay}
              disabled={sliderIndex <= 0}
              className="bg-indigo-900/80 text-indigo-200 font-bold px-2 py-1.5 rounded-lg border border-indigo-500/50 hover:bg-indigo-800 transition text-[10px] uppercase tracking-wider whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none"
            >
              &larr;
            </button>
            <input
              type="range"
              min="0"
              max={maxSlider}
              step="0.01"
              value={sliderIndex}
              onChange={(e) => onSliderChange(parseFloat(e.target.value))}
              className="w-40 cursor-pointer h-2 rounded-full appearance-none bg-gray-900 border border-gray-700 shadow-inner"
              style={{
                accentColor: "#facc15",
                background: `linear-gradient(to right, #facc15 0%, #f97316 ${progress}%, #111827 ${progress}%, #111827 100%)`,
              }}
            />
            <button
              onClick={goNextDay}
              disabled={sliderIndex >= maxSlider}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-[#060411] font-bold px-2 py-1.5 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_8px_rgba(245,158,11,0.3)] text-[10px] uppercase tracking-wider whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none"
            >
              {sliderIndex >= maxSlider ? "DONE" : "\u2192"}
            </button>
            <button
              onClick={resetCamera}
              className="bg-indigo-900/60 backdrop-blur-md px-2 py-1.5 rounded-lg border border-indigo-500/40 hover:bg-indigo-800 transition text-[10px] font-bold uppercase tracking-widest text-indigo-300 ml-1"
            >
              CAM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
