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

function formatDate(dateStr: string): string {
  // Handle "Day X" format (mock data)
  if (dateStr.startsWith("Day")) return dateStr.split(" - ")[0];
  // Handle YYYY-MM-DD format (real data)
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateFull(dateStr: string): string {
  if (dateStr.startsWith("Day")) return dateStr.split(" - ")[0];
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
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
  dateBoundaries,
}: ControlBarProps) {
  // Extract unique dates and their positions on the timeline
  const dateMarkers = useMemo(() => {
    const markers: { date: string; position: number; eventCount: number }[] = [];
    let lastDate = "";
    let startIdx = 0;
    let count = 0;
    timelineEvents.forEach((ev, i) => {
      if (ev.date !== lastDate) {
        if (lastDate) {
          markers.push({ date: lastDate, position: startIdx, eventCount: count });
        }
        lastDate = ev.date;
        startIdx = i;
        count = 1;
      } else {
        count++;
      }
    });
    if (lastDate) {
      markers.push({ date: lastDate, position: startIdx, eventCount: count });
    }
    return markers;
  }, [timelineEvents]);

  // Current active date
  const currentDate = useMemo(() => {
    const idx = Math.max(0, Math.floor(sliderIndex) - 1);
    return timelineEvents[idx]?.date ?? dateMarkers[0]?.date ?? "";
  }, [sliderIndex, timelineEvents, dateMarkers]);

  // Date range string
  const dateRange = useMemo(() => {
    if (dateMarkers.length === 0) return "No data";
    if (dateMarkers.length === 1) return formatDateFull(dateMarkers[0].date);
    return `${formatDate(dateMarkers[0].date)} – ${formatDate(dateMarkers[dateMarkers.length - 1].date)}`;
  }, [dateMarkers]);

  const progress = maxSlider > 0 ? (sliderIndex / maxSlider) * 100 : 0;

  return (
    <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="bg-[#0a0616]/85 backdrop-blur-xl border-b border-indigo-500/20 shadow-[0_4px_30px_rgba(99,102,241,0.1)]">
        {/* Row 1: Leaderboard + data badge */}
        <div className="flex items-center gap-4 px-6 py-2.5">
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

          {/* Data badge + camera reset */}
          <div className="flex items-center gap-2 flex-shrink-0 pointer-events-auto">
            <div className="flex items-center gap-1.5 bg-emerald-900/40 border border-emerald-500/30 rounded-lg px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">LIVE</span>
            </div>
            <div className="bg-[#0d0914] border border-indigo-500/25 rounded-lg px-2.5 py-1">
              <span className="text-[10px] text-indigo-300 font-mono">{dateRange}</span>
              <span className="text-[10px] text-gray-500 ml-1.5">{dateMarkers.length}d</span>
            </div>
            <button
              onClick={resetCamera}
              className="bg-indigo-900/60 backdrop-blur-md px-2 py-1.5 rounded-lg border border-indigo-500/40 hover:bg-indigo-800 transition text-[10px] font-bold uppercase tracking-widest text-indigo-300"
            >
              CAM
            </button>
          </div>
        </div>

        {/* Row 2: Visual timeline */}
        <div className="px-6 pb-3 pt-0.5">
          <div className="flex items-center gap-2">
            {/* Prev button */}
            <button
              onClick={goPrevDay}
              disabled={sliderIndex <= 0}
              className="bg-indigo-900/80 text-indigo-200 font-bold px-2 py-1 rounded border border-indigo-500/50 hover:bg-indigo-800 transition text-[10px] disabled:opacity-30 disabled:pointer-events-none pointer-events-auto flex-shrink-0"
            >
              &larr;
            </button>

            {/* Timeline track */}
            <div className="flex-1 relative pointer-events-auto">
              {/* Background track */}
              <div className="relative h-7 flex items-center">
                {/* Track line */}
                <div className="absolute left-0 right-0 h-[3px] bg-gray-800 rounded-full top-1/2 -translate-y-1/2" />

                {/* Filled track */}
                <div
                  className="absolute left-0 h-[3px] rounded-full top-1/2 -translate-y-1/2"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(to right, #facc15, #f97316)",
                  }}
                />

                {/* Date markers */}
                {dateMarkers.map((marker, i) => {
                  const pct = maxSlider > 0 ? (marker.position / maxSlider) * 100 : 0;
                  const isActive = marker.date === currentDate;
                  return (
                    <button
                      key={marker.date}
                      className="absolute flex flex-col items-center -translate-x-1/2 group"
                      style={{ left: `${pct}%` }}
                      onClick={() => onSliderChange(marker.position + 1)}
                    >
                      {/* Dot */}
                      <div
                        className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${
                          isActive
                            ? "bg-yellow-400 border-yellow-300 shadow-[0_0_8px_rgba(250,204,21,0.6)] scale-125"
                            : marker.position < sliderIndex
                              ? "bg-orange-400 border-orange-300"
                              : "bg-gray-600 border-gray-500 group-hover:bg-gray-400 group-hover:border-gray-300"
                        }`}
                      />
                      {/* Date label */}
                      <span
                        className={`text-[9px] font-mono mt-0.5 whitespace-nowrap transition-colors ${
                          isActive ? "text-yellow-300 font-bold" : "text-gray-500 group-hover:text-gray-300"
                        }`}
                      >
                        {formatDate(marker.date)}
                      </span>
                    </button>
                  );
                })}

                {/* End marker */}
                {dateMarkers.length > 0 && (
                  <div className="absolute right-0 flex flex-col items-center translate-x-1/2">
                    <div className={`w-2 h-2 rounded-full ${sliderIndex >= maxSlider ? "bg-green-400 border-2 border-green-300" : "bg-gray-700 border-2 border-gray-600"}`} />
                  </div>
                )}

                {/* Playhead / thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 pointer-events-none"
                  style={{ left: `${progress}%` }}
                >
                  <div className="w-3.5 h-3.5 bg-yellow-400 rounded-full border-2 border-white shadow-[0_0_12px_rgba(250,204,21,0.8)]" />
                </div>

                {/* Invisible range input overlaid for drag interaction */}
                <input
                  type="range"
                  min="0"
                  max={maxSlider}
                  step="0.01"
                  value={sliderIndex}
                  onChange={(e) => onSliderChange(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-7"
                />
              </div>
            </div>

            {/* Next button */}
            <button
              onClick={goNextDay}
              disabled={sliderIndex >= maxSlider}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-[#060411] font-bold px-2 py-1 rounded hover:scale-105 active:scale-95 transition-all shadow-[0_0_8px_rgba(245,158,11,0.3)] text-[10px] disabled:opacity-30 disabled:pointer-events-none pointer-events-auto flex-shrink-0"
            >
              {sliderIndex >= maxSlider ? "DONE" : "\u2192"}
            </button>

            {/* Current date display */}
            <div className="flex-shrink-0 bg-[#0d0914] border border-yellow-500/20 rounded px-2 py-0.5 ml-1 min-w-[90px] text-center">
              <span className="text-[10px] text-yellow-300 font-mono font-bold">
                {currentDate ? formatDateFull(currentDate) : "START"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
