import { createContext, useContext } from 'react';

/* Estado da cena calculado uma vez por quadro (pelo CameraRig) e lido pelos outros componentes 3D.
   É um objeto mutável de propósito: muda 60x por segundo e não deve provocar re-render do React.
   t    tempo (s)          dt   delta do quadro          p    progresso suavizado do scroll (0–1)
   rot  giro da garrafa    L    luz geral (sai do escuro) macro aproximação do rótulo
   energy cena "no mundo"  open tampa abrindo           hero composição final
   red  intensidade do vermelho                          tb   tempo do estouro de gás (0–1)  */
export function createPhase() {
  return { t: 0, dt: 0, p: 0, rot: Math.PI, L: 0.05, macro: 0, energy: 0, open: 0, hero: 0, red: 0.35, tb: 0 };
}

export const PhaseContext = createContext(null);
export const usePhase = () => useContext(PhaseContext);
