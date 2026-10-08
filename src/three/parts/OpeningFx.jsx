import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { usePhase } from '../phase.js';
import { MOUTH_Y } from '../bottleShape.js';
import { getSharedTextures } from '../textures.js';
import { PI, sm } from '../math.js';

const BURST = 480, VAPORS = 9;

/* Abertura: estouro de gás saindo do gargalo e vapor gelado depois que a tampa sai. */
export default function OpeningFx() {
  const phase = usePhase();
  const aniso = useThree(s => s.gl.capabilities.getMaxAnisotropy());
  const vaporRefs = useRef([]);

  const m = useMemo(() => {
    const tex = getSharedTextures(aniso);
    const pos = new Float32Array(BURST * 3), dirs = [];
    for (let i = 0; i < BURST; i++) {
      const v = new THREE.Vector3((Math.random() - .5) * 0.9, 0.8 + Math.random() * 1.5, (Math.random() - .5) * 0.9);
      dirs.push(v.normalize().multiplyScalar(0.5 + Math.random() * 2.3));
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size: 0.03, map: tex.soft, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffeae4 });
    const vapors = Array.from({ length: VAPORS }, (_, i) => ({
      dx: (Math.random() - .5) * 0.7, dy: 0.6 + Math.random() * 1.2, ph: Math.random() * PI * 2, d: i / VAPORS,
      mat: new THREE.SpriteMaterial({ map: tex.smoke, transparent: true, opacity: 0, depthWrite: false, color: 0xffe9e6 })
    }));
    return { pos, dirs, geo, mat, vapors };
  }, [aniso]);

  useFrame(() => {
    const { tb, t, p, L } = phase;
    for (let i = 0; i < BURST; i++) {
      const v = m.dirs[i], e = tb * (0.6 + (i % 7) * 0.08);
      m.pos[i * 3] = v.x * e; m.pos[i * 3 + 1] = MOUTH_Y + v.y * e - 0.5 * e * e; m.pos[i * 3 + 2] = v.z * e;
    }
    m.geo.attributes.position.needsUpdate = true;
    m.mat.opacity = Math.sin(tb * PI) * 0.85;

    const vap = sm(0.76, 0.84, p);
    m.vapors.forEach((u, i) => {
      const s = vaporRefs.current[i]; if (!s) return;
      const cyc = (t * 0.12 + u.d) % 1;
      s.position.set(u.dx * cyc + Math.sin(t + u.ph) * 0.05, MOUTH_Y + u.dy * cyc, Math.cos(t * 0.7 + u.ph) * 0.1);
      s.scale.setScalar(0.25 + cyc * 0.9);
      u.mat.opacity = vap * Math.sin(cyc * PI) * 0.22 * L;
    });
  });

  return (
    <>
      <points geometry={m.geo} material={m.mat} renderOrder={8} frustumCulled={false} />
      {m.vapors.map((u, i) => <sprite key={i} ref={el => (vaporRefs.current[i] = el)} material={u.mat} />)}
    </>
  );
}
