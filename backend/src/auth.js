export function requireAdmin(req, res, next) {
  const password = req.headers["x-admin-password"];
  const expected = process.env.ADMIN_PASSWORD || "123456789";

  if (!password || password !== expected) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }

  next();
}
