import { describe, expect, it, beforeEach } from "vitest";
import { mockDeep, type DeepMockProxy } from "vitest-mock-extended";
import {
  prismaFileRepository,
  type FileRepository,
} from "~/server/repositories/fileRepository";
import type { ExtendedPrismaClient } from "~/server/lib/prisma/client";
import { File } from "~/server/domain/file";
import { NotFoundError } from "~/types/errors";

describe("prismaFileRepository", () => {
  let prismaMock: DeepMockProxy<ExtendedPrismaClient>;
  let repository: FileRepository;

  beforeEach(() => {
    prismaMock = mockDeep<ExtendedPrismaClient>();
    repository = prismaFileRepository(prismaMock);
  });

  it("getFileById should return file by id", async () => {
    const id = "test-id";
    const rawFile = {
      id,
      name: "Test File",
      userId: "test-user-id",
      originalName: "Test File.txt",
      messages: [],
      createdAt: new Date(),
    };
    const file = new File(
      rawFile.name,
      rawFile.originalName,
      rawFile.userId,
      rawFile.createdAt,
      rawFile.id,
    );
    prismaMock.file.findUnique.mockResolvedValue(rawFile);

    const result = await repository.getFileById(id);

    expect(result).toEqual(file);
    expect(prismaMock.file.findUnique).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it("save should create file if it does not exist", async () => {
    const id = "test-id";
    const file = new File(
      "Test File",
      "Test File.txt",
      "test-user-id",
      new Date(),
      id,
    );
    const rawFile = {
      id,
      name: file.name,
      userId: file.ownerId,
      originalName: file.originalName,
      createdAt: file.createdAt,
    };

    await repository.save(file);

    expect(prismaMock.file.upsert).toHaveBeenCalledWith({
      where: { id },
      create: rawFile,
      update: rawFile,
    });
  });

  it("delete should remove file by id", async () => {
    const id = "test-id";

    await repository.remove(id);

    expect(prismaMock.file.delete).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it("getFileById should throw NotFoundError when file not found", async () => {
    const id = "test-id";
    prismaMock.file.findUnique.mockResolvedValue(null);

    await expect(repository.getFileById(id)).rejects.toThrow(NotFoundError);
    expect(prismaMock.file.findUnique).toHaveBeenCalledWith({
      where: { id },
    });
  });
});
