"use server";

import prisma from "@ruteai/database";
import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export async function createCompany(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  const nombreEmpresa = formData.get("empresa") as string;
  const nombreUsuario = formData.get("nombre") as string;

  if (!nombreEmpresa || !nombreUsuario) {
    throw new Error("Faltan datos");
  }

  // Verificar si ya existe (por seguridad)
  const existingUser = await prisma.usuario.findUnique({
    where: { id: user.id },
  });

  if (existingUser) {
    redirect("/dashboard");
  }

  // Transacción: Crear Empresa y Usuario
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
