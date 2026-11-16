import { Link } from "react-router-dom";

export default function Landing({ eventTitle }) {
  return (
    <section className="landing">
      <p className="eyebrow">Temporada navideña</p>
      <h1 className="hero-title">{eventTitle}</h1>
      <p className="hero-lead">
        ¿Qué quieres hacer hoy?
      </p>

      <div className="choice-grid">
        <Link to="/ver" className="choice-card choice-view">
          <span className="choice-kicker">Opción 1</span>
          <span className="choice-title">Vengo a ver regalos</span>
          <span className="choice-desc">
            Mira la lista de deseos de otra persona para saber qué regalarle.
          </span>
        </Link>

        <Link to="/editar" className="choice-card choice-edit">
          <span className="choice-kicker">Opción 2</span>
          <span className="choice-title">Vengo a agregar mis pedidos</span>
          <span className="choice-desc">
            Escribe lo que te gustaría recibir. Se guarda solo mientras escribes.
          </span>
        </Link>
      </div>
    </section>
  );
}
