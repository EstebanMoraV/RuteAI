"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

interface PedidoCoord {
  id: string;
  nombreCliente: string;
  direccion: string;
  lat: number | null;
  lng: number | null;
  estado: string;
}

interface Punto {
  id: string;
  lat: number;
  lng: number;
}

export function BotonOptimizarRutas({ pedidos }: { pedidos: PedidoCoord[] }) {
  const [loading, setLoading] = useState(false);

  async function handleOptimizar() {
    // Solo pedidos activos con coordenadas válidas
    const conCoords = pedidos.filter(
      (p) => (p.estado === "pendiente" || p.estado === "en_ruta") && p.lat != null && p.lng != null
    );

    if (conCoords.length < 2) {
      toast.info("Se necesitan al menos 2 pedidos con dirección geocodificada para optimizar.");
      return;
    }

    // El primer pedido es el punto de partida; el resto son las paradas a ordenar
    const [primero, ...resto] = conCoords;
    const origen: Punto = { id: primero.id, lat: primero.lat!, lng: primero.lng! };
    const puntos: Punto[] = resto.map((p) => ({ id: p.id, lat: p.lat!, lng: p.lng! }));

    setLoading(true);
    const toastId = toast.loading("Optimizando ruta con IA...");

    try {
      const res = await fetch("/api/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origen, puntos }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Error al optimizar");
      }

      toast.dismiss(toastId);

      // Mapear los ids de la ruta optimizada de vuelta a nombres de cliente
      const porId = new Map(conCoords.map((p) => [p.id, p]));
      const secuencia: string[] = (json.data.rutaOptimizada as Punto[]).map((pt, i) => {
        const pedido = porId.get(pt.id);
        return `${i + 1}. ${pedido?.nombreCliente ?? pt.id} — ${pedido?.direccion ?? ""}`;
      });

      await Swal.fire({
        title: "Ruta optimizada",
        html: `
          <p style="color:#a1a1aa;font-size:13px;margin-bottom:12px">
            ${json.data.totalPuntos} paradas · algoritmo <code style="color:#a78bfa">${json.data.algoritmo}</code>
          </p>
          <ol style="text-align:left;color:#f4f4f5;font-size:13px;line-height:1.9;list-style:none;padding:0">
            ${secuencia.map((s) => `<li>📍 ${s}</li>`).join("")}
          </ol>
        `,
        icon: "success",
        confirmButtonColor: "#a855f7",
        confirmButtonText: "Entendido",
        background: "#09090b",
        color: "#f4f4f5",
        customClass: { popup: "rounded-3xl border border-purple-500/20" },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al optimizar la ruta", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleOptimizar}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-400 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      Optimizar Rutas con IA
    </button>
  );
}
