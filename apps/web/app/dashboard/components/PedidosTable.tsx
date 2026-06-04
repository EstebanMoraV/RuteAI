"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Sparkles, ChevronDown, UserCheck, UserX,
  MoreHorizontal, Pencil, Trash2, Send, CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import {
  eliminarPedido, asignarRepartidor, marcarEnRuta, marcarComoEntregado,
} from "../actions";

interface Pedido {
  id: string;
  producto: string;
  nombreCliente: string;
  direccion: string;
  estado: string;
  scoreRiesgo: number | null;
  repartidorId: string | null;
  repartidor: { id: string; nombre: string } | null;
}

interface RepartidorOpt {
  id: string;
  nombre: string;
}

export function PedidosTable({
  pedidos,
  repartidores,
}: {
  pedidos: Pedido[];
  repartidores: RepartidorOpt[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("Todos");
  const [repAbierto, setRepAbierto] = useState<string | null>(null);
  const [accionAbierto, setAccionAbierto] = useState<string | null>(null);
  const [asignando, setAsignando] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<string | null>(null);

  const filters = ["Todos", "Pendientes", "En ruta", "Entregados", "Fallidos"];

  const cerrarTodo = () => {
    setRepAbierto(null);
    setAccionAbierto(null);
  };

  const filtered = useMemo(() => {
    return pedidos.filter((p) => {
      const dbStatusMap: Record<string, string> = {
        Pendientes: "pendiente",
        "En ruta": "en_ruta",
        Entregados: "entregado",
        Fallidos: "fallido",
      };
      const matchStatus = filter === "Todos" || p.estado === dbStatusMap[filter];
      const matchQuery =
        query === "" ||
        p.id.toLowerCase().includes(query.toLowerCase()) ||
        p.nombreCliente.toLowerCase().includes(query.toLowerCase()) ||
        p.direccion.toLowerCase().includes(query.toLowerCase()) ||
        p.producto.toLowerCase().includes(query.toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [pedidos, query, filter]);

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "en_ruta":   return { label: "En ruta",   classes: "bg-blue-500/10 text-blue-400 ring-blue-500/30" };
      case "pendiente": return { label: "Pendiente", classes: "bg-amber-500/10 text-amber-400 ring-amber-500/30" };
      case "entregado": return { label: "Entregado", classes: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30" };
      case "fallido":   return { label: "Fallido",   classes: "bg-red-500/10 text-red-400 ring-red-500/30" };
      default:          return { label: estado,      classes: "bg-zinc-800 text-zinc-400 ring-zinc-700" };
    }
  };

  const getRiskBadge = (score: number) => {
    if (score >= 70) return { label: "Alto",  classes: "bg-red-500/10 text-red-400 ring-red-500/30 animate-pulse" };
    if (score >= 30) return { label: "Medio", classes: "bg-amber-500/10 text-amber-400 ring-amber-500/30" };
    return             { label: "Bajo",  classes: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30" };
  };

  async function handleAsignar(pedidoId: string, repartidorId: string | null) {
    setAsignando(pedidoId);
    cerrarTodo();
    try {
      const res = await asignarRepartidor(pedidoId, repartidorId);
      if (res?.error) toast.error(res.error);
      else toast.success(repartidorId ? "Repartidor asignado" : "Asignación eliminada");
    } catch {
      toast.error("Error al asignar repartidor");
    } finally {
      setAsignando(null);
    }
  }

  async function handleEliminar(pedidoId: string) {
    cerrarTodo();
    const result = await Swal.fire({
      title: "¿Eliminar pedido?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f43f5e",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#09090b",
      color: "#f4f4f5",
      customClass: { popup: "rounded-3xl border border-rose-500/20" },
    });
    if (!result.isConfirmed) return;

    setProcesando(pedidoId);
    try {
      const res = await eliminarPedido(pedidoId);
      if (res?.error) toast.error(res.error);
      else toast.success("Pedido eliminado");
    } catch {
      toast.error("Error al eliminar el pedido");
    } finally {
      setProcesando(null);
    }
  }

  async function handleMarcarEnRuta(pedidoId: string) {
    cerrarTodo();
    setProcesando(pedidoId);
    try {
      const res = await marcarEnRuta(pedidoId);
      if (res?.error) toast.error(res.error);
      else toast.success("Pedido en ruta. Cliente notificado.");
    } catch {
      toast.error("Error al despachar el pedido");
    } finally {
      setProcesando(null);
    }
  }

  async function handleEntregar(pedidoId: string) {
    cerrarTodo();
    setProcesando(pedidoId);
    try {
      const res = await marcarComoEntregado(pedidoId);
      if (res?.error) toast.error(res.error);
      else toast.success("Pedido marcado como entregado");
    } catch {
      toast.error("Error al marcar como entregado");
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="rounded-xl border border-white/[0.04] bg-white/5 overflow-hidden">

      {/* Overlay para cerrar dropdowns al hacer clic afuera */}
      {(repAbierto || accionAbierto) && (
        <div className="fixed inset-0 z-20" onClick={cerrarTodo} />
      )}

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.04] p-3 bg-zinc-950/20">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            placeholder="Buscar cliente, ID o dirección…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-white/[0.04] bg-white/5 pl-9 text-sm placeholder:text-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-shadow"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-md border border-white/[0.04] bg-white/5 p-0.5 text-xs">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-2.5 py-1 transition-colors ${
                filter === f ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-zinc-500 bg-zinc-950/20">
            <tr className="border-b border-white/[0.04]">
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">Cliente</th>
              <th className="px-5 py-3 font-medium">Destino</th>
              <th className="px-5 py-3 font-medium">Producto</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-purple-400" /> Riesgo IA
                </span>
              </th>
              <th className="px-5 py-3 font-medium">Repartidor</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-zinc-500">
                  No se encontraron pedidos
                </td>
              </tr>
            ) : (
              filtered.map((o) => {
                const shortId  = "RA-" + o.id.slice(-5).toUpperCase();
                const status   = getStatusBadge(o.estado);
                const riskScore = o.scoreRiesgo ?? 0;
                const risk     = getRiskBadge(riskScore);
                const repEsteAbierto = repAbierto === o.id;
                const accEsteAbierto = accionAbierto === o.id;
                const ocupado = procesando === o.id;

                return (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-3 font-mono text-xs text-zinc-500">{shortId}</td>
                    <td className="px-5 py-3 font-medium text-white">{o.nombreCliente}</td>
                    <td className="px-5 py-3 max-w-xs truncate text-zinc-400">{o.direccion}</td>
                    <td className="px-5 py-3 text-zinc-400">{o.producto}</td>

                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${status.classes}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {status.label}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      <div className="inline-flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium tabular-nums ring-1 ring-inset ${risk.classes}`}>
                          {riskScore >= 70 && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                          {riskScore}%
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500">{risk.label}</span>
                      </div>
                    </td>

                    {/* Selector de repartidor */}
                    <td className="px-5 py-3 relative">
                      <button
                        onClick={() => { setAccionAbierto(null); setRepAbierto(repEsteAbierto ? null : o.id); }}
                        disabled={asignando === o.id}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-white/5 disabled:opacity-50"
                      >
                        {asignando === o.id ? (
                          <span className="h-3 w-3 rounded-full border border-zinc-500 border-t-white animate-spin" />
                        ) : o.repartidor ? (
                          <UserCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                        ) : (
                          <UserX className="h-3 w-3 text-zinc-600 shrink-0" />
                        )}
                        <span className={o.repartidor ? "text-white" : "italic text-zinc-600"}>
                          {o.repartidor?.nombre ?? "Sin asignar"}
                        </span>
                        <ChevronDown className={`h-3 w-3 text-zinc-500 transition-transform ${repEsteAbierto ? "rotate-180" : ""}`} />
                      </button>

                      {repEsteAbierto && (
                        <div className="absolute left-4 top-full z-30 mt-1 w-48 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl py-1 overflow-hidden">
                          <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-zinc-500 border-b border-zinc-800">
                            Asignar repartidor
                          </p>
                          <button
                            onClick={() => handleAsignar(o.id, null)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <UserX className="h-3.5 w-3.5" /> Sin asignar
                          </button>
                          {repartidores.length === 0 ? (
                            <p className="px-3 py-2 text-xs text-zinc-600 italic">No hay repartidores registrados</p>
                          ) : (
                            repartidores.map((r) => (
                              <button
                                key={r.id}
                                onClick={() => handleAsignar(o.id, r.id)}
                                className={`flex w-full items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-white/5 ${
                                  o.repartidorId === r.id ? "text-amber-400" : "text-zinc-300 hover:text-white"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <UserCheck className="h-3.5 w-3.5" /> {r.nombre}
                                </span>
                                {o.repartidorId === r.id && <span className="text-[10px]">activo</span>}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </td>

                    {/* Menú de acciones (3 puntitos) */}
                    <td className="px-5 py-3 text-right relative">
                      <button
                        onClick={() => { setRepAbierto(null); setAccionAbierto(accEsteAbierto ? null : o.id); }}
                        disabled={ocupado}
                        className="grid h-7 w-7 place-items-center rounded-md text-zinc-500 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 ml-auto"
                      >
                        {ocupado ? (
                          <span className="h-3.5 w-3.5 rounded-full border border-zinc-500 border-t-white animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </button>

                      {accEsteAbierto && (
                        <div className="absolute right-4 top-full z-30 mt-1 w-44 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl py-1 overflow-hidden text-left">
                          <Link
                            href={`/dashboard/pedidos/${o.id}/editar`}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Editar
                          </Link>

                          {o.estado === "pendiente" && (
                            <button
                              onClick={() => handleMarcarEnRuta(o.id)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-blue-400 hover:bg-white/5 hover:text-blue-300 transition-colors"
                            >
                              <Send className="h-3.5 w-3.5" /> Despachar
                            </button>
                          )}

                          {o.estado === "en_ruta" && (
                            <button
                              onClick={() => handleEntregar(o.id)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-emerald-400 hover:bg-white/5 hover:text-emerald-300 transition-colors"
                            >
                              <CheckCircle className="h-3.5 w-3.5" /> Marcar entregado
                            </button>
                          )}

                          <div className="my-1 border-t border-zinc-800" />

                          <button
                            onClick={() => handleEliminar(o.id)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
