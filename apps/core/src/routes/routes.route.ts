import { Router } from "express";
import type { Request, Response, RequestHandler } from "express";
import { RoutesService } from "../modules/routes/services/routes.service";
import { requireAuth } from "../middlewares/auth.middleware";
import { z } from "zod";

export const routesRouter = Router();

// Todas las rutas de gestión de rutas requieren autenticación
routesRouter.use(requireAuth as RequestHandler);

const CreateRouteSchema = z.object({
  empresaId:    z.string().uuid(),
  repartidorId: z.string().uuid(),
  fecha:        z.coerce.date(),
});

const UpdateEstadoSchema = z.object({
  estado: z.enum(["planificada", "en_curso", "completada", "cancelada"]),
});

// GET /api/v1/routes?empresaId=xxx
routesRouter.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    // Prioriza el empresaId del token; permite override por query para compatibilidad
    const empresaId = (req.query["empresaId"] as string) || req.user?.empresaId;
    if (!empresaId || typeof empresaId !== "string") {
      res.status(400).json({ success: false, error: "empresaId requerido" });
      return;
    }
    const rutas = await RoutesService.listar(empresaId);
    res.json({ success: true, data: rutas, total: rutas.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Error interno" });
  }
});

// GET /api/v1/routes/:id
routesRouter.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const ruta = await RoutesService.obtener(req.params["id"] ?? "");
    res.json({ success: true, data: ruta });
  } catch (error) {
    res.status(404).json({ success: false, error: error instanceof Error ? error.message : "No encontrada" });
  }
});

// POST /api/v1/routes
routesRouter.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = CreateRouteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "Datos inválidos", details: parsed.error.flatten() });
      return;
    }
    const ruta = await RoutesService.crear(parsed.data);
    res.status(201).json({ success: true, data: ruta });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Error interno" });
  }
});

// PATCH /api/v1/routes/:id/estado
routesRouter.patch("/:id/estado", async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = UpdateEstadoSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "Estado inválido" });
      return;
    }
    const ruta = await RoutesService.actualizarEstado(req.params["id"] ?? "", parsed.data.estado);
    res.json({ success: true, data: ruta });
  } catch (error) {
    res.status(400).json({ success: false, error: error instanceof Error ? error.message : "Error" });
  }
});
