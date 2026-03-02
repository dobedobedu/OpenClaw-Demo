"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html, Float, Stars, RoundedBox, OrthographicCamera, RenderTexture } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "motion/react";
import { TIMELINE_EVENTS, AGENTS_CONFIG, AgentId, RaceEvent } from "@/lib/mockRaceData";
import type { EloHistory, LeaderboardEntry, Prediction } from "@/lib/db";

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
    type: p.direction === "UP" ? "good" as const : "bad" as const,
  }));
}

// ----------------------------------------------------
// PENROSE PARADOX BOARD GENERATION
// ----------------------------------------------------
const TILE_SIZE = 2.4;
const TILES_PER_SIDE = 10;
const HALF = (TILES_PER_SIDE * TILE_SIZE) / 2;
const TOTAL_TILES = 120;
const H_STEP = 0.5;

const PROPERTIES = [
  { name: "GO", color: "#facc15", type: "special" },
  { name: "Mediterranean", color: "#8b5cf6", type: "prop" },
  { name: "Community Chest", color: "#3b82f6", type: "event" },
  { name: "Baltic Ave", color: "#8b5cf6", type: "prop" },
  { name: "Income Tax", color: "#64748b", type: "tax" },
  { name: "Reading RR", color: "#1e293b", type: "rr" },
  { name: "Oriental Ave", color: "#38bdf8", type: "prop" },
  { name: "Chance", color: "#ec4899", type: "event" },
  { name: "Vermont Ave", color: "#38bdf8", type: "prop" },
  { name: "Connecticut", color: "#38bdf8", type: "prop" },
  { name: "JAIL", color: "#f97316", type: "special" },
  { name: "St. Charles", color: "#d946ef", type: "prop" },
  { name: "Electric Co", color: "#fcd34d", type: "util" },
  { name: "States Ave", color: "#d946ef", type: "prop" },
  { name: "Virginia Ave", color: "#d946ef", type: "prop" },
  { name: "Penn RR", color: "#1e293b", type: "rr" },
  { name: "St. James", color: "#f97316", type: "prop" },
  { name: "Community Chest", color: "#3b82f6", type: "event" },
  { name: "Tennessee", color: "#f97316", type: "prop" },
  { name: "New York", color: "#f97316", type: "prop" },
  { name: "FREE PARKING", color: "#ef4444", type: "special" },
  { name: "Kentucky Ave", color: "#ef4444", type: "prop" },
  { name: "Chance", color: "#ec4899", type: "event" },
  { name: "Indiana Ave", color: "#ef4444", type: "prop" },
  { name: "Illinois Ave", color: "#ef4444", type: "prop" },
  { name: "B. & O. RR", color: "#1e293b", type: "rr" },
  { name: "Atlantic Ave", color: "#eab308", type: "prop" },
  { name: "Ventnor Ave", color: "#eab308", type: "prop" },
  { name: "Water Works", color: "#fcd34d", type: "util" },
  { name: "Marvin Gardens", color: "#eab308", type: "prop" },
  { name: "GO TO JAIL", color: "#3b82f6", type: "special" },
  { name: "Pacific Ave", color: "#10b981", type: "prop" },
  { name: "North Carolina", color: "#10b981", type: "prop" },
  { name: "Community Chest", color: "#3b82f6", type: "event" },
  { name: "Pennsylvania", color: "#10b981", type: "prop" },
  { name: "Short Line", color: "#1e293b", type: "rr" },
  { name: "Chance", color: "#ec4899", type: "event" },
  { name: "Park Place", color: "#3b82f6", type: "prop" },
  { name: "Luxury Tax", color: "#64748b", type: "tax" },
  { name: "Boardwalk", color: "#3b82f6", type: "prop" }
];

