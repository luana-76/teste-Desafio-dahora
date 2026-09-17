import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const CORES = [
  {
    nome: 'Equipe Azul',
    classe: 'azul',
    cor: '#2f80ed',
    descricao: 'Foco em organização e execução.',
  },
  {
    nome: 'Equipe Laranja',
    classe: 'laranja',
    cor: '#f2994a',
    descricao: 'Foco em criatividade e soluções.',
  },
  {
    nome: 'Equipe Verde',
    classe: 'verde',
    cor: '#27ae60',
    descricao: 'Foco em colaboração e resultados.',
  },
  {
    nome: 'Equipe Roxa',
    classe: 'roxa',
    cor: '#9b51e0',
    descricao: 'Foco em estratégia e inovação.',
  },
];

function iniciais(nome) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase();
}

export default function Equipes() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api
      .get('/orders')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setPedidos(res.data);
        } else {
          setErro('Não foi possível identificar os participantes.');
        }
      })
      .catch(() => setErro('Não foi possível carregar as equipes. Verifique se o backend está rodando.'))
      .finally(() => setCarregando(false));
  }, []);

  const participantes = useMemo(() => {
    const nomes = pedidos
      .map((pedido) => pedido.cliente?.trim())
      .filter(Boolean);

    return [...new Map(nomes.map((nome) => [nome.toLowerCase(), nome])).values()]
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [pedidos]);

  const equipes = useMemo(() => {
    return CORES.map((equipe, indice) => ({
      ...equipe,
      membros: participantes.filter((_, index) => index % CORES.length === indice),
    }));
  }, [participantes]);

  return (
    <div className="dashboard equipes">
      <header className="equipes-header">
        <div>
          <h1>Equipes</h1>
          <p className="equipes-subtitle">
            Os participantes são organizados em equipes identificadas por cores.
          </p>
        </div>
        <div className="equipes-total">
          <strong>{participantes.length}</strong>
          <span>participantes</span>
        </div>
      </header>

      {erro && <p className="error-banner">{erro}</p>}

      {carregando ? (
        <p className="loading">Carregando equipes...</p>
      ) : (
        <div className="equipes-grid">
          {equipes.map((equipe) => (
            <section key={equipe.nome} className={`equipe-card equipe-${equipe.classe}`}>
              <div className="equipe-card-top">
                <div className="equipe-cor" style={{ backgroundColor: equipe.cor }} />
                <div>
                  <h2>{equipe.nome}</h2>
                  <p>{equipe.descricao}</p>
                </div>
                <span className="equipe-count">{equipe.membros.length}</span>
              </div>

              <div className="equipe-members">
                {equipe.membros.length > 0 ? (
                  equipe.membros.map((membro) => (
                    <div className="equipe-member" key={membro}>
                      <div className="equipe-avatar" style={{ backgroundColor: equipe.cor }}>
                        {iniciais(membro)}
                      </div>
                      <span>{membro}</span>
                    </div>
                  ))
                ) : (
                  <div className="equipe-empty">Nenhum participante nesta equipe.</div>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="equipes-legenda">
        <span>Divisão atual:</span>
        {CORES.map((equipe) => (
          <span className="legenda-item" key={equipe.nome}>
            <i style={{ backgroundColor: equipe.cor }} />
            {equipe.nome}
          </span>
        ))}
      </div>
    </div>
  );
}
