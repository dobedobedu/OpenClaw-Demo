import { getPredictions, getLatestPredictions, type Prediction } from "@/lib/db";
import { AGENTS, AGENT_IDS, TICKERS, type AgentId } from "@/lib/agents";

export const dynamic = "force-dynamic";

export default async function PredictionsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;

  let predictions: Prediction[];
  try {
    predictions = date ? getPredictions(date) : getLatestPredictions();
  } catch {
    predictions = [];
  }

  const targetDate =
    predictions.length > 0 ? predictions[0].target_date : date ?? "---";

  // Group predictions by ticker
  const byTicker: Record<
    string,
    { agent_id: string; direction: string; confidence: number; reasoning: string }[]
  > = {};
  for (const p of predictions) {
    if (!byTicker[p.ticker]) byTicker[p.ticker] = [];
    byTicker[p.ticker].push({
      agent_id: p.agent_id,
      direction: p.direction,
      confidence: p.confidence,
      reasoning: p.reasoning,
    });
  }

  // Group reasoning by agent
  const byAgent: Record<
    string,
    { ticker: string; direction: string; confidence: number; reasoning: string }[]
  > = {};
  for (const p of predictions) {
    if (!byAgent[p.agent_id]) byAgent[p.agent_id] = [];
    byAgent[p.agent_id].push({
      ticker: p.ticker,
      direction: p.direction,
      confidence: p.confidence,
      reasoning: p.reasoning,
    });
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center py-8">
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">
          Predictions for
        </p>
        <h1 className="font-pixel text-xl sm:text-2xl text-neon-purple neon-text">
          {targetDate}
        </h1>
      </div>

      {/* Ticker Cards Grid */}
      {Object.keys(byTicker).length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(byTicker).map(([ticker, preds]) => (
            <div key={ticker} className="glass-card neon-border p-5">
              <h3 className="font-pixel text-sm text-neon-amber mb-4">
                {ticker}
              </h3>
              <div className="space-y-3">
                {preds.map((pred) => {
                  const agentId = pred.agent_id as AgentId;
                  const agent =
                    agentId in AGENTS ? AGENTS[agentId] : null;
                  const isUp = pred.direction === "UP";
                  return (
                    <div
                      key={pred.agent_id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="font-bold text-sm"
                          style={{ color: agent?.color ?? "#888" }}
                        >
                          {agent?.name ?? pred.agent_id}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-lg font-bold"
                          style={{
                            color: isUp ? "#10b981" : "#ef4444",
                            opacity: 0.5 + pred.confidence * 0.5,
                          }}
                        >
                          {isUp ? "\u25B2" : "\u25BC"}
                        </span>
                        <span className="font-mono text-xs text-gray-400">
                          {(pred.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card neon-border p-12 text-center">
          <p className="font-pixel text-xs text-gray-600">NO PREDICTIONS FOUND</p>
          <p className="text-sm text-gray-500 mt-2">
            No predictions available{date ? ` for ${date}` : ""}.
          </p>
        </div>
      )}

      {/* Agent Reasoning */}
      {Object.keys(byAgent).length > 0 && (
        <div className="space-y-6">
          <h2 className="font-pixel text-sm text-neon-indigo">
            AGENT REASONING
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(byAgent).map(([agId, preds]) => {
              const agentId = agId as AgentId;
              const agent =
                agentId in AGENTS ? AGENTS[agentId] : null;
              return (
                <div
                  key={agId}
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
                      {agent?.name ?? agId}
                    </span>
                    <span className="text-[10px] text-gray-600 italic">
                      {agent?.philosophy}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {preds.map((pred) => (
                      <div
                        key={pred.ticker}
                        className="text-xs border-l-2 pl-3"
                        style={{
                          borderLeftColor:
                            pred.direction === "UP" ? "#10b981" : "#ef4444",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-300">
                            {pred.ticker}
                          </span>
                          <span
                            style={{
                              color:
                                pred.direction === "UP"
                                  ? "#10b981"
                                  : "#ef4444",
                            }}
                          >
                            {pred.direction === "UP" ? "\u25B2" : "\u25BC"}{" "}
                            {(pred.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-gray-500 leading-relaxed">
                          {pred.reasoning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
