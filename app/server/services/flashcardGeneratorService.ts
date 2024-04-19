import type { FlashcardDeck } from "~/server/domain/flashcardDeck";
import type { VectorStoreService } from "~/server/services/vectorStoreService";
import type { GenerateFlashcardsChain } from "~/server/lib/langchain/generateFlashcardsChain";
import { parsePartialJsonMarkdown } from "~/server/utils/parseJsonMarkdown";

import { z } from "zod";

interface Callbacks {
  onProgress: (
    progress: DeepPartial<Array<{ front: string; back: string } | null>>,
  ) => Promise<void>;
  onSuccess: (
    flashcards: Array<{ front: string; back: string }>,
  ) => Promise<void>;
  onError: (error: Error) => Promise<void>;
}

export interface FlashcardGeneratorService {
  generateFlashcards(
    flashcardDeck: FlashcardDeck,
    callbacks: Callbacks,
  ): Promise<void>;
}

export const langchainFlashcardGeneratorService = (
  vectorStore: VectorStoreService,
  generateFlashcardsChain: GenerateFlashcardsChain,
): FlashcardGeneratorService => {
  const flashcardSchema = z.object({
    front: z.string(),
    back: z.string(),
  });

  const generateFlashcards = async (
    flashcardDeck: FlashcardDeck,
    callbacks: Callbacks,
  ) => {
    try {
      const documents = await vectorStore.getDocuments(flashcardDeck.fileIds);

      const completions = new Map<string, string>();

      await generateFlashcardsChain.invoke(documents, {
        callbacks: [
          {
            async handleLLMNewToken(token, _idx, runId) {
              const completion = (completions.get(runId) || "") + token;
              completions.set(runId, completion);
              await callbacks.onProgress(
                parsePartialCompletions(completions.values()),
              );
            },
          },
        ],
      });

      await callbacks.onSuccess(parseCompletions(completions.values()));
    } catch (error) {
      if (error instanceof Error) {
        await callbacks.onError(error);
      }
    }
  };

  const parsePartialCompletions = (completions: Iterable<string>) => {
    const schema = z.array(flashcardSchema.partial().nullish()).nullish();

    return Array.from(completions, (c) =>
      schema.parse(parsePartialJsonMarkdown(c)),
    ).flat();
  };

  const parseCompletions = (completions: Iterable<string>) => {
    const parsedCompletions = parsePartialCompletions(completions);

    return parsedCompletions
      .filter((c) => flashcardSchema.safeParse(c).success)
      .map((c) => flashcardSchema.parse(c));
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
