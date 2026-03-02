export type AgentId = 'john' | 'paul' | 'george' | 'ringo';

export interface RaceEvent {
  id: string;
  date: string;
  agentId: AgentId;
  action: string;
  eloChange: number;
  reasoning: string;
  unlockedGear?: string;
}

export const AGENTS_CONFIG = {
  john: { name: 'John', color: '#ef4444', icon: '🎸', pixelIcon: '/John.png', startElo: 1000, img: 'https://i.pravatar.cc/150?img=11' },
  paul: { name: 'Paul', color: '#3b82f6', icon: '🎹', pixelIcon: '/Paul.png', startElo: 1000, img: 'https://i.pravatar.cc/150?img=12' },
  george: { name: 'George', color: '#f59e0b', icon: '🎵', pixelIcon: '/George.png', startElo: 1000, img: 'https://i.pravatar.cc/150?img=13' },
  ringo: { name: 'Ringo', color: '#10b981', icon: '🥁', pixelIcon: '/Ringo.png', startElo: 1000, img: 'https://i.pravatar.cc/150?img=14' },
};

export const TIMELINE_EVENTS: RaceEvent[] = [
  { id: '1', date: 'Day 1 - 9:30 AM', agentId: 'paul', action: 'Called SPY gap up perfectly.', eloChange: 25, reasoning: 'Smart money flows detected early.' },
  { id: '2', date: 'Day 1 - 11:00 AM', agentId: 'john', action: 'Missed NVDA drop.', eloChange: -15, reasoning: 'Value metrics ignored AI momentum.' },
  { id: '3', date: 'Day 1 - 2:00 PM', agentId: 'george', action: 'Nailed the VIX reversion.', eloChange: 40, reasoning: 'Z-scores returned to the mean.', unlockedGear: 'Sitar' },
  { id: '4', date: 'Day 2 - 10:15 AM', agentId: 'ringo', action: 'Rode the retail TSLA pump.', eloChange: 50, reasoning: 'Reddit sentiment was off the charts.' },
  { id: '5', date: 'Day 2 - 1:00 PM', agentId: 'paul', action: 'Stopped out on GOLD.', eloChange: -20, reasoning: 'Institutional rotation to bonds.' },
  { id: '6', date: 'Day 3 - 9:30 AM', agentId: 'john', action: 'Contrarian BUY on AAPL paid off.', eloChange: 60, reasoning: 'Fear was at maximum, intrinsic value held.', unlockedGear: 'Rickenbacker' },
  { id: '7', date: 'Day 3 - 3:45 PM', agentId: 'george', action: 'Missed MU earnings volatility.', eloChange: -10, reasoning: 'Options pricing was irrational.' },
  { id: '8', date: 'Day 4 - 12:00 PM', agentId: 'ringo', action: 'Caught the meme coin rally.', eloChange: 35, reasoning: 'Social volume spiked 400%.' },
  { id: '9', date: 'Day 5 - 10:00 AM', agentId: 'paul', action: 'Short squeeze correctly identified.', eloChange: 45, reasoning: 'Technical breakdown reversed.', unlockedGear: 'Höfner Bass' },
  { id: '10', date: 'Day 5 - 3:00 PM', agentId: 'john', action: 'Value rotation triggered.', eloChange: 30, reasoning: 'Fundamentals catching up to price.', unlockedGear: 'Round Glasses' },
];