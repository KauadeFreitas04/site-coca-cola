import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePhase } from './phase.js';

/* Iluminação de cinema: luz principal, contraluzes vermelhas, luz de trás e spot de cima.
   As intensidades acompanham as cenas (saída do escuro, close do rótulo, cena final). */
export default function Lights() {
  const phase = usePhase();
  const amb = useRef(), key = useRef(), rimL = useRef(), rimR = useRef(), back = useRef(), top = useRef();

  useFrame(() => {
    const { L, macro, hero, red } = phase;
    key.current.intensity = (0.5 + macro * 1.4 + hero * 0.5) * L;
    top.current.intensity = (40 + macro * 60 + hero * 30) * L;
    rimL.current.intensity = (60 + red * 140) * L;
    rimR.current.intensity = (40 + red * 110) * L;
    back.current.intensity = (5 + red * 10 + macro * 6) * L;
    amb.current.intensity = 0.15 + 0.3 * L;
  });

  return (
    <>
      <ambientLight ref={amb} color={0x2a0505} intensity={0.3} />
      <directionalLight ref={key} color={0xfff2ec} intensity={0} position={[2.5, 4, 5]} />
      <spotLight ref={rimL} color={0xff1a12} intensity={0} distance={0} angle={0.55} penumbra={0.7} decay={2} position={[-4.5, 3, -3]} />
      <spotLight ref={rimR} color={0xff3a18} intensity={0} distance={0} angle={0.55} penumbra={0.7} decay={2} position={[4.5, 0.5, -2.5]} />
      <pointLight ref={back} color={0xff2a0a} intensity={0} distance={0} decay={2} position={[0, -0.2, -1.4]} />
      <spotLight ref={top} color={0xffffff} intensity={0} distance={0} angle={0.4} penumbra={0.8} decay={2} position={[0, 7, 2]} />
    </>
  );
}
