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

/** Per-agent instrument SVG drawn on/near the desk */
function Instrument({ agentId, color }: { agentId: AgentId; color: string }) {
  switch (agentId) {
    case "john":
      // Rickenbacker-style guitar on desk
      return (
        <g opacity="0.85">
          {/* Guitar body */}
          <ellipse cx="135" cy="68" rx="7" ry="5" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="0.6" strokeOpacity="0.5" />
          <ellipse cx="135" cy="63" rx="6" ry="4" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="0.4" strokeOpacity="0.4" />
          {/* Neck */}
          <line x1="141" y1="65" x2="155" y2="55" stroke={color} strokeWidth="0.8" strokeOpacity="0.5" />
          {/* Headstock */}
          <rect x="154" y="53" width="4" height="3" rx="0.5" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="0.4" strokeOpacity="0.4" />
          {/* Strings */}
          <line x1="130" y1="65" x2="155" y2="54" stroke={color} strokeWidth="0.2" strokeOpacity="0.3" />
          <line x1="130" y1="67" x2="155" y2="56" stroke={color} strokeWidth="0.2" strokeOpacity="0.3" />
          {/* Sound hole */}
          <circle cx="135" cy="66" r="1.5" fill="none" stroke={color} strokeWidth="0.3" strokeOpacity="0.4" />
        </g>
      );
    case "paul":
      // Höfner bass shape — narrower waist
      return (
        <g opacity="0.85">
          {/* Bass body — violin shape */}
          <path
            d="M 132 70 Q 128 66 130 62 Q 132 58 136 58 Q 140 58 142 62 Q 144 66 140 70 Q 138 72 136 72 Q 134 72 132 70 Z"
            fill={color} fillOpacity="0.12" stroke={color} strokeWidth="0.6" strokeOpacity="0.5"
          />
          {/* Waist notch */}
          <path d="M 130 65 Q 133 64 130 63" fill="none" stroke={color} strokeWidth="0.3" strokeOpacity="0.3" />
          <path d="M 142 65 Q 139 64 142 63" fill="none" stroke={color} strokeWidth="0.3" strokeOpacity="0.3" />
          {/* Neck */}
          <line x1="136" y1="58" x2="136" y2="47" stroke={color} strokeWidth="0.8" strokeOpacity="0.5" />
          {/* Headstock */}
          <rect x="134" y="44" width="4" height="3" rx="0.5" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="0.4" strokeOpacity="0.4" />
          {/* Strings */}
          <line x1="135" y1="70" x2="135" y2="47" stroke={color} strokeWidth="0.2" strokeOpacity="0.25" />
          <line x1="137" y1="70" x2="137" y2="47" stroke={color} strokeWidth="0.2" strokeOpacity="0.25" />
          {/* Bridge */}
          <line x1="133" y1="68" x2="139" y2="68" stroke={color} strokeWidth="0.4" strokeOpacity="0.35" />
        </g>
      );
    case "george":
      // Sitar — long neck with bulbous base, leaning against back wall
      return (
        <g opacity="0.85">
          {/* Gourd body */}
          <ellipse cx="48" cy="72" rx="8" ry="6" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="0.6" strokeOpacity="0.5" />
          {/* Decorative pattern on gourd */}
          <ellipse cx="48" cy="72" rx="5" ry="3.5" fill="none" stroke={color} strokeWidth="0.3" strokeOpacity="0.25" />
          {/* Long neck leaning up */}
          <line x1="48" y1="66" x2="55" y2="30" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
          {/* Tuning pegs */}
          <line x1="53" y1="35" x2="58" y2="34" stroke={color} strokeWidth="0.4" strokeOpacity="0.4" />
          <line x1="54" y1="38" x2="59" y2="37" stroke={color} strokeWidth="0.4" strokeOpacity="0.4" />
          <line x1="54" y1="41" x2="59" y2="40" stroke={color} strokeWidth="0.4" strokeOpacity="0.4" />
          {/* Strings */}
          <line x1="47" y1="72" x2="55" y2="30" stroke={color} strokeWidth="0.2" strokeOpacity="0.2" />
          <line x1="49" y1="72" x2="56" y2="31" stroke={color} strokeWidth="0.2" strokeOpacity="0.2" />
          {/* Frets */}
          {[45, 50, 55, 60].map((y) => (
            <line key={y} x1={48 + (55-48)*(66-y)/(66-30) - 1} y1={y} x2={48 + (55-48)*(66-y)/(66-30) + 1} y2={y} stroke={color} strokeWidth="0.25" strokeOpacity="0.3" />
          ))}
        </g>
      );
    case "ringo":
      // Drum kit on desk — two toms + snare with sticks
      return (
        <g opacity="0.85">
          {/* Snare drum */}
          <ellipse cx="132" cy="70" rx="6" ry="3" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="0.6" strokeOpacity="0.5" />
          <line x1="126" y1="70" x2="126" y2="74" stroke={color} strokeWidth="0.4" strokeOpacity="0.4" />
          <line x1="138" y1="70" x2="138" y2="74" stroke={color} strokeWidth="0.4" strokeOpacity="0.4" />
          <ellipse cx="132" cy="74" rx="6" ry="3" fill="none" stroke={color} strokeWidth="0.3" strokeOpacity="0.3" />
          {/* Tom */}
          <ellipse cx="144" cy="65" rx="5" ry="2.5" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="0.5" strokeOpacity="0.45" />
          <line x1="139" y1="65" x2="139" y2="68" stroke={color} strokeWidth="0.3" strokeOpacity="0.35" />
          <line x1="149" y1="65" x2="149" y2="68" stroke={color} strokeWidth="0.3" strokeOpacity="0.35" />
          {/* Hi-hat */}
          <line x1="123" y1="58" x2="123" y2="70" stroke={color} strokeWidth="0.4" strokeOpacity="0.35" />
          <ellipse cx="123" cy="58" rx="3" ry="1" fill="none" stroke={color} strokeWidth="0.4" strokeOpacity="0.4" />
          <ellipse cx="123" cy="59" rx="3" ry="1" fill="none" stroke={color} strokeWidth="0.3" strokeOpacity="0.3" />
          {/* Drumstick 1 */}
          <line x1="128" y1="62" x2="140" y2="68" stroke={color} strokeWidth="0.5" strokeOpacity="0.5" />
          {/* Drumstick 2 */}
          <line x1="136" y1="62" x2="146" y2="63" stroke={color} strokeWidth="0.5" strokeOpacity="0.5" />
        </g>
      );
  }
}

