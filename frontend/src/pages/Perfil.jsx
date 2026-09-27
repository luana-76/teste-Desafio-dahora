import { useEffect, useState } from 'react';
import { usuarioAtual, atualizarUsuarioAtual, recarregarSessao } from '../services/auth';
import { rankingGeral } from '../services/ranking';
import { iniciais, corAvatar } from '../utils/avatar';

const PAPEL_LABEL = { PARTICIPANTE: 'Participante', MONITOR: 'Monitor', ADMIN: 'Administrador' };

export default function Perfil() {
  const [usuario, setUsuario] = useState(() => usuarioAtual());
  const [editando, setEditando] = useState(false);
  const [nomeRascunho, setNomeRascunho] = useState(usuario?.nome || '');
  const [bioRascunho, setBioRascunho] = useState(usuario?.bio || '');
  const [minhaEquipeRanking, setMinhaEquipeRanking] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    recarregarSessao()
      .then((atualizado) => atualizado && setUsuario(atualizado))
      .catch(() => {});

    rankingGeral()
      .then((ranking) => setMinhaEquipeRanking(ranking.find((r) => r.equipeId === usuario?.equipeId) || null))
      .catch(() => setErro('Não foi possível carregar o ranking da sua equipe.'))
      .finally(() => setCarregando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function salvar(e) {
    e.preventDefault();
    const nomeFinal = nomeRascunho.trim();
    if (!nomeFinal) return;
    const atualizado = await atualizarUsuarioAtual({ nome: nomeFinal, bio: bioRascunho.trim() });
    setUsuario(atualizado);
    setEditando(false);
  }

  function cancelarEdicao() {
    setNomeRascunho(usuario?.nome || '');
    setBioRascunho(usuario?.bio || '');
    setEditando(false);
  }

  function iniciarEdicao() {
    setNomeRascunho(usuario?.nome || '');
    setBioRascunho(usuario?.bio || '');
    setEditando(true);
  }

  const nome = usuario?.nome || '';

  return (
    <div className="dashboard perfil">
      <header>
        <h1>Meu perfil</h1>
      </header>

      <div className="profile-card">
        <div className={`profile-avatar cor-${corAvatar(nome || '?')}`}>{nome ? iniciais(nome) : '?'}</div>

        {editando ? (
          <form className="profile-form" onSubmit={salvar}>
            <label>
              Nome
              <input value={nomeRascunho} onChange={(e) => setNomeRascunho(e.target.value)} autoFocus required />
            </label>
            <label>
              Sobre você
              <textarea value={bioRascunho} onChange={(e) => setBioRascunho(e.target.value)} rows={3} />
            </label>
            <div className="profile-form-actions">
              <button type="submit">Salvar perfil</button>
              <button type="button" className="profile-cancelar" onClick={cancelarEdicao}>
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <h2>{nome}</h2>
            {usuario?.email && <p className="profile-email">{usuario.email}</p>}
            <p className="profile-email">{PAPEL_LABEL[usuario?.papel] || 'Participante'}</p>
            {usuario?.bio ? <p className="profile-bio">{usuario.bio}</p> : <p className="profile-bio profile-bio-vazia">Sem bio ainda.</p>}
            <button type="button" className="profile-editar" onClick={iniciarEdicao}>
              Editar perfil
            </button>
          </div>
        )}
      </div>

      {erro && <p className="error-banner">{erro}</p>}
      {carregando ? (
        <p className="loading">Carregando...</p>
      ) : (
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-valor">{usuario?.equipe?.nome || '—'}</span>
            <span className="profile-stat-label">Minha equipe</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-valor">{minhaEquipeRanking?.pontuacao ?? 0}</span>
            <span className="profile-stat-label">Pontos da equipe (geral)</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-valor">{minhaEquipeRanking ? `#${minhaEquipeRanking.posicao}` : '—'}</span>
            <span className="profile-stat-label">Posição no ranking</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-valor">{minhaEquipeRanking?.desafiosConcluidos ?? 0}/36</span>
            <span className="profile-stat-label">Desafios concluídos</span>
          </div>
        </div>
      )}
    </div>
  );
}
