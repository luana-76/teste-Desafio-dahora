import { useEffect, useState } from 'react';
import socket from '../services/socket';
import { usuarioAtual } from '../services/auth';

function formatarTempo(segundosRestantes) {
  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

function calcularRestante(estado) {
  if (!estado || estado.inicioEm == null) return estado?.duracaoTotal ?? 0;
  const decorridoSegundos = Math.floor((Date.now() - estado.inicioEm) / 1000);
  return Math.max(0, estado.duracaoTotal - decorridoSegundos);
}

// Descobre em qual das 3 fases da metodologia (seção 4: 10min Explicação +
// 40min Execução + 10min Apresentação) o cronômetro está agora.
function calcularFase(estado) {
  if (!estado?.fases || estado.inicioEm == null) return null;
  const decorrido = Math.floor((Date.now() - estado.inicioEm) / 1000);
  let acumulado = 0;
  for (const fase of estado.fases) {
    acumulado += fase.duracao;
    if (decorrido < acumulado) return fase.label;
  }
  return null;
}

export default function CountdownTimer() {
  const usuario = usuarioAtual();
  // Só o administrador pode soltar (ativar) e reiniciar o cronômetro.
  // Participante e monitor só acompanham a contagem, em modo visualização.
  const podeControlar = usuario?.papel === 'ADMIN';

  const [estado, setEstado] = useState(null);
  const [restante, setRestante] = useState(0);
  const [fase, setFase] = useState(null);

  useEffect(() => {
    function aoReceberEstado(novoEstado) {
      setEstado(novoEstado);
      setRestante(calcularRestante(novoEstado));
      setFase(calcularFase(novoEstado));
    }

    socket.on('timer:estado', aoReceberEstado);
    return () => socket.off('timer:estado', aoReceberEstado);
  }, []);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setRestante(calcularRestante(estado));
      setFase(calcularFase(estado));
    }, 1000);
    return () => clearInterval(intervalo);
  }, [estado]);

  const rodando = estado?.inicioEm != null;
  const encerrado = rodando && restante <= 0;
  const emAlerta = rodando && !encerrado && restante <= 5 * 60;

  function ativar() {
    socket.emit('timer:iniciar', estado?.desafioId ?? null);
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
          <>
            <span className="countdown-label">
              {podeControlar ? '00:00' : '00:00'}
            </span>
            {!podeControlar && (
              <span className="countdown-time countdown-time-preview">
                {formatarTempo(estado?.duracaoTotal ?? 3600)}
              </span>
            )}
          </>
        ) : encerrado ? (
          <span className="countdown-label">Tempo esgotado</span>
        ) : (
          <>
            <span className="countdown-label">{fase ? `Fase: ${fase}` : 'Tempo do desafio'}</span>
            <span className="countdown-time">{formatarTempo(restante)}</span>
          </>
        )}
      </div>

      {podeControlar &&
        (rodando ? (
          <button type="button" className="countdown-btn countdown-btn-reiniciar" onClick={reiniciar}>
            Reiniciar
          </button>
        ) : (
          <button type="button" className="countdown-btn countdown-btn-ativar" onClick={ativar}>
            Ativar cronômetro
          </button>
        ))}
    </div>
  );
}
