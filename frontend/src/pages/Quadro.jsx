import { useEffect, useMemo, useState } from 'react';
import socket from '../services/socket';
import { usuarioAtual } from '../services/auth';
import { listarEquipes } from '../services/equipes';
import { PALETA_CORES, corPorChave } from '../utils/paletaCores';
import {
  buscarQuadro,
  criarCartao,
  editarCartao,
  moverCartao,
  excluirCartao,
} from '../services/quadro';

const icones = {
  voltar: '←',
  estrela: '☆',
  menu: '•••',
  filtro: '⌕',
  fechar: '×',
  descricao: '☷',
  etiqueta: '▰',
  membros: '♙',
};

export default function Quadro() {
  const usuario = usuarioAtual();
  const podeEscolherEquipe = usuario?.papel === 'ADMIN' || usuario?.papel === 'MONITOR';
  const [equipes, setEquipes] = useState([]);
  const [equipeId, setEquipeId] = useState(usuario?.equipeId || '');
  const [colunas, setColunas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [arrastandoId, setArrastandoId] = useState(null);
  const [alvoArrasto, setAlvoArrasto] = useState(null);
  const [busca, setBusca] = useState('');
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [filtroEtiqueta, setFiltroEtiqueta] = useState('');
  const [cartaoSelecionado, setCartaoSelecionado] = useState(null);
  const [menuQuadro, setMenuQuadro] = useState(false);

  const equipeAtual = equipes.find((e) => e.id === equipeId);
  const nomeQuadro = equipeAtual?.nome ? `Quadro ${equipeAtual.nome}` : 'Quadro da equipe';

  useEffect(() => {
    if (!podeEscolherEquipe) return;
    listarEquipes().then((lista) => {
      setEquipes(lista);
      if (!equipeId && lista[0]) setEquipeId(lista[0].id);
    }).catch(() => setErro('Não foi possível carregar as equipes.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function carregar(silencioso = false) {
    if (!equipeId) {
      setCarregando(false);
      return;
    }
    if (!silencioso) setCarregando(true);
    buscarQuadro(equipeId)
      .then((data) => { setColunas(data); setErro(null); })
      .catch((err) => setErro(err.response?.data?.error || 'Não foi possível carregar o quadro.'))
      .finally(() => setCarregando(false));
  }

  useEffect(() => { carregar(); }, [equipeId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function aoAtualizar({ equipeId: idAtualizado }) {
      if (idAtualizado === equipeId) carregar(true);
    }
    socket.on('quadro:atualizado', aoAtualizar);
    return () => socket.off('quadro:atualizado', aoAtualizar);
  }, [equipeId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setCartaoSelecionado(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  async function handleNovoCartao(colunaId, titulo, cor) {
    if (!titulo.trim()) return;
    try {
      await criarCartao(colunaId, equipeId, { titulo: titulo.trim(), cor });
      carregar(true);
    } catch (err) { setErro(err.response?.data?.error || err.message); }
  }

  async function handleEditarCartao(cartao, campos) {
    try {
      await editarCartao(cartao.id, equipeId, campos);
      const atualizado = { ...cartao, ...campos };
      setCartaoSelecionado(atualizado);
      carregar(true);
    } catch (err) { setErro(err.response?.data?.error || err.message); }
  }

  async function handleExcluirCartao(cartao) {
    try {
      await excluirCartao(cartao.id, equipeId);
      setCartaoSelecionado(null);
      carregar(true);
    } catch (err) { setErro(err.response?.data?.error || err.message); }
  }

  function iniciarArrasto(id) {
    setArrastandoId(id);
    setAlvoArrasto(null);
  }

  function indicarAlvo(colunaId, index) {
    setAlvoArrasto({ colunaId, index });
  }

  async function soltarCartao(colunaDestinoId, posicaoPadrao) {
    const id = arrastandoId;
    const alvo = alvoArrasto;
    setArrastandoId(null);
    setAlvoArrasto(null);
    if (!id) return;
    const colunaId = alvo?.colunaId ?? colunaDestinoId;
    const posicao = alvo?.colunaId === colunaDestinoId ? alvo.index : posicaoPadrao;
    try {
      await moverCartao(id, equipeId, { colunaId, posicao });
      carregar(true);
    } catch (err) { setErro(err.response?.data?.error || err.message); }
  }

  const colunasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return colunas.map((c) => ({
      ...c,
      cartoes: c.cartoes.filter((card) => {
        const bateBusca = !termo || `${card.titulo} ${card.descricao || ''}`.toLowerCase().includes(termo);
        const bateEtiqueta = !filtroEtiqueta || card.cor === filtroEtiqueta;
        return bateBusca && bateEtiqueta;
      }),
    }));
  }, [colunas, busca, filtroEtiqueta]);

  if (!podeEscolherEquipe && !usuario?.equipeId) {
    return (
      <div className="dashboard quadro-page">
        <div className="trello-empty-state">
          <div className="trello-empty-icon">▦</div>
          <h1>Você ainda não está em uma equipe</h1>
          <p>Entre em <a href="#/equipes">Equipes</a> para participar de uma equipe e usar o quadro.</p>
        </div>
      </div>
    );
  }

  return (
    
    <div>
      {erro && <div className="trello-error">{erro}<button onClick={() => setErro(null)}>×</button></div>}

      {carregando ? (
        <div className="trello-loading">Carregando quadro...</div>
      ) : (
        <div className="trello-canvas">
          <div className="trello-lists trello-lists-fixo">
            {colunasFiltradas.map((coluna) => (
              <ColunaTrello
                key={coluna.id}
                coluna={coluna}
                arrastandoId={arrastandoId}
                alvoArrasto={alvoArrasto}
                onDragStart={iniciarArrasto}
                onIndicarAlvo={indicarAlvo}
                onSoltar={soltarCartao}
                onNovoCartao={(titulo, cor) => handleNovoCartao(coluna.id, titulo, cor)}
                onAbrirCartao={setCartaoSelecionado}
              />
            ))}
          </div>
        </div>
      )}

      {cartaoSelecionado && (
        <ModalCartao
          cartao={cartaoSelecionado}
          colunas={colunas}
          onClose={() => setCartaoSelecionado(null)}
          onSalvar={(campos) => handleEditarCartao(cartaoSelecionado, campos)}
          onExcluir={() => handleExcluirCartao(cartaoSelecionado)}
          equipeNome={equipeAtual?.nome}
        />
      )}
    </div>
  );
}

function ColunaTrello({ coluna, arrastandoId, alvoArrasto, onDragStart, onIndicarAlvo, onSoltar, onNovoCartao, onAbrirCartao }) {
  const [compondo, setCompondo] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [cor, setCor] = useState(null);
  const sobre = arrastandoId && alvoArrasto?.colunaId === coluna.id;

  function adicionar(e) {
    e.preventDefault();
    if (!titulo.trim()) return;
    onNovoCartao(titulo, cor);
    setTitulo(''); setCor(null); setCompondo(false);
  }

  return (
    <div className="trello-list-wrap">
      <section
        className={`trello-list ${sobre ? 'drag-over' : ''}`}
        onDragOver={(e) => { if (!arrastandoId) return; e.preventDefault(); onIndicarAlvo(coluna.id, coluna.cartoes.length); }}
        onDrop={(e) => { e.preventDefault(); onSoltar(coluna.id, coluna.cartoes.length); }}
      >
        <header className="trello-list-header">
          <span className="trello-list-name trello-list-name-fixo">{coluna.nome}</span>
          <span className="trello-list-count">{coluna.cartoes.length}</span>
        </header>

        <div className="trello-cards">
          {coluna.cartoes.map((card, index) => (
            <CartaoTrello
              key={card.id}
              card={card}
              arrastando={arrastandoId === card.id}
              antes={sobre && alvoArrasto?.index === index}
              depois={sobre && alvoArrasto?.index === index + 1 && index + 1 === coluna.cartoes.length}
              onDragStart={() => onDragStart(card.id)}
              onDragOver={(e) => {
                if (!arrastandoId) return;
                e.preventDefault(); e.stopPropagation();
                const r = e.currentTarget.getBoundingClientRect();
                onIndicarAlvo(coluna.id, e.clientY < r.top + r.height / 2 ? index : index + 1);
              }}
              onDrop={(e) => {
                e.preventDefault(); e.stopPropagation();
                const r = e.currentTarget.getBoundingClientRect();
                onSoltar(coluna.id, e.clientY < r.top + r.height / 2 ? index : index + 1);
              }}
              onDragEnd={() => { onDragStart(null); onIndicarAlvo(null, null); }}
              onAbrir={() => onAbrirCartao(card)}
            />
          ))}
          {coluna.cartoes.length === 0 && <div className="trello-drop-empty">{sobre ? 'Solte o cartão aqui' : 'Nenhum cartão ainda'}</div>}
        </div>

        {compondo ? (
          <form className="trello-card-composer" onSubmit={adicionar}>
            <input autoFocus value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Digite o título do cartão..." />
            <LabelPicker value={cor} onChange={setCor} />
            <div className="trello-form-actions"><button type="submit">Adicionar cartão</button><button type="button" onClick={() => setCompondo(false)}>×</button></div>
          </form>
        ) : (
          <button type="button" className="trello-add-card" onClick={() => setCompondo(true)}>＋ Adicionar um cartão</button>
        )}
      </section>
    </div>
  );
}

function CartaoTrello({ card, arrastando, antes, depois, onDragStart, onDragOver, onDrop, onDragEnd, onAbrir }) {
  const cor = card.cor ? corPorChave(card.cor) : null;
  return (
    <>
      {antes && <div className="trello-drop-line" />}
      <article
        className={`trello-card ${arrastando ? 'is-dragging' : ''}`}
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        onClick={onAbrir}
      >
        {cor && <span className="trello-card-label" style={{ background: cor.hex }} title={cor.nome} />}
        {card.desafio && (
          <span className="trello-card-desafio">Desafio {card.desafio.numero} · Dia {card.desafio.dia}</span>
        )}
        <div className="trello-card-title">{card.titulo}</div>
        {card.descricao && <div className="trello-card-footer"><span>{icones.descricao}</span></div>}
      </article>
      {depois && <div className="trello-drop-line" />}
    </>
  );
}

function LabelPicker({ value, onChange }) {
  return (
    <div className="trello-label-picker">
      <span>Etiqueta</span>
      <div>
        <button type="button" className={`label-none ${!value ? 'selected' : ''}`} onClick={() => onChange(null)}>×</button>
        {PALETA_CORES.map((c) => (
          <button key={c.chave} type="button" className={value === c.chave ? 'selected' : ''} style={{ background: c.hex }} title={c.nome} onClick={() => onChange(c.chave)} />
        ))}
      </div>
    </div>
  );
}

function ModalCartao({ cartao, colunas, onClose, onSalvar, onExcluir, equipeNome }) {
  const [titulo, setTitulo] = useState(cartao.titulo);
  const [descricao, setDescricao] = useState(cartao.descricao || '');
  const [cor, setCor] = useState(cartao.cor || null);
  const coluna = colunas.find((c) => c.cartoes.some((x) => x.id === cartao.id)) || colunas.find((c) => c.id === cartao.colunaId);

  function salvar() {
    if (!titulo.trim()) return;
    onSalvar({ titulo: titulo.trim(), descricao, cor });
  }

  return (
    <div className="trello-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="trello-modal" role="dialog" aria-modal="true">
        <button className="trello-modal-close" onClick={onClose}>{icones.fechar}</button>
        <div className="trello-modal-main">
          <div className="trello-modal-icon">▣</div>
          <div className="trello-modal-content">
            <input className="trello-modal-title" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            <p className="trello-modal-subtitle">em <strong>{coluna?.nome || 'lista'}</strong>{equipeNome ? ` · ${equipeNome}` : ''}</p>
            {cartao.desafio && (
              <p className="trello-modal-desafio">
                ▣ Vinculado ao <strong>Desafio {cartao.desafio.numero}</strong> (dia {cartao.desafio.dia}) — {cartao.desafio.titulo}
              </p>
            )}

            <h3>Descrição</h3>
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Adicione uma descrição mais detalhada..." />
            <h3>Etiquetas</h3>
            <LabelPicker value={cor} onChange={setCor} />

            <div className="trello-modal-actions">
              <button type="button" className="trello-save" onClick={salvar}>Salvar alterações</button>
              <button type="button" className="trello-delete" onClick={() => { if (window.confirm('Excluir este cartão?')) onExcluir(); }}>Excluir cartão</button>
            </div>
          </div>
        </div>
        <aside className="trello-modal-side">
          <strong>Adicionar ao cartão</strong>
          <button type="button" onClick={() => document.querySelector('.trello-modal-content textarea')?.focus()}>☷ Descrição</button>
          <button type="button" onClick={() => document.querySelector('.trello-modal-content .trello-label-picker button')?.focus()}>▰ Etiqueta</button>
          <span className="trello-side-note">As alterações são salvas no quadro da equipe.</span>
        </aside>
      </div>
    </div>
  );
}
