import "./env.js";
import cors from "cors";
import express from "express";
import { initDb } from "./db.js";
import routes from "./routes.js";

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api", routes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

async function start() {
  if (!process.env.DATABASE_URL) {
    console.error("Falta DATABASE_URL en el entorno");
    process.exit(1);
  }

  await initDb();
  app.listen(port, "0.0.0.0", () => {
    console.log(`API lista en puerto ${port}`);
  });
}

start().catch((err) => {
  console.error("No se pudo iniciar el servidor", err);
  process.exit(1);
});
