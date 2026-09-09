import { Server } from 'socket.io';
import { estadoCronometro, iniciarCronometro, reiniciarCronometro } from './state/timer.js';

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
    // ativado) ou parado — e se sincroniza com todo mundo automaticamente.
    socket.emit('timer:estado', estadoCronometro);

    // Qualquer computador conectado pode ativar o cronômetro. Quando isso
    // acontece, transmitimos o novo estado para TODOS os clientes (inclusive
    // quem ativou), e cada um passa a contar a partir do mesmo instante.
    socket.on('timer:iniciar', () => {
      console.log(`[socket] cronômetro ativado por ${socket.id}`);
      io.emit('timer:estado', iniciarCronometro());
    });

    socket.on('timer:reiniciar', () => {
      console.log(`[socket] cronômetro reiniciado por ${socket.id}`);
      io.emit('timer:estado', reiniciarCronometro());
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

// Helpers para emitir eventos de domínio relacionados a pedidos
export function emitOrderCreated(order) {
  getIO().emit('order:created', order);
}

export function emitOrderUpdated(order) {
  getIO().emit('order:updated', order);
}

export function emitOrderDeleted(orderId) {
  getIO().emit('order:deleted', { id: orderId });
}
