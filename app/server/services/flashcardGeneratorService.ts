import type { FlashcardDeck } from "~/server/domain/flashcardDeck";
import { VectorStoreService } from "~/server/services/vectorStoreService";
import { GenerateFlashcardsChain } from "~/server/lib/langchain/generateFlashcardsChain";
import { IterableReadableStream } from "@langchain/core/utils/stream";

interface FlashcardDto {
  front: string;
  back: string;
}

export interface FlashcardGeneratorService {
  generateFlashcards(
    flashcardDeck: FlashcardDeck,
    callbacks?: {
      onEnd?: (flashcards: FlashcardDto[][]) => void;
    },
  ): Promise<IterableReadableStream<FlashcardDto[][]>>;
}

const langchainFlashcardGeneratorService = (
  vectorStore: VectorStoreService,
  generateFlashcardsChain: GenerateFlashcardsChain,
): FlashcardGeneratorService => {
  const generateFlashcards = async (
    flashcardDeck: FlashcardDeck,
    callbacks?: {
      onEnd: (flashcards: FlashcardDto[][]) => Promise<void>;
    },
  ) => {
    const documents = await vectorStore.getDocuments(flashcardDeck.fileIds);

    const streams = await Promise.all(
      documents.map((doc) => generateFlashcardsChain.stream(doc)),
    );

    return combineLatest(streams, {
      onEnd: callbacks?.onEnd,
    });
  };

  return {
    generateFlashcards,
  };
};

import { useVectorStoreService } from "~/server/services/vectorStoreService";
import { useGenerateFlashcardsChain } from "~/server/lib/langchain/generateFlashcardsChain";

export const useFlashcardGeneratorService = () => {
  const vectorStoreService = useVectorStoreService();
  const generateFlashcardsChain = useGenerateFlashcardsChain();

  return langchainFlashcardGeneratorService(
    vectorStoreService,
    generateFlashcardsChain,
  );
};
