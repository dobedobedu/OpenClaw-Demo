import * as THREE from "three";
import type { TileData } from "./types";

export const TILE_SIZE = 3.2;
export const TILES_PER_SIDE = 10;
export const HALF = (TILES_PER_SIDE * TILE_SIZE) / 2;
export const TOTAL_TILES = 120;
export const H_STEP = 0.5;
export const TILES_TO_WIN = 75;

export const DEFAULT_START_ELO = 950;
export const DEFAULT_END_ELO = 1300;
export const DEFAULT_CAMERA_POS = new THREE.Vector3(50, 60, 50);
export const CAMERA_TILT_DISTANCE = 40;

export const AGENT_PHILOSOPHIES: Record<string, string> = {
  john: "Value investor. Contrarian. Looks for intrinsic value when others panic.",
  paul: "Momentum trader. Follows smart money flows and institutional rotation signals.",
  george: "Quantitative analyst. Mean-reversion specialist. Trusts the math over narratives.",
  ringo: "Sentiment analyst. Social volume, Reddit, memes. Rides the crowd when it aligns.",
};

// All tiles share a uniform base color — color only comes from agent wakes
const PROPERTIES = [
  { name: "HERE COMES THE SUN", color: "#252540", type: "special", emoji: "\u{1F305}", style: null, image: null },
  { name: "Strawberry Fields", color: "#252540", type: "prop", emoji: "\u{1F353}", style: null, image: null },
  { name: "Community Chest", color: "#1a1a2e", type: "event", emoji: null, style: null, image: null },
  { name: "Baltic Ave", color: "#1a1a2e", type: "prop", emoji: null, style: null, image: null },
  { name: "Income Tax", color: "#1a1a2e", type: "tax", emoji: null, style: null, image: null },
  { name: "Crosswalk", color: "#1a1a2e", type: "rr", emoji: null, style: "zebra", image: null },
  { name: "Oriental Ave", color: "#1a1a2e", type: "prop", emoji: null, style: null, image: null },
  { name: "Chance", color: "#1a1a2e", type: "event", emoji: null, style: null, image: null },
  { name: "Yellow Submarine", color: "#252540", type: "prop", emoji: null, style: null, image: "/yellow-submarine.png" },
  { name: "Connecticut", color: "#1a1a2e", type: "prop", emoji: null, style: null, image: null },
  { name: "HELP!", color: "#252540", type: "special", emoji: "\u{1F426}\u{200D}\u{2B1B}", style: null, image: null },
  { name: "St. Charles", color: "#1a1a2e", type: "prop", emoji: null, style: null, image: null },
  { name: "Cosmos", color: "#1a1a2e", type: "util", emoji: "\u{1F30C}", style: null, image: null },
  { name: "States Ave", color: "#1a1a2e", type: "prop", emoji: null, style: null, image: null },
  { name: "Virginia Ave", color: "#1a1a2e", type: "prop", emoji: null, style: null, image: null },
  { name: "Crosswalk", color: "#1a1a2e", type: "rr", emoji: null, style: "zebra", image: null },
  { name: "St. James", color: "#1a1a2e", type: "prop", emoji: null, style: null, image: null },
  { name: "Community Chest", color: "#1a1a2e", type: "event", emoji: null, style: null, image: null },
  { name: "Tennessee", color: "#1a1a2e", type: "prop", emoji: null, style: null, image: null },
  { name: "New York", color: "#1a1a2e", type: "prop", emoji: null, style: null, image: null },
  { name: "ABBEY ROAD", color: "#252540", type: "special", emoji: "\u{1F3B5}", style: null, image: null },
  { name: "Kentucky Ave", color: "#1a1a2e", type: "prop", emoji: null, style: null, image: null },
  { name: "Chance", color: "#1a1a2e", type: "event", emoji: null, style: null, image: null },
  { name: "Black Hole", color: "#1a1a2e", type: "prop", emoji: "\u{1F573}\u{FE0F}", style: null, image: null },
  { name: "All You Need Is Love", color: "#252540", type: "prop", emoji: "\u{2764}\u{FE0F}", style: null, image: null },
  { name: "Crosswalk", color: "#1a1a2e", type: "rr", emoji: null, style: "zebra", image: null },
  { name: "Atlantic Ave", color: "#1a1a2e", type: "prop", emoji: null, style: null, image: null },
  { name: "Ventnor Ave", color: "#1a1a2e", type: "prop", emoji: null, style: null, image: null },
  { name: "Nebula", color: "#1a1a2e", type: "util", emoji: "\u{2728}", style: null, image: null },
  { name: "Marvin Gardens", color: "#1a1a2e", type: "prop", emoji: null, style: null, image: null },
  { name: "SGT PEPPER'S", color: "#252540", type: "special", emoji: "\u{1F31F}", style: null, image: null },
  { name: "Pacific Ave", color: "#1a1a2e", type: "prop", emoji: null, style: null, image: null },
  { name: "Supernova", color: "#1a1a2e", type: "prop", emoji: "\u{1F4AB}", style: null, image: null },
  { name: "Community Chest", color: "#1a1a2e", type: "event", emoji: null, style: null, image: null },
  { name: "Pennsylvania", color: "#1a1a2e", type: "prop", emoji: null, style: null, image: null },
  { name: "Crosswalk", color: "#1a1a2e", type: "rr", emoji: null, style: "zebra", image: null },
  { name: "Chance", color: "#1a1a2e", type: "event", emoji: null, style: null, image: null },
  { name: "Park Place", color: "#1a1a2e", type: "prop", emoji: null, style: null, image: null },
  { name: "Luxury Tax", color: "#1a1a2e", type: "tax", emoji: null, style: null, image: null },
  { name: "Boardwalk", color: "#1a1a2e", type: "prop", emoji: null, style: null, image: null },
];

