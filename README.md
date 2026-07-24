# Arcade Vault

Es una plataforma para jugar online y competir por la mayor cantidad de puntos.

## Setup local de la base de datos

Arcade Vault persiste las puntuaciones en una instancia local de Supabase
(Postgres + GoTrue + PostgREST). La primera vez:

```bash
# 1. Copia el archivo de entorno y rellena las claves
cp .env.local.example .env.local   # si existe; si no, ver "Variables de entorno"

# 2. Arranca la pila local (Postgres + Auth + Storage + Realtime)
npm run db:start

# 3. Aplica las migraciones y obtén las claves generadas
npm run db:status
#     API URL:        http://127.0.0.1:54321
#     anon key:       eyJhbGciOi...
#     service_role:   eyJhbGciOi...

# 4. Pega esos valores en .env.local

# 5. Levanta Next.js
npm run dev
```

Para iterar con la BD:

```bash
npm run db:reset     # borra datos y reaplica las migraciones
npm run db:stop      # para los contenedores
npm run db:types     # regenera lib/supabase/types.ts desde el esquema actual
```

## Variables de entorno

| Variable                       | Origen              | Descripción                                                       |
| ------------------------------ | ------------------- | ----------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`     | `npm run db:status` | URL de la API de Supabase (por defecto `http://127.0.0.1:54321`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| `npm run db:status` | Clave anónima — usada en cliente y Server Components              |
| `SUPABASE_SERVICE_ROLE_KEY`    | `npm run db:status` | Clave con permisos totales — solo server-side, nunca en cliente   |
| `RESEND_API_KEY`               | Cuenta Resend       | API key para enviar el formulario de contacto                     |
| `RESEND_FROM_EMAIL`            | Cuenta Resend       | Remitente verificado (ej. `hola@arcade-vault.gg`)                 |
| `CONTACT_EMAIL`                | —                   | Buzón destino del formulario de contacto                          |

Las tres claves de Supabase son **obligatorias** para arrancar el juego y
persistir puntuaciones. Sin ellas, `app/page.tsx`, `/salon` y
`/detalle/[id]` fallan al consultar `getScores`.

## Usa Spec Driven Design

Basado en /spec y /spec-impl

Siguiendo las buenas practicas recomendadas aquí:
<https://github.com/Klerith/fernando-skills>

## Skills usadas

```bash
npx skills@latest add Klerith/fernando-skills
```
