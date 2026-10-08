import * as THREE from 'three';
import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { PhaseContext, createPhase } from './phase.js';
import { isMobile } from './math.js';
import CameraRig from './CameraRig.jsx';
import Studio from './Studio.jsx';
import Backdrop from './Backdrop.jsx';
import Lights from './Lights.jsx';
import Bottle from './Bottle.jsx';
import Atmosphere from './Atmosphere.jsx';
import Effects from './Effects.jsx';

/* Palco 3D fixo em tela cheia. A ordem dos quadros: CameraRig (-1) → cena (0) → Effects renderiza (1). */
export default function Experience({ onReady }) {
  const phase = useMemo(createPhase, []);
  const maxDpr = isMobile() ? 1.5 : 1.75;

  return (
    <Canvas
      className="stage"
      dpr={[1, maxDpr]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      camera={{ fov: 35, near: 0.05, far: 200, position: [0, 0.4, 12.5] }}
      onCreated={(s) => { s.gl.toneMapping = THREE.ACESFilmicToneMapping; }}
    >
      <PhaseContext.Provider value={phase}>
        <CameraRig />
        <Studio />
        <Backdrop />
        <Lights />
        <Bottle />
        <Atmosphere />
        <Effects onReady={onReady} />
      </PhaseContext.Provider>
    </Canvas>
  );
}
