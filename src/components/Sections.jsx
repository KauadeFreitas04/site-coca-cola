import { useEffect, useRef, useState } from 'react';
import { timeline, bottleStats, bottles, marquee } from '../content.jsx';
import { BlurText, CountUp, Magnet, SpotlightCard, ScrollVelocity } from './Effects.jsx';
import bottleShot from '../assets/garrafa-hero.webp';
import evolutionShot from '../assets/evolucao-garrafas.webp';

// Faz o elemento entrar suavemente quando aparece na tela (uma vez só).
export function useReveal(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, visible];
}

export function History() {
  const [ref, visible] = useReveal();
  return (
    <section id="historia" className="sec" ref={ref}>
      <div className={'sec-head reveal' + (visible ? ' in' : '')}>
        <div className="tag">01 — História</div>
        <BlurText>Tudo começou<br />em <em>Atlanta</em>.</BlurText>
      </div>
      <ol className={'timeline' + (visible ? ' in' : '')}>
        {timeline.map((t, i) => (
          <SpotlightCard as="li" key={t.title} style={{ '--i': i }}>
            <span className="year">{t.year}</span>
            <h3>{t.title}</h3>
            <p>{t.text}</p>
          </SpotlightCard>
        ))}
      </ol>
    </section>
  );
}

export function Marquee() {
  return <ScrollVelocity texts={marquee} />;
}

// Evolução da garrafa: a foto com as seis garrafas; a escolhida fica iluminada e as outras escurecem.
// Gira sozinha entre as garrafas até a pessoa passar o mouse ou tocar em uma.
export function Evolution() {
  const [ref, visible] = useReveal(0.25);
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!visible || !auto) return;
    const id = setInterval(() => setActive(a => (a + 1) % bottles.length), 3200);
    return () => clearInterval(id);
  }, [visible, auto]);
  const pick = (i) => { setAuto(false); setActive(i); };
  const b = bottles[active];

  return (
    <section id="evolucao" className="sec evo" ref={ref}>
      <div className={'sec-head reveal' + (visible ? ' in' : '')}>
        <div className="tag">02 — Evolução</div>
        <BlurText>Mais de um século<br />de <em>garrafa</em>.</BlurText>
      </div>
      <div className={'evo-grid reveal' + (visible ? ' in' : '')} style={{ '--d': '150ms' }}>
        <figure className="evo-photo" style={{ '--x': b.x + '%' }}>
          <img src={evolutionShot} alt="Seis garrafas de Coca-Cola lado a lado, de 1894 até hoje" loading="lazy" />
          <div className="evo-dim" />
          {bottles.map((bt, i) => (
            <button key={bt.year} className={'evo-hit' + (i === active ? ' on' : '')} style={{ left: bt.x + '%' }}
              onPointerEnter={() => pick(i)} onFocus={() => pick(i)} onClick={() => pick(i)} aria-label={bt.year + ' — ' + bt.title} />
          ))}
        </figure>
        <div className="evo-info">
          <ol className="evo-years">
            {bottles.map((bt, i) => (
              <li key={bt.year}>
                <button className={i === active ? 'on' : ''} onClick={() => pick(i)}>{bt.year}</button>
              </li>
            ))}
          </ol>
          <div className="evo-card" key={active}>
            <span className="evo-year">{b.year}</span>
            <h3>{b.title}</h3>
            <p>{b.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Bottle() {
  const [ref, visible] = useReveal();
  return (
    <section id="garrafa" className="sec split" ref={ref}>
      <figure className={'split-media reveal' + (visible ? ' in' : '')}>
        <img src={bottleShot} alt="Garrafa Contour de Coca-Cola gelada com luz vermelha" loading="lazy" />
      </figure>
      <div className={'split-copy reveal' + (visible ? ' in' : '')} style={{ '--d': '150ms' }}>
        <div className="tag">03 — A garrafa</div>
        <BlurText>Reconhecível<br />no <em>escuro</em>.</BlurText>
        <p>Em 1915 a Contour nasceu de um desafio: ser reconhecida só pelo toque. Mais de cem anos depois, o desenho é praticamente o mesmo.</p>
        <div className="stats">
          {bottleStats.map(([value, unit, label]) => <div key={label}><CountUp to={value} suffix={unit} /><small>{label}</small></div>)}
        </div>
      </div>
    </section>
  );
}

// Faixa com vídeo em loop (toca sozinho, sem depender do scroll), como a do site de referência.
export function Band() {
  const [ref, visible] = useReveal(0.3);
  return (
    <section className="band" ref={ref}>
      <video src={import.meta.env.BASE_URL + 'video/band.mp4'} autoPlay muted loop playsInline preload="metadata" />
      <div className="band-shade" />
      <div className={'band-copy reveal' + (visible ? ' in' : '')}>
        <div className="tag">Psssst</div>
        <BlurText>Gelo, gás<br />e <em>Coca-Cola</em>.</BlurText>
      </div>
    </section>
  );
}

export function Finale() {
  const [ref, visible] = useReveal();
  return (
    <section id="fim" className="sec finale" ref={ref}>
      <div className={'reveal' + (visible ? ' in' : '')}>
        <div className="tag">Coca-Cola</div>
        <BlurText delay={140}>Abra.<br /><em>Sinta</em>.</BlurText>
        <p>Abra a felicidade. Sinta o sabor.</p>
        <div className="ctas">
          <Magnet><a className="btn solid" href="https://www.coca-cola.com/br/pt" target="_blank" rel="noopener">Site oficial →</a></Magnet>
          <Magnet><a className="btn" href="#topo">Voltar ao início ↑</a></Magnet>
        </div>
      </div>
    </section>
  );
}
