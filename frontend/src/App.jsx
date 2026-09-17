import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import Ranking from './pages/Ranking';
import Equipes from './pages/Equipes';
import Desafios from './pages/Desafios';
import Perfil from './pages/Perfil';
import Auth from './pages/Auth';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import useHashRoute from './hooks/useHashRoute';
import { usuarioAtual } from './services/auth';
import './index.css';

export default function App() {
  const hash = useHashRoute();
  const [usuario, setUsuario] = useState(() => usuarioAtual());

  const isDesafios = hash.startsWith('#/desafios');
  const isRanking = hash.startsWith('#/ranking');
  const isEquipes = hash.startsWith('#/equipes');
  const isPerfil = hash.startsWith('#/perfil');
  const isAuth = hash.startsWith('#/entrar') || !usuario;

  // Sem sessão ativa, manda sempre pra tela de login/cadastro.
  useEffect(() => {
    if (!usuario && hash !== '#/entrar') {
      window.location.hash = '#/entrar';
    }
  }, [usuario, hash]);

  // Quando o hash aponta pra uma âncora dentro do painel (ex: #coluna-PRONTO),
  // rola até ela assim que o painel estiver montado na tela.
  useEffect(() => {
    if (isAuth || isDesafios || isRanking || isPerfil || isEquipes) return;
    const id = hash.replace('#', '');
    if (!id) return;
    const alvo = document.getElementById(id);
    if (alvo) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash, isAuth, isDesafios, isRanking, isPerfil, isEquipes]);

  if (isAuth) {
    return (
      <Auth
        onAutenticado={(usuarioLogado) => {
          setUsuario(usuarioLogado);
          window.location.hash = '#/perfil';
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar currentHash={hash} onSair={() => setUsuario(null)} />

      <div className="main">
        <Topbar />
        {isDesafios ? <Desafios /> : isPerfil ? <Perfil /> : isRanking ? <Ranking /> : isEquipes ? <Equipes /> : <Dashboard />}
      </div>
    </div>
  );
}
