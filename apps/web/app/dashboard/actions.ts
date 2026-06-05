"use server";

import prisma from "@ruteai/database";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabaseServer";
import { obtenerScoreRiesgo } from "@/lib/aiServiceClient";
import { notificarPedidoEnRuta, notificarPedidoEntregado } from "@/lib/twilioService";
import { geocodificarDireccion } from "@/lib/geocodingService";
import { coreUrl as obtenerCoreUrl } from "@/lib/serviceUrls";

export async function agregarPedidoNuevo(formData: FormData) {
  const cliente  = formData.get("cliente")  as string;
  const direccion = formData.get("direccion") as string;
  const producto  = formData.get("producto")  as string;
  const clienteTelefono = formData.get("clienteTelefono") as string;
  
  if (!cliente || !direccion || !producto) return { error: "Faltan datos" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const usuarioDB = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { empresaId: true }
  });
  if (!usuarioDB?.empresaId) return { error: "Usuario sin empresa asignada" };

  // RF-02: Geocodificar la dirección + RF-03: Score IA — en paralelo para minimizar latencia
  const horaActual = new Date().getHours();
  const [coords] = await Promise.all([
    geocodificarDireccion(direccion),
  ]);

  const lat = coords?.lat ?? -33.45; // Fallback: Santiago centro
  const lng = coords?.lng ?? -70.66;

  const resultadoIA = await obtenerScoreRiesgo({
    pedidoId:         "new",
    lat,              // Ahora usa coordenadas reales de la dirección
    lng,
    hora:             horaActual,
    diasRetraso:      0,
    intentosFallidos: 0,
    zonaRiesgo:       false,
  });

  const scoreParaBD = Math.round(resultadoIA.score * 100);

  await prisma.pedido.create({
    data: {
      nombreCliente: cliente,
      direccion,
      producto,
      clienteTelefono: clienteTelefono || null,
      lat:         coords?.lat ?? null, // Guardar coordenadas reales
      lng:         coords?.lng ?? null,
      scoreRiesgo: scoreParaBD,
      estado:      "pendiente",
      empresaId:   usuarioDB.empresaId,
    }
  });

  revalidatePath("/dashboard/pedidos");
  return { success: true };
}

export async function marcarEnRuta(id: string) {
  if (!id) return;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  const coreUrl = obtenerCoreUrl();

  // Actualizar estado en el Core Service (fuente de verdad)
  const response = await fetch(`${coreUrl}/api/v1/orders/${id}/estado`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ estado: "en_ruta" }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: string };
    return { error: err.error || "Error al actualizar estado" };
  }

  // Obtener datos del pedido para notificación Twilio (RF-06)
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    select: { nombreCliente: true, clienteTelefono: true, direccion: true },
  });

  if (pedido?.clienteTelefono) {
    void notificarPedidoEnRuta({
      pedidoId:  id,
      telefono:  pedido.clienteTelefono,
      cliente:   pedido.nombreCliente,
      direccion: pedido.direccion,
    });
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function marcarComoEntregado(id: string) {
  if (!id) return;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  const coreUrl = obtenerCoreUrl();

  // Actualizar estado en el Core Service (fuente de verdad)
  const response = await fetch(`${coreUrl}/api/v1/orders/${id}/estado`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ estado: "entregado" }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: string };
    return { error: err.error || "Error al actualizar estado" };
  }

  // Obtener datos del pedido para notificación Twilio (RF-06)
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    select: { nombreCliente: true, clienteTelefono: true, direccion: true },
  });

  if (pedido?.clienteTelefono) {
    void notificarPedidoEntregado({
      pedidoId:  id,
      telefono:  pedido.clienteTelefono,
      cliente:   pedido.nombreCliente,
      direccion: pedido.direccion,
    });
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function eliminarPedido(id: string) {
  if (!id) return;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: "No autenticado" };

  const coreUrl = obtenerCoreUrl();

  const response = await fetch(`${coreUrl}/api/v1/orders/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${session.access_token}` },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: string };
    return { error: err.error || "Error al eliminar pedido" };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function editarPedido(formData: FormData) {
  const id              = formData.get("pedidoId")        as string;
  const cliente         = formData.get("cliente")         as string;
  const direccion       = formData.get("direccion")       as string;
  const producto        = formData.get("producto")        as string;
  const clienteTelefono = formData.get("clienteTelefono") as string;

  if (!id || !cliente || !direccion || !producto) return { error: "Faltan datos para editar" };

  // RF-02: Re-geocodificar si cambia la dirección
  const coords = await geocodificarDireccion(direccion);

  await prisma.pedido.update({
    where: { id },
    data: {
      nombreCliente: cliente,
      direccion,
      producto,
      clienteTelefono: clienteTelefono || null,
      lat: coords?.lat ?? undefined,
      lng: coords?.lng ?? undefined,
    }
  });

  revalidatePath("/dashboard");
  return { success: true };
}

// NUEVA FUNCIÓN PARA EL ONBOARDING
export async function crearEmpresaYUsuario(formData: FormData) {
  const nombreEmpresa = formData.get("nombreEmpresa") as string;
  const userId = formData.get("userId") as string;
  const userEmail = formData.get("userEmail") as string;

  if (!nombreEmpresa || !userId || !userEmail) {
    throw new Error("Faltan datos vitales");
  }

  // Creamos la Empresa y a ti (el Usuario Administrador) de un solo golpe (Transacción)
  await prisma.empresa.create({
    data: {
      nombre: nombreEmpresa,
      email: userEmail,
      usuarios: {
        create: {
          id: userId,
          nombre: "Administrador Principal",
          email: userEmail,
          rol: "encargado"
        }
      }
    }
  });

  revalidatePath("/dashboard");
}

