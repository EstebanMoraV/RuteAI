import prisma from "@ruteai/database";
import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { Fuel, Clock, TrendingUp, Leaf, Sparkles, Database } from "lucide-react";

// Tipo del JSON almacenado en ReporteCache
interface DatosReporte {
  fecha:               string;
  empresa:             string;
  total:               number;
  entregados:          number;
  fallidos:            number;
  enRuta:              number;
  pendientes:          number;
  tasaExito:           number;
  scorePromedioRiesgo: number;
  generadoEn:          string;
}

export default async function ReportesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const usuarioDB = await prisma.usuario.findUnique({
    where: { id: user.id },
    include: { empresa: true },
  });

  if (!usuarioDB?.empresa) redirect("/login");

  // Leer últimos 30 días de reportes del cache (generados por CRON)
  // try-catch: si la tabla aún no fue migrada, usa datos en vivo como fallback
  let reportesCache: { datos: unknown; fecha: Date }[] = [];
  try {
    reportesCache = await prisma.reporteCache.findMany({
      where: { empresaId: usuarioDB.empresa.id },
      orderBy: { fecha: "desc" },
      take: 30,
    });
  } catch {
    // Tabla ReporteCache aún no migrada — continúa con datos en vivo
  }

  const hayCache = reportesCache.length > 0;

  const pedidosHoy = await prisma.pedido.findMany({
    where: {
      empresaId: usuarioDB.empresa.id,
      createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    select: { estado: true, scoreRiesgo: true },
  });

  const ultimoReporte = hayCache
    ? (reportesCache[0].datos as unknown as DatosReporte)
    : null;

  const totalHoy      = ultimoReporte?.total      ?? pedidosHoy.length;
  const entregadosHoy = ultimoReporte?.entregados ?? pedidosHoy.filter(p => p.estado === "entregado").length;
  const fallidosHoy   = ultimoReporte?.fallidos   ?? pedidosHoy.filter(p => p.estado === "fallido").length;
  const tasaExito     = ultimoReporte?.tasaExito  ?? (totalHoy > 0 ? Math.round((entregadosHoy / totalHoy) * 100) : 96);

  const ultimos6 = reportesCache.slice(0, 6).reverse();


  const meses = [
    { name: "Oct", h1: "138.46px", h2: "138.46px" },
    { name: "Nov", h1: "150px", h2: "129.23px" },
    { name: "Dic", h1: "161.53px", h2: "116.92px" },
    { name: "Ene", h1: "169.23px", h2: "107.69px" },
    { name: "Feb", h1: "180.76px", h2: "93.84px" },
    { name: "Mar", h1: "190.76px", h2: "83.07px" },
  ];

  const motivosFallo = [
    { causa: "Cliente ausente", percent: 42 },
    { causa: "Dirección incorrecta", percent: 28 },
    { causa: "Rechazado por cliente", percent: 14 },
    { causa: "Producto dañado", percent: 9 },
    { causa: "Otros", percent: 7 },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto text-zinc-100 selection:bg-purple-500/30">
      
      {/* Header */}
      <div>
        <div className="text-xs uppercase tracking-widest text-amber-500 font-bold">
          Analítica
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
          Reportes de operación
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Marzo 2025 · {usuarioDB.empresa.nombre} · Global
        </p>
      </div>

      {/* Grid 4 KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1 */}
        <div className="rounded-xl border border-zinc-800 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 font-semibold">
            <Fuel className="h-3.5 w-3.5" /> Combustible ahorrado
          </div>
          <div className="mt-3 text-3xl font-semibold tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-purple-500">
            284 L
          </div>
          <div className="mt-1 text-xs text-zinc-400">≈ $1.412.000 COP</div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-xl border border-zinc-800 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 font-semibold">
            <Clock className="h-3.5 w-3.5" /> Tiempo recuperado
          </div>
          <div className="mt-3 text-3xl font-semibold tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-purple-500">
            62 h
          </div>
          <div className="mt-1 text-xs text-zinc-400">vs marzo 2024</div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-xl border border-zinc-800 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 font-semibold">
            <TrendingUp className="h-3.5 w-3.5" /> Tasa de éxito
          </div>
          <div className="mt-3 text-3xl font-semibold tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-purple-500">
            96.8%
          </div>
          <div className="mt-1 text-xs text-zinc-400">+2.1 pp</div>
        </div>

        {/* KPI 4 */}
        <div className="rounded-xl border border-zinc-800 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 font-semibold">
            <Leaf className="h-3.5 w-3.5" /> CO₂ evitado
          </div>
          <div className="mt-3 text-3xl font-semibold tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-purple-500">
            678 kg
          </div>
          <div className="mt-1 text-xs text-zinc-400">equiv. 32 árboles</div>
        </div>
      </div>

      {/* Grid Gráfico y Lista */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Gráfico Ahorro */}
        <div className="rounded-xl border border-zinc-800 bg-white/[0.02] p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Ahorro mensual gracias a la IA</h3>
            <span className="inline-flex items-center gap-1.5 rounded bg-purple-500/15 px-2 py-0.5 text-xs text-purple-400 ring-1 ring-inset ring-purple-500/20">
              <Sparkles className="h-3 w-3" /> Modelo v2.1
            </span>
          </div>
          
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5 text-zinc-400">
                <span className="h-2 w-2 rounded bg-white/15" /> Costo sin IA
              </span>
              <span className="inline-flex items-center gap-1.5 text-zinc-400">
                <span className="h-2 w-2 rounded bg-amber-500" /> Costo con RouteAI
              </span>
            </div>
            
            <div className="flex h-56 items-end gap-4 mt-4">
              {meses.map((mes) => (
                <div key={mes.name} className="flex flex-1 flex-col items-center gap-2 group cursor-pointer">
                  <div className="flex w-full items-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="flex-1 rounded-sm bg-white/10 group-hover:bg-white/20 transition-colors" style={{ height: mes.h1 }} />
                    <div className="flex-1 rounded-sm bg-gradient-to-t from-amber-500 to-purple-500" style={{ height: mes.h2 }} />
                  </div>
                  <div className="text-[11px] text-zinc-500 group-hover:text-white transition-colors">
                    {mes.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Motivos de Fallo */}
        <div className="rounded-xl border border-zinc-800 bg-white/[0.02] p-5">
          <h3 className="text-sm font-semibold text-white">Top motivos de fallo</h3>
          <ul className="mt-4 space-y-4 text-sm">
            {motivosFallo.map((motivo) => (
              <li key={motivo.causa} className="group">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 group-hover:text-white transition-colors">{motivo.causa}</span>
                  <span className="font-mono text-zinc-500">{motivo.percent}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-purple-500 rounded-full" 
                    style={{ width: `${motivo.percent}%` }} 
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
}
