import { describe, expect, it, beforeEach } from "vitest";
import { mockDeep, type DeepMockProxy } from "vitest-mock-extended";
import {
  prismaCollectionRepository,
  type CollectionRepository,
} from "~/server/repositories/collectionRepository";
import type { ExtendedPrismaClient } from "~/server/lib/prisma/client";
import { Collection } from "~/server/domain/collection";
import { NotFoundError } from "~/types/errors";

describe("prismaCollectionRepository", () => {
  let prismaMock: DeepMockProxy<ExtendedPrismaClient>;
  let repository: CollectionRepository;

  beforeEach(() => {
    prismaMock = mockDeep<ExtendedPrismaClient>();
    repository = prismaCollectionRepository(prismaMock);
  });

  it("getCollectionById should return collection by id", async () => {
    const id = "test-id";
    const rawCollection = {
      id,
      name: "Test Collection",
      userId: "test-user-id",
      files: [],
      messages: [],
      createdAt: new Date(),
    };
    const collection = new Collection(
      rawCollection.name,
      rawCollection.files,
      rawCollection.userId,
      rawCollection.createdAt,
      rawCollection.id,
    );
    prismaMock.collection.findUnique.mockResolvedValue(rawCollection);

    const result = await repository.getCollectionById(id);

    expect(result).toEqual(collection);
    expect(prismaMock.collection.findUnique).toHaveBeenCalledWith({
      where: { id },
      include: {
        files: true,
      },
    });
  });

  it("exists should return true if collection exists", async () => {
    const id = "test-id";

    prismaMock.collection.findUnique.mockResolvedValueOnce({} as any);

    expect(await repository.exists(id)).toBe(true);
    expect(prismaMock.collection.findUnique).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it("exists should return false if collection does not exist", async () => {
    const id = "test-id";

    prismaMock.collection.findUnique.mockResolvedValue(null);

    expect(await repository.exists(id)).toBe(false);
    expect(prismaMock.collection.findUnique).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it("save should create collection if it does not exist", async () => {
    const id = "test-id";
    const collection = new Collection(
      "Test Collection",
      [],
      "test-user-id",
      new Date(),
      id,
    );
    const rawCollection = {
      id,
      name: collection.name,
      userId: collection.userId,
      createdAt: collection.createdAt,
    };

    await repository.save(collection);

    expect(prismaMock.collection.upsert).toHaveBeenCalledWith({
      where: { id },
      create: rawCollection,
      update: rawCollection,
      include: {
        files: true,
      },
    });
  });

  it("delete should remove collection by id", async () => {
    const id = "test-id";

    await repository.remove(id);

    expect(prismaMock.collection.delete).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it("getCollectionById should throw NotFoundError when collection not found", async () => {
    const id = "test-id";
    prismaMock.collection.findUnique.mockResolvedValue(null);

    await expect(repository.getCollectionById(id)).rejects.toThrow(
      NotFoundError,
    );
    expect(prismaMock.collection.findUnique).toHaveBeenCalledWith({
      where: { id },
      include: {
        files: true,
      },
    });
  });

  it("save should disassociate files from collection when saving collection without files", async () => {
    const id = "test-id";
    const collection = new Collection(
      "Test Collection",
      [],
      "test-user-id",
      new Date(),
      id,
    );

    await repository.save(collection);

    expect(prismaMock.collectionFile.deleteMany).toHaveBeenCalledWith({
      where: { collectionId: id },
    });
    expect(prismaMock.collectionFile.createMany).not.toHaveBeenCalled();
  });

  it("save should associate files to collection when saving collection with files", async () => {
    const id = "test-id";
    const collection = new Collection(
      "Test Collection",
      ["file1", "file2"],
      "test-user-id",
      new Date(),
      id,
    );

    await repository.save(collection);

    expect(prismaMock.collectionFile.deleteMany).toHaveBeenCalledWith({
      where: { collectionId: id },
    });
    expect(prismaMock.collectionFile.createMany).toHaveBeenCalledWith({
      data: collection.fileIds.map((fileId) => ({
        fileId,
        collectionId: collection.id,
      })),
    });
  });
});
