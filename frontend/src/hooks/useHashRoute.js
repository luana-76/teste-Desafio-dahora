import { useEffect, useState } from 'react';

// Router minimalista baseado em hash — o suficiente para alternar entre o
// painel e a tela de ranking sem precisar adicionar react-router ao projeto.
export default function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    function onHashChange() {
      setHash(window.location.hash);
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return hash;
}
