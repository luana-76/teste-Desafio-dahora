// Ciclo de vida de um desafio — seção 19 do documento:
// 🔒 Bloqueado -> 🟢 Disponível -> 🟡 Em andamento -> 🔵 Em avaliação -> ✅ Finalizado
export const DESAFIO_STATUSES = ['BLOQUEADO', 'DISPONIVEL', 'EM_ANDAMENTO', 'EM_AVALIACAO', 'FINALIZADO'];

// Transição válida a partir de cada status (só é possível avançar; voltar
// uma etapa por engano é feito corrigindo manualmente via PATCH /desafios/:id).
export const PROXIMO_STATUS = {
  BLOQUEADO: 'DISPONIVEL',
  DISPONIVEL: 'EM_ANDAMENTO',
  EM_ANDAMENTO: 'EM_AVALIACAO',
  EM_AVALIACAO: 'FINALIZADO',
  FINALIZADO: null,
};

export function isValidStatus(status) {
  return DESAFIO_STATUSES.includes(status);
}

export function podeAvancarPara(statusAtual, statusDestino) {
  return PROXIMO_STATUS[statusAtual] === statusDestino;
}
