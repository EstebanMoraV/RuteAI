# RuteAI — Backlog de Correcciones
> Generado tras auditoría completa de microservicios · Junio 2026
> **No modificar código hasta revisar este documento.**

---

## 🔴 CRÍTICO — Bloquea funcionalidad real

### C-1 · BFF no devuelve tokens tras el login

**Archivo**: `apps/web/app/api/auth/login/route.ts`

**Descripción**:
El BFF llama al auth-service, recibe correctamente el objeto `{ usuario, tokens }`,
pero al construir la respuesta para el frontend **descarta los tokens** y solo devuelve `usuario`.

**Comportamiento actual**:
```json
{ "success": true, "usuario": { "id": "...", "email": "...", "rol": "..." } }
```

**Comportamiento correcto**:
```json
{
  "success": true,
  "usuario": { "id": "...", "email": "...", "rol": "..." },
  "tokens": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 3600
  }
}
```

**Impacto**:
- El dashboard web no puede guardar el `refreshToken` → no puede renovar sesión.
- Las llamadas autenticadas al Core desde el web fallarán cuando expire el `accessToken`.
- La app mobile **no se ve afectada** porque llama directamente al auth-service (no al BFF).

**Cómo solucionarlo**:
En `route.ts`, dentro del bloque donde se construye la respuesta final, agregar los tokens
al objeto que se pasa a `NextResponse.json()`:

```typescript
// Antes (solo devuelve usuario)
return NextResponse.json({ success: true, ...result });

// Después (devuelve usuario + tokens)
return NextResponse.json({
  success: true,
  usuario: result.usuario,
  tokens: {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
  },
});
```

---

## 🟠 ALTO — Riesgo de seguridad

### A-1 · CORS abierto en Auth Service y Core Service

**Archivos**:
- `apps/auth/src/index.ts` (línea ~12)
- `apps/core/src/index.ts` (línea ~14)

**Descripción**:
Ambos servicios usan `app.use(cors())` sin restricción de origen.
Cualquier dominio puede llamarlos directamente desde un navegador.
El AI service sí tiene whitelist correcta — los otros dos deben igualarlo.

**Comportamiento actual**:
```typescript
app.use(cors()); // acepta CUALQUIER origen
```

**Cómo solucionarlo**:
Reemplazar en ambos servicios por:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',  // web dev
    'http://localhost:3001',  // alternativo
    'http://localhost:3002',  // auth-service dev (inter-service)
    'http://localhost:3003',  // core-service dev (inter-service)
    'https://ruteai.vercel.app',
    process.env.WEB_URL,
  ].filter(Boolean) as string[],
  credentials: true,
}));
```

Añadir también `WEB_URL` al `.env.example` de cada servicio.

---

### A-2 · AI Service completamente público (sin autenticación)

**Archivo**: `apps/ai-service/src/index.ts` y sus routes

**Descripción**:
Los endpoints `/api/score` y `/api/optimize` no tienen ningún middleware de autenticación.
Cualquier persona con la URL de Vercel puede consumir el servicio de IA libremente,
lo que abre la puerta a abuso de recursos y costos inesperados si se añaden modelos de pago.

**Impacto actual**:
- Endpoint `/api/score` → público, sin validación de quién llama.
- Endpoint `/api/optimize` → público, sin validación de quién llama.

**Opción A — API Key compartida (más simple)**:
Añadir una variable `AI_SERVICE_SECRET` en el AI service y en el BFF:

```typescript
// En ai-service: middleware que valida header
app.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  if (key !== process.env.AI_SERVICE_SECRET) {
    return res.status(401).json({ success: false, error: 'No autorizado' });
  }
  next();
});

// En el BFF al hacer proxy:
headers: { 'x-api-key': process.env.AI_SERVICE_SECRET }
```

**Opción B — Reutilizar requireAuth del Core (más robusto)**:
Copiar el `auth.middleware.ts` del Core al AI service y aplicarlo en las routes.

---

## 🟡 MEDIO — No bloquea pero causa problemas en producción

### M-1 · Middleware de autenticación del Core sin timeout

**Archivo**: `apps/core/src/middlewares/auth.middleware.ts` (línea ~47)

**Descripción**:
El middleware hace `fetch` al auth-service para validar el token, pero sin timeout.
Si el auth-service está caído o lento, el Core se queda esperando indefinidamente
y la request del cliente cuelga hasta que el load balancer de Vercel la cancela (~30s).

**Comportamiento actual**:
```typescript
const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/me`, {
  method: 'GET',
  headers: { ... },
  // sin timeout
});
```

