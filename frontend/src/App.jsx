import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import AdminHome from './pages/AdminHome';
import Ranking from './pages/Ranking';
import Equipes from './pages/Equipes';
import Desafios from './pages/Desafios';
import Quadro from './pages/Quadro';
import Perfil from './pages/Perfil';
import Cartas from './pages/Cartas';
import Auth from './pages/Auth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Topbar from './components/Topbar';
import useHashRoute from './hooks/useHashRoute';
import { usuarioAtual } from './services/auth';
import './index.css';

export default function App() {
  const hash = useHashRoute();
  const [usuario, setUsuario] = useState(() => usuarioAtual());

  const isRanking = hash.startsWith('#/ranking');
  const isEquipes = hash.startsWith('#/equipes');
  const isDesafios = hash.startsWith('#/desafios');
  const isQuadro = hash.startsWith('#/quadro');
  const isPerfil = hash.startsWith('#/perfil');
  const isCartas = hash.startsWith('#/cartas');
  const isAuth = hash.startsWith('#/entrar') || !usuario;

  // Sem sessão ativa, manda sempre pra tela de login/cadastro.
  useEffect(() => {
    if (!usuario && hash !== '#/entrar') {
      window.location.hash = '#/entrar';
    }
  }, [usuario, hash]);

  // A página de Quadro não existe para o Administrador (ver Navbar.jsx) —
  // se ele tentar acessar a rota direto pela URL, manda de volta pro painel.
  useEffect(() => {
    if (usuario?.papel === 'ADMIN' && isQuadro) {
      window.location.hash = '#topo';
    }
  }, [usuario, isQuadro]);

  // Quando o hash aponta pra uma âncora dentro do painel (ex: #coluna-PRONTO),
  // rola até ela assim que o painel estiver montado na tela.
  useEffect(() => {
    if (isAuth || isRanking || isEquipes || isDesafios || isQuadro || isPerfil || isCartas) return;
    const id = hash.replace('#', '');
    if (!id) return;
    const alvo = document.getElementById(id);
    if (alvo) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash, isAuth, isRanking, isEquipes, isDesafios, isQuadro, isPerfil, isCartas]);

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
      <Navbar currentHash={hash} onSair={() => setUsuario(null)} />

      <div className="main">
        <Topbar />
        {isPerfil ? (
          <Perfil />
        ) : isCartas ? (
          <Cartas />
        ) : isRanking ? (
          <Ranking />
        ) : isEquipes ? (
          <Equipes />
        ) : isDesafios ? (
          <Desafios />
        ) : isQuadro && usuario?.papel !== 'ADMIN' ? (
          <Quadro />
        ) : usuario?.papel === 'ADMIN' ? (
          <AdminHome />
        ) : (
          <Dashboard />
        )}
        <Footer />
      </div>
    </div>
  );
}
