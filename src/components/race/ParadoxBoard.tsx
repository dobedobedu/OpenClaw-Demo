"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import DynamicTile from "./DynamicTile";
import { BOARD_PATH, DEFAULT_CAMERA_POS, CAMERA_TILT_DISTANCE } from "./constants";

interface ParadoxBoardProps {
  agentPositionsRef: React.RefObject<Record<string, number>>;
  activeAgentId: string | null;
  activeMovedBackward: boolean;
  claimedTileIds: Set<number>;
  claimedBoostTileIds: Set<number>;
}

export default function ParadoxBoard({ agentPositionsRef, activeAgentId, activeMovedBackward, claimedTileIds, claimedBoostTileIds }: ParadoxBoardProps) {
  const tiltFactorRef = useRef(0);

  useFrame((state) => {
    const deviation = state.camera.position.distanceTo(DEFAULT_CAMERA_POS);
    tiltFactorRef.current = Math.min(1, deviation / CAMERA_TILT_DISTANCE);
  });

  return (
    <group>
      {BOARD_PATH.map((tile) => (
        <DynamicTile
          key={tile.id}
          tile={tile}
          agentPositionsRef={agentPositionsRef}
          tiltFactorRef={tiltFactorRef}
          activeAgentId={activeAgentId}
          activeMovedBackward={activeMovedBackward}
          claimedTileIds={claimedTileIds}
          claimedBoostTileIds={claimedBoostTileIds}
        />
      ))}
    </group>
  );
}
