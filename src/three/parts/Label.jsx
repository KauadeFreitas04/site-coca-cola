import * as THREE from 'three';
import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { usePhase } from '../phase.js';
import { LABEL_TOP, LABEL_BOT, LABEL_R, PI } from '../bottleShape.js';
import { createLabelTexture, drawLabel, loadLabelArt } from '../textures.js';

/* Rótulo de papel vermelho envolvendo a garrafa, com o logo na frente e atrás. */
export default function Label() {
  const phase = usePhase();
  const aniso = useThree(s => s.gl.capabilities.getMaxAnisotropy());

  const { tex, mat } = useMemo(() => {
    const tex = createLabelTexture(aniso);
    drawLabel(tex, null);
    const mat = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.4, clearcoat: 0.4, clearcoatRoughness: 0.18, envMapIntensity: 0.9 });
    return { tex, mat };
  }, [aniso]);

  // redesenha quando a arte do rótulo e as fontes terminam de carregar
  useEffect(() => {
    let alive = true;
    Promise.all([loadLabelArt(), document.fonts?.ready]).then(([art]) => { if (alive) drawLabel(tex, art); });
    return () => { alive = false; };
  }, [tex]);

  useFrame(() => { mat.envMapIntensity = 0.9 * phase.L; });

  return (
    <mesh material={mat} position-y={(LABEL_TOP + LABEL_BOT) / 2} rotation-y={PI}>
      <cylinderGeometry args={[LABEL_R, LABEL_R, LABEL_TOP - LABEL_BOT, 200, 1, true]} />
    </mesh>
  );
}
