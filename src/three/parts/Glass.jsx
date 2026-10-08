import * as THREE from 'three';
import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { usePhase } from '../phase.js';
import { glassGeometry } from '../bottleShape.js';
import { getSharedTextures, createSmudgeTexture, createThicknessTexture, createBumpTexture, drawBump, loadLabelArt } from '../textures.js';

const fresnelVertex = `varying vec3 vN; varying vec3 vV;
  void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;

/* Vidro com refração real + camadas finas por cima: condensação, contraluz vermelha e espessura nas bordas. */
export default function Glass() {
  const phase = usePhase();
  const aniso = useThree(s => s.gl.capabilities.getMaxAnisotropy());

  const m = useMemo(() => {
    const tex = getSharedTextures(aniso);
    const bump = createBumpTexture(aniso);
    drawBump(bump, null);

    const glass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0, roughness: 0.09, roughnessMap: createSmudgeTexture(aniso),
      transmission: 1, ior: 1.52, thickness: 0.5, thicknessMap: createThicknessTexture(),
      attenuationColor: new THREE.Color(0xcfeedd), attenuationDistance: 0.7,
      clearcoat: 1, clearcoatRoughness: 0.025, specularIntensity: 1,
      bumpMap: bump, bumpScale: 0.5,
      envMapIntensity: 1.6, depthWrite: false
    });

    // película de condensação (vidro embaçado)
    const frostGeo = glassGeometry.clone(); frostGeo.scale(1.006, 1, 1.006);
    const frost = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, roughness: 0.45, metalness: 0, transparent: true, opacity: 0.05,
      alphaMap: tex.frost, depthWrite: false, envMapIntensity: 1.2
    });

    // brilho de borda vermelho (contraluz)
    const rim = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(1.0, 0.12, 0.06) }, uI: { value: 0 } },
      vertexShader: fresnelVertex,
      fragmentShader: `uniform vec3 uColor; uniform float uI; varying vec3 vN; varying vec3 vV;
        void main(){ float f = pow(clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), 3.5); gl_FragColor = vec4(uColor * f * uI, f * uI); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });

    // espessura do vidro: faixa escura/esverdeada nas silhuetas, como no vidro grosso real
    const edge = new THREE.ShaderMaterial({
      uniforms: { uI: { value: 1 } },
      vertexShader: fresnelVertex,
      fragmentShader: `uniform float uI; varying vec3 vN; varying vec3 vV;
        void main(){
          float e = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
          gl_FragColor = vec4(0.012, 0.03, 0.022, smoothstep(0.55, 0.97, e) * 0.6 * uI);
        }`,
      transparent: true, depthWrite: false
    });

    return { glass, frost, frostGeo, rim, edge, bump };
  }, [aniso]);

  // o logo em relevo no pé da garrafa sai da mesma arte do rótulo
  useEffect(() => { loadLabelArt().then(art => art && drawBump(m.bump, art)); }, [m]);

  useFrame(() => {
    const { L, macro, red } = phase;
    m.glass.envMapIntensity = 1.6 * L + macro * 0.6;
    m.frost.envMapIntensity = 1.2 * L;
    m.rim.uniforms.uI.value = (0.15 + red * 0.42) * L;
    m.edge.uniforms.uI.value = L;
  });

  return (
    <>
      <mesh geometry={glassGeometry} material={m.glass} />
      <mesh geometry={m.frostGeo} material={m.frost} renderOrder={4} />
      <mesh geometry={glassGeometry} material={m.edge} scale={[1.002, 1, 1.002]} renderOrder={5} />
      <mesh geometry={glassGeometry} material={m.rim} scale={[1.012, 1, 1.012]} renderOrder={6} />
    </>
  );
}
