import { useEffect, useState } from 'react';
import { usuarioAtual } from '../services/auth';
import { listarDesafios } from '../services/desafios';
import { rankingGeral } from '../services/ranking';
import { listarCartas } from '../services/cartas';
import socket from '../services/socket';
import { DESAFIO_STATUS_ICON, DESAFIO_STATUS_LABELS } from '../constants/desafioStatus';

const TOTAL_DESAFIOS = 36;

// Dashboard do participante — seção 26 do documento: minha equipe,
// pontuação total, posição no ranking, desafio atual, tempo restante,
// desafios concluídos, progresso, cartas bônus.
export default function Dashboard() {
  const usuario = usuarioAtual();
  const [desafioAtual, setDesafioAtual] = useState(null);
  const [minhaEquipeRanking, setMinhaEquipeRanking] = useState(null);
  const [cartas, setCartas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  function carregar() {
    setCarregando(true);
    Promise.all([
      listarDesafios({ status: 'EM_ANDAMENTO' }),
      rankingGeral(),
      usuario?.equipeId ? listarCartas({ equipeId: usuario.equipeId }) : Promise.resolve([]),
    ])
      .then(([emAndamento, ranking, cartasEquipe]) => {
        setDesafioAtual(emAndamento[0] || null);
        setMinhaEquipeRanking(usuario?.equipeId ? ranking.find((r) => r.equipeId === usuario.equipeId) : null);
        setCartas(cartasEquipe);
        setErro(null);
      })
      .catch(() => setErro('Não foi possível carregar o painel. Verifique se o backend está rodando.'))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
    socket.on('desafio:updated', carregar);
    socket.on('avaliacao:registrada', carregar);
    socket.on('carta:registrada', carregar);
    return () => {
      socket.off('desafio:updated', carregar);
      socket.off('avaliacao:registrada', carregar);
      socket.off('carta:registrada', carregar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progresso = minhaEquipeRanking?.desafiosConcluidos ?? 0;

  return (
    <div className="dashboard" id="topo">
      <section className="hero">
        <div className="hero-text">
          <h1>Desafio da Hora</h1>
          <p>36 desafios, 3 dias, 1 hora por rodada. Acompanhe sua equipe e o desafio da vez.</p>

          <div className="hero-actions">
            <a className="btn btn-primary" href="#/ranking">Ver ranking</a>
            <a className="btn btn-outline" href="#/desafios">Ver desafios</a>
          </div>

          <div className="hero-stats">
            <div>
              <strong>{minhaEquipeRanking?.pontuacao ?? 0}</strong>
              <span>Pontos (geral)</span>
            </div>
            <div>
              <strong>{minhaEquipeRanking ? `#${minhaEquipeRanking.posicao}` : '—'}</strong>
              <span>Posição no ranking</span>
            </div>
            <div>
              <strong>{progresso}/{TOTAL_DESAFIOS}</strong>
              <span>Desafios concluídos</span>
            </div>
          </div>
        </div>

        <aside className="hero-card">
          <div className="hero-card-art" aria-hidden="true">
            <span className="hero-orb" />
          </div>
          <div className="hero-card-info">
            <div>
              <small>Minha equipe</small>
              <span>{usuario?.equipe?.nome || 'Sem equipe ainda'}</span>
            </div>
            <div>
              <small>Cartas bônus usadas</small>
              <strong>{cartas.length}</strong>
            </div>
            <a className="btn btn-primary btn-sm" href="#/equipes">Ver equipes</a>
          </div>
        </aside>
      </section>

      <section className="board-section" id="desafio-atual">
        <h2 className="section-title">Desafio da hora</h2>

        {erro && <p className="error-banner">{erro}</p>}
        {carregando ? (
          <p className="loading" style={{textAlign: 'center'}}>Carregando...</p>
        ) : desafioAtual ? (
          <div className="desafio-card" style={{ maxWidth: 420 }}>
            <div className="desafio-card-topo">
              <span className="desafio-pontos-badge">
                {DESAFIO_STATUS_ICON[desafioAtual.status]} {DESAFIO_STATUS_LABELS[desafioAtual.status]}
              </span>
              <span className="desafio-prazo">Dia {desafioAtual.dia} · #{desafioAtual.numero}</span>
            </div>
            <p className="desafio-titulo">{desafioAtual.titulo}</p>
            {desafioAtual.descricao && <p className="desafio-descricao">{desafioAtual.descricao}</p>}
            {desafioAtual.instrucoes && <p className="desafio-descricao">{desafioAtual.instrucoes}</p>}
          </div>
        ) : (
          <p className="empty" style={{textAlign: 'center'}}>Nenhum desafio em andamento agora. Acompanhe a aba "Desafios".</p>
        )}
      </section>
    </div>
  );
}
