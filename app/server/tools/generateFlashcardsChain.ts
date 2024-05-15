import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Runnable, RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import type { BaseLanguageModel } from "@langchain/core/language_models/base";
import type { Document } from "@langchain/core/documents";
import type { DocumentBatcher } from "~/server/tools/documentBatcher";
import { formatDocumentsAsString } from "langchain/util/document";

export type GenerateFlashcardsChain = Runnable<Document[], string[]>;

const generateFlashcardsPromptTemplate = `You are an assistant for generating flashcards. Use the following piece of context to generate multiple flashcards. You must format your output in JSON format. Output only a list of objects. Each object should have the key "front" and "back".

The context:
{context}`;

export const simpleGenerateFlashcardsChain = (
  llm: BaseLanguageModel,
  documentBatcher: DocumentBatcher,
): GenerateFlashcardsChain => {
  const generateFlashcardsPrompt = ChatPromptTemplate.fromTemplate(
    generateFlashcardsPromptTemplate,
  );

  const mapChain = RunnableSequence.from([
    {
      context: (docs: Document[]) => {
        return formatDocumentsAsString(docs);
      },
    },
    generateFlashcardsPrompt,
    llm,
    new StringOutputParser(),
  ]);

  const chain = documentBatcher.pipe(mapChain.map());

  return chain;
};

/* v8 ignore start */
import { useChatModel } from "~/server/lib/langchain/chatModel";
import { useDocumentBatcher } from "~/server/tools/documentBatcher";

export const useGenerateFlashcardsChain = () => {
  const llm = useChatModel();
  const documentBatcher = useDocumentBatcher();

  return simpleGenerateFlashcardsChain(llm, documentBatcher);
};
