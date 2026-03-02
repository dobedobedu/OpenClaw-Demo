"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float, OrthographicCamera, RenderTexture } from "@react-three/drei";
import * as THREE from "three";
import { AGENTS_CONFIG } from "@/lib/mockRaceData";
import type { AgentId, RaceEvent } from "@/lib/mockRaceData";
import type { NewsItem } from "./constants";

/** Generates a repeating cross-hatch / dot-grid canvas texture */
function useDotGridTexture() {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, size, size);
    // Draw a grid of small dots
    const spacing = 6;
    const dotSize = 1.5;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    for (let x = 0; x < size; x += spacing) {
      for (let y = 0; y < size; y += spacing) {
        // Offset every other row for cross-hatch feel
        const offsetX = y % (spacing * 2) === 0 ? spacing / 2 : 0;
        ctx.fillRect(x + offsetX, y, dotSize, dotSize);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 6);
    return tex;
  }, []);
}

interface JumbotronProps {
  newsItems: NewsItem[];
  mode: "news" | "event";
  activeEvent: RaceEvent | null;
  onClickEvent?: () => void;
}

export default function Jumbotron({ newsItems, mode, activeEvent, onClickEvent }: JumbotronProps) {
  const carouselRef = useRef<THREE.Group>(null);
  const tickerRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const dotGridTex = useDotGridTexture();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const numScreens = newsItems.length;
  const isometricCameraOffset = Math.PI / 4;

  useFrame((state, delta) => {
    if (carouselRef.current) {
      const anglePerScreen = (Math.PI * 2) / numScreens;
      const targetRotation = currentIndex * anglePerScreen + isometricCameraOffset;
      carouselRef.current.rotation.y = THREE.MathUtils.lerp(carouselRef.current.rotation.y, targetRotation, 5 * delta);
    }
    if (tickerRef.current) tickerRef.current.rotation.y += delta * 0.2;
    if (groupRef.current) {
      const camPos = state.camera.position;
      const dist = Math.sqrt(Math.pow(camPos.x - 50, 2) + Math.pow(camPos.y - 60, 2) + Math.pow(camPos.z - 50, 2));
      groupRef.current.visible = dist < 15;
    }
  });

  const radius = 13;
  const height = 8;
  const arcLength = (Math.PI * 2) / numScreens;
  const segmentAngle = arcLength - 0.15;

  return (
    <group position={[0, 38, 0]} ref={groupRef}>
      {/* Ticker ring */}
      <group position={[0, 5.5, 0]} ref={tickerRef}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[13.2, 13.2, 1.4, 64, 1, true]} />
          <meshBasicMaterial side={THREE.DoubleSide}>
            <RenderTexture attach="map" anisotropy={16} width={1024} height={128}>
              <OrthographicCamera makeDefault manual top={1} bottom={-1} left={-15} right={15} position={[0, 0, 5]} />
              <color attach="background" args={["#1a1333"]} />
              <ambientLight intensity={2} />
              <group>
                <Text fontSize={0.9} color="#4ade80" position={[-12, 0, 0]} fontWeight="bold">SPY +2.45%</Text>
                <Text fontSize={0.9} color="#fb7185" position={[-6, 0, 0]} fontWeight="bold">NVDA -1.2%</Text>
                <Text fontSize={0.9} color="#4ade80" position={[0, 0, 0]} fontWeight="bold">BTC +8.1%</Text>
                <Text fontSize={0.9} color="#fde047" position={[6, 0, 0]} fontWeight="bold">AAPL =0.0%</Text>
                <Text fontSize={0.9} color="#4ade80" position={[12, 0, 0]} fontWeight="bold">TSLA +4.2%</Text>
              </group>
            </RenderTexture>
          </meshBasicMaterial>
        </mesh>
      </group>

      {/* Carousel panels */}
      <Float speed={1.5} rotationIntensity={0} floatIntensity={0.5}>
        <group ref={carouselRef}>
          {newsItems.map((news, i) => {
            const angle = i * arcLength;

            // Determine if this panel should show the event card
            const showEvent = mode === "event" && activeEvent && i === currentIndex % numScreens;

            let bgColor = "#312554";
            let topColor = "#d946ef";
            let titleColor = "#ffffff";
            let timeColor = "#d946ef";

            if (showEvent) {
              const agentConfig = AGENTS_CONFIG[activeEvent.agentId];
              bgColor = "#f1f5f9";
              topColor = agentConfig.color;
              titleColor = agentConfig.color;
              timeColor = "#6b21a8";
            } else if (news.type === "good") {
              bgColor = "#1a4d30";
              topColor = "#10b981";
              timeColor = "#34d399";
            } else if (news.type === "bad") {
              bgColor = "#4d1a2e";
              topColor = "#f43f5e";
              timeColor = "#fb7185";
            } else if (news.type === "neutral") {
              bgColor = "#3d3520";
              topColor = "#eab308";
              timeColor = "#fde047";
            }

            return (
              <group key={i} rotation={[0, angle, 0]}>
                <mesh position={[0, 0, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[radius, radius, height, 64, 1, true, -segmentAngle / 2, segmentAngle]} />
                  <meshStandardMaterial side={THREE.DoubleSide} roughness={0.1} metalness={0.2} transparent opacity={0.98}>
                    <RenderTexture attach="map" anisotropy={16} width={1024} height={768}>
                      <OrthographicCamera makeDefault manual top={4} bottom={-4} left={-5} right={5} position={[0, 0, 5]} near={0.1} far={100} />
                      <color attach="background" args={[bgColor]} />
                      <ambientLight intensity={2} />
                      <directionalLight position={[10, 10, 5]} intensity={2} />
                      {/* Micro-texture dot grid overlay */}
                      <mesh position={[0, 0, 0.05]}>
                        <planeGeometry args={[12, 10]} />
                        <meshBasicMaterial map={dotGridTex} transparent opacity={0.6} depthWrite={false} />
                      </mesh>
                      {/* Top accent bar */}
                      <mesh position={[0, 3.5, 0]}>
                        <planeGeometry args={[12, 0.6]} />
                        <meshBasicMaterial color={topColor} />
                      </mesh>
                      {showEvent ? (
                        <EventCardContent event={activeEvent} />
                      ) : (
                        <group position={[-4, 0, 0]}>
                          <Text position={[0, 2.8, 0.1]} fontSize={0.3} color={timeColor} anchorX="left" anchorY="middle" fontWeight="bold" letterSpacing={0.08}>
                            {news.time}
                          </Text>
                          <Text position={[0, 0.8, 0.1]} fontSize={0.65} color={titleColor} anchorX="left" anchorY="middle" fontWeight="bold" maxWidth={7.5} lineHeight={1.3}>
                            {news.desc}
                          </Text>
                        </group>
                      )}
                    </RenderTexture>
                  </meshStandardMaterial>
                </mesh>
                <mesh position={[0, 0, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[12.95, 12.95, height + 0.2, 64, 1, true, -(segmentAngle + 0.02) / 2, segmentAngle + 0.02]} />
                  <meshStandardMaterial color="#3d2260" side={THREE.DoubleSide} metalness={0.9} roughness={0.2} />
                </mesh>
              </group>
            );
          })}
        </group>
      </Float>
    </group>
  );
}

function EventCardContent({ event }: { event: RaceEvent }) {
  const agentConfig = AGENTS_CONFIG[event.agentId];
  const isGain = event.eloChange > 0;
  const eloText = `${isGain ? "+" : ""}${event.eloChange} ELO`;
  const reasoningText = event.reasoning
    ? event.reasoning.length > 80
      ? event.reasoning.slice(0, 77) + "..."
      : event.reasoning
    : null;

  return (
    <group position={[-4, 0, 0]}>
      {/* Date */}
      <Text position={[0, 2.8, 0.1]} fontSize={0.3} color="#6b21a8" anchorX="left" anchorY="middle" fontWeight="bold">
        {event.date}
      </Text>
      {/* Agent name */}
      <Text position={[0, 1.6, 0.1]} fontSize={0.7} color={agentConfig.color} anchorX="left" anchorY="middle" fontWeight="bold">
        {agentConfig.name.toUpperCase()}
      </Text>
      {/* Action text */}
      <Text position={[0, 0.4, 0.1]} fontSize={0.5} color="#1e293b" anchorX="left" anchorY="middle" maxWidth={7} lineHeight={1.3}>
        {event.action}
      </Text>
      {/* ELO badge */}
      <Text position={[7.5, 1.6, 0.1]} fontSize={0.55} color={isGain ? "#16a34a" : "#dc2626"} anchorX="right" anchorY="middle" fontWeight="bold">
        {eloText}
      </Text>
      {/* Reasoning */}
      {reasoningText && (
        <Text position={[0, -1.0, 0.1]} fontSize={0.32} color="#7c3aed" anchorX="left" anchorY="middle" maxWidth={7.5} lineHeight={1.3} fontStyle="italic">
          &ldquo;{reasoningText}&rdquo;
        </Text>
      )}
    </group>
  );
}
