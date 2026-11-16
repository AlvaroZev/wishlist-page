import "./env.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import express from "express";
import { initDb } from "./db.js";
import routes from "./routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api", routes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(publicDir));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

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
    console.log(`Servidor listo en puerto ${port}`);
  });
}

start().catch((err) => {
  console.error("No se pudo iniciar el servidor", err);
  process.exit(1);
});
