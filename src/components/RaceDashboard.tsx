"use client";

import { useState, useMemo, useEffect, useRef, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import { TIMELINE_EVENTS, AGENTS_CONFIG, type AgentId, type RaceEvent } from "@/lib/mockRaceData";
import type { EloHistory, LeaderboardEntry, Prediction } from "@/lib/db";
import { NEWS_ITEMS, TOKEN_MAP, TILES_TO_WIN } from "./race/constants";
import type { TokenType } from "./race/constants";
import ParadoxBoard from "./race/ParadoxBoard";
import Jumbotron from "./race/Jumbotron";
import AgentAvatar from "./race/AgentAvatar";
import ControlBar from "./race/ControlBar";
import BottomTicker from "./race/BottomTicker";
import DetailModal, { EventDetailContent, AgentProfileContent } from "./race/DetailModal";

// Static CSS for marquee animation — no user input, safe to inject
const MARQUEE_CSS = `@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`;

interface RaceDashboardProps {
  eloHistory?: EloHistory[];
  leaderboardData?: LeaderboardEntry[];
  predictions?: Prediction[];
}

function buildTimelineFromEloHistory(eloHistory: EloHistory[]): RaceEvent[] {
  const byDate: Record<string, Record<string, number>> = {};
  for (const row of eloHistory) {
    if (!byDate[row.date]) byDate[row.date] = {};
    byDate[row.date][row.agent_id] = row.elo_rating;
  }
  const dates = Object.keys(byDate).sort();
  const events: RaceEvent[] = [];
  let eventId = 0;
  for (let i = 1; i < dates.length; i++) {
    const prevDate = dates[i - 1];
    const currDate = dates[i];
    const prevElos = byDate[prevDate];
    const currElos = byDate[currDate];
    for (const agentId of Object.keys(currElos)) {
      const prev = prevElos[agentId] ?? 1000;
      const curr = currElos[agentId];
      const delta = Math.round(curr - prev);
      if (delta !== 0) {
        events.push({
          id: String(++eventId),
          date: currDate,
          agentId: agentId as AgentId,
          action: delta > 0 ? `gained ${delta} ELO` : `lost ${Math.abs(delta)} ELO`,
          eloChange: delta,
          reasoning: "",
        });
      }
    }
  }
  return events;
}

function buildNewsFromPredictions(predictions: Prediction[]) {
  return predictions.slice(0, 6).map((p) => ({
    time: p.target_date,
    title: `${p.ticker} ${p.direction}`,
    desc: p.reasoning?.slice(0, 80) || `${p.agent_id} predicts ${p.ticker} ${p.direction} (${Math.round(p.confidence * 100)}%)`,
    type: (p.direction === "UP" ? "good" : "bad") as "good" | "bad",
  }));
}

/** Subtle ground plane with grid micro-texture */
function GroundPlane() {
  const canvas = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext("2d")!;
    // Dark base
    ctx.fillStyle = "#08061a";
    ctx.fillRect(0, 0, 512, 512);
    // Subtle grid lines
    ctx.strokeStyle = "rgba(99, 102, 241, 0.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 512; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
    // Scattered noise dots
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const alpha = Math.random() * 0.08;
      ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
      ctx.fillRect(x, y, 1, 1);
    }
    return c;
  }, []);

  const texture = useMemo(() => {
    if (!canvas) return null;
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(12, 12);
    return tex;
  }, [canvas]);

  if (!texture) return null;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[400, 400]} />
      <meshBasicMaterial map={texture} transparent opacity={0.6} />
    </mesh>
  );
}

const AGENT_OFFSETS = [
  { x: -0.6, z: -0.6 },
  { x: 0.6, z: -0.6 },
  { x: -0.6, z: 0.6 },
  { x: 0.6, z: 0.6 },
];

