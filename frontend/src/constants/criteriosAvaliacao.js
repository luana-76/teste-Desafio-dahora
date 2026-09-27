// Critérios de avaliação e seus tetos — seção 6 do documento. Espelha
// backend/src/utils/criteriosAvaliacao.js.
export const CRITERIOS = [
  { chave: 'conclusao', label: 'Conclusão', max: 50 },
  { chave: 'criatividade', label: 'Criatividade', max: 20 },
  { chave: 'inovacao', label: 'Inovação', max: 20 },
  { chave: 'apresentacao', label: 'Apresentação', max: 10 },
  { chave: 'conclusaoRapida', label: 'Conclusão em menos tempo', max: 40 },
  { chave: 'usoIA', label: 'Utilização responsável de IA', max: 30 },
];

export const PONTUACAO_MAXIMA = CRITERIOS.reduce((soma, c) => soma + c.max, 0); // 170
