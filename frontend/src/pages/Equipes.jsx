import { useEffect, useState } from 'react';
import socket from '../services/socket';
import { usuarioAtual } from '../services/auth';
import {
  listarEquipes,
  criarEquipe,
  atualizarEquipe,
  excluirEquipe,
  adicionarParticipante,
  removerParticipante,
  LIMITE_MIN_PARTICIPANTES,
  LIMITE_MAX_PARTICIPANTES,
} from '../services/equipes';
import { listarParticipantes } from '../services/participantes';
import { PALETA_CORES } from '../utils/paletaCores';
import { iniciais, corAvatar } from '../utils/avatar';

// Equipe de exemplo, só para preencher a tela quando ainda não existe
// nenhuma outra equipe real além da do usuário logado — não vem do banco,
// então nunca deve receber ações (adicionar/remover/excluir).
const EQUIPE_EXEMPLO = {
  id: 'exemplo-nebulosa',
  nome: 'Equipe Nebulosa',
  cor: 'laranja',
  dentroDoLimite: true,
  fake: true,
  participantes: [
    { id: 'exemplo-1', nome: 'Marina Alves' },
    { id: 'exemplo-2', nome: 'Pedro Lima' },
    { id: 'exemplo-3', nome: 'Sofia Rocha' },
  ],
};

