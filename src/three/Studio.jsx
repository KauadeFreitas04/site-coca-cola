import * as THREE from 'three';
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { createSoftEdgeTexture } from './textures.js';

/* Estúdio invisível que só existe nos reflexos: softboxes brancas + painéis vermelhos. */
const boxes = [
  { size: [9, 2.2], rgb: [6, 6, 6], pos: [0, 8, 1.5] },          // softbox de cima
  { size: [0.8, 14], rgb: [9, 9, 9], pos: [6, 0, 3.5] },         // faixa branca à direita
  { size: [0.45, 14], rgb: [5, 5, 5], pos: [-6, 0, 2.5] },       // faixa fina à esquerda
  { size: [10, 10], rgb: [4, 0.12, 0.08], pos: [-8, 0, -6] },    // painel vermelho
  { size: [10, 10], rgb: [3.4, 0.08, 0.05], pos: [8, -1, -6] },  // painel vermelho
  { size: [16, 4], rgb: [1.6, 0.04, 0.03], pos: [0, -7, -2] }    // rebatedor vermelho embaixo
];

export default function Studio() {
  const gl = useThree(s => s.gl);
  const scene = useThree(s => s.scene);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const studio = new THREE.Scene();
    studio.background = new THREE.Color(0x010000);
    const edge = createSoftEdgeTexture();
    for (const b of boxes) {
      const m = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: edge });
      m.color.setRGB(...b.rgb);
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(...b.size), m);
      plane.position.set(...b.pos); plane.lookAt(0, 0, 0);
      studio.add(plane);
    }
    const env = pmrem.fromScene(studio, 0.015).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose(); pmrem.dispose(); edge.dispose();
      studio.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });
    };
  }, [gl, scene]);

  return null;
}
