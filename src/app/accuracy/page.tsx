import { getAgentAccuracy, getLeaderboard, type LeaderboardEntry } from "@/lib/db";
import { AGENTS, AGENT_IDS, TICKERS, type AgentId } from "@/lib/agents";

export const dynamic = "force-dynamic";

function accuracyColor(pct: number): string {
  if (pct >= 70) return "#10b981";
  if (pct >= 55) return "#f59e0b";
  if (pct >= 40) return "#f97316";
  return "#ef4444";
}

function accuracyBg(pct: number): string {
  if (pct >= 70) return "rgba(16, 185, 129, 0.12)";
  if (pct >= 55) return "rgba(245, 158, 11, 0.12)";
  if (pct >= 40) return "rgba(249, 115, 22, 0.12)";
  return "rgba(239, 68, 68, 0.12)";
}

export default async function AccuracyPage() {
  let accuracy: Record<
    string,
    Record<string, { correct: number; total: number }>
  >;
  let leaderboard: LeaderboardEntry[];
  try {
    accuracy = getAgentAccuracy();
    leaderboard = getLeaderboard();
  } catch {
    accuracy = {};
    leaderboard = [];
  }

  const hasData = Object.keys(accuracy).length > 0;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center py-8">
        <h1 className="font-pixel text-xl sm:text-2xl text-neon-purple neon-text mb-2">
          ACCURACY HEATMAP
        </h1>
        <p className="text-gray-500 text-sm">
          Agent performance across all tickers
        </p>
      </div>

      {hasData ? (
        <>
          {/* Heatmap Table */}
          <div className="glass-card neon-border p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neon-indigo/20">
                  <th className="py-3 px-4 text-left text-gray-500 text-xs uppercase tracking-wider">
                    Agent
                  </th>
                  {TICKERS.map((ticker) => (
                    <th
                      key={ticker}
                      className="py-3 px-4 text-center text-gray-500 text-xs uppercase tracking-wider"
                    >
                      {ticker}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-center text-gray-500 text-xs uppercase tracking-wider">
                    Overall
                  </th>
                </tr>
              </thead>
              <tbody>
                {AGENT_IDS.map((agentId) => {
                  const agent = AGENTS[agentId];
                  const agentData = accuracy[agentId] ?? {};
                  let totalCorrect = 0;
                  let totalAll = 0;
                  for (const t of TICKERS) {
                    const d = agentData[t];
                    if (d) {
                      totalCorrect += d.correct;
                      totalAll += d.total;
                    }
                  }
                  const overallPct =
                    totalAll > 0
                      ? Math.round((totalCorrect / totalAll) * 100)
                      : 0;

                  return (
                    <tr
                      key={agentId}
                      className="border-b border-white/5 hover:bg-neon-purple/5 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span
                          className="font-bold"
                          style={{ color: agent.color }}
                        >
                          {agent.name}
                        </span>
                      </td>
                      {TICKERS.map((ticker) => {
                        const d = agentData[ticker];
                        if (!d || d.total === 0) {
                          return (
                            <td
                              key={ticker}
                              className="py-3 px-4 text-center text-gray-700"
                            >
                              ---
                            </td>
                          );
                        }
                        const pct = Math.round(
                          (d.correct / d.total) * 100
                        );
                        return (
                          <td
                            key={ticker}
                            className="py-3 px-4 text-center"
                          >
                            <span
                              className="inline-block px-2 py-1 rounded font-pixel text-[10px] font-bold"
                              style={{
                                color: accuracyColor(pct),
                                background: accuracyBg(pct),
                                textShadow: `0 0 8px ${accuracyColor(pct)}`,
                              }}
                            >
                              {pct}%
                            </span>
                            <div className="text-[9px] text-gray-600 mt-0.5">
                              {d.correct}/{d.total}
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-center">
                        <span
                          className="font-pixel text-xs font-bold"
                          style={{
                            color: accuracyColor(overallPct),
                            textShadow: `0 0 10px ${accuracyColor(overallPct)}`,
                          }}
                        >
                          {overallPct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Performance Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leaderboard.map((entry) => {
              const agentId = entry.id as AgentId;
              const agent =
                agentId in AGENTS ? AGENTS[agentId] : null;
              const winRate =
                entry.total > 0
                  ? Math.round((entry.wins / entry.total) * 100)
                  : 0;
              return (
                <div
                  key={entry.id}
                  className="glass-card p-5"
                  style={{
                    borderColor: `${agent?.color ?? "#6366f1"}44`,
                    borderWidth: 1,
                    borderStyle: "solid",
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="font-pixel text-xs font-bold"
                      style={{ color: agent?.color ?? "#888" }}
                    >
                      {agent?.name ?? entry.id}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Win Rate</span>
                        <span
                          className="font-bold"
                          style={{ color: accuracyColor(winRate) }}
                        >
                          {winRate}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${winRate}%`,
                            background: `linear-gradient(90deg, ${agent?.color ?? "#6366f1"}88, ${agent?.color ?? "#6366f1"})`,
                            boxShadow: `0 0 8px ${agent?.color ?? "#6366f1"}66`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">ELO</span>
                        <div
                          className="font-pixel text-[10px] mt-0.5"
                          style={{
                            color: "#f59e0b",
                            textShadow: "0 0 6px #f59e0b",
                          }}
                        >
                          {entry.elo_rating}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Brier</span>
                        <div className="font-mono text-gray-400 text-[10px] mt-0.5">
                          {entry.avg_brier != null
                            ? entry.avg_brier.toFixed(4)
                            : "---"}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">P&L</span>
                        <div
                          className="font-mono text-[10px] mt-0.5"
                          style={{
                            color:
                              entry.cumulative_score >= 0
                                ? "#10b981"
                                : "#ef4444",
                          }}
                        >
                          {entry.cumulative_score >= 0 ? "+" : ""}
                          {entry.cumulative_score.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Record</span>
                        <div className="text-gray-300 text-[10px] mt-0.5">
                          {entry.wins}W / {entry.total - entry.wins}L
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="glass-card neon-border p-12 text-center">
          <p className="font-pixel text-xs text-gray-600">NO ACCURACY DATA</p>
          <p className="text-sm text-gray-500 mt-2">
            Evaluations have not been run yet.
          </p>
        </div>
      )}
    </div>
  );
}
