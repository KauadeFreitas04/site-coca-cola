import * as THREE from 'three';
import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { usePhase } from '../phase.js';
import { liquidGeometry, liqRadius, LIQ_TOP, LIQ_BOT } from '../bottleShape.js';
import { getSharedTextures } from '../textures.js';
import { PI, lerp } from '../math.js';

const BUB = 420, CLING = 150;

/* A cola: quase preta no centro, marrom-avermelhada onde a luz atravessa pouco líquido (bordas e fundo),
   com bolhas subindo e algumas grudadas na parede de dentro. */
export default function Liquid() {
  const phase = usePhase();
  const aniso = useThree(s => s.gl.capabilities.getMaxAnisotropy());

  const m = useMemo(() => {
    const tex = getSharedTextures(aniso);

    const liquid = new THREE.MeshPhysicalMaterial({
      color: 0x120402, roughness: 0.18, metalness: 0,
      sheen: 1, sheenColor: new THREE.Color(0xa02a08), sheenRoughness: 0.45,
      emissive: new THREE.Color(0x8a2a07), emissiveIntensity: 0.3,
      envMapIntensity: 1.1, depthWrite: false
    });
    liquid.onBeforeCompile = s => {
      s.uniforms.uBot = { value: LIQ_BOT }; s.uniforms.uTop = { value: LIQ_TOP };
      s.vertexShader = 'varying float vLy;\n' + s.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvLy = position.y;');
      s.fragmentShader = 'varying float vLy; uniform float uBot, uTop;\n' + s.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float facing = clamp(abs(dot(normal, normalize(vViewPosition))), 0.0, 1.0);
        float thin = pow(1.0 - facing, 2.2);
        float base = exp(-(vLy - uBot) * 7.0);
        float shoulder = smoothstep(uTop - 0.9, uTop, vLy);
        totalEmissiveRadiance *= 0.3 + thin * 1.6 + base * 1.3 + shoulder * 0.5;`);
    };

    // bolhas subindo: ângulo e raio normalizado, convertidos pelo raio interno em cada altura
    const bub = { pos: new Float32Array(BUB * 3), sp: new Float32Array(BUB), a: new Float32Array(BUB), rn: new Float32Array(BUB) };
    const place = i => {
      const r = bub.rn[i] * liqRadius(bub.pos[i * 3 + 1]) * 0.9;
      bub.pos[i * 3] = Math.sin(bub.a[i]) * r; bub.pos[i * 3 + 2] = Math.cos(bub.a[i]) * r;
    };
    const seed = (i, anyY) => {
      bub.a[i] = Math.random() * PI * 2; bub.rn[i] = Math.sqrt(Math.random());
      bub.pos[i * 3 + 1] = anyY ? lerp(LIQ_BOT + 0.05, LIQ_TOP - 0.1, Math.random()) : LIQ_BOT + 0.05;
      bub.sp[i] = 0.15 + Math.random() * 0.5;
      place(i);
    };
    for (let i = 0; i < BUB; i++) seed(i, true);
    const bubGeo = new THREE.BufferGeometry(); bubGeo.setAttribute('position', new THREE.BufferAttribute(bub.pos, 3));
    const bubMat = new THREE.PointsMaterial({ size: 0.011, map: tex.soft, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffcfbf });

    const clPos = new Float32Array(CLING * 3);
    for (let i = 0; i < CLING; i++) {
      const y = lerp(LIQ_BOT + 0.05, LIQ_TOP - 0.15, Math.random()), a = Math.random() * PI * 2, r = liqRadius(y) - 0.004;
      clPos[i * 3] = Math.sin(a) * r; clPos[i * 3 + 1] = y; clPos[i * 3 + 2] = Math.cos(a) * r;
    }
    const clGeo = new THREE.BufferGeometry(); clGeo.setAttribute('position', new THREE.BufferAttribute(clPos, 3));
    const clMat = new THREE.PointsMaterial({ size: 0.009, map: tex.bubble, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffd9cc });

    return { liquid, bub, place, seed, bubGeo, bubMat, clGeo, clMat };
  }, [aniso]);

  useFrame(() => {
    const { L, macro, red, energy, t, dt } = phase;
    m.liquid.envMapIntensity = 0.35 * L;
    m.liquid.emissiveIntensity = (0.15 + red * 0.35 + macro * 0.4) * L;

    const speed = 0.6 + energy * 1.4 + macro * 0.3, b = m.bub;
    for (let i = 0; i < BUB; i++) {
      b.pos[i * 3 + 1] += b.sp[i] * speed * dt;
      b.a[i] += Math.sin(t * 3 + i) * 0.001;
      if (b.pos[i * 3 + 1] > LIQ_TOP - 0.03) m.seed(i, false); else m.place(i);
    }
    m.bubGeo.attributes.position.needsUpdate = true;
    m.bubMat.opacity = 0.32 * L; m.clMat.opacity = 0.22 * L;
    m.bubMat.size = 0.011 + macro * 0.004;
  });

  return (
    <>
      <mesh geometry={liquidGeometry} material={m.liquid} renderOrder={-1} />
      {/* menisco: linha escura e nítida onde a cola encontra o vidro */}
      <mesh rotation-x={PI / 2} position-y={LIQ_TOP - 0.004}>
        <torusGeometry args={[liqRadius(LIQ_TOP) + 0.002, 0.004, 8, 200]} />
        <meshStandardMaterial color={0x0a0201} roughness={0.25} metalness={0} />
      </mesh>
      <points geometry={m.bubGeo} material={m.bubMat} renderOrder={3} />
      <points geometry={m.clGeo} material={m.clMat} renderOrder={3} />
    </>
  );
}
