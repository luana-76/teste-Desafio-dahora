import { useEffect, useState } from 'react';
import socket from '../services/socket';
import { usuarioAtual } from '../services/auth';
import { rankingRodada, rankingDiario, rankingGeral, ajustarPontos } from '../services/ranking';
import { listarDesafios } from '../services/desafios';
import { listarEquipes } from '../services/equipes';
import RankingPodium from '../components/RankingPodium';
import { DIAS } from '../constants/desafioStatus';
import { corPorChave } from '../utils/paletaCores';

const PONTOS = new Intl.NumberFormat('pt-BR');

// Três níveis de ranking — seção 24 do documento: rodada, diário e geral.
export default function Ranking() {
  const usuario = usuarioAtual();
  // Só o Administrador pode dar/tirar pontos manualmente de uma equipe —
  // esse ajuste entra só no ranking geral (ver backend/ranking.service.js).
  const podeAjustarPontos = usuario?.papel === 'ADMIN';

  const [nivel, setNivel] = useState('geral'); // 'rodada' | 'diario' | 'geral'
  const [dia, setDia] = useState(1);
  const [desafios, setDesafios] = useState([]);
  const [desafioId, setDesafioId] = useState('');
  const [equipes, setEquipes] = useState([]);
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [comoFunciona, setComoFunciona] = useState(false);
  const [ajusteAberto, setAjusteAberto] = useState(false);
  const [ajusteEquipeId, setAjusteEquipeId] = useState('');
  const [ajustePontosValor, setAjustePontosValor] = useState('');
  const [ajusteMotivo, setAjusteMotivo] = useState('');
  const [ajusteErro, setAjusteErro] = useState(null);

  useEffect(() => {
    listarDesafios().then((lista) => {
      setDesafios(lista);
      if (!desafioId && lista[0]) setDesafioId(lista[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!podeAjustarPontos) return;
    listarEquipes().then((lista) => {
      setEquipes(lista);
      if (!ajusteEquipeId && lista[0]) setAjusteEquipeId(lista[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [podeAjustarPontos]);

  function carregarRanking() {
    setCarregando(true);
    setErro(null);
    const chamada =
      nivel === 'rodada' && desafioId
        ? rankingRodada(desafioId)
        : nivel === 'diario'
        ? rankingDiario(dia)
        : rankingGeral();

    chamada
      .then(setDados)
      .catch(() => setErro('Não foi possível carregar o ranking. Verifique se o backend está rodando.'))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregarRanking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nivel, dia, desafioId]);

  useEffect(() => {
    socket.on('avaliacao:registrada', carregarRanking);
    socket.on('ranking:ajustado', carregarRanking);
    return () => {
      socket.off('avaliacao:registrada', carregarRanking);
      socket.off('ranking:ajustado', carregarRanking);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nivel, dia, desafioId]);

  async function handleAjustarPontos(e) {
    e.preventDefault();
    const pontos = Number(ajustePontosValor);
    if (!ajusteEquipeId || !Number.isInteger(pontos) || pontos === 0) {
      setAjusteErro('Escolha a equipe e um valor de pontos (inteiro, diferente de zero).');
      return;
    }
    try {
      await ajustarPontos({ equipeId: ajusteEquipeId, pontos, motivo: ajusteMotivo });
      setAjustePontosValor('');
      setAjusteMotivo('');
      setAjusteErro(null);
      if (nivel === 'geral') carregarRanking();
    } catch (err) {
      setAjusteErro(err.response?.data?.error || err.message);
    }
  }

  const top3 = dados.slice(0, 3);
  const resto = dados.slice(3);

  return (
    <div className="dashboard ranking">
      <header>
        <h1>Ranking das equipes</h1>
        <button type="button" className="info-link" onClick={() => setComoFunciona((v) => !v)}>
          ⓘ Como isso funciona?
        </button>
      </header>

      {comoFunciona && (
        <p className="info-box">
          <strong>Rodada</strong>: pontuação de um desafio específico. <strong>Diário</strong>: soma de todos os
          desafios já avaliados naquele dia. <strong>Geral</strong>: soma acumulada dos três dias (seção 24).
        </p>
      )}

      {podeAjustarPontos && (
        <div className="equipes-toolbar">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setAjusteAberto((v) => !v)}>
            {ajusteAberto ? 'Cancelar' : '+ Ajustar pontos de uma equipe'}
          </button>
        </div>
      )}

      {ajusteAberto && (
        <form className="desafio-form" onSubmit={handleAjustarPontos}>
          <div className="desafio-form-linha">
            <label>
              Equipe
              <select value={ajusteEquipeId} onChange={(e) => setAjusteEquipeId(e.target.value)}>
                {equipes.map((eq) => (
                  <option key={eq.id} value={eq.id}>{eq.nome}</option>
                ))}
              </select>
            </label>
            <label>
              Pontos (use negativo para remover)
              <input
                type="number"
                value={ajustePontosValor}
                onChange={(e) => setAjustePontosValor(e.target.value)}
                placeholder="Ex: 20 ou -10"
                required
              />
            </label>
          </div>
          <label>
            Motivo (opcional)
            <input value={ajusteMotivo} onChange={(e) => setAjusteMotivo(e.target.value)} placeholder="Ex: bônus por colaboração" />
          </label>
          {ajusteErro && <p className="quick-add-card-erro">{ajusteErro}</p>}
          <p className="page-subtitle" style={{ margin: 0 }}>
            Esse ajuste entra somente no <strong>ranking geral</strong>.
          </p>
          <button type="submit" className="btn btn-primary btn-sm">Aplicar pontos</button>
        </form>
      )}

      <div className="ranking-toolbar">
        <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
          <option value="geral">Ranking geral</option>
          <option value="diario">Ranking diário</option>
          <option value="rodada">Ranking da rodada</option>
        </select>

        {nivel === 'diario' && (
          <select value={dia} onChange={(e) => setDia(Number(e.target.value))}>
            {DIAS.map((d) => (
              <option key={d.dia} value={d.dia}>{d.titulo}</option>
            ))}
          </select>
        )}

        {nivel === 'rodada' && (
          <select value={desafioId} onChange={(e) => setDesafioId(e.target.value)}>
            {desafios.map((d) => (
              <option key={d.id} value={d.id}>#{d.numero} — {d.titulo}</option>
            ))}
          </select>
        )}
      </div>

      {erro && <p className="error-banner">{erro}</p>}

      {carregando ? (
        <p className="loading">Carregando ranking...</p>
      ) : dados.length === 0 ? (
        <p className="empty">Nenhuma avaliação registrada ainda para esse filtro.</p>
      ) : (
        <>
          <RankingPodium top3={top3} />

          {resto.length > 0 && (
            <div className="ranking-list">
              <div className="ranking-list-header">
                <span>Classificação</span>
                <span>Pontos</span>
              </div>
              {resto.map((item) => (
                <div key={item.equipeId} className="ranking-row">
                  <span className="ranking-posicao">{item.posicao}</span>
                  <div className="ranking-avatar" style={{ background: corPorChave(item.cor).hex }}>
                    {item.nome?.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="ranking-nome">{item.nome}</span>
                  <span className="ranking-valor">{PONTOS.format(item.pontuacao)} pts</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
