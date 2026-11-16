import { Link } from "react-router-dom";

export default function PersonPicker({
  mode,
  participants,
  title,
  subtitle,
}) {
  const base = mode === "view" ? "/ver" : "/editar";

  return (
    <section className="picker">
      <Link to="/" className="back-link">
        ← Volver al inicio
      </Link>
      <h1>{title}</h1>
      <p className="lead">{subtitle}</p>

      {participants.length === 0 ? (
        <div className="empty-box">
          Todavía no hay personas. Usa <strong>Personalizar</strong> (arriba a
          la derecha) para agregar nombres.
        </div>
      ) : (
        <div className="name-grid" role="list">
          {participants.map((person) => (
            <Link
              key={person.id}
              to={`${base}/${person.id}`}
              className="name-card"
              role="listitem"
            >
              <span className="name-card-label">{person.name}</span>
              <span className="name-card-meta">
                {person.item_count > 0
                  ? `${person.item_count} deseo${person.item_count === 1 ? "" : "s"}`
                  : "Sin deseos aún"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
