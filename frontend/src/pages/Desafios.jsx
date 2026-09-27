import { useEffect, useMemo, useState } from 'react';
import socket from '../services/socket';
import { usuarioAtual } from '../services/auth';
import {
  listarDesafios,
  criarDesafio,
  atualizarDesafio,
  liberarDesafio,
  iniciarDesafio,
  encerrarDesafio,
  finalizarDesafio,
  excluirDesafio,
} from '../services/desafios';
import { listarEquipes } from '../services/equipes';
import { listarAvaliacoes, registrarAvaliacao } from '../services/avaliacoes';
import { listarCartas, registrarCarta, TIPOS_CARTA } from '../services/cartas';
import {
  DESAFIO_STATUS_FLOW,
  DESAFIO_STATUS_ICON,
  DESAFIO_STATUS_LABELS,
  PROXIMA_ACAO,
  DIAS,
} from '../constants/desafioStatus';
import { CRITERIOS, PONTUACAO_MAXIMA } from '../constants/criteriosAvaliacao';

export default function Desafios() {
  const usuario = usuarioAtual();
  const podeGerenciar = usuario?.papel === 'ADMIN';
  const podeAvaliar = usuario?.papel === 'ADMIN' || usuario?.papel === 'MONITOR';

  const [desafios, setDesafios] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [diaAtivo, setDiaAtivo] = useState(1);
  const [visualizacao, setVisualizacao] = useState('kanban'); // 'kanban' | 'lista'
  const [desafioAberto, setDesafioAberto] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [cartas, setCartas] = useState([]);
  const [formAberto, setFormAberto] = useState(false);
  const [erro, setErro] = useState(null);
  const [novo, setNovo] = useState({ numero: '', titulo: '', descricao: '', categoria: '', instrucoes: '', dia: 1 });

  function carregar() {
    Promise.all([listarDesafios(), listarEquipes()])
      .then(([listaDesafios, listaEquipes]) => {
        setDesafios(listaDesafios);
        setEquipes(listaEquipes);
      })
      .catch(() => setErro('Não foi possível carregar os desafios. Verifique se o backend está rodando.'));
  }

  useEffect(() => {
    carregar();
    socket.on('desafio:created', carregar);
    socket.on('desafio:updated', carregar);
    socket.on('desafio:deleted', carregar);
    socket.on('avaliacao:registrada', carregar);
    return () => {
      socket.off('desafio:created', carregar);
      socket.off('desafio:updated', carregar);
      socket.off('desafio:deleted', carregar);
      socket.off('avaliacao:registrada', carregar);
    };
  }, []);

  useEffect(() => {
    if (!desafioAberto) return;
    Promise.all([
      listarAvaliacoes({ desafioId: desafioAberto.id }),
      listarCartas({}).then((todas) => todas.filter((c) => c.desafioId === desafioAberto.id)),
    ]).then(([listaAvaliacoes, listaCartas]) => {
      setAvaliacoes(listaAvaliacoes);
      setCartas(listaCartas);
    });
  }, [desafioAberto]);

  const desafiosDoDia = useMemo(
    () => desafios.filter((d) => d.dia === diaAtivo).sort((a, b) => a.numero - b.numero),
    [desafios, diaAtivo]
  );

  const colunasKanban = useMemo(() => {
    const grupos = Object.fromEntries(DESAFIO_STATUS_FLOW.map((status) => [status, []]));
    desafiosDoDia.forEach((d) => grupos[d.status]?.push(d));
    return grupos;
  }, [desafiosDoDia]);

  async function handleCriar(e) {
    e.preventDefault();
    try {
      await criarDesafio(novo);
      setNovo({ numero: '', titulo: '', descricao: '', categoria: '', instrucoes: '', dia: diaAtivo });
      setFormAberto(false);
      setErro(null);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.error || err.message);
    }
  }

  async function handleAcao(desafio) {
    const acao = PROXIMA_ACAO[desafio.status]?.acao;
    try {
      if (acao === 'liberar') await liberarDesafio(desafio.id);
      if (acao === 'iniciar') await iniciarDesafio(desafio.id);
      if (acao === 'encerrar') await encerrarDesafio(desafio.id);
      if (acao === 'finalizar') await finalizarDesafio(desafio.id);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.error || err.message);
    }
  }

  async function handleEditar(id, dados) {
    try {
      await atualizarDesafio(id, dados);
      setErro(null);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.error || err.message);
    }
  }

  async function handleExcluir(id) {
    try {
      await excluirDesafio(id);
      setDesafioAberto(null);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.error || err.message);
    }
  }

  return (
    <div className="dashboard desafios">
      <header>
        <h1>Desafios</h1>
        <p className="page-subtitle">36 desafios, 12 por dia — 60 minutos cada (10 de explicação, 40 de execução, 10 de apresentação).</p>
      </header>

      <div className="equipes-toolbar">
        {DIAS.map((d) => (
          <button
            key={d.dia}
            type="button"
            className={`btn ${diaAtivo === d.dia ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setDiaAtivo(d.dia)}
          >
            {d.titulo} · {d.categoria}
          </button>
        ))}
        {podeGerenciar && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setFormAberto((v) => !v)}>
            {formAberto ? 'Cancelar' : '+ Novo desafio'}
          </button>
        )}
        <span style={{ flex: 1 }} />
        <button
          type="button"
          className={`btn ${visualizacao === 'kanban' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setVisualizacao('kanban')}
        >
          🗂️ Kanban
        </button>
        <button
          type="button"
          className={`btn ${visualizacao === 'lista' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setVisualizacao('lista')}
        >
          📋 Lista
        </button>
      </div>

      {formAberto && (
        <form className="desafio-form" onSubmit={handleCriar}>
          <div className="desafio-form-linha">
            <label>
              Número (1-36)
              <input type="number" min="1" max="36" value={novo.numero} onChange={(e) => setNovo({ ...novo, numero: e.target.value })} required />
            </label>
            <label>
              Dia
              <select value={novo.dia} onChange={(e) => setNovo({ ...novo, dia: Number(e.target.value) })}>
                {DIAS.map((d) => (
                  <option key={d.dia} value={d.dia}>{d.titulo}</option>
                ))}
              </select>
            </label>
            <label>
              Categoria
              <input value={novo.categoria} onChange={(e) => setNovo({ ...novo, categoria: e.target.value })} placeholder="Ex: Robótica" />
            </label>
          </div>
          <label>
            Título
            <input value={novo.titulo} onChange={(e) => setNovo({ ...novo, titulo: e.target.value })} required autoFocus />
          </label>
          <label>
            Instruções / descrição
            <textarea value={novo.instrucoes} onChange={(e) => setNovo({ ...novo, instrucoes: e.target.value })} rows={2} />
          </label>
          {erro && <p className="quick-add-card-erro">{erro}</p>}
          <button type="submit" className="btn btn-primary btn-sm">Criar desafio</button>
        </form>
      )}

      {erro && !formAberto && <p className="error-banner">{erro}</p>}

      {visualizacao === 'kanban' ? (
        <div className="board board-section">
          {DESAFIO_STATUS_FLOW.map((status) => {
            const itens = colunasKanban[status];
            return (
              <div key={status} className="board-slot">
                <div className="order-column">
                  <div className="order-column-header">
                    <h2>
                      {DESAFIO_STATUS_ICON[status]} {DESAFIO_STATUS_LABELS[status]}
                    </h2>
                    <span className="count">{itens.length}</span>
                  </div>
                  <div className="order-column-list">
                    {itens.length === 0 && <p className="empty">Nenhum desafio aqui.</p>}
                    {itens.map((desafio) => (
                      <DesafioCard
                        key={desafio.id}
                        desafio={desafio}
                        aberto={desafioAberto?.id === desafio.id}
                        podeGerenciar={podeGerenciar}
                        onToggle={() => setDesafioAberto(desafioAberto?.id === desafio.id ? null : desafio)}
                        onAcao={() => handleAcao(desafio)}
                        onExcluir={() => handleExcluir(desafio.id)}
                        onEditar={(dados) => handleEditar(desafio.id, dados)}
                      >
                        {desafioAberto?.id === desafio.id && (
                          <DetalhesDesafio
                            desafio={desafio}
                            equipes={equipes}
                            avaliacoes={avaliacoes}
                            cartas={cartas}
                            podeAvaliar={podeAvaliar}
                            usuario={usuario}
                            onAvaliar={carregar}
                            onCarta={carregar}
                          />
                        )}
                      </DesafioCard>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="desafios-board">
          {desafiosDoDia.length === 0 && <p className="empty">Nenhum desafio cadastrado para este dia ainda.</p>}
          {desafiosDoDia.map((desafio) => (
            <DesafioCard
              key={desafio.id}
              desafio={desafio}
              aberto={desafioAberto?.id === desafio.id}
              podeGerenciar={podeGerenciar}
              onToggle={() => setDesafioAberto(desafioAberto?.id === desafio.id ? null : desafio)}
              onAcao={() => handleAcao(desafio)}
              onExcluir={() => handleExcluir(desafio.id)}
              onEditar={(dados) => handleEditar(desafio.id, dados)}
            >
              {desafioAberto?.id === desafio.id && (
                <DetalhesDesafio
                  desafio={desafio}
                  equipes={equipes}
                  avaliacoes={avaliacoes}
                  cartas={cartas}
                  podeAvaliar={podeAvaliar}
                  usuario={usuario}
                  onAvaliar={carregar}
                  onCarta={carregar}
                />
              )}
            </DesafioCard>
          ))}
        </div>
      )}
    </div>
  );
}

// Um único card, reaproveitado tanto na visão em Lista quanto dentro de
// cada coluna do Kanban (seção 19 — o card "anda" de coluna conforme o
// status avança: Bloqueado → Disponível → Em andamento → Em avaliação →
// Finalizado).
function DesafioCard({ desafio, aberto, podeGerenciar, onToggle, onAcao, onExcluir, onEditar, children }) {
  const proximaAcao = podeGerenciar ? PROXIMA_ACAO[desafio.status] : null;
  const [editando, setEditando] = useState(false);
  const [campos, setCampos] = useState({
    titulo: desafio.titulo,
    categoria: desafio.categoria || '',
    instrucoes: desafio.instrucoes || '',
    descricao: desafio.descricao || '',
  });

  function abrirEdicao() {
    setCampos({
      titulo: desafio.titulo,
      categoria: desafio.categoria || '',
      instrucoes: desafio.instrucoes || '',
      descricao: desafio.descricao || '',
    });
    setEditando(true);
  }

  function handleSalvarEdicao(e) {
    e.preventDefault();
    if (!campos.titulo.trim()) return;
    onEditar(campos);
    setEditando(false);
  }

  return (
    <div className="desafio-card">
      <div className="desafio-card-topo">
        <span className="desafio-pontos-badge">
          {DESAFIO_STATUS_ICON[desafio.status]} {DESAFIO_STATUS_LABELS[desafio.status]}
        </span>
        <span className="desafio-prazo">#{desafio.numero}</span>
      </div>

      {editando ? (
        <form className="desafio-form" onSubmit={handleSalvarEdicao} style={{ marginTop: 8 }}>
          <label>
            Título
            <input value={campos.titulo} onChange={(e) => setCampos({ ...campos, titulo: e.target.value })} required autoFocus />
          </label>
          <label>
            Categoria
            <input value={campos.categoria} onChange={(e) => setCampos({ ...campos, categoria: e.target.value })} />
          </label>
          <label>
            Instruções / descrição
            <textarea value={campos.instrucoes} onChange={(e) => setCampos({ ...campos, instrucoes: e.target.value })} rows={2} />
          </label>
          <div className="order-actions">
            <button type="submit" className="btn btn-primary btn-sm">Salvar</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditando(false)}>Cancelar</button>
          </div>
        </form>
      ) : (
        <>
          <p className="desafio-titulo">{desafio.titulo}</p>
          {desafio.categoria && <p className="desafio-descricao">{desafio.categoria}</p>}
        </>
      )}

      <div className="order-actions desafio-actions">
        <button type="button" onClick={onToggle}>
          {aberto ? 'Fechar' : 'Detalhes / avaliar'}
        </button>
        {proximaAcao && <button type="button" onClick={onAcao}>{proximaAcao.label}</button>}
        {podeGerenciar && !editando && (
          <button type="button" onClick={abrirEdicao}>Editar</button>
        )}
        {podeGerenciar && (
          <button type="button" className="btn-delete" onClick={onExcluir}>Excluir</button>
        )}
      </div>

      {children}
    </div>
  );
}

function DetalhesDesafio({ desafio, equipes, avaliacoes, cartas, podeAvaliar, usuario, onAvaliar, onCarta }) {
  const [equipeId, setEquipeId] = useState(equipes[0]?.id || '');
  const [criterios, setCriterios] = useState({});
  const [tipoCarta, setTipoCarta] = useState(TIPOS_CARTA[0].valor);
  const [beneficio, setBeneficio] = useState('');
  const [erro, setErro] = useState(null);

  const avaliacaoDaEquipe = avaliacoes.find((a) => a.equipeId === equipeId);

  async function handleAvaliar(e) {
    e.preventDefault();
    try {
      await registrarAvaliacao({ desafioId: desafio.id, equipeId, ...criterios });
      setErro(null);
      onAvaliar();
    } catch (err) {
      setErro(err.response?.data?.error || err.message);
    }
  }

  async function handleCarta(e) {
    e.preventDefault();
    try {
      await registrarCarta({
        equipeId,
        desafioId: desafio.id,
        tipo: tipoCarta,
        beneficio,
        responsavel: usuario?.nome,
      });
      setBeneficio('');
      onCarta();
    } catch (err) {
      setErro(err.response?.data?.error || err.message);
    }
  }

  return (
    <div className="info-box" style={{ marginTop: 12 }}>
      {desafio.instrucoes && <p style={{ marginBottom: 8 }}>{desafio.instrucoes}</p>}

      <p style={{ fontWeight: 600, marginBottom: 4 }}>Avaliações desta rodada</p>
      {avaliacoes.length === 0 ? (
        <p className="empty">Nenhuma equipe avaliada ainda.</p>
      ) : (
        <ul style={{ marginBottom: 8 }}>
          {avaliacoes.map((a) => (
            <li key={a.id}>{a.equipe.nome}: {a.pontuacaoTotal}/{PONTUACAO_MAXIMA} pts</li>
          ))}
        </ul>
      )}

      {podeAvaliar && equipes.length > 0 && (
        <form onSubmit={handleAvaliar} className="desafio-form">
          <label>
            Equipe
            <select value={equipeId} onChange={(e) => setEquipeId(e.target.value)}>
              {equipes.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.nome}</option>
              ))}
            </select>
          </label>
          <div className="desafio-form-linha">
            {CRITERIOS.map((c) => (
              <label key={c.chave}>
                {c.label} (máx {c.max})
                <input
                  type="number"
                  min="0"
                  max={c.max}
                  value={criterios[c.chave] ?? avaliacaoDaEquipe?.[c.chave] ?? ''}
                  onChange={(e) => setCriterios({ ...criterios, [c.chave]: e.target.value })}
                />
              </label>
            ))}
          </div>
          {erro && <p className="quick-add-card-erro">{erro}</p>}
          <button type="submit" className="btn btn-primary btn-sm">
            {avaliacaoDaEquipe ? 'Corrigir avaliação' : 'Registrar avaliação'}
          </button>
        </form>
      )}

      <p style={{ fontWeight: 600, margin: '12px 0 4px' }}>Cartas bônus usadas nesta rodada</p>
      {cartas.length === 0 ? (
        <p className="empty">Nenhuma carta usada ainda.</p>
      ) : (
        <ul style={{ marginBottom: 8 }}>
          {cartas.map((c) => (
            <li key={c.id}>{c.equipe.nome} usou {c.tipo} ({c.tempoUtilizado} min)</li>
          ))}
        </ul>
      )}

      {podeAvaliar && equipes.length > 0 && (
        <form onSubmit={handleCarta} className="desafio-form">
          <div className="desafio-form-linha">
            <label>
              Equipe
              <select value={equipeId} onChange={(e) => setEquipeId(e.target.value)}>
                {equipes.map((eq) => (
                  <option key={eq.id} value={eq.id}>{eq.nome}</option>
                ))}
              </select>
            </label>
            <label>
              Carta
              <select value={tipoCarta} onChange={(e) => setTipoCarta(e.target.value)}>
                {TIPOS_CARTA.map((t) => (
                  <option key={t.valor} value={t.valor}>{t.label}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Benefício concedido
            <input value={beneficio} onChange={(e) => setBeneficio(e.target.value)} placeholder="Ex: dica sobre o sensor X" />
          </label>
          <button type="submit" className="btn btn-outline btn-sm">Registrar uso de carta</button>
        </form>
      )}
    </div>
  );
}
