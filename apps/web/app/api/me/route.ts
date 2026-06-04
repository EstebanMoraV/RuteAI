import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import prisma from "@ruteai/database";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const usuarioDB = await prisma.usuario.findUnique({
    where: { id: user.id },
    select: { nombre: true, rol: true, empresaId: true },
  });

  const nombre = usuarioDB?.nombre
    ?? (user.user_metadata?.nombre as string | undefined)
    ?? user.email?.split("@")[0]
    ?? "Usuario";

  return NextResponse.json({ nombre, rol: usuarioDB?.rol ?? "encargado" });
}
