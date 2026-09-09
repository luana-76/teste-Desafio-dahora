// Fluxo padrão de status de um pedido
export const ORDER_STATUSES = ['PENDENTE', 'EM_PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO'];

// Sequência "feliz" (sem cancelamento) usada para avançar o pedido
export const STATUS_FLOW = ['PENDENTE', 'EM_PREPARO', 'PRONTO', 'ENTREGUE'];

export function isValidStatus(status) {
  return ORDER_STATUSES.includes(status);
}

export function nextStatus(current) {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}
