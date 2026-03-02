import { getLeaderboard, type LeaderboardEntry } from "@/lib/db";
import { AGENTS, AGENT_IDS, type AgentId } from "@/lib/agents";
import { IsoCubicle } from "@/components/IsoCubicle";

export const dynamic = "force-dynamic";

export default async function TradingFloor() {
  let leaderboard: LeaderboardEntry[];
  try {
    leaderboard = getLeaderboard();
  } catch {
    leaderboard = [];
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center py-12">
        <h1 className="font-pixel text-2xl sm:text-3xl text-neon-purple mb-4">
          4 AGENTS &bull; 6 TICKERS
        </h1>
        <p className="text-gray-400 text-lg">
          May the best Beatle win.
        </p>
      </div>

      {/* Agent Cubicles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {AGENT_IDS.map((agentId) => {
          const entry = leaderboard.find((e) => e.id === agentId);
          return (
            <IsoCubicle
              key={agentId}
              agentId={agentId}
              elo={entry?.elo_rating ?? 1000}
              cumulativeScore={entry?.cumulative_score ?? 0}
              wins={entry?.wins ?? 0}
              total={entry?.total ?? 0}
            />
          );
        })}
      </div>

      {/* Leaderboard Table */}
      <div className="glass-card neon-border p-6">
        <h2 className="font-pixel text-sm text-neon-indigo mb-6">
          LEADERBOARD
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neon-indigo/20 text-gray-500 text-xs uppercase tracking-wider">
                <th className="py-3 px-4 text-left">Rank</th>
                <th className="py-3 px-4 text-left">Agent</th>
                <th className="py-3 px-4 text-right">ELO</th>
                <th className="py-3 px-4 text-right">P&L</th>
                <th className="py-3 px-4 text-right">Win Rate</th>
                <th className="py-3 px-4 text-right">Brier Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => {
                const agentId = entry.id as AgentId;
                const agent =
                  agentId in AGENTS
                    ? AGENTS[agentId]
                    : null;
                const winRate =
                  entry.total > 0
                    ? Math.round((entry.wins / entry.total) * 100)
                    : 0;
                return (
                  <tr
                    key={entry.id}
                    className="border-b border-white/5 hover:bg-neon-purple/5 transition-colors"
                  >
                    <td className="py-3 px-4 font-pixel text-xs text-gray-500">
                      #{index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-bold"
                          style={{ color: agent?.color ?? "#888" }}
                        >
                          {agent?.name ?? entry.id}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {agent?.philosophy}
                        </span>
                      </div>
                    </td>
                    <td
                      className="py-3 px-4 text-right font-pixel text-xs neon-text-glow"
                      style={{ color: agent?.color ?? "#f5a623" }}
                    >
                      {entry.elo_rating}
                    </td>
                    <td
                      className="py-3 px-4 text-right font-mono font-bold"
                      style={{ color: agent?.color ?? "#888" }}
                    >
                      {entry.cumulative_score >= 0 ? "+" : ""}
                      {entry.cumulative_score.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {winRate}%
                      <span className="text-gray-600 text-xs ml-1">
                        ({entry.wins}/{entry.total})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-400">
                      {entry.avg_brier != null
                        ? entry.avg_brier.toFixed(4)
                        : "---"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {leaderboard.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <p className="font-pixel text-xs">NO DATA YET</p>
            <p className="text-sm mt-2">
              Waiting for agents to make their first predictions...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
