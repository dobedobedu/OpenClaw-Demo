"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { TILE_SIZE, TOKEN_BY_TILE, BOOST_BY_TILE } from "./constants";
import { AGENTS_CONFIG } from "@/lib/mockRaceData";
import type { AgentId } from "@/lib/mockRaceData";
import type { TileData } from "./types";

/** Zebra stripe mesh: white/dark stripes flat on tile surface */
function ZebraStripes({ width, depth, angle }: { width: number; depth: number; angle: number }) {
  const stripeCount = 5;
  const stripeW = width * 0.7;
  const stripeH = depth / (stripeCount * 2);
  return (
    <group position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, angle]}>
      {Array.from({ length: stripeCount }).map((_, i) => (
        <mesh key={i} position={[0, -depth / 2 + stripeH + i * stripeH * 2, 0]}>
          <planeGeometry args={[stripeW, stripeH * 0.8]} />
          <meshBasicMaterial color="#e5e7eb" opacity={0.7} transparent />
        </mesh>
      ))}
    </group>
  );
}

/** Accent edge strip on certain tiles for visual variety */
function TileAccent({ width, depth, color }: { width: number; depth: number; color: string }) {
  return (
    <mesh position={[0, 0.21, depth / 2 - 0.08]}>
      <planeGeometry args={[width, 0.15]} />
      <meshBasicMaterial color={color} opacity={0.8} transparent />
    </mesh>
  );
}

interface DynamicTileProps {
  tile: TileData;
  agentPositionsRef: React.RefObject<Record<string, number>>;
  tiltFactorRef: React.RefObject<number>;
  activeAgentId: string | null;
  activeMovedBackward: boolean;
  claimedTileIds: Set<number>;
  claimedBoostTileIds: Set<number>;
}

