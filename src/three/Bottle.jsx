import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { usePhase } from './phase.js';
import Glass from './parts/Glass.jsx';
import Liquid from './parts/Liquid.jsx';
import Label from './parts/Label.jsx';
import Cap from './parts/Cap.jsx';
import Condensation from './parts/Condensation.jsx';
import OpeningFx from './parts/OpeningFx.jsx';

/* Garrafa Coca-Cola Contour de vidro 330 ml: gira com o scroll e flutua levemente. */
export default function Bottle() {
  const phase = usePhase();
  const ref = useRef();

  useFrame(() => {
    const g = ref.current, t = phase.t;
    g.rotation.y = phase.rot + Math.sin(t * 0.4) * 0.03;
    g.rotation.z = Math.sin(t * 0.5) * 0.012;
    g.position.y = Math.sin(t * 0.7) * 0.05;
  });

  return (
    <group ref={ref}>
      <Liquid />
      <Glass />
      <Label />
      <Cap />
      <Condensation />
      <OpeningFx />
    </group>
  );
}
