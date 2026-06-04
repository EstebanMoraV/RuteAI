import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/pedidos/:id/estado → Core PATCH /api/v1/orders/:id/estado
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { session }, error: authError } = await supabase.auth.getSession();

  if (authError || !session) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }

  const coreUrl = process.env.CORE_SERVICE_URL;
  if (!coreUrl && process.env.NODE_ENV === "production") {
    throw new Error("[CONFIG] CORE_SERVICE_URL no está definido");
  }

  const url = `${coreUrl || "http://localhost:3003"}/api/v1/orders/${id}/estado`;

  try {
    const body = await req.text();
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`[Proxy /api/pedidos/:id/estado] Error conectando a ${url}:`, error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}
