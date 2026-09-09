import { useEffect, useState } from 'react';
import { fetchWeather } from '../services/weather';
import CountdownTimer from './CountdownTimer';

export default function Topbar() {
  const [clima, setClima] = useState(null);
  const [climaErro, setClimaErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    fetchWeather()
      .then((dados) => ativo && setClima(dados))
      .catch(() => ativo && setClimaErro(true));
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <div className="topbar">
      <CountdownTimer />

      <div className="weather-chip" title={clima?.cidade}>
        {clima ? (
          <>
            <span className="weather-icon">{clima.icone}</span>
            <span className="weather-temp">{clima.temperatura}°C</span>
            <span className="weather-desc">{clima.descricao}</span>
          </>
        ) : (
          <span className="weather-desc">{climaErro ? 'Clima indisponível' : 'Consultando o tempo…'}</span>
        )}
      </div>

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
