"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Package, ArrowLeft, Save, Calendar } from "lucide-react";
import { agregarPedidoNuevo } from "../../actions";
import { AddressPickerMap } from "../../components/AddressPickerMap";

const API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "";

// Fecha mínima: 8 horas desde ahora, formateada para datetime-local
function fechaMinima(): string {
  const d = new Date(Date.now() + 8 * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CrearPedidoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [direccion, setDireccion] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    if (lat !== null) formData.set("lat", String(lat));
    if (lng !== null) formData.set("lng", String(lng));
    if (direccion) formData.set("direccion", direccion);

    const toastId = toast.loading("Creando pedido y calculando riesgo IA...");
    try {
      const res = await agregarPedidoNuevo(formData);
      if (res?.error) throw new Error(res.error);
      toast.success("Pedido creado exitosamente", { id: toastId });
      router.push("/dashboard/pedidos");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al crear";
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="font-sans px-2">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 flex flex-col border-b border-white/[0.04] pb-6">
          <Link href="/dashboard/pedidos" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4 text-sm font-medium w-fit">
            <ArrowLeft className="w-4 h-4" /> Volver a Pedidos
          </Link>
          <div className="flex flex-col gap-1">
            <span className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-1 flex items-center gap-2">
              <Package className="w-4 h-4" /> Logística
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
              Nuevo <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Pedido</span>
            </h1>
            <p className="text-zinc-500/90 text-sm">
              Captura los datos del envío. La IA calculará el riesgo automáticamente.
            </p>
          </div>
        </header>

        <section className="bg-zinc-900/40 backdrop-blur-md border border-white/[0.04] rounded-3xl p-8 shadow-xl">
          <form action={handleSubmit} className="flex flex-col gap-5">

            <div className="grid gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Cliente / Destinatario</label>
              <input
                name="cliente"
                required
                placeholder="Ej. Juan Pérez"
                disabled={loading}
                className="bg-zinc-950/80 border border-white/[0.04] rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 outline-none transition-all disabled:opacity-50"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Teléfono (SMS)</label>
              <input
                name="clienteTelefono"
                type="tel"
                placeholder="+56912345678"
                disabled={loading}
                className="bg-zinc-950/80 border border-white/[0.04] rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 outline-none transition-all disabled:opacity-50"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Dirección de entrega</label>
              <AddressPickerMap
                apiKey={API_KEY}
                onAddressChange={(addr, la, ln) => {
                  setDireccion(addr);
                  setLat(la);
                  setLng(ln);
                }}
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Producto / Contenido</label>
              <input
                name="producto"
                required
                placeholder="Ej. Monitor LG 27''"
                disabled={loading}
                className="bg-zinc-950/80 border border-white/[0.04] rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 outline-none transition-all disabled:opacity-50"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" /> Fecha de entrega
              </label>
              <input
                name="fechaEntrega"
                type="datetime-local"
                required
                min={fechaMinima()}
                disabled={loading}
                className="bg-zinc-950/80 border border-white/[0.04] rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 outline-none transition-all disabled:opacity-50 [color-scheme:dark]"
              />
              <p className="text-[11px] text-zinc-500">
                Mínimo 8 horas desde ahora. No se podrá asignar repartidor si queda menos de ese tiempo.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/[0.04]">
              <Link
                href="/dashboard/pedidos"
                className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-white/[0.04] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 text-sm rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold transition-all duration-300 disabled:opacity-50 flex gap-2 items-center active:scale-95 shadow-lg shadow-amber-500/20"
              >
                {loading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                ) : (
                  <><Save className="w-4 h-4" /> Crear pedido</>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
