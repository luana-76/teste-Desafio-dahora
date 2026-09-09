import { iniciais, corAvatar } from '../utils/avatar';

const PONTOS = new Intl.NumberFormat('pt-BR');

const ORDEM_VISUAL = [2, 1, 3]; // 2º à esquerda, 1º no centro (mais alto), 3º à direita

export default function RankingPodium({ top3 }) {
  const porPosicao = { 1: top3[0], 2: top3[1], 3: top3[2] };

  return (
    <div className="podium">
      {ORDEM_VISUAL.map((posicao) => {
        const item = porPosicao[posicao];
        if (!item) return <div key={posicao} className="podium-spot podium-empty" />;

        return (
          <div key={posicao} className={`podium-spot podium-pos-${posicao}`}>
            {posicao === 1 && <span className="podium-crown">♛</span>}
            <div className={`podium-avatar cor-${corAvatar(item.cliente)}`}>
              {iniciais(item.cliente)}
              <span className="podium-badge">{posicao}</span>
            </div>
            <p className="podium-nome">{item.cliente}</p>
            <p className="podium-valor">{PONTOS.format(item.totalGasto)} pts</p>
          </div>
        );
      })}
    </div>
  );
}
