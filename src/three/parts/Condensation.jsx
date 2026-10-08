import * as THREE from 'three';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePhase } from '../phase.js';
import { placeOnSurface } from '../bottleShape.js';
import { PI, lerp, isMobile } from '../math.js';

const SLIDE = 14;

/* Gotas de condensação paradas no vidro + algumas escorrendo devagar. Elas refratam o que está atrás. */
export default function Condensation() {
  const phase = usePhase();
  const dropsRef = useRef(), slidesRef = useRef();

  const { geo, mat, count, slideData, dummy } = useMemo(() => ({
    geo: new THREE.SphereGeometry(1, 16, 12),
    mat: new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0, roughness: 0, transmission: 1, ior: 1.33, thickness: 0.05,
      clearcoat: 1, envMapIntensity: 2.4, specularIntensity: 1
    }),
    count: isMobile() ? 380 : 620,
    slideData: Array.from({ length: SLIDE }, () => ({ th: Math.random() * PI * 2, off: Math.random() * 10, sp: 0.5 + Math.random() * 0.9, s: 0.011 + Math.random() * 0.009 })),
    dummy: new THREE.Object3D()
  }), []);

  useLayoutEffect(() => {
    const drops = dropsRef.current;
    for (let i = 0; i < count; i++) {
      const y = lerp(-1.95, 1.5, Math.random());
      const s = Math.pow(Math.random(), 3) * 0.02 + 0.0035;
      placeOnSurface(dummy, Math.random() * PI * 2, y, s, 1 + Math.random() * 0.4, 0.3);
      drops.setMatrixAt(i, dummy.matrix);
    }
    drops.instanceMatrix.needsUpdate = true;
  }, [count, dummy]);

  useFrame(() => {
    const { L, macro, t } = phase;
    mat.envMapIntensity = 2.4 * L + macro * 1.2;
    const slides = slidesRef.current;
    for (let i = 0; i < SLIDE; i++) {
      const d = slideData[i];
      const y = 1.35 - ((t * 0.06 * d.sp + d.off) % 3.25);
      placeOnSurface(dummy, d.th, y, d.s, 1.9, 0.45);
      slides.setMatrixAt(i, dummy.matrix);
    }
    slides.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={dropsRef} args={[geo, mat, count]} />
      <instancedMesh ref={slidesRef} args={[geo, mat, SLIDE]} frustumCulled={false} />
    </>
  );
}
