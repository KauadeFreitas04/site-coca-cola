import { Children, cloneElement, isValidElement, useEffect, useRef, useState } from 'react';

// Efeitos no estilo React Bits, sem dependências: BlurText, CountUp, Magnet, SpotlightCard e ScrollVelocity.

// Observa o elemento e avisa quando entra na tela (uma vez só).
function useInView(ref, threshold = 0.3) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold]);
  return seen;
}

// BlurText: cada palavra do título entra desfocada e sobe, em cascata. Mantém <em> e <br />.
export function BlurText({ as: Tag = 'h2', children, delay = 70, className = '' }) {
  const ref = useRef(null);
  const seen = useInView(ref, 0.4);
  let n = 0;
  const split = (node) => {
    if (typeof node === 'string') {
      return node.split(/(\s+)/).map((part, k) =>
        /^\s+$/.test(part) || !part ? part : <span key={k} className="bt-w" style={{ '--d': (n++ * delay) + 'ms' }}>{part}</span>
      );
    }
    if (isValidElement(node) && node.props.children) {
      return cloneElement(node, {}, Children.map(node.props.children, split));
    }
    return node;
  };
  return <Tag ref={ref} className={'bt ' + (seen ? 'in ' : '') + className}>{Children.map(children, split)}</Tag>;
}

// CountUp: o número conta de 0 até o valor quando aparece na tela.
export function CountUp({ to, duration = 1600, suffix = '' }) {
  const ref = useRef(null);
  const seen = useInView(ref, 0.6);
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!seen) return;
    let raf; const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      setV(Math.round(to * (1 - Math.pow(1 - t, 4))));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, duration]);
  return <span ref={ref}>{v}{suffix}</span>;
}

// Magnet: o elemento é puxado na direção do mouse quando ele chega perto.
export function Magnet({ children, strength = 0.35, padding = 60 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const near = Math.abs(dx) < r.width / 2 + padding && Math.abs(dy) < r.height / 2 + padding;
      el.style.transform = near ? `translate(${dx * strength}px, ${dy * strength}px)` : '';
    };
    addEventListener('pointermove', move);
    return () => removeEventListener('pointermove', move);
  }, [strength, padding]);
  return <span ref={ref} className="magnet">{children}</span>;
}

// SpotlightCard: uma luz vermelha segue o mouse dentro do cartão.
export function SpotlightCard({ as: Tag = 'div', className = '', children, ...rest }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', e.clientX - r.left + 'px');
    e.currentTarget.style.setProperty('--my', e.clientY - r.top + 'px');
  };
  return <Tag className={'spot ' + className} onPointerMove={onMove} {...rest}>{children}</Tag>;
}

// ScrollVelocity: faixas de texto correndo em sentidos opostos que aceleram com a velocidade do scroll.
export function ScrollVelocity({ texts, baseSpeed = 40 }) {
  const rowRefs = useRef([]);
  useEffect(() => {
    const pos = texts.map(() => 0);
    let lastY = scrollY, boost = 0, raf, last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const dy = scrollY - lastY; lastY = scrollY;
      boost += (Math.min(40, Math.abs(dy)) * 0.6 - boost) * 0.1;
      const dir = dy < 0 ? -1 : 1;
      rowRefs.current.forEach((el, k) => {
        if (!el) return;
        const w = el.scrollWidth / 2;
        pos[k] -= (k % 2 ? -1 : 1) * dir * (baseSpeed + boost * 30) * dt;
        pos[k] = ((pos[k] % w) - w) % w;
        el.style.transform = `translate3d(${pos[k]}px, 0, 0)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [texts, baseSpeed]);

  return (
    <div className="sv" aria-hidden="true">
      {texts.map((t, k) => (
        <div key={k} className={'sv-row' + (k % 2 ? ' alt' : '')}>
          <div className="sv-track" ref={el => (rowRefs.current[k] = el)}>
            {Array.from({ length: 8 }, (_, i) => <span key={i}>{t}<i>✦</i></span>)}
          </div>
        </div>
      ))}
    </div>
  );
}
