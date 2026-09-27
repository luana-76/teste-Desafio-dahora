import { corPorChave } from '../utils/paletaCores';

const PONTOS = new Intl.NumberFormat('pt-BR');

const ORDEM_VISUAL = [2, 1, 3]; // 2º à esquerda, 1º no centro (mais alto), 3º à direita

// Podium por EQUIPE (nome + cor), não mais por participante individual —
// o ranking do documento (seção 24) é sempre da equipe.
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
            <div className="podium-avatar" style={{ background: corPorChave(item.cor).hex }}>
              {item.nome?.slice(0, 2).toUpperCase()}
              <span className="podium-badge">{posicao}</span>
            </div>
            <p className="podium-nome">{item.nome}</p>
            <p className="podium-valor">{PONTOS.format(item.pontuacao)} pts</p>
          </div>
        );
      })}
    </div>
  );
}
