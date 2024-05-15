import type { ExtendedPrismaClient } from "~/server/lib/prisma/client";
import { File } from "~/server/domain/file";
import { fileMapper } from "~/server/mappers/fileMapper";
import { NotFoundError } from "~/types/errors";

export interface FileRepository {
  getFileById: (id: string) => Promise<File>;
  exists: (id: string) => Promise<boolean>;
  save: (file: File) => Promise<File>;
  remove: (id: string) => Promise<void>;
}

export const prismaFileRepository = (
  prisma: ExtendedPrismaClient,
): FileRepository => {
  const getFileById = async (id: string) => {
    const result = await prisma.file.findUnique({
      where: { id },
    });

    if (!result) {
      throw new NotFoundError("File not found");
    }

    return fileMapper.toDomain(result);
  };

  const exists = async (id: string) => {
    const result = await prisma.file.findUnique({ where: { id } });

    return result !== null;
  };

  const save = async (file: File) => {
    const rawFile = fileMapper.toPersistence(file);

    await prisma.file.upsert({
      where: { id: file.id },
      create: rawFile,
      update: rawFile,
    });

    return file;
  };

  const remove = async (id: string) => {
    await prisma.file.delete({
      where: {
        id,
      },
    });
  };

  return {
    getFileById,
    exists,
    save,
    remove,
  };
};

/* v8 ignore start */
import { usePrismaClient } from "~/server/lib/prisma/client";

export const useFileRepository = () => {
  const prisma = usePrismaClient();
  return prismaFileRepository(prisma);
};
