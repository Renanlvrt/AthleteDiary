// ============================================================
// features/race400m/3d/CameraRig.tsx
// Dynamic camera — follows the player, adds FOV push on speed,
// shakes on bonk, and rotates during curve sections.
// ============================================================

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber/native';
import { useGameStore } from '../game/gameStore';

const BASE_FOV        = 55;
const MAX_FOV         = 68;
const SHAKE_INTENSITY = 0.04;
const CURVE_RANGES    = [[70, 110], [270, 330]] as const; // metres

function isCurve(distance: number): boolean {
  return CURVE_RANGES.some(([start, end]) => distance >= start && distance <= end);
}

export function CameraRig() {
  const { camera } = useThree();
  const shakeRef    = useRef(0);
  const curveAngle  = useRef(0);

  useFrame((_, delta) => {
    const { speed, phase, distance, raceType } = useGameStore.getState();

    // ── FOV push on acceleration ────────────────────────────
    const targetFov = BASE_FOV + (speed / 100) * (MAX_FOV - BASE_FOV);
    if ('fov' in camera) {
      (camera as any).fov += (targetFov - (camera as any).fov) * 0.08;
      (camera as any).updateProjectionMatrix();
    }

    // ── Bonk shake ──────────────────────────────────────────
    if (phase === 'bonk') {
      shakeRef.current += delta * 18;
      const sx = Math.sin(shakeRef.current * 2.3) * SHAKE_INTENSITY;
      const sy = Math.cos(shakeRef.current * 1.7) * SHAKE_INTENSITY * 0.5;
      camera.position.x = (raceType === 'long_jump' ? 12 : 0) + sx;
      camera.position.y = 1.6 + sy;
    } else {
      const targetX = raceType === 'long_jump' ? 12 : 0;
      camera.position.x += (targetX - camera.position.x) * 0.1;
      camera.position.y += (1.6 - camera.position.y) * 0.1;
      shakeRef.current = 0;
    }

    // ── Curve lean ──────────────────────────────────────────
    const onCurve = isCurve(distance);
    const targetCurveAngle = onCurve ? -0.25 : 0; // radians — lean into bend
    curveAngle.current += (targetCurveAngle - curveAngle.current) * delta * 2;
    camera.rotation.z = curveAngle.current;

    // ── Ensure camera always points at runner ────────────────
    if (raceType === 'long_jump') {
      camera.position.z += (0 - camera.position.z) * 0.1; // Move to z=0 for perfect side view
      camera.lookAt(0, 1.0, 0); // Look at player
    } else {
      camera.position.z = 4;
      camera.lookAt(0, 1.0, 0);
    }
  });

  return null;
}
