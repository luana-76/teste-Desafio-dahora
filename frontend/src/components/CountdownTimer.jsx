import { useEffect, useState } from 'react';
import socket from '../services/socket';

function formatarTempo(segundosRestantes) {
  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

// Calcula quanto tempo falta a partir do estado que vem do servidor
// (duracaoTotal + inicioEm), em vez de contar por conta própria — assim
// todas as telas ficam sincronizadas, mesmo que tenham sido abertas em
// momentos diferentes.
function calcularRestante(estado) {
  if (!estado || estado.inicioEm == null) return estado?.duracaoTotal ?? 0;
  const decorridoSegundos = Math.floor((Date.now() - estado.inicioEm) / 1000);
  return Math.max(0, estado.duracaoTotal - decorridoSegundos);
}

export default function CountdownTimer() {
  const [estado, setEstado] = useState(null);
  const [restante, setRestante] = useState(0);

  // Recebe o estado do cronômetro do servidor: ao conectar (estado atual) e
  // sempre que QUALQUER computador conectado ativar ou reiniciar o cronômetro.
  useEffect(() => {
    function aoReceberEstado(novoEstado) {
      setEstado(novoEstado);
      setRestante(calcularRestante(novoEstado));
    }

    socket.on('timer:estado', aoReceberEstado);
    return () => socket.off('timer:estado', aoReceberEstado);
  }, []);

  // Recalcula o tempo restante a cada segundo com base no estado atual.
  useEffect(() => {
    const intervalo = setInterval(() => {
      setRestante(calcularRestante(estado));
    }, 1000);
    return () => clearInterval(intervalo);
  }, [estado]);

  const rodando = estado?.inicioEm != null;
  const encerrado = rodando && restante <= 0;
  const emAlerta = rodando && !encerrado && restante <= 5 * 60; // últimos 5 minutos

  function ativar() {
    socket.emit('timer:iniciar');
  }

  function reiniciar() {
    socket.emit('timer:reiniciar');
  }

  return (
    <div className="countdown-wrap">
      <div
        className={`countdown-chip ${emAlerta ? 'countdown-alerta' : ''} ${encerrado ? 'countdown-encerrado' : ''}`}
        role="timer"
        aria-live="polite"
      >
        <span className="countdown-icon" aria-hidden="true">⏱️</span>
        {!rodando ? (
          <span className="countdown-label">Aguardando ativação</span>
        ) : encerrado ? (
          <span className="countdown-label">Tempo esgotado</span>
        ) : (
          <>
            <span className="countdown-label">Tempo do desafio</span>
            <span className="countdown-time">{formatarTempo(restante)}</span>
          </>
        )}
      </div>

      {rodando ? (
        <button type="button" className="countdown-btn countdown-btn-reiniciar" onClick={reiniciar}>
          Reiniciar
        </button>
      ) : (
        <button type="button" className="countdown-btn countdown-btn-ativar" onClick={ativar}>
          Ativar cronômetro
        </button>
      )}
    </div>
  );
}
