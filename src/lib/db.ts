import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(
  process.env.DB_PATH || "/home/openclaw/.openclaw/workspace/braintrust.db"
);

let db: Database.Database | null = null;
let dbRw: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH, { readonly: true });
  }
  return db;
}

function getDbRw(): Database.Database {
  if (!dbRw) {
    dbRw = new Database(DB_PATH);
  }
  return dbRw;
}

export interface Agent {
  id: string;
  model: string;
  philosophy: string;
  elo_rating: number;
  cumulative_score: number;
}

export interface Prediction {
  id: number;
  agent_id: string;
  ticker: string;
  target_date: string;
  direction: "UP" | "DOWN";
  confidence: number;
  reasoning: string;
  created_at: string;
}

export interface Evaluation {
  id: number;
  prediction_id: number;
  actual_close: number;
  previous_close: number;
  actual_change_pct: number;
  actual_direction: "UP" | "DOWN";
  correct: boolean;
  brier_score: number;
  pnl_units: number;
  agent_id?: string;
  ticker?: string;
  predicted_direction?: string;
  confidence?: number;
}

export interface EloHistory {
  agent_id: string;
  elo_rating: number;
  cumulative_score: number;
  date: string;
}

export interface Reflection {
  agent_id: string;
  date: string;
  correct_count: number;
  total_count: number;
  what_went_well: string;
  what_went_wrong: string;
  adjustments: string;
}

export interface LeaderboardEntry extends Agent {
  wins: number;
  total: number;
  avg_brier: number | null;
}

export function getLeaderboard(): LeaderboardEntry[] {
  return getDb()
    .prepare(
      `SELECT a.id, a.model, a.elo_rating, a.cumulative_score, a.philosophy,
      (SELECT COUNT(*) FROM evaluations e JOIN predictions p ON e.prediction_id=p.id WHERE p.agent_id=a.id AND e.correct=1) as wins,
      (SELECT COUNT(*) FROM evaluations e JOIN predictions p ON e.prediction_id=p.id WHERE p.agent_id=a.id) as total,
      (SELECT ROUND(AVG(e.brier_score),4) FROM evaluations e JOIN predictions p ON e.prediction_id=p.id WHERE p.agent_id=a.id) as avg_brier
    FROM agents a ORDER BY a.elo_rating DESC`
    )
    .all() as LeaderboardEntry[];
}

export function getPredictions(date: string): Prediction[] {
  return getDb()
    .prepare("SELECT * FROM predictions WHERE target_date = ? ORDER BY agent_id, ticker")
    .all(date) as Prediction[];
}

export function getLatestPredictions(): Prediction[] {
  return getDb()
    .prepare(
      "SELECT * FROM predictions WHERE target_date = (SELECT MAX(target_date) FROM predictions) ORDER BY agent_id, ticker"
    )
    .all() as Prediction[];
}

export function getEvaluations(date: string): Evaluation[] {
  return getDb()
    .prepare(
      `SELECT e.*, p.agent_id, p.ticker, p.direction as predicted_direction, p.confidence
     FROM evaluations e JOIN predictions p ON e.prediction_id = p.id
     WHERE p.target_date = ? ORDER BY p.agent_id, p.ticker`
    )
    .all(date) as Evaluation[];
}

export function getLatestEvaluations(): Evaluation[] {
  return getDb()
    .prepare(
      `SELECT e.*, p.agent_id, p.ticker, p.direction as predicted_direction, p.confidence
     FROM evaluations e JOIN predictions p ON e.prediction_id = p.id
     WHERE p.target_date = (SELECT MAX(p2.target_date) FROM predictions p2 JOIN evaluations e2 ON e2.prediction_id=p2.id)
     ORDER BY p.agent_id, p.ticker`
    )
    .all() as Evaluation[];
}

export function getEloHistory(days: number = 30): EloHistory[] {
  return getDb()
    .prepare(
      "SELECT * FROM elo_history WHERE date >= date('now', ? || ' days') ORDER BY date, agent_id"
    )
    .all(`-${days}`) as EloHistory[];
}

export function getReflectionDates(): string[] {
  return (getDb().prepare("SELECT DISTINCT date FROM reflections ORDER BY date DESC LIMIT 30").all() as { date: string }[]).map(r => r.date);
}

export function getReflections(
  agentId?: string,
  date?: string
): Reflection[] {
  let query = "SELECT * FROM reflections WHERE 1=1";
  const params: string[] = [];
  if (agentId) {
    query += " AND agent_id = ?";
    params.push(agentId);
  }
  if (date) {
    query += " AND date = ?";
    params.push(date);
  }
  query += " ORDER BY date DESC, agent_id LIMIT 20";
  return getDb().prepare(query).all(...params) as Reflection[];
}

export interface Headline {
  agent_id: string;
  date: string;
  headline: string;
}

export function getHeadlines(): Headline[] {
  return getDb()
    .prepare("SELECT agent_id, date, headline FROM headlines ORDER BY date DESC")
    .all() as Headline[];
}

export function getMissingHeadlineDates(): { agent_id: string; date: string }[] {
  return getDb()
    .prepare(
      `SELECT r.agent_id, r.date FROM reflections r
       LEFT JOIN headlines h ON r.agent_id = h.agent_id AND r.date = h.date
       WHERE h.id IS NULL
       ORDER BY r.date DESC`
    )
    .all() as { agent_id: string; date: string }[];
}

export function saveHeadline(agentId: string, date: string, headline: string): void {
  getDbRw()
    .prepare("INSERT OR REPLACE INTO headlines (agent_id, date, headline) VALUES (?, ?, ?)")
    .run(agentId, date, headline);
}

export function getReflectionWithPredictions(agentId: string, date: string) {
  const reflection = getDb()
    .prepare("SELECT * FROM reflections WHERE agent_id = ? AND date = ?")
    .get(agentId, date) as Reflection | undefined;
  const predictions = getDb()
    .prepare(
      `SELECT p.ticker, p.direction, p.confidence, p.reasoning,
              e.correct, e.actual_change_pct
       FROM predictions p
       LEFT JOIN evaluations e ON e.prediction_id = p.id
       WHERE p.agent_id = ? AND p.target_date = ?`
    )
    .all(agentId, date) as {
      ticker: string;
      direction: string;
      confidence: number;
      reasoning: string;
      correct: boolean | null;
      actual_change_pct: number | null;
    }[];
  return { reflection, predictions };
}

export function getAgentAccuracy(): Record<string, Record<string, { correct: number; total: number }>> {
  const rows = getDb()
    .prepare(
      `SELECT p.agent_id, p.ticker,
       SUM(CASE WHEN e.correct = 1 THEN 1 ELSE 0 END) as correct,
       COUNT(*) as total
     FROM evaluations e JOIN predictions p ON e.prediction_id = p.id
     GROUP BY p.agent_id, p.ticker`
    )
    .all() as { agent_id: string; ticker: string; correct: number; total: number }[];

  const result: Record<string, Record<string, { correct: number; total: number }>> = {};
  for (const row of rows) {
    if (!result[row.agent_id]) result[row.agent_id] = {};
    result[row.agent_id][row.ticker] = { correct: row.correct, total: row.total };
  }
  return result;
}
