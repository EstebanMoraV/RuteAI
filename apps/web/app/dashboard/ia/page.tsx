import prisma from "@ruteai/database";
import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { Brain, TrendingDown, Target, Activity, Zap, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

// ── Tipos ────────────────────────────────────────────────────
interface ScoreResultado {
  pedidoId:  string;
  score:     number;
  nivel:     "bajo" | "medio" | "alto";
  razones:   string[];
}

// ── Llamada al AI Microservice (patrón BFF) ──────────────────
async function obtenerScoreRiesgo(
  pedidoId: string,
  diasRetraso: number,
  estado: string,
): Promise<ScoreResultado | null> {
  try {
    const aiUrl = process.env.AI_SERVICE_URL ?? "https://ruteai-ai-service.vercel.app";
    const aiSecret = process.env.AI_SERVICE_SECRET ?? "";
    const res = await fetch(`${aiUrl}/api/score`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "x-api-key": aiSecret },
      body: JSON.stringify({
        pedidoId,
        lat:              -33.45,   // Santiago por defecto
        lng:              -70.66,
        hora:             new Date().getHours(),
        diasRetraso:      Math.max(0, diasRetraso),
        intentosFallidos: estado === "fallido" ? 1 : 0,
        zonaRiesgo:       false,
      }),
      next: { revalidate: 60 },     // cache 60s
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as ScoreResultado;
  } catch {
    return null;
  }
}

// ── Helpers UI ───────────────────────────────────────────────
function NivelBadge({ nivel }: { nivel: string }) {
  const map: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    bajo:  { color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20", icon: <CheckCircle2 className="w-3 h-3" />, label: "Riesgo Bajo"  },
    medio: { color: "text-amber-600 bg-amber-500/10 border-amber-500/20",      icon: <AlertTriangle className="w-3 h-3" />, label: "Riesgo Medio" },
    alto:  { color: "text-rose-600 bg-rose-500/10 border-rose-500/20",         icon: <XCircle className="w-3 h-3" />,      label: "Riesgo Alto"  },
  };
  const cfg = map[nivel] ?? map.bajo;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct   = Math.round(score * 100);
  const color = pct > 60 ? "bg-rose-500" : pct > 30 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-foreground w-8 text-right">{pct}%</span>
    </div>
  );
}