const BOARD_PATH: any[] = [];
for (let i = 0; i < TOTAL_TILES; i++) {
  const loop_i = i % 40;
  const propDef = PROPERTIES[loop_i];
  let flatX, flatZ, angle;
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
    isCorner: loop_i % 10 === 0,
    loopIndex: loop_i
  });
}

const START_ELO = 950;
const END_ELO = 1300;
const TILES_TO_WIN = 75;

function BoardProps({ tile }: { tile: any }) {
  if (tile.loopIndex === 35) {
    return (
      <group position={[0, 0.22, 0]}>
         {[...Array(5)].map((_, i) => (
           <mesh key={i} position={[0, 0, -1 + (i * 0.5)]} rotation={[-Math.PI/2, 0, 0]}>
             <planeGeometry args={[1.8, 0.2]} />
             <meshBasicMaterial color="white" />
           </mesh>
         ))}
      </group>
    );
  }
  return null;
}

function AgentAvatar({ agentId, config, targetElo, offset, activeEvent, justMoved }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const currentEloRef = useRef(START_ELO);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    currentEloRef.current = THREE.MathUtils.lerp(currentEloRef.current, targetElo, 2 * delta);
    const progress = Math.max(0, Math.min(1, (currentEloRef.current - START_ELO) / (END_ELO - START_ELO)));
    const exactIndex = progress * TILES_TO_WIN;
    const lowerIndex = Math.floor(exactIndex);
    const upperIndex = Math.min(lowerIndex + 1, BOARD_PATH.length - 1);
    const remainder = exactIndex - lowerIndex;
    const tileA = BOARD_PATH[lowerIndex];
    const tileB = BOARD_PATH[upperIndex];
    if(!tileA || !tileB) return;
    const interpFlatX = THREE.MathUtils.lerp(tileA.flatX, tileB.flatX, remainder);
    const interpFlatZ = THREE.MathUtils.lerp(tileA.flatZ, tileB.flatZ, remainder);
    const interpY = THREE.MathUtils.lerp(tileA.y, tileB.y, remainder);
    const targetX = interpFlatX + offset.x + interpY;
    const targetZ = interpFlatZ + offset.z + interpY;
    const targetY = interpY + 0.6;
    groupRef.current.position.x = targetX;
    groupRef.current.position.z = targetZ;
    if (Math.abs(targetElo - currentEloRef.current) > 0.5) {
      groupRef.current.position.y = targetY + Math.abs(Math.sin(state.clock.elapsedTime * 20)) * 0.4;
    } else {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 5 * delta);
    }
  });

  useEffect(() => {
    if (groupRef.current) {
      const progress = Math.max(0, Math.min(1, (targetElo - START_ELO) / (END_ELO - START_ELO)));
      const exactIndex = progress * TILES_TO_WIN;
      const lowerIndex = Math.floor(exactIndex);
      const tileA = BOARD_PATH[lowerIndex];
      if (tileA) {
        groupRef.current.position.set(tileA.flatX + offset.x + tileA.y, tileA.y + 0.6, tileA.flatZ + offset.z + tileA.y);
      }
    }
  }, [offset.x, offset.z]);

  return (
    <group ref={groupRef}>
      <Html position={[0, 1.2, 0]} center className="pointer-events-none z-40">
        <div className="flex flex-col items-center justify-end h-[150px] w-[100px]">
          <img src={config.pixelIcon} alt={config.name} className="h-full w-auto object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]" />
        </div>
      </Html>
      {justMoved && activeEvent && (
        <Html position={[0, 3, 0]} center className="pointer-events-none z-50">
           <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.5 }} animate={{ opacity: 1, y: -40, scale: 1.5 }}
              exit={{ opacity: 0, y: -60 }} transition={{ duration: 1.5, ease: "easeOut" }}
              className={`font-black text-3xl whitespace-nowrap drop-shadow-[0_4px_4px_rgba(0,0,0,1)] ${activeEvent.eloChange > 0 ? 'text-green-400' : 'text-red-500'}`}
              style={{ WebkitTextStroke: '1px black', textShadow: `0 0 20px ${activeEvent.eloChange > 0 ? '#4ade80' : '#f87171'}` }}
            >
              {activeEvent.eloChange > 0 ? '+' : ''}{activeEvent.eloChange} ELO
            </motion.div>
        </Html>
      )}
    </group>
  );
}

