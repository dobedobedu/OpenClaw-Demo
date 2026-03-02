export const AGENTS = {
  john: {
    name: "John",
    fullName: "John Lennon",
    model: "Kimi K2.5",
    philosophy: "The Oracle -- Value & Macro",
    color: "#ef4444",
    bgColor: "bg-red-950",
    borderColor: "border-red-800",
    icon: "guitar",
    deskItems: ["Buffett annual letters", "Intrinsic value calculator", "Guitar pick"],
    quote: "Be fearful when others are greedy...",
  },
  paul: {
    name: "Paul",
    fullName: "Paul McCartney",
    model: "GLM-5",
    philosophy: "The Strategist -- Institutional Analysis",
    color: "#3b82f6",
    bgColor: "bg-blue-950",
    borderColor: "border-blue-800",
    icon: "piano",
    deskItems: ["10-K filings", "Fund flow tracker", "Bass guitar"],
    quote: "Follow the smart money.",
  },
  george: {
    name: "George",
    fullName: "George Harrison",
    model: "DeepSeek V3.2",
    philosophy: "The Quant -- Probabilistic Reasoning",
    color: "#f59e0b",
    bgColor: "bg-amber-950",
    borderColor: "border-amber-800",
    icon: "music",
    deskItems: ["Z-score tables", "Base rate reference", "Sitar"],
    quote: "All things must pass... to the mean.",
  },
  ringo: {
    name: "Ringo",
    fullName: "Ringo Starr",
    model: "MiniMax M2.5",
    philosophy: "The Everyman -- Retail & Sentiment",
    color: "#10b981",
    bgColor: "bg-emerald-950",
    borderColor: "border-emerald-800",
    icon: "drum",
    deskItems: ["Reddit feed", "Trending tickers", "Drumsticks"],
    quote: "What are people actually buying?",
  },
} as const;

export type AgentId = keyof typeof AGENTS;
export const AGENT_IDS = Object.keys(AGENTS) as AgentId[];
export const TICKERS = ["SPY", "NVDA", "GOOGL", "MU", "DJI", "GOLD"] as const;
