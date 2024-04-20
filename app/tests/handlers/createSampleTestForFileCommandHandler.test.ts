import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { SampleTestRepository } from "~/server/repositories/sampleTestRepository";
import type { Security } from "~/server/tools/security";
import type { QuestionGenerator } from "~/server/tools/questionGenerator";
import type { EventBus } from "~/server/tools/eventBus";
import type { FileService } from "~/server/services/fileService";
import {
  createSampleTestForFileCommandHandler,
  type CreateSampleTestForFileCommandHandler,
} from "~/server/handlers/createSampleTestForFileCommandHandler";
import { SampleTest } from "~/server/domain/sampleTest";
import { File } from "~/server/domain/file";

describe("createSampleTestForFileCommandHandler", () => {
  let fileRepository: MockProxy<FileRepository>;
  let sampleTestRepository: MockProxy<SampleTestRepository>;
  let security: MockProxy<Security>;
  let questionGenerator: MockProxy<QuestionGenerator>;
  let eventBus: MockProxy<EventBus>;
  let fileService: MockProxy<FileService>;
  let handler: CreateSampleTestForFileCommandHandler;

  vi.mock("uuid", () => ({ v4: () => "123456789" }));

  beforeEach(() => {
    vi.useFakeTimers();
    fileRepository = mock<FileRepository>();
    sampleTestRepository = mock<SampleTestRepository>();
    security = mock<Security>();
    questionGenerator = mock<QuestionGenerator>();
    eventBus = mock<EventBus>();
    fileService = mock<FileService>();
    handler = createSampleTestForFileCommandHandler(
      fileRepository,
      sampleTestRepository,
      security,
      questionGenerator,
      eventBus,
      fileService,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a new sample test and save it", async () => {
    const user = { id: "user1", name: "Foo" };
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");
    const sampleTest = new SampleTest(
      file.originalName,
      "pending",
      [file.id],
      user.id,
      [],
      new Date(),
      "123456789",
    );

    security.getUser.mockResolvedValue(user);
    fileService.createSampleTest.mockReturnValue(sampleTest);
    fileRepository.getFileById.mockResolvedValue(file);

    await handler.execute(file.id);

    expect(sampleTestRepository.save).toHaveBeenCalledWith(sampleTest);
  });

  it("should start generating flashcards for the flashcard deck", async () => {
    const user = { id: "user1", name: "Foo" };
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");

    security.getUser.mockResolvedValue(user);
    fileService.createSampleTest.mockReturnValue({
      id: "123456789",
    } as any);
    fileRepository.getFileById.mockResolvedValue(file);

    await handler.execute(file.id);

    expect(questionGenerator.generateQuestions).toHaveBeenCalled();
  });

  it("should publish progress, complete and error events", async () => {
    const user = { id: "user1", name: "Foo" };
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");
    const sampleTest = new SampleTest(
      file.originalName,
      "pending",
      [file.id],
      user.id,
      [],
      new Date(),
      "123456789",
    );

    security.getUser.mockResolvedValue(user);
    fileService.createSampleTest.mockReturnValue(sampleTest);
    fileRepository.getFileById.mockResolvedValue(file);

    questionGenerator.generateQuestions.mockImplementation(
      async (deck, callbacks) => {
        callbacks.onProgress([]);
        callbacks.onSuccess([]);
        callbacks.onError(new Error("Test error"));
      },
    );

    const result = await handler.execute(file.id);

    expect(eventBus.publish).toHaveBeenCalledWith(
      `sampleTest:${result}:progress`,
      [],
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      `sampleTest:${result}:complete`,
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      `sampleTest:${result}:error`,
      "Test error",
    );
  });

  it("should update the sample test status on error", async () => {
    const user = { id: "user1", name: "Foo" };
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");
    const sampleTest = new SampleTest(
      file.originalName,
      "pending",
      [file.id],
      user.id,
      [],
      new Date(),
      "123456789",
    );

    security.getUser.mockResolvedValue(user);
    fileService.createSampleTest.mockReturnValue(sampleTest);
    fileRepository.getFileById.mockResolvedValue(file);

    questionGenerator.generateQuestions.mockImplementation(
      async (deck, callbacks) => {
        callbacks.onError(new Error("Test error"));
      },
    );

    await handler.execute(file.id);

    expect(sampleTestRepository.save).toHaveBeenCalledWith(sampleTest);
  });

  it("should update the sample test status on success", async () => {
    const user = { id: "user1", name: "Foo" };
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");
    const sampleTest = new SampleTest(
      file.originalName,
      "pending",
      [file.id],
      user.id,
      [],
      new Date(),
      "123456789",
    );

    security.getUser.mockResolvedValue(user);
    fileService.createSampleTest.mockReturnValue(sampleTest);
    fileRepository.getFileById.mockResolvedValue(file);

    questionGenerator.generateQuestions.mockImplementation(
      async (deck, callbacks) => {
        callbacks.onSuccess([]);
      },
    );

    await handler.execute(file.id);

    expect(sampleTestRepository.save).toHaveBeenCalledWith(sampleTest);
  });

  it("should return the sample test id", async () => {
    const user = { id: "user1", name: "Foo" };
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");

    security.getUser.mockResolvedValue(user);
    fileService.createSampleTest.mockReturnValue({
      id: "123456789",
    } as any);
    fileRepository.getFileById.mockResolvedValue(file);

    const result = await handler.execute(file.id);

    expect(result).toBe("123456789");
  });
});
