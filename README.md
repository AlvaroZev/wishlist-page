# Wishlist — Amigo Secreto

Página web simple para un intercambio de amigo secreto: ver listas de regalos o agregar tus propios pedidos.

## Qué incluye

- **Landing** con dos caminos claros: ver regalos / agregar pedidos
- **Selección de persona** con tarjetas grandes (pensado para celular y personas mayores)
- **Edición de wishlist** con texto + enlace opcional discreto
- **Autoguardado** cada 8 segundos + botón grande **Guardar ahora**
- **Personalizar** (botón discreto en la barra): agregar/renombrar/eliminar personas y editar el nombre del evento (protegido con contraseña)

## Arquitectura

| Servicio   | Tecnología        | Dónde corre                          |
|------------|-------------------|--------------------------------------|
| Frontend   | React + Vite      | Contenedor Docker (nginx)            |
| Backend    | Node + Express    | Contenedor Docker                    |
| Base datos | PostgreSQL        | **Externa** (no va en Docker Compose)|

## Configuración

1. Copia el ejemplo de entorno:

```bash
copy .env.example .env
```

2. Edita `.env` con tu PostgreSQL externo:

```env
DATABASE_URL=postgresql://usuario:password@host:5432/wishlist
DATABASE_SSL=false
ADMIN_PASSWORD=123456789
FRONTEND_PORT=8080
BACKEND_PORT=3001
```

La API crea sola las tablas al arrancar.

## Arranque con Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:8080  
- API: http://localhost:3001/api/health  

## Desarrollo local (sin Docker)

Necesitas Node 22+ y el `.env` apuntando a PostgreSQL.

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
