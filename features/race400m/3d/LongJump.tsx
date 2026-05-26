// ============================================================
// features/race400m/3d/LongJump.tsx
// Renders the foul line and sandpit for the Long Jump event.
// ============================================================

import { useFrame } from '@react-three/fiber/native';
import { useRef } from 'react';
import type { Group } from 'three';
import { useGameStore, LONG_JUMP_BOARD } from '../game/gameStore';

const TRACK_WIDTH = 9;

export function LongJump() {
  const groupRef = useRef<Group>(null);
  const raceType = useGameStore((s) => s.raceType);

  useFrame(() => {
    if (!groupRef.current) return;
    const { distance } = useGameStore.getState();
    // Scroll towards the camera based on player distance
    groupRef.current.position.z = distance;
  });

  if (raceType !== 'long_jump') return null;

  return (
    <group ref={groupRef} position={[0, 0, -LONG_JUMP_BOARD]}>
      {/* ── Take-off Board (Foul Line) ── */}
      {/* Placed exactly at LONG_JUMP_BOARD */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <planeGeometry args={[TRACK_WIDTH, 0.5]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Red Foul line indicator just past the board */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, -0.3]}>
        <planeGeometry args={[TRACK_WIDTH, 0.1]} />
        <meshBasicMaterial color="#EF4444" />
      </mesh>

      {/* ── Sandpit ── */}
      {/* Starts 1 meter after the board, extends for 10 meters */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -6]}>
        <planeGeometry args={[TRACK_WIDTH * 0.8, 10]} />
        <meshStandardMaterial color="#E1C699" roughness={0.9} metalness={0} />
      </mesh>
    </group>
  );
}
