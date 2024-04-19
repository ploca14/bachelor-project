import { describe, expect, it, beforeEach } from "vitest";
import { mockDeep, type DeepMockProxy } from "vitest-mock-extended";
import {
  prismaFlashcardDeckRepository,
  type FlashcardDeckRepository,
} from "~/server/repositories/flashcardDeckRepository";
import type { ExtendedPrismaClient } from "~/server/lib/prisma/client";
import { FlashcardDeck } from "~/server/domain/flashcardDeck";
import { Flashcard } from "~/server/domain/flashcard";
import { NotFoundError } from "~/types/errors";

describe("prismaFlashcardDeckRepository", () => {
  let prismaMock: DeepMockProxy<ExtendedPrismaClient>;
  let repository: FlashcardDeckRepository;

  beforeEach(() => {
    prismaMock = mockDeep<ExtendedPrismaClient>();
    repository = prismaFlashcardDeckRepository(prismaMock);
  });

  it("getFlashcard deckById should return a flashcard deck by id", async () => {
    const id = "test-id";
    const rawFlashcardDeck = {
      id,
      status: "complete" as const,
      name: "Test FlashcardDeck",
      userId: "test-user-id",
      files: [],
      flashcards: [],
      createdAt: new Date(),
    };
    const flashcardDeck = new FlashcardDeck(
      rawFlashcardDeck.name,
      rawFlashcardDeck.status,
      rawFlashcardDeck.files,
      rawFlashcardDeck.userId,
      rawFlashcardDeck.flashcards,
      rawFlashcardDeck.createdAt,
      rawFlashcardDeck.id,
    );
    prismaMock.flashcardDeck.findUnique.mockResolvedValue(rawFlashcardDeck);

    const result = await repository.getFlashcardDeckById(id);

    expect(result).toEqual(flashcardDeck);
    expect(prismaMock.flashcardDeck.findUnique).toHaveBeenCalledWith({
      where: { id },
      include: {
        files: true,
        flashcards: true,
      },
    });
  });

  it("exists should return true if a flashcard deck exists", async () => {
    const id = "test-id";

    prismaMock.flashcardDeck.findUnique.mockResolvedValueOnce({} as any);

    expect(await repository.exists(id)).toBe(true);
    expect(prismaMock.flashcardDeck.findUnique).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it("exists should return false if a flashcard deck does not exist", async () => {
    const id = "test-id";

    prismaMock.flashcardDeck.findUnique.mockResolvedValue(null);

    expect(await repository.exists(id)).toBe(false);
    expect(prismaMock.flashcardDeck.findUnique).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it("save should create a flashcard deck if it does not exist", async () => {
    const id = "test-id";
    const flashcardDeck = new FlashcardDeck(
      "Test FlashcardDeck",
      "complete",
      [],
      "test-user-id",
      [],
      new Date(),
      id,
    );
    const rawFlashcardDeck = {
      id,
      name: flashcardDeck.name,
      userId: flashcardDeck.userId,
      createdAt: flashcardDeck.createdAt,
      status: flashcardDeck.status,
    };

    await repository.save(flashcardDeck);

    expect(prismaMock.flashcardDeck.upsert).toHaveBeenCalledWith({
      where: { id },
      create: rawFlashcardDeck,
      update: rawFlashcardDeck,
      include: {
        files: true,
        flashcards: true,
      },
    });
  });

  it("delete should remove a flashcard deck by id", async () => {
    const id = "test-id";

    await repository.remove(id);

    expect(prismaMock.flashcardDeck.delete).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it("getFlashcard deckById should throw NotFoundError when flashcardDeck not found", async () => {
    const id = "test-id";
    prismaMock.flashcardDeck.findUnique.mockResolvedValue(null);

    await expect(repository.getFlashcardDeckById(id)).rejects.toThrow(
      NotFoundError,
    );
    expect(prismaMock.flashcardDeck.findUnique).toHaveBeenCalledWith({
      where: { id },
      include: {
        files: true,
        flashcards: true,
      },
    });
  });

  it("save should disassociate files from a flashcard deck when saving a flashcard deck without files", async () => {
    const id = "test-id";
    const flashcardDeck = new FlashcardDeck(
      "Test FlashcardDeck",
      "complete",
      [],
      "test-user-id",
      [],
      new Date(),
      id,
    );

    await repository.save(flashcardDeck);

    expect(prismaMock.flashcardDeckFile.deleteMany).toHaveBeenCalledWith({
      where: { deckId: id },
    });
    expect(prismaMock.flashcardDeckFile.createMany).not.toHaveBeenCalled();
  });

  it("save should disassociate flashcards from a flashcard deck when saving a flashcard deck without flashcards", async () => {
    const id = "test-id";
    const flashcardDeck = new FlashcardDeck(
      "Test FlashcardDeck",
      "complete",
      ["file1", "file2"],
      "test-user-id",
      [],
      new Date(),
      id,
    );

    await repository.save(flashcardDeck);

    expect(prismaMock.flashcard.deleteMany).toHaveBeenCalledWith({
      where: { deckId: id },
    });
    expect(prismaMock.flashcard.createMany).not.toHaveBeenCalled();
  });

  it("save should associate files to a flashcard deck when saving a flashcard deck with files", async () => {
    const id = "test-id";
    const flashcardDeck = new FlashcardDeck(
      "Test FlashcardDeck",
      "complete",
      ["file1", "file2"],
      "test-user-id",
      [],
      new Date(),
      id,
    );

    await repository.save(flashcardDeck);

    expect(prismaMock.flashcardDeckFile.deleteMany).toHaveBeenCalledWith({
      where: { deckId: id },
    });
    expect(prismaMock.flashcardDeckFile.createMany).toHaveBeenCalledWith({
      data: flashcardDeck.fileIds.map((fileId) => ({
        fileId,
        deckId: flashcardDeck.id,
      })),
    });
  });

  it("save should associate flashcards to a flashcard deck when saving a flashcard deck with flashcards", async () => {
    const id = "test-id";
    const flashcards = [
      new Flashcard("Front", "Back", id, new Date()),
      new Flashcard("Front", "Back", id, new Date()),
    ];
    const flashcardDeck = new FlashcardDeck(
      "Test FlashcardDeck",
      "complete",
      ["file1", "file2"],
      "test-user-id",
      flashcards,
      new Date(),
      id,
    );

    await repository.save(flashcardDeck);

    expect(prismaMock.flashcard.deleteMany).toHaveBeenCalledWith({
      where: { deckId: id },
    });
    expect(prismaMock.flashcard.createMany).toHaveBeenCalledWith({
      data: flashcardDeck.flashcards.map((flashcardFlashcard) => ({
        id: flashcardFlashcard.id,
        front: flashcardFlashcard.front,
        back: flashcardFlashcard.back,
        deckId: flashcardFlashcard.deckId,
        createdAt: flashcardFlashcard.createdAt,
      })),
    });
  });
});
