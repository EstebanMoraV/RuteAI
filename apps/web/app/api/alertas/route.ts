import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { coreUrl as obtenerCoreUrl } from "@/lib/serviceUrls";

async function proxyToCore(req: NextRequest, endpoint: string) {
  const supabase = await createClient();
  const { data: { session }, error: authError } = await supabase.auth.getSession();

  if (authError || !session) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }

  const coreUrl = obtenerCoreUrl();

  const url = new URL(`${coreUrl || 'http://localhost:3003'}${endpoint}`);
  req.nextUrl.searchParams.forEach((val, key) => url.searchParams.append(key, val));

  const headers: Record<string, string> = {
    "Authorization": `Bearer ${session.access_token}`,
  };

  let body = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    headers["Content-Type"] = "application/json";
    body = await req.text();
  }

  try {
    const response = await fetch(url.toString(), {
      method: req.method,
      headers,
      body,
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`[Proxy] Error conectando a ${url.toString()}:`, error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return proxyToCore(req, "/api/v1/alertas");
}

export async function POST(req: NextRequest) {
  return proxyToCore(req, "/api/v1/alertas");
}

export async function PATCH(req: NextRequest) {
  return proxyToCore(req, "/api/v1/alertas");
}
