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
  goNextWeek: () => void;
  goPrevWeek: () => void;
  goNextEvent: () => void;
  resetCamera: () => void;
  tokenCounts: Record<AgentId, string[]>;
  timelineEvents: RaceEvent[];
  dateBoundaries: number[];
}

function TokenBreakdown({ tokens }: { tokens: string[] }) {
  if (tokens.length === 0) return null;
  const strawberries = tokens.filter(t => t === "🍓").length;
  const diamonds = tokens.filter(t => t === "💎").length;
  const subs = tokens.filter(t => t === "🚢").length;
  return (
    <div className="flex items-center gap-2 pl-2 ml-2 border-l border-white/15">
      {strawberries > 0 && (
        <span className="text-[11px] whitespace-nowrap">🍓<span className="text-gray-300 font-mono ml-0.5">x{strawberries}</span></span>
      )}
      {diamonds > 0 && (
        <span className="text-[11px] whitespace-nowrap">💎<span className="text-gray-300 font-mono ml-0.5">x{diamonds}</span></span>
      )}
      {subs > 0 && (
        <span className="text-[11px] flex items-center gap-0.5 whitespace-nowrap">
          <img src="/visualization/yellow-submarine.svg" alt="Sub" className="w-4 h-auto inline" />
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
      className="flex items-center gap-2.5 bg-[#0d0914] px-4 py-2.5 rounded-xl border-l-4 shadow-lg flex-shrink-0 hover:bg-[#14101f] transition-colors cursor-default"
      style={{ borderLeftColor: config.color }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="text-base font-black text-gray-600">{index + 1}</span>
      <div className="w-10 h-12 flex items-end justify-center overflow-visible">
        <img
          src={config.pixelIcon}
          alt={config.name}
          className="h-full w-auto object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-bold text-sm leading-none" style={{ color: config.color }}>
          {config.name}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-300 font-mono font-bold">{item.elo}</span>
          {tokens.length > 0 && (
            <span className="text-xs">
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
  goNextWeek,
  goPrevWeek,
  goNextEvent,
  resetCamera,
  tokenCounts,
  timelineEvents,
}: ControlBarProps) {
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

  // Assign week numbers: group consecutive dates into 5-day trading weeks
  const weekMap = useMemo(() => {
    const map = new Map<string, number>();
    const uniqueDates = [...new Set(timelineEvents.map(e => e.date))];
    uniqueDates.forEach((d, i) => map.set(d, Math.floor(i / 5) + 1));
    return map;
  }, [timelineEvents]);

  const currentWeekNum = useMemo(() => {
    const idx = Math.max(0, Math.floor(sliderIndex) - 1);
    const date = timelineEvents[idx]?.date;
    if (!date) return 1;
    return weekMap.get(date) ?? 1;
  }, [sliderIndex, timelineEvents, weekMap]);

  // Current day for the tooltip below timeline
  const currentDay = useMemo(() => {
    const idx = Math.max(0, Math.floor(sliderIndex) - 1);
    const date = timelineEvents[idx]?.date;
    if (!date) return null;
    return { date, pct: maxSlider > 0 ? (sliderIndex / maxSlider) * 100 : 0 };
  }, [sliderIndex, timelineEvents, maxSlider]);

  const progress = maxSlider > 0 ? (sliderIndex / maxSlider) * 100 : 0;

  return (
    <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="bg-[#0a0616]/85 backdrop-blur-xl border-b border-indigo-500/20 shadow-[0_4px_30px_rgba(99,102,241,0.1)]">
        {/* Row 1: Leaderboard + CAM */}
        <div className="flex items-center gap-5 px-8 py-4">
          <div className="flex gap-3 flex-1 overflow-x-auto pointer-events-auto">
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
            className="bg-indigo-900/60 backdrop-blur-md px-3 py-2 rounded-lg border border-indigo-500/40 hover:bg-indigo-800 transition text-[11px] font-bold uppercase tracking-widest text-indigo-300 pointer-events-auto flex-shrink-0"
          >
            CAM
          </button>
        </div>

        {/* Row 2: [‹ WK ›] — timeline ticks — [NEXT ▸] */}
        <div className="px-8 pb-4 pt-1 pointer-events-auto">
          <div className="flex items-center gap-0">
            {/* Left: Week nav group */}
            <div className="flex items-center gap-1 flex-shrink-0 mr-5">
              <button
                onClick={goPrevWeek}
                disabled={sliderIndex <= 0}
                className="text-gray-400 hover:text-white disabled:opacity-20 text-sm font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-white/5 transition"
              >
                ‹
              </button>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider min-w-[36px] text-center">
                WK {currentWeekNum}
              </span>
              <button
                onClick={goNextWeek}
                disabled={sliderIndex >= maxSlider}
                className="text-gray-400 hover:text-white disabled:opacity-20 text-sm font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-white/5 transition"
              >
                ›
              </button>
            </div>

            {/* Center: Timeline ticks */}
            <div className="flex-1 relative">
              {/* Base line */}
              <div className="absolute bottom-[12px] left-0 right-0 h-px bg-gray-700/50" />
              {/* Filled line */}
              <div
                className="absolute bottom-[12px] left-0 h-px"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(to right, #facc15, #f97316)",
                }}
              />

              {/* Tick groups */}
              <div className="flex items-end h-10">
                {dateGroups.map((group) => {
                  const widthPct = maxSlider > 0 ? (group.count / maxSlider) * 100 : 0;

                  return (
                    <div
                      key={group.date}
                      className="flex items-end justify-center gap-1.5 relative group/day"
                      style={{ width: `${widthPct}%` }}
                    >
                      {Array.from({ length: group.count }).map((_, j) => {
                        const eventIdx = group.startIdx + j;
                        const isPast = eventIdx < Math.floor(sliderIndex);
                        const isCurrent = Math.floor(sliderIndex) === eventIdx + 1;
                        return (
                          <button
                            key={eventIdx}
                            onClick={() => onSliderChange(eventIdx + 1)}
                            className="group/tick px-[1px]"
                            title={formatDateShort(group.date)}
                          >
                            <div
                              className={`w-[4px] rounded-sm transition-all ${
                                isCurrent
                                  ? "h-5 bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.7)]"
                                  : isPast
                                    ? "h-3 bg-orange-400/70"
                                    : "h-3 bg-gray-600 group-hover/tick:bg-gray-400"
                              }`}
                            />
                          </button>
                        );
                      })}
                      {/* Tooltip on hover */}
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover/day:opacity-100 transition-opacity pointer-events-none">
                        <span className="text-[10px] font-mono text-gray-300 bg-[#0a0616]/95 px-1.5 py-0.5 rounded whitespace-nowrap">
                          {formatDateShort(group.date)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Invisible range input */}
              <input
                type="range"
                min="0"
                max={maxSlider}
                step="0.01"
                value={sliderIndex}
                onChange={(e) => onSliderChange(parseFloat(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-10"
              />

              {/* Day tooltip — follows playhead below the timeline */}
              {currentDay && sliderIndex > 0 && (
                <div
                  className="absolute -bottom-5 -translate-x-1/2 pointer-events-none transition-[left] duration-100"
                  style={{ left: `${currentDay.pct}%` }}
                >
                  <span className="text-[10px] font-mono text-yellow-300/80 whitespace-nowrap">
                    {formatDateShort(currentDay.date)}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Next event button */}
            <button
              onClick={goNextEvent}
              disabled={sliderIndex >= maxSlider}
              className="flex items-center gap-1 ml-5 flex-shrink-0 bg-gradient-to-r from-yellow-500/90 to-orange-500/90 text-[#060411] font-bold px-3 py-1.5 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)] text-[10px] uppercase tracking-wider disabled:opacity-30 disabled:pointer-events-none whitespace-nowrap"
            >
              NEXT <span className="text-xs">▸</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
