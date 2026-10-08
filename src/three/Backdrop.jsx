import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePhase } from './phase.js';

/* Fundo: brilho vermelho atrás da garrafa + feixe de luz. Um plano preso à frente da câmera, a 80 unidades. */
const DIST = 80;
const fragmentShader = `
  varying vec2 vUv;
  uniform float uGlow, uRed, uBeam, uTime, uAspect; uniform vec2 uCenter;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main(){
    vec2 p = (vUv - uCenter) * vec2(uAspect, 1.0);
    float d = length(p);
    vec3 col = vec3(0.004, 0.0006, 0.0006);
    col += vec3(0.10, 0.004, 0.006) * smoothstep(1.5, 0.0, d) * uGlow * 1.4;
    col += vec3(0.85, 0.02, 0.03) * exp(-d * d * 6.0) * uGlow * (0.25 + 0.75 * uRed);
    float beam = exp(-abs(p.x) * 6.0) * smoothstep(-0.35, 0.8, p.y) * uBeam;
    col += vec3(1.0, 0.22, 0.16) * beam * 0.22 * uGlow;
    col *= 1.0 - 0.45 * smoothstep(0.5, 1.4, length((vUv - 0.5) * vec2(uAspect, 1.0)));
    col += (hash(vUv * 900.0 + uTime) - 0.5) * 0.004;
    gl_FragColor = vec4(max(col, 0.0), 1.0);
  }`;
const vertexShader = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const fwd = new THREE.Vector3(), proj = new THREE.Vector3();

export default function Backdrop() {
  const ref = useRef();
  const phase = usePhase();
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uGlow: { value: 0 }, uRed: { value: 0 }, uBeam: { value: 0 }, uTime: { value: 0 },
      uCenter: { value: new THREE.Vector2(0.5, 0.5) }, uAspect: { value: 1 }
    },
    vertexShader, fragmentShader, depthWrite: false
  }), []);
  const uniforms = material.uniforms;

  useFrame(({ camera }) => {
    const m = ref.current;
    camera.getWorldDirection(fwd);
    m.position.copy(camera.position).addScaledVector(fwd, DIST);
    m.quaternion.copy(camera.quaternion);
    const h = 2 * DIST * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.02;
    m.scale.set(h * camera.aspect, h, 1);

    uniforms.uAspect.value = camera.aspect;
    uniforms.uGlow.value = phase.L; uniforms.uRed.value = phase.red;
    uniforms.uBeam.value = 0.4 + 0.6 * phase.hero; uniforms.uTime.value = phase.t;
    proj.set(0, 0.1, 0).project(camera);
    uniforms.uCenter.value.set(proj.x * 0.5 + 0.5, proj.y * 0.5 + 0.5);
  });

  return (
    <mesh ref={ref} material={material} renderOrder={-10} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}
