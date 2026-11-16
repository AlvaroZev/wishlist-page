import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";

export default function ViewWishlist() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const result = await api.getWishlist(id);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <div className="status-panel">Cargando lista…</div>;
  }

  if (error) {
    return (
      <div className="status-panel error">
        <p>{error}</p>
        <Link to="/ver" className="btn btn-primary">
          Volver
        </Link>
      </div>
    );
  }

  const { participant, items } = data;
  const visible = items.filter((item) => item.text?.trim() || item.url);

  return (
    <section className="wishlist-page">
      <Link to="/ver" className="back-link">
        ← Elegir otra persona
      </Link>

      <div className="editing-banner view">
        Estás viendo la lista de
        <strong> {participant.name}</strong>
      </div>

      <h1>¿Qué le gustaría a {participant.name}?</h1>
      <p className="lead">
        Ideas de regalo. Si ves un enlace pequeño, tócalo para abrir más detalles.
      </p>

      {visible.length === 0 ? (
        <div className="empty-box">
          {participant.name} todavía no agregó pedidos.
        </div>
      ) : (
        <ul className="wish-list view-mode">
          {visible.map((item, index) => (
            <li key={item.id} className="wish-row">
              <span className="wish-num">{index + 1}</span>
              <div className="wish-body">
                <p className="wish-text">{item.text}</p>
                {item.url ? (
                  <a
                    className="wish-link"
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ver enlace
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
