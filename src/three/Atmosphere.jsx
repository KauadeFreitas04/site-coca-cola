import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { usePhase } from './phase.js';
import { getSharedTextures } from './textures.js';
import { PI, lerp, isMobile } from './math.js';

const DUST = 900;

/* Partículas de energia subindo em volta da garrafa e poeira fina iluminada no ar. */
export default function Atmosphere() {
  const phase = usePhase();
  const aniso = useThree(s => s.gl.capabilities.getMaxAnisotropy());
  const partRef = useRef(), dustRef = useRef();

  const m = useMemo(() => {
    const tex = getSharedTextures(aniso);
    const PART = isMobile() ? 900 : 1500;
    const pos = new Float32Array(PART * 3), col = new Float32Array(PART * 3), sp = new Float32Array(PART);
    for (let i = 0; i < PART; i++) {
      const a = Math.random() * PI * 2, r = 1.15 + Math.pow(Math.random(), 0.7) * 5;
      pos[i * 3] = Math.sin(a) * r; pos[i * 3 + 1] = lerp(-5, 5, Math.random()); pos[i * 3 + 2] = Math.cos(a) * r;
      sp[i] = 0.05 + Math.random() * 0.25;
      const red = Math.random() < 0.55;
      col[i * 3] = 1; col[i * 3 + 1] = red ? 0.22 : 0.9; col[i * 3 + 2] = red ? 0.18 : 0.86;
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    partGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const partMat = new THREE.PointsMaterial({ size: 0.045, map: tex.bubble, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });

    const dPos = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) { dPos[i * 3] = lerp(-7, 7, Math.random()); dPos[i * 3 + 1] = lerp(-5, 5, Math.random()); dPos[i * 3 + 2] = lerp(-6, 4, Math.random()); }
    const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
    const dustMat = new THREE.PointsMaterial({ size: 0.02, map: tex.soft, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffb0a0 });
    return { PART, pos, sp, partGeo, partMat, dustGeo, dustMat };
  }, [aniso]);

  useFrame(() => {
    const { energy, L, t, dt } = phase;
    for (let i = 0; i < m.PART; i++) {
      m.pos[i * 3 + 1] += m.sp[i] * dt * (0.4 + energy * 1.2);
      if (m.pos[i * 3 + 1] > 5) m.pos[i * 3 + 1] = -5;
    }
    m.partGeo.attributes.position.needsUpdate = true;
    partRef.current.rotation.y = t * 0.03;
    m.partMat.opacity = energy * 0.7 * L;
    m.dustMat.opacity = (0.12 + energy * 0.45) * L;
    dustRef.current.rotation.y = t * 0.01;
  });

  return (
    <>
      <points ref={partRef} geometry={m.partGeo} material={m.partMat} />
      <points ref={dustRef} geometry={m.dustGeo} material={m.dustMat} />
    </>
  );
}
