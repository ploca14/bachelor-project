import {
  usePrismaClient,
  type ExtendedPrismaClient,
} from "~/server/lib/prisma/client";
import { File } from "~/server/domain/file";
import { fileMapper } from "~/server/mappers/fileMapper";

export interface FileRepository {
  getFileById: (id: string) => Promise<File>;
  save: (file: File) => Promise<File>;
  remove: (id: string) => Promise<void>;
}

const prismaFileRepository = (prisma: ExtendedPrismaClient): FileRepository => {
  const getFileById = async (id: string) => {
    const result = await prisma.file.findUniqueOrThrow({
      where: { id },
    });

    return fileMapper.toDomain(result);
  };

  const save = async (file: File) => {
    const rawFile = fileMapper.toPersistence(file);

    const result = await prisma.file.upsert({
      where: { id: file.id },
      create: rawFile,
      update: rawFile,
    });

    return fileMapper.toDomain(result);
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
    save,
    remove,
  };
};

export const useFileRepository = () => {
  const prisma = usePrismaClient();
  return prismaFileRepository(prisma);
};
