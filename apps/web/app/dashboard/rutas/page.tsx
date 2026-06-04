import prisma from "@ruteai/database";
import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { RutasMapaClient } from "./RutasMapaClient";

export default async function RutasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const usuarioDB = await prisma.usuario.findUnique({
    where: { id: user.id },
    include: { empresa: true },
  });

  if (!usuarioDB?.empresa) redirect("/login");

  // Cargar pedidos en_ruta de la empresa (paradas activas de hoy)
  const pedidosEnRuta = await prisma.pedido.findMany({
    where: {
      empresaId: usuarioDB.empresa.id,
      estado: { in: ["pendiente", "en_ruta"] },
    },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  // Última ubicación GPS de cada repartidor activo
  const ultimasUbicaciones = await prisma.ubicacion.findMany({
    where: { empresaId: usuarioDB.empresa.id },
    orderBy: { timestamp: "desc" },
    distinct: ["repartidorId"],
    take: 10,
    include: { repartidor: { select: { nombre: true } } },
  });

  return (
    <RutasMapaClient
      empresaId={usuarioDB.empresa.id}
      empresaNombre={usuarioDB.empresa.nombre}
      pedidos={pedidosEnRuta}
      ultimasUbicaciones={ultimasUbicaciones}
    />
  );
}
