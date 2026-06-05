"use server";

import prisma from "@ruteai/database";
import { createClient } from "@/lib/supabaseServer";

// Crea Empresa + Usuario en una transacción. Idempotente: si el usuario ya
// existe no hace nada. No incluye redirect para poder llamarse desde el
// server component de onboarding sin romper el flujo.
async function crearEmpresaYUsuario(nombreUsuario: string, nombreEmpresa: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const existingUser = await prisma.usuario.findUnique({ where: { id: user.id } });
  if (existingUser) return { success: true };

  await prisma.$transaction(async (tx) => {
    const nuevaEmpresa = await tx.empresa.create({
      data: {
        nombre: nombreEmpresa,
        email: user.email || `company_${user.id}@ruteai.app`,
        plan: "starter",
        planActivo: true,
      },
    });

    await tx.usuario.create({
      data: {
        id: user.id,
        nombre: nombreUsuario,
        email: user.email || `user_${user.id}@ruteai.app`,
        rol: "encargado",
        empresaId: nuevaEmpresa.id,
      },
    });
  });

  return { success: true };
}

// Usada por el formulario de onboarding (fallback).
export async function createCompany(formData: FormData) {
  const nombreEmpresa = formData.get("empresa") as string;
  const nombreUsuario = formData.get("nombre") as string;

  if (!nombreEmpresa || !nombreUsuario) {
    throw new Error("Faltan datos");
  }

  return crearEmpresaYUsuario(nombreUsuario, nombreEmpresa);
}

// Usada por el server component de onboarding: crea automáticamente la empresa
// con los datos que el usuario ingresó en el registro (user_metadata), evitando
// pedirlos por segunda vez. Devuelve { creada: false } si faltan datos.
export async function crearEmpresaDesdeMetadata(): Promise<{ creada: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { creada: false };

  const meta = user.user_metadata ?? {};
  const nombre = typeof meta.nombre === "string" ? meta.nombre.trim() : "";
  const empresa = typeof meta.empresa === "string" ? meta.empresa.trim() : "";

  if (!nombre || !empresa) return { creada: false };

  await crearEmpresaYUsuario(nombre, empresa);
  return { creada: true };
}
