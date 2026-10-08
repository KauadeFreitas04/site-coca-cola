import { useReveal } from './Sections.jsx';
import CircularCarousel from './CircularCarousel.jsx';
import { BlurText } from './Effects.jsx';

// Marcas da Coca-Cola Brasil (logos oficiais de coca-cola.com/br/pt/brands) num carrossel circular.
const logos = import.meta.glob('../assets/marcas/*.{png,svg}', { eager: true, import: 'default' });
const pick = (file) => logos[`../assets/marcas/${file}`];
const brands = [
  ['coca-cola.svg', 'Coca-Cola'], ['sprite.png', 'Sprite'], ['fanta.svg', 'Fanta'],
  ['schweppes.png', 'Schweppes'], ['crystal.png', 'Crystal'], ['kuat.png', 'Guaraná Kuat'],
  ['del-valle.png', 'Del Valle'], ['ades.png', 'AdeS'], ['leao.png', 'Leão'],
  ['powerade.png', 'Powerade'], ['schweppes-mixed.png', 'Schweppes Mixed'],
  ['absolut-sprite.png', 'Absolut & Sprite'], ['jack-coca.png', 'Jack Daniel’s & Coca-Cola']
].map(([file, name]) => ({ name, src: pick(file) }));

export default function Brands() {
  const [ref, visible] = useReveal(0.15);

  return (
    <section id="marcas" className="sec brands" ref={ref}>
      <div className={'sec-head brands-head reveal' + (visible ? ' in' : '')}>
        <div className="tag">04 — Família</div>
        <BlurText>Muito além<br />da <em>Coca-Cola</em>.</BlurText>
        <p>Sucos, águas, chás, isotônicos e refrigerantes: as marcas da Coca-Cola Brasil estão em todos os momentos do dia.</p>
      </div>
      <CircularCarousel items={brands} visible={visible} />
      <p className="cc-hint">Arraste para girar</p>
    </section>
  );
}
