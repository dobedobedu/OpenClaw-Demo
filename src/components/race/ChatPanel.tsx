"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AGENTS_CONFIG, type AgentId } from "@/lib/mockRaceData";

interface ChatPanelProps {
  agentId: AgentId | null;
  onClose: () => void;
}

interface Message {
  id: number;
  from: "agent" | "user";
  text: string;
}

const GREETINGS: Record<AgentId, string[]> = {
  john: [
    "Hey there. I'm a value investor at heart — buy when others are fearful.",
    "Ask me about fundamentals, intrinsic value, or my contrarian plays.",
  ],
  paul: [
    "Welcome! I trade momentum and smart money flows.",
    "Feel free to ask about my latest calls or strategy.",
  ],
  george: [
    "Namaste. I focus on mean reversion and statistical edges.",
    "Ask me about z-scores, volatility, or options pricing.",
  ],
  ringo: [
    "Yo! I ride sentiment — Reddit, social volume, meme coins, you name it.",
    "What do you want to know?",
  ],
};

export default function ChatPanel({ agentId, onClose }: ChatPanelProps) {
  const config = agentId ? AGENTS_CONFIG[agentId] : null;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevAgentRef = useRef<AgentId | null>(null);

  // Seed greeting when agent changes
  useEffect(() => {
    if (agentId && agentId !== prevAgentRef.current) {
      prevAgentRef.current = agentId;
      const greets = GREETINGS[agentId];
      setMessages(
        greets.map((text, i) => ({ id: i, from: "agent" as const, text }))
      );
      setInput("");
    }
    if (!agentId) prevAgentRef.current = null;
  }, [agentId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text || !agentId) return;
    const userMsg: Message = { id: Date.now(), from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Fake agent reply after a short delay
    setTimeout(() => {
      const replies = [
        "Interesting question. Let me think on that...",
        "That's a solid take. I'd lean the same way.",
        "Not sure I agree — the data says otherwise.",
        "Good point. I'll factor that into my next move.",
        "Ha, you sound like my quant models.",
      ];
      const reply: Message = {
        id: Date.now() + 1,
        from: "agent",
        text: replies[Math.floor(Math.random() * replies.length)],
      };
      setMessages((prev) => [...prev, reply]);
    }, 800 + Math.random() * 600);
  };

  return (
    <AnimatePresence>
      {agentId && config && (
        <motion.div
          className="fixed top-0 right-0 h-full w-[400px] z-60 flex flex-col border-l border-indigo-500/30 shadow-2xl bg-[#0d0914]"
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-2 shrink-0"
            style={{ backgroundColor: config.color }}
          >
            <span className="font-bold text-sm text-white">
              Chat with {config.name}
            </span>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition text-lg leading-none"
              aria-label="Close chat"
            >
              &times;
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    msg.from === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-white/10 text-gray-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-white/10 px-3 py-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={`Message ${config.name}...`}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/50"
            />
            <button
              onClick={send}
              className="px-3 py-2 rounded-lg text-sm font-medium text-white shrink-0"
              style={{ backgroundColor: config.color }}
            >
              Send
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
