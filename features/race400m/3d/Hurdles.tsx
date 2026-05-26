// ============================================================
// features/race400m/3d/Hurdles.tsx
// Renders the 10 hurdles along the track for hurdles mode.
// ============================================================

import { useFrame } from '@react-three/fiber/native';
import { useRef } from 'react';
import type { Group } from 'three';
import { useGameStore } from '../game/gameStore';

const TRACK_WIDTH = 9;

// Standard 400m hurdle distances
const HURDLE_DISTANCES = Array.from({ length: 10 }).map((_, i) => 45 + i * 35);

export function Hurdles() {
  const groupRef = useRef<Group>(null);
  const raceType = useGameStore((s) => s.raceType);

  useFrame(() => {
    if (!groupRef.current) return;
    const { distance } = useGameStore.getState();
    // Scroll hurdles towards the camera based on player distance
    groupRef.current.position.z = distance;
  });

  if (raceType !== 'hurdles') return null;

  return (
    <group ref={groupRef}>
      {HURDLE_DISTANCES.map((hurdleZ, i) => (
        <group key={i} position={[0, 0, -hurdleZ]}>
          {/* Main crossbar (white/red striped ideally, but white for simplicity) */}
          <mesh position={[0, 0.8, 0]}>
            <boxGeometry args={[TRACK_WIDTH * 0.9, 0.08, 0.05]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.6} metalness={0.1} />
          </mesh>
          {/* Left leg */}
          <mesh position={[-TRACK_WIDTH * 0.4, 0.4, 0]}>
            <boxGeometry args={[0.06, 0.8, 0.06]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          {/* Right leg */}
          <mesh position={[TRACK_WIDTH * 0.4, 0.4, 0]}>
            <boxGeometry args={[0.06, 0.8, 0.06]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          {/* Left foot */}
          <mesh position={[-TRACK_WIDTH * 0.4, 0.02, 0.15]}>
            <boxGeometry args={[0.06, 0.04, 0.4]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          {/* Right foot */}
          <mesh position={[TRACK_WIDTH * 0.4, 0.02, 0.15]}>
            <boxGeometry args={[0.06, 0.04, 0.4]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
