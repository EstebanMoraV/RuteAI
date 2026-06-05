/**
 * authLogger.ts
 * Utilidad para registrar eventos de autenticación en el microservicio de auth.
 * No tiene "use server" — puede ser importada desde Route Handlers y Server Actions.
 *
 * Los console.log de este archivo son visibles en Vercel → ruteai-web → Functions logs.
 * El microservicio auth genera sus propios logs en Vercel → ruteai-auth → Functions logs.
 */

import { authUrl } from "@/lib/serviceUrls";

const AUTH_SERVICE_URL = authUrl();

export interface AuthLogPayload {
  userId: string;
  email: string;
  provider: string;
  status: string;
  error?: string;
}

/**
 * Envía un evento de autenticación al microservicio de auth.
 * Falla silenciosamente para nunca bloquear el flujo principal.
 * Siempre emite console.log propio para visibilidad en Vercel (web app).
 */
export async function logAuthEvent(data: AuthLogPayload): Promise<void> {
  const body = {
    evento: 'iniciar_sesion',
    userId: data.userId,
    email: data.email,
    provider: data.provider,
    status: data.status,
    error: data.error,
    timestamp: new Date().toISOString(),
  };

  // ── Log local (siempre visible en Vercel → ruteai-web) ──────────────────
  console.log(
    JSON.stringify({
      event: `auth.log.${data.status}`,
      target: AUTH_SERVICE_URL,
      userId: data.userId,
      email: data.email,
      provider: data.provider,
      status: data.status,
      ...(data.error ? { error: data.error } : {}),
      timestamp: body.timestamp,
    })
  );

  // ── Envío al microservicio auth ─────────────────────────────────────────
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3000), // 3s timeout
    });

    if (response.ok) {
      console.log(
        JSON.stringify({
          event: 'auth.log.forwarded_ok',
          authServiceStatus: response.status,
          userId: data.userId,
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      console.warn(
        JSON.stringify({
          event: 'auth.log.forward_failed',
          authServiceStatus: response.status,
          userId: data.userId,
          timestamp: new Date().toISOString(),
        })
      );
    }
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'TimeoutError';
    console.warn(
      JSON.stringify({
        event: isTimeout ? 'auth.log.forward_timeout' : 'auth.log.forward_error',
        authServiceUrl: AUTH_SERVICE_URL,
        error: err instanceof Error ? err.message : String(err),
        userId: data.userId,
        timestamp: new Date().toISOString(),
      })
    );
  }
}
