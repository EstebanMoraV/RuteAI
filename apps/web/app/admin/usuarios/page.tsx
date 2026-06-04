export const dynamic = "force-dynamic";

import prisma from "@ruteai/database";
import { Users, Building2 } from "lucide-react";
import { EliminarUsuarioButton } from "../components/EliminarUsuarioButton";

const ROL_BADGE: Record<string, string> = {
  encargado:  "bg-blue-500/10 text-blue-400 border-blue-500/30",
  repartidor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  super_admin:"bg-violet-500/10 text-violet-400 border-violet-500/30",
};

export default async function AdminUsuariosPage() {
  const usuarios = await prisma.usuario.findMany({
    include: { empresa: true },
    orderBy: { createdAt: "desc" },
  });

  const totalEncargados   = usuarios.filter((u) => u.rol === "encargado").length;
  const totalRepartidores = usuarios.filter((u) => u.rol === "repartidor").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-violet-400 text-sm font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          Panel de Control
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Todos los{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
            Usuarios
          </span>
        </h1>
        <p className="text-zinc-500 text-sm mt-2">
          {usuarios.length} usuarios · {totalEncargados} encargados · {totalRepartidores} repartidores
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: "Total Usuarios",  value: usuarios.length,      dot: "bg-violet-500" },
          { label: "Encargados",      value: totalEncargados,      dot: "bg-blue-500" },
          { label: "Repartidores",    value: totalRepartidores,    dot: "bg-amber-500" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${k.dot}`} />
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{k.label}</p>
            </div>
            <p className="font-mono text-4xl font-extrabold text-white">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-300 flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-400" />
            Directorio global
          </h2>
          <span className="text-xs text-zinc-500 font-mono">{usuarios.length} total</span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {["Usuario", "Empresa", "Rol", "Teléfono", "Registrado", "Acciones"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-zinc-500 font-mono">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {usuarios.map((u) => (
              <tr key={u.id} className="hover:bg-zinc-800/20 transition-colors group">
                {/* Usuario */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400 uppercase shrink-0">
                      {u.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{u.nombre}</p>
                      <p className="text-[11px] text-zinc-500 font-mono">{u.email}</p>
                    </div>
                  </div>
                </td>

                {/* Empresa */}
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-zinc-300 text-xs">
                    <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    {u.empresa?.nombre ?? "—"}
                  </span>
                </td>

                {/* Rol */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase ${ROL_BADGE[u.rol] ?? ROL_BADGE.repartidor}`}>
                    {u.rol}
                  </span>
                </td>

                {/* Teléfono */}
                <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                  {u.telefono ?? "—"}
                </td>

                {/* Fecha */}
                <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                  {new Date(u.createdAt).toLocaleDateString("es-CL", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </td>

                {/* Acciones */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <EliminarUsuarioButton id={u.id} nombre={u.nombre} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
