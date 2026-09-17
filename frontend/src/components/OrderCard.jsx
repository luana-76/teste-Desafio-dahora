import { useState } from 'react';
import { IMPORTANCE_LABELS, IMPORTANCE_COLOR } from '../constants/orderStatus';
import { iniciais, corAvatar } from '../utils/avatar';

export default function OrderCard({ order, onEdit, onDelete }) {
  const [arrastando, setArrastando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [cliente, setCliente] = useState(order.cliente);
  const [itens, setItens] = useState(order.itens);
  const [valor, setValor] = useState(String(order.valor || 1));
  const [observacao, setObservacao] = useState(order.observacao || '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const nivelImportancia = Number(order.valor) || 1;
  const importanciaLabel = IMPORTANCE_LABELS[nivelImportancia] || IMPORTANCE_LABELS[1];
  const importanciaCor = IMPORTANCE_COLOR[nivelImportancia] || IMPORTANCE_COLOR[1];

  function handleDragStart(e) {
    // Manda o id do cartão + a fase de origem, pra coluna de destino
    // saber se ele realmente mudou de fase ao ser solto.
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: order.id, status: order.status }));
    e.dataTransfer.effectAllowed = 'move';
    setArrastando(true);
  }

  function handleDragEnd() {
    setArrastando(false);
  }

  function abrirEdicao() {
    setCliente(order.cliente);
    setItens(order.itens);
    setValor(String(order.valor || 1));
    setObservacao(order.observacao || '');
    setErro('');
    setEditando(true);
  }

  async function handleSalvar(e) {
    e.preventDefault();
    if (!cliente.trim() || !itens.trim()) return;

    setSalvando(true);
    setErro('');
    try {
      await onEdit(order.id, { cliente, itens, valor: Number(valor) || 1, observacao });
      setEditando(false);
    } catch {
      setErro('Não foi possível salvar as alterações. Confira se o backend está rodando.');
    } finally {
      setSalvando(false);
    }
  }

  if (editando) {
    return (
      <form className="order-card order-card-edit" onSubmit={handleSalvar}>
        <textarea value={itens} onChange={(e) => setItens(e.target.value)} rows={2} autoFocus required />
        <input value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Seu nome" required />
        <div className="quick-add-card-linha">
          <select value={valor} onChange={(e) => setValor(e.target.value)} title="Nível de importância">
            {Object.entries(IMPORTANCE_LABELS).map(([nivel, label]) => (
              <option key={nivel} value={nivel}>
                {label}
              </option>
            ))}
          </select>
          <input
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Previsão (ex: 15/09)"
          />
        </div>
        {erro && <p className="quick-add-card-erro">{erro}</p>}
        <div className="quick-add-card-actions">
          <button type="submit" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
          <button type="button" className="quick-add-card-fechar" onClick={() => setEditando(false)} aria-label="Cancelar">
            ✕
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      className={`order-card status-${order.status.toLowerCase()} ${arrastando ? 'order-card-arrastando' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <span className={`order-card-label importance-${importanciaCor}`} title={`Importância: ${importanciaLabel}`} />

      <p className="order-items">{order.itens}</p>

      <div className="order-card-meta">
        {order.observacao && (
          <span className="order-card-chip" title="Previsão de entrega">
            📅 {order.observacao}
          </span>
        )}
        <span className={`order-card-chip importance-${importanciaCor}`}>{importanciaLabel}</span>
      </div>

      <div className="order-card-footer">
        <span className="order-card-cliente">{order.cliente}</span>
        <span className={`order-card-avatar cor-${corAvatar(order.cliente)}`} title={order.cliente}>
          {iniciais(order.cliente)}
        </span>
      </div>

      <div className="order-actions">
        <button onClick={abrirEdicao}>Editar</button>
        <button className="btn-delete" onClick={() => onDelete(order.id)}>
          Excluir
        </button>
      </div>
    </div>
  );
}