export default function Equipes() {
  const usuario = usuarioAtual();
  // Adicionar/remover participante e excluir equipe é ação só do
  // Administrador — nem Monitor nem Participante têm esse controle.
  const podeGerenciar = usuario?.papel === 'ADMIN';

  const [equipes, setEquipes] = useState([]);
  const [semEquipe, setSemEquipe] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroGeral, setErroGeral] = useState(null);

  const [formAberto, setFormAberto] = useState(false);
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(PALETA_CORES[0].chave);
  const [erro, setErro] = useState(null);

  // A equipe do usuário logado vai em destaque no topo; o resto fica
  // listado normalmente abaixo.
  const minhaEquipe = usuario ? equipes.find((e) => e.participantes.some((p) => p.id === usuario.id)) : null;
  const outrasEquipesReais = minhaEquipe ? equipes.filter((e) => e.id !== minhaEquipe.id) : equipes;
  // Enquanto não existe nenhuma outra equipe cadastrada de verdade, mostra
  // uma equipe de exemplo só pra ilustrar como a lista fica com mais times.
  const outrasEquipes = outrasEquipesReais.length > 0 ? outrasEquipesReais : [EQUIPE_EXEMPLO];

  function carregar() {
    setCarregando(true);
    Promise.all([listarEquipes(), listarParticipantes({}).catch(() => [])])
      .then(([listaEquipes, todosParticipantes]) => {
        setEquipes(listaEquipes);
        setSemEquipe(todosParticipantes.filter((p) => !p.equipeId));
        setErroGeral(null);
      })
      .catch(() => setErroGeral('Não foi possível carregar as equipes. Verifique se o backend está rodando.'))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
    socket.on('equipe:created', carregar);
    socket.on('equipe:updated', carregar);
    socket.on('equipe:deleted', carregar);
    return () => {
      socket.off('equipe:created', carregar);
      socket.off('equipe:updated', carregar);
      socket.off('equipe:deleted', carregar);
    };
  }, []);

  async function handleCriarEquipe(e) {
    e.preventDefault();
    try {
      await criarEquipe({ nome, cor });
      setNome('');
      setCor(PALETA_CORES[0].chave);
      setFormAberto(false);
      setErro(null);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.error || err.message);
    }
  }

  async function handleAtualizar(id, dados) {
    try {
      await atualizarEquipe(id, dados);
      carregar();
    } catch (err) {
      setErroGeral(err.response?.data?.error || err.message);
    }
  }

  async function handleExcluir(id) {
    try {
      await excluirEquipe(id);
      carregar();
    } catch (err) {
      setErroGeral(err.response?.data?.error || err.message);
    }
  }

  async function handleAdicionar(equipeId, participanteId) {
    if (!participanteId) return;
    try {
      await adicionarParticipante(equipeId, participanteId);
      await carregar();
    } catch (err) {
      setErroGeral(err.response?.data?.error || err.message);
    }
  }

  async function handleRemover(equipeId, participanteId) {
    try {
      await removerParticipante(equipeId, participanteId);
      carregar();
    } catch (err) {
      setErroGeral(err.response?.data?.error || err.message);
    }
  }

  return (
    <div className="dashboard equipes">
      <header>
        <h1>Equipes</h1>
        
      </header>

      {podeGerenciar && (
        <div className="equipes-toolbar">
          <button type="button" className="btn btn-primary" onClick={() => setFormAberto((v) => !v)}>
            {formAberto ? 'Cancelar' : '+ Nova equipe'}
          </button>
        </div>
      )}

      {formAberto && (
        <form className="equipe-form" onSubmit={handleCriarEquipe}>
          <label>
            Nome da equipe
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Time Fênix" autoFocus required />
          </label>

          <div className="equipe-form-cores">
            <span>Cor</span>
            <div className="cor-swatches">
              {PALETA_CORES.map((c) => (
                <button
                  key={c.chave}
                  type="button"
                  className={`cor-swatch${cor === c.chave ? ' cor-swatch-ativo' : ''}`}
                  style={{ '--swatch': c.hex }}
                  title={c.nome}
                  onClick={() => setCor(c.chave)}
                  aria-label={c.nome}
                />
              ))}
            </div>
          </div>

          {erro && <p className="quick-add-card-erro">{erro}</p>}

          <button type="submit" className="btn btn-primary btn-sm">
            Criar equipe
          </button>
        </form>
      )}

      {erroGeral && <p className="error-banner">{erroGeral}</p>}

      {carregando ? (
        <p className="loading">Carregando equipes...</p>
      ) : equipes.length === 0 ? (
        <p className="empty">Nenhuma equipe criada ainda.</p>
      ) : (
        <>
          {minhaEquipe && (
            <div className="equipe-destaque-section">
              <h2
                className="equipe-secao-titulo-destaque"
                style={{ '--equipe-destaque-cor': (PALETA_CORES.find((c) => c.chave === minhaEquipe.cor) || {}).hex }}
              >
                Sua equipe
              </h2>
              <EquipeCard
                equipe={minhaEquipe}
                podeGerenciar={podeGerenciar}
                disponiveis={semEquipe}
                onAdicionar={handleAdicionar}
                onRemover={handleRemover}
                onExcluir={handleExcluir}
                onAtualizar={handleAtualizar}
                destaque
              />
            </div>
          )}

          {outrasEquipes.length > 0 && (
            <>
              {minhaEquipe && <h2 className="equipe-secao-titulo">Outras equipes</h2>}
              {outrasEquipesReais.length === 0 && (
                <p className="equipe-secao-nota">
                  Ainda não há outra equipe cadastrada — abaixo um exemplo de como ela apareceria aqui.
                </p>
              )}
              <div className="equipes-grid">
                {outrasEquipes.map((equipe) => (
                  <EquipeCard
                    key={equipe.id}
                    equipe={equipe}
                    podeGerenciar={podeGerenciar && !equipe.fake}
                    disponiveis={semEquipe}
                    onAdicionar={handleAdicionar}
                    onRemover={handleRemover}
                    onExcluir={handleExcluir}
                    onAtualizar={handleAtualizar}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function EquipeCard({ equipe, podeGerenciar, disponiveis, onAdicionar, onRemover, onExcluir, onAtualizar, destaque = false }) {
  const [editando, setEditando] = useState(false);
  const [nomeEdicao, setNomeEdicao] = useState(equipe.nome);
  const [corEdicao, setCorEdicao] = useState(equipe.cor);
  const corInfo = PALETA_CORES.find((c) => c.chave === equipe.cor) || { hex: equipe.cor, nome: equipe.cor };
  const totalParticipantes = equipe.participantes?.length ?? 0;
  const noLimite = totalParticipantes >= 5;

  function handleSalvarEdicao(e) {
    e.preventDefault();
    if (!nomeEdicao.trim()) return;
    onAtualizar(equipe.id, { nome: nomeEdicao, cor: corEdicao });
    setEditando(false);
  }

  return (
    <div className={`equipe-card${destaque ? ' equipe-card-destaque' : ''}`} style={{ '--equipe-cor': corInfo.hex }}>
      {destaque && <span className="equipe-card-destaque-selo">Você está aqui</span>}
      <div className="equipe-card-faixa" />
      <div className="equipe-card-header">
        <h2>{equipe.nome}</h2>
        {podeGerenciar && (
          <div className="equipe-card-header-acoes">
            <button
              type="button"
              className="equipe-card-editar"
              onClick={() => {
                setNomeEdicao(equipe.nome);
                setCorEdicao(equipe.cor);
                setEditando((v) => !v);
              }}
              title="Editar equipe"
            >
              ✎
            </button>
            <button type="button" className="equipe-card-excluir" onClick={() => onExcluir(equipe.id)} title="Excluir equipe">
              ×
            </button>
          </div>
        )}
      </div>

      {editando ? (
        <form className="equipe-form equipe-form-edicao" onSubmit={handleSalvarEdicao}>
          <label>
            Nome da equipe
            <input value={nomeEdicao} onChange={(e) => setNomeEdicao(e.target.value)} required autoFocus />
          </label>
          <div className="equipe-form-cores">
            <span>Cor</span>
            <div className="cor-swatches">
              {PALETA_CORES.map((c) => (
                <button
                  key={c.chave}
                  type="button"
                  className={`cor-swatch${corEdicao === c.chave ? ' cor-swatch-ativo' : ''}`}
                  style={{ '--swatch': c.hex }}
                  title={c.nome}
                  onClick={() => setCorEdicao(c.chave)}
                  aria-label={c.nome}
                />
              ))}
            </div>
          </div>
          <div className="trello-form-actions">
            <button type="submit" className="btn btn-primary btn-sm">Salvar</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditando(false)}>Cancelar</button>
          </div>
        </form>
      ) : (
        <>
          <span className="equipe-card-tag">{corInfo.nome}</span>
          {equipe.fake && <span className="equipe-card-tag equipe-card-tag-exemplo">Exemplo</span>}
        </>
      )}
      {!equipe.dentroDoLimite && (
        <p className="quick-add-card-erro">
          {totalParticipantes < 3 ? 'Faltam participantes (mínimo 3).' : 'Acima do máximo permitido.'}
        </p>
      )}

      <div className="equipe-membros">
        {equipe.participantes.length === 0 ? (
          <p className="empty">Sem membros ainda.</p>
        ) : (
          equipe.participantes.map((p) => (
            <span key={p.id} className="equipe-membro-chip">
              <span className="equipe-membro-avatar">{iniciais(p.nome)}</span>
              {p.nome}
              {podeGerenciar && (
                <button type="button" onClick={() => onRemover(equipe.id, p.id)} title="Remover da equipe">
                  ×
                </button>
              )}
            </span>
          ))
        )}
      </div>

      {podeGerenciar && (
        <AdicionarMembro
          totalParticipantes={totalParticipantes}
          limite={5}
          disponiveis={disponiveis}
          onAdicionar={(participanteId) => onAdicionar(equipe.id, participanteId)}
        />
      )}
    </div>
  );
}

// Seletor de participantes: em vez do <select> nativo, abre um painel dentro
// do próprio card com busca, avatar e um clique pra adicionar. Fica embutido
// (não flutuante) porque o card corta o que passa da borda.
function AdicionarMembro({ totalParticipantes, limite, disponiveis, onAdicionar }) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [adicionandoId, setAdicionandoId] = useState(null);
  const noLimite = totalParticipantes >= limite;

  // Fecha sozinho quando a equipe enche.
  useEffect(() => {
    if (noLimite) setAberto(false);
  }, [noLimite]);

  const termo = busca.trim().toLowerCase();
  const filtrados = disponiveis.filter(
    (p) => !termo || p.nome.toLowerCase().includes(termo) || (p.email || '').toLowerCase().includes(termo),
  );

  async function escolher(id) {
    setAdicionandoId(id);
    try {
      await onAdicionar(id);
      setBusca('');
    } finally {
      setAdicionandoId(null);
    }
  }

  return (
    <div className={`add-membro${aberto ? ' add-membro-aberto' : ''}`}>
      <div className="add-membro-vagas" aria-label={`${totalParticipantes} de ${limite} vagas ocupadas`}>
        <div className="add-membro-pontos">
          {Array.from({ length: limite }).map((_, i) => (
            <span key={i} className={`add-membro-ponto${i < totalParticipantes ? ' cheio' : ''}`} />
          ))}
        </div>
        <span>{totalParticipantes}/{limite} vagas</span>
      </div>

      <button
        type="button"
        className="add-membro-toggle"
        onClick={() => setAberto((v) => !v)}
        disabled={noLimite}
        aria-expanded={aberto}
      >
        <span className="add-membro-toggle-icone">{aberto ? '×' : '+'}</span>
        {noLimite ? 'Equipe completa' : aberto ? 'Fechar' : 'Adicionar participante'}
      </button>

      {aberto && (
        <div className="add-membro-painel">
          <div className="add-membro-busca">
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou e-mail"
              autoFocus
            />
          </div>

          <ul className="add-membro-lista">
            {filtrados.length === 0 ? (
              <li className="add-membro-vazio">
                {disponiveis.length === 0 ? 'Todos os participantes já estão em uma equipe.' : 'Ninguém encontrado.'}
              </li>
            ) : (
              filtrados.map((p, i) => (
                <li key={p.id} style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                  <button
                    type="button"
                    className="add-membro-item"
                    onClick={() => escolher(p.id)}
                    disabled={adicionandoId !== null}
                  >
                    <span className={`add-membro-item-avatar cor-${corAvatar(p.nome)}`}>{iniciais(p.nome)}</span>
                    <span className="add-membro-item-info">
                      <strong>{p.nome}</strong>
                      {p.email && <small>{p.email}</small>}
                    </span>
                    <span className="add-membro-item-acao">{adicionandoId === p.id ? '...' : 'Adicionar'}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
