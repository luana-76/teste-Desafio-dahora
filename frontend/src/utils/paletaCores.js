// Paleta de cores fixa usada para identificar equipes — cada equipe escolhe
// uma cor ao ser criada, e essa cor é reaproveitada nos desafios que ela
// assume (etiqueta colorida, borda do card, etc).
export const PALETA_CORES = [
  { chave: 'roxo', nome: 'Roxo', hex: '#8b5cf6' },
  { chave: 'azul', nome: 'Azul', hex: '#3b82f6' },
  { chave: 'ciano', nome: 'Ciano', hex: '#22d3ee' },
  { chave: 'rosa', nome: 'Rosa', hex: '#ff5fc0' },
  { chave: 'verde', nome: 'Verde', hex: '#34d399' },
  { chave: 'amarelo', nome: 'Amarelo', hex: '#fbbf24' },
  { chave: 'laranja', nome: 'Laranja', hex: '#fb923c' },
  { chave: 'vermelho', nome: 'Vermelho', hex: '#f87171' },
];

export function corPorChave(chave) {
  return PALETA_CORES.find((c) => c.chave === chave) || PALETA_CORES[0];
}
