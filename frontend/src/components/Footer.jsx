export default function Footer() {
  return (
    <>
      <section className="cta">
        <h2>36 desafios, 3 dias, uma equipe vencedora</h2>
        <a className="btn btn-primary" href="#/ranking">
          Ver ranking
        </a>
      </section>

      <footer className="footer">
        <div className="footer-brand">
          <span className="navbar-logo">
            Desafio <em>Dahora</em>
          </span>
          <p>Sistema de acompanhamento da oficina REC'n'PLAY — desafios, equipes, ranking e cronômetro em tempo real.</p>
        </div>

        <div className="footer-col">
          <h3>Competição</h3>
          <a href="#/desafios">Desafios</a>
          <a href="#/equipes">Equipes</a>
          <a href="#/ranking">Ranking</a>
        </div>

        <div className="footer-col">
          <h3>Conta</h3>
          <a href="#/perfil">Meu perfil</a>
        </div>
      </footer>
    </>
  );
}
