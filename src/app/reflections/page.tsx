import Link from "next/link";
import { getReflections, type Reflection } from "@/lib/db";
import { AGENTS, AGENT_IDS, type AgentId } from "@/lib/agents";

export const dynamic = "force-dynamic";

export default async function ReflectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ agent?: string; date?: string }>;
}) {
  const { agent: filterAgent, date: filterDate } = await searchParams;

  let reflections: Reflection[];
  try {
    reflections = getReflections(filterAgent, filterDate);
  } catch {
    reflections = [];
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center py-8">
        <h1 className="font-pixel text-xl sm:text-2xl text-neon-purple mb-2">
          REFLECTIONS
        </h1>
        <p className="text-gray-500 text-sm">
          How agents learn from their trades
        </p>
      </div>

      {/* Agent Filter Pills */}
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/reflections"
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            !filterAgent
              ? "glass-card bg-neon-purple/10 text-neon-purple border border-neon-purple/30"
              : "glass-card text-gray-500 hover:text-gray-300 hover:bg-white/5"
          }`}
        >
          All Agents
        </Link>
        {AGENT_IDS.map((agentId) => {
          const agent = AGENTS[agentId];
          const isActive = filterAgent === agentId;
          return (
            <Link
              key={agentId}
              href={`/reflections?agent=${agentId}`}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-white/5"
                  : "glass-card text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
              style={
                isActive
                  ? {
                      borderColor: `${agent.color}66`,
                      borderWidth: 1,
                      borderStyle: "solid",
                      color: agent.color,
                      boxShadow: `0 0 12px ${agent.color}33`,
                    }
                  : undefined
              }
            >
              {agent.name}
            </Link>
          );
        })}
      </div>

      {/* Reflections */}
      {reflections.length > 0 ? (
        <div className="space-y-8">
          {reflections.map((ref, idx) => {
            const agentId = ref.agent_id as AgentId;
            const agent =
              agentId in AGENTS ? AGENTS[agentId] : null;
            const winRate =
              ref.total_count > 0
                ? Math.round(
                    (ref.correct_count / ref.total_count) * 100
                  )
                : 0;

            return (
              <div
                key={`${ref.agent_id}-${ref.date}-${idx}`}
                className="glass-card p-6"
                style={{
                  borderColor: `${agent?.color ?? "#6366f1"}33`,
                  borderWidth: 1,
                  borderStyle: "solid",
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span
                      className="font-pixel text-xs font-bold"
                      style={{ color: agent?.color ?? "#888" }}
                    >
                      {agent?.name ?? ref.agent_id}
                    </span>
                    <span className="text-[10px] text-gray-600 italic">
                      {agent?.philosophy}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-500">{ref.date}</span>
                    <span className="font-mono text-gray-400">
                      {ref.correct_count}/{ref.total_count} ({winRate}%)
                    </span>
                  </div>
                </div>

                {/* Sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* What Went Well */}
                  <div className="rounded-lg bg-white/[0.02] border border-neon-green/20 p-4">
                    <h4
                      className="font-pixel text-[10px] mb-3"
                      style={{ color: "#10b981" }}
                    >
                      WHAT WENT WELL
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {ref.what_went_well || "No notes."}
                    </p>
                  </div>

                  {/* What Went Wrong */}
                  <div className="rounded-lg bg-white/[0.02] border border-neon-red/20 p-4">
                    <h4
                      className="font-pixel text-[10px] mb-3"
                      style={{ color: "#ef4444" }}
                    >
                      WHAT WENT WRONG
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {ref.what_went_wrong || "No notes."}
                    </p>
                  </div>

                  {/* Adjustments */}
                  <div className="rounded-lg bg-white/[0.02] border border-neon-amber/20 p-4">
                    <h4
                      className="font-pixel text-[10px] mb-3"
                      style={{ color: "#f5a623" }}
                    >
                      ADJUSTMENTS
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {ref.adjustments || "No notes."}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card neon-border p-12 text-center">
          <p className="font-pixel text-xs text-gray-600">NO REFLECTIONS YET</p>
          <p className="text-sm text-gray-500 mt-2">
            Agents haven&apos;t written any reflections
            {filterAgent ? ` (filtered by ${filterAgent})` : ""}.
          </p>
        </div>
      )}
    </div>
  );
}
