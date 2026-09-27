// Estado do cronômetro do desafio, compartilhado entre todos os clientes
// conectados via Socket.io. Fica em memória: se o servidor reiniciar, o
// cronômetro volta para o estado "parado" (é um controle de sessão, não
// precisa de persistência em banco).
//
// Metodologia — seção 4 do documento: cada desafio de 60 minutos é
// dividido em 3 fases (10 min de explicação + 40 min de execução + 10 min
// de apresentação). As fases abaixo são só uma referência de tempo — quem
// calcula em qual fase o cronômetro está agora é `faseAtual()`, a partir
// dos segundos decorridos desde o início.

export const DURACAO_PADRAO = 60 * 60; // 1 hora, em segundos

export const FASES = [
  { nome: 'EXPLICACAO', label: 'Explicação', duracao: 10 * 60 },
  { nome: 'EXECUCAO', label: 'Execução', duracao: 40 * 60 },
  { nome: 'APRESENTACAO', label: 'Apresentação', duracao: 10 * 60 },
];

export const estadoCronometro = {
  duracaoTotal: DURACAO_PADRAO,
  inicioEm: null, // timestamp (Date.now()) de quando foi ativado, ou null se parado
  desafioId: null, // qual desafio (rodada) este cronômetro está cronometrando
};

// Dado quantos segundos já se passaram desde o início, devolve a fase
// atual (ou null se o cronômetro ainda não foi iniciado ou já encerrou).
export function faseAtual(segundosDecorridos) {
  if (segundosDecorridos == null || segundosDecorridos < 0) return null;
  let acumulado = 0;
  for (const fase of FASES) {
    acumulado += fase.duracao;
    if (segundosDecorridos < acumulado) return fase.nome;
  }
  return null; // tempo encerrado
}

export function iniciarCronometro(desafioId = null) {
  estadoCronometro.inicioEm = Date.now();
  estadoCronometro.desafioId = desafioId;
  return estadoCronometro;
}

export function reiniciarCronometro() {
  estadoCronometro.inicioEm = null;
  estadoCronometro.desafioId = null;
  return estadoCronometro;
}
