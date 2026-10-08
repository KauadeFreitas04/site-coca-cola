import { useEffect, useRef } from 'react';

// Carrossel circular em cilindro (inspirado no "Circular Carousel" do React Bits, preset Cylinder):
// os cartões ficam na parte de dentro de um cilindro, giram sozinhos (drift), podem ser arrastados
// com inércia, encaixam no cartão mais próximo ao soltar e pausam com o mouse em cima.
export default function CircularCarousel({
  items,
  cardWidth = 280,
  gap = 26,
  tilt = -5,
  perspective = 2500,
  speed = 14,          // graus por segundo no giro automático
  direction = -1,      // -1 = para a esquerda
  momentum = 0.6,
  depthFade = 0.55,
  pauseOnHover = true,
  visible = true
}) {
  const stageRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const stage = stageRef.current;
    const n = items.length;
    const step = 360 / n;
    let w = cardWidth;
    let radius = 0;
    const measure = () => {
      // no celular os cartões encolhem para caber
      w = Math.min(cardWidth, innerWidth * 0.42);
      radius = (n * (w + gap)) / (2 * Math.PI);
      stage.style.setProperty('--card-w', w + 'px');
    };
    measure();
    addEventListener('resize', measure);

    let rot = 0, vel = 0, dragging = false, hovering = false, lastX = 0, idleAt = 0, raf, last = performance.now();
    const rad = Math.PI / 180;

    const render = () => {
      for (let i = 0; i < n; i++) {
        const el = cardRefs.current[i];
        let a = ((i * step + rot) % 360 + 540) % 360 - 180; // -180..180, 0 = frente
        const cos = Math.cos(a * rad);
        const x = Math.sin(a * rad) * radius;
        const z = -cos * radius + radius * 0.35;
        el.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${-a}deg)`;
        const hidden = Math.abs(a) > 112;
        el.style.visibility = hidden ? 'hidden' : 'visible';
        el.style.setProperty('--fade', (depthFade * (1 - cos)).toFixed(3));
        el.style.zIndex = Math.round(cos * 100) + 100;
      }
    };

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!dragging) {
        if (Math.abs(vel) > 2) {
          rot += vel * dt;
          vel *= Math.pow(1 - momentum * 0.9, dt * 4);
          idleAt = now;
        } else if (now - idleAt < 1200) {
          // encaixa no cartão mais próximo depois de soltar
          const target = Math.round(rot / step) * step;
          rot += (target - rot) * (1 - Math.pow(0.001, dt));
          vel = 0;
        } else if (!(pauseOnHover && hovering)) {
          rot += direction * speed * dt;
        }
      }
      render();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const down = (e) => {
      dragging = true; lastX = e.clientX; vel = 0;
      stage.setPointerCapture(e.pointerId);
      stage.classList.add('grabbing');
    };
    const move = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      const deg = (dx / (2 * Math.PI * radius)) * 360 * 1.4;
      rot += deg;
      vel = deg / (1 / 60);
    };
    const up = () => {
      if (!dragging) return;
      dragging = false; idleAt = performance.now();
      stage.classList.remove('grabbing');
    };
    const enter = () => (hovering = true);
    const leave = () => (hovering = false);
    stage.addEventListener('pointerdown', down);
    stage.addEventListener('pointermove', move);
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', up);
    stage.addEventListener('pointerenter', enter);
    stage.addEventListener('pointerleave', leave);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', measure);
      stage.removeEventListener('pointerdown', down);
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerup', up);
      stage.removeEventListener('pointercancel', up);
      stage.removeEventListener('pointerenter', enter);
      stage.removeEventListener('pointerleave', leave);
    };
  }, [items, cardWidth, gap, speed, direction, momentum, depthFade, pauseOnHover]);

  return (
    <div className={'cc' + (visible ? ' in' : '')} ref={stageRef} style={{ perspective: perspective + 'px' }}>
      <div className="cc-ring" style={{ transform: `rotateX(${tilt}deg)` }}>
        {items.map((it, i) => (
          <figure key={it.name} className="cc-card" ref={el => (cardRefs.current[i] = el)}>
            <div className="cc-face" style={{ '--i': i, background: it.bg || '#fff' }}>
              <img src={it.src} alt={it.name} draggable="false" />
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
}
