import { Server } from 'socket.io';
import { estadoCronometro, iniciarCronometro, reiniciarCronometro, FASES } from './state/timer.js';

let io;

/**
 * Inicializa o servidor Socket.io em cima do servidor HTTP do Express.
 */
export function initSocket(httpServer, corsOrigin) {
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[socket] cliente conectado: ${socket.id}`);

    // Assim que um cliente conecta (abre ou recarrega a página), ele recebe
    // o estado atual do cronômetro — rodando (com o instante em que foi
    // ativado) ou parado — e as fases (10/40/10 min) pra montar a UI.
    socket.emit('timer:estado', { ...estadoCronometro, fases: FASES });

    // Quem soltou (ativou) e reiniciou o cronômetro sempre pôde fazer isso
    // de qualquer computador conectado, mas agora só o Administrador tem
    // esse botão na tela — Participante e Monitor ficam em modo
    // visualização (ver frontend/src/components/CountdownTimer.jsx). Aqui
    // validamos de novo, no servidor, com o papel que veio no handshake do
    // socket (mesma ideia do header x-papel usado nas rotas HTTP — ver
    // utils/autorizacao.js), pra ninguém contornar a regra chamando o
    // evento diretamente.
    const papel = (socket.handshake.auth?.papel || 'PARTICIPANTE').toUpperCase();

    socket.on('timer:iniciar', (desafioId) => {
      if (papel !== 'ADMIN') {
        socket.emit('timer:erro', { error: 'Só o administrador pode ativar o cronômetro.' });
        return;
      }
      console.log(`[socket] cronômetro ativado por ${socket.id}`);
      io.emit('timer:estado', { ...iniciarCronometro(desafioId), fases: FASES });
    });

    socket.on('timer:reiniciar', () => {
      if (papel !== 'ADMIN') {
        socket.emit('timer:erro', { error: 'Só o administrador pode reiniciar o cronômetro.' });
        return;
      }
      console.log(`[socket] cronômetro reiniciado por ${socket.id}`);
      io.emit('timer:estado', { ...reiniciarCronometro(), fases: FASES });
    });

    socket.on('disconnect', () => {
      console.log(`[socket] cliente desconectado: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io não foi inicializado. Chame initSocket() antes de usar.');
  }
  return io;
}

export function emitTimerEstado(estado) {
  getIO().emit('timer:estado', { ...estado, fases: FASES });
}

// Equipes
export function emitEquipeCreated(equipe) {
  getIO().emit('equipe:created', equipe);
}
export function emitEquipeUpdated(equipe) {
  getIO().emit('equipe:updated', equipe);
}
export function emitEquipeDeleted(equipeId) {
  getIO().emit('equipe:deleted', { id: equipeId });
}

// Desafios — o painel do telão e o dashboard dos participantes escutam
// esses eventos para reagir em tempo real às mudanças de status/rodada.
export function emitDesafioCreated(desafio) {
  getIO().emit('desafio:created', desafio);
}
export function emitDesafioUpdated(desafio) {
  getIO().emit('desafio:updated', desafio);
}
export function emitDesafioDeleted(desafioId) {
  getIO().emit('desafio:deleted', { id: desafioId });
}

// Avaliações — quando uma é registrada, o ranking (rodada/diário/geral)
// pode ter mudado, então o front-end deve buscar o ranking de novo.
export function emitAvaliacaoRegistrada(avaliacao) {
  getIO().emit('avaliacao:registrada', avaliacao);
}

// Ajustes manuais de pontos (ranking geral) — mesmo raciocínio da
// avaliação: avisa todo mundo pra recarregar o ranking.
export function emitRankingAjustado(ajuste) {
  getIO().emit('ranking:ajustado', ajuste);
}

// Cartas bônus
export function emitCartaRegistrada(carta) {
  getIO().emit('carta:registrada', carta);
}

// Quadro estilo Trello — como cada equipe tem seu próprio quadro, avisamos
// qual equipeId mudou pra só quem está vendo aquele quadro recarregar.
export function emitQuadroAtualizado(equipeId) {
  if (!equipeId) return;
  getIO().emit('quadro:atualizado', { equipeId });
}