/** Per-agent lyrical symbol SVG — floating near back wall / above desk */
function Symbol({ agentId, color }: { agentId: AgentId; color: string }) {
  switch (agentId) {
    case "john":
      // Round Lennon glasses on the desk
      return (
        <g opacity="0.8">
          {/* Left lens */}
          <circle cx="58" cy="56" r="4" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="0.5" strokeOpacity="0.4" />
          {/* Right lens */}
          <circle cx="69" cy="56" r="4" fill={color} fillOpacity="0.08" stroke={color} strokeWidth="0.5" strokeOpacity="0.4" />
          {/* Bridge */}
          <line x1="62" y1="56" x2="65" y2="56" stroke={color} strokeWidth="0.5" strokeOpacity="0.4" />
          {/* Temple arms */}
          <line x1="54" y1="56" x2="50" y2="55" stroke={color} strokeWidth="0.3" strokeOpacity="0.3" />
          <line x1="73" y1="56" x2="77" y2="55" stroke={color} strokeWidth="0.3" strokeOpacity="0.3" />
        </g>
      );
    case "paul":
      // Musical notes floating near the monitor
      return (
        <g opacity="0.8">
          {/* Note 1 */}
          <circle cx="72" cy="40" r="1.8" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="0.4" strokeOpacity="0.4" />
          <line x1="73.8" y1="40" x2="73.8" y2="32" stroke={color} strokeWidth="0.4" strokeOpacity="0.4" />
          <path d="M 73.8 32 Q 76 31 76 33" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="0.3" strokeOpacity="0.35" />
          {/* Note 2 */}
          <circle cx="79" cy="36" r="1.5" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="0.35" strokeOpacity="0.35" />
          <line x1="80.5" y1="36" x2="80.5" y2="29" stroke={color} strokeWidth="0.35" strokeOpacity="0.35" />
          <path d="M 80.5 29 Q 82.5 28 82.5 30" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="0.25" strokeOpacity="0.3" />
          {/* Note 3 — eighth note pair */}
          <circle cx="68" cy="34" r="1.3" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="0.3" strokeOpacity="0.3" />
          <line x1="69.3" y1="34" x2="69.3" y2="27" stroke={color} strokeWidth="0.3" strokeOpacity="0.3" />
        </g>
      );
    case "george":
      // Lotus flower above the monitor
      return (
        <g opacity="0.8">
          {/* Center */}
          <circle cx="100" cy="30" r="2" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="0.4" strokeOpacity="0.4" />
          {/* Petals */}
          {[0, 72, 144, 216, 288].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const px = 100 + Math.sin(rad) * 6;
            const py = 30 - Math.cos(rad) * 6;
            const cp1x = 100 + Math.sin(rad - 0.3) * 3;
            const cp1y = 30 - Math.cos(rad - 0.3) * 3;
            const cp2x = 100 + Math.sin(rad + 0.3) * 3;
            const cp2y = 30 - Math.cos(rad + 0.3) * 3;
            return (
              <path
                key={angle}
                d={`M 100 30 Q ${cp1x} ${cp1y} ${px} ${py} Q ${cp2x} ${cp2y} 100 30`}
                fill={color}
                fillOpacity="0.08"
                stroke={color}
                strokeWidth="0.4"
                strokeOpacity="0.35"
              />
            );
          })}
        </g>
      );
    case "ringo":
      // Stars scattered on the back wall
      return (
        <g opacity="0.8">
          {[
            { cx: 45, cy: 25, r: 3 },
            { cx: 155, cy: 20, r: 2.5 },
            { cx: 120, cy: 15, r: 2 },
          ].map(({ cx, cy, r }, i) => {
            // 5-point star path
            const pts: string[] = [];
            for (let j = 0; j < 10; j++) {
              const angle = (j * Math.PI) / 5 - Math.PI / 2;
              const rad = j % 2 === 0 ? r : r * 0.4;
              pts.push(`${cx + Math.cos(angle) * rad},${cy + Math.sin(angle) * rad}`);
            }
            return (
              <polygon
                key={i}
                points={pts.join(" ")}
                fill={color}
                fillOpacity="0.1"
                stroke={color}
                strokeWidth="0.4"
                strokeOpacity="0.4"
              />
            );
          })}
        </g>
      );
  }
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

        {/* Gold coin money stacks */}
        {Array.from({ length: Math.min(moneyStacks, 5) }).map((_, i) => (
          <g key={`m${i}`}>
            <circle
              cx={143 + i * 6}
              cy={72 - i * 3}
              r="3"
              fill="#f5a623"
              opacity={0.5 + i * 0.1}
            />
            <circle
              cx={143 + i * 6}
              cy={72 - i * 3}
              r="1.8"
              fill="none"
              stroke="#d4910e"
              strokeWidth="0.3"
              opacity={0.4 + i * 0.08}
            />
          </g>
        ))}
        {/* Red coin debt stacks */}
        {Array.from({ length: Math.min(debtStacks, 5) }).map((_, i) => (
          <g key={`d${i}`}>
            <circle
              cx={38 + i * 6}
              cy={72 - i * 3}
              r="3"
              fill="#ef4444"
              opacity={0.5 + i * 0.1}
            />
            <circle
              cx={38 + i * 6}
              cy={72 - i * 3}
              r="1.8"
              fill="none"
              stroke="#b91c1c"
              strokeWidth="0.3"
              opacity={0.4 + i * 0.08}
            />
          </g>
        ))}

        {/* Agent instrument on desk */}
        <Instrument agentId={agentId} color={agent.color} />

        {/* Lyrical symbol */}
        <Symbol agentId={agentId} color={agent.color} />
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
