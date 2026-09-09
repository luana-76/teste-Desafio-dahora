import { useEffect, useState } from 'react';
import api from '../services/api';
import { iniciais, corAvatar } from '../utils/avatar';

// Não existe autenticação no app: guardamos o "perfil" localmente no
// navegador e cruzamos com os pedidos que têm esse mesmo nome em "cliente".
const CHAVE_NOME = 'desafio-dahora:perfil-nome';
const CHAVE_BIO = 'desafio-dahora:perfil-bio';

export default function Perfil() {
  const [nome, setNome] = useState(() => localStorage.getItem(CHAVE_NOME) || '');
  const [bio, setBio] = useState(() => localStorage.getItem(CHAVE_BIO) || '');
  const [editando, setEditando] = useState(() => !localStorage.getItem(CHAVE_NOME));
  const [nomeRascunho, setNomeRascunho] = useState(nome);
  const [bioRascunho, setBioRascunho] = useState(bio);

  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api
      .get('/orders')
      .then((res) => setPedidos(res.data))
      .catch(() => setErro('Não foi possível carregar suas tarefas. Verifique se o backend está rodando.'))
      .finally(() => setCarregando(false));
  }, []);

  function salvar(e) {
    e.preventDefault();
    const nomeFinal = nomeRascunho.trim();
    if (!nomeFinal) return;
    const bioFinal = bioRascunho.trim();
    localStorage.setItem(CHAVE_NOME, nomeFinal);
    localStorage.setItem(CHAVE_BIO, bioFinal);
    setNome(nomeFinal);
    setBio(bioFinal);
    setEditando(false);
  }

  function cancelarEdicao() {
    setNomeRascunho(nome);
    setBioRascunho(bio);
    setEditando(false);
  }

  const minhas = nome
    ? pedidos.filter((p) => p.cliente.trim().toLowerCase() === nome.trim().toLowerCase())
    : [];
  const emAndamento = minhas.filter((p) => ['PENDENTE', 'EM_PREPARO', 'PRONTO'].includes(p.status)).length;
  const concluidas = minhas.filter((p) => p.status === 'ENTREGUE').length;
  const canceladas = minhas.filter((p) => p.status === 'CANCELADO').length;
  const pontos = minhas
    .filter((p) => p.status !== 'CANCELADO')
    .reduce((soma, p) => soma + (p.valor || 0), 0);

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
              <input
                value={nomeRascunho}
                onChange={(e) => setNomeRascunho(e.target.value)}
                placeholder="Como você aparece nas tarefas"
                autoFocus
                required
              />
            </label>
            <label>
              Sobre você
              <textarea
                value={bioRascunho}
                onChange={(e) => setBioRascunho(e.target.value)}
                placeholder="Uma frase curta sobre você (opcional)"
                rows={3}
              />
            </label>
            <div className="profile-form-actions">
              <button type="submit">Salvar perfil</button>
              {nome && (
                <button type="button" className="profile-cancelar" onClick={cancelarEdicao}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <h2>{nome}</h2>
            {bio ? <p className="profile-bio">{bio}</p> : <p className="profile-bio profile-bio-vazia">Sem bio ainda.</p>}
            <button type="button" className="profile-editar" onClick={() => setEditando(true)}>
              Editar perfil
            </button>
          </div>
        )}
      </div>

      {nome && !editando && (
        <>
          {erro && <p className="error-banner">{erro}</p>}
          {carregando ? (
            <p className="loading">Carregando suas tarefas...</p>
          ) : (
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-valor">{minhas.length}</span>
                <span className="profile-stat-label">Tarefas criadas</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-valor">{emAndamento}</span>
                <span className="profile-stat-label">Em andamento</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-valor">{concluidas}</span>
                <span className="profile-stat-label">Concluídas</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-valor">{canceladas}</span>
                <span className="profile-stat-label">Canceladas</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-valor">{pontos}</span>
                <span className="profile-stat-label">Pontos no ranking</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
