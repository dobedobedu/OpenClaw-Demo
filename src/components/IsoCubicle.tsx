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

/** Gold coin pile SVG — scales with P&L magnitude */
function CoinPile({ score, color }: { score: number; color: string }) {
  const isPositive = score >= 0;
  const magnitude = Math.abs(score);
  // 1-8 coins based on magnitude, minimum 1 if non-zero
  const coinCount = magnitude > 0 ? Math.min(8, Math.max(1, Math.floor(magnitude / 1.5))) : 0;
  if (coinCount === 0) return null;

  // Coin positions — pyramid pile layout
  const positions = [
    // Bottom row
    { x: 0, y: 0 },
    { x: 14, y: -2 },
    { x: 28, y: 0 },
    // Middle row
    { x: 7, y: -12 },
    { x: 21, y: -14 },
    // Top row
    { x: 14, y: -24 },
    // Extras
    { x: -7, y: -10 },
    { x: 35, y: -10 },
  ];

  const coinColor = isPositive ? "#f5a623" : "#ef4444";
  const innerColor = isPositive ? "#d4910e" : "#b91c1c";
  const glintColor = isPositive ? "#fde68a" : "#fca5a5";

  return (
    <svg viewBox="-10 -30 55 40" className="w-16 h-12 flex-shrink-0">
      {positions.slice(0, coinCount).map((pos, i) => (
        <g key={i}>
          {/* Coin body */}
          <ellipse
            cx={pos.x}
            cy={pos.y}
            rx="7"
            ry="4.5"
            fill={coinColor}
            opacity={0.7 + i * 0.03}
          />
          {/* Coin edge (thickness) */}
          <path
            d={`M ${pos.x - 7} ${pos.y} Q ${pos.x - 7} ${pos.y + 2.5} ${pos.x} ${pos.y + 2.5} Q ${pos.x + 7} ${pos.y + 2.5} ${pos.x + 7} ${pos.y}`}
            fill={innerColor}
            opacity={0.5}
          />
          {/* Inner ring */}
          <ellipse
            cx={pos.x}
            cy={pos.y}
            rx="4.5"
            ry="2.8"
            fill="none"
            stroke={innerColor}
            strokeWidth="0.5"
            opacity={0.6}
          />
          {/* Glint */}
          <ellipse
            cx={pos.x - 2}
            cy={pos.y - 1}
            rx="1.5"
            ry="0.8"
            fill={glintColor}
            opacity={0.3}
          />
        </g>
      ))}
    </svg>
  );
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
      {/* Header: Name + ELO */}
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

      {/* Avatar + Coin Pile */}
      <div className="flex items-end justify-center gap-3 mb-4 h-32">
        {/* Avatar image */}
        <div
          className="relative flex-shrink-0"
          style={{
            filter: `drop-shadow(0 0 6px ${agent.color}44)`,
          }}
        >
          <img
            src={`/visualization/${agent.name}.png`}
            alt={agent.name}
            className="h-28 w-auto object-contain"
          />
        </div>
        {/* Gold coin pile next to avatar */}
        <div className="flex items-end">
          <CoinPile score={cumulativeScore} color={agent.color} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="glass-card p-2 rounded-lg">
          <div
            className="font-pixel text-[10px]"
            style={{ color: agent.color }}
          >
            {cumulativeScore >= 0 ? "+" : ""}
            {cumulativeScore.toFixed(1)}
          </div>
          <div className="text-[8px] text-gray-600 mt-0.5">P&L</div>
        </div>
        <div className="glass-card p-2 rounded-lg">
          <div
            className="font-pixel text-[10px]"
            style={{ color: agent.color }}
          >
            {winRate}%
          </div>
          <div className="text-[8px] text-gray-600 mt-0.5">Win Rate</div>
        </div>
        <div className="glass-card p-2 rounded-lg">
          <div
            className="font-pixel text-[10px]"
            style={{ color: agent.color }}
          >
            {wins}/{total}
          </div>
          <div className="text-[8px] text-gray-600 mt-0.5">W/L</div>
        </div>
      </div>

      {/* Quote */}
      <div
        className="mt-3 py-2 px-3 rounded-lg text-center border"
        style={{
          borderColor: `${agent.color}44`,
          background: `linear-gradient(135deg, ${agent.color}11, transparent)`,
        }}
      >
        <div
          className="font-pixel text-[8px]"
          style={{ color: `${agent.color}cc` }}
        >
          {agent.quote}
        </div>
      </div>
    </div>
  );
}