export async function asignarRepartidor(pedidoId: string, repartidorId: string | null) {
  if (!pedidoId) return { error: "ID de pedido requerido" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const usuarioDB = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { empresaId: true },
  });
  if (!usuarioDB?.empresaId) return { error: "Usuario sin empresa" };

  // Validar que el pedido pertenece a la empresa del usuario
  const pedido = await prisma.pedido.findFirst({
    where: { id: pedidoId, empresaId: usuarioDB.empresaId },
    select: { id: true },
  });
  if (!pedido) return { error: "Pedido no encontrado" };

  // Validar que el repartidor pertenece a la misma empresa (si se asigna uno)
  if (repartidorId) {
    const rep = await prisma.usuario.findFirst({
      where: { id: repartidorId, empresaId: usuarioDB.empresaId, rol: "repartidor" },
      select: { id: true },
    });
    if (!rep) return { error: "Repartidor no válido" };
  }

  await prisma.pedido.update({
    where: { id: pedidoId },
    data: { repartidorId: repartidorId ?? null },
  });

  revalidatePath("/dashboard/pedidos");
  return { success: true };
}

export async function obtenerUbicacionRepartidorPublico(pedidoId: string) {
  if (!pedidoId) return { error: "ID de pedido no provisto" };

  // Buscar el pedido y su repartidor
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    select: {
      estado: true,
      repartidorId: true,
      lat: true,
      lng: true,
    }
  });

  if (!pedido) {
    return { error: "Pedido no encontrado" };
  }

  // Solo exponer si el estado es "en_ruta"
  if (pedido.estado !== "en_ruta") {
    return { error: "El pedido no está en ruta" };
  }

  if (!pedido.repartidorId) {
    return { error: "No hay repartidor asignado a este pedido" };
  }

  // Buscar la última ubicación conocida del repartidor
  const ultimaUbicacion = await prisma.ubicacion.findFirst({
    where: { repartidorId: pedido.repartidorId },
    orderBy: { timestamp: "desc" },
    select: {
      lat: true,
      lng: true,
    }
  });

  return {
    success: true,
    lat: ultimaUbicacion?.lat ?? null,
    lng: ultimaUbicacion?.lng ?? null,
    pedidoLat: pedido.lat,
    pedidoLng: pedido.lng,
  };
}

export async function actualizarEmpresa(nombre: string, email: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const usuarioDB = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { empresaId: true }
  });
  if (!usuarioDB?.empresaId) return { error: "Usuario sin empresa" };

  await prisma.empresa.update({
    where: { id: usuarioDB.empresaId },
    data: { nombre, email }
  });

  revalidatePath("/dashboard/configuracion");
  return { success: true };
}

export async function actualizarPerfil(nombre: string, telefono: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  await prisma.usuario.update({
    where: { id: user.id },
    data: { nombre, telefono }
  });

  revalidatePath("/dashboard/configuracion");
  return { success: true };
}

// ──────────────────────────────────────────────────────────────
// Guardar configuración extendida de la empresa (RUT, país, etc.)
// ──────────────────────────────────────────────────────────────
export async function actualizarConfiguracionEmpresa(data: {
  nombre: string;
  email: string;
  rut: string;
  pais: string;
  zonaHoraria: string;
  direccion: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const usuarioDB = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { empresaId: true, empresa: { select: { configuracion: true } } }
  });
  if (!usuarioDB?.empresaId) return { error: "Usuario sin empresa" };

  // Merge con la configuración existente para no perder otros campos
  const configActual = (usuarioDB.empresa?.configuracion as Record<string, unknown>) ?? {};

  await prisma.empresa.update({
    where: { id: usuarioDB.empresaId },
    data: {
      nombre: data.nombre,
      email: data.email,
      configuracion: {
        ...configActual,
        rut: data.rut,
        pais: data.pais,
        zonaHoraria: data.zonaHoraria,
        direccion: data.direccion,
      }
    }
  });

  revalidatePath("/dashboard/configuracion");
  return { success: true };
}

// ──────────────────────────────────────────────────────────────
// Guardar preferencias de Notificaciones en el campo JSON
// ──────────────────────────────────────────────────────────────
export async function actualizarConfiguracionNotificaciones(data: {
  notifFallo: boolean;
  notifRiesgo: boolean;
  notifDesconexion: boolean;
  notifDiario: boolean;
  notifSemanal: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const usuarioDB = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { empresaId: true, empresa: { select: { configuracion: true } } }
  });
  if (!usuarioDB?.empresaId) return { error: "Usuario sin empresa" };

  const configActual = (usuarioDB.empresa?.configuracion as Record<string, unknown>) ?? {};

  await prisma.empresa.update({
    where: { id: usuarioDB.empresaId },
    data: {
      configuracion: {
        ...configActual,
        notificaciones: data,
      }
    }
  });

  revalidatePath("/dashboard/configuracion");
  return { success: true };
}

// ──────────────────────────────────────────────────────────────
// Guardar ajustes de IA & Optimización en el campo JSON
// ──────────────────────────────────────────────────────────────
export async function actualizarConfiguracionIA(data: {
  agresividad: number;
  modeloActivo: string;
  recalcularTiempo: string;
  prediccionFallo: boolean;
  reasignacionAuto: boolean;
  validacionDireccion: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const usuarioDB = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { empresaId: true, empresa: { select: { configuracion: true } } }
  });
  if (!usuarioDB?.empresaId) return { error: "Usuario sin empresa" };

  const configActual = (usuarioDB.empresa?.configuracion as Record<string, unknown>) ?? {};

  await prisma.empresa.update({
    where: { id: usuarioDB.empresaId },
    data: {
      configuracion: {
        ...configActual,
        ia: data,
      }
    }
  });

  revalidatePath("/dashboard/configuracion");
  return { success: true };
}
