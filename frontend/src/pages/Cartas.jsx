import { useEffect, useMemo, useState } from 'react';
import { usuarioAtual } from '../services/auth';
import { listarCartas, registrarCarta, TIPOS_CARTA } from '../services/cartas';
import { listarDesafios } from '../services/desafios';
import socket from '../services/socket';
import './Cartas.css';

const ICONES = { AULA: '📚', MENTOR: '🧑‍🏫', DICA: '💡' };

export default function Cartas() {
  const usuario = usuarioAtual();
  const equipe = usuario?.equipe;
  const [desafios, setDesafios] = useState([]);
  const [usadas, setUsadas] = useState([]);
  const [selecionada, setSelecionada] = useState(null);
  const [desafioId, setDesafioId] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function carregar() {
    try {
      const [listaDesafios, listaCartas] = await Promise.all([
        listarDesafios(),
        equipe?.id ? listarCartas({ equipeId: equipe.id }) : Promise.resolve([]),
      ]);
      setDesafios(listaDesafios.filter((d) => ['DISPONIVEL', 'EM_ANDAMENTO'].includes(d.status)));
      setUsadas(listaCartas);
    } catch (err) {
      setErro(err.response?.data?.error || 'Não foi possível carregar as cartas.');
    }
  }

  useEffect(() => {
    carregar();
    socket.on('carta:registrada', carregar);
    return () => socket.off('carta:registrada', carregar);
  }, [equipe?.id]);

  const cartasDisponiveis = useMemo(() => TIPOS_CARTA.map((c) => ({
    ...c,
    icone: ICONES[c.valor],
    usos: usadas.filter((u) => u.tipo === c.valor).length,
  })), [usadas]);

  async function usarCarta(e) {
    e.preventDefault();
    if (!selecionada || !equipe?.id || !desafioId) return;
    setCarregando(true);
    setErro('');
    setSucesso('');
    try {
      await registrarCarta({
        equipeId: equipe.id,
        desafioId,
        tipo: selecionada.valor,
        beneficio: selecionada.descricao,
        responsavel: usuario.nome,
      });
      setSucesso(`${selecionada.label} ativada! Foram utilizados 10 minutos do tempo da equipe.`);
      setSelecionada(null);
      setDesafioId('');
      await carregar();
    } catch (err) {
      setErro(err.response?.data?.error || 'Não foi possível usar esta carta.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="dashboard cartas-page">
      <header className="cartas-header">
        <div>
          <span className="cartas-kicker">INVENTÁRIO DE VANTAGENS</span>
          <h1>Cartas de Poder</h1>
          <p>Use uma carta no momento certo para conseguir uma vantagem durante o desafio.</p>
        </div>
        <div className="cartas-tempo"><strong>−10 min</strong><span>por uso</span></div>
      </header>

      {!equipe ? (
        <div className="cartas-alerta">Você ainda não está em uma equipe. Entre em uma equipe para poder usar as cartas.</div>
      ) : (
        <>
          <div className="cartas-equipe"><span>⚡ Sua equipe</span><strong>{equipe.nome}</strong><small>Você joga pelo time e as cartas são registradas no histórico da equipe.</small></div>

          <section className="cartas-grid">
            {cartasDisponiveis.map((carta) => (
              <button
                type="button"
                key={carta.valor}
                className={`carta-card ${selecionada?.valor === carta.valor ? 'selecionada' : ''}`}
                onClick={() => setSelecionada(carta)}
              >
                <span className="carta-glow" />
                <span className="carta-icon">{carta.icone}</span>
                <span className="carta-tag">CARTA BÔNUS</span>
                <strong>{carta.label.replace('Carta ', '')}</strong>
                <span className="carta-desc">{carta.descricao}</span>
                <span className="carta-footer"><b>ATIVAR</b><span>10 min</span></span>
              </button>
            ))}
          </section>

          {selecionada && (
            <form className="ativar-carta" onSubmit={usarCarta}>
              <div>
                <span className="cartas-kicker">CARTA SELECIONADA</span>
                <h2>{selecionada.icone} {selecionada.label}</h2>
                <p>{selecionada.descricao}</p>
              </div>
              <label>
                Em qual desafio usar?
                <select value={desafioId} onChange={(e) => setDesafioId(e.target.value)} required>
                  <option value="">Selecione um desafio</option>
                  {desafios.map((d) => <option key={d.id} value={d.id}>#{d.numero} — {d.titulo}</option>)}
                </select>
              </label>
              <button className="btn btn-primary" type="submit" disabled={carregando || !desafioId}>
                {carregando ? 'Ativando...' : 'Usar carta agora'}
              </button>
            </form>
          )}

          {sucesso && <div className="cartas-sucesso">✓ {sucesso}</div>}
          {erro && <div className="cartas-erro">{erro}</div>}

          <section className="historico-cartas">
            <div className="secao-titulo"><div><span className="cartas-kicker">REGISTRO</span><h2>Cartas utilizadas</h2></div><span>{usadas.length} uso(s)</span></div>
            {usadas.length === 0 ? <p className="empty">Sua equipe ainda não utilizou nenhuma carta.</p> : (
              <div className="historico-lista">
                {usadas.slice(0, 8).map((carta) => (
                  <div className="historico-item" key={carta.id}>
                    <span className="historico-icon">{ICONES[carta.tipo]}</span>
                    <div><strong>{carta.tipo === 'AULA' ? 'Aula' : carta.tipo === 'MENTOR' ? 'Mentor' : 'Dica'}</strong><small>{carta.desafio ? `Desafio #${carta.desafio.numero} — ${carta.desafio.titulo}` : 'Desafio não informado'}</small></div>
                    <b>−{carta.tempoUtilizado} min</b>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
