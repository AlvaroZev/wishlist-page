import { Router } from "express";
import { query } from "./db.js";
import { requireAdmin } from "./auth.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true });
});

router.get("/settings", async (_req, res) => {
  try {
    const result = await query(
      `SELECT value FROM app_settings WHERE key = 'event_title'`
    );
    res.json({
      eventTitle: result.rows[0]?.value || "Amigo Secreto Navideño",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo cargar la configuración" });
  }
});

router.get("/participants", async (_req, res) => {
  try {
    const result = await query(
      `SELECT p.id, p.name,
              COUNT(w.id) FILTER (WHERE TRIM(w.text) <> '')::int AS item_count
       FROM participants p
       LEFT JOIN wishlist_items w ON w.participant_id = p.id
       GROUP BY p.id
       ORDER BY p.name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudieron cargar los participantes" });
  }
});

router.get("/participants/:id/wishlist", async (req, res) => {
  try {
    const participantId = Number(req.params.id);
    if (!Number.isInteger(participantId)) {
      return res.status(400).json({ error: "Participante inválido" });
    }

    const person = await query(
      `SELECT id, name FROM participants WHERE id = $1`,
      [participantId]
    );
    if (person.rows.length === 0) {
      return res.status(404).json({ error: "Participante no encontrado" });
    }

    const items = await query(
      `SELECT id, text, url, position
       FROM wishlist_items
       WHERE participant_id = $1
       ORDER BY position ASC, id ASC`,
      [participantId]
    );

    res.json({
      participant: person.rows[0],
      items: items.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo cargar la lista" });
  }
});

router.put("/participants/:id/wishlist", async (req, res) => {
  try {
    const participantId = Number(req.params.id);
    if (!Number.isInteger(participantId)) {
      return res.status(400).json({ error: "Participante inválido" });
    }

    const person = await query(
      `SELECT id, name FROM participants WHERE id = $1`,
      [participantId]
    );
    if (person.rows.length === 0) {
      return res.status(404).json({ error: "Participante no encontrado" });
    }

    const items = Array.isArray(req.body?.items) ? req.body.items : null;
    if (!items) {
      return res.status(400).json({ error: "Formato de lista inválido" });
    }

    const cleaned = items
      .map((item, index) => ({
        text: String(item?.text ?? "").trim(),
        url: normalizeUrl(item?.url),
        position: index,
      }))
      .filter((item) => item.text.length > 0 || item.url);

    await query("BEGIN");
    try {
      await query(`DELETE FROM wishlist_items WHERE participant_id = $1`, [
        participantId,
      ]);

      for (const item of cleaned) {
        await query(
          `INSERT INTO wishlist_items (participant_id, text, url, position)
           VALUES ($1, $2, $3, $4)`,
          [participantId, item.text || "Enlace", item.url, item.position]
        );
      }

      await query("COMMIT");
    } catch (inner) {
      await query("ROLLBACK");
      throw inner;
    }

    const saved = await query(
      `SELECT id, text, url, position
       FROM wishlist_items
       WHERE participant_id = $1
       ORDER BY position ASC, id ASC`,
      [participantId]
    );

    res.json({
      participant: person.rows[0],
      items: saved.rows,
      savedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo guardar la lista" });
  }
});

router.post("/admin/verify", requireAdmin, (_req, res) => {
  res.json({ ok: true });
});

router.get("/admin/participants", requireAdmin, async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, name, created_at
       FROM participants
       ORDER BY name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudieron cargar los participantes" });
  }
});

router.post("/admin/participants", requireAdmin, async (req, res) => {
  try {
    const name = String(req.body?.name ?? "").trim();
    if (!name) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const result = await query(
      `INSERT INTO participants (name)
       VALUES ($1)
       RETURNING id, name, created_at`,
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Ese nombre ya existe" });
    }
    console.error(err);
    res.status(500).json({ error: "No se pudo agregar la persona" });
  }
});

router.put("/admin/participants/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const name = String(req.body?.name ?? "").trim();
    if (!Number.isInteger(id) || !name) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const result = await query(
      `UPDATE participants SET name = $1 WHERE id = $2
       RETURNING id, name, created_at`,
      [name, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Participante no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Ese nombre ya existe" });
    }
    console.error(err);
    res.status(500).json({ error: "No se pudo actualizar la persona" });
  }
});

router.delete("/admin/participants/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Participante inválido" });
    }

    const result = await query(
      `DELETE FROM participants WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Participante no encontrado" });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo eliminar la persona" });
  }
});

router.put("/admin/settings", requireAdmin, async (req, res) => {
  try {
    const eventTitle = String(req.body?.eventTitle ?? "").trim();
    if (!eventTitle) {
      return res.status(400).json({ error: "El título es obligatorio" });
    }

    await query(
      `INSERT INTO app_settings (key, value)
       VALUES ('event_title', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [eventTitle]
    );
    res.json({ eventTitle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo guardar la configuración" });
  }
});

function normalizeUrl(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

export default router;
