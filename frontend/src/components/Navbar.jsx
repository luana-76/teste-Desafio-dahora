import { sair, usuarioAtual } from '../services/auth';

const NAV_LINKS = [
  { href: '#topo', label: 'Painel' },
  { href: '#/equipes', label: 'Equipes' },
  { href: '#/desafios', label: 'Desafios' },
  { href: '#/cartas', label: 'Cartas' },
  { href: '#/quadro', label: 'Quadro' },
  { href: '#/ranking', label: 'Ranking' },
  { href: '#/perfil', label: 'Perfil' },
];

export default function Navbar({ currentHash = '', onSair }) {
  const hashAtivo = currentHash || '#topo';
  const usuario = usuarioAtual();
  // O Administrador organiza o evento pelas telas de Equipes, Desafios e
  // Ranking — o Quadro (organização interna de cada equipe) não faz
  // sentido pra quem não integra uma equipe, então some do menu do ADMIN.
  const links = usuario?.papel === 'ADMIN' ? NAV_LINKS.filter((l) => l.href !== '#/quadro') : NAV_LINKS;

  function handleSair() {
    sair();
    onSair?.();
    window.location.hash = '#/entrar';
  }

  return (
    <div className="navbar">
      <a className="navbar-logo" href="#topo">
        Desafio <em>Dahora</em>
      </a>

      <nav className="navbar-nav">
        {links.map(({ href, label }) => (
          <a key={href} href={href} className={hashAtivo === href ? 'active' : ''}>
            {label}
          </a>
        ))}
      </nav>

      <button type="button" className="btn btn-primary navbar-sair" onClick={handleSair}>
        Sair
      </button>
    </div>
  );
}
