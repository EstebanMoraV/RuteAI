"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Zap, Mail, Lock, Eye, EyeOff, Route, ArrowRight,
  User, Building2, ShieldCheck, Earth, Sparkles
} from "lucide-react";
import Link from "next/link";
import { logAuthEvent } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register" | "verify-email">("login");
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const verifiedParam = searchParams.get("verified");
    if (verifiedParam === "true") {
      toast.success("¡Email verificado! Ahora puedes iniciar sesión.", { id: "verified" });
    } else if (errorParam === "oauth_error" || errorParam === "auth_failed") {
      toast.error("Error al autenticar. Intenta de nuevo.", { id: "oauth-err" });
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      toast.error("Faltan variables de entorno de Supabase.", { id: "auth" });
      return;
    }
    try {
      setIsLoading(true);
      toast.loading("Redirigiendo a Google...", { id: "auth" });
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${appUrl}/auth/callback` },
      });
      if (error) {
        toast.error(error.message, { id: "auth" });
        await logAuthEvent({ userId: "anonymous", email: "unknown", provider: "google", status: "failed", error: error.message });
        return;
      }
      if (data?.url) { window.location.href = data.url; return; }
      toast.error("No se pudo iniciar el flujo de Google OAuth.", { id: "auth" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al conectar con Google";
      toast.error(msg, { id: "auth" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (mode === "login") {
        toast.loading("Verificando credenciales...", { id: "auth" });
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
          const resData = await response.json() as { error?: string };
          toast.error(resData.error || "Credenciales incorrectas.", { id: "auth" });
          await logAuthEvent({ userId: "anonymous", email, provider: "email", status: "failed", error: resData.error ?? "Credenciales inválidas" });
          return;
        }
        const resData = await response.json() as { success: boolean; usuario: { id: string; email: string; nombre: string; rol: string; empresaId: string; }; };
        toast.success("¡Bienvenido de vuelta!", { id: "auth" });
        await logAuthEvent({ userId: resData.usuario.id, email: resData.usuario.email, provider: "email", status: "success" });
        const rol = resData.usuario.rol;
        if (rol === "super_admin") router.push("/admin");
        else if (rol === "repartidor") router.push("/dashboard/pedidos");
        else router.push("/dashboard");
        router.refresh();
      } else {
        if (!nombreCompleto || !nombreEmpresa) {
          toast.error("Por favor completa tu nombre y el de tu empresa.", { id: "auth" });
          setIsLoading(false);
          return;
        }
        localStorage.setItem("onboarding_nombre", nombreCompleto);
        localStorage.setItem("onboarding_empresa", nombreEmpresa);
        toast.loading("Creando tu cuenta...", { id: "auth" });
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nombre: nombreCompleto, empresa: nombreEmpresa, rol: "encargado" },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });
        if (error) { toast.error(error.message, { id: "auth" }); return; }
        if (data?.session) {
          toast.success("¡Bienvenido! Configurando tu workspace...", { id: "auth" });
          router.push("/onboarding");
        } else {
          toast.success("¡Cuenta creada! Revisa tu correo electrónico.", { id: "auth" });
          setMode("verify-email");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error interno del servidor";
      toast.error(msg, { id: "auth" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-sans" style={{ background: "hsl(240 10% 3.9%)", color: "hsl(0 0% 98%)" }}>

      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --primary: hsl(38 92% 50%);
          --primary-foreground: hsl(240 10% 3.9%);
          --ai: hsl(271 81% 66%);
          --background: hsl(240 10% 3.9%);
          --foreground: hsl(0 0% 98%);
          --muted-foreground: hsl(240 5% 64.9%);
          --border: hsl(240 3.7% 15.9%);
          --shadow-glow-amber: 0 0 20px rgba(245,158,11,0.25), 0 0 40px rgba(245,158,11,0.10);
        }
        .text-gradient-ai {
          background: linear-gradient(to right, hsl(38 92% 50%), hsl(271 81% 66%));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .text-primary { color: hsl(38 92% 50%); }
        .text-ai { color: hsl(271 81% 66%); }
        .text-muted-foreground { color: hsl(240 5% 64.9%); }
        .border-border { border-color: hsl(240 3.7% 15.9%); }
        .bg-primary { background-color: hsl(38 92% 50%); }
        .bg-ai { background-color: hsl(271 81% 66%); }
        .shadow-glow-amber { box-shadow: var(--shadow-glow-amber); }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 30px hsl(240 10% 5%) inset !important;
          -webkit-text-fill-color: hsl(0 0% 98%) !important;
          caret-color: hsl(0 0% 98%);
        }
      `}} />

      {/* Fondos radiales */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-20 h-[480px] w-[480px] rounded-full blur-[120px]" style={{ background: "hsl(38 92% 50% / 0.15)" }} />
        <div className="absolute -bottom-40 -right-20 h-[520px] w-[520px] rounded-full blur-[140px]" style={{ background: "hsl(271 81% 66% / 0.20)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% -10%, rgba(255,255,255,0.06), transparent 60%)" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 lg:px-10">
        <Link href="/">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 relative grid place-items-center rounded-lg shadow-glow-amber" style={{ background: "linear-gradient(to bottom right, hsl(38 92% 50%), hsl(271 81% 66%))" }}>
              <Route className="h-1/2 w-1/2 text-white" strokeWidth={2.5} aria-hidden />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Route<span className="text-gradient-ai">AI</span>
            </span>
          </div>
        </Link>
        <Link href="/" className="text-sm text-muted-foreground hover:text-white transition-colors">
          ← Volver al sitio
        </Link>
      </header>

      {/* Grid principal */}
      <main className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 pb-16 pt-6 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:pt-12">

        {/* ── COLUMNA IZQUIERDA: MARKETING ── */}
        <section className="hidden flex-col justify-between lg:flex">
          <div>
            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground" style={{ background: "rgba(255,255,255,0.03)" }}>
              <Sparkles className="h-3.5 w-3.5 text-ai" aria-hidden />
              gpt-logistics-v2.1 en producción
            </span>

            {/* Headline */}
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight">
              La operación que <span className="text-gradient-ai">se optimiza sola</span>.
            </h1>

            <p className="mt-5 max-w-md text-base text-muted-foreground">
              Coordina repartidores, predice riesgos de entrega y reduce kilómetros — desde un solo workspace multi-tenant.
            </p>

            {/* Features */}
            <ul className="mt-10 space-y-4">
              <li className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <Zap className="h-4 w-4 text-primary" aria-hidden />
                </div>
                <div>
                  <div className="text-sm font-medium">Optimización en 1.4s</div>
                  <div className="text-xs text-muted-foreground">Re-rutea hasta 800 paradas en tiempo real.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                </div>
                <div>
                  <div className="text-sm font-medium">Roles y permisos</div>
                  <div className="text-xs text-muted-foreground">Super admin, operador y repartidor — aislados.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <Earth className="h-4 w-4 text-primary" aria-hidden />
                </div>
                <div>
                  <div className="text-sm font-medium">Multi-país LATAM</div>
                  <div className="text-xs text-muted-foreground">MX · CO · CL · AR · PE · PA · EC · UY.</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Avatar stack */}
          <div className="mt-12 flex items-center gap-6 border-t border-border pt-6">
            <div className="flex -space-x-2">
              <span className="h-7 w-7 rounded-full border-2" style={{ background: "#f59e0b", borderColor: "hsl(240 10% 3.9%)" }} />
              <span className="h-7 w-7 rounded-full border-2" style={{ background: "#a78bfa", borderColor: "hsl(240 10% 3.9%)" }} />
              <span className="h-7 w-7 rounded-full border-2" style={{ background: "#22d3ee", borderColor: "hsl(240 10% 3.9%)" }} />
              <span className="h-7 w-7 rounded-full border-2" style={{ background: "#34d399", borderColor: "hsl(240 10% 3.9%)" }} />
            </div>
            <p className="text-xs text-muted-foreground">+240 empresas en LATAM ya optimizan con RouteAI.</p>
          </div>
        </section>

        {/* ── COLUMNA DERECHA: FORMULARIO ── */}
        <section className="flex items-center">
          <div className="w-full rounded-2xl border border-border p-7 shadow-2xl backdrop-blur-xl sm:p-8" style={{ background: "rgba(255,255,255,0.02)" }}>

            {mode === "verify-email" ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
                  <Mail className="h-8 w-8 text-amber-400" aria-hidden />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">Revisa tu correo</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Enviamos un enlace de verificación a{" "}
                  <span className="font-medium text-white">{email}</span>.
                  Haz clic en él para activar tu cuenta y acceder al workspace.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  ¿No llegó el correo? Revisa la carpeta de spam.
                </p>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="mt-7 text-sm font-medium text-primary hover:underline"
                >
                  ← Volver al inicio de sesión
                </button>
              </div>
            ) : (
              <>
            {/* Tabs con indicador deslizante */}
            <div className="relative grid grid-cols-2 rounded-lg border border-border p-1 text-sm" style={{ background: "rgba(255,255,255,0.03)" }}>
              {/* Indicador de posición */}
              <div
                className="absolute inset-y-1 w-[calc(50%-4px)] rounded-md shadow-inner transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  left: mode === "login" ? "4px" : "calc(50%)"
                }}
              />
              <button
                type="button"
                onClick={() => setMode("login")}
                disabled={isLoading}
                className="relative z-10 rounded-md py-2 font-medium transition-colors"
                style={{ color: mode === "login" ? "hsl(0 0% 98%)" : "hsl(240 5% 64.9%)" }}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                disabled={isLoading}
                className="relative z-10 rounded-md py-2 font-medium transition-colors hover:text-white"
                style={{ color: mode === "register" ? "hsl(0 0% 98%)" : "hsl(240 5% 64.9%)" }}
              >
                Crear cuenta
              </button>
            </div>

            {/* Contenido del formulario */}
            <div>
              {/* Encabezado */}
              <div className="mt-7">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {mode === "login" ? "Bienvenido de vuelta" : "Empieza gratis en 1 minuto"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {mode === "login" ? "Accede a tu workspace de operación." : "Crea tu workspace y optimiza tu primera ruta hoy."}
                </p>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>

                {/* Campos de registro */}
                {mode === "register" && (
                  <>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Nombre completo</label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                        <input
                          type="text"
                          placeholder="Camila Ríos"
                          value={nombreCompleto}
                          onChange={(e) => setNombreCompleto(e.target.value)}
                          required
                          disabled={isLoading}
                          className="h-11 w-full rounded-lg border border-border pl-9 text-sm focus:outline-none transition"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            color: "hsl(0 0% 98%)",
                          }}
                          onFocus={(e) => { e.target.style.borderColor = "hsl(38 92% 50% / 0.4)"; e.target.style.boxShadow = "0 0 0 2px hsl(38 92% 50% / 0.2)"; }}
                          onBlur={(e) => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Empresa</label>
                      <div className="relative">
                        <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                        <input
                          type="text"
                          placeholder="Mercado Andino S.A.S"
                          value={nombreEmpresa}
                          onChange={(e) => setNombreEmpresa(e.target.value)}
                          required
                          disabled={isLoading}
                          className="h-11 w-full rounded-lg border border-border pl-9 text-sm focus:outline-none transition"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            color: "hsl(0 0% 98%)",
                          }}
                          onFocus={(e) => { e.target.style.borderColor = "hsl(38 92% 50% / 0.4)"; e.target.style.boxShadow = "0 0 0 2px hsl(38 92% 50% / 0.2)"; }}
                          onBlur={(e) => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email corporativo</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                    <input
                      type="email"
                      placeholder="tu@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11 w-full rounded-lg border border-border pl-9 text-sm focus:outline-none transition"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        color: "hsl(0 0% 98%)",
                      }}
                      onFocus={(e) => { e.target.style.borderColor = "hsl(38 92% 50% / 0.4)"; e.target.style.boxShadow = "0 0 0 2px hsl(38 92% 50% / 0.2)"; }}
                      onBlur={(e) => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Contraseña</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11 w-full rounded-lg border border-border pl-9 pr-10 text-sm focus:outline-none transition"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        color: "hsl(0 0% 98%)",
                      }}
                      onFocus={(e) => { e.target.style.borderColor = "hsl(38 92% 50% / 0.4)"; e.target.style.boxShadow = "0 0 0 2px hsl(38 92% 50% / 0.2)"; }}
                      onBlur={(e) => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded text-muted-foreground transition hover:text-white"
                      style={{ background: "transparent" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                    </button>
                  </div>
                </div>

                {/* Mantener sesión / Olvidé contraseña (solo en login) */}
                {mode === "login" && (
                  <div className="flex items-center justify-between text-xs">
                    <label className="inline-flex items-center gap-2 text-muted-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={isLoading}
                        className="h-3.5 w-3.5 rounded border-border"
                        style={{ background: "rgba(255,255,255,0.03)", accentColor: "hsl(38 92% 50%)" }}
                      />
                      Mantener sesión
                    </label>
                    <button
                      type="button"
                      onClick={() => toast.info("Próximamente disponible. Contacta a soporte.", { id: "forgot" })}
                      className="text-primary hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}

                {/* Botón principal */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:opacity-60 active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(to right, hsl(38 92% 50%), oklch(0.82 0.18 70))",
                    color: "hsl(240 10% 3.9%)",
                    boxShadow: "var(--shadow-glow-amber)"
                  }}
                >
                  {isLoading ? (
                    <span className="h-5 w-5 rounded-full border-2 border-current/20 border-t-current animate-spin" />
                  ) : (
                    <>
                      {mode === "login" ? "Entrar al workspace" : "Crear mi workspace"}
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                    </>
                  )}
                </button>

                {/* Separador */}
                <div className="relative my-2 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span className="h-px flex-1 border-t border-border" />
                  o continúa con
                  <span className="h-px flex-1 border-t border-border" />
                </div>

                {/* Solo Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium transition disabled:opacity-50 active:scale-[0.98]"
                  style={{ background: "rgba(255,255,255,0.03)", color: "hsl(0 0% 98%)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>

              </form>

              {/* Footer de la card */}
              <p className="mt-6 text-center text-xs text-muted-foreground">
                {mode === "login" ? (
                  <>
                    ¿No tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className="font-medium text-primary hover:underline"
                    >
                      Crear workspace
                    </button>
                  </>
                ) : (
                  <>
                    Al continuar aceptas los{" "}
                    <button type="button" onClick={() => toast.info("Términos del Servicio")} className="underline hover:text-white">Términos</button>
                    {" "}y{" "}
                    <button type="button" onClick={() => toast.info("Política de Privacidad")} className="underline hover:text-white">Política de privacidad</button>.
                  </>
                )}
              </p>
            </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
