import {
  usePrismaClient,
  type ExtendedPrismaClient,
} from "~/server/lib/prisma/client";
import { Collection } from "~/server/domain/collection";
import { collectionMapper } from "~/server/mappers/collectionMapper";
import { transactional } from "~/server/utils/transactional";
import type { Prisma } from "@prisma/client";
import { NotFoundError } from "~/types/errors";

export interface CollectionRepository {
  getCollectionById: (id: string) => Promise<Collection>;
  exists: (id: string) => Promise<boolean>;
  save: (collection: Collection) => Promise<Collection>;
  remove: (id: string) => Promise<void>;
}

const prismaCollectionRepository = (
  prisma: ExtendedPrismaClient,
): CollectionRepository => {
  const BASE_QUERY_OPTIONS = {
    include: {
      files: true,
    },
  } satisfies Prisma.CollectionDefaultArgs;

  const getCollectionById = async (id: string) => {
    const result = await prisma.collection.findUnique({
      where: { id },
      ...BASE_QUERY_OPTIONS,
    });

    if (!result) {
      throw new NotFoundError("Collection not found");
    }

    return collectionMapper.toDomain(result);
  };

  const exists = async (id: string) => {
    const result = await prisma.collection.findUnique({ where: { id } });

    return result !== null;
  };

  const setCollectionFiles = transactional(
    async (collectionId: string, fileIds: string[]) => {
      // Disassociate all files from the collection
      await prisma.collectionFile.deleteMany({
        where: {
          collectionId,
        },
      });

      // Associate the new files to the collection
      await prisma.collectionFile.createMany({
        data: fileIds.map((fileId) => ({
          fileId,
          collectionId,
        })),
      });
    },
  );

  const save = transactional(async (collection: Collection) => {
    const rawCollection = collectionMapper.toPersistence(collection);

    // If the collection already exists, update it. Otherwise, create it.
    const result = await prisma.collection.upsert({
      where: { id: collection.id },
      create: rawCollection,
      update: rawCollection,
      ...BASE_QUERY_OPTIONS,
    });

    // Associate the files to the collection
    await setCollectionFiles(collection.id, collection.fileIds);

    return collectionMapper.toDomain(getCollectionById(collection.id));
  });

  const remove = async (id: string) => {
    await prisma.collection.delete({ where: { id } });
  };

  return {
    getCollectionById,
    exists,
    save,
    remove,
  };
};

export const useCollectionRepository = () => {
  const prisma = usePrismaClient();
  return prismaCollectionRepository(prisma);
};