export default function RaceDashboard({ eloHistory, leaderboardData, predictions }: RaceDashboardProps) {
  const [sliderIndex, setSliderIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [jumbotronMode, setJumbotronMode] = useState<"news" | "event">("news");
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const controlsRef = useRef<any>(null);
  const agentPositionsRef = useRef<Record<string, number>>({ john: 0, paul: 0, george: 0, ringo: 0 });

  useEffect(() => setMounted(true), []);

  const timelineEvents = useMemo(() => {
    if (eloHistory && eloHistory.length > 0) return buildTimelineFromEloHistory(eloHistory);
    return TIMELINE_EVENTS;
  }, [eloHistory]);

  const newsItems = useMemo(() => {
    if (predictions && predictions.length > 0) return buildNewsFromPredictions(predictions);
    return NEWS_ITEMS;
  }, [predictions]);

  const currentState = useMemo(() => {
    const elos: Record<AgentId, number> = { john: 1000, paul: 1000, george: 1000, ringo: 1000 };
    const chatLog = timelineEvents.slice(0, Math.floor(sliderIndex));
    const activeEvent = sliderIndex >= 1 ? timelineEvents[Math.floor(sliderIndex) - 1] : null;
    const floorIndex = Math.floor(sliderIndex);
    const fraction = sliderIndex - floorIndex;
    for (let i = 0; i < floorIndex; i++) {
      const ev = timelineEvents[i];
      elos[ev.agentId] += ev.eloChange;
    }
    if (fraction > 0 && floorIndex < timelineEvents.length) {
      const nextEv = timelineEvents[floorIndex];
      elos[nextEv.agentId] += nextEv.eloChange * fraction;
    }
    const leaderboard = (Object.keys(elos) as AgentId[])
      .map((id) => ({ id, elo: Math.round(elos[id]) }))
      .sort((a, b) => b.elo - a.elo);
    return { elos, leaderboard, chatLog, activeEvent };
  }, [sliderIndex, timelineEvents]);

  // Dynamic ELO range — ensures board scaling adapts to actual data
  const eloRange = useMemo(() => {
    const allElos = Object.values(currentState.elos);
    const max = Math.max(1100, ...allElos);
    return { start: 1000, end: max + 50 };
  }, [currentState.elos]);

  // Day boundaries for prev/next navigation
  const dateBoundaries = useMemo(() => {
    const boundaries = [0];
    let lastDate = "";
    timelineEvents.forEach((ev, i) => {
      if (ev.date !== lastDate) {
        boundaries.push(i);
        lastDate = ev.date;
      }
    });
    boundaries.push(timelineEvents.length);
    return boundaries;
  }, [timelineEvents]);

  // Events for the current day (bottom ticker)
  const dayEvents = useMemo(() => {
    const currentDay = timelineEvents[Math.max(0, Math.floor(sliderIndex) - 1)]?.date ?? "";
    return timelineEvents.filter((ev) => ev.date === currentDay);
  }, [sliderIndex, timelineEvents]);

  // Token claims — replay timeline to determine who crossed which token tile first
  // After each event, check ALL agents' positions (not just the mover) so tokens
  // disappear the moment any avatar visually sits on them.
  const tokenState = useMemo(() => {
    const agentIds: AgentId[] = ["john", "paul", "george", "ringo"];
    const claimed: Record<AgentId, TokenType[]> = { john: [], paul: [], george: [], ringo: [] };
    const claimedTiles = new Set<number>();
    let latestClaim: { agentId: AgentId; emoji: TokenType } | null = null;

    const elos: Record<AgentId, number> = { john: 1000, paul: 1000, george: 1000, ringo: 1000 };
    const floorIdx = Math.floor(sliderIndex);

    for (let i = 0; i < floorIdx; i++) {
      const ev = timelineEvents[i];
      elos[ev.agentId] += ev.eloChange;

      // Check every agent's current position against unclaimed tokens
      for (const aid of agentIds) {
        const progress = Math.max(0, Math.min(1, (elos[aid] - eloRange.start) / (eloRange.end - eloRange.start)));
        const tileIdx = Math.floor(progress * TILES_TO_WIN);

        for (const token of TOKEN_MAP) {
          if (token.tileId <= tileIdx && !claimedTiles.has(token.tileId)) {
            claimed[aid].push(token.emoji);
            claimedTiles.add(token.tileId);
            if (i === floorIdx - 1) latestClaim = { agentId: aid, emoji: token.emoji };
          }
        }
      }
    }

    return { claimed, claimedTiles, latestClaim };
  }, [sliderIndex, timelineEvents, eloRange]);

  function onSliderChange(val: number) {
    setSliderIndex(val);
    setJumbotronMode("event");
  }

  function goNextDay() {
    const next = dateBoundaries.find((b) => b > Math.floor(sliderIndex));
    if (next !== undefined) {
      setSliderIndex(next);
      setJumbotronMode("event");
    }
  }

  function goPrevDay() {
    const prev = [...dateBoundaries].reverse().find((b) => b < Math.floor(sliderIndex));
    if (prev !== undefined) {
      setSliderIndex(prev);
      setJumbotronMode("event");
    }
  }

  function resetCamera() {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.object.position.set(50, 60, 50);
      controlsRef.current.target.set(0, 10, 0);
    }
  }

  function openEventModal(event: RaceEvent) {
    setModalContent(<EventDetailContent event={event} onClose={() => setModalContent(null)} />);
  }

  function openAgentModal(agentId: AgentId) {
    setModalContent(
      <AgentProfileContent
        agentId={agentId}
        leaderboard={currentState.leaderboard}
        recentEvents={currentState.chatLog}
        onClose={() => setModalContent(null)}
      />
    );
  }

  if (!mounted) return null;

  const activeAgentId = currentState.activeEvent?.agentId ?? null;
  const activeMovedBackward = (currentState.activeEvent?.eloChange ?? 0) < 0;

  return (
    <div className="relative w-full h-screen bg-[#060411] text-gray-50 overflow-hidden font-mono">
      <style>{MARQUEE_CSS}</style>

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows>
          <ambientLight intensity={0.6} />
          <directionalLight castShadow position={[10, 30, 10]} intensity={1.5} shadow-mapSize={[1024, 1024]} />
          <OrthographicCamera makeDefault position={[50, 60, 50]} zoom={15} near={-500} far={500} />
          <OrbitControls ref={controlsRef} target={[0, 10, 0]} makeDefault minZoom={8} maxZoom={40} />
          <Stars radius={100} depth={50} count={1500} factor={4} saturation={1} fade speed={1} />
          <fog attach="fog" args={["#060411", 80, 200]} />
          <GroundPlane />
          <ParadoxBoard agentPositionsRef={agentPositionsRef} activeAgentId={activeAgentId} activeMovedBackward={activeMovedBackward} claimedTileIds={tokenState.claimedTiles} />
          <Jumbotron newsItems={newsItems} mode={jumbotronMode} activeEvent={currentState.activeEvent ?? null} />
          {(Object.keys(AGENTS_CONFIG) as AgentId[]).map((agentId, idx) => (
            <AgentAvatar
              key={agentId}
              agentId={agentId}
              config={AGENTS_CONFIG[agentId]}
              targetElo={currentState.elos[agentId]}
              offset={AGENT_OFFSETS[idx]}
              activeEvent={currentState.activeEvent ?? null}
              justMoved={currentState.activeEvent?.agentId === agentId}
              agentPositionsRef={agentPositionsRef}
              eloRange={eloRange}
              onOpenModal={() => openAgentModal(agentId)}
              tokenClaim={tokenState.latestClaim?.agentId === agentId ? { emoji: tokenState.latestClaim.emoji } : null}
            />
          ))}
        </Canvas>
      </div>

      {/* Top Bar */}
      <ControlBar
        leaderboard={currentState.leaderboard}
        sliderIndex={sliderIndex}
        maxSlider={timelineEvents.length}
        onSliderChange={onSliderChange}
        goNextDay={goNextDay}
        goPrevDay={goPrevDay}
        resetCamera={resetCamera}
        tokenCounts={tokenState.claimed}
        timelineEvents={timelineEvents}
        dateBoundaries={dateBoundaries}
      />

      {/* Bottom Ticker */}
      <BottomTicker dayEvents={dayEvents} onOpenModal={openEventModal} />

      {/* Detail Modal */}
      <DetailModal content={modalContent} onClose={() => setModalContent(null)} />
    </div>
  );
}
