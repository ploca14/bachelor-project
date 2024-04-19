import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { SampleTestRepository } from "~/server/repositories/sampleTestRepository";
import type { SecurityService } from "~/server/services/securityService";
import type { QuestionGeneratorService } from "~/server/services/questionGeneratorService";
import type { EventBus } from "~/server/services/eventBus";
import { createSampleTestForFileCommandHandler } from "~/server/handlers/createSampleTestForFileCommandHandler";
import { SampleTest } from "~/server/domain/sampleTest";
import { File } from "~/server/domain/file";

describe("createSampleTestForFileCommandHandler", () => {
  let fileRepository: MockProxy<FileRepository>;
  let sampleTestRepository: MockProxy<SampleTestRepository>;
  let securityService: MockProxy<SecurityService>;
  let questionGeneratorService: MockProxy<QuestionGeneratorService>;
  let eventBus: MockProxy<EventBus>;
  let handler: any;

  vi.mock("uuid", () => ({ v4: () => "123456789" }));

  beforeEach(() => {
    vi.useFakeTimers();
    fileRepository = mock<FileRepository>();
    sampleTestRepository = mock<SampleTestRepository>();
    securityService = mock<SecurityService>();
    questionGeneratorService = mock<QuestionGeneratorService>();
    eventBus = mock<EventBus>();
    handler = createSampleTestForFileCommandHandler(
      fileRepository,
      sampleTestRepository,
      securityService,
      questionGeneratorService,
      eventBus,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a new sample test and save it", async () => {
    const user = { id: "user1", name: "Foo" };
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");
    securityService.getUser.mockResolvedValue(user);
    fileRepository.getFileById.mockResolvedValue(file);

    const result = await handler.execute(file.id);

    expect(sampleTestRepository.save).toHaveBeenCalledWith(
      new SampleTest(
        file.originalName,
        "pending",
        [file.id],
        user.id,
        [],
        new Date(),
        result,
      ),
    );
    expect(result).toBe("123456789");
  });

  it("should generate flashcards for the file", async () => {
    const user = { id: "user1", name: "Foo" };
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");
    securityService.getUser.mockResolvedValue(user);
    fileRepository.getFileById.mockResolvedValue(file);

    await handler.execute(file.id);

    expect(questionGeneratorService.generateQuestions).toHaveBeenCalledWith(
      new SampleTest(
        file.originalName,
        "pending",
        [file.id],
        user.id,
        [],
        new Date(),
        "123456789",
      ),
      expect.any(Object),
    );
  });

  it("should publish progress, complete and error events", async () => {
    const user = { id: "user1", name: "Foo" };
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");
    securityService.getUser.mockResolvedValue(user);
    fileRepository.getFileById.mockResolvedValue(file);

    questionGeneratorService.generateQuestions.mockImplementation(
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
    securityService.getUser.mockResolvedValue(user);
    fileRepository.getFileById.mockResolvedValue(file);

    questionGeneratorService.generateQuestions.mockImplementation(
      async (deck, callbacks) => {
        callbacks.onError(new Error("Test error"));
      },
    );

    const result = await handler.execute(file.id);

    expect(sampleTestRepository.save).toHaveBeenCalledWith(
      new SampleTest(
        file.originalName,
        "error",
        [file.id],
        user.id,
        [],
        new Date(),
        result,
      ),
    );
  });

  it("should update the sample test status on success", async () => {
    const user = { id: "user1", name: "Foo" };
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");
    securityService.getUser.mockResolvedValue(user);
    fileRepository.getFileById.mockResolvedValue(file);

    questionGeneratorService.generateQuestions.mockImplementation(
      async (deck, callbacks) => {
        callbacks.onSuccess([]);
      },
    );

    const result = await handler.execute(file.id);

    expect(sampleTestRepository.save).toHaveBeenCalledWith(
      new SampleTest(
        file.originalName,
        "complete",
        [file.id],
        user.id,
        [],
        new Date(),
        result,
      ),
    );
  });

  it("should return the sample test id", async () => {
    const user = { id: "user1", name: "Foo" };
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");
    securityService.getUser.mockResolvedValue(user);
    fileRepository.getFileById.mockResolvedValue(file);

    const result = await handler.execute(file.id);

    expect(result).toBe("123456789");
  });
});
