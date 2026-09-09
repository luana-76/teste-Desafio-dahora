function IconPainel() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <rect x="3.5" y="4" width="7" height="7" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="4" width="7" height="16" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3.5" y="14" width="7" height="6" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconAFazer() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v4l2.6 2.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconAndamento() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M4 12a8 8 0 0 1 13.6-5.7M20 12a8 8 0 0 1-13.6 5.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M17.6 3.5v3.3h-3.3M6.4 20.5v-3.3h3.3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconConcluidos() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M4.5 12.5 9 17l10.5-11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconRanking() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M8 20h8M12 15v5M6.5 4h11l-1 6a4.5 4.5 0 0 1-9 0Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M6.5 6H4a2 2 0 0 0 2.2 3.9M17.5 6H20a2 2 0 0 1-2.2 3.9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconPerfil() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSair() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path
        d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M15 16l4-4-4-4M19 12H9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const NAV_LINKS = [
  { href: '#topo', label: 'Painel', Icon: IconPainel },
  { href: '#coluna-PENDENTE', label: 'A fazer', Icon: IconAFazer },
  { href: '#coluna-EM_PREPARO', label: 'Em andamento', Icon: IconAndamento },
  { href: '#coluna-ENTREGUE', label: 'Concluídos', Icon: IconConcluidos },
  { href: '#/ranking', label: 'Ranking', Icon: IconRanking },
  { href: '#/perfil', label: 'Perfil', Icon: IconPerfil },
];

export default function Sidebar({ currentHash = '' }) {
  // Sem hash ainda (primeiro load) conta como "Painel".
  const hashAtivo = currentHash || '#topo';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            d="M3 8.5 12 3l9 5.5v6L12 20l-9-5.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="11.3" r="2.1" fill="currentColor" />
        </svg>
        <span>
          Desafio <em>Dahora</em>
        </span>
      </div>

      <nav className="sidebar-nav">
        {NAV_LINKS.map(({ href, label, Icon }) => (
          <a key={href} href={href} className={hashAtivo === href ? 'active' : ''}>
            <Icon />
            {label}
          </a>
        ))}
      </nav>

      <button type="button" className="sidebar-sair">
        <IconSair />
        Sair
      </button>
    </aside>
  );
}
