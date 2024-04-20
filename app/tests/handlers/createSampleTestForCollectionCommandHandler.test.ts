import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import type { CollectionRepository } from "~/server/repositories/collectionRepository";
import type { SampleTestRepository } from "~/server/repositories/sampleTestRepository";
import type { Security } from "~/server/tools/security";
import type { QuestionGenerator } from "~/server/tools/questionGenerator";
import type { EventBus } from "~/server/tools/eventBus";
import type { CollectionService } from "~/server/services/collectionService";
import {
  createSampleTestForCollectionCommandHandler,
  type CreateSampleTestForCollectionCommandHandler,
} from "~/server/handlers/createSampleTestForCollectionCommandHandler";
import { SampleTest } from "~/server/domain/sampleTest";
import { Collection } from "~/server/domain/collection";

describe("createSampleTestForCollectionCommandHandler", () => {
  let collectionRepository: MockProxy<CollectionRepository>;
  let sampleTestRepository: MockProxy<SampleTestRepository>;
  let security: MockProxy<Security>;
  let questionGenerator: MockProxy<QuestionGenerator>;
  let eventBus: MockProxy<EventBus>;
  let collectionService: MockProxy<CollectionService>;
  let handler: CreateSampleTestForCollectionCommandHandler;

  vi.mock("uuid", () => ({ v4: () => "123456789" }));

  beforeEach(() => {
    vi.useFakeTimers();
    collectionRepository = mock<CollectionRepository>();
    sampleTestRepository = mock<SampleTestRepository>();
    security = mock<Security>();
    questionGenerator = mock<QuestionGenerator>();
    eventBus = mock<EventBus>();
    collectionService = mock<CollectionService>();
    handler = createSampleTestForCollectionCommandHandler(
      collectionRepository,
      sampleTestRepository,
      security,
      questionGenerator,
      eventBus,
      collectionService,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a new sample test and save it", async () => {
    const user = { id: "user1", name: "Foo" };
    security.getUser.mockResolvedValue(user);
    const collection = new Collection(
      "collection1",
      ["file1", "file2"],
      user.id,
    );
    const sampleTest = new SampleTest(
      collection.name,
      "pending",
      collection.fileIds,
      user.id,
      [],
      new Date(),
      "123456789",
    );

    collectionService.createSampleTest.mockReturnValue(sampleTest);
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    await handler.execute(collection.id);

    expect(sampleTestRepository.save).toHaveBeenCalledWith(sampleTest);
  });

  it("should start generating questions for the sample test", async () => {
    const user = { id: "user1", name: "Foo" };
    const collection = new Collection(
      "collection1",
      ["file1", "file2"],
      user.id,
    );
    const sampleTest = new SampleTest(
      collection.name,
      "pending",
      collection.fileIds,
      user.id,
      [],
      new Date(),
      "123456789",
    );

    security.getUser.mockResolvedValue(user);
    collectionService.createSampleTest.mockResolvedValue(sampleTest);
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    await handler.execute(collection.id);

    expect(questionGenerator.generateQuestions).toHaveBeenCalled();
  });

  it("should publish progress, complete and error events", async () => {
    const user = { id: "user1", name: "Foo" };
    const collection = new Collection(
      "collection1",
      ["file1", "file2"],
      user.id,
    );
    const sampleTest = new SampleTest(
      collection.name,
      "pending",
      collection.fileIds,
      user.id,
      [],
      new Date(),
      "123456789",
    );

    security.getUser.mockResolvedValue(user);
    collectionService.createSampleTest.mockReturnValue(sampleTest);
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    questionGenerator.generateQuestions.mockImplementation(
      async (deck, callbacks) => {
        callbacks.onProgress([]);
        callbacks.onSuccess([]);
        callbacks.onError(new Error("Test error"));
      },
    );

    const result = await handler.execute(collection.id);

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
    const collection = new Collection(
      "collection1",
      ["file1", "file2"],
      user.id,
    );
    const sampleTest = new SampleTest(
      collection.name,
      "pending",
      collection.fileIds,
      user.id,
      [],
      new Date(),
      "123456789",
    );

    security.getUser.mockResolvedValue(user);
    collectionService.createSampleTest.mockReturnValue(sampleTest);
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    questionGenerator.generateQuestions.mockImplementation(
      async (deck, callbacks) => {
        callbacks.onError(new Error("Test error"));
      },
    );

    await handler.execute(collection.id);

    expect(sampleTestRepository.save).toHaveBeenCalledWith(sampleTest);
  });

  it("should update the sample test status on success", async () => {
    const user = { id: "user1", name: "Foo" };
    const collection = new Collection(
      "collection1",
      ["file1", "file2"],
      user.id,
    );
    const sampleTest = new SampleTest(
      collection.name,
      "pending",
      collection.fileIds,
      user.id,
      [],
      new Date(),
      "123456789",
    );

    security.getUser.mockResolvedValue(user);
    collectionService.createSampleTest.mockReturnValue(sampleTest);
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    questionGenerator.generateQuestions.mockImplementation(
      async (deck, callbacks) => {
        callbacks.onSuccess([]);
      },
    );

    await handler.execute(collection.id);

    expect(sampleTestRepository.save).toHaveBeenCalledWith(sampleTest);
  });

  it("should return the sample test id", async () => {
    const user = { id: "user1", name: "Foo" };
    const collection = new Collection(
      "collection1",
      ["file1", "file2"],
      user.id,
    );

    security.getUser.mockResolvedValue(user);
    collectionService.createSampleTest.mockReturnValue({
      id: "123456789",
    } as any);
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    const result = await handler.execute(collection.id);

    expect(result).toBe("123456789");
  });
});
