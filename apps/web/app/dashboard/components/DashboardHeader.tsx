"use client";

import { Search, Bell } from "lucide-react";
import { useEffect, useState } from "react";

export function DashboardHeader() {
  const [nombre, setNombre] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data: { nombre?: string } | null) => {
        if (data?.nombre) setNombre(data.nombre.split(" ")[0]);
      })
      .catch(() => null);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.04] bg-zinc-950/70 px-5 backdrop-blur-xl">

      {/* Saludo */}
      {nombre && (
        <div className="hidden lg:flex shrink-0 items-center gap-1 text-sm">
          <span className="text-zinc-500">Hola,</span>
          <span className="font-medium text-white">{nombre}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input 
          placeholder="Buscar pedidos, clientes, repartidores…" 
          className="h-9 w-full rounded-md border border-white/[0.04] bg-white/5 pl-9 pr-16 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-white"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-white/[0.04] bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-500 sm:inline-flex">
          ⌘K
        </kbd>
      </div>

      {/* Bell Notification */}
      <button className="grid h-9 w-9 place-items-center rounded-md border border-white/[0.04] bg-white/5 text-zinc-400 hover:text-white transition-colors">
        <Bell className="h-4 w-4" />
      </button>

      {/* Action Button */}
      <button className="hidden items-center gap-2 rounded-md bg-gradient-to-r from-amber-500 to-amber-400 px-3 py-2 text-xs font-semibold text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:opacity-90 sm:inline-flex transition-opacity">
        <span className="h-1.5 w-1.5 rounded-full bg-purple-600 animate-pulse" />
        Optimizar con IA
      </button>

    </header>
  );
}
