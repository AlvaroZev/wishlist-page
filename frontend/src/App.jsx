import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { api } from "./api";
import Layout from "./components/Layout.jsx";
import Landing from "./pages/Landing.jsx";
import PersonPicker from "./pages/PersonPicker.jsx";
import ViewWishlist from "./pages/ViewWishlist.jsx";
import EditWishlist from "./pages/EditWishlist.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  const [eventTitle, setEventTitle] = useState("Amigo Secreto Navideño");
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const [settings, people] = await Promise.all([
        api.getSettings(),
        api.getParticipants(),
      ]);
      setEventTitle(settings.eventTitle);
      setParticipants(people);
    } catch (err) {
      setError(err.message || "No se pudo cargar la página");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <Layout
      eventTitle={eventTitle}
      onCustomize={() => navigate("/personalizar")}
    >
      {loading ? (
        <div className="status-panel" role="status">
          Cargando…
        </div>
      ) : error ? (
        <div className="status-panel error">
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={refresh}>
            Reintentar
          </button>
        </div>
      ) : (
        <Routes>
          <Route
            path="/"
            element={<Landing eventTitle={eventTitle} />}
          />
          <Route
            path="/ver"
            element={
              <PersonPicker
                mode="view"
                participants={participants}
                title="¿A quién quieres ver?"
                subtitle="Elige la persona cuya lista de regalos quieres consultar."
              />
            }
          />
          <Route
            path="/editar"
            element={
              <PersonPicker
                mode="edit"
                participants={participants}
                title="¿Quién eres?"
                subtitle="Elige tu nombre para agregar o cambiar tus pedidos de regalo."
              />
            }
          />
          <Route path="/ver/:id" element={<ViewWishlist />} />
          <Route path="/editar/:id" element={<EditWishlist />} />
          <Route
            path="/personalizar"
            element={
              <Admin
                eventTitle={eventTitle}
                onUpdated={refresh}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </Layout>
  );
}
