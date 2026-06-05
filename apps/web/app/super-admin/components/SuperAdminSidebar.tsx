"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Route, ChevronDown, LayoutDashboard, Building2, ChartColumn, ShieldCheck, Webhook, Settings } from "lucide-react";

export function SuperAdminSidebar({ nombre, email }: { nombre: string; email: string }) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 md:flex z-50">
      
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-zinc-800 px-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 relative grid place-items-center rounded-lg bg-gradient-to-br from-amber-500 to-purple-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Route className="h-1/2 w-1/2 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Route<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">AI</span>
          </span>
        </div>
      </div>

      {/* Tenant Selector (Super Admin Version) */}
      <div className="border-b border-zinc-800 px-3 py-3">
        <button className="flex w-full items-center justify-between rounded-lg bg-white/[0.03] px-2.5 py-2 text-left ring-1 ring-inset ring-white/5 hover:bg-white/[0.06] transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-amber-500/30 to-purple-500/30 text-xs font-bold text-amber-500">
              R
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-zinc-200">RouteAI Platform</div>
              <div className="truncate text-[11px] text-zinc-500">Super Admin · Tier 0</div>
            </div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
        <Link 
          href="/super-admin" 
          className={`group flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors ${pathname === '/super-admin' ? 'bg-white/[0.06] text-white ring-1 ring-inset ring-white/10' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'}`}
        >
          <span className="flex items-center gap-2.5">
            <LayoutDashboard className={`h-4 w-4 ${pathname === '/super-admin' ? 'text-amber-500' : ''}`} />
            Visión global
          </span>
        </Link>
        
        <Link 
          href="/super-admin/empresas" 
          className={`group flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors ${isActive('/super-admin/empresas') ? 'bg-white/[0.06] text-white ring-1 ring-inset ring-white/10' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'}`}
        >
          <span className="flex items-center gap-2.5">
            <Building2 className={`h-4 w-4 ${isActive('/super-admin/empresas') ? 'text-amber-500' : ''}`} />
            Empresas
          </span>
          <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-purple-400">7</span>
        </Link>
        
        <Link 
          href="/super-admin/reportes" 
          className={`group flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors ${isActive('/super-admin/reportes') ? 'bg-white/[0.06] text-white ring-1 ring-inset ring-white/10' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'}`}
        >
          <span className="flex items-center gap-2.5">
            <ChartColumn className={`h-4 w-4 ${isActive('/super-admin/reportes') ? 'text-amber-500' : ''}`} />
            Reportes
          </span>
        </Link>

        <Link 
          href="/super-admin/seguridad" 
          className={`group flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors ${isActive('/super-admin/seguridad') ? 'bg-white/[0.06] text-white ring-1 ring-inset ring-white/10' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'}`}
        >
          <span className="flex items-center gap-2.5">
            <ShieldCheck className={`h-4 w-4 ${isActive('/super-admin/seguridad') ? 'text-amber-500' : ''}`} />
            Seguridad
          </span>
        </Link>

        <Link 
          href="/super-admin/integraciones" 
          className={`group flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors ${isActive('/super-admin/integraciones') ? 'bg-white/[0.06] text-white ring-1 ring-inset ring-white/10' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'}`}
        >
          <span className="flex items-center gap-2.5">
            <Webhook className={`h-4 w-4 ${isActive('/super-admin/integraciones') ? 'text-amber-500' : ''}`} />
            Integraciones
          </span>
        </Link>

        <Link 
          href="/super-admin/ajustes" 
          className={`group flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors ${isActive('/super-admin/ajustes') ? 'bg-white/[0.06] text-white ring-1 ring-inset ring-white/10' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'}`}
        >
          <span className="flex items-center gap-2.5">
            <Settings className={`h-4 w-4 ${isActive('/super-admin/ajustes') ? 'text-amber-500' : ''}`} />
            Ajustes
          </span>
        </Link>
      </nav>

      {/* User Profile */}
      <div className="border-t border-zinc-800 p-3">
        <div className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-white/5 transition-colors cursor-pointer">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-amber-500 to-purple-600 text-xs font-bold text-white">
            {nombre.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-white">{nombre}</div>
            <div className="truncate text-[11px] text-zinc-500">{email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
