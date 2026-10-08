import * as THREE from 'three';
import { PI } from './math.js';
import { profPts, LIQ_BOT, Y, vAt, radiusAt, profLen, LABEL_TOP, LABEL_BOT, LABEL_R } from './bottleShape.js';
import labelArtUrl from '../assets/coca-label-art.png';

/* Texturas geradas em canvas: nada de imagens externas além da arte do rótulo. */

export function canvasTex(w, h, draw, { srgb = false, aniso = 1 } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  return t;
}

let shared;
// texturas pequenas usadas por várias partes da cena (criadas uma vez)
export function getSharedTextures(aniso) {
  if (shared) return shared;
  const frost = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) {
      const r = Math.pow(Math.random(), 3) * 2.4 + 0.3;
      g.fillStyle = `rgba(255,255,255,${0.25 + Math.random() * 0.6})`;
      g.beginPath(); g.arc(Math.random() * w, Math.random() * h, r, 0, PI * 2); g.fill();
    }
  }, { aniso });
  frost.wrapS = frost.wrapT = THREE.RepeatWrapping;
  frost.repeat.set(6, 5);

  const bubble = canvasTex(64, 64, g => {
    g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 4; g.beginPath(); g.arc(32, 32, 24, 0, PI * 2); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.arc(23, 22, 6, 0, PI * 2); g.fill();
  }, { aniso });
  const soft = canvasTex(64, 64, g => {
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.5)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  }, { aniso });
  const smoke = canvasTex(128, 128, g => {
    for (let i = 0; i < 26; i++) {
      const x = 64 + (Math.random() - .5) * 50, y = 64 + (Math.random() - .5) * 50, rr = 14 + Math.random() * 30;
      const r = g.createRadialGradient(x, y, 0, x, y, rr);
      r.addColorStop(0, 'rgba(255,255,255,.18)'); r.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    }
  }, { aniso });
  shared = { frost, bubble, soft, smoke };
  return shared;
}

// borda suave das softboxes do estúdio (reflexo de luz real, sem cantos duros)
export function createSoftEdgeTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), img = g.createImageData(128, 128);
  const f = t => { const k = Math.min(t, 1 - t) / 0.3; return k >= 1 ? 1 : k * k * (3 - 2 * k); };
  for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
    const u = (x + 0.5) / 128, v = (y + 0.5) / 128;
    const k = f(u) * f(v) * (0.85 + 0.15 * Math.cos((u - 0.5) * PI));
    const i = (y * 128 + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = k * 255; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}

// pequenas manchas e marcas de manuseio (rugosidade variável do vidro)
export function createSmudgeTexture(aniso) {
  const t = canvasTex(512, 1024, (g, w, h) => {
    g.fillStyle = 'rgb(0,90,0)'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * w, y = Math.random() * h, rr = 8 + Math.random() * 40;
      const r = g.createRadialGradient(x, y, 0, x, y, rr);
      r.addColorStop(0, `rgba(0,255,0,${0.15 + Math.random() * 0.3})`); r.addColorStop(1, 'rgba(0,255,0,0)');
      g.fillStyle = r; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
  }, { aniso });
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

// espessura do vidro ao longo do perfil: fundo grosso (esverdeado como na foto), paredes finas
export function createThicknessTexture() {
  return canvasTex(4, 512, (g, w, h) => {
    for (let y = 0; y < h; y++) {
      const p = profPts[Math.round((1 - y / (h - 1)) * (profPts.length - 1))];
      const k = p.y < LIQ_BOT ? 1 : p.y > Y(960) ? 0.35 : 0.16;
      const c = Math.round(k * 255); g.fillStyle = `rgb(${c},${c},${c})`; g.fillRect(0, y, w, 1);
    }
  });
}

/* ---------- arte do rótulo (logo e textos extraídos da foto de referência) ---------- */
let artPromise;
export function loadLabelArt() {
  artPromise ??= new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = labelArtUrl;
  });
  return artPromise;
}

