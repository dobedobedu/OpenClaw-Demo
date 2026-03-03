"use client";

import { motion, AnimatePresence } from "motion/react";
import { AGENTS_CONFIG, type AgentId } from "@/lib/mockRaceData";

interface ChatPanelProps {
  agentId: AgentId | null;
  onClose: () => void;
}

const CHAT_URL = "/embed/braintrust/chat?session=agent:main:main";

export default function ChatPanel({ agentId, onClose }: ChatPanelProps) {
  const config = agentId ? AGENTS_CONFIG[agentId] : null;

  return (
    <AnimatePresence>
      {agentId && config && (
        <motion.div
          className="fixed top-0 right-0 h-full w-[400px] z-60 flex flex-col bg-[#0d0914] border-l border-indigo-500/30 shadow-2xl"
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-indigo-500/20 bg-[#0a0616]">
            <div className="w-8 h-10 flex items-end justify-center overflow-visible">
              <img
                src={config.pixelIcon}
                alt={config.name}
                className="h-full w-auto object-contain"
              />
            </div>
            <span className="font-bold text-sm" style={{ color: config.color }}>
              Chat with {config.name}
            </span>
            <button
              onClick={onClose}
              className="ml-auto text-gray-500 hover:text-gray-200 transition text-lg leading-none"
              aria-label="Close chat"
            >
              &times;
            </button>
          </div>
          {/* Iframe */}
          <iframe
            src={CHAT_URL}
            className="flex-1 w-full border-0 bg-[#060411]"
            title={`Chat with ${config.name}`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
