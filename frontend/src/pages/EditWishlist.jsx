import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";

function emptyItem() {
  return { localId: crypto.randomUUID(), text: "", url: "" };
}

function toLocalItems(items) {
  if (!items?.length) return [emptyItem()];
  return items.map((item) => ({
    localId: String(item.id),
    text: item.text || "",
    url: item.url || "",
  }));
}

function sameContent(a, b) {
  return (
    a.length === b.length &&
    a.every(
      (item, index) =>
        item.text === b[index].text && (item.url || "") === (b[index].url || "")
    )
  );
}

export default function EditWishlist() {
  const { id } = useParams();
  const [participant, setParticipant] = useState(null);
  const [items, setItems] = useState([emptyItem()]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const itemsRef = useRef(items);
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const debounceRef = useRef(null);
  const participantRef = useRef(null);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    participantRef.current = participant;
  }, [participant]);

  useEffect(() => {
    let cancelled = false;
    dirtyRef.current = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const result = await api.getWishlist(id);
        if (cancelled || dirtyRef.current) return;
        setParticipant(result.participant);
        setItems(toLocalItems(result.items));
        setSaveState("idle");
        setSaveMessage("");
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [id]);

  async function persist(reason = "auto") {
    if (!participantRef.current || savingRef.current) return;
    if (reason === "auto" && !dirtyRef.current) return;

    savingRef.current = true;
    setSaveState("saving");
    setSaveMessage(reason === "manual" ? "Guardando…" : "Guardando automáticamente…");

    const snapshot = itemsRef.current.map(({ text, url }) => ({
      text,
      url,
    }));

    try {
      await api.saveWishlist(id, snapshot);

      // Never replace the form from the server response — that remounts
      // inputs (new keys) and can wipe text typed during the request.
      if (sameContent(itemsRef.current, snapshot)) {
        dirtyRef.current = false;
        setSaveState("saved");
        const time = new Date().toLocaleTimeString("es", {
          hour: "2-digit",
          minute: "2-digit",
        });
        setSaveMessage(
          reason === "manual"
            ? `Guardado correctamente · ${time}`
            : `Autoguardado · ${time}`
        );
      } else {
        setSaveState("dirty");
        setSaveMessage("Cambios sin guardar…");
        scheduleAutosave();
      }
    } catch (err) {
      setSaveState("error");
      setSaveMessage(err.message || "No se pudo guardar");
    } finally {
      savingRef.current = false;
    }
  }

  function scheduleAutosave() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      persist("auto");
    }, 1200);
  }

  useEffect(() => {
    if (loading || !participant) return undefined;

    const interval = setInterval(() => {
      persist("auto");
    }, 10000);

    return () => clearInterval(interval);
  }, [loading, participant, id]);

  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === "hidden") {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        persist("auto");
      }
    }

    function onPageHide() {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      persist("auto");
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [id]);

  function markDirty(updater) {
    dirtyRef.current = true;
    setItems((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      itemsRef.current = next;
      return next;
    });
    setSaveState("dirty");
    setSaveMessage("Cambios sin guardar…");
    scheduleAutosave();
  }

  function updateItem(localId, field, value) {
    markDirty((prev) =>
      prev.map((item) =>
        item.localId === localId ? { ...item, [field]: value } : item
      )
    );
  }

  function addItem() {
    markDirty((prev) => [...prev, emptyItem()]);
  }

  function removeItem(localId) {
    markDirty((prev) => {
      const next = prev.filter((item) => item.localId !== localId);
      return next.length ? next : [emptyItem()];
    });
  }

  if (loading) {
    return <div className="status-panel">Cargando tu lista…</div>;
  }

  if (error) {
    return (
      <div className="status-panel error">
        <p>{error}</p>
        <Link to="/editar" className="btn btn-primary">
          Volver
        </Link>
      </div>
    );
  }

  return (
    <section className="wishlist-page edit-page">
      <Link to="/editar" className="back-link">
        ← Elegir otra persona
      </Link>

      <div className="editing-banner edit">
        Estás editando la lista de
        <strong> {participant.name}</strong>
      </div>

      <h1>Tus pedidos de regalo</h1>
      <p className="lead">
        Escribe lo que te gustaría recibir. La lista se guarda sola mientras
        escribes. También puedes pulsar el botón grande de guardar.
      </p>

      <div className={`save-status ${saveState}`} aria-live="polite">
        {saveMessage || "Lista lista para editar"}
      </div>

      <ul className="wish-list edit-mode">
        {items.map((item, index) => (
          <li key={item.localId} className="wish-editor">
            <div className="wish-editor-top">
              <span className="wish-num">{index + 1}</span>
              <label className="sr-only" htmlFor={`text-${item.localId}`}>
                Deseo {index + 1}
              </label>
              <input
                id={`text-${item.localId}`}
                className="input wish-input"
                type="text"
                placeholder="Ejemplo: una bufanda suave"
                value={item.text}
                onChange={(e) =>
                  updateItem(item.localId, "text", e.target.value)
                }
              />
              <button
                type="button"
                className="btn btn-ghost danger"
                onClick={() => removeItem(item.localId)}
                aria-label={`Quitar deseo ${index + 1}`}
              >
                Quitar
              </button>
            </div>
            <label className="url-label" htmlFor={`url-${item.localId}`}>
              Enlace (opcional)
            </label>
            <input
              id={`url-${item.localId}`}
              className="input url-input"
              type="url"
              inputMode="url"
              placeholder="https://…"
              value={item.url}
              onChange={(e) => updateItem(item.localId, "url", e.target.value)}
            />
          </li>
        ))}
      </ul>

      <div className="edit-actions">
        <button type="button" className="btn btn-secondary" onClick={addItem}>
          + Agregar otro deseo
        </button>
        <button
          type="button"
          className="btn btn-save"
          onClick={() => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            persist("manual");
          }}
          disabled={saveState === "saving"}
        >
          Guardar ahora
        </button>
      </div>
    </section>
  );
}
