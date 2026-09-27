// Ciclo de vida do desafio — seção 19 do documento.
export const DESAFIO_STATUS_FLOW = ['BLOQUEADO', 'DISPONIVEL', 'EM_ANDAMENTO', 'EM_AVALIACAO', 'FINALIZADO'];

export const DESAFIO_STATUS_LABELS = {
  BLOQUEADO: 'Bloqueado',
  DISPONIVEL: 'Disponível',
  EM_ANDAMENTO: 'Em andamento',
  EM_AVALIACAO: 'Em avaliação',
  FINALIZADO: 'Finalizado',
};

export const DESAFIO_STATUS_ICON = {
  BLOQUEADO: '🔒',
  DISPONIVEL: '🟢',
  EM_ANDAMENTO: '🟡',
  EM_AVALIACAO: '🔵',
  FINALIZADO: '✅',
};

// Ação (verbo) que leva do status atual para o próximo, e o rótulo do
// botão correspondente — seção 3 (fluxo da rodada).
export const PROXIMA_ACAO = {
  BLOQUEADO: { acao: 'liberar', label: 'Liberar desafio' },
  DISPONIVEL: { acao: 'iniciar', label: 'Iniciar (ativa o cronômetro)' },
  EM_ANDAMENTO: { acao: 'encerrar', label: 'Encerrar / enviar p/ avaliação' },
  EM_AVALIACAO: { acao: 'finalizar', label: 'Finalizar' },
  FINALIZADO: null,
};

// Dias da oficina — seção 10.
export const DIAS = [
  { dia: 1, titulo: 'Dia 1', categoria: 'IA, Criatividade e Soluções Digitais' },
  { dia: 2, titulo: 'Dia 2', categoria: 'Maker, Robótica e IoT' },
  { dia: 3, titulo: 'Dia 3', categoria: 'Dados, Programação e Inovação' },
];