**Cómo solucionarlo**:
```typescript
const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/me`, {
  method: 'GET',
  headers: { ... },
  signal: AbortSignal.timeout(5000), // falla rápido si auth-service no responde
});
```

Agregar también un `catch` específico para `AbortError`:
```typescript
} catch (error) {
  if (error instanceof Error && error.name === 'AbortError') {
    res.status(503).json({ success: false, error: 'Servicio de autenticación no disponible' });
    return;
  }
  res.status(500).json({ success: false, error: 'Error validando la sesión' });
}
```

---

### M-2 · AI Service — build command vacío en Vercel

**Archivo**: `apps/ai-service/vercel.json`

**Descripción**:
El `buildCommand` actual es un `echo` sin acción real:
```json
"buildCommand": "echo 'No build needed - @vercel/node compiles api/index.ts'"
```

`@vercel/node` compila el TypeScript en runtime (JIT), por lo que el deploy no fallará,
pero los errores de tipos pasarán desapercibidos hasta que exploten en producción.

**Cómo solucionarlo**:
```json
"buildCommand": "tsc --noEmit"
```

Esto valida los tipos en el momento del deploy sin generar output — si hay errores
de TypeScript, el deploy falla antes de llegar a producción.

---

### M-3 · `CORE_SERVICE_URL` definida pero nunca consumida

**Archivos**: `.env.example` (raíz), `turbo.json`

**Descripción**:
La variable `CORE_SERVICE_URL` está documentada como requerida pero ningún servicio
la importa ni la usa. Genera confusión al configurar las env vars en Vercel
(alguien podría pasar tiempo configurándola sin que sirva de nada).

**Motivo de existencia probable**:
Se planeó que el BFF proxeara pedidos/ubicaciones/alertas al Core en lugar de ir a Prisma
directamente. Esa parte nunca se implementó — el BFF va directo a Prisma para esos recursos.

**Opciones**:

- **Opción A (eliminar)**: Borrar `CORE_SERVICE_URL` de `.env.example` y `turbo.json`.
  Documentar que el BFF accede a Prisma directamente para esos recursos.

- **Opción B (implementar)**: Hacer que las rutas BFF de pedidos/ubicaciones/alertas
  proxeen al Core en lugar de ir a Prisma. Esto haría el patrón BFF completamente consistente
  y desacoplaría el web del Prisma directo. Requiere refactorizar 3 route handlers del BFF.

---

### M-4 · `OPENROUTER_API_KEY` definida pero no implementada

**Archivo**: `.env.example` (raíz)

**Descripción**:
La clave aparece en `.env.example` pero no hay ningún archivo que la consuma.
Posiblemente se planeó para llamar a modelos de lenguaje vía OpenRouter en el AI service
pero nunca se implementó.

**Cómo solucionarlo**:
- Si no hay plan concreto de usarla: eliminarla de `.env.example`.
- Si se va a implementar: documentar en qué servicio se usará y para qué endpoint.

---

### M-5 · Fallbacks a `localhost` en producción sin error explícito

**Archivos**:
- `apps/core/src/middlewares/auth.middleware.ts`
- `apps/web/lib/authLogger.ts`
- `apps/web/app/api/auth/login/route.ts`

**Descripción**:
Varios servicios hacen:
```typescript
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL ?? 'http://localhost:3002';
```

En producción (Vercel), si la env var no está configurada, el servicio intenta
conectar a `localhost` — que no existe en serverless — y falla con un error
críptico de red en lugar de un mensaje claro de configuración faltante.

**Cómo solucionarlo**:
```typescript
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
if (!AUTH_SERVICE_URL) {
  throw new Error('[CONFIG] AUTH_SERVICE_URL no está definida. Configúrala en Vercel.');
}
```

O como validación al arrancar el servicio en `src/index.ts`.

---

## 🟢 BAJO — Deuda técnica / limpieza

### B-1 · Paquete `@ruteai/shared` existe pero no se usa

**Archivo**: `packages/shared/src/index.ts`

**Descripción**:
El paquete exporta `AppError`, `ApiResponse` y `HTTP_STATUS`, pero ningún servicio
lo importa. Cada microservicio tiene su propio manejo de errores y respuestas inline.

**Cómo solucionarlo**:
- **Opción A**: Eliminar `packages/shared` del monorepo y de `pnpm-workspace.yaml`.
- **Opción B**: Adoptarlo en todos los servicios para estandarizar respuestas.
  Esto requeriría refactorizar los `res.json(...)` de auth, core y ai-service.

---

### B-2 · Formato de respuesta inconsistente entre rutas del BFF

**Archivos**: `apps/web/app/api/*/route.ts`

**Descripción**:
Las rutas del BFF devuelven diferentes shapes según el endpoint:

| Ruta | Shape actual |
|---|---|
| `/api/auth/login` | `{ success, usuario }` |
| `/api/pedidos` | `{ data, error }` |
| `/api/ubicacion` | `{ success, data }` |
| `/api/alertas` | `{ success, data }` |
| `/api/ai/score` | `{ success, data: { score, nivel, razones } }` |

El frontend/mobile debe manejar múltiples contratos. Dificulta el mantenimiento.

**Shape recomendado unificado**:
```typescript
{ success: boolean, data?: T, error?: string }
```

**Cómo solucionarlo**:
Estandarizar los route handlers que no cumplen este contrato, priorizando los más usados.

---

### B-3 · BFF accede a Prisma directamente para algunos recursos

**Archivos**:
- `apps/web/app/api/pedidos/route.ts`
- `apps/web/app/api/ubicacion/route.ts`
- `apps/web/app/api/alertas/route.ts`

**Descripción**:
Estas rutas del BFF importan `prisma` directamente en lugar de delegar al Core service.
Esto crea dos fuentes de verdad para las mismas tablas (Core y BFF) y hace que
cambios en la lógica de negocio deban actualizarse en dos lugares.

**Impacto**:
- Si se cambia una validación en `OrdersService` del Core, el BFF no lo hereda.
- La lógica de pedidos existe duplicada.

**Cómo solucionarlo**:
Implementar `CORE_SERVICE_URL` (ver **M-3**) y hacer que el BFF proxee al Core:

```typescript
// En lugar de: const pedidos = await prisma.pedido.findMany(...)
// Hacer: const pedidos = await fetch(`${CORE_SERVICE_URL}/api/v1/orders`, ...)
```

---

### B-4 · Core service importa Prisma con ruta relativa en lugar de workspace package

**Archivo**: `apps/core/src/lib/prisma.ts`

**Descripción**:
```typescript
// Actual (ruta relativa frágil)
import { PrismaClient } from '@prisma/client';

// Mejor (usa el singleton del workspace)
import { prisma } from '@ruteai/database';
```

El paquete `@ruteai/database` ya exporta el singleton de Prisma con la configuración
correcta. El Core lo reimplementa por separado, lo que podría generar dos instancias
de PrismaClient si no se configura bien el singleton.

---

---

---

## 🔴 CRÍTICO — Auditoría BFF · Junio 2026

### C-2 · BFF de pedidos incompleto (3 endpoints del Core sin proxy)

**Archivos**:
- `apps/web/app/api/pedidos/route.ts` (solo cubre GET list y POST)
- Core: `apps/core/src/routes/orders.route.ts` (tiene 5 endpoints)

**Descripción**:
El Core Service expone 5 endpoints de órdenes, pero el BFF solo proxea 2.
Los endpoints faltantes hacen que las mutaciones del dashboard (`marcarEnRuta`,
`marcarComoEntregado`, `eliminarPedido`, `editarPedido`) bypaseen el Core y
accedan a Prisma directamente desde `dashboard/actions.ts`.

| Core Service | BFF Web | Estado |
|---|---|---|
| `GET /api/v1/orders` | `GET /api/pedidos` | ✅ Existe |
| `POST /api/v1/orders` | `POST /api/pedidos` | ✅ Existe |
| `GET /api/v1/orders/:id` | `/api/pedidos/[id]` | ❌ Falta |
| `PATCH /api/v1/orders/:id/estado` | `/api/pedidos/[id]/estado` | ❌ Falta |
| `DELETE /api/v1/orders/:id` | `/api/pedidos/[id]` (DELETE) | ❌ Falta |

**Cómo solucionarlo**:
Crear `apps/web/app/api/pedidos/[id]/route.ts` con GET y DELETE,
y `apps/web/app/api/pedidos/[id]/estado/route.ts` con PATCH.
Luego actualizar `dashboard/actions.ts` para usar fetch al BFF en lugar de Prisma.

---

### C-3 · Rutas del Core sin ningún BFF en la web

**Archivos**:
- `apps/core/src/routes/routes.route.ts` (completo, funcional)
- Falta: `apps/web/app/api/rutas/route.ts`
- Afectado: `apps/web/app/dashboard/rutas/page.tsx` (usa Prisma directo)

**Descripción**:
El Core tiene los endpoints `GET /api/v1/routes`, `POST /api/v1/routes` y
`PATCH /api/v1/routes/:id/estado`, pero no existe ningún proxy BFF en la web.
La página de rutas accede directamente a Prisma desde un Server Component.

**Cómo solucionarlo**:
Crear `apps/web/app/api/rutas/route.ts` con GET y POST,
y `apps/web/app/api/rutas/[id]/estado/route.ts` con PATCH.

---

### C-4 · Admin de empresas y usuarios sin BFF (bypass total al Core)

**Archivos**:
- `apps/web/app/admin/actions.ts` — todas las funciones usan Prisma directo
- `apps/core/src/routes/empresas.route.ts` — endpoints existentes sin consumir

**Descripción**:
El Core Service tiene `/api/v1/empresas` (GET, POST, PATCH toggle) con control
de roles `super_admin`, pero el panel de admin de la web no los usa.
`crearEmpresa`, `editarEmpresa`, `toggleEmpresaEstado`, `eliminarEmpresa`,
`cambiarRolUsuario` y `eliminarUsuario` van directo a Prisma, saltando la
lógica de negocio y las validaciones del Core.

**Resuelto (fase 1 — Empresas)**:
- Core: `EmpresasService` ahora tiene `actualizar` y `eliminar`, y `crear` acepta email.
- Core: `empresas.route.ts` añade `PATCH /:id` (editar) y `DELETE /:id`.
- Web: las server actions `crearEmpresa`, `editarEmpresa`, `toggleEmpresaEstado`
  y `eliminarEmpresa` ahora llaman al Core (con el token del super_admin, que el
  Core revalida vía `requireRole(["super_admin"])`).
- Patrón: server actions → fetch directo al Core (igual que pedidos en C-2),
  no se crea ruta `/api/empresas` porque el consumidor es server-side.

**Pendiente (fase 2 — Usuarios)** · decisión tomada:
- `cambiarRolUsuario` y `eliminarUsuario` siguen en Prisma directo por ahora.
- Cuando se implementen: mover al Core, y el borrado debe eliminar TAMBIÉN de
  Supabase Auth (`supabaseAdmin.auth.admin.deleteUser`) usando
  `SUPABASE_SERVICE_ROLE_KEY`, para no dejar el usuario huérfano (hoy un usuario
  borrado de Prisma puede seguir iniciando sesión vía Supabase Auth).

---

## 🟠 ALTO — Auditoría BFF

### A-3 · AI Service /api/optimize sin exposición BFF

**Archivos**:
- `apps/ai-service/src/routes/optimize.route.ts` (funcional)
- Falta: `apps/web/app/api/ai/optimize/route.ts`
- Afectado: botón "Optimizar Rutas con IA" en `apps/web/app/dashboard/pedidos/page.tsx` (no hace nada)

**Descripción**:
El AI Service tiene `POST /api/optimize` para optimización de rutas con el
algoritmo de nearest-neighbor, pero no hay proxy BFF. El botón en la UI existe
pero no tiene acción asignada.

**Cómo solucionarlo**:
Crear `apps/web/app/api/ai/optimize/route.ts` (proxy con x-api-key al AI Service).
Conectar el botón del dashboard a este endpoint.

---

### A-4 · `routes.route.ts` del Core sin autenticación

**Archivo**: `apps/core/src/routes/routes.route.ts`

**Descripción**:
Es el único router del Core sin `requireAuth`. Cualquier cliente puede crear,
listar o modificar rutas sin estar autenticado si conoce la URL del Core Service.

**Cómo solucionarlo**:
```typescript
import { requireAuth } from "../middlewares/auth.middleware";
routesRouter.use(requireAuth as RequestHandler);
```

---

### A-5 · Clientes de IA no envían `x-api-key` → score real siempre falla

**Archivos**:
- `apps/web/lib/aiServiceClient.ts`
- `apps/web/app/dashboard/ia/page.tsx`

**Descripción**:
Tras resolver A-2 (el AI Service ahora exige `x-api-key`), los dos consumidores
server-side del endpoint `/api/score` seguían llamándolo **sin** la cabecera.
Resultado: el AI Service respondía 401 en cada llamada.
- `aiServiceClient.ts` (creación de pedidos): caía siempre al fallback heurístico,
  nunca usaba el microservicio real.
- `dashboard/ia/page.tsx`: recibía 401 → todos los scores `null` → la página de
  Predicciones IA se mostraba vacía.

**Cómo se solucionó**:
Se añadió `'x-api-key': AI_SERVICE_SECRET` a ambos fetch. Ambos son server-side,
así que la clave nunca se expone al navegador.

**Impacto Vercel**: requiere que `AI_SERVICE_SECRET` esté configurada en el proyecto
**web** con el mismo valor que en el proyecto **ai-service**.

---

## 🟡 MEDIO — Auditoría BFF

### M-6 · Duplicidad de endpoints de ubicación

**Archivos**:
- `apps/web/app/api/ubicacion/route.ts` — proxy al Core Service ✅
- `apps/web/app/api/ubicaciones/route.ts` — acceso directo a Prisma ❌

**Descripción**:
Existen dos rutas BFF que cubren exactamente la misma funcionalidad (registrar
y consultar ubicaciones GPS), implementadas de formas distintas. La app mobile
y el dashboard podrían estar usando distintos endpoints para el mismo recurso.

**Cómo solucionarlo**:
Eliminar `/api/ubicaciones/route.ts`. Toda la lógica debe pasar por
`/api/ubicacion` (proxy al Core), que ya maneja GET y POST correctamente.

---

### M-7 · Páginas SSR del dashboard acceden a Prisma directamente

**Archivos**:
- `apps/web/app/dashboard/pedidos/page.tsx` (Prisma directo)
- `apps/web/app/dashboard/rutas/page.tsx` (Prisma directo)
- `apps/web/app/admin/page.tsx` (pendiente revisión)

**Descripción**:
Los Server Components del dashboard hacen queries a Prisma directamente en lugar
de consumir el Core Service. Esto no es técnicamente incorrecto (es una ventaja
de Next.js en monorepo), pero rompe el patrón BFF: si la lógica de negocio en
el Core cambia, las páginas SSR no lo heredan.

**Decisión recomendada**:
Mantener Prisma directo solo para **lectura SSR** (performance). Toda escritura
(crear, editar, cambiar estado, eliminar) debe pasar por el Core vía BFF.

---

## Checklist de resolución

| ID | Descripción | Severidad | Estado |
|---|---|---|---|
| C-1 | BFF no devuelve tokens tras login | 🔴 Crítico | ✅ Resuelto |
| C-2 | BFF de pedidos incompleto (3 endpoints faltantes) | 🔴 Crítico | ✅ Resuelto |
| C-3 | Rutas del Core sin BFF en la web | 🔴 Crítico | ✅ Resuelto |
| C-4 | Admin de empresas sin BFF (bypass al Core) | 🔴 Crítico | 🟡 Empresas ✅ · Usuarios pendiente |
| A-1 | CORS abierto en Auth y Core | 🟠 Alto | ✅ Resuelto |
| A-2 | AI Service sin autenticación | 🟠 Alto | ✅ Resuelto |
| A-3 | AI optimize sin BFF (botón sin acción) | 🟠 Alto | ✅ Resuelto |
| A-4 | routes.route.ts sin requireAuth | 🟠 Alto | ✅ Resuelto |
| A-5 | Clientes IA sin x-api-key (score roto) | 🟠 Alto | ✅ Resuelto |
| M-1 | Timeout ausente en middleware Core | 🟡 Medio | ✅ Resuelto |
| M-2 | Build command vacío en AI Service | 🟡 Medio | ✅ Resuelto |
| M-3 | CORE_SERVICE_URL sin implementar | 🟡 Medio | ✅ Resuelto |
| M-4 | OPENROUTER_API_KEY sin implementar | 🟡 Medio | ✅ Resuelto |
| M-5 | Fallbacks a localhost sin error explícito | 🟡 Medio | ✅ Resuelto |
| M-6 | Duplicidad /api/ubicacion vs /api/ubicaciones | 🟡 Medio | ✅ Resuelto |
| M-7 | Páginas SSR usan Prisma directo para escrituras | 🟡 Medio | ✅ Resuelto (escrituras→Core; lectura SSR sigue en Prisma por diseño) |
| B-1 | Paquete @ruteai/shared sin usar | 🟢 Bajo | ✅ Resuelto |
| B-2 | Respuestas BFF inconsistentes | 🟢 Bajo | ✅ Resuelto |
| B-3 | BFF accede a Prisma directamente | 🟢 Bajo | ✅ Resuelto |
| B-4 | Core usa Prisma con ruta relativa | 🟢 Bajo | ✅ Resuelto |

---

*Para abordar cada punto, cambiar el estado de ⬜ a ✅ una vez resuelto.*
