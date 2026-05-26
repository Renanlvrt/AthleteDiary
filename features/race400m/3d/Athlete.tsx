// ============================================================
// features/race400m/3d/Athlete.tsx
// Player character — CapsuleGeometry placeholder.
// ============================================================

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
import { useGameStore } from '../game/gameStore';

function AthleteGeometry() {
  return (
    <>
      {/* Fake Drop Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[0.7, 0.7]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} depthWrite={false} />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.28, 1.1, 16, 32]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.75, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#F5C5A3" roughness={0.5} />
      </mesh>
    </>
  );
}

export function Athlete() {
  const groupRef  = useRef<any>(null);
  const bobOffset = useRef(0);

  useFrame((_, delta) => {
    const { speed, phase, athleteY, lastHurdleCrossed, hurdlesHit } = useGameStore.getState();
    if (!groupRef.current) return;

    // Stumble lean logic (if we hit a hurdle recently)
    // We check if hurdlesHit is > 0 and phase is racing to add a chaotic wobble
    const isStumbling = hurdlesHit > 0 && phase !== 'bonk' && speed < 50;

    const bobSpeed =
      phase === 'bonk'   ? 3 :
      phase === 'finish' ? 0 :
      isStumbling        ? 12 :
      2 + (speed / 100) * 6;

    const bobAmp =
      phase === 'bonk' ? 0.03 :
      isStumbling      ? 0.1 :
      0.04 + (speed / 100) * 0.06;

    bobOffset.current += delta * bobSpeed;
    
    // Y position = bobbing + jump height
    groupRef.current.position.y = (Math.sin(bobOffset.current) * bobAmp) + athleteY;

    // Lean
    const lean = (speed / 100) * 0.18;
    const stumbleZ = isStumbling ? Math.sin(bobOffset.current * 0.5) * 0.3 : 0;
    
    groupRef.current.rotation.x = phase === 'bonk' ? 0.15 : -lean + stumbleZ;
    groupRef.current.rotation.z = isStumbling ? Math.cos(bobOffset.current * 0.5) * 0.2 : 0;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <AthleteGeometry />
    </group>
  );
}
