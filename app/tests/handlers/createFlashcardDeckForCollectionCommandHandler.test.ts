import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import type { CollectionRepository } from "~/server/repositories/collectionRepository";
import type { FlashcardDeckRepository } from "~/server/repositories/flashcardDeckRepository";
import type { Security } from "~/server/tools/security";
import type { FlashcardGenerator } from "~/server/tools/flashcardGenerator";
import type { EventBus } from "~/server/tools/eventBus";
import type { CollectionService } from "~/server/services/collectionService";
import {
  createFlashcardDeckForCollectionCommandHandler,
  type CreateFlashcardDeckForCollectionCommandHandler,
} from "~/server/handlers/createFlashcardDeckForCollectionCommandHandler";
import { FlashcardDeck } from "~/server/domain/flashcardDeck";
import { Collection } from "~/server/domain/collection";

describe("createFlashcardDeckForCollectionCommandHandler", () => {
  let collectionRepository: MockProxy<CollectionRepository>;
  let flashcardDeckRepository: MockProxy<FlashcardDeckRepository>;
  let security: MockProxy<Security>;
  let flashcardGenerator: MockProxy<FlashcardGenerator>;
  let eventBus: MockProxy<EventBus>;
  let collectionService: MockProxy<CollectionService>;
  let handler: CreateFlashcardDeckForCollectionCommandHandler;

  vi.mock("uuid", () => ({ v4: () => "123456789" }));

  beforeEach(() => {
    vi.useFakeTimers();
    collectionRepository = mock<CollectionRepository>();
    flashcardDeckRepository = mock<FlashcardDeckRepository>();
    security = mock<Security>();
    flashcardGenerator = mock<FlashcardGenerator>();
    eventBus = mock<EventBus>();
    collectionService = mock<CollectionService>();
    handler = createFlashcardDeckForCollectionCommandHandler(
      collectionRepository,
      flashcardDeckRepository,
      security,
      flashcardGenerator,
      eventBus,
      collectionService,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a new flashcard deck and save it", async () => {
    const user = { id: "user1", name: "Foo" };
    security.getUser.mockResolvedValue(user);
    const collection = new Collection(
      "collection1",
      ["file1", "file2"],
      user.id,
    );
    const flashcardDeck = new FlashcardDeck(
      collection.name,
      "pending",
      collection.fileIds,
      user.id,
      [],
      new Date(),
      "123456789",
    );

    collectionService.createFlashcardDeck.mockReturnValue(flashcardDeck);
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    await handler.execute(collection.id);

    expect(flashcardDeckRepository.save).toHaveBeenCalledWith(flashcardDeck);
  });

  it("should start generating flashcards for the flashcard deck", async () => {
    const user = { id: "user1", name: "Foo" };
    const collection = new Collection(
      "collection1",
      ["file1", "file2"],
      user.id,
    );

    security.getUser.mockResolvedValue(user);
    collectionService.createFlashcardDeck.mockReturnValue({
      id: "123456789",
    } as any);
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    await handler.execute(collection.id);

    expect(flashcardGenerator.generateFlashcards).toHaveBeenCalled();
  });

  it("should publish progress, complete and error events", async () => {
    const user = { id: "user1", name: "Foo" };
    const collection = new Collection(
      "collection1",
      ["file1", "file2"],
      user.id,
    );
    const flashcardDeck = new FlashcardDeck(
      collection.name,
      "pending",
      collection.fileIds,
      user.id,
      [],
      new Date(),
      "123456789",
    );

    security.getUser.mockResolvedValue(user);
    collectionService.createFlashcardDeck.mockReturnValue(flashcardDeck);
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    flashcardGenerator.generateFlashcards.mockImplementation(
      async (deck, callbacks) => {
        callbacks.onProgress([]);
        callbacks.onSuccess([]);
        callbacks.onError(new Error("Test error"));
      },
    );

    const result = await handler.execute(collection.id);

    expect(eventBus.publish).toHaveBeenCalledWith(
      `flashcardDeck:${result}:progress`,
      [],
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      `flashcardDeck:${result}:complete`,
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      `flashcardDeck:${result}:error`,
      "Test error",
    );
  });

  it("should update the flashcard deck status on error", async () => {
    const user = { id: "user1", name: "Foo" };
    const collection = new Collection(
      "collection1",
      ["file1", "file2"],
      user.id,
    );
    const flashcardDeck = new FlashcardDeck(
      collection.name,
      "error",
      collection.fileIds,
      user.id,
      [],
      new Date(),
      "123456789",
    );

    security.getUser.mockResolvedValue(user);
    collectionService.createFlashcardDeck.mockReturnValue(flashcardDeck);
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    flashcardGenerator.generateFlashcards.mockImplementation(
      async (deck, callbacks) => {
        callbacks.onError(new Error("Test error"));
      },
    );

    await handler.execute(collection.id);

    expect(flashcardDeckRepository.save).toHaveBeenCalledWith(flashcardDeck);
  });

  it("should update the flashcard deck status on success", async () => {
    const user = { id: "user1", name: "Foo" };
    const collection = new Collection(
      "collection1",
      ["file1", "file2"],
      user.id,
    );
    const flashcardDeck = new FlashcardDeck(
      collection.name,
      "complete",
      collection.fileIds,
      user.id,
      [],
      new Date(),
      "123456789",
    );

    security.getUser.mockResolvedValue(user);
    collectionService.createFlashcardDeck.mockReturnValue(flashcardDeck);
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    flashcardGenerator.generateFlashcards.mockImplementation(
      async (deck, callbacks) => {
        callbacks.onSuccess([]);
      },
    );

    await handler.execute(collection.id);

    expect(flashcardDeckRepository.save).toHaveBeenCalledWith(flashcardDeck);
  });

  it("should return the flashcard deck id", async () => {
    const user = { id: "user1", name: "Foo" };
    const collection = new Collection(
      "collection1",
      ["file1", "file2"],
      user.id,
    );

    security.getUser.mockResolvedValue(user);
    collectionService.createFlashcardDeck.mockReturnValue({
      id: "123456789",
    } as any);
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    const result = await handler.execute(collection.id);

    expect(result).toBe("123456789");
  });
});
