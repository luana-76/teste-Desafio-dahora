import { STATUS_LABELS, STATUS_FLOW, IMPORTANCE_LABELS, IMPORTANCE_COLOR } from '../constants/orderStatus';

export default function OrderCard({ order, onAdvance, onCancel, onDelete }) {
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = STATUS_FLOW[currentIndex + 1];
  const canAdvance = Boolean(nextStatus) && order.status !== 'CANCELADO';
  const canCancel = order.status !== 'ENTREGUE' && order.status !== 'CANCELADO';

  const nivelImportancia = Number(order.valor) || 1;
  const importanciaLabel = IMPORTANCE_LABELS[nivelImportancia] || IMPORTANCE_LABELS[1];
  const importanciaCor = IMPORTANCE_COLOR[nivelImportancia] || IMPORTANCE_COLOR[1];

  return (
    <div className={`order-card status-${order.status.toLowerCase()}`}>
      <div className="order-card-header">
        <strong>{order.cliente}</strong>
        <span className={`importance-badge importance-${importanciaCor}`}>
          {importanciaLabel}
        </span>
      </div>
      <p className="order-items">💻 {order.itens}</p>
      {order.observacao && <p className="order-note">📅 Previsão de entrega: {order.observacao}</p>}
      <div className="order-actions">
        {canAdvance && (
          <button onClick={() => onAdvance(order.id, nextStatus)}>
            Avançar → {STATUS_LABELS[nextStatus]}
          </button>
        )}
        {canCancel && (
          <button className="btn-cancel" onClick={() => onCancel(order.id)}>
            Cancelar
          </button>
        )}
        <button className="btn-delete" onClick={() => onDelete(order.id)}>
          Excluir
        </button>
      </div>
    </div>
  );
}
