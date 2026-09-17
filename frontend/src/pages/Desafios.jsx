import { useMemo, useState } from 'react';

const DESAFIOS = [
  { id: 1, nivel: 'Nível 1', titulo: 'Lógica de Programação', tema: 'Algoritmos', descricao: 'Resolva problemas usando lógica, variáveis, condições e repetição.', pontos: 100, tempo: '20 min', icon: '⌘' },
  { id: 2, nivel: 'Nível 2', titulo: 'HTML e CSS', tema: 'Front-end', descricao: 'Monte uma página web usando estrutura semântica e estilos responsivos.', pontos: 120, tempo: '25 min', icon: '</>' },
  { id: 3, nivel: 'Nível 3', titulo: 'JavaScript', tema: 'Programação Web', descricao: 'Crie interações e resolva pequenos problemas com JavaScript.', pontos: 150, tempo: '30 min', icon: 'JS' },
  { id: 4, nivel: 'Nível 4', titulo: 'Git e GitHub', tema: 'Versionamento', descricao: 'Organize um projeto, faça commits e trabalhe com branches.', pontos: 160, tempo: '25 min', icon: 'git' },
  { id: 5, nivel: 'Nível 5', titulo: 'React', tema: 'Desenvolvimento', descricao: 'Construa componentes e gerencie estados em uma aplicação React.', pontos: 200, tempo: '35 min', icon: '⚛' },
  { id: 6, nivel: 'Nível 6', titulo: 'APIs e Integrações', tema: 'Back-end', descricao: 'Consuma uma API REST e trate dados recebidos em JSON.', pontos: 220, tempo: '35 min', icon: 'API' },
  { id: 7, nivel: 'Nível 7', titulo: 'Banco de Dados', tema: 'Dados', descricao: 'Modele tabelas e escreva consultas SQL para uma aplicação.', pontos: 240, tempo: '40 min', icon: 'DB' },
  { id: 8, nivel: 'Nível 8', titulo: 'DevOps e Cloud', tema: 'Infraestrutura', descricao: 'Automatize uma entrega usando conceitos de Docker e CI/CD.', pontos: 300, tempo: '45 min', icon: '☁' },
  { id: 9, nivel: 'Nível 9', titulo: 'Cibersegurança', tema: 'Segurança', descricao: 'Identifique vulnerabilidades e escolha medidas básicas de proteção.', pontos: 320, tempo: '45 min', icon: '⌁' },
];

export default function Desafios() {
  const [filtro, setFiltro] = useState('todos');
  const [selecionado, setSelecionado] = useState(null);

  const lista = useMemo(() => {
    if (filtro === 'iniciante') return DESAFIOS.slice(0, 3);
    if (filtro === 'intermediario') return DESAFIOS.slice(3, 6);
    if (filtro === 'avancado') return DESAFIOS.slice(6);
    return DESAFIOS;
  }, [filtro]);

  return (
    <div className="dashboard desafios">
      <header className="desafios-header">
        <div>
          <div className="desafios-kicker">REC’N’PLAY • TRILHA DE INOVAÇÃO</div>
          <h1>Desafios</h1>
          <p className="desafios-subtitle">Uma trilha inspirada no clima do REC’n’Play: tecnologia, criatividade, conexão e mão na massa.</p>
        </div>
        <div className="desafios-festival-badge"><span>REC’n’PLAY</span><strong>O futuro feito por gente</strong></div>
        <div className="desafios-progress">
          <strong>0/{DESAFIOS.length}</strong>
          <span>concluídos</span>
        </div>
      </header>

      <div className="desafios-filtros" role="tablist" aria-label="Filtrar desafios">
        {[
          ['todos', 'Todos'],
          ['iniciante', 'Iniciante'],
          ['intermediario', 'Intermediário'],
          ['avancado', 'Avançado'],
        ].map(([value, label]) => (
          <button key={value} className={filtro === value ? 'ativo' : ''} onClick={() => setFiltro(value)}>{label}</button>
        ))}
      </div>

      <div className="desafios-trilha">
        <div className="trilha-line" />
        {lista.map((desafio) => (
          <article className={`desafio-card ${desafio.id === 1 ? 'desafio-atual' : ''}`} key={desafio.id}>
            <div className="desafio-numero">{String(desafio.id).padStart(2, '0')}</div>
            <div className="desafio-icon">{desafio.icon}</div>
            <div className="desafio-conteudo">
              <div className="desafio-meta"><span>{desafio.nivel}</span><span>{desafio.tema}</span></div>
              <h2>{desafio.titulo}</h2>
              <p>{desafio.descricao}</p>
              <div className="desafio-info"><span>🏆 {desafio.pontos} pts</span><span>◷ {desafio.tempo}</span></div>
            </div>
            <button className="desafio-btn" onClick={() => setSelecionado(desafio)}>{desafio.id === 1 ? 'Começar desafio' : 'Ver desafio'}</button>
          </article>
        ))}
      </div>

      {selecionado && (
        <div className="desafio-modal-backdrop" onClick={() => setSelecionado(null)}>
          <div className="desafio-modal" onClick={(e) => e.stopPropagation()}>
            <button className="desafio-modal-close" onClick={() => setSelecionado(null)}>×</button>
            <span className="desafio-modal-nivel">{selecionado.nivel}</span>
            <h2>{selecionado.titulo}</h2>
            <p>{selecionado.descricao}</p>
            <div className="desafio-modal-stats"><span>🏆 {selecionado.pontos} pontos</span><span>◷ {selecionado.tempo}</span></div>
            <button className="desafio-modal-start" onClick={() => setSelecionado(null)}>Iniciar desafio</button>
          </div>
        </div>
      )}
    </div>
  );
}
