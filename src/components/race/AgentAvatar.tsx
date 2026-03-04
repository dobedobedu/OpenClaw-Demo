"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "motion/react";
import { BOARD_PATH, TILES_TO_WIN } from "./constants";
import type { AgentId, RaceEvent } from "@/lib/mockRaceData";
import type { EloRange } from "./types";

interface AgentAvatarProps {
  agentId: AgentId;
  config: { name: string; color: string; pixelIcon: string };
  targetElo: number;
  offset: { x: number; z: number };
  activeEvent: RaceEvent | null;
  justMoved: boolean;
  agentPositionsRef: React.RefObject<Record<string, number>>;
  eloRange: EloRange;
  onOpenModal?: () => void;
  tokenClaim: { emoji: string; claimId: number } | null;
  boostClaim: { emoji: string; label: string; claimId: number } | null;
}

export default function AgentAvatar({
  agentId,
  config,
  targetElo,
  offset,
  activeEvent,
  justMoved,
  agentPositionsRef,
  eloRange,
  onOpenModal,
  tokenClaim,
  boostClaim,
}: AgentAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const currentEloRef = useRef(eloRange.start);
  const [visibleToken, setVisibleToken] = useState<string | null>(null);
  const prevTokenClaimIdRef = useRef<number | null>(null);
  const tokenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visibleBoost, setVisibleBoost] = useState<{ emoji: string; label: string } | null>(null);
  const prevBoostClaimIdRef = useRef<number | null>(null);
  const boostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showElo, setShowElo] = useState(false);
  const prevActiveEventIdRef = useRef<string | null>(null);
  const eloTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show token claim temporarily — timer stored in ref so slider re-renders don't cancel it
  useEffect(() => {
    if (tokenClaim && tokenClaim.claimId !== prevTokenClaimIdRef.current) {
      prevTokenClaimIdRef.current = tokenClaim.claimId;
      setVisibleToken(tokenClaim.emoji);
      if (tokenTimerRef.current) clearTimeout(tokenTimerRef.current);
      tokenTimerRef.current = setTimeout(() => setVisibleToken(null), 2000);
    } else if (!tokenClaim) {
      prevTokenClaimIdRef.current = null;
    }
  }, [tokenClaim]);

  // Show boost claim temporarily
  useEffect(() => {
    if (boostClaim && boostClaim.claimId !== prevBoostClaimIdRef.current) {
      prevBoostClaimIdRef.current = boostClaim.claimId;
      setVisibleBoost({ emoji: boostClaim.emoji, label: boostClaim.label });
      if (boostTimerRef.current) clearTimeout(boostTimerRef.current);
      boostTimerRef.current = setTimeout(() => setVisibleBoost(null), 2500);
    } else if (!boostClaim) {
      prevBoostClaimIdRef.current = null;
    }
  }, [boostClaim]);

  // Show ELO change text temporarily
  useEffect(() => {
    if (justMoved && activeEvent && activeEvent.id !== prevActiveEventIdRef.current) {
      prevActiveEventIdRef.current = activeEvent.id;
      setShowElo(true);
      if (eloTimerRef.current) clearTimeout(eloTimerRef.current);
      eloTimerRef.current = setTimeout(() => setShowElo(false), 1000);
    }
    if (!justMoved) {
      prevActiveEventIdRef.current = null;
    }
  }, [justMoved, activeEvent]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    currentEloRef.current = THREE.MathUtils.lerp(currentEloRef.current, targetElo, 2 * delta);
    const progress = Math.max(0, Math.min(1, (currentEloRef.current - eloRange.start) / (eloRange.end - eloRange.start)));
    const exactIndex = progress * TILES_TO_WIN;
    if (agentPositionsRef?.current) agentPositionsRef.current[agentId] = exactIndex;
    const lowerIndex = Math.floor(exactIndex);
    const upperIndex = Math.min(lowerIndex + 1, BOARD_PATH.length - 1);
    const remainder = exactIndex - lowerIndex;
    const tileA = BOARD_PATH[lowerIndex];
    const tileB = BOARD_PATH[upperIndex];
    if (!tileA || !tileB) return;
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
      const progress = Math.max(0, Math.min(1, (targetElo - eloRange.start) / (eloRange.end - eloRange.start)));
      const exactIndex = progress * TILES_TO_WIN;
      const lowerIndex = Math.floor(exactIndex);
      const tileA = BOARD_PATH[lowerIndex];
      if (tileA) {
        groupRef.current.position.set(
          tileA.flatX + offset.x + tileA.y,
          tileA.y + 0.6,
          tileA.flatZ + offset.z + tileA.y
        );
      }
    }
  }, [offset.x, offset.z, eloRange.start, eloRange.end, targetElo]);

  return (
    <group ref={groupRef}>
      {/* Avatar head */}
      <Html position={[0, 1.2, 0]} center className="pointer-events-none z-40">
        <div
          className="flex flex-col items-center justify-end h-[150px] w-[100px] cursor-pointer pointer-events-auto"
          onClick={onOpenModal}
        >
          <img
            src={config.pixelIcon}
            alt={config.name}
            className="h-full w-auto object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]"
          />
        </div>
      </Html>
      {/* ELO change popup — auto-dismisses after 1s */}
      {showElo && activeEvent && !visibleBoost && (
        <Html position={[0, 3.5, 0]} center className="pointer-events-none z-50">
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -40, scale: 1.5 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`font-black text-3xl whitespace-nowrap drop-shadow-[0_4px_4px_rgba(0,0,0,1)] ${
              activeEvent.eloChange > 0 ? "text-green-400" : "text-red-500"
            }`}
            style={{
              WebkitTextStroke: "1px black",
              textShadow: `0 0 20px ${activeEvent.eloChange > 0 ? "#4ade80" : "#f87171"}`,
            }}
          >
            {activeEvent.eloChange > 0 ? "+" : ""}
            {activeEvent.eloChange} ELO
          </motion.div>
        </Html>
      )}
      {/* Boost popup — golden "+10 ELO 🕶️ SHADES BOOST" — replaces ELO popup */}
      {visibleBoost && (
        <Html position={[0, 3.5, 0]} center className="pointer-events-none z-50">
          <motion.div
            key={`boost-${prevBoostClaimIdRef.current}`}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -40, scale: 1.5 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="font-black text-2xl whitespace-nowrap drop-shadow-[0_4px_4px_rgba(0,0,0,1)]"
            style={{
              color: "#fbbf24",
              WebkitTextStroke: "1px rgba(0,0,0,0.8)",
              textShadow: "0 0 20px rgba(251,191,36,0.8), 0 0 40px rgba(251,191,36,0.4)",
            }}
          >
            +10 ELO {visibleBoost.emoji} {visibleBoost.label} BOOST
          </motion.div>
        </Html>
      )}
      {/* Token claim popup — offset left so it doesn't overlap ELO */}
      {visibleToken && (
        <Html position={[-1.5, 3.5, 0]} center className="pointer-events-none z-50">
          <motion.div
            key={`token-${prevTokenClaimIdRef.current}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -30, scale: 1.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-3xl drop-shadow-[0_0_20px_rgba(255,255,100,0.9)]"
          >
            {visibleToken === "🚢" ? (
              <img
                src="/visualization/yellow-submarine.svg"
                alt="Yellow Submarine"
                style={{ width: "40px", height: "auto" }}
              />
            ) : (
              visibleToken
            )}
          </motion.div>
        </Html>
      )}
    </group>
  );
}
