// ============================================================
// features/race400m/3d/Scene.tsx
// R3F Canvas — the 3D world. Sits behind the HUD overlay.
// GameLoop is a renderless component that drives tickFrame each frame
// and checks mini-game triggers.
// ============================================================

import { Canvas, useFrame } from '@react-three/fiber/native';
import { useGameStore } from '../game/gameStore';
import { checkMiniGameTriggers } from '../game/miniGameTriggers';
import { Track }      from './Track';
import { Athlete }    from './Athlete';
import { Opponents }  from './Opponents';
import { CameraRig }  from './CameraRig';
import { Hurdles }    from './Hurdles';

// ─── Pure logic component — no mesh ───────────────────────────
function GameLoop() {
  const tickFrame       = useGameStore((s) => s.tickFrame);
  const triggerMiniGame = useGameStore((s) => s.triggerMiniGame);

  useFrame((_, delta) => {
    // Clamp delta to max 100ms to prevent huge jumps on tab-switch/lag
    const clampedDelta = Math.min(delta, 0.1);
    tickFrame(clampedDelta);

    const { phase, distance, completedMiniGames } = useGameStore.getState();
    if (phase === 'racing') {
      const triggered = checkMiniGameTriggers(distance, completedMiniGames);
      if (triggered) {
        triggerMiniGame(triggered);
      }
    }
  });

  return null;
}

// ─── Main Scene ───────────────────────────────────────────────
interface SceneProps {
  /** Slow-motion factor during mini-game (0–1). 1 = full speed. */
  speedScale?: number;
}

export function Scene({ speedScale = 1 }: SceneProps) {
  return (
    <Canvas
      style={{ flex: 1 }}
      gl={{ antialias: true, alpha: false }}
      camera={{ position: [0, 1.6, 4], fov: 55 }}
      shadows={false} // disabled for performance on mobile
      onCreated={({ gl }) => {
        gl.setClearColor('#F0EAD6'); // warm haze background colour
      }}
    >
      <GameLoop />

      {/* Atmosphere */}
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 10, 5]} intensity={1.1} />

      {/* World */}
      <Track />
      <Hurdles />
      <Opponents />
      <Athlete />
      <CameraRig />
    </Canvas>
  );
}
