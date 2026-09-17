import { useState } from 'react';
import OrderCard from './OrderCard';
import QuickAddCard from './QuickAddCard';
import { STATUS_LABELS } from '../constants/orderStatus';

export default function OrderColumn({ status, orders, onEdit, onDelete, onCreate, onMove }) {
  const [adicionando, setAdicionando] = useState(false);
  const [arrastandoSobre, setArrastandoSobre] = useState(false);

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDragEnter(e) {
    e.preventDefault();
    setArrastandoSobre(true);
  }

  function handleDragLeave(e) {
    // Só desliga o destaque quando o mouse realmente sai da coluna
    // (não a cada vez que passa por cima de um cartão filho).
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setArrastandoSobre(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setArrastandoSobre(false);
    try {
      const { id, status: statusOrigem } = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (id && statusOrigem !== status) {
        onMove?.(id, status);
      }
    } catch {
      // dataTransfer inesperado (ex: arquivo arrastado por engano) — ignora
    }
  }

  return (
    <div
      className={`order-column ${arrastandoSobre ? 'order-column-arrastando-sobre' : ''}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="order-column-header">
        <h2>
          {STATUS_LABELS[status]} <span className="count">{orders.length}</span>
        </h2>
        <button type="button" className="order-column-menu" aria-label="Mais opções" title="Mais opções">
          ⋯
        </button>
      </div>

      <div className="order-column-list">
        {orders.length === 0 && !adicionando && <p className="empty">Nenhuma tarefa</p>}
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {adicionando && <QuickAddCard onCreate={onCreate} onClose={() => setAdicionando(false)} />}
      </div>

      {onCreate && !adicionando && (
        <button type="button" className="order-column-add" onClick={() => setAdicionando(true)}>
          + Adicionar um cartão
        </button>
      )}
    </div>
  );
}
