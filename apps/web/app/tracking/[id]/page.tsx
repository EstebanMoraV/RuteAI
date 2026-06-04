export const dynamic = "force-dynamic";

import prisma from "@ruteai/database";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import TrackingClient from "./TrackingClient";

export default async function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  if (!id) redirect("/404");

  // Buscar el pedido (Al ser público, no verificamos usuario, es una URL "secreta")
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: {
      empresa: {
        select: { nombre: true } // Ocultar datos privados, solo enviar el nombre.
      }
    }
  });

  if (!pedido) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-6 text-white font-sans text-center">
         <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
         <h1 className="text-2xl font-bold mb-2">Pedido no encontrado</h1>
         <p className="text-zinc-500">El link que ingresaste no es válido o ha expirado.</p>
      </div>
    );
  }

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "";

  return <TrackingClient pedido={pedido} apiKey={apiKey} />;
}
