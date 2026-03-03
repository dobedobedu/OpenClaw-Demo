"use client";

import { motion, AnimatePresence } from "motion/react";
import { AGENTS_CONFIG } from "@/lib/mockRaceData";
import { AGENT_PHILOSOPHIES } from "./constants";
import type { AgentId, RaceEvent } from "@/lib/mockRaceData";
import type { LeaderboardItem } from "./types";

interface DetailModalProps {
  content: React.ReactNode | null;
  onClose: () => void;
}

export default function DetailModal({ content, onClose }: DetailModalProps) {
  return (
    <AnimatePresence>
      {content && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[#0d0914] border border-indigo-500/30 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Event detail content for modal
export function EventDetailContent({ event, onClose }: { event: RaceEvent; onClose: () => void }) {
  const config = AGENTS_CONFIG[event.agentId];
  const isGain = event.eloChange > 0;

  return (
    <div className="space-y-4">
      {/* Agent header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-20 flex items-end justify-center overflow-visible">
          <img src={config.pixelIcon} alt={config.name} className="h-full w-auto object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" />
        </div>
        <div>
          <div className="text-xl font-black" style={{ color: config.color }}>{config.name}</div>
          <div className="text-xs text-gray-500 font-mono">{event.date}</div>
        </div>
        <div className={`ml-auto text-2xl font-black ${isGain ? "text-green-400" : "text-red-400"}`}>
          {isGain ? "+" : ""}{event.eloChange}
        </div>
      </div>
      {/* Action */}
      <p className="text-gray-200 text-sm leading-relaxed">{event.action}</p>
      {/* Reasoning */}
      {event.reasoning && (
        <div className="bg-[#0a0616] border border-gray-800 rounded-lg p-3">
          <p className="text-gray-400 text-xs italic leading-relaxed">&ldquo;{event.reasoning}&rdquo;</p>
        </div>
      )}
      {/* Dismiss */}
      <button
        onClick={onClose}
        className="w-full bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 font-bold py-2 rounded-lg border border-indigo-500/30 transition text-sm"
      >
        Got it
      </button>
    </div>
  );
}

// Agent profile content for modal
export function AgentProfileContent({
  agentId,
  leaderboard,
  recentEvents,
  onClose,
  onOpenChat,
}: {
  agentId: AgentId;
  leaderboard: LeaderboardItem[];
  recentEvents: RaceEvent[];
  onClose: () => void;
  onOpenChat?: () => void;
}) {
  const config = AGENTS_CONFIG[agentId];
  const rank = leaderboard.findIndex((item) => item.id === agentId) + 1;
  const elo = leaderboard.find((item) => item.id === agentId)?.elo ?? 1000;
  const philosophy = AGENT_PHILOSOPHIES[agentId] ?? "";
  const agentEvents = recentEvents.filter((ev) => ev.agentId === agentId).slice(-5);

  return (
    <div className="space-y-4">
      {/* Agent header */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-24 flex items-end justify-center overflow-visible">
          <img src={config.pixelIcon} alt={config.name} className="h-full w-auto object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" />
        </div>
        <div>
          <div className="text-2xl font-black" style={{ color: config.color }}>{config.name}</div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-gray-300 font-mono font-bold">ELO {elo}</span>
            <span className="text-xs bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full font-bold">#{rank}</span>
          </div>
        </div>
      </div>
      {/* Philosophy */}
      <p className="text-gray-400 text-sm italic leading-relaxed">{philosophy}</p>
      {/* Recent events */}
      {agentEvents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs text-gray-500 font-bold uppercase tracking-wider">Recent Activity</h3>
          {agentEvents.map((ev) => (
            <div key={ev.id} className="flex items-center justify-between bg-[#0a0616] border border-gray-800 rounded-lg px-3 py-2">
              <div className="text-xs text-gray-300">{ev.action}</div>
              <span className={`text-xs font-bold ${ev.eloChange > 0 ? "text-green-400" : "text-red-400"}`}>
                {ev.eloChange > 0 ? "+" : ""}{ev.eloChange}
              </span>
            </div>
          ))}
        </div>
      )}
      {/* Chat link */}
      <button
        onClick={() => {
          if (onOpenChat) {
            onClose();
            onOpenChat();
          }
        }}
        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-[#060411] font-bold py-2 rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_8px_rgba(245,158,11,0.3)] text-sm"
      >
        Chat with {config.name}
      </button>
      {/* Dismiss */}
      <button
        onClick={onClose}
        className="w-full bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 font-bold py-2 rounded-lg border border-indigo-500/30 transition text-sm"
      >
        Close
      </button>
    </div>
  );
}
