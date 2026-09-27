// Sistema de pontuação — seção 6 do documento.
// Total máximo por desafio: 170 pontos.
export const CRITERIOS = {
  conclusao: { label: 'Conclusão', max: 50 },
  criatividade: { label: 'Criatividade', max: 20 },
  inovacao: { label: 'Inovação', max: 20 },
  apresentacao: { label: 'Apresentação', max: 10 },
  conclusaoRapida: { label: 'Conclusão em menos tempo', max: 40 },
  usoIA: { label: 'Utilização responsável de IA', max: 30 },
};

export const PONTUACAO_MAXIMA = Object.values(CRITERIOS).reduce((soma, c) => soma + c.max, 0); // 170

// Valida e normaliza os critérios recebidos, lançando erro 400 se algum
// vier fora da faixa [0, máximo] daquele critério.
export function validarCriterios(dados = {}) {
  const valores = {};
  for (const [chave, { label, max }] of Object.entries(CRITERIOS)) {
    const bruto = dados[chave];
    const numero = bruto === undefined || bruto === null || bruto === '' ? 0 : Number(bruto);

    if (!Number.isFinite(numero) || numero < 0 || numero > max) {
      const err = new Error(`Critério "${label}" deve ser um número entre 0 e ${max}.`);
      err.status = 400;
      throw err;
    }
    valores[chave] = numero;
  }
  return valores;
}

export function calcularTotal(valores) {
  return Object.keys(CRITERIOS).reduce((soma, chave) => soma + (valores[chave] || 0), 0);
}