function ParadoxBoard() {
  return (
    <group>
      {BOARD_PATH.map((tile) => {
        const width = tile.isCorner ? TILE_SIZE : TILE_SIZE - 0.2;
        const depth = tile.isCorner ? TILE_SIZE : TILE_SIZE - 0.2;
        return (
          <group key={tile.id} position={[tile.x, tile.y, tile.z]}>
            <RoundedBox args={[width, 0.4, depth]} radius={0.05} smoothness={2} castShadow receiveShadow>
               <meshStandardMaterial color={tile.type === 'special' ? '#111827' : '#1e293b'} metalness={0.1} roughness={0.8} />
            </RoundedBox>
            {!tile.isCorner && tile.type === 'prop' && (
              <mesh position={[0, 0.21, (TILE_SIZE/2) - 0.6]} rotation={[-Math.PI/2, 0, 0]}>
                 <planeGeometry args={[width - 0.2, 0.8]} />
                 <meshBasicMaterial color={tile.color} />
              </mesh>
            )}
            {(tile.isCorner || tile.type !== 'prop') && (
              <mesh position={[0, 0.21, 0]} rotation={[-Math.PI/2, 0, 0]}>
                 <planeGeometry args={[width - 0.2, depth - 0.2]} />
                 <meshBasicMaterial color={tile.color} transparent opacity={tile.type === 'special' ? 1 : 0.2} />
              </mesh>
            )}
            <Text position={[0, 0.22, tile.type === 'prop' && !tile.isCorner ? -0.2 : 0]} rotation={[-Math.PI / 2, 0, tile.angle]} 
              fontSize={0.35} color={tile.type === 'special' ? "black" : "white"} fontWeight="bold" maxWidth={width - 0.4} textAlign="center" lineHeight={1.2}
            >
              {tile.label.replace(' ', '\n')}
            </Text>
            <BoardProps tile={tile} />
          </group>
        );
      })}
    </group>
  );
}

const NEWS_ITEMS = [
  { time: "9:30 AM", title: "FED RATE CUT", desc: "Markets surge as Fed cuts rates by 50bps.", type: "good" },
  { time: "11:15 AM", title: "INFLATION UP", desc: "CPI data hotter than expected.", type: "bad" },
  { time: "1:00 PM", title: "BTC BREAKOUT", desc: "Bitcoin breaks $100k resistance.", type: "good" },
  { time: "2:45 PM", title: "TSLA RECALL", desc: "Tesla recalls 2M vehicles over software.", type: "bad" },
  { time: "3:30 PM", title: "AAPL EVENT", desc: "Apple announces new AR headset features.", type: "neutral" },
  { time: "4:00 PM", title: "MARKET CLOSE", desc: "SPY ends day up +2.45%.", type: "good" }
];

