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
  const numScreens = newsItems.length;

  // Force carousel to show event panel when a new event fires
  const prevEventRef = useRef<string | null>(null);
  useEffect(() => {
    if (mode === "event" && activeEvent && activeEvent.id !== prevEventRef.current) {
      prevEventRef.current = activeEvent.id;
      // Jump currentIndex so the currently visible panel (currentIndex % numScreens) shows the event
      setCurrentIndex((prev) => {
        const target = prev - (prev % numScreens);
        return target;
      });
    }
  }, [mode, activeEvent, numScreens]);

  useEffect(() => {
    if (mode === "event") return; // Don't auto-rotate while showing an event
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [mode]);
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

  const radius = 20;
  const height = 12;
  const arcLength = (Math.PI * 2) / numScreens;
  const segmentAngle = arcLength - 0.15;

  return (
    <group position={[0, 38, 0]} ref={groupRef}>
      {/* Ticker ring */}
      <group position={[0, 8, 0]} ref={tickerRef}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[20.3, 20.3, 1.8, 64, 1, true]} />
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
              // High-contrast light backgrounds per agent
              const agentBg: Record<string, string> = {
                john: "#f5e6c8",   // beige
                paul: "#ede4f7",   // very light purple
                george: "#d8f5e3", // light mint
                ringo: "#e4dff5",  // light lilac
              };
              bgColor = agentBg[activeEvent.agentId] ?? "#f0ece4";
              topColor = agentConfig.color;
              titleColor = "#111111";
              timeColor = "#333333";
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
                    <RenderTexture attach="map" anisotropy={16} width={1536} height={1024}>
                      <OrthographicCamera makeDefault manual top={6} bottom={-6} left={-8} right={8} position={[0, 0, 5]} near={0.1} far={100} />
                      <color attach="background" args={[bgColor]} />
                      <ambientLight intensity={2} />
                      <directionalLight position={[10, 10, 5]} intensity={2} />
                      {/* Micro-texture dot grid overlay — skip for event panels so light backgrounds show through */}
                      {!showEvent && (
                        <mesh position={[0, 0, 0.05]}>
                          <planeGeometry args={[18, 14]} />
                          <meshBasicMaterial map={dotGridTex} transparent opacity={0.6} depthWrite={false} />
                        </mesh>
                      )}
                      {/* Top accent bar */}
                      <mesh position={[0, 5.3, 0]}>
                        <planeGeometry args={[18, 0.8]} />
                        <meshBasicMaterial color={topColor} />
                      </mesh>
                      {showEvent ? (
                        <EventCardContent event={activeEvent} />
                      ) : (
                        <group position={[-6, 0, 0]}>
                          <Text position={[0, 4.2, 0.1]} fontSize={0.45} color={timeColor} anchorX="left" anchorY="middle" fontWeight="bold" letterSpacing={0.08}>
                            {news.time}
                          </Text>
                          <Text position={[0, 1.2, 0.1]} fontSize={0.95} color={titleColor} anchorX="left" anchorY="middle" fontWeight="bold" maxWidth={12} lineHeight={1.3}>
                            {news.desc}
                          </Text>
                        </group>
                      )}
                    </RenderTexture>
                  </meshStandardMaterial>
                </mesh>
                <mesh position={[0, 0, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[19.9, 19.9, height + 0.2, 64, 1, true, -(segmentAngle + 0.02) / 2, segmentAngle + 0.02]} />
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

  return (
    <group position={[-6, 0, 0]}>
      {/* Date + score badge */}
      <Text position={[0, 4.2, 0.1]} fontSize={0.45} color="#444444" anchorX="left" anchorY="middle" fontWeight="bold">
        {event.date}
      </Text>
      <Text position={[14, 4.2, 0.1]} fontSize={0.45} color={isGain ? "#15803d" : "#b91c1c"} anchorX="right" anchorY="middle" fontWeight="bold">
        {isGain ? "+" : ""}{event.eloChange} ELO
      </Text>
      {/* Agent name */}
      <Text position={[0, 2.6, 0.1]} fontSize={1.2} color="#111111" anchorX="left" anchorY="middle" fontWeight="bold">
        {agentConfig.name.toUpperCase()}
      </Text>
      {/* Headline — the main attraction */}
      <Text position={[0, 0.4, 0.1]} fontSize={0.75} color="#1a1a1a" anchorX="left" anchorY="middle" maxWidth={13} lineHeight={1.4} fontWeight="bold">
        {event.action}
      </Text>
    </group>
  );
}
