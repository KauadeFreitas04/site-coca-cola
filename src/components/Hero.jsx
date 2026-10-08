import { useEffect, useRef } from 'react';
import { captions } from '../content.jsx';
import { Magnet } from './Effects.jsx';

// Abertura no estilo "filme arrastado pelo scroll": a seção é alta (várias telas) e o palco fica
// preso (sticky) enquanto o scroll avança os quadros do comercial. Depois dela a página rola normal.
const FRAMES = 385;
const portrait = () => innerWidth / innerHeight < 0.9;
const src = (set, i) => `${import.meta.env.BASE_URL}frames/${set}/f_${String(i + 1).padStart(4, '0')}.webp`;
// Ponto do quadro que fica no centro quando a tela corta o vídeo (a garrafa fica um pouco à direita).
const FOCUS_X = 0.54;

const fade = (p, from, to, edge = 0.04) =>
  Math.max(0, Math.min(1, (p - from) / edge, (to - p) / edge));

export default function Hero({ onReady }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const introRef = useRef(null);
  const outroRef = useRef(null);
  const capRefs = useRef([]);
  const barRef = useRef(null);
  const hintRef = useRef(null);
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const set = portrait() ? 'm' : 'd';
    const imgs = new Array(FRAMES);
    let drawn = -1, raf, last = performance.now(), cur = 0, alive = true;

    // Primeiro um quadro a cada 16, depois a cada 4, depois o resto:
    // o scroll já funciona cedo e vai ficando mais fluido enquanto baixa.
    const seen = new Set(), order = [];
    for (const step of [16, 4, 1]) for (let i = 0; i < FRAMES; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
    const firstPass = Math.ceil(FRAMES / 16);
    let next = 0, loaded = 0;
    const loadNext = () => {
      if (!alive || next >= order.length) return;
      const i = order[next++];
      const img = new Image();
      img.decoding = 'async';
      img.onload = img.onerror = () => {
        if (img.naturalWidth) imgs[i] = img;
        if (++loaded === firstPass) readyRef.current();
        drawn = -1;
        loadNext();
      };
      img.src = src(set, i);
    };
    for (let k = 0; k < 8; k++) loadNext();

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(innerWidth * dpr);
      canvas.height = Math.round(innerHeight * dpr);
      ctx.imageSmoothingQuality = 'high';
      drawn = -1;
    };
    resize();
    addEventListener('resize', resize);

    const nearest = (i) => {
      for (let d = 0; d < FRAMES; d++) {
        if (imgs[i - d]) return imgs[i - d];
        if (imgs[i + d]) return imgs[i + d];
      }
      return null;
    };

    const tick = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const r = section.getBoundingClientRect();
      const target = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
      cur += (target - cur) * (1 - Math.pow(0.002, dt));
      if (Math.abs(target - cur) < 0.0002) cur = target;

      // só desenha enquanto a abertura está na tela
      if (r.bottom > 0) {
        const i = Math.min(FRAMES - 1, Math.round(cur * (FRAMES - 1)));
        if (i !== drawn) {
          const img = nearest(i);
          if (img) {
            const cw = canvas.width, ch = canvas.height;
            const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
            const w = img.naturalWidth * s, h = img.naturalHeight * s;
            const focus = set === 'm' ? 0.5 : FOCUS_X;
            const x = Math.min(0, Math.max(cw - w, cw / 2 - w * focus));
            ctx.drawImage(img, x, (ch - h) / 2, w, h);
            if (imgs[i]) drawn = i;
          }
        }
        introRef.current.style.opacity = Math.max(0, 1 - cur / 0.1);
        introRef.current.style.transform = `translateY(${-cur * 400}px)`;
        captions.forEach((c, k) => {
          const el = capRefs.current[k];
          const o = fade(cur, c.from, c.to);
          el.style.opacity = o;
          el.style.transform = `translateY(${(1 - o) * 30}px)`;
          el.style.visibility = o > 0 ? 'visible' : 'hidden';
        });
        const o = Math.max(0, Math.min(1, (cur - 0.86) / 0.06));
        outroRef.current.style.opacity = o;
        outroRef.current.style.transform = `translateY(${(1 - o) * 30}px)`;
        outroRef.current.style.visibility = o > 0 ? 'visible' : 'hidden';
        hintRef.current.style.opacity = cur > 0.02 ? 0 : 1;
        barRef.current.style.transform = `scaleX(${cur})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => { alive = false; cancelAnimationFrame(raf); removeEventListener('resize', resize); };
  }, []);

  return (
    <section className="hero" ref={sectionRef} id="topo">
      <div className="hero-sticky">
        <canvas ref={canvasRef} className="hero-canvas" />
        <div className="hero-shade" />

        <div className="hero-copy hero-intro" ref={introRef}>
          <div className="tag">The Coca-Cola Company · desde 1886</div>
          <h1>Abra a<br /><em>felicidade</em>.</h1>
          <p>A mesma garrafa, o mesmo logotipo e o mesmo sabor há mais de um século.</p>
        </div>

        {captions.map((c, k) => (
          <div key={c.tag} className="hero-copy hero-cap" ref={el => (capRefs.current[k] = el)}>
            <div className="tag">{c.tag}</div>
            <h2>{c.title}</h2>
          </div>
        ))}

        <div className="hero-copy hero-outro" ref={outroRef}>
          <div className="tag">Coca-Cola</div>
          <h1>Abra.<br /><em>Sinta</em>.</h1>
          <div className="ctas">
            <Magnet><a className="btn solid" href="#historia">Conheça a história ↓</a></Magnet>
            <Magnet><a className="btn" href="https://www.coca-cola.com/br/pt" target="_blank" rel="noopener">Site oficial →</a></Magnet>
          </div>
        </div>

        <div className="hero-hint" ref={hintRef}>Role para abrir<b>↓</b></div>
        <div className="hero-bar"><i ref={barRef} /></div>
      </div>
    </section>
  );
}