function SteppingNewsCarousel({ newsItems }: { newsItems: typeof NEWS_ITEMS }) {
  const carouselRef = useRef<THREE.Group>(null);
  const tickerRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => { setCurrentIndex((prev) => prev + 1); }, 5000);
    return () => clearInterval(interval);
  }, []);

  const numScreens = newsItems.length;
  const isometricCameraOffset = Math.PI / 4;

  useFrame((state, delta) => {
    if (carouselRef.current) {
      const anglePerScreen = (Math.PI * 2) / numScreens;
      const targetRotation = (currentIndex * anglePerScreen) + isometricCameraOffset;
      carouselRef.current.rotation.y = THREE.MathUtils.lerp(carouselRef.current.rotation.y, targetRotation, 5 * delta);
    }
    if (tickerRef.current) tickerRef.current.rotation.y += delta * 0.2;
    if (groupRef.current) {
      const camPos = state.camera.position;
      const dist = Math.sqrt(Math.pow(camPos.x - 50, 2) + Math.pow(camPos.y - 60, 2) + Math.pow(camPos.z - 50, 2));
      groupRef.current.visible = dist < 15;
    }
  });

  const radius = 10;
  const height = 5;
  const arcLength = (Math.PI * 2) / numScreens;
  const segmentAngle = arcLength - 0.15;

  return (
    <group position={[0, 28, 0]} ref={groupRef}>
      <group position={[0, 4.0, 0]} ref={tickerRef}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[radius, radius, 1.2, 64, 1, true]} />
          <meshStandardMaterial side={THREE.DoubleSide} roughness={0.2} metalness={0.8} transparent opacity={0.9}>
            <RenderTexture attach="map" anisotropy={16} width={1024} height={128}>
              <OrthographicCamera makeDefault manual top={1} bottom={-1} left={-15} right={15} position={[0, 0, 5]} />
              <color attach="background" args={["#000000"]} />
              <ambientLight intensity={2} />
              <group position={[0, 0, 0]}>
                <Text fontSize={0.8} color="#10b981" position={[-12, 0, 0]} fontWeight="bold">SPY +2.45%</Text>
                <Text fontSize={0.8} color="#f43f5e" position={[-6, 0, 0]} fontWeight="bold">NVDA -1.2%</Text>
                <Text fontSize={0.8} color="#10b981" position={[0, 0, 0]} fontWeight="bold">BTC +8.1%</Text>
                <Text fontSize={0.8} color="#facc15" position={[6, 0, 0]} fontWeight="bold">AAPL =0.0%</Text>
                <Text fontSize={0.8} color="#10b981" position={[12, 0, 0]} fontWeight="bold">TSLA +4.2%</Text>
              </group>
            </RenderTexture>
          </meshStandardMaterial>
        </mesh>
      </group>
      <Float speed={1.5} rotationIntensity={0} floatIntensity={0.5}>
        <group ref={carouselRef}>
          {newsItems.map((news, i) => {
            const angle = i * arcLength;
            let bgColor = "#020617", topColor = "#0f172a", titleColor = "#ffffff", timeColor = "#94a3b8";
            if (news.type === 'good') { bgColor = "#011a14"; topColor = "#064e3b"; timeColor = "#34d399"; }
            else if (news.type === 'bad') { bgColor = "#2d030f"; topColor = "#881337"; timeColor = "#fb7185"; }
            return (
              <group key={i} rotation={[0, angle, 0]}>
                <mesh position={[0, 0, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[radius, radius, height, 64, 1, true, -segmentAngle / 2, segmentAngle]} />
                  <meshStandardMaterial side={THREE.DoubleSide} roughness={0.1} metalness={0.2} transparent opacity={0.98}>
                    <RenderTexture attach="map" anisotropy={16} width={1024} height={512}>
                      <OrthographicCamera makeDefault manual top={2.5} bottom={-2.5} left={-4} right={4} position={[0, 0, 5]} near={0.1} far={100} />
                      <color attach="background" args={[bgColor]} />
                      <ambientLight intensity={2} /><directionalLight position={[10, 10, 5]} intensity={2} />
                      <mesh position={[0, 2.0, 0]}><planeGeometry args={[10, 1.4]} /><meshBasicMaterial color={topColor} /></mesh>
                      <group position={[-3.2, -0.2, 0]}>
                        <Text position={[0, 2.2, 0.1]} fontSize={0.5} color={timeColor} anchorX="left" anchorY="middle" fontWeight="bold" letterSpacing={0.1}>{news.time}</Text>
                        <Text position={[0, 0.2, 0.1]} fontSize={1.3} color={titleColor} anchorX="left" anchorY="middle" fontWeight="bold" maxWidth={6.5} lineHeight={1.4}>{news.desc}</Text>
                      </group>
                    </RenderTexture>
                  </meshStandardMaterial>
                </mesh>
                <mesh position={[0, 0, 0]} castShadow receiveShadow>
                   <cylinderGeometry args={[radius - 0.05, radius - 0.05, height + 0.2, 64, 1, true, -(segmentAngle + 0.02) / 2, segmentAngle + 0.02]} />
                   <meshStandardMaterial color="#022c22" side={THREE.DoubleSide} metalness={0.9} roughness={0.2} />
                </mesh>
              </group>
            );
          })}
        </group>
      </Float>
    </group>
  );
}

