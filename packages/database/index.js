"use strict";
// Runtime JavaScript shim para @ruteai/database.
// Usado por el Core service (Express/Node.js puro) en Vercel,
// donde no hay bundler de TypeScript.
// El Web (Next.js) sigue usando src/index.ts via exports.types.

const { PrismaClient } = require("@prisma/client");

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

module.exports = prisma;
module.exports.prisma = prisma;
module.exports.default = prisma;

// Re-exportar Prisma namespace para quienes lo usan como named import
const { Prisma } = require("@prisma/client");
module.exports.Prisma = Prisma;