// Generate the Penrose paradox board spiral
export const BOARD_PATH: TileData[] = [];
for (let i = 0; i < TOTAL_TILES; i++) {
  const loop_i = i % 40;
  const propDef = PROPERTIES[loop_i];
  let flatX: number, flatZ: number, angle: number;
  if (loop_i < 10) {
    flatX = -HALF + loop_i * TILE_SIZE;
    flatZ = HALF;
    angle = 0;
  } else if (loop_i < 20) {
    flatX = HALF;
    flatZ = HALF - (loop_i - 10) * TILE_SIZE;
    angle = Math.PI / 2;
  } else if (loop_i < 30) {
    flatX = HALF - (loop_i - 20) * TILE_SIZE;
    flatZ = -HALF;
    angle = Math.PI;
  } else {
    flatX = -HALF;
    flatZ = -HALF + (loop_i - 30) * TILE_SIZE;
    angle = -Math.PI / 2;
  }
  const h = i * H_STEP;
  BOARD_PATH.push({
    id: i,
    flatX,
    flatZ,
    x: flatX + h,
    y: h,
    z: flatZ + h,
    angle,
    color: propDef.color,
    label: propDef.name.toUpperCase(),
    type: propDef.type,
    emoji: propDef.emoji,
    image: propDef.image,
    style: propDef.style,
    isCorner: loop_i % 10 === 0,
    loopIndex: loop_i,
  });
}

export const NEWS_ITEMS = [
  { time: "9:30 AM", title: "FED RATE CUT", desc: "Markets surge as the Fed surprises with a 50bps rate cut. All four agents scramble to reposition — momentum and value plays diverge sharply at the open.", type: "good" as const },
  { time: "11:15 AM", title: "INFLATION UP", desc: "CPI prints hotter than expected at 3.8% YoY. Bond yields spike and growth stocks sell off hard. George's mean-reversion model flashes caution signals across the board.", type: "bad" as const },
  { time: "1:00 PM", title: "BTC BREAKOUT", desc: "Bitcoin smashes through $100k resistance on massive volume. Ringo's social sentiment indicators lit up hours ago — Reddit and X are on fire with euphoria.", type: "good" as const },
  { time: "2:45 PM", title: "TSLA RECALL", desc: "Tesla issues a recall affecting 2M vehicles over a software glitch. The stock gaps down 4% in minutes. John sees deep value forming while Paul cuts his position.", type: "bad" as const },
  { time: "3:30 PM", title: "AAPL EVENT", desc: "Apple unveils new AR headset features at a surprise keynote. Market reaction is muted — investors wait for concrete revenue guidance before making big moves.", type: "neutral" as const },
  { time: "4:00 PM", title: "MARKET CLOSE", desc: "SPY closes the session up +2.45% on heavy volume. A strong finish to a volatile day — all agents lock in their positions ahead of tomorrow's open.", type: "good" as const },
];

export type NewsItem = (typeof NEWS_ITEMS)[number];

export const TOKEN_TYPES = ["🍓", "💎", "🚢"] as const;
export type TokenType = (typeof TOKEN_TYPES)[number];

export const TOKEN_MAP: { tileId: number; emoji: TokenType }[] = [
  { tileId: 2, emoji: "🍓" },
  { tileId: 7, emoji: "💎" },
  { tileId: 13, emoji: "🚢" },
  { tileId: 18, emoji: "🍓" },
  { tileId: 22, emoji: "💎" },
  { tileId: 28, emoji: "🚢" },
  { tileId: 33, emoji: "🍓" },
  { tileId: 38, emoji: "💎" },
  { tileId: 42, emoji: "🚢" },
  { tileId: 46, emoji: "🍓" },
  { tileId: 50, emoji: "💎" },
  { tileId: 53, emoji: "🚢" },
  { tileId: 57, emoji: "🍓" },
  { tileId: 61, emoji: "💎" },
  { tileId: 65, emoji: "🚢" },
  { tileId: 68, emoji: "🍓" },
  { tileId: 71, emoji: "💎" },
  { tileId: 74, emoji: "🚢" },
];

export const TOKEN_BY_TILE = new Map(TOKEN_MAP.map((t) => [t.tileId, t.emoji]));

// Signature boosts — agent-specific, +10 ELO, NOT stored as tokens
export const BOOST_ELO = 10;

export const BOOST_MAP: { tileId: number; emoji: string; label: string; agentId: string }[] = [
  { tileId: 10, emoji: "🕶️", label: "SHADES", agentId: "john" },
  { tileId: 16, emoji: "🐊", label: "GATOR", agentId: "paul" },
  { tileId: 24, emoji: "🎸", label: "GUITAR", agentId: "george" },
  { tileId: 30, emoji: "⭐", label: "STAR", agentId: "ringo" },
  { tileId: 40, emoji: "🕶️", label: "SHADES", agentId: "john" },
  { tileId: 48, emoji: "🐊", label: "GATOR", agentId: "paul" },
  { tileId: 55, emoji: "🎸", label: "GUITAR", agentId: "george" },
  { tileId: 62, emoji: "⭐", label: "STAR", agentId: "ringo" },
  { tileId: 70, emoji: "🕶️", label: "SHADES", agentId: "john" },
];

export const BOOST_BY_TILE = new Map(BOOST_MAP.map((b) => [b.tileId, b]));
