import { nav } from '../content.jsx';

export default function Header() {
  return (
    <header>
      <div className="logo">Coca-Cola<span>.</span></div>
      <nav>
        {nav.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}
      </nav>
      <a className="btn" href="#fim">Abra a sua</a>
    </header>
  );
}
