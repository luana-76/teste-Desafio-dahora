import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import OrderColumn from '../components/OrderColumn';
import { STATUS_FLOW } from '../constants/orderStatus';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [connected, setConnected] = useState(socket.connected);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api
      .get('/orders')
      .then((res) => {
        // Proteção: se a API responder algo que não é uma lista (ex: URL
        // errada apontando para outro serviço, HTML de erro, etc.), não
        // deixamos isso quebrar a tela inteira.
        if (Array.isArray(res.data)) {
          setOrders(res.data);
        } else {
          console.error('Resposta inesperada de GET /orders:', res.data);
          setErro('O servidor respondeu algo inesperado. Confira a URL configurada em VITE_API_URL.');
        }
      })
      .catch(() => setErro('Não foi possível carregar os pedidos. Verifique se o backend está rodando.'))
      .finally(() => setCarregando(false));

    function handleCreated(order) {
      setOrders((prev) => [order, ...prev]);
    }
    function handleUpdated(updated) {
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    }
    function handleDeleted({ id }) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
    }
    function handleConnect() {
      setConnected(true);
    }
    function handleDisconnect() {
      setConnected(false);
    }

    socket.on('order:created', handleCreated);
    socket.on('order:updated', handleUpdated);
    socket.on('order:deleted', handleDeleted);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('order:created', handleCreated);
      socket.off('order:updated', handleUpdated);
      socket.off('order:deleted', handleDeleted);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  const createOrder = useCallback(async (data) => {
    await api.post('/orders', data);
    // A atualização da lista chega via evento "order:created" do socket
  }, []);

  const editOrder = useCallback(async (id, data) => {
    await api.patch(`/orders/${id}`, data);
  }, []);

  const advanceOrder = useCallback(async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status });
  }, []);

  const deleteOrder = useCallback(async (id) => {
    await api.delete(`/orders/${id}`);
  }, []);

  const columns = STATUS_FLOW;

  return (
    <div className="dashboard" id="topo">
      <header>
        <h1>Painel do Desafio</h1>
        <span className={`status-dot ${connected ? 'online' : 'offline'}`}>
          {connected ? '● Ao vivo' : '● Desconectado'}
        </span>
      </header>

      {erro && <p className="error-banner">{erro}</p>}
      {carregando ? (
        <p className="loading">Carregando pedidos...</p>
      ) : (
        <div className="board-canvas">
          <div className="board">
            {columns.map((status) => (
              <div id={`coluna-${status}`} key={status} className="board-slot">
                <OrderColumn
                  status={status}
                  orders={orders.filter((o) => o.status === status)}
                  onEdit={editOrder}
                  onDelete={deleteOrder}
                  onCreate={status === 'PENDENTE' ? createOrder : undefined}
                  onMove={advanceOrder}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
