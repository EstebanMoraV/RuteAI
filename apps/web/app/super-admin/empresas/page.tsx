import prisma from "@ruteai/database";
import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { Building2, Users, Package } from "lucide-react";

export default async function SuperAdminEmpresas() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const usuarioDB = await prisma.usuario.findUnique({ where: { id: user.id } });
  if (usuarioDB?.rol !== "super_admin") redirect("/dashboard");

  const empresas = await prisma.empresa.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          usuarios: true,
          pedidos: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-purple-500">Tenants</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">Empresas</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {empresas.length} empresa{empresas.length !== 1 ? "s" : ""} registrada{empresas.length !== 1 ? "s" : ""} en la plataforma.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-white/[0.02]">
        {/* Table */}
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-zinc-500">
            <tr className="border-b border-zinc-800">
              <th className="px-5 py-3 font-medium">Empresa</th>
              <th className="px-5 py-3 font-medium">Plan</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium">
                <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> Usuarios</span>
              </th>
              <th className="px-5 py-3 font-medium">
                <span className="inline-flex items-center gap-1"><Package className="h-3 w-3" /> Pedidos</span>
              </th>
              <th className="px-5 py-3 font-medium">Creada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {empresas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-zinc-500">
                  No hay empresas registradas aún.
                </td>
              </tr>
            ) : (
              empresas.map((empresa) => (
                <tr key={empresa.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-amber-500/20 to-purple-500/20 text-xs font-bold text-amber-500 ring-1 ring-inset ring-white/10">
                        {empresa.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-white">{empresa.nombre}</div>
                        <div className="text-xs text-zinc-500 font-mono">{empresa.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {empresa.plan === "business" && (
                      <span className="inline-flex items-center rounded-md bg-gradient-to-r from-amber-500/20 to-purple-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400 ring-1 ring-inset ring-amber-500/30">
                        ★ Business
                      </span>
                    )}
                    {empresa.plan === "pro" && (
                      <span className="inline-flex items-center rounded-md bg-purple-500/15 px-2 py-0.5 text-xs font-semibold text-purple-400 ring-1 ring-inset ring-purple-500/30">
                        Pro
                      </span>
                    )}
                    {(empresa.plan === "starter" || !empresa.plan) && (
                      <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-0.5 text-xs font-medium text-zinc-400 ring-1 ring-inset ring-white/10">
                        Starter
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {empresa.activa ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />Activa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />Inactiva
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 tabular-nums text-zinc-300">{empresa._count.usuarios}</td>
                  <td className="px-5 py-3 tabular-nums text-zinc-300">{empresa._count.pedidos}</td>
                  <td className="px-5 py-3 text-zinc-400 text-xs">
                    {new Date(empresa.createdAt).toLocaleDateString("es-CL", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex items-center border-t border-zinc-800 px-5 py-3 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            {empresas.length} empresa{empresas.length !== 1 ? "s" : ""} en total
          </div>
        </div>
      </div>
    </div>
  );
}
