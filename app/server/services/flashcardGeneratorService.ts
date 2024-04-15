import type { FlashcardDeck } from "~/server/domain/flashcardDeck";
import type { VectorStoreService } from "~/server/services/vectorStoreService";
import type { GenerateFlashcardsChain } from "~/server/lib/langchain/generateFlashcardsChain";
import { parsePartialJsonMarkdown } from "~/server/utils/parseJsonMarkdown";
import { Document } from "@langchain/core/documents";
import { z } from "zod";

interface Callbacks {
  onProgress: (
    progress: DeepPartial<Array<{ front: string; back: string }>>,
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
  const generateFlashcards = async (
    flashcardDeck: FlashcardDeck,
    callbacks: Callbacks,
  ) => {
    try {
      const documents = await vectorStore.getDocuments(flashcardDeck.fileIds);

      const getNumTokens = (documents: Document[]) => {
        return formatDocumentsAsString(documents).length / 4;
      };

      const batches = splitListOfDocs(documents, getNumTokens, 5000);

      const completions = new Map<string, string>();

      const parseCompletions = () => {
        return Array.from(completions.values(), (c) =>
          parsePartialJsonMarkdown(c),
        ).flat();
      };

      await generateFlashcardsChain.batch(batches, {
        maxConcurrency: 5,
        callbacks: [
          {
            async handleLLMNewToken(token, _idx, runId) {
              const completion = (completions.get(runId) || "") + token;
              completions.set(runId, completion);

              await callbacks.onProgress(parseCompletions());
            },
          },
        ],
      });

      const parsedCompletions = parseCompletions();

      const schema = z.object({
        front: z.string(),
        back: z.string(),
      });

      const result = parsedCompletions
        .filter((c) => {
          return schema.safeParse(c).success;
        })
        .map((c) => schema.parse(c));

      await callbacks.onSuccess(result);
    } catch (error) {
      if (error instanceof Error) {
        await callbacks.onError(error);
      }
    }
  };

  return {
    generateFlashcards,
  };
};

import { useVectorStoreService } from "~/server/services/vectorStoreService";
import { useGenerateFlashcardsChain } from "~/server/lib/langchain/generateFlashcardsChain";
import { splitListOfDocs } from "langchain/chains/combine_documents/reduce";
import { formatDocumentsAsString } from "langchain/util/document";

export const useFlashcardGeneratorService = () => {
  const vectorStoreService = useVectorStoreService();
  const generateFlashcardsChain = useGenerateFlashcardsChain();

  return langchainFlashcardGeneratorService(
    vectorStoreService,
    generateFlashcardsChain,
  );
};
