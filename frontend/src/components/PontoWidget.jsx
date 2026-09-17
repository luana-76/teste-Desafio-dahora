import { useEffect, useState } from 'react';
import { obterEntrada, baterEntrada, baterSaida } from '../services/ponto';

function formatarHorario(timestamp) {
  return new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatarDuracao(ms) {
  const totalSegundos = Math.max(0, Math.floor(ms / 1000));
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

export default function PontoWidget({ usuario }) {
  const [entrada, setEntrada] = useState(() => (usuario ? obterEntrada(usuario.email) : null));
  const [agora, setAgora] = useState(Date.now());

  useEffect(() => {
    if (!entrada) return undefined;
    const intervalo = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(intervalo);
  }, [entrada]);

  if (!usuario) return null;

  function handleClique() {
    if (entrada) {
      baterSaida(usuario.email);
      setEntrada(null);
    } else {
      setEntrada(baterEntrada(usuario.email));
      setAgora(Date.now());
    }
  }

  return (
    <button
      type="button"
      className={`ponto-chip ${entrada ? 'ponto-ativo' : ''}`}
      onClick={handleClique}
      title={entrada ? 'Encerrar ponto' : 'Bater ponto'}
    >
      <span className="ponto-icon" aria-hidden="true">
        🕓
      </span>
      {entrada ? (
        <>
          <span className="ponto-label">Desde {formatarHorario(entrada)}</span>
          <span className="ponto-tempo">{formatarDuracao(agora - entrada)}</span>
        </>
      ) : (
        <span className="ponto-label">Bater ponto</span>
      )}
    </button>
  );
}
