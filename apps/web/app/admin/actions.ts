"use server";

import prisma from "@ruteai/database";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabaseServer";

// Helper: obtiene el token de la sesión actual y arma la llamada al Core service.
// Las empresas se gestionan vía el Core (fuente de verdad); el Core valida super_admin.
async function coreFetch(endpoint: string, init: RequestInit) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No autenticado");

  const coreUrl = process.env.CORE_SERVICE_URL || "http://localhost:3003";
  const response = await fetch(`${coreUrl}${endpoint}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.error ?? "Error en el servicio Core");
  }
  return data;
}

export async function crearEmpresa(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const plan   = formData.get("plan")   as string;
  const email  = formData.get("email")  as string;
  if (!nombre || !email) throw new Error("Nombre y email son requeridos");

  await coreFetch("/api/v1/empresas", {
    method: "POST",
    body: JSON.stringify({ nombre, email, plan: plan || "pro" }),
  });
  revalidatePath("/admin");
}

export async function editarEmpresa(formData: FormData) {
  const id     = formData.get("id")     as string;
  const nombre = formData.get("nombre") as string;
  const plan   = formData.get("plan")   as string;
  const email  = formData.get("email")  as string;
  if (!id) throw new Error("ID requerido");

  await coreFetch(`/api/v1/empresas/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ nombre, email, plan }),
  });
  revalidatePath("/admin");
}

export async function toggleEmpresaEstado(id: string, _activa: boolean) {
  // El Core lee el estado actual y lo invierte; no necesita el valor previo
  await coreFetch(`/api/v1/empresas/${id}/toggle`, { method: "PATCH" });
  revalidatePath("/admin");
}

export async function eliminarEmpresa(id: string) {
  await coreFetch(`/api/v1/empresas/${id}`, { method: "DELETE" });
  revalidatePath("/admin");
}

// ──────────────────────────────────────────────────────────────
// PENDIENTE (C-4 fase 2): gestión de usuarios.
// Decisión acordada: estas operaciones se moverán al Core, y el borrado
// deberá eliminar TAMBIÉN de Supabase Auth (admin.deleteUser con
// SUPABASE_SERVICE_ROLE_KEY). Hoy solo tocan Prisma → el usuario borrado
// queda huérfano en Supabase Auth y podría seguir iniciando sesión.
// Mantener Prisma directo por ahora hasta implementar esa fase.
// ──────────────────────────────────────────────────────────────
export async function cambiarRolUsuario(id: string, nuevoRol: string) {
  await prisma.usuario.update({
    where: { id },
    data: { rol: nuevoRol },
  });
  revalidatePath("/admin/usuarios");
}

export async function eliminarUsuario(id: string) {
  await prisma.usuario.delete({ where: { id } });
  revalidatePath("/admin/usuarios");
}
