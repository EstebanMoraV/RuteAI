"use client";

import { createCompany } from "./actions";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, ArrowRight, Sparkles, Route } from "lucide-react";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");

  useEffect(() => {
    // Intentar leer de localStorage si viene del registro inmediato
    const localNombre = localStorage.getItem("onboarding_nombre");
    const localEmpresa = localStorage.getItem("onboarding_empresa");
    
    if (localNombre) setNombre(localNombre);
    if (localEmpresa) setEmpresa(localEmpresa);

    // Limpiar localStorage para no dejar residuos
    if (localNombre) localStorage.removeItem("onboarding_nombre");
    if (localEmpresa) localStorage.removeItem("onboarding_empresa");
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    toast.loading("Configurando tu espacio de trabajo...", { id: "onboarding" });
    
    try {
      const result = await createCompany(formData);
      if (result?.success) {
        toast.success("¡Empresa creada! Entrando al dashboard...", { id: "onboarding" });
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Ocurrió un error al crear la empresa.", { id: "onboarding" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden font-sans selection:bg-amber-500/30">
      {/* Fondo global */}
      <style dangerouslySetInnerHTML={{__html: `
        .bg-grid {
          background-size: 40px 40px;
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }
        .text-gradient-ai {
          background: linear-gradient(to right, #a855f7, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}} />

      {/* Esferas de luz de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 pt-10">
        
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Route className="h-6 w-6 text-zinc-950" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
            ¡Bienvenido a Route<span className="text-amber-500">AI</span>!
          </h1>
          <p className="text-zinc-400 text-sm max-w-md">
            Estás a unos segundos de optimizar tu logística. Cuéntanos sobre ti para configurar tu cuenta.
          </p>
        </div>

        <div className="w-full max-w-md bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl ring-1 ring-inset ring-white/5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            <div className="space-y-1">
              <label htmlFor="nombre" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Tu nombre</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full bg-white/[0.03] border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="empresa" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Nombre de la empresa</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="empresa"
                  name="empresa"
                  type="text"
                  placeholder="Ej. Distribuidora del Valle"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full bg-white/[0.03] border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-3.5 text-sm font-semibold text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:opacity-95 transition disabled:opacity-70 disabled:cursor-not-allowed group active:scale-95"
            >
              {isLoading ? (
                <span className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Crear mi cuenta
                  <ArrowRight className="w-4 h-4 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <p className="mt-6 text-center text-xs text-zinc-500 leading-relaxed">
            Al hacer clic, aceptas nuestros <a href="#" className="underline hover:text-zinc-300">Términos de Servicio</a> y confirmas que has leído nuestra <a href="#" className="underline hover:text-zinc-300">Política de Privacidad</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
