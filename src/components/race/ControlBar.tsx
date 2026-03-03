"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AGENTS_CONFIG } from "@/lib/mockRaceData";
import type { AgentId, RaceEvent } from "@/lib/mockRaceData";
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
  timelineEvents: RaceEvent[];
  dateBoundaries: number[];
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

function formatDateShort(dateStr: string): string {
  if (dateStr.startsWith("Day")) return dateStr.split(" - ")[0];
  const d = new Date(dateStr + "T12:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
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
  timelineEvents,
}: ControlBarProps) {
  // Group events by date: each group has a date label + array of event indices
  const dateGroups = useMemo(() => {
    const groups: { date: string; startIdx: number; count: number }[] = [];
    let lastDate = "";
    timelineEvents.forEach((ev, i) => {
      if (ev.date !== lastDate) {
        groups.push({ date: ev.date, startIdx: i, count: 1 });
        lastDate = ev.date;
      } else {
        groups[groups.length - 1].count++;
      }
    });
    return groups;
  }, [timelineEvents]);

  const progress = maxSlider > 0 ? (sliderIndex / maxSlider) * 100 : 0;

  return (
    <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="bg-[#0a0616]/85 backdrop-blur-xl border-b border-indigo-500/20 shadow-[0_4px_30px_rgba(99,102,241,0.1)]">
        {/* Row 1: Leaderboard + controls */}
        <div className="flex items-center gap-4 px-6 py-2.5">
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
          <button
            onClick={resetCamera}
            className="bg-indigo-900/60 backdrop-blur-md px-2 py-1.5 rounded-lg border border-indigo-500/40 hover:bg-indigo-800 transition text-[10px] font-bold uppercase tracking-widest text-indigo-300 pointer-events-auto flex-shrink-0"
          >
            CAM
          </button>
        </div>

        {/* Row 2: Minimalist tick timeline — full width */}
        <div className="relative px-6 pb-2.5 pt-0.5 pointer-events-auto">
          <div className="flex items-end gap-0 h-8">
            {/* Prev */}
            <button
              onClick={goPrevDay}
              disabled={sliderIndex <= 0}
              className="text-gray-500 hover:text-gray-200 disabled:opacity-20 text-xs font-mono mr-2 pb-1 flex-shrink-0 transition"
            >
              ‹
            </button>

            {/* Track area */}
            <div className="flex-1 relative">
              {/* Thin base line */}
              <div className="absolute bottom-[7px] left-0 right-0 h-px bg-gray-700/60" />
              {/* Filled portion */}
              <div
                className="absolute bottom-[7px] left-0 h-px"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(to right, #facc15, #f97316)",
                }}
              />

              {/* Event ticks + date labels */}
              <div className="flex items-end h-8">
                {dateGroups.map((group) => {
                  // Each group gets proportional width
                  const widthPct = maxSlider > 0 ? (group.count / maxSlider) * 100 : 0;
                  const groupMidEvent = group.startIdx + group.count / 2;
                  const isActiveGroup = sliderIndex > group.startIdx && sliderIndex <= group.startIdx + group.count;

                  return (
                    <div
                      key={group.date}
                      className="flex flex-col items-center relative"
                      style={{ width: `${widthPct}%` }}
                    >
                      {/* Ticks row */}
                      <div className="flex items-end justify-center gap-[3px] mb-0.5">
                        {Array.from({ length: group.count }).map((_, j) => {
                          const eventIdx = group.startIdx + j;
                          const isPast = eventIdx < Math.floor(sliderIndex);
                          const isCurrent = Math.floor(sliderIndex) === eventIdx + 1;
                          return (
                            <button
                              key={eventIdx}
                              onClick={() => onSliderChange(eventIdx + 1)}
                              className="group/tick"
                            >
                              <div
                                className={`w-[3px] rounded-[1px] transition-all ${
                                  isCurrent
                                    ? "h-3 bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.7)]"
                                    : isPast
                                      ? "h-2 bg-orange-400/70"
                                      : "h-2 bg-gray-600 group-hover/tick:bg-gray-400"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                      {/* Date label */}
                      <span
                        className={`text-[9px] font-mono leading-none transition-colors ${
                          isActiveGroup ? "text-yellow-300/90" : "text-gray-600"
                        }`}
                      >
                        {formatDateShort(group.date)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Invisible range input for smooth dragging */}
              <input
                type="range"
                min="0"
                max={maxSlider}
                step="0.01"
                value={sliderIndex}
                onChange={(e) => onSliderChange(parseFloat(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-8"
              />
            </div>

            {/* Next */}
            <button
              onClick={goNextDay}
              disabled={sliderIndex >= maxSlider}
              className="text-yellow-400 hover:text-yellow-300 disabled:opacity-20 text-xs font-mono ml-2 pb-1 flex-shrink-0 transition"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
