import { flashcardDeckMapper } from "~/server/mappers/flashcardDeckMapper";
import { flashcardMapper } from "~/server/mappers/flashcardMapper";
import { transactional } from "~/server/utils/transactional";
import type { Prisma } from "@prisma/client";
import type { ExtendedPrismaClient } from "~/server/lib/prisma/client";
import type { FlashcardDeck } from "~/server/domain/flashcardDeck";
import type { Flashcard } from "~/server/domain/flashcard";
import { NotFoundError } from "~/types/errors";

export interface FlashcardDeckRepository {
  getFlashcardDeckById: (id: string) => Promise<FlashcardDeck>;
  exists: (id: string) => Promise<boolean>;
  save: (flashcardDeck: FlashcardDeck) => Promise<FlashcardDeck>;
  remove: (id: string) => Promise<void>;
}

const prismaFlashcardDeckRepository = (
  prisma: ExtendedPrismaClient,
): FlashcardDeckRepository => {
  const BASE_QUERY_OPTIONS = {
    include: { files: true, flashcards: true },
  } satisfies Prisma.FlashcardDeckDefaultArgs;

  const getFlashcardDeckById = async (id: string) => {
    const result = await prisma.flashcardDeck.findUnique({
      where: { id },
      ...BASE_QUERY_OPTIONS,
    });

    if (!result) {
      throw new NotFoundError("Flashcard deck not found");
    }

    return flashcardDeckMapper.toDomain(result);
  };

  const exists = async (id: string) => {
    const result = await prisma.flashcardDeck.findUnique({ where: { id } });

    return result !== null;
  };

  const setFlashcardDeckFiles = transactional(
    async (deckId: string, fileIds: string[]) => {
      // Disassociate all files from the flashcardDeck
      await prisma.flashcardDeckFile.deleteMany({
        where: {
          deckId,
        },
      });

      // Associate the new files to the flashcardDeck
      await prisma.flashcardDeckFile.createMany({
        data: fileIds.map((fileId) => ({
          fileId,
          deckId,
        })),
      });
    },
  );

  const saveFlashcardDeckFlashcards = transactional(
    async (deckId: string, flashcards: Flashcard[]) => {
      // Delete all flashcards from the flashcardDeck
      await prisma.flashcard.deleteMany({
        where: {
          deckId,
        },
      });

      // Recreate the flashcards
      await prisma.flashcard.createMany({
        data: flashcards.map((flashcard) =>
          flashcardMapper.toPersistence(flashcard),
        ),
      });
    },
  );

  const save = transactional(async (flashcardDeck: FlashcardDeck) => {
    const rawFlashcardDeck = flashcardDeckMapper.toPersistence(flashcardDeck);

    // If the flashcardDeck already exists, update it. Otherwise, create it.
    await prisma.flashcardDeck.upsert({
      where: { id: flashcardDeck.id },
      create: rawFlashcardDeck,
      update: rawFlashcardDeck,
      ...BASE_QUERY_OPTIONS,
    });

    // Associate the files to the flashcardDeck
    await setFlashcardDeckFiles(flashcardDeck.id, flashcardDeck.fileIds);

    // Save the flashcards
    await saveFlashcardDeckFlashcards(
      flashcardDeck.id,
      flashcardDeck.flashcards,
    );

    return flashcardDeck;
  });

  const remove = async (id: string) => {
    await prisma.flashcardDeck.delete({ where: { id } });
  };

  return {
    getFlashcardDeckById,
    exists,
    save,
    remove,
  };
};

import { usePrismaClient } from "~/server/lib/prisma/client";

export const useFlashcardDeckRepository = () => {
  const prisma = usePrismaClient();
  return prismaFlashcardDeckRepository(prisma);
};
