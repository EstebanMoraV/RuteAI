import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabaseServer";

const PuntoSchema = z.object({
  id:  z.string(),
  lat: z.number(),
  lng: z.number(),
});

const OptimizeSchema = z.object({
  origen: PuntoSchema,
  puntos: z.array(PuntoSchema).min(1).max(20),
});

// BFF: apps/web actúa como intermediario entre el cliente y el AI microservice
// POST /api/ai/optimize → AI Service POST /api/optimize
export async function POST(req: NextRequest) {
  try {
    // Solo usuarios autenticados pueden optimizar rutas
    const supabase = await createClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = OptimizeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL ?? "https://ruteai-ai-service.vercel.app";
    const aiSecret = process.env.AI_SERVICE_SECRET ?? "";

    const response = await fetch(`${aiServiceUrl}/api/optimize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": aiSecret,
      },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`AI Service respondió con status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[BFF /api/ai/optimize] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al conectar con el servicio de IA" },
      { status: 503 }
    );
  }
}
