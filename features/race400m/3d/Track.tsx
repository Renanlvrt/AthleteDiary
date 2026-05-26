// ============================================================
// features/race400m/3d/Track.tsx
// Scrolling track illusion: two plane sections alternate to create
// an infinite runway. The character stays still; the track moves.
// ============================================================

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
import type { Mesh } from 'three';
import { useGameStore } from '../game/gameStore';
import { TUNING, RACE_COLOURS } from '../game/constants';

const SECTION_LENGTH = TUNING.TRACK_SECTION_LENGTH; // 30 metres
const TRACK_WIDTH    = 9;   // 3 lanes × 3m each
const LANE_COUNT     = 3;

function LaneLines() {
  return (
    <>
      {/* Left line */}
      <mesh position={[-TRACK_WIDTH / 2 + 0.05, 0.01, 0]}>
        <boxGeometry args={[0.1, 0.01, SECTION_LENGTH * 2]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      {/* Centre line */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.05, 0.01, SECTION_LENGTH * 2]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.4} />
      </mesh>
      {/* Right line */}
      <mesh position={[TRACK_WIDTH / 2 - 0.05, 0.01, 0]}>
        <boxGeometry args={[0.1, 0.01, SECTION_LENGTH * 2]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      {/* Lane dividers */}
      {Array.from({ length: LANE_COUNT - 1 }).map((_, i) => (
        <mesh
          key={i}
          position={[-TRACK_WIDTH / 2 + TRACK_WIDTH / LANE_COUNT * (i + 1), 0.01, 0]}
        >
          <boxGeometry args={[0.04, 0.01, SECTION_LENGTH * 2]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.25} />
        </mesh>
      ))}
    </>
  );
}

function StadiumBackdrop() {
  return (
    <>
      {/* Simple stadium cylinder backdrop */}
      <mesh position={[0, 8, -40]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[60, 60, 16, 32, 1, true]} />
        <meshBasicMaterial color="#888880" side={1} /> {/* side=1 = BackSide */}
      </mesh>
      {/* Ground plane extending to horizon */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -20]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial color="#4A7A3A" />
      </mesh>
    </>
  );
}

export function Track() {
  const sectionA = useRef<Mesh>(null);
  const sectionB = useRef<Mesh>(null);

  useFrame(() => {
    const { speed, phase } = useGameStore.getState();
    if (phase !== 'racing' && phase !== 'bonk' && phase !== 'minigame') return;

    const scrollSpeed = (speed / 100) * TUNING.METRES_PER_SEC_AT_MAX;
    const dt = 1 / 60; // approximate; real delta handled in gameStore

    if (!sectionA.current || !sectionB.current) return;

    sectionA.current.position.z += scrollSpeed * dt;
    sectionB.current.position.z += scrollSpeed * dt;

    // When a section scrolls past the camera, teleport it ahead
    if (sectionA.current.position.z > SECTION_LENGTH) {
      sectionA.current.position.z -= SECTION_LENGTH * 2;
    }
    if (sectionB.current.position.z > SECTION_LENGTH) {
      sectionB.current.position.z -= SECTION_LENGTH * 2;
    }
  });

  return (
    <group>
      <StadiumBackdrop />

      {/* Section A — starts at z = 0 */}
      <mesh ref={sectionA} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[TRACK_WIDTH, SECTION_LENGTH]} />
        <meshLambertMaterial color={RACE_COLOURS.red} />
      </mesh>

      {/* Section B — starts one section ahead */}
      <mesh ref={sectionB} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -SECTION_LENGTH]}>
        <planeGeometry args={[TRACK_WIDTH, SECTION_LENGTH]} />
        <meshLambertMaterial color="#D11A20" />
      </mesh>

      <LaneLines />
    </group>
  );
}
