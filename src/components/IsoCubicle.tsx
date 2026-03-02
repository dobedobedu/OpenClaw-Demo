"use client";
import { AGENTS, type AgentId } from "@/lib/agents";

interface IsoCubicleProps {
  agentId: AgentId;
  elo: number;
  cumulativeScore: number;
  wins: number;
  total: number;
  onClick?: () => void;
}

export function IsoCubicle({
  agentId,
  elo,
  cumulativeScore,
  wins,
  total,
  onClick,
}: IsoCubicleProps) {
  const agent = AGENTS[agentId];
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const moneyStacks = Math.max(0, Math.floor(cumulativeScore / 2));
  const debtStacks = Math.max(
    0,
    Math.floor(Math.abs(Math.min(0, cumulativeScore)) / 2)
  );

  return (
    <div
      className="glass-card halftone-bg p-5 cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:scale-[1.02] group"
      onClick={onClick}
      style={{
        borderColor: `${agent.color}33`,
        borderWidth: 1,
        borderStyle: "solid",
        boxShadow: `0 0 8px ${agent.color}08`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3
            className="font-pixel text-xs font-bold"
            style={{ color: agent.color }}
          >
            {agent.name}
          </h3>
          <p className="text-[10px] text-gray-500 mt-1">{agent.philosophy}</p>
        </div>
        <div
          className="text-right font-pixel text-xs neon-text-glow"
          style={{ color: agent.color }}
        >
          {elo}
        </div>
      </div>

      {/* Isometric cubicle SVG */}
      <svg
        viewBox="0 0 200 160"
        className="w-full h-32 mb-4"
        style={{ filter: `drop-shadow(0 0 3px ${agent.color}33)` }}
      >
        {/* Floor */}
        <polygon
          points="100,130 180,90 100,50 20,90"
          fill="#0a0616"
          stroke={agent.color}
          strokeWidth="0.5"
          opacity="0.5"
        />
        {/* Back wall left */}
        <polygon
          points="20,90 20,40 100,0 100,50"
          fill="#0d0920"
          stroke={agent.color}
          strokeWidth="0.3"
          opacity="0.4"
        />
        {/* Back wall right */}
        <polygon
          points="180,90 180,40 100,0 100,50"
          fill="#0d0920"
          stroke={agent.color}
          strokeWidth="0.3"
          opacity="0.3"
        />
        {/* Desk surface */}
        <polygon
          points="60,95 130,60 160,75 90,110"
          fill="#1a1a2e"
          stroke={agent.color}
          strokeWidth="0.5"
          opacity="0.8"
        />
        {/* Monitor */}
        <rect
          x="85"
          y="45"
          width="30"
          height="22"
          rx="2"
          fill="#0a0616"
          stroke={agent.color}
          strokeWidth="1"
          opacity="0.9"
        />
        {/* Monitor screen glow */}
        <rect
          x="87"
          y="47"
          width="26"
          height="18"
          rx="1"
          fill={agent.color}
          opacity="0.15"
        />
        {/* Monitor stand */}
        <line
          x1="100"
          y1="67"
          x2="100"
          y2="75"
          stroke={agent.color}
          strokeWidth="1"
          opacity="0.5"
        />
        {/* Chair */}
        <ellipse
          cx="75"
          cy="105"
          rx="12"
          ry="6"
          fill="#1a1a2e"
          stroke={agent.color}
          strokeWidth="0.5"
          opacity="0.6"
        />
        {/* Chair back */}
        <path
          d="M 63 105 L 63 88 Q 75 82 87 88 L 87 105"
          fill="none"
          stroke={agent.color}
          strokeWidth="0.8"
          opacity="0.4"
        />
        {/* Agent initial on monitor */}
        <text x="100" y="60" textAnchor="middle" fontSize="10" fill={agent.color} opacity="0.7">
          {agent.name[0]}
        </text>
        {/* Money stacks */}
        {Array.from({ length: Math.min(moneyStacks, 5) }).map((_, i) => (
          <rect
            key={`m${i}`}
            x={140 + i * 4}
            y={70 - i * 3}
            width="8"
            height="4"
            rx="1"
            fill="#10b981"
            opacity={0.6 + i * 0.08}
          />
        ))}
        {/* Debt stacks */}
        {Array.from({ length: Math.min(debtStacks, 5) }).map((_, i) => (
          <rect
            key={`d${i}`}
            x={35 + i * 4}
            y={70 - i * 3}
            width="8"
            height="4"
            rx="1"
            fill="#ef4444"
            opacity={0.6 + i * 0.08}
          />
        ))}
        {/* Desk items */}
        {agent.deskItems.slice(0, 2).map((item, i) => (
          <text
            key={item}
            x={115 + i * 18}
            y={58 + i * 8}
            fontSize="4"
            fill="#6366f1"
            opacity="0.6"
          >
            {item.split(" ")[0]}
          </text>
        ))}
      </svg>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="glass-card p-2 rounded-lg">
          <div
            className="font-pixel text-[10px]"
            style={{ color: cumulativeScore >= 0 ? "#10b981" : "#ef4444" }}
          >
            {cumulativeScore >= 0 ? "+" : ""}
            {cumulativeScore.toFixed(1)}
          </div>
          <div className="text-[8px] text-gray-600 mt-0.5">P&L</div>
        </div>
        <div className="glass-card p-2 rounded-lg">
          <div className="font-pixel text-[10px] text-neon-amber">
            {winRate}%
          </div>
          <div className="text-[8px] text-gray-600 mt-0.5">Win Rate</div>
        </div>
        <div className="glass-card p-2 rounded-lg">
          <div className="font-pixel text-[10px] text-neon-indigo">
            {wins}/{total}
          </div>
          <div className="text-[8px] text-gray-600 mt-0.5">W/L</div>
        </div>
      </div>

      {/* Nameplate */}
      <div
        className="mt-3 py-2 px-3 rounded-lg text-center border"
        style={{
          borderColor: `${agent.color}44`,
          background: `linear-gradient(135deg, ${agent.color}11, transparent)`,
        }}
      >
        <div className="font-pixel text-[8px] text-gray-400">
          {agent.quote}
        </div>
      </div>
    </div>
  );
}