export default function DynamicTile({ tile, agentPositionsRef, tiltFactorRef, activeAgentId, activeMovedBackward, claimedTileIds, claimedBoostTileIds }: DynamicTileProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    if (!meshRef.current || !agentPositionsRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const tiltFactor = tiltFactorRef.current ?? 0;

    let anyAgentPassed = false;
    let bestFade = 0;
    let bestColor: string | null = null;
    let bestIsActive = false;

    for (const [agentId, exactIndex] of Object.entries(agentPositionsRef.current)) {
      if (exactIndex >= tile.id - 0.5) {
        anyAgentPassed = true;
      }

      const isActive = agentId === activeAgentId;
      const isBackward = isActive && activeMovedBackward;
      const dist = isBackward
        ? tile.id - exactIndex
        : exactIndex - tile.id;
      if (dist < 0) continue;

      const wakeLength = isActive ? 6 : 3;
      const maxIntensity = isActive ? 1.0 : 0.3;

      if (dist < wakeLength) {
        const fade = (1 - dist / wakeLength) * maxIntensity;
        if (fade > bestFade) {
          bestFade = fade;
          bestColor = AGENTS_CONFIG[agentId as AgentId]?.color ?? null;
          bestIsActive = isActive;
        }
      }
    }

    let leadingIndex = 0;
    for (const idx of Object.values(agentPositionsRef.current)) {
      if (idx > leadingIndex) leadingIndex = idx;
    }
    const visibleHorizon = Math.max(39, Math.ceil(leadingIndex) + 40);

    if (!anyAgentPassed) {
      if (tile.id <= visibleHorizon) {
        mat.opacity = 0.5;
        mat.color.set("#4b5563");
        mat.emissive.set("#000000");
        mat.emissiveIntensity = 0;
        mat.depthWrite = true;
      } else {
        mat.opacity = tiltFactor * 0.5;
        mat.color.set("#6b7280");
        mat.emissive.set("#000000");
        mat.emissiveIntensity = 0;
        mat.depthWrite = false;
      }
    } else if (bestFade > 0 && bestColor) {
      mat.depthWrite = true;
      tempColor.set(bestColor);

      if (bestFade > 0.9) {
        mat.color.copy(tempColor);
        mat.opacity = 0.9;
        mat.emissive.set(bestColor);
        mat.emissiveIntensity = bestIsActive ? 0.4 : 0.1;
      } else {
        const baseCol = new THREE.Color("#374151");
        mat.color.copy(baseCol).lerp(tempColor, bestFade);
        mat.opacity = 0.8;
        mat.emissive.set(bestIsActive ? bestColor : "#000000");
        mat.emissiveIntensity = bestIsActive ? bestFade * 0.3 : 0;
      }
    } else {
      mat.depthWrite = true;
      mat.color.set("#4b5563");
      mat.opacity = 0.6;
      mat.emissive.set("#000000");
      mat.emissiveIntensity = 0;
    }
  });

  const width = tile.isCorner ? TILE_SIZE : TILE_SIZE - 0.2;
  const depth = tile.isCorner ? TILE_SIZE : TILE_SIZE - 0.2;

  // Visual variety — accent colors based on tile type
  const accentColor = tile.type === "special" ? "#7c3aed" :
    tile.type === "event" ? "#6366f1" :
    tile.type === "tax" ? "#dc2626" :
    tile.type === "rr" ? "#d97706" :
    tile.type === "util" ? "#0891b2" : null;

  return (
    <group position={[tile.x, tile.y, tile.z]}>
      <RoundedBox ref={meshRef} args={[width, 0.4, depth]} radius={0.05} smoothness={2}>
        <meshStandardMaterial
          color="#6b7280"
          metalness={0.15}
          roughness={0.7}
          opacity={0.04}
          transparent
        />
      </RoundedBox>
      {/* Accent strip for tile variety */}
      {accentColor && <TileAccent width={width} depth={depth} color={accentColor} />}
      {tile.isCorner && (
        <>
          <Text
            position={[0, 0.22, tile.emoji ? 0.4 : 0]}
            rotation={[-Math.PI / 2, 0, tile.angle]}
            fontSize={0.32}
            color="white"
            fontWeight="bold"
            maxWidth={width - 0.3}
            textAlign="center"
            lineHeight={1.1}
          >
            {tile.label.replace(" ", "\n")}
          </Text>
          {tile.emoji && (
            <Text
              position={[0, 0.22, -0.5]}
              rotation={[-Math.PI / 2, 0, tile.angle]}
              fontSize={0.9}
              textAlign="center"
            >
              {tile.emoji}
            </Text>
          )}
        </>
      )}
      {!tile.isCorner && tile.emoji && (
        <Text
          position={[0, 0.22, 0]}
          rotation={[-Math.PI / 2, 0, tile.angle]}
          fontSize={0.9}
          textAlign="center"
        >
          {tile.emoji}
        </Text>
      )}
      {/* Yellow Submarine image on tile decoration */}
      {tile.image && (
        <Html position={[0, 2.2, 0]} center zIndexRange={[0, 0]}>
          <img src="/visualization/yellow-submarine.svg" alt="Yellow Submarine" style={{ width: "60px", height: "auto", pointerEvents: "none" }} />
        </Html>
      )}
      {/* Zebra crosswalk stripes */}
      {tile.style === "zebra" && <ZebraStripes width={width} depth={depth} angle={tile.angle} />}
      {/* Collectible shared tokens */}
      {TOKEN_BY_TILE.has(tile.id) && !claimedTileIds.has(tile.id) && (
        TOKEN_BY_TILE.get(tile.id) === "🚢" ? (
          <Html position={[0, 1.5, 0]} center zIndexRange={[0, 0]}>
            <img src="/visualization/yellow-submarine.svg" alt="Yellow Submarine" style={{ width: "40px", height: "auto", filter: "drop-shadow(0 0 12px rgba(255,255,100,0.8))", pointerEvents: "none" }} />
          </Html>
        ) : (
          <Html position={[0, 1.5, 0]} center zIndexRange={[0, 0]}>
            <div style={{ fontSize: "30px", filter: "drop-shadow(0 0 12px rgba(255,255,100,0.8))", pointerEvents: "none" }}>
              {TOKEN_BY_TILE.get(tile.id)}
            </div>
          </Html>
        )
      )}
      {/* Boost tiles — agent-specific signature boosts */}
      {BOOST_BY_TILE.has(tile.id) && !claimedBoostTileIds.has(tile.id) && (
        <Html position={[0, 1.5, 0]} center zIndexRange={[0, 0]}>
          <div style={{ fontSize: "30px", filter: "drop-shadow(0 0 12px rgba(255,215,0,0.8))", pointerEvents: "none" }}>
            {BOOST_BY_TILE.get(tile.id)!.emoji}
          </div>
        </Html>
      )}
    </group>
  );
}
