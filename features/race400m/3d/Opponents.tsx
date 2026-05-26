// ============================================================
// features/race400m/3d/Opponents.tsx
// Three scripted opponents in adjacent lanes.
// Box placeholders — same swap path as Athlete.tsx for real models.
// ============================================================

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
import type { Group } from 'three';
import { useGameStore } from '../game/gameStore';
import { OPPONENT_PROFILES } from '../game/constants';

const LANE_OFFSETS = [-3, 3, -6]; // x positions: left lane, right lane, far left

interface OpponentMeshProps {
  colour: string;
  laneX: number;
  index: number;
}

function OpponentMesh({ colour, laneX, index }: OpponentMeshProps) {
  const groupRef = useRef<Group>(null);
  const bobOffset = useRef(index * 1.3); // stagger phases so they don't all bob in sync

  useFrame((_, delta) => {
    const { distance, opponentDistances, difficulty, phase, opponentY } = useGameStore.getState();
    if (!groupRef.current) return;

    const opponentDist = opponentDistances[index] ?? 0;
    const profiles = OPPONENT_PROFILES[difficulty];
    const profile = profiles[index];
    if (!profile) return;

    const relativeZ = (distance - opponentDist) * 0.3;
    groupRef.current.position.z = Math.max(-30, Math.min(30, relativeZ));

    if (phase === 'racing' || phase === 'minigame') {
      const speed = profile.speedMultiplier * 6;
      bobOffset.current += delta * speed;
      groupRef.current.position.y = (Math.sin(bobOffset.current) * 0.05) + (opponentY?.[index] ?? 0);
      groupRef.current.rotation.x = -0.1;
    }
  });

  return (
    <group ref={groupRef} position={[laneX, 0, 0]}>
      {/* Fake Drop Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} depthWrite={false} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.24, 1.0, 16, 32]} />
        <meshStandardMaterial color={colour} roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.65, 0]}>
        <sphereGeometry args={[0.20, 16, 16]} />
        <meshStandardMaterial color="#F5C5A3" roughness={0.5} />
      </mesh>
    </group>
  );
}

export function Opponents() {
  const { difficulty } = useGameStore();
  const profiles = OPPONENT_PROFILES[difficulty];

  return (
    <>
      {profiles.map((profile, i) => (
        <OpponentMesh
          key={profile.name}
          colour={profile.colour}
          laneX={LANE_OFFSETS[i] ?? i * 3}
          index={i}
        />
      ))}
    </>
  );
}
