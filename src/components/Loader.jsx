export default function Loader({ done, failed }) {
  return (
    <div className={'loader' + (done ? ' done' : '')}>
      <div className="logo">Coca-Cola<span>.</span></div>
      <div className="bar"><i /></div>
      <small>{failed ? 'Seu navegador não conseguiu abrir o 3D' : 'Carregando experiência'}</small>
    </div>
  );
}
