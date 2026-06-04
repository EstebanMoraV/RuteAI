import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

async function proxyToCore(req: NextRequest, endpoint: string) {
  const supabase = await createClient();
  const { data: { session }, error: authError } = await supabase.auth.getSession();

  if (authError || !session) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }

  const coreUrl = process.env.CORE_SERVICE_URL;
  if (!coreUrl && process.env.NODE_ENV === "production") {
    throw new Error("[CONFIG] CORE_SERVICE_URL no está definido");
  }

  const url = `${coreUrl || "http://localhost:3003"}${endpoint}`;

  const headers: Record<string, string> = {
    "Authorization": `Bearer ${session.access_token}`,
  };

  let body = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    headers["Content-Type"] = "application/json";
    body = await req.text();
  }

  try {
    const response = await fetch(url, { method: req.method, headers, body });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`[Proxy /api/pedidos/:id] Error conectando a ${url}:`, error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

type Params = { params: Promise<{ id: string }> };

// GET /api/pedidos/:id → Core GET /api/v1/orders/:id
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyToCore(req, `/api/v1/orders/${id}`);
}

// DELETE /api/pedidos/:id → Core DELETE /api/v1/orders/:id
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyToCore(req, `/api/v1/orders/${id}`);
}
