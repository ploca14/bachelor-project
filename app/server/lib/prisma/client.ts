import { PrismaClient } from "@prisma/client";
import { prismaTransactional } from "@transactional/prisma";

export type ExtendedPrismaClient = ReturnType<typeof prismaClient>;

// Provider
const prismaClient = () => {
  return new PrismaClient({
    log: ["error", "info", "query", "warn"],
  }).$extends(prismaTransactional);
};

// Injector
export const usePrismaClient = singletonScope(() => {
  return prismaClient();
});

declare global {
  var prisma: undefined | ExtendedPrismaClient;
}

if (import.meta.dev) globalThis.prisma = globalThis.prisma ?? usePrismaClient();
