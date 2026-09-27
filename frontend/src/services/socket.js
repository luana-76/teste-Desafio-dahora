import { io } from 'socket.io-client';

const CHAVE_SESSAO = 'desafio-dahora:sessao';

// O socket manda o papel do usuário logado a cada conexão (mesma ideia dos
// headers x-participante-id/x-papel usados nas chamadas HTTP — ver
// services/api.js e backend/src/utils/autorizacao.js). É assim que o
// backend sabe, por exemplo, que só o Administrador pode soltar o
// cronômetro (evento "timer:iniciar"/"timer:reiniciar").
function authAtual(callback) {
  try {
    const sessao = JSON.parse(localStorage.getItem(CHAVE_SESSAO) || 'null');
    callback({ participanteId: sessao?.id || null, papel: sessao?.papel || 'PARTICIPANTE' });
  } catch {
    callback({ participanteId: null, papel: 'PARTICIPANTE' });
  }
}

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3333', {
  autoConnect: true,
  auth: authAtual,
});

// Chamado depois de entrar/cadastrar/sair, pra reconectar o socket já
// levando o papel atualizado (senão ele ficaria preso ao papel de quando a
// página carregou, antes do login).
export function reconectarSocket() {
  socket.disconnect();
  socket.connect();
}

export default socket;
