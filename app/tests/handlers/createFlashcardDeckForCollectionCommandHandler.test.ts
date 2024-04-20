import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import type { CollectionRepository } from "~/server/repositories/collectionRepository";
import type { FlashcardDeckRepository } from "~/server/repositories/flashcardDeckRepository";
import type { Security } from "~/server/tools/security";
import type { FlashcardGenerator } from "~/server/tools/flashcardGenerator";
import type { EventBus } from "~/server/tools/eventBus";
import { createFlashcardDeckForCollectionCommandHandler } from "~/server/handlers/createFlashcardDeckForCollectionCommandHandler";
import { FlashcardDeck } from "~/server/domain/flashcardDeck";
import { Collection } from "~/server/domain/collection";

describe("createFlashcardDeckForCollectionCommandHandler", () => {
  let collectionRepository: MockProxy<CollectionRepository>;
  let flashcardDeckRepository: MockProxy<FlashcardDeckRepository>;
  let security: MockProxy<Security>;
  let flashcardGenerator: MockProxy<FlashcardGenerator>;
  let eventBus: MockProxy<EventBus>;
  let handler: any;

  vi.mock("uuid", () => ({ v4: () => "123456789" }));

  beforeEach(() => {
    vi.useFakeTimers();
    collectionRepository = mock<CollectionRepository>();
    flashcardDeckRepository = mock<FlashcardDeckRepository>();
    security = mock<Security>();
    flashcardGenerator = mock<FlashcardGenerator>();
    eventBus = mock<EventBus>();
    handler = createFlashcardDeckForCollectionCommandHandler(
      collectionRepository,
      flashcardDeckRepository,
      security,
      flashcardGenerator,
      eventBus,
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
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    const result = await handler.execute(collection.id);

    expect(flashcardDeckRepository.save).toHaveBeenCalledWith(
      new FlashcardDeck(
        collection.name,
        "pending",
        collection.fileIds,
        user.id,
        [],
        new Date(),
        result,
      ),
    );
    expect(result).toBe("123456789");
  });

  it("should generate flashcards for the collection", async () => {
    const user = { id: "user1", name: "Foo" };
    const collection = new Collection(
      "collection1",
      ["file1", "file2"],
      user.id,
    );
    security.getUser.mockResolvedValue(user);
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    await handler.execute(collection.id);

    expect(flashcardGenerator.generateFlashcards).toHaveBeenCalledWith(
      new FlashcardDeck(
        collection.name,
        "pending",
        collection.fileIds,
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
    const collection = new Collection(
      "collection1",
      ["file1", "file2"],
      user.id,
    );
    security.getUser.mockResolvedValue(user);
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
    security.getUser.mockResolvedValue(user);
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    flashcardGenerator.generateFlashcards.mockImplementation(
      async (deck, callbacks) => {
        callbacks.onError(new Error("Test error"));
      },
    );

    const result = await handler.execute(collection.id);

    expect(flashcardDeckRepository.save).toHaveBeenCalledWith(
      new FlashcardDeck(
        collection.name,
        "error",
        collection.fileIds,
        user.id,
        [],
        new Date(),
        result,
      ),
    );
  });

  it("should update the flashcard deck status on success", async () => {
    const user = { id: "user1", name: "Foo" };
    const collection = new Collection(
      "collection1",
      ["file1", "file2"],
      user.id,
    );
    security.getUser.mockResolvedValue(user);
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    flashcardGenerator.generateFlashcards.mockImplementation(
      async (deck, callbacks) => {
        callbacks.onSuccess([]);
      },
    );

    const result = await handler.execute(collection.id);

    expect(flashcardDeckRepository.save).toHaveBeenCalledWith(
      new FlashcardDeck(
        collection.name,
        "complete",
        collection.fileIds,
        user.id,
        [],
        new Date(),
        result,
      ),
    );
  });

  it("should return the flashcard deck id", async () => {
    const user = { id: "user1", name: "Foo" };
    const collection = new Collection(
      "collection1",
      ["file1", "file2"],
      user.id,
    );
    security.getUser.mockResolvedValue(user);
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    const result = await handler.execute(collection.id);

    expect(result).toBe("123456789");
  });
});