// ── Page (Server Component) ───────────────────────────────────
export default async function IAPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const usuarioDB = await prisma.usuario.findUnique({
    where:   { id: user.id },
    include: { empresa: true },
  });
  if (!usuarioDB || !usuarioDB.empresa) redirect("/dashboard");

  // Últimos 5 pedidos de la empresa
  const pedidos = await prisma.pedido.findMany({
    where:   { empresaId: usuarioDB.empresa.id },
    orderBy: { createdAt: "desc" },
    take:    5,
  });

  // Calcular score de riesgo para cada pedido en paralelo via AI Service
  const hoy = new Date();
  const scores = await Promise.all(
    pedidos.map((p) => {
      // Días desde creación como proxy de retraso si estado no es entregado
      const diasRetraso = p.estado !== "entregado"
        ? Math.floor((hoy.getTime() - new Date(p.createdAt).getTime()) / 86_400_000)
        : 0;
      return obtenerScoreRiesgo(p.id, diasRetraso, p.estado);
    })
  );

  // Métricas globales
  const scoresValidos  = scores.filter(Boolean) as ScoreResultado[];
  const promedioScore  = scoresValidos.length
    ? Math.round(scoresValidos.reduce((a, s) => a + s.score * 100, 0) / scoresValidos.length)
    : 0;
  const pedidosAltos   = scoresValidos.filter((s) => s.nivel === "alto").length;
  const pedidosMedios  = scoresValidos.filter((s) => s.nivel === "medio").length;

  return (
    <div className="px-2 pb-10">
      <div className="max-w-[85rem] mx-auto">

        {/* HEADER */}
        <header className="mb-10 lg:mb-12 flex flex-col justify-between items-start border-b border-border-ui pb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] pointer-events-none rounded-full" />
          <div className="flex flex-col gap-1.5 relative z-10 w-full">
            <div className="flex justify-between items-center w-full">
              <span className="text-purple-500 text-xs font-bold tracking-[0.2em] uppercase mb-1 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Motor Predictivo Core
              </span>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Microservicio Online
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-2">
              Predicciones <span className="text-purple-600 dark:text-purple-400">IA</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl font-medium">
              Análisis de riesgo en tiempo real impulsado por el microservicio{" "}
              <code className="text-purple-500 text-xs bg-purple-500/10 px-1 py-0.5 rounded">ruteai-ai-service</code>.
            </p>
          </div>
        </header>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border-ui p-6 rounded-3xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300 shadow-sm hover:shadow-md">
            <div className="absolute -right-4 -top-4 bg-purple-500/5 w-24 h-24 rounded-full blur-[30px]" />
            <h3 className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold mb-1 flex gap-2 items-center">
              <Activity className="w-4 h-4 text-purple-500" /> Nivel de Riesgo Global
            </h3>
            <p className="text-4xl font-black text-foreground">
              {promedioScore}%{" "}
              <span className="text-sm text-emerald-500 font-bold inline-flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Estable
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Promedio sobre {scoresValidos.length} pedidos</p>
          </div>

          <div className="bg-card border border-border-ui p-6 rounded-3xl relative overflow-hidden hover:border-rose-500/30 transition-all duration-300 shadow-sm hover:shadow-md">
            <div className="absolute -right-4 -top-4 bg-rose-500/5 w-24 h-24 rounded-full blur-[30px]" />
            <h3 className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold mb-1 flex gap-2 items-center">
              <XCircle className="w-4 h-4 text-rose-500" /> Pedidos Riesgo Alto
            </h3>
            <p className="text-4xl font-black text-foreground">{pedidosAltos}</p>
            <p className="text-xs text-muted-foreground mt-1">Requieren atención inmediata</p>
          </div>

          <div className="bg-card border border-border-ui p-6 rounded-3xl relative overflow-hidden hover:border-amber-500/30 transition-all duration-300 shadow-sm hover:shadow-md">
            <div className="absolute -right-4 -top-4 bg-amber-500/5 w-24 h-24 rounded-full blur-[30px]" />
            <h3 className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold mb-1 flex gap-2 items-center">
              <Target className="w-4 h-4 text-amber-500" /> Pedidos Riesgo Medio
            </h3>
            <p className="text-4xl font-black text-foreground">{pedidosMedios}</p>
            <p className="text-xs text-muted-foreground mt-1">Monitoreo preventivo</p>
          </div>
        </div>

        {/* ANÁLISIS POR PEDIDO */}
        <div className="bg-card border border-border-ui rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-purple-500" />
            Análisis de Riesgo por Pedido
            <span className="ml-auto text-xs text-muted-foreground font-normal">
              Powered by ruteai-ai-service · nearest-neighbor heuristic
            </span>
          </h2>

          {pedidos.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No hay pedidos para analizar.</p>
          ) : (
            <div className="space-y-4">
              {pedidos.map((pedido, i) => {
                const score = scoresValidos[i];
                if (!score) return null;
                return (
                  <div key={pedido.id} className="border border-border-ui rounded-2xl p-5 hover:border-purple-500/20 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-bold text-foreground truncate max-w-sm">
                          {pedido.producto || `Pedido ${pedido.id.slice(0, 8)}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">
                          {pedido.direccion}
                        </p>
                      </div>
                      <NivelBadge nivel={score.nivel} />
                    </div>
                    <ScoreBar score={score.score} />
                    <ul className="mt-3 space-y-1">
                      {score.razones.map((r, j) => (
                        <li key={j} className="text-xs text-muted-foreground flex gap-1.5">
                          <span className="text-purple-500 mt-0.5">›</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
