import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { usePhase } from './phase.js';
import { PI } from './math.js';

// limita pontos de brilho extremo (fireflies) para o bloom não virar blocos quadrados
const ClampShader = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv;
    void main(){ vec4 c = texture2D(tDiffuse, vUv); float m = max(max(c.r, c.g), c.b);
      gl_FragColor = vec4(c.rgb * min(1.0, 3.0 / max(m, 1e-4)), c.a); }`
};

/* Pós-produção (brilho de cinema). Assume a renderização (prioridade 1) e avisa quando o primeiro quadro saiu. */
export default function Effects({ onReady }) {
  const { gl, scene, camera, size } = useThree();
  const phase = usePhase();
  const first = useRef(true);

  const { composer, bloom } = useMemo(() => {
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    const composer = new EffectComposer(gl, rt);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new ShaderPass(ClampShader));
    const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.4, 0.45, 0.93);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    return { composer, bloom };
  }, [gl, scene, camera]);

  useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
  }, [composer, gl, size]);

  useEffect(() => () => composer.dispose(), [composer]);

  useFrame(() => {
    bloom.strength = 0.16 + phase.energy * 0.14 + phase.macro * 0.05 + Math.sin(phase.tb * PI) * 0.3;
    composer.render(phase.dt);
    if (first.current) { first.current = false; setTimeout(() => onReady?.(), 300); }
  }, 1);

  return null;
}
