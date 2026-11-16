import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  api,
  clearAdminPassword,
  getAdminPassword,
  setAdminPassword,
} from "../api";

export default function Admin({ eventTitle, onUpdated }) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [people, setPeople] = useState([]);
  const [title, setTitle] = useState(eventTitle);
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTitle(eventTitle);
  }, [eventTitle]);

  useEffect(() => {
    const existing = getAdminPassword();
    if (!existing) return;
    (async () => {
      try {
        await api.verifyAdmin();
        setUnlocked(true);
        await loadPeople();
      } catch {
        clearAdminPassword();
      }
    })();
  }, []);

  async function loadPeople() {
    const rows = await api.adminParticipants();
    setPeople(rows);
  }

  async function handleUnlock(e) {
    e.preventDefault();
    setAuthError("");
    setBusy(true);
    try {
      setAdminPassword(password);
      await api.verifyAdmin();
      setUnlocked(true);
      await loadPeople();
      setPassword("");
    } catch (err) {
      clearAdminPassword();
      setAuthError(err.message || "Contraseña incorrecta");
    } finally {
      setBusy(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true);
    setMessage("");
    try {
      await api.addParticipant(newName.trim());
      setNewName("");
      await loadPeople();
      await onUpdated();
      setMessage("Persona agregada.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRename(id, currentName) {
    const next = window.prompt("Nuevo nombre:", currentName);
    if (!next || !next.trim() || next.trim() === currentName) return;
    setBusy(true);
    setMessage("");
    try {
      await api.updateParticipant(id, next.trim());
      await loadPeople();
      await onUpdated();
      setMessage("Nombre actualizado.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id, name) {
    const ok = window.confirm(
      `¿Eliminar a ${name}? También se borrará su lista de deseos.`
    );
    if (!ok) return;
    setBusy(true);
    setMessage("");
    try {
      await api.deleteParticipant(id);
      await loadPeople();
      await onUpdated();
      setMessage("Persona eliminada.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleTitleSave(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await api.updateSettings(title.trim());
      await onUpdated();
      setMessage("Título guardado.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  function lock() {
    clearAdminPassword();
    setUnlocked(false);
    setPeople([]);
    setMessage("");
  }

  if (!unlocked) {
    return (
      <section className="admin-page">
        <Link to="/" className="back-link">
          ← Volver al inicio
        </Link>
        <h1>Personalizar</h1>
        <p className="lead">
          Solo para quien organiza el intercambio. Escribe la contraseña para
          agregar o editar personas.
        </p>
        <form className="admin-lock" onSubmit={handleUnlock}>
          <label htmlFor="admin-pass">Contraseña</label>
          <input
            id="admin-pass"
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {authError ? <p className="form-error">{authError}</p> : null}
          <button className="btn btn-primary" type="submit" disabled={busy}>
            Entrar
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <Link to="/" className="back-link">
        ← Volver al inicio
      </Link>
      <div className="admin-header">
        <h1>Personalizar</h1>
        <button type="button" className="btn btn-ghost" onClick={lock}>
          Cerrar sesión
        </button>
      </div>
      <p className="lead">Agrega, renombra o elimina participantes.</p>

      {message ? <div className="save-status saved">{message}</div> : null}

      <form className="admin-block" onSubmit={handleTitleSave}>
        <h2>Nombre del intercambio</h2>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="btn btn-secondary" type="submit" disabled={busy}>
          Guardar título
        </button>
      </form>

      <form className="admin-block" onSubmit={handleAdd}>
        <h2>Agregar persona</h2>
        <input
          className="input"
          placeholder="Nombre completo"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={busy}>
          Agregar
        </button>
      </form>

      <div className="admin-block">
        <h2>Personas ({people.length})</h2>
        {people.length === 0 ? (
          <p className="muted">Todavía no hay nadie en la lista.</p>
        ) : (
          <ul className="admin-people">
            {people.map((person) => (
              <li key={person.id}>
                <span>{person.name}</span>
                <div className="admin-people-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => handleRename(person.id, person.name)}
                    disabled={busy}
                  >
                    Renombrar
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost danger"
                    onClick={() => handleDelete(person.id, person.name)}
                    disabled={busy}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