// imperfeições do vidro: ondulação de fabricação, sementes (microbolhas) e o logo em relevo no pé
const BW = 1536, BH = 3072;
export function createBumpTexture(aniso) {
  const c = document.createElement('canvas'); c.width = BW; c.height = BH;
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.anisotropy = aniso;
  return t;
}
export function drawBump(tex, art) {
  const g = tex.image.getContext('2d');
  g.fillStyle = 'rgb(128,128,128)'; g.fillRect(0, 0, BW, BH);
  for (let y = 0; y < BH; y += 2) {
    const v = 128 + Math.sin(y * 0.021) * 4 + Math.sin(y * 0.0063 + 1.7) * 6 + (Math.random() - 0.5) * 5;
    g.fillStyle = `rgba(${v | 0},${v | 0},${v | 0},.55)`; g.fillRect(0, y, BW, 2);
  }
  for (let i = 0; i < 160; i++) {
    const x = Math.random() * BW, y = Math.random() * BH, r = 0.8 + Math.random() * 1.8;
    g.fillStyle = `rgba(255,255,255,${0.5 + Math.random() * 0.5})`;
    g.beginPath(); g.ellipse(x, y, r, r * (1 + Math.random() * 1.5), 0, 0, PI * 2); g.fill();
  }
  if (art) {
    // só o logo (sem "0,33L" nem os textos de baixo), em relevo nas laterais do pé da garrafa
    const c = document.createElement('canvas'); c.width = 1240; c.height = 450;
    const cg = c.getContext('2d');
    cg.drawImage(art, 115, 25, 1240, 450, 0, 0, 1240, 450);
    cg.clearRect(0, 0, 100, 100);
    const vc = vAt(Y(4950)), hu = 0.17, wu = hu * 1240 / 450;
    const h = hu * BH / profLen, w = wu * BW / (2 * PI * radiusAt(Y(4950)));
    g.save(); g.filter = 'blur(2.5px)'; g.globalAlpha = 0.9;
    for (const u of [0.25, 0.75]) g.drawImage(c, u * BW - w / 2, (1 - vc) * BH - h / 2, w, h);
    g.restore();
  }
  tex.needsUpdate = true;
}

// rótulo: largura da textura = circunferência do rótulo
const LW = 4096, LH = Math.round(LW * (LABEL_TOP - LABEL_BOT) / (2 * PI * LABEL_R));
export function createLabelTexture(aniso) {
  const c = document.createElement('canvas'); c.width = LW; c.height = LH;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  return t;
}
export function drawLabel(tex, art) {
  const lg = tex.image.getContext('2d');
  lg.fillStyle = '#e3141f'; lg.fillRect(0, 0, LW, LH);
  for (let i = 0; i < 60000; i++) {
    lg.fillStyle = `rgba(${Math.random() < .5 ? '60,0,0' : '255,90,80'},${Math.random() * .045})`;
    lg.fillRect(Math.random() * LW, Math.random() * LH, 2, 2);
  }
  if (art) {
    // escala da foto para a textura (raio do rótulo na foto: 588 px); o centro da frente fica a 72° da borda esquerda da arte
    const k = LW / (2 * PI * 588), w = art.naturalWidth * k, h = art.naturalHeight * k;
    const front = 1.2566 * 588 * k;
    for (const cx of [LW / 2, 0, LW]) lg.drawImage(art, cx - front, (2478 - 2470) * k, w, h);
  } else {
    lg.textAlign = 'center'; lg.textBaseline = 'middle'; lg.fillStyle = '#fff';
    lg.font = 'italic 700 300px Georgia, serif';
    for (const cx of [LW / 2, 0, LW]) lg.fillText('Coca-Cola', cx, LH * 0.4);
  }
  // laterais: lista de ingredientes e código de barras, como no rótulo real
  lg.textAlign = 'center'; lg.textBaseline = 'alphabetic'; lg.fillStyle = 'rgba(255,255,255,.92)';
  lg.font = '700 26px Manrope, Arial, sans-serif';
  lg.fillText('INGREDIENTES', 961, 250);
  lg.font = '500 21px Manrope, Arial, sans-serif';
  ['Água gaseificada, açúcar,', 'extrato de noz de cola,', 'cafeína, corante caramelo IV,', 'acidulante ácido fosfórico', 'e aroma natural.', '', 'Servir gelado.']
    .forEach((s, i) => lg.fillText(s, 961, 292 + i * 30));
  lg.fillStyle = '#fff'; lg.fillRect(2884, 300, 250, 170);
  lg.fillStyle = '#111';
  for (let x = 2902, i = 0; x < 3116; i++) { const bw = 2 + (i * 7 % 5); lg.fillRect(x, 314, bw, 120); x += bw + 2 + (i * 3 % 4); }
  lg.font = '600 18px Manrope, Arial, sans-serif'; lg.fillText('5 449000 000996', 3009, 458);
  lg.fillStyle = 'rgba(255,255,255,.92)'; lg.font = '700 30px Manrope, Arial, sans-serif';
  lg.fillText('330 ml', 3009, 540);
  tex.needsUpdate = true;
}
