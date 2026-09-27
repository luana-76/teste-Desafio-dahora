import { useEffect, useRef, useState } from 'react';
import socket from '../services/socket';
import { rankingGeral } from '../services/ranking';

const FORMATO_PONTOS = new Intl.NumberFormat('pt-BR');

// Widget de pontos "tipo jogo": mostra quanto a equipe do usuário já
// pontuou no geral (soma das avaliações dos desafios) e sua posição no
// ranking geral. Sempre que uma nova avaliação da equipe chega via
// socket, o número sobe com uma pequena animação e um "+N" flutuante,
// como um placar de jogo.
export default function PontosWidget({ usuario }) {
  const [pontos, setPontos] = useState(null);
  const [posicao, setPosicao] = useState(null);
  const [ganho, setGanho] = useState(null);
  const [subindo, setSubindo] = useState(false);
  const anteriorRef = useRef(null);

  async function carregar() {
    if (!usuario?.equipeId) return;
    try {
      const ranking = await rankingGeral();
      const minha = ranking.find((r) => r.equipeId === usuario.equipeId);
      if (!minha) return;

      if (anteriorRef.current != null && minha.pontuacao > anteriorRef.current) {
        const diferenca = minha.pontuacao - anteriorRef.current;
        setGanho({ valor: diferenca, chave: Date.now() });
        setSubindo(true);
        setTimeout(() => setSubindo(false), 700);
      }
      anteriorRef.current = minha.pontuacao;
      setPontos(minha.pontuacao);
      setPosicao(minha.posicao);
    } catch {
      // widget não é crítico — falha silenciosa
    }
  }

  useEffect(() => {
    anteriorRef.current = null;
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.equipeId]);

  useEffect(() => {
    function aoAvaliar(avaliacao) {
      if (avaliacao?.equipeId && avaliacao.equipeId !== usuario?.equipeId) return;
      carregar();
    }
    socket.on('avaliacao:registrada', aoAvaliar);
    return () => socket.off('avaliacao:registrada', aoAvaliar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.equipeId]);

  useEffect(() => {
    if (!ganho) return undefined;
    const t = setTimeout(() => setGanho(null), 1600);
    return () => clearTimeout(t);
  }, [ganho]);

  if (!usuario) return null;

  if (!usuario.equipeId) {
    return (
      <span className="pontos-chip pontos-vazio" title="Entre em uma equipe pra começar a ganhar pontos">
        <span className="pontos-icon" aria-hidden="true">🏆</span>
        <span className="pontos-label">Sem equipe</span>
      </span>
    );
  }

  return (
    <a href="#/ranking" className="pontos-chip" title="Ver ranking completo">
      <span className="pontos-icon" aria-hidden="true">🏆</span>
      <span className={`pontos-valor ${subindo ? 'pontos-valor-subindo' : ''}`}>
        {pontos != null ? FORMATO_PONTOS.format(pontos) : '—'}
        <span className="pontos-unidade">pts</span>
      </span>
      {posicao && <span className="pontos-posicao">{posicao}º</span>}
      {ganho && (
        <span key={ganho.chave} className="pontos-ganho">
          +{FORMATO_PONTOS.format(ganho.valor)}
        </span>
      )}
    </a>
  );
}
