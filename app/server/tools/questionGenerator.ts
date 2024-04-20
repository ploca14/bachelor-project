import type { SampleTest } from "~/server/domain/sampleTest";
import type { VectorStore } from "~/server/tools/vectorStore";
import type { GenerateQuestionsChain } from "~/server/lib/langchain/generateQuestionsChain";
import { parsePartialJsonMarkdown } from "~/server/utils/parseJsonMarkdown";
import { z } from "zod";

interface Callbacks {
  onProgress: (
    progress: DeepPartial<Array<{ content: string } | null>>,
  ) => Promise<void>;
  onSuccess: (questions: Array<{ content: string }>) => Promise<void>;
  onError: (error: Error) => Promise<void>;
}

export interface QuestionGenerator {
  generateQuestions(
    sampleTest: SampleTest,
    callbacks: Callbacks,
  ): Promise<void>;
}

export const langchainQuestionGenerator = (
  vectorStore: VectorStore,
  generateQuestionsChain: GenerateQuestionsChain,
): QuestionGenerator => {
  const questionSchema = z.object({
    content: z.string(),
  });

  const generateQuestions = async (
    sampleTest: SampleTest,
    callbacks: Callbacks,
  ) => {
    try {
      const documents = await vectorStore.getDocuments(sampleTest.fileIds);

      const stream = await generateQuestionsChain.stream(documents);

      let completion = "";

      for await (const data of stream) {
        completion += data;
        await callbacks.onProgress(parsePartialCompletion(completion));
      }

      await callbacks.onSuccess(parseCompletion(completion));
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        await callbacks.onError(error);
      }
    }
  };

  const parsePartialCompletion = (completion: string) => {
    const schema = z.array(questionSchema.partial().nullish()).nullish();

    return schema.parse(parsePartialJsonMarkdown(completion)) ?? [];
  };

  const parseCompletion = (completion: string) => {
    const parsedCompletion = parsePartialCompletion(completion);

    return parsedCompletion
      .filter((c) => questionSchema.safeParse(c).success)
      .map((c) => questionSchema.parse(c));
  };

  return {
    generateQuestions,
  };
};

import { useVectorStore } from "~/server/tools/vectorStore";
import { useGenerateQuestionsChain } from "~/server/lib/langchain/generateQuestionsChain";

export const useQuestionGenerator = () => {
  const vectorStore = useVectorStore();
  const generateQuestionsChain = useGenerateQuestionsChain();

  return langchainQuestionGenerator(vectorStore, generateQuestionsChain);
};
