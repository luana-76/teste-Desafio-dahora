import { useState } from 'react';
import { IMPORTANCE_LABELS } from '../constants/orderStatus';

export default function QuickAddCard({ onCreate, onClose }) {
  const [cliente, setCliente] = useState('');
  const [itens, setItens] = useState('');
  const [valor, setValor] = useState('2');
  const [observacao, setObservacao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cliente.trim() || !itens.trim()) return;

    setEnviando(true);
    setErro('');
    try {
      await onCreate({ cliente, itens, valor: Number(valor) || 1, observacao });
      // Mantém o nome preenchido — facilita adicionar vários cartões seguidos,
      // igual o comportamento do "Add card" do Trello.
      setItens('');
      setObservacao('');
    } catch {
      setErro('Não foi possível criar o cartão. Confira se o backend está rodando e acessível.');
    } finally {
      setEnviando(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') onClose();
  }

  return (
    <form className="quick-add-card" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <textarea
        placeholder="O que você está fazendo?"
        value={itens}
        onChange={(e) => setItens(e.target.value)}
        rows={2}
        autoFocus
        required
      />
      <input
        placeholder="Seu nome"
        value={cliente}
        onChange={(e) => setCliente(e.target.value)}
        required
      />
      <div className="quick-add-card-linha">
        <select value={valor} onChange={(e) => setValor(e.target.value)} title="Nível de importância">
          {Object.entries(IMPORTANCE_LABELS).map(([nivel, label]) => (
            <option key={nivel} value={nivel}>
              {label}
            </option>
          ))}
        </select>
        <input
          placeholder="Previsão (ex: 15/09)"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />
      </div>
      {erro && <p className="quick-add-card-erro">{erro}</p>}
      <div className="quick-add-card-actions">
        <button type="submit" disabled={enviando}>
          {enviando ? 'Adicionando…' : 'Adicionar cartão'}
        </button>
        <button type="button" className="quick-add-card-fechar" onClick={onClose} aria-label="Cancelar">
          ✕
        </button>
      </div>
    </form>
  );
}
