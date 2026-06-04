import { Router } from "express";
import type { Request, Response, RequestHandler } from "express";
import { EmpresasService } from "../modules/empresas/services/empresas.service";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { z } from "zod";

export const empresasRouter = Router();

// Todas estas rutas requieren ser Super Admin
empresasRouter.use(requireAuth as RequestHandler);
empresasRouter.use(requireRole(["super_admin"]) as RequestHandler);

const CreateEmpresaSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email().optional(),
  plan: z.enum(["starter", "pro", "business"]).default("pro"),
});

const UpdateEmpresaSchema = z.object({
  nombre: z.string().min(1).optional(),
  email: z.string().email().optional(),
  plan: z.enum(["starter", "pro", "business"]).optional(),
});

// GET /api/v1/empresas
empresasRouter.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const empresas = await EmpresasService.listarTodas();
    // Mapear el output para que coincida con lo que espera el frontend (conteo de usuarios)
    const data = empresas.map((e) => ({
      ...e,
      usuarios: e._count.usuarios,
    }));
    res.json({ success: true, data, total: data.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Error interno" });
  }
});

// POST /api/v1/empresas
empresasRouter.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = CreateEmpresaSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "Datos inválidos" });
      return;
    }
    const empresa = await EmpresasService.crear(parsed.data.nombre, parsed.data.plan, parsed.data.email);
    res.status(201).json({ success: true, data: { ...empresa, usuarios: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Error interno" });
  }
});

// PATCH /api/v1/empresas/:id — editar nombre/email/plan
empresasRouter.patch("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = UpdateEmpresaSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "Datos inválidos", details: parsed.error.flatten() });
      return;
    }
    const empresa = await EmpresasService.actualizar(req.params.id, parsed.data);
    res.json({ success: true, data: empresa });
  } catch (error) {
    res.status(400).json({ success: false, error: error instanceof Error ? error.message : "Error al actualizar" });
  }
});

// PATCH /api/v1/empresas/:id/toggle
empresasRouter.patch("/:id/toggle", async (req: Request, res: Response): Promise<void> => {
  try {
    const empresa = await EmpresasService.toggleEstado(req.params.id);
    res.json({ success: true, data: empresa });
  } catch (error) {
    res.status(400).json({ success: false, error: error instanceof Error ? error.message : "Error al actualizar" });
  }
});

// DELETE /api/v1/empresas/:id
empresasRouter.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    await EmpresasService.eliminar(req.params.id);
    res.json({ success: true, message: "Empresa eliminada" });
  } catch (error) {
    res.status(400).json({ success: false, error: error instanceof Error ? error.message : "Error al eliminar" });
  }
});
