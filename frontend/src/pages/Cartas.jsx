import { useEffect, useMemo, useState } from 'react';
import { usuarioAtual } from '../services/auth';
import { listarCartas, registrarCarta, TIPOS_CARTA, listarCartasDesbloqueadas, resgatarCodigoCarta } from '../services/cartas';
import { listarDesafios } from '../services/desafios';
import socket from '../services/socket';
import './Cartas.css';

const ICONES = { AULA: '📚', MENTOR: '🧑‍🏫', DICA: '💡' };
const NOMES = { AULA: 'Aula', MENTOR: 'Mentoria', DICA: 'Dica' };

function diaRecife(valor = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Recife', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(valor));
  const valores = Object.fromEntries(partes.map((parte) => [parte.type, parte.value]));
  return `${valores.year}-${valores.month}-${valores.day}`;
}

export default function Cartas() {
  const usuario = usuarioAtual();
  const equipe = usuario?.equipe;
  const ehAdmin = usuario?.papel === 'ADMIN';
  const [aba, setAba] = useState('inventario');
  const [desafios, setDesafios] = useState([]);
  const [usadas, setUsadas] = useState([]);
  const [desbloqueadas, setDesbloqueadas] = useState([]);
  const [selecionada, setSelecionada] = useState(null);
  const [desafioId, setDesafioId] = useState('');
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function carregar() {
    try {
      const [listaDesafios, listaCartas, listaDesbloqueadas] = await Promise.all([
        listarDesafios(),
        ehAdmin ? listarCartas({}) : (equipe?.id ? listarCartas({ equipeId: equipe.id }) : Promise.resolve([])),
        usuario?.id ? listarCartasDesbloqueadas() : Promise.resolve([]),
      ]);
      setDesafios(listaDesafios.filter((d) => ['DISPONIVEL', 'EM_ANDAMENTO'].includes(d.status)));
      setUsadas(listaCartas);
      setDesbloqueadas(listaDesbloqueadas);
    } catch (err) {
      setErro(err.response?.data?.error || 'Não foi possível carregar as cartas.');
    }
  }

  useEffect(() => {
    carregar();
    socket.on('carta:registrada', carregar);
    return () => socket.off('carta:registrada', carregar);
  }, [equipe?.id, usuario?.id]);

  const tiposLiberados = useMemo(() => new Set(desbloqueadas.map((c) => c.tipo)), [desbloqueadas]);
  const cartasDisponiveis = useMemo(() => TIPOS_CARTA.map((c) => {
    const usosDaCarta = usadas.filter((u) => u.tipo === c.valor);
    const usadaHoje = usosDaCarta.some((u) => (u.diaUso || diaRecife(u.horario)) === diaRecife());
    return {
      ...c, icone: ICONES[c.valor], usos: usosDaCarta.length,
      desbloqueada: tiposLiberados.has(c.valor), usadaHoje,
    };
  }), [usadas, tiposLiberados]);

  async function desbloquear(e) {
    e.preventDefault();
    if (!codigo.trim()) return;
    setCarregando(true); setErro(''); setSucesso('');
    try {
      const resultado = await resgatarCodigoCarta(codigo.trim());
      setSucesso(`Carta ${NOMES[resultado.tipo] || resultado.tipo} desbloqueada com sucesso!`);
      setCodigo(''); setAba('inventario'); await carregar();
    } catch (err) {
      setErro(err.response?.data?.error || 'Não foi possível validar o código.');
    } finally { setCarregando(false); }
  }

  async function usarCarta(e) {
    e.preventDefault();
    if (!selecionada || !equipe?.id || !desafioId) return;
    setCarregando(true); setErro(''); setSucesso('');
    try {
      await registrarCarta({ equipeId: equipe.id, desafioId, tipo: selecionada.valor, beneficio: selecionada.descricao, responsavel: usuario.nome });
      setSucesso(`${selecionada.label} ativada! Foram utilizados 10 minutos do tempo da equipe.`);
      setSelecionada(null); setDesafioId(''); await carregar();
    } catch (err) { setErro(err.response?.data?.error || 'Não foi possível usar esta carta.'); }
    finally { setCarregando(false); }
  }

  if (ehAdmin) {
    const porDia = [...usadas].sort((a, b) => new Date(b.horario) - new Date(a.horario));
    const formatarData = (valor) => valor ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Recife' }).format(new Date(valor)) : '—';
    return (
      <div className="dashboard cartas-page">
        <header className="cartas-header">
          <div><span className="cartas-kicker">ADMINISTRAÇÃO</span><h1>Histórico de cartas</h1><p>Acompanhe qual equipe usou cada carta, em qual desafio e em que dia. A equipe pode usar uma carta de cada tipo por dia.</p></div>
          <div className="cartas-tempo"><strong>{usadas.length}</strong><span>uso(s) registrado(s)</span></div>
        </header>
        <section className="historico-cartas admin-historico-cartas">
          <div className="secao-titulo"><div><span className="cartas-kicker">AUDITORIA</span><h2>Cartas usadas pelas equipes</h2></div><span>{new Set(usadas.map((c) => c.equipeId)).size} equipe(s)</span></div>
          {porDia.length === 0 ? <p className="empty">Nenhuma carta foi utilizada ainda.</p> : (
            <div className="admin-cartas-tabela-wrap"><table className="admin-cartas-tabela">
              <thead><tr><th>Dia e horário</th><th>Equipe</th><th>Carta</th><th>Desafio</th><th>Responsável</th><th>Tempo</th></tr></thead>
              <tbody>{porDia.map((carta) => <tr key={carta.id}>
                <td>{formatarData(carta.horario)}</td>
                <td><strong>{carta.equipe?.nome || 'Equipe removida'}</strong></td>
                <td><span>{ICONES[carta.tipo] || '🃏'} {NOMES[carta.tipo] || carta.tipo}</span></td>
                <td>{carta.desafio ? `#${carta.desafio.numero} — ${carta.desafio.titulo}` : '—'}</td>
                <td>{carta.responsavel || '—'}</td>
                <td>{carta.tempoUtilizado} min</td>
              </tr>)}</tbody>
            </table></div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard cartas-page">
      <header className="cartas-header">
        <div><span className="cartas-kicker">INVENTÁRIO DE VANTAGENS</span><h1>Cartas de Poder</h1><p>Desbloqueie cartas com um código e use suas vantagens durante os desafios.</p></div>
        <div className="cartas-tempo"><strong>−10 min</strong><span>por uso</span></div>
      </header>

      <nav className="cartas-abas" aria-label="Seções de cartas">
        <button type="button" className={aba === 'inventario' ? 'ativa' : ''} onClick={() => { setAba('inventario'); setErro(''); }}>Minhas cartas <span>{desbloqueadas.length}</span></button>
        <button type="button" className={aba === 'codigo' ? 'ativa' : ''} onClick={() => { setAba('codigo'); setErro(''); setSucesso(''); }}>🔐 Desbloquear com código</button>
      </nav>

      {aba === 'codigo' ? (
        <section className="codigo-painel">
          <div className="codigo-ilustracao">🔑</div>
          <span className="cartas-kicker">ACESSO ESPECIAL</span>
          <h2>Você recebeu um código?</h2>
          <p>Digite o código fornecido pela organização para liberar uma carta de Aula, Mentoria ou Dica no seu inventário.</p>
          <form className="codigo-form" onSubmit={desbloquear}>
            <label htmlFor="codigo-carta">Código de desbloqueio</label>
            <input id="codigo-carta" value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} placeholder="EX.: ABCDE-FG234" maxLength={30} autoComplete="off" required />
            <button className="btn btn-primary" type="submit" disabled={carregando || !codigo.trim()}>{carregando ? 'Verificando...' : 'Validar e liberar carta'}</button>
          </form>
          <small className="codigo-nota">Cada código é individual e pode ser resgatado uma única vez.</small>
        </section>
      ) : (
        <>
          {!equipe ? <div className="cartas-alerta">Você ainda não está em uma equipe. Entre em uma equipe para poder usar as cartas.</div> : <div className="cartas-equipe"><span>⚡ Sua equipe</span><strong>{equipe.nome}</strong><small>As cartas utilizadas ficam registradas no histórico da equipe.</small></div>}
          <section className="cartas-grid">
            {cartasDisponiveis.map((carta) => (
              <button type="button" key={carta.valor} disabled={!carta.desbloqueada || carta.usadaHoje} className={`carta-card ${selecionada?.valor === carta.valor ? 'selecionada' : ''} ${!carta.desbloqueada || carta.usadaHoje ? 'carta-bloqueada' : ''}`} onClick={() => { setSelecionada(carta); setErro(''); setSucesso(''); }}>
                <span className="carta-glow" />
                <span className="carta-icon">{carta.usadaHoje ? '✓' : carta.desbloqueada ? carta.icone : '🔒'}</span>
                <span className="carta-tag">{carta.usadaHoje ? 'JÁ USADA HOJE' : carta.desbloqueada ? 'CARTA DESBLOQUEADA' : 'CARTA BLOQUEADA'}</span>
                <strong>{carta.label.replace('Carta ', '')}</strong><span className="carta-desc">{carta.descricao}</span>
                <span className="carta-footer"><b>{carta.usadaHoje ? 'DISPONÍVEL AMANHÃ' : carta.desbloqueada ? 'ATIVAR' : 'USE UM CÓDIGO'}</b><span>{carta.desbloqueada && !carta.usadaHoje ? '10 min' : carta.usadaHoje ? '✓' : '🔐'}</span></span>
              </button>
            ))}
          </section>
          {selecionada?.desbloqueada && (
            <form className="ativar-carta" onSubmit={usarCarta}>
              <div><span className="cartas-kicker">CARTA SELECIONADA</span><h2>{selecionada.icone} {selecionada.label}</h2><p>{selecionada.descricao}</p></div>
              <label>Em qual desafio usar?<select value={desafioId} onChange={(e) => setDesafioId(e.target.value)} required><option value="">Selecione um desafio</option>{desafios.map((d) => <option key={d.id} value={d.id}>#{d.numero} — {d.titulo}</option>)}</select></label>
              <button className="btn btn-primary" type="submit" disabled={carregando || !desafioId}>{carregando ? 'Ativando...' : 'Usar carta agora'}</button>
            </form>
          )}
          <section className="historico-cartas"><div className="secao-titulo"><div><span className="cartas-kicker">REGISTRO</span><h2>Cartas utilizadas</h2></div><span>{usadas.length} uso(s)</span></div>
            {usadas.length === 0 ? <p className="empty">Sua equipe ainda não utilizou nenhuma carta.</p> : <div className="historico-lista">{usadas.slice(0, 8).map((carta) => <div className="historico-item" key={carta.id}><span className="historico-icon">{ICONES[carta.tipo]}</span><div><strong>{NOMES[carta.tipo] || carta.tipo}</strong><small>{carta.desafio ? `Desafio #${carta.desafio.numero} — ${carta.desafio.titulo}` : 'Desafio não informado'}</small></div><b>−{carta.tempoUtilizado} min</b></div>)}</div>}
          </section>
        </>
      )}
      {sucesso && <div className="cartas-sucesso" role="status">✓ {sucesso}</div>}
      {erro && <div className="cartas-erro" role="alert">{erro}</div>}
    </div>
  );
}
