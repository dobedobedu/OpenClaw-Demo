"use client";

import { useState, useEffect } from "react";
import RaceDashboard from "@/components/RaceDashboard";
import { fetchLeaderboard, fetchEloHistory, fetchPredictions } from "@/lib/api";
import type { EloHistory, LeaderboardEntry, Prediction } from "@/lib/db";

export default function RacePage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[] | null>(null);
  const [eloHistory, setEloHistory] = useState<EloHistory[] | null>(null);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchLeaderboard().catch(() => null),
      fetchEloHistory(90).catch(() => null),
      fetchPredictions().catch(() => null),
    ]).then(([lb, elo, preds]) => {
      if (lb && !lb.error) setLeaderboardData(lb);
      if (elo && !elo.error) setEloHistory(elo);
      if (preds && !preds.error) setPredictions(preds);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#060411] text-gray-50 font-mono">
        <div className="text-center">
          <div className="text-4xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600 mb-4">
            HERE COMES THE RUN
          </div>
          <div className="text-indigo-300 text-sm animate-pulse">Loading race data...</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <RaceDashboard
        eloHistory={eloHistory ?? undefined}
        leaderboardData={leaderboardData ?? undefined}
        predictions={predictions ?? undefined}
      />
    </main>
  );
}
