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
    const { distance, opponentDistances, difficulty, phase } = useGameStore.getState();
    if (!groupRef.current) return;

    const opponentDist = opponentDistances[index] ?? 0;
    const profiles = OPPONENT_PROFILES[difficulty];
    const profile = profiles[index];
    if (!profile) return;

    // Z offset: negative = ahead of player, positive = behind
    const relativeZ = (distance - opponentDist) * 0.3; // scale to 3D units
    groupRef.current.position.z = Math.max(-30, Math.min(30, relativeZ));

    // Bob animation
    if (phase === 'racing' || phase === 'minigame') {
      const speed = profile.speedMultiplier * 6;
      bobOffset.current += delta * speed;
      groupRef.current.position.y = Math.sin(bobOffset.current) * 0.05;
      groupRef.current.rotation.x = -0.1;
    }
  });

  return (
    <group ref={groupRef} position={[laneX, 0, 0]}>
      {/* Body box */}
      <mesh position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.24, 1.0, 8, 16]} />
        <meshLambertMaterial color={colour} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.65, 0]}>
        <sphereGeometry args={[0.20, 10, 10]} />
        <meshLambertMaterial color="#F5C5A3" />
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
