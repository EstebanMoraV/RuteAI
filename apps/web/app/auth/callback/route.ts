import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { logAuthEvent } from '@/lib/authLogger';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get('code');
  const error = searchParams.get('error');

  // Detectar y forzar protocolo seguro HTTPS en producción
  const isLocalEnv = process.env.NODE_ENV === 'development';
  let appUrl = origin;
  if (!isLocalEnv && appUrl.startsWith('http://')) {
    appUrl = appUrl.replace('http://', 'https://');
  }
  const redirectBase = process.env.NEXT_PUBLIC_APP_URL || appUrl;

  console.log(
    JSON.stringify({
      event: 'oauth.callback.start',
      hasCode: !!code,
      hasError: !!error,
      origin,
      redirectBase,
      timestamp: new Date().toISOString(),
    })
  );

  // Google rechazó el acceso (el usuario canceló o denegó permisos)
  if (error) {
    console.warn('[OAuth Callback] Google devolvió error:', error);
    return NextResponse.redirect(`${redirectBase}/login?error=oauth_cancelled`);
  }

  try {
    if (!code) {
      console.warn('[OAuth Callback] No se recibió código de autorización.');
      return NextResponse.redirect(`${redirectBase}/login?error=auth_failed`);
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: exchangeError,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !user) {
      // PKCE verifier missing → email YAS fue confirmado por Supabase antes del redirect.
      // Redirigir a login con mensaje de éxito en vez de error.
      const isPKCE = exchangeError?.message?.includes('PKCE code verifier not found');

      console[isPKCE ? 'warn' : 'error'](
        JSON.stringify({
          event: 'oauth.callback.exchange_failed',
          error: exchangeError?.message ?? 'No user returned',
          isPKCE,
          timestamp: new Date().toISOString(),
        })
      );

      if (isPKCE) {
        return NextResponse.redirect(`${redirectBase}/login?verified=true`);
      }

      await logAuthEvent({
        userId: 'anonymous',
        email: 'unknown',
        provider: 'google',
        status: 'failed',
        error: exchangeError?.message ?? 'Error en intercambio de código',
      });

      return NextResponse.redirect(`${redirectBase}/login?error=auth_failed`);
    }

    // ── Sesión establecida correctamente ──────────────────────────────────
    console.log(
      JSON.stringify({
        event: 'oauth.callback.session_ok',
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString(),
      })
    );

    await logAuthEvent({
      userId: user.id,
      email: user.email ?? '',
      provider: 'google',
      status: 'success',
    });

    // ── Buscar rol del usuario en la DB vía Admin Client ──────────────────
    // Si falta SUPABASE_SERVICE_ROLE_KEY en Vercel, redirige a /onboarding
    // como fallback seguro (el usuario configurará su empresa allí).
    let usuarioDB: { id: string; rol: string } | null = null;

    try {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (!serviceKey || !supabaseUrl) {
        // Variables de entorno ausentes → enviar a onboarding
        console.warn(
          JSON.stringify({
            event: 'oauth.callback.missing_env',
            missing: !serviceKey ? 'SUPABASE_SERVICE_ROLE_KEY' : 'NEXT_PUBLIC_SUPABASE_URL',
            fallback: '/onboarding',
            timestamp: new Date().toISOString(),
          })
        );
      } else {
        const { createAdminClient } = await import('@/lib/supabaseAdmin');
        const admin = createAdminClient();
        const { data, error: dbError } = await admin
          .from('Usuario')
          .select('id, rol')
          .eq('id', user.id)
          .single();

        if (dbError && dbError.code !== 'PGRST116') {
          // PGRST116 = "no rows found" (usuario nuevo), otros errores son inesperados
          console.warn(
            JSON.stringify({
              event: 'oauth.callback.db_warn',
              warning: dbError.message,
              code: dbError.code,
              userId: user.id,
              timestamp: new Date().toISOString(),
            })
          );
        } else if (data) {
          usuarioDB = data;
        }
      }
    } catch (adminErr) {
      console.error(
        JSON.stringify({
          event: 'oauth.callback.admin_client_error',
          error: adminErr instanceof Error ? adminErr.message : String(adminErr),
          fallback: '/onboarding',
          timestamp: new Date().toISOString(),
        })
      );
    }

    // ── Redirigir según estado del usuario ────────────────────────────────
    if (!usuarioDB) {
      // Usuario nuevo o no encontrado en la DB → onboarding
      console.log(
        JSON.stringify({
          event: 'oauth.callback.redirect',
          destination: '/onboarding',
          reason: 'user_not_in_db',
          userId: user.id,
          timestamp: new Date().toISOString(),
        })
      );
      return NextResponse.redirect(`${redirectBase}/onboarding`);
    }

    // Usuario existente → rutear según rol
    const destination =
      usuarioDB.rol === 'super_admin'
        ? '/admin'
        : usuarioDB.rol === 'repartidor'
        ? '/dashboard/pedidos'
        : '/dashboard';

    console.log(
      JSON.stringify({
        event: 'oauth.callback.redirect',
        destination,
        rol: usuarioDB.rol,
        userId: user.id,
        timestamp: new Date().toISOString(),
      })
    );

    return NextResponse.redirect(`${redirectBase}${destination}`);
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'oauth.callback.exception',
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      })
    );
  }

  return NextResponse.redirect(`${redirectBase}/login?error=auth_failed`);
}
