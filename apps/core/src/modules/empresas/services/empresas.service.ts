import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const EmpresasService = {
  async listarTodas() {
    return prisma.empresa.findMany({
      include: {
        _count: {
          select: { usuarios: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  },

  async crear(nombre: string, plan: string, email?: string) {
    // Usa el email provisto; si no llega, genera uno a partir del nombre
    const emailStr = email && email.trim().length > 0
      ? email.trim()
      : nombre.toLowerCase().replace(/[^a-z0-9]/g, "") + "@empresa.com";
    return prisma.empresa.create({
      data: {
        nombre,
        email: emailStr,
        plan,
        planActivo: true,
        activa: true,
      }
    });
  },

  async actualizar(id: string, data: { nombre?: string; email?: string; plan?: string }) {
    const empresa = await prisma.empresa.findUnique({ where: { id } });
    if (!empresa) throw new Error("Empresa no encontrada");

    return prisma.empresa.update({
      where: { id },
      data: {
        ...(data.nombre !== undefined ? { nombre: data.nombre } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.plan !== undefined ? { plan: data.plan } : {}),
      }
    });
  },

  async eliminar(id: string) {
    const empresa = await prisma.empresa.findUnique({ where: { id } });
    if (!empresa) throw new Error("Empresa no encontrada");

    return prisma.empresa.delete({ where: { id } });
  },

  async toggleEstado(id: string) {
    const empresa = await prisma.empresa.findUnique({ where: { id } });
    if (!empresa) throw new Error("Empresa no encontrada");

    return prisma.empresa.update({
      where: { id },
      data: { activa: !empresa.activa }
    });
  }
};
