"use client";

import Link from "next/link";
import { Route, ArrowRight, Sparkles, Fuel, Clock, Zap, Check, Github, Twitter, Linkedin, Building2, Radio, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-amber-500/30">
      
      {/* Patrones globales */}
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

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 relative grid place-items-center rounded-lg bg-gradient-to-br from-amber-500 to-purple-600 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Route className="h-1/2 w-1/2 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              Route<span className="text-gradient-ai">AI</span>
            </span>
          </div>
          
          <nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
            <a href="#features" className="hover:text-white transition">Producto</a>
            <a href="#how" className="hover:text-white transition">Cómo funciona</a>
            <a href="#pricing" className="hover:text-white transition">Precios</a>
            <a href="#" className="hover:text-white transition">Docs</a>
            <a href="#" className="hover:text-white transition">Clientes</a>
          </nav>
          
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition sm:inline-flex">
              Iniciar sesión
            </Link>
            <Link href="/login" className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-zinc-200 transition">
              Empezar gratis <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] overflow-hidden bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        
        <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-20 lg:grid-cols-[1.1fr_1fr] lg:pt-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-white/5 px-3 py-1 text-xs text-zinc-400">
              <Sparkles className="h-3 w-3 text-purple-400" />
              Nuevo · Predicción de fallo de entrega con GPT-Logistics v2
              <ArrowRight className="h-3 w-3" />
            </div>
            
            <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl text-white">
              Última milla,<br />
              <span className="text-gradient-ai">optimizada por IA.</span>
            </h1>
            
            <p className="mt-6 max-w-xl text-lg text-zinc-400">
              RouteAI calcula la ruta perfecta para cada repartidor en segundos. Reduce hasta <span className="font-semibold text-white">38% el gasto en combustible</span> y recupera <span className="font-semibold text-white">2.4 horas diarias</span> por equipo.
            </p>
            
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-3 text-sm font-semibold text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:opacity-95 transition">
                Comenzar gratis <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-white/5 px-5 py-3 text-sm font-medium hover:bg-white/10 transition">
                Iniciar sesión
              </Link>
            </div>
            
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-zinc-800 pt-6">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                  <Fuel className="h-3.5 w-3.5" /> Combustible
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums text-white">−38%</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                  <Clock className="h-3.5 w-3.5" /> Ahorro / día
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums text-white">2.4 h</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                  <Zap className="h-3.5 w-3.5" /> Entregas a tiempo
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums text-white">98.6%</div>
              </div>
            </div>
          </div>

          {/* Right Map Visual (SVG Graphic exact equivalent) */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 aspect-[4/3] lg:aspect-[5/6] w-full">
              <div className="absolute inset-0 bg-grid opacity-60" />
              <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
              <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
              
              {/* Fake Graph Lines */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-30">
                <path d="M0,82 L100,82" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
                <path d="M0,46 L100,46" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
                <path d="M22,0 L22,100" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
                <path d="M58,0 L58,100" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
                <path d="M84,0 L84,100" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
              </svg>

              <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
                <defs>
                  <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                  <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path d="M12,78 C20,68 22,62 26,58 S36,72 40,70 S52,48 55,44 S64,58 68,60 S78,38 82,32 S88,22 90,18" fill="none" stroke="url(#routeGrad)" strokeWidth="0.8" filter="url(#glow)" opacity="0.9" />
                <path d="M12,78 C20,68 22,62 26,58 S36,72 40,70 S52,48 55,44 S64,58 68,60 S78,38 82,32 S88,22 90,18" fill="none" stroke="url(#routeGrad)" strokeWidth="0.45" strokeDasharray="1.5 1.2" />
                <circle r="1.1" fill="#f59e0b">
                  <animateMotion dur="6s" repeatCount="indefinite" path="M12,78 C20,68 22,62 26,58 S36,72 40,70 S52,48 55,44 S64,58 68,60 S78,38 82,32 S88,22 90,18" />
                </circle>
              </svg>

              {/* Point Markers */}
              {[
                { left: "12%", top: "78%", name: "Depósito", color: "bg-amber-500", ring: "ring-amber-500/30" },
                { left: "26%", top: "58%", name: "Castillo", color: "bg-purple-500", ring: "ring-purple-500/30" },
                { left: "40%", top: "70%", name: "Quintero", color: "bg-white", ring: "ring-white/20" },
                { left: "55%", top: "44%", name: "Hernández", color: "bg-white", ring: "ring-white/20" },
                { left: "68%", top: "60%", name: "Mendoza", color: "bg-white", ring: "ring-white/20" },
                { left: "82%", top: "32%", name: "Ortiz", color: "bg-white", ring: "ring-white/20" },
                { left: "90%", top: "18%", name: "Vega", color: "bg-white", ring: "ring-white/20" },
              ].map((pt, i) => (
                <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: pt.left, top: pt.top }}>
                  <div className={`relative h-3 w-3 rounded-full ring-2 ${pt.color} ${pt.ring}`}>
                    <span className={`absolute inset-0 rounded-full animate-ping opacity-60 ${pt.color}`} />
                  </div>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-950/80 px-1.5 py-0.5 text-[10px] font-medium text-white ring-1 ring-white/10 backdrop-blur">
                    {pt.name}
                  </div>
                </div>
              ))}

              {/* Sugerencia Overlay */}
              <div className="absolute -bottom-6 -left-6 hidden w-64 rounded-xl border border-zinc-700 bg-zinc-900/80 backdrop-blur-xl p-4 sm:block z-10 shadow-2xl">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  Sugerencia IA
                </div>
                <div className="mt-2 text-sm font-medium">
                  Re-secuenciar paradas 4 → 6 ahorra <span className="text-amber-400">14 min</span> y <span className="text-amber-400">1.2 L</span>.
                </div>
                <button className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-purple-400 hover:underline">
                  Aplicar cambio <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Riesgo Overlay */}
              <div className="absolute -right-4 top-8 hidden w-56 rounded-xl border border-zinc-700 bg-zinc-900/80 backdrop-blur-xl p-3 lg:block z-10 shadow-2xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Riesgo IA — RA-10245</span>
                  <span className="rounded bg-red-500/20 px-1.5 py-0.5 font-mono font-semibold text-red-400">84%</span>
                </div>
                <div className="mt-2 text-xs text-zinc-400">
                  Cliente con 3 entregas fallidas previas. Recomendamos confirmar por WhatsApp.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-zinc-800 bg-white/5 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center text-xs uppercase tracking-widest text-zinc-500">Operaciones logísticas que confían en RouteAI</div>
          <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-center text-sm font-medium text-zinc-500/70 md:grid-cols-6">
            <div className="truncate">Mercado Andino</div>
            <div className="truncate">Farmacias Pacífico</div>
            <div className="truncate">Sushi Express</div>
            <div className="truncate">Cervecería Tropical</div>
            <div className="truncate">Petfood Andes</div>
            <div className="truncate">Floristería Camelia</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-medium uppercase tracking-widest text-purple-400">Producto</span>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl text-white">
              Todo lo que tu operación necesita,<br />
              <span className="text-zinc-500">sin pegar 4 herramientas.</span>
            </h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {[
              {
                badge: "IA",
                icon: Sparkles,
                title: "Optimización de rutas",
                desc: "Algoritmos genéticos + modelos de tráfico en tiempo real recalculan tu flota en menos de 800 ms."
              },
              {
                badge: "Live",
                icon: Radio,
                title: "Monitoreo GPS en vivo",
                desc: "Cada repartidor reporta cada 5 segundos. Geocercas, paradas no autorizadas y tiempos de detención."
              },
              {
                badge: "Predictivo",
                icon: Shield,
                title: "Score de riesgo de entrega",
                desc: "Asignamos un porcentaje de fallo a cada pedido usando historial del cliente, dirección y meteorología."
              },
              {
                badge: "Multi-tenant",
                icon: Building2,
                title: "Arquitectura SaaS",
                desc: "Aislamiento por empresa, permisos granulares, SSO y APIs REST/Webhooks listas para escalar."
              }
            ].map((f, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition hover:border-zinc-700 hover:bg-zinc-800/40">
                <div className="absolute right-6 top-6 rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-400 ring-1 ring-inset ring-purple-500/30">{f.badge}</div>
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-amber-500/20 to-purple-500/20 ring-1 ring-inset ring-white/10">
                  <f.icon className="h-5 w-5 text-amber-400" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="how" className="border-t border-zinc-800 bg-zinc-900/20 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between gap-6">
            <div className="max-w-xl">
              <span className="text-xs font-medium uppercase tracking-widest text-amber-400">Cómo funciona</span>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl text-white">De pedidos a la puerta del cliente.</h2>
            </div>
            <div className="hidden text-sm text-zinc-400 sm:block">Implementación promedio: 48 h</div>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              { num: "01", title: "Carga tus pedidos", desc: "CSV, API o integración directa con tu e-commerce. Detectamos direcciones malformadas con IA." },
              { num: "02", title: "La IA arma la ruta", desc: "Considera tráfico, capacidad del vehículo, ventanas horarias y prioridad del cliente." },
              { num: "03", title: "Reparte y mide", desc: "El repartidor abre la ruta en su PWA. Tú ves todo en vivo y obtienes reportes accionables." }
            ].map((step, i) => (
              <div key={i} className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-7">
                <div className="font-mono text-xs text-zinc-500">{step.num}</div>
                <div className="mt-4 text-xl font-semibold text-white">{step.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.desc}</p>
                {i < 2 && <div className="absolute -right-2 top-1/2 hidden h-px w-4 bg-gradient-to-r from-amber-500 to-purple-500 md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-medium uppercase tracking-widest text-purple-400">Precios</span>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl text-white">Empieza gratis. Escala sin sorpresas.</h2>
            <p className="mt-4 text-zinc-400">Sin costos por kilómetro. Sin contratos anuales obligatorios.</p>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            
            <div className="relative rounded-2xl border p-7 border-zinc-800 bg-zinc-900/20">
              <h3 className="text-lg font-semibold text-white">Starter</h3>
              <div className="mt-4 flex items-baseline gap-1"><span className="text-5xl font-semibold tracking-tight text-white">$29</span><span className="text-sm text-zinc-400">/mes</span></div>
              <p className="mt-2 text-sm text-zinc-400">Para tiendas y restaurantes dando sus primeros envíos.</p>
              <button className="mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition bg-zinc-800 text-white hover:bg-zinc-700">Empezar</button>
              <ul className="mt-6 space-y-2.5 border-t border-zinc-800 pt-6 text-sm">
                {["Hasta 1,000 entregas/mes", "5 repartidores", "Optimización de rutas básica", "Soporte por email"].map(f => (
                  <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /><span className="text-zinc-400">{f}</span></li>
                ))}
              </ul>
            </div>

            <div className="relative rounded-2xl border p-7 border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-purple-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-purple-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Más popular</div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Pro</h3>
                <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-purple-300">IA incluida</span>
              </div>
              <div className="mt-4 flex items-baseline gap-1"><span className="text-5xl font-semibold tracking-tight text-white">$99</span><span className="text-sm text-zinc-400">/mes</span></div>
              <p className="mt-2 text-sm text-zinc-400">Para operaciones en crecimiento que viven en la calle.</p>
              <button className="mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition bg-gradient-to-r from-amber-500 to-amber-400 text-black hover:opacity-95">Solicitar demo</button>
              <ul className="mt-6 space-y-2.5 border-t border-zinc-800/50 pt-6 text-sm">
                {["Hasta 10,000 entregas/mes", "50 repartidores", "Score de riesgo IA", "Webhooks + API REST", "Soporte prioritario"].map(f => (
                  <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /><span className="text-zinc-400">{f}</span></li>
                ))}
              </ul>
            </div>

            <div className="relative rounded-2xl border p-7 border-zinc-800 bg-zinc-900/20">
              <h3 className="text-lg font-semibold text-white">Business</h3>
              <div className="mt-4 flex items-baseline gap-1"><span className="text-4xl font-semibold tracking-tight text-white">A medida</span></div>
              <p className="mt-2 text-sm text-zinc-400">Multi-país, SLA y modelo de IA dedicado a tu vertical.</p>
              <button className="mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition bg-zinc-800 text-white hover:bg-zinc-700">Hablar con ventas</button>
              <ul className="mt-6 space-y-2.5 border-t border-zinc-800 pt-6 text-sm">
                {["Entregas ilimitadas", "Repartidores ilimitados", "Modelo IA fine-tuned", "SSO + SOC 2", "Customer Success dedicado"].map(f => (
                  <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /><span className="text-zinc-400">{f}</span></li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-6 pb-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-white/5 to-white/[0.01] p-12 text-center">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
          <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl text-white">¿Listo para devolverle horas a tu equipo?</h3>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">Empieza hoy. Sin contratos largos, sin sorpresas.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-3 text-sm font-semibold text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              Empezar ahora <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/repartidor" className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-white/5 px-5 py-3 text-sm font-medium hover:bg-white/10 text-white">
              Ver app del repartidor
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-10 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 relative grid place-items-center rounded-lg bg-gradient-to-br from-amber-500 to-purple-600">
                  <Route className="h-1/2 w-1/2 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-lg font-semibold tracking-tight text-white">Route<span className="text-gradient-ai">AI</span></span>
              </div>
              <p className="mt-4 max-w-xs text-sm text-zinc-500">La plataforma de optimización logística que crece con tu operación de última milla en LATAM.</p>
              <div className="mt-5 flex gap-2">
                <a href="#" className="grid h-8 w-8 place-items-center rounded-md border border-zinc-800 text-zinc-500 hover:text-white transition"><Github className="h-4 w-4" /></a>
                <a href="#" className="grid h-8 w-8 place-items-center rounded-md border border-zinc-800 text-zinc-500 hover:text-white transition"><Twitter className="h-4 w-4" /></a>
                <a href="#" className="grid h-8 w-8 place-items-center rounded-md border border-zinc-800 text-zinc-500 hover:text-white transition"><Linkedin className="h-4 w-4" /></a>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Producto</div>
              <ul className="mt-4 space-y-2.5 text-sm text-zinc-500">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Precios</a></li>
                <li><a href="#" className="hover:text-white">Cambios</a></li>
                <li><a href="#" className="hover:text-white">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Empresa</div>
              <ul className="mt-4 space-y-2.5 text-sm text-zinc-500">
                <li><a href="#" className="hover:text-white">Clientes</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carreras</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Legal</div>
              <ul className="mt-4 space-y-2.5 text-sm text-zinc-500">
                <li><a href="#" className="hover:text-white">Privacidad</a></li>
                <li><a href="#" className="hover:text-white">Términos</a></li>
                <li><a href="#" className="hover:text-white">DPA</a></li>
                <li><a href="#" className="hover:text-white">SOC 2</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800 pt-6 text-xs text-zinc-500">
            <div>© 2026 RouteAI Labs S.A.S. — Bogotá · CDMX · Buenos Aires</div>
            <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Todos los sistemas operativos</div>
          </div>
        </div>
      </footer>

    </div>
  );
}
