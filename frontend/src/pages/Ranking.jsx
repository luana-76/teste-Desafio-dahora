import { useEffect, useState } from 'react';
import api from '../services/api';
import RankingPodium from '../components/RankingPodium';
import { iniciais, corAvatar } from '../utils/avatar';

const PONTOS = new Intl.NumberFormat('pt-BR');

const PERIODOS = [
  { valor: 'sempre', label: 'Desde sempre' },
  { valor: 'mes', label: 'Últimos 30 dias' },
  { valor: 'semana', label: 'Últimos 7 dias' },
  { valor: 'hoje', label: 'Hoje' },
];

export default function Ranking() {
  const [periodo, setPeriodo] = useState('sempre');
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [comoFunciona, setComoFunciona] = useState(false);

  useEffect(() => {
    setCarregando(true);
    setErro(null);
    api
      .get('/orders/ranking', { params: { periodo } })
      .then((res) => setDados(res.data))
      .catch(() => setErro('Não foi possível carregar o ranking. Verifique se o backend está rodando.'))
      .finally(() => setCarregando(false));
  }, [periodo]);

  const top3 = dados.slice(0, 3);
  const resto = dados.slice(3);

  return (
    <div className="dashboard ranking">
      <header>
        <h1>Ranking de participantes</h1>
        <button type="button" className="info-link" onClick={() => setComoFunciona((v) => !v)}>
          ⓘ Como isso funciona?
        </button>
      </header>

      {comoFunciona && (
        <p className="info-box">
          O ranking soma os pontos de importância de todas as tarefas de cada participante
          (exceto as canceladas) no período escolhido. Quem acumular mais pontos fica em 1º lugar.
        </p>
      )}

      <div className="ranking-toolbar">
        <label htmlFor="periodo-select">Período</label>
        <select id="periodo-select" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
          {PERIODOS.map((p) => (
            <option key={p.valor} value={p.valor}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {erro && <p className="error-banner">{erro}</p>}

      {carregando ? (
        <p className="loading">Carregando ranking...</p>
      ) : dados.length === 0 ? (
        <p className="empty">Nenhum pedido nesse período ainda.</p>
      ) : (
        <>
          <RankingPodium top3={top3} />

          {resto.length > 0 && (
            <div className="ranking-list">
              <div className="ranking-list-header">
                <span>Classificação</span>
                <span>Pontos</span>
              </div>
              {resto.map((item, i) => (
                <div key={item.cliente} className="ranking-row">
                  <span className="ranking-posicao">{i + 4}</span>
                  <div className={`ranking-avatar cor-${corAvatar(item.cliente)}`}>
                    {iniciais(item.cliente)}
                  </div>
                  <span className="ranking-nome">{item.cliente}</span>
                  <span className="ranking-valor">{PONTOS.format(item.totalGasto)} pts</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
