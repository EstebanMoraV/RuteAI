import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import prisma from "@ruteai/database";
import { crearEmpresaDesdeMetadata } from "./actions";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Si el usuario ya está registrado en la DB, no hay nada que configurar
  const existente = await prisma.usuario.findUnique({ where: { id: user.id } });
  if (existente) redirect("/dashboard");

  // Intentar crear la empresa automáticamente con los datos ingresados en el
  // registro (guardados en user_metadata). Así no se piden por segunda vez.
  const { creada } = await crearEmpresaDesdeMetadata();
  if (creada) redirect("/dashboard");

  // Fallback: si faltan datos en metadata (ej. registro por Google), mostrar
  // el formulario pre-llenado con lo que haya disponible.
  const meta = user.user_metadata ?? {};
  const defaultNombre =
    typeof meta.nombre === "string" ? meta.nombre : user.email?.split("@")[0] ?? "";
  const defaultEmpresa = typeof meta.empresa === "string" ? meta.empresa : "";

  return <OnboardingForm defaultNombre={defaultNombre} defaultEmpresa={defaultEmpresa} />;
}
