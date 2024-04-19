import { describe, expect, it, beforeEach } from "vitest";
import { mockDeep, type DeepMockProxy } from "vitest-mock-extended";
import {
  prismaSampleTestRepository,
  type SampleTestRepository,
} from "~/server/repositories/sampleTestRepository";
import type { ExtendedPrismaClient } from "~/server/lib/prisma/client";
import { SampleTest } from "~/server/domain/sampleTest";
import { Question } from "~/server/domain/question";
import { NotFoundError } from "~/types/errors";

describe("prismaSampleTestRepository", () => {
  let prismaMock: DeepMockProxy<ExtendedPrismaClient>;
  let repository: SampleTestRepository;

  beforeEach(() => {
    prismaMock = mockDeep<ExtendedPrismaClient>();
    repository = prismaSampleTestRepository(prismaMock);
  });

  it("getSampleTestById should return a sample test by id", async () => {
    const id = "test-id";
    const rawSampleTest = {
      id,
      status: "complete" as const,
      name: "Test SampleTest",
      userId: "test-user-id",
      files: [],
      questions: [],
      createdAt: new Date(),
    };
    const sampleTest = new SampleTest(
      rawSampleTest.name,
      rawSampleTest.status,
      rawSampleTest.files,
      rawSampleTest.userId,
      rawSampleTest.questions,
      rawSampleTest.createdAt,
      rawSampleTest.id,
    );
    prismaMock.sampleTest.findUnique.mockResolvedValue(rawSampleTest);

    const result = await repository.getSampleTestById(id);

    expect(result).toEqual(sampleTest);
    expect(prismaMock.sampleTest.findUnique).toHaveBeenCalledWith({
      where: { id },
      include: {
        files: true,
        questions: true,
      },
    });
  });

  it("exists should return true if a sample test exists", async () => {
    const id = "test-id";

    prismaMock.sampleTest.findUnique.mockResolvedValueOnce({} as any);

    expect(await repository.exists(id)).toBe(true);
    expect(prismaMock.sampleTest.findUnique).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it("exists should return false if a sample test does not exist", async () => {
    const id = "test-id";

    prismaMock.sampleTest.findUnique.mockResolvedValue(null);

    expect(await repository.exists(id)).toBe(false);
    expect(prismaMock.sampleTest.findUnique).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it("save should create a sample test if it does not exist", async () => {
    const id = "test-id";
    const sampleTest = new SampleTest(
      "Test SampleTest",
      "complete",
      [],
      "test-user-id",
      [],
      new Date(),
      id,
    );
    const rawSampleTest = {
      id,
      name: sampleTest.name,
      userId: sampleTest.userId,
      createdAt: sampleTest.createdAt,
      status: sampleTest.status,
    };

    await repository.save(sampleTest);

    expect(prismaMock.sampleTest.upsert).toHaveBeenCalledWith({
      where: { id },
      create: rawSampleTest,
      update: rawSampleTest,
      include: {
        files: true,
        questions: true,
      },
    });
  });

  it("delete should remove a sample test by id", async () => {
    const id = "test-id";

    await repository.remove(id);

    expect(prismaMock.sampleTest.delete).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it("a getSample testById should throw NotFoundError when a sample test not found", async () => {
    const id = "test-id";
    prismaMock.sampleTest.findUnique.mockResolvedValue(null);

    await expect(repository.getSampleTestById(id)).rejects.toThrow(
      NotFoundError,
    );
    expect(prismaMock.sampleTest.findUnique).toHaveBeenCalledWith({
      where: { id },
      include: {
        files: true,
        questions: true,
      },
    });
  });

  it("save should disassociate files from a sample test when saving a sample test without files", async () => {
    const id = "test-id";
    const sampleTest = new SampleTest(
      "Test SampleTest",
      "complete",
      [],
      "test-user-id",
      [],
      new Date(),
      id,
    );

    await repository.save(sampleTest);

    expect(prismaMock.sampleTestFile.deleteMany).toHaveBeenCalledWith({
      where: { testId: id },
    });
    expect(prismaMock.sampleTestFile.createMany).not.toHaveBeenCalled();
  });

  it("save should disassociate questions from a sample test when saving a sample test without questions", async () => {
    const id = "test-id";
    const sampleTest = new SampleTest(
      "Test SampleTest",
      "complete",
      ["file1", "file2"],
      "test-user-id",
      [],
      new Date(),
      id,
    );

    await repository.save(sampleTest);

    expect(prismaMock.question.deleteMany).toHaveBeenCalledWith({
      where: { testId: id },
    });
    expect(prismaMock.question.createMany).not.toHaveBeenCalled();
  });

  it("save should associate files to a sample test when saving a sample test with files", async () => {
    const id = "test-id";
    const sampleTest = new SampleTest(
      "Test SampleTest",
      "complete",
      ["file1", "file2"],
      "test-user-id",
      [],
      new Date(),
      id,
    );

    await repository.save(sampleTest);

    expect(prismaMock.sampleTestFile.deleteMany).toHaveBeenCalledWith({
      where: { testId: id },
    });
    expect(prismaMock.sampleTestFile.createMany).toHaveBeenCalledWith({
      data: sampleTest.fileIds.map((fileId) => ({
        fileId,
        testId: sampleTest.id,
      })),
    });
  });

  it("save should associate questions to a sample test when saving a sample test with questions", async () => {
    const id = "test-id";
    const questions = [
      new Question("Front", "Back", id, new Date()),
      new Question("Front", "Back", id, new Date()),
    ];
    const sampleTest = new SampleTest(
      "Test SampleTest",
      "complete",
      ["file1", "file2"],
      "test-user-id",
      questions,
      new Date(),
      id,
    );

    await repository.save(sampleTest);

    expect(prismaMock.question.deleteMany).toHaveBeenCalledWith({
      where: { testId: id },
    });
    expect(prismaMock.question.createMany).toHaveBeenCalledWith({
      data: sampleTest.questions.map((question) => ({
        id: question.id,
        content: question.content,
        testId: question.testId,
        createdAt: question.createdAt,
      })),
    });
  });
});
