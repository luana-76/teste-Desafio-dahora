import { useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Ranking from './pages/Ranking';
import Perfil from './pages/Perfil';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import useHashRoute from './hooks/useHashRoute';
import './index.css';

export default function App() {
  const hash = useHashRoute();
  const isRanking = hash.startsWith('#/ranking');
  const isPerfil = hash.startsWith('#/perfil');

  // Quando o hash aponta pra uma âncora dentro do painel (ex: #coluna-PRONTO),
  // rola até ela assim que o painel estiver montado na tela.
  useEffect(() => {
    if (isRanking || isPerfil) return;
    const id = hash.replace('#', '');
    if (!id) return;
    const alvo = document.getElementById(id);
    if (alvo) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash, isRanking, isPerfil]);

  return (
    <div className="app-shell">
      <Sidebar currentHash={hash} />

      <div className="main">
        <Topbar />
        {isPerfil ? <Perfil /> : isRanking ? <Ranking /> : <Dashboard />}
      </div>
    </div>
  );
}
