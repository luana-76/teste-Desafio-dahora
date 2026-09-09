import OrderCard from './OrderCard';
import { STATUS_LABELS } from '../constants/orderStatus';

export default function OrderColumn({ status, orders, onAdvance, onCancel, onDelete }) {
  return (
    <div className="order-column">
      <h2>
        {STATUS_LABELS[status]} <span className="count">{orders.length}</span>
      </h2>
      <div className="order-column-list">
        {orders.length === 0 && <p className="empty">Nenhuma tarefa</p>}
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onAdvance={onAdvance}
            onCancel={onCancel}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
