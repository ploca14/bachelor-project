import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { FlashcardDeckRepository } from "~/server/repositories/flashcardDeckRepository";
import type { Security } from "~/server/tools/security";
import type { FlashcardGenerator } from "~/server/tools/flashcardGenerator";
import type { EventBus } from "~/server/tools/eventBus";
import type { FileService } from "~/server/services/fileService";
import {
  createFlashcardDeckForFileCommandHandler,
  type CreateFlashcardDeckForFileCommandHandler,
} from "~/server/handlers/command/createFlashcardDeckForFileCommandHandler";
import { FlashcardDeck } from "~/server/domain/flashcardDeck";
import { File } from "~/server/domain/file";

describe("createFlashcardDeckForFileCommandHandler", () => {
  let fileRepository: MockProxy<FileRepository>;
  let flashcardDeckRepository: MockProxy<FlashcardDeckRepository>;
  let security: MockProxy<Security>;
  let flashcardGenerator: MockProxy<FlashcardGenerator>;
  let eventBus: MockProxy<EventBus>;
  let fileService: MockProxy<FileService>;
  let handler: CreateFlashcardDeckForFileCommandHandler;

  vi.mock("uuid", () => ({ v4: () => "123456789" }));

  beforeEach(() => {
    vi.useFakeTimers();
    fileRepository = mock<FileRepository>();
    flashcardDeckRepository = mock<FlashcardDeckRepository>();
    security = mock<Security>();
    flashcardGenerator = mock<FlashcardGenerator>();
    eventBus = mock<EventBus>();
    fileService = mock<FileService>();
    handler = createFlashcardDeckForFileCommandHandler(
      fileRepository,
      flashcardDeckRepository,
      security,
      flashcardGenerator,
      eventBus,
      fileService,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a new flashcard deck and save it", async () => {
    const user = { id: "user1", name: "Foo" };
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");
    const flashcardDeck = new FlashcardDeck(
      file.originalName,
      "pending",
      [file.id],
      user.id,
      [],
      new Date(),
      "123456789",
    );

    security.getUser.mockResolvedValue(user);
    fileService.createFlashcardDeck.mockReturnValue(flashcardDeck);
    fileRepository.getFileById.mockResolvedValue(file);

    await handler.execute(file.id);

    expect(flashcardDeckRepository.save).toHaveBeenCalledWith(flashcardDeck);
  });

  it("should start generating flashcards for the flashcard deck", async () => {
    const user = { id: "user1", name: "Foo" };
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");

    security.getUser.mockResolvedValue(user);
    fileService.createFlashcardDeck.mockReturnValue({
      id: "123456789",
    } as any);
    fileRepository.getFileById.mockResolvedValue(file);

    await handler.execute(file.id);

    expect(flashcardGenerator.generateFlashcards).toHaveBeenCalled();
  });

  it("should publish progress, complete and error events", async () => {
    const user = { id: "user1", name: "Foo" };
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");
    const flashcardDeck = new FlashcardDeck(
      file.originalName,
      "pending",
      [file.id],
      user.id,
      [],
      new Date(),
      "123456789",
    );

    security.getUser.mockResolvedValue(user);
    fileService.createFlashcardDeck.mockReturnValue(flashcardDeck);
    fileRepository.getFileById.mockResolvedValue(file);

    flashcardGenerator.generateFlashcards.mockImplementation(
      async (deck, callbacks) => {
        callbacks.onProgress([]);
        callbacks.onSuccess([]);
        callbacks.onError(new Error("Test error"));
      },
    );

    const result = await handler.execute(file.id);

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
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");
    const flashcardDeck = new FlashcardDeck(
      file.originalName,
      "pending",
      [file.id],
      user.id,
      [],
      new Date(),
      "123456789",
    );

    security.getUser.mockResolvedValue(user);
    fileService.createFlashcardDeck.mockReturnValue(flashcardDeck);
    fileRepository.getFileById.mockResolvedValue(file);

    flashcardGenerator.generateFlashcards.mockImplementation(
      async (deck, callbacks) => {
        callbacks.onError(new Error("Test error"));
      },
    );

    await handler.execute(file.id);

    expect(flashcardDeckRepository.save).toHaveBeenCalledWith(flashcardDeck);
  });

  it("should update the flashcard deck status on success", async () => {
    const user = { id: "user1", name: "Foo" };
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");
    const flashcardDeck = new FlashcardDeck(
      file.originalName,
      "pending",
      [file.id],
      user.id,
      [],
      new Date(),
      "123456789",
    );

    security.getUser.mockResolvedValue(user);
    fileService.createFlashcardDeck.mockReturnValue(flashcardDeck);
    fileRepository.getFileById.mockResolvedValue(file);

    flashcardGenerator.generateFlashcards.mockImplementation(
      async (deck, callbacks) => {
        callbacks.onSuccess([]);
      },
    );

    await handler.execute(file.id);

    expect(flashcardDeckRepository.save).toHaveBeenCalledWith(flashcardDeck);
  });

  it("should return the flashcard deck id", async () => {
    const user = { id: "user1", name: "Foo" };
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");

    security.getUser.mockResolvedValue(user);
    fileService.createFlashcardDeck.mockReturnValue({
      id: "123456789",
    } as any);
    fileRepository.getFileById.mockResolvedValue(file);

    const result = await handler.execute(file.id);

    expect(result).toBe("123456789");
  });
});
