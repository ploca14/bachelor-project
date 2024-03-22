import type { FlashcardDeck } from "~/server/domain/flashcardDeck";
import type { VectorStoreService } from "~/server/services/vectorStoreService";
import type { GenerateFlashcardsChain } from "~/server/lib/langchain/generateFlashcardsChain";
import { parsePartialJsonMarkdown } from "~/server/utils/parseJsonMarkdown";

interface Callbacks {
  onProgress: (
    progress: DeepPartial<Array<{ front: string; back: string }>>,
  ) => Promise<void>;
  onSuccess: (
    flashcards: Array<{ front: string; back: string }>,
  ) => Promise<void>;
}

export interface FlashcardGeneratorService {
  generateFlashcards(
    flashcardDeck: FlashcardDeck,
    callbacks: Callbacks,
  ): Promise<void>;
}

const langchainFlashcardGeneratorService = (
  vectorStore: VectorStoreService,
  generateFlashcardsChain: GenerateFlashcardsChain,
): FlashcardGeneratorService => {
  const generateFlashcards = async (
    flashcardDeck: FlashcardDeck,
    callbacks: Callbacks,
  ) => {
    const documents = await vectorStore.getDocuments(flashcardDeck.fileIds);

    const completions = new Map<string, string>();

    await generateFlashcardsChain.batch(documents, {
      maxConcurrency: 5,
      callbacks: [
        {
          handleLLMNewToken: async (token, _idx, runId) => {
            const completion = (completions.get(runId) || "") + token;
            completions.set(runId, completion);

            await callbacks.onProgress(
              Array.from(completions.values(), (c) =>
                parsePartialJsonMarkdown(c),
              ).flat(),
            );
          },
        },
      ],
    });

    const results = Array.from(completions.values(), (c) =>
      parsePartialJsonMarkdown(c),
    ).flat();

    await callbacks.onSuccess(results);
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
