import type { FlashcardDeck } from "~/server/domain/flashcardDeck";
import type { VectorStoreService } from "~/server/services/vectorStoreService";
import type { GenerateFlashcardsChain } from "~/server/lib/langchain/generateFlashcardsChain";
import type { EventBus } from "~/server/services/eventBus";
import { parsePartialJsonMarkdown } from "~/server/utils/parseJsonMarkdown";

export interface FlashcardGeneratorService {
  generateFlashcards(
    flashcardDeck: FlashcardDeck,
  ): Promise<{ front: string; back: string }[]>;
}

const langchainFlashcardGeneratorService = (
  vectorStore: VectorStoreService,
  generateFlashcardsChain: GenerateFlashcardsChain,
  eventBus: EventBus,
): FlashcardGeneratorService => {
  const generateFlashcards = async (flashcardDeck: FlashcardDeck) => {
    const documents = await vectorStore.getDocuments(flashcardDeck.fileIds);

    const completions = new Map<string, string>();

    await generateFlashcardsChain.batch(documents, {
      maxConcurrency: 5,
      callbacks: [
        {
          handleLLMNewToken: async (token, _idx, runId) => {
            const completion = (completions.get(runId) || "") + token;
            completions.set(runId, completion);

            await eventBus.publish(
              `flashcardDeck:${flashcardDeck.id}:progress`,
              Array.from(completions.values(), (c) =>
                parsePartialJsonMarkdown(c),
              ),
            );
          },
        },
      ],
    });

    await eventBus.publish(`flashcardDeck:${flashcardDeck.id}:complete`);

    const results = Array.from(completions.values(), (c) =>
      parsePartialJsonMarkdown(c),
    );

    // # TODO: Make typesafe
    return (results as any).flat();
  };

  return {
    generateFlashcards,
  };
};

import { useVectorStoreService } from "~/server/services/vectorStoreService";
import { useGenerateFlashcardsChain } from "~/server/lib/langchain/generateFlashcardsChain";
import { useEventBus } from "~/server/services/eventBus";

export const useFlashcardGeneratorService = () => {
  const vectorStoreService = useVectorStoreService();
  const generateFlashcardsChain = useGenerateFlashcardsChain();
  const eventBus = useEventBus();

  return langchainFlashcardGeneratorService(
    vectorStoreService,
    generateFlashcardsChain,
    eventBus,
  );
};
