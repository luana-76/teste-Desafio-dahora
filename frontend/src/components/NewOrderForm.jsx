import { useState } from 'react';
import { IMPORTANCE_LABELS } from '../constants/orderStatus';

export default function NewOrderForm({ onCreate }) {
  const [cliente, setCliente] = useState('');
  const [itens, setItens] = useState('');
  const [valor, setValor] = useState('2');
  const [observacao, setObservacao] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cliente.trim() || !itens.trim()) return;

    setEnviando(true);
    try {
      await onCreate({ cliente, itens, valor: Number(valor) || 1, observacao });
      setCliente('');
      setItens('');
      setValor('2');
      setObservacao('');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="new-order-form" onSubmit={handleSubmit}>
      <input
        placeholder="Seu nome"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
        required
      />
      <input
        placeholder="O que você está fazendo"
        value={itens}
        onChange={(e) => setItens(e.target.value)}
        required
      />
      <select value={valor} onChange={(e) => setValor(e.target.value)} title="Nível de importância">
        {Object.entries(IMPORTANCE_LABELS).map(([nivel, label]) => (
          <option key={nivel} value={nivel}>
            Importância: {label}
          </option>
        ))}
      </select>
      <input
        placeholder="Previsão de entrega (ex: 15/09)"
        value={observacao}
        onChange={(e) => setObservacao(e.target.value)}
      />
      <button type="submit" disabled={enviando}>
        {enviando ? 'Enviando...' : '+ Nova tarefa'}
      </button>
    </form>
  );
}
