import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { FlashcardDeckRepository } from "~/server/repositories/flashcardDeckRepository";
import type { SecurityService } from "~/server/services/securityService";
import type { FlashcardGeneratorService } from "~/server/services/flashcardGeneratorService";
import type { EventBus } from "~/server/services/eventBus";
import { createFlashcardDeckForFileCommandHandler } from "~/server/handlers/createFlashcardDeckForFileCommandHandler";
import { FlashcardDeck } from "~/server/domain/flashcardDeck";
import { File } from "~/server/domain/file";

describe("createFlashcardDeckForFileCommandHandler", () => {
  let fileRepository: MockProxy<FileRepository>;
  let flashcardDeckRepository: MockProxy<FlashcardDeckRepository>;
  let securityService: MockProxy<SecurityService>;
  let flashcardGeneratorService: MockProxy<FlashcardGeneratorService>;
  let eventBus: MockProxy<EventBus>;
  let handler: any;

  vi.mock("uuid", () => ({ v4: () => "123456789" }));

  beforeEach(() => {
    vi.useFakeTimers();
    fileRepository = mock<FileRepository>();
    flashcardDeckRepository = mock<FlashcardDeckRepository>();
    securityService = mock<SecurityService>();
    flashcardGeneratorService = mock<FlashcardGeneratorService>();
    eventBus = mock<EventBus>();
    handler = createFlashcardDeckForFileCommandHandler(
      fileRepository,
      flashcardDeckRepository,
      securityService,
      flashcardGeneratorService,
      eventBus,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a new flashcard deck and save it", async () => {
    const user = { id: "user1", name: "Foo" };
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");
    securityService.getUser.mockResolvedValue(user);
    fileRepository.getFileById.mockResolvedValue(file);

    const result = await handler.execute(file.id);

    expect(flashcardDeckRepository.save).toHaveBeenCalledWith(
      new FlashcardDeck(
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

    expect(flashcardGeneratorService.generateFlashcards).toHaveBeenCalledWith(
      new FlashcardDeck(
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

    flashcardGeneratorService.generateFlashcards.mockImplementation(
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
    securityService.getUser.mockResolvedValue(user);
    fileRepository.getFileById.mockResolvedValue(file);

    flashcardGeneratorService.generateFlashcards.mockImplementation(
      async (deck, callbacks) => {
        callbacks.onError(new Error("Test error"));
      },
    );

    const result = await handler.execute(file.id);

    expect(flashcardDeckRepository.save).toHaveBeenCalledWith(
      new FlashcardDeck(
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

  it("should update the flashcard deck status on success", async () => {
    const user = { id: "user1", name: "Foo" };
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");
    securityService.getUser.mockResolvedValue(user);
    fileRepository.getFileById.mockResolvedValue(file);

    flashcardGeneratorService.generateFlashcards.mockImplementation(
      async (deck, callbacks) => {
        callbacks.onSuccess([]);
      },
    );

    const result = await handler.execute(file.id);

    expect(flashcardDeckRepository.save).toHaveBeenCalledWith(
      new FlashcardDeck(
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

  it("should return the flashcard deck id", async () => {
    const user = { id: "user1", name: "Foo" };
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");
    securityService.getUser.mockResolvedValue(user);
    fileRepository.getFileById.mockResolvedValue(file);

    const result = await handler.execute(file.id);

    expect(result).toBe("123456789");
  });
});
