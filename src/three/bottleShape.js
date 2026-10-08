import * as THREE from 'three';
import { PI, clamp, sm, lerp } from './math.js';

/* Geometria da garrafa Coca-Cola Contour, com perfil medido na foto de referência.
   Medidas em pixels da foto original (3840×5760): eixo em x=1928, base em y=5500, topo da tampa em y=526.
   PX converte pixel da foto em unidade da cena; Y() converte a altura da foto em altura da cena. */
export const PX = 4.07 / (5500 - 526);
export const Y = py => -2 + (5500 - py) * PX;

export const LABEL_TOP = Y(2470), LABEL_BOT = Y(3262), LABEL_R = 580 * PX + 0.0045;
export const LIQ_TOP = Y(1656), LIQ_BOT = Y(5300), WALL = 0.02;
export const MOUTH_Y = Y(560);

// silhueta [raio px, altura px] de baixo para cima; termina dobrando para dentro (boca da garrafa)
const prof = [
  [0, 5500], [440, 5500], [530, 5491], [577, 5466], [600, 5428], [609, 5370], [610, 5250], [604, 5130], [590, 4960],
  [566, 4800], [538, 4630], [522, 4480], [524, 4360], [545, 4130], [566, 3950], [584, 3720], [594, 3520], [602, 3380],
  [602, 3330], [592, 3285], [580, 3262], [580, 2470], [566, 2430], [541, 2310], [495, 2110], [420, 1905], [350, 1705],
  [314, 1590], [296, 1480], [274, 1300], [257, 1110], [247, 960], [246, 928], [266, 914], [281, 895], [284, 800],
  [281, 735], [272, 698], [258, 680], [254, 640], [250, 580], [238, 562], [212, 560], [202, 574], [198, 660]
];
export const profPts = new THREE.CatmullRomCurve3(prof.map(p => new THREE.Vector3(p[0] * PX, Y(p[1]), 0)), false, 'centripetal')
  .getSpacedPoints(420).map(v => new THREE.Vector2(v.x, v.y));
const outerN = profPts.findIndex(p => p.y > Y(565)); // só o lado de fora (antes da dobra da boca)

export function radiusAt(y) {
  for (let i = 0; i < outerN; i++) {
    const a = profPts[i], b = profPts[i + 1];
    if ((y >= a.y && y <= b.y) || (y <= a.y && y >= b.y)) return lerp(a.x, b.x, (y - a.y) / ((b.y - a.y) || 1));
  }
  return LABEL_R;
}
export const profLen = profPts.reduce((s, p, i) => i ? s + p.distanceTo(profPts[i - 1]) : 0, 0);
export function vAt(y) { // coordenada v do torno numa altura do corpo
  for (let i = 1; i < outerN; i++) if (profPts[i].y >= y) return (i - 1 + (y - profPts[i - 1].y) / ((profPts[i].y - profPts[i - 1].y) || 1)) / (profPts.length - 1);
  return 0;
}

// caneluras verticais do vidro Contour: acima do rótulo (ombro) e abaixo dele até a base
const FLUTES = 12, FLUTE_D = 0.0075;
function fluteMask(y) {
  return sm(0.5, 0.57, y) * (1 - sm(0.92, 1.06, y)) + sm(-1.8, -1.66, y) * (1 - sm(-0.3, -0.205, y));
}
function contourLathe(pts, segs) {
  const geo = new THREE.LatheGeometry(pts, segs);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), r = Math.hypot(x, z);
    if (r < 1e-4) continue;
    const d = FLUTE_D * fluteMask(y) * (0.5 - 0.5 * Math.cos(FLUTES * Math.atan2(x, z)));
    pos.setX(i, x * (r - d) / r); pos.setZ(i, z * (r - d) / r);
  }
  geo.computeVertexNormals();
  // costura do torno: a primeira e a última coluna compartilham a mesma normal
  const n = geo.attributes.normal, np = pts.length, v = new THREE.Vector3();
  for (let j = 0; j < np; j++) {
    const a = j, b = segs * np + j;
    v.set(n.getX(a) + n.getX(b), n.getY(a) + n.getY(b), n.getZ(a) + n.getZ(b)).normalize();
    n.setXYZ(a, v.x, v.y, v.z); n.setXYZ(b, v.x, v.y, v.z);
  }
  return geo;
}

export const glassGeometry = contourLathe(profPts, 240);

// líquido: acompanha a parede interna do vidro até o nível da foto (logo abaixo do gargalo)
const liqR = y => Math.max(0, radiusAt(y) - WALL - 0.035 * (1 - sm(0, 0.06, y - LIQ_BOT)));
const liqProf = [new THREE.Vector2(0, LIQ_BOT)];
for (let i = 0; i <= 200; i++) { const y = lerp(LIQ_BOT, LIQ_TOP, i / 200); liqProf.push(new THREE.Vector2(liqR(y), y)); }
liqProf.push(new THREE.Vector2(0, LIQ_TOP));
export const liquidGeometry = contourLathe(liqProf, 240);
const LIQ_LUT = Float32Array.from({ length: 256 }, (_, i) => liqR(lerp(LIQ_BOT, LIQ_TOP, i / 255)));
export const liqRadius = y => LIQ_LUT[Math.round(clamp((y - LIQ_BOT) / (LIQ_TOP - LIQ_BOT), 0, 1) * 255)];

// tampa coroa: 21 dentes, aberta embaixo, borda de cima chanfrada
export const CAP_H = Y(680) - Y(526), CAP_TOP = 0.2;
export const CAP_HOME = new THREE.Vector3(0, (Y(526) + Y(680)) / 2, 0);
export function createCapGeometry() {
  const geo = new THREE.CylinderGeometry(0.214, 0.226, CAP_H, 168, 6, true);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), r = Math.hypot(x, z);
    const th = Math.atan2(x, z);
    const skirt = clamp((CAP_H * 0.3 - y) / (CAP_H * 0.8), 0, 1);
    let nr = r + Math.pow(Math.abs(Math.sin(th * 10.5)), 0.7) * 0.013 * skirt;
    if (y > CAP_H / 2 - 1e-4) nr = CAP_TOP;
    pos.setX(i, x * nr / r); pos.setZ(i, z * nr / r);
  }
  // inverte o sentido dos triângulos para a face externa ficar voltada para fora
  const idx = geo.index.array;
  for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
  geo.computeVertexNormals();
  return geo;
}

// posiciona uma gota (achatada contra o vidro) na superfície, em ângulo th e altura y
export function placeOnSurface(o, th, y, s, sy, sz) {
  const onLabel = y > LABEL_BOT && y < LABEL_TOP;
  const r = (onLabel ? LABEL_R + 0.002 : radiusAt(y)) + s * 0.25;
  o.position.set(Math.sin(th) * r, y, Math.cos(th) * r);
  o.lookAt(Math.sin(th) * 6, y, Math.cos(th) * 6);
  o.scale.set(s, s * sy, s * sz);
  o.updateMatrix();
}

export { PI };
