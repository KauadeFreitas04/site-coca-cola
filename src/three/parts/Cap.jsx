import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePhase } from '../phase.js';
import { createCapGeometry, CAP_H, CAP_TOP, CAP_HOME, PI } from '../bottleShape.js';

/* Tampa coroa de metal pintada de vermelho, com interior metálico. Sai voando na cena da abertura. */
export default function Cap() {
  const phase = usePhase();
  const ref = useRef();

  const { geo, paint, liner } = useMemo(() => ({
    geo: createCapGeometry(),
    paint: new THREE.MeshPhysicalMaterial({ color: 0xd8121e, metalness: 0.25, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.8 }),
    liner: new THREE.MeshStandardMaterial({ color: 0x9a9a9a, metalness: 0.9, roughness: 0.35, side: THREE.BackSide })
  }), []);

  useFrame(() => {
    const { open, L } = phase;
    paint.envMapIntensity = 1.8 * L;
    ref.current.position.set(CAP_HOME.x + open * 0.9, CAP_HOME.y + open * 3.2 + Math.sin(open * PI) * 0.3, CAP_HOME.z + open * 0.6);
    ref.current.rotation.set(open * 2.6, open * 1.4, open * 1.9);
  });

  return (
    <group ref={ref} position={CAP_HOME}>
      <mesh geometry={geo} material={paint} />
      <mesh geometry={geo} material={liner} />
      <mesh material={paint} rotation-x={-PI / 2} position-y={CAP_H / 2}>
        <circleGeometry args={[CAP_TOP, 168]} />
      </mesh>
      <mesh material={liner} rotation-x={-PI / 2} position-y={CAP_H / 2 - 0.004}>
        <circleGeometry args={[CAP_TOP, 168]} />
      </mesh>
    </group>
  );
}
