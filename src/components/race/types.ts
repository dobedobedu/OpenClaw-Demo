export type { AgentId, RaceEvent } from "@/lib/mockRaceData";
export type { EloHistory, LeaderboardEntry, Prediction } from "@/lib/db";
export type { TokenType } from "./constants";

export interface TileData {
  id: number;
  flatX: number;
  flatZ: number;
  x: number;
  y: number;
  z: number;
  angle: number;
  color: string;
  label: string;
  type: string;
  emoji: string | null;
  image?: string | null;
  style?: string | null;
  isCorner: boolean;
  loopIndex: number;
}

export interface LeaderboardItem {
  id: import("@/lib/mockRaceData").AgentId;
  elo: number;
}

export interface EloRange {
  start: number;
  end: number;
}
