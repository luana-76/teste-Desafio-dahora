// Home do Administrador: só uma frase de boas-vindas sobre um fundo animado.
// (O participante continua vendo o Dashboard completo — ver App.jsx.)
const FRASE = 'Você comanda o Desafio da Hora.';

export default function AdminHome() {
  return (
    <div className="admin-home" id="topo">
      <div className="admin-bg" aria-hidden="true">
        <span className="admin-blob admin-blob-1" />
        <span className="admin-blob admin-blob-2" />
        <span className="admin-blob admin-blob-3" />
        <span className="admin-ring admin-ring-1" />
        <span className="admin-ring admin-ring-2" />
        <span className="admin-ring admin-ring-3" />
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className={`admin-spark admin-spark-${i + 1}`} />
        ))}
      </div>

      <h1 className="admin-frase" aria-label={FRASE}>
        {FRASE.split(' ').map((palavra, i) => (
          <span
            key={i}
            className="admin-palavra"
            style={{ animationDelay: `${0.15 + i * 0.18}s` }}
            aria-hidden="true"
          >
            {palavra}
          </span>
        ))}
      </h1>
    </div>
  );
}
