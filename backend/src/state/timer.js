// Estado do cronômetro do desafio, compartilhado entre todos os clientes
// conectados via Socket.io. Fica em memória: se o servidor reiniciar, o
// cronômetro volta para o estado "parado" (é um controle de sessão, não
// precisa de persistência em banco).

export const DURACAO_PADRAO = 60 * 60; // 1 hora, em segundos

export const estadoCronometro = {
  duracaoTotal: DURACAO_PADRAO,
  inicioEm: null, // timestamp (Date.now()) de quando foi ativado, ou null se parado
};

export function iniciarCronometro() {
  estadoCronometro.inicioEm = Date.now();
  return estadoCronometro;
}

export function reiniciarCronometro() {
  estadoCronometro.inicioEm = null;
  return estadoCronometro;
}
