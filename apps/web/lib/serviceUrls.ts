// ============================================================
// Normalización de URLs de microservicios
// Las variables de entorno en Vercel a veces se guardan sin el
// protocolo (ej. "ruteai-core.vercel.app"), lo que rompe fetch()
// con "Failed to parse URL". Este helper garantiza una URL válida.
// ============================================================

function normalizar(url: string | undefined, fallback: string): string {
  let u = (url ?? "").trim();
  if (!u) u = fallback;

  // Quitar barras finales
  u = u.replace(/\/+$/, "");

  // Agregar protocolo si falta
  if (!/^https?:\/\//i.test(u)) {
    const esLocal = u.startsWith("localhost") || u.startsWith("127.0.0.1");
    u = `${esLocal ? "http" : "https"}://${u}`;
  }

  return u;
}

/** URL del Core Service, siempre con protocolo válido. */
export function coreUrl(): string {
  return normalizar(process.env.CORE_SERVICE_URL, "http://localhost:3003");
}

/** URL del Auth Service, siempre con protocolo válido. */
export function authUrl(): string {
  return normalizar(process.env.AUTH_SERVICE_URL, "http://localhost:3002");
}

/** URL del AI Service, siempre con protocolo válido. */
export function aiUrl(): string {
  return normalizar(process.env.AI_SERVICE_URL, "https://ruteai-ai-service.vercel.app");
}
