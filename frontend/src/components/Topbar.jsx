import CountdownTimer from './CountdownTimer';
import PontoWidget from './PontoWidget';
import { usuarioAtual } from '../services/auth';

export default function Topbar() {
  const usuario = usuarioAtual();

  return (
    <div className="topbar">
      <CountdownTimer />

      <PontoWidget usuario={usuario} />

      <a href="#/perfil" className="avatar" title="Meu perfil" aria-label="Ir para meu perfil">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="12" cy="8.5" r="3.4" fill="currentColor" />
          <path
            d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </a>
    </div>
  );
}
