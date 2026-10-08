import { nav } from '../content.jsx';
import logo from '../assets/coca-cola-logo-branco.png';

export default function Header() {
  return (
    <header>
      <a className="logo" href="#topo"><img src={logo} alt="Coca-Cola" /></a>
      <nav>
        {nav.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}
      </nav>
      <a className="btn" href="#fim">Abra a sua</a>
    </header>
  );
}
