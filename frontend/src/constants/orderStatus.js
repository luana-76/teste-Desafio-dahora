export const STATUS_LABELS = {
  PENDENTE: 'A fazer',
  EM_PREPARO: 'Em andamento',
  PRONTO: 'Em revisão',
  ENTREGUE: 'Concluído',
  CANCELADO: 'Cancelado',
};

// Nível de importância da tarefa (armazenado no campo numérico "valor")
export const IMPORTANCE_LABELS = {
  1: 'Baixa',
  2: 'Média',
  3: 'Alta',
};

export const IMPORTANCE_COLOR = {
  1: 'sage',
  2: 'mustard',
  3: 'tomato',
};

// Sequência "feliz" exibida como colunas do painel (cancelado é tratado à parte)
export const STATUS_FLOW = ['PENDENTE', 'EM_PREPARO', 'PRONTO', 'ENTREGUE'];
