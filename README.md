# Wishlist — Amigo Secreto Navideño

Página web simple para un intercambio de amigo secreto: ver listas de regalos o agregar tus propios pedidos.

## Qué incluye

- **Landing** con dos caminos claros: ver regalos / agregar pedidos
- **Selección de persona** con tarjetas grandes (pensado para celular y personas mayores)
- **Edición de wishlist** con texto + enlace opcional discreto
- **Autoguardado** cada 8 segundos + botón grande **Guardar ahora**
- **Personalizar** (botón discreto en la barra): agregar/renombrar/eliminar personas y editar el nombre del evento (protegido con contraseña)

## Arquitectura

Un solo contenedor Docker (listo para Railway):

| Pieza      | Tecnología     | Notas                                      |
|------------|----------------|--------------------------------------------|
| Frontend   | React + Vite   | Build estático servido por Express         |
| Backend    | Node + Express | API `/api` + archivos estáticos            |
| Base datos | PostgreSQL     | Externa (Railway Postgres u otro proveedor)|

## Variables de entorno

```env
DATABASE_URL=postgresql://usuario:password@host:5432/wishlist
DATABASE_SSL=true
ADMIN_PASSWORD=123456789
PORT=3000
```

La API crea sola las tablas al arrancar.

## Deploy en Railway

1. Crea un servicio desde este repo (detecta el `Dockerfile` de la raíz).
2. Conecta PostgreSQL y copia `DATABASE_URL`.
3. Define:
   - `DATABASE_URL`
   - `DATABASE_SSL=true`
   - `ADMIN_PASSWORD=123456789`
4. Deploy. Railway asigna `PORT` solo.

## Docker local (un contenedor)

```bash
docker build -t wishlist .
docker run --rm -p 3000:3000 --env-file .env wishlist
```

Abre http://localhost:3000

## Desarrollo local (sin Docker)

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

El frontend en Vite hace proxy de `/api` al backend en el puerto 3001.

## Flujo rápido

1. Entra a **Personalizar** → contraseña → agrega participantes y el título del evento  
2. Cada persona elige **Vengo a agregar mis pedidos** → su nombre → escribe deseos  
3. Quien regala elige **Vengo a ver regalos** → nombre → ve la lista  

## Notas

- No hay PIN por persona: cualquiera puede editar la lista de alguien eligiendo su nombre.
- No hay marcado de “ya comprado”.
- El enlace por ítem es opcional y se muestra discreto (“ver enlace”).
