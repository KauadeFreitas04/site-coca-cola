import logo from '../assets/coca-cola-logo-branco.png';

export default function Loader({ done, failed }) {
  return (
    <div className={'loader' + (done ? ' done' : '')}>
      <img className="loader-logo" src={logo} alt="Coca-Cola" />
      <div className="bar"><i /></div>
      <small>{failed ? 'Seu navegador não conseguiu abrir o 3D' : 'Carregando experiência'}</small>
    </div>
  );
}
