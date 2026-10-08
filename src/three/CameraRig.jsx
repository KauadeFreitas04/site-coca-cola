import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { scrollState } from '../scrollStore.js';
import { usePhase } from './phase.js';
import { PI, clamp, sm, lerp } from './math.js';

/* Roteiro de câmera (6 cenas): posição, ponto de foco e giro da garrafa em cada trecho do scroll. */
const keys = [
  { p: 0.00, pos: [0, 0.4, 12.5], look: [0, 0, 0], rot: PI * 1.00 },
  { p: 0.13, pos: [0, 0.25, 8.6], look: [0, 0, 0], rot: PI * 1.15 },
  { p: 0.29, pos: [2.7, 0.8, 5.8], look: [0, 0.1, 0], rot: PI * 1.80 },
  { p: 0.45, pos: [0.8, 0.45, 1.85], look: [0, 0.25, 0], rot: PI * 2.40 },
  { p: 0.58, pos: [-3.3, 0.9, 6.4], look: [0, 0.15, 0], rot: PI * 3.00 },
  { p: 0.70, pos: [-1.4, 1.1, 7.6], look: [0, 0.6, 0], rot: PI * 3.35 },
  { p: 0.83, pos: [0.2, 1.3, 7.4], look: [0, 0.9, 0], rot: PI * 3.70 },
  { p: 1.00, pos: [0, 0.2, 9.6], look: [0, 0.1, 0], rot: PI * 4.00 }
];
const posCurve = new THREE.CatmullRomCurve3(keys.map(k => new THREE.Vector3(...k.pos)), false, 'centripetal');
const lookCurve = new THREE.CatmullRomCurve3(keys.map(k => new THREE.Vector3(...k.look)), false, 'centripetal');
function keyU(p) {
  for (let i = 0; i < keys.length - 1; i++) {
    if (p <= keys[i + 1].p) {
      const t = (p - keys[i].p) / (keys[i + 1].p - keys[i].p);
      return { u: (i + t) / (keys.length - 1), rot: lerp(keys[i].rot, keys[i + 1].rot, sm(0, 1, t) * 0.5 + t * 0.5) };
    }
  }
  return { u: 1, rot: keys[keys.length - 1].rot };
}

const vPos = new THREE.Vector3(), vLook = new THREE.Vector3(), dir = new THREE.Vector3(), side = new THREE.Vector3();

// Roda antes de todos os outros (prioridade -1): suaviza o scroll, calcula as intensidades e move a câmera.
export default function CameraRig() {
  const phase = usePhase();

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    scrollState.cur += (scrollState.target - scrollState.cur) * (1 - Math.pow(0.0015, dt));
    const p = scrollState.cur;
    const k = keyU(p);

    phase.t = state.clock.elapsedTime; phase.dt = dt; phase.p = p; phase.rot = k.rot;
    phase.L = 0.05 + 0.95 * sm(0.0, 0.15, p);
    phase.macro = sm(0.36, 0.45, p) * (1 - sm(0.5, 0.58, p));
    phase.energy = sm(0.5, 0.64, p);
    phase.open = sm(0.74, 0.8, p);
    phase.hero = sm(0.86, 1, p);
    phase.red = 0.35 + 0.65 * phase.energy;
    phase.tb = clamp((p - 0.745) / 0.11, 0, 1);

    const { camera, gl } = state;
    posCurve.getPoint(k.u, vPos); lookCurve.getPoint(k.u, vLook);
    const wide = camera.aspect > 1.15, tall = camera.aspect < 0.9;
    const dist = vPos.distanceTo(vLook);
    dir.subVectors(vLook, vPos).normalize();
    side.crossVectors(dir, camera.up).normalize();
    // desktop: garrafa à direita do texto; celular: garrafa mais acima
    if (wide) { const s = -0.2 * dist * (1 - sm(0.9, 1, p) * 0.3); vPos.addScaledVector(side, s); vLook.addScaledVector(side, s); }
    if (tall) { const s = -0.13 * dist; vPos.y += s; vLook.y += s; }
    camera.position.copy(vPos); camera.lookAt(vLook);

    gl.toneMappingExposure = 0.85 + 0.25 * phase.L + phase.macro * 0.12;
  }, -1);

  return null;
}