export default function RaceDashboard({ eloHistory, leaderboardData, predictions }: RaceDashboardProps = {}) {
  const [sliderIndex, setSliderIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const controlsRef = useRef<any>(null);
  useEffect(() => setMounted(true), []);

  const timelineEvents = useMemo(() => {
    if (eloHistory && eloHistory.length > 0) {
      return buildTimelineFromEloHistory(eloHistory);
    }
    return TIMELINE_EVENTS;
  }, [eloHistory]);

  const newsItems = useMemo(() => {
    if (predictions && predictions.length > 0) {
      return buildNewsFromPredictions(predictions);
    }
    return NEWS_ITEMS;
  }, [predictions]);

  const currentState = useMemo(() => {
    let elos: Record<AgentId, number> = { john: 1000, paul: 1000, george: 1000, ringo: 1000 };
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
    const leaderboard = Object.keys(elos).map((id) => ({ id: id as AgentId, elo: Math.round(elos[id as AgentId]) })).sort((a, b) => b.elo - a.elo);
    return { elos, leaderboard, chatLog, activeEvent };
  }, [sliderIndex, timelineEvents]);
  if (!mounted) return null;
  return (
    <div className="relative w-full h-screen bg-[#060411] text-gray-50 overflow-hidden font-mono">
      <style dangerouslySetInnerHTML={{__html: `@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}} />
      <div className="absolute inset-0 z-0">
        <Canvas shadows>
          <ambientLight intensity={0.6} /><directionalLight castShadow position={[10, 30, 10]} intensity={1.5} shadow-mapSize={[1024, 1024]} />
          <OrthographicCamera makeDefault position={[50, 60, 50]} zoom={20} near={-500} far={500} />
          <OrbitControls ref={controlsRef} target={[0, 10, 0]} makeDefault />
          <Stars radius={100} depth={50} count={1500} factor={4} saturation={1} fade speed={1} />
          <ParadoxBoard /><SteppingNewsCarousel newsItems={newsItems} />
          {(Object.keys(AGENTS_CONFIG) as AgentId[]).map((agentId, idx) => {
            const config = AGENTS_CONFIG[agentId];
            const offsets = [{ x: -0.6, z: -0.6 }, { x: 0.6, z: -0.6 }, { x: -0.6, z: 0.6 }, { x: 0.6, z: 0.6 }];
            return <AgentAvatar key={agentId} agentId={agentId} config={config} targetElo={currentState.elos[agentId]} offset={offsets[idx]} activeEvent={currentState.activeEvent} justMoved={currentState.activeEvent?.agentId === agentId} />;
          })}
        </Canvas>
      </div>
      <div className="absolute top-6 left-6 z-50 pointer-events-none">
        <h1 className="text-4xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">HERE COMES THE RUN</h1>
        <p className="text-sm text-indigo-300 font-mono mt-1 font-bold">THE AI MARKET PREDICTION RACE.</p>
        <p className="text-xs text-blue-400 font-bold mt-2 animate-pulse drop-shadow-lg">Left Click & Drag to reveal the paradox</p>
      </div>
      <div className="absolute top-36 left-6 z-50">
        <button onClick={() => { if (controlsRef.current) { controlsRef.current.reset(); controlsRef.current.object.position.set(50, 60, 50); controlsRef.current.target.set(0, 10, 0); } }} className="bg-indigo-900/80 backdrop-blur-md px-4 py-2 rounded-lg border border-indigo-500 hover:bg-indigo-800 transition shadow-[0_0_8px_rgba(99,102,241,0.3)] text-xs font-bold uppercase tracking-widest">Reset Camera</button>
      </div>
      <div className="absolute top-6 right-6 flex justify-end z-50 pointer-events-none">
        <div className="flex gap-4 bg-[#0a0616]/80 backdrop-blur-md p-2 rounded-2xl border border-indigo-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          {currentState.leaderboard.map((item, index) => {
            const config = AGENTS_CONFIG[item.id];
            return (
              <motion.div key={item.id} layout className="flex items-center gap-3 bg-[#0d0914] px-4 py-2 rounded-xl pointer-events-auto border-l-4 shadow-lg" style={{ borderLeftColor: config.color }}>
                <div className="text-xl font-black text-gray-600">{index + 1}</div>
                <div className="w-12 h-16 flex items-end justify-center overflow-visible"><img src={config.pixelIcon} alt={config.name} className="h-full w-auto object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)] bg-transparent" /></div>
                <div className="flex flex-col"><div className="font-bold text-sm leading-none" style={{ color: config.color }}>{config.name}</div><div className="text-xs text-gray-300 mt-1 font-mono font-bold">{item.elo}</div></div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="absolute bottom-32 right-6 z-50 w-80 max-h-80 flex flex-col justify-end pointer-events-none">
        <div className="flex-1 overflow-hidden flex flex-col justify-end gap-2">
          <AnimatePresence initial={false}>
            {currentState.chatLog.slice(-5).map((ev) => {
              const config = AGENTS_CONFIG[ev.agentId];
              return (
                <motion.div key={ev.id} initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, height: 0 }} className="bg-[#0a0616]/90 backdrop-blur-md p-3 border border-gray-700 rounded-lg shadow-xl" style={{ borderLeftColor: config.color, borderLeftWidth: '4px' }}>
                  <div className="text-[10px] text-gray-500 mb-1">{ev.date}</div>
                  <div className="text-xs"><span style={{ color: config.color }} className="font-bold">{config.name} </span><span className="text-gray-300">{ev.action} </span><span className={ev.eloChange > 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>({ev.eloChange > 0 ? '+' : ''}{ev.eloChange})</span></div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl bg-[#0a0616]/90 backdrop-blur-xl border border-indigo-500/50 p-4 rounded-2xl flex items-center justify-center shadow-[0_0_12px_rgba(79,70,229,0.2)]">
        <div className="w-full flex items-center gap-6">
          <button onClick={() => setSliderIndex(i => Math.min(i + 1, timelineEvents.length))} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-[#060411] font-black px-6 py-4 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_8px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest text-sm" disabled={sliderIndex >= timelineEvents.length}>{sliderIndex >= timelineEvents.length ? "MARKET CLOSED" : "NEXT DAY"}</button>
          <div className="flex-1"><div className="flex justify-between text-xs text-indigo-300 font-mono font-bold mb-3 uppercase tracking-widest"><span>Opening Bell</span><span className="text-yellow-400 font-black">TARGET ELO: 1300</span></div>
            <input type="range" min="0" max={timelineEvents.length} step="0.01" value={sliderIndex} onChange={(e) => setSliderIndex(parseFloat(e.target.value))} className="w-full cursor-pointer h-3 rounded-full appearance-none bg-gray-900 border border-gray-700 shadow-inner" style={{ accentColor: '#facc15', background: `linear-gradient(to right, #facc15 0%, #f97316 ${(sliderIndex / timelineEvents.length) * 100}%, #111827 ${(sliderIndex / timelineEvents.length) * 100}%, #111827 100%)` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
