import type { SampleTest } from "~/server/domain/sampleTest";
import type { VectorStoreService } from "~/server/services/vectorStoreService";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { Document } from "@langchain/core/documents";
import {
  collapseDocs,
  splitListOfDocs,
} from "langchain/chains/combine_documents/reduce";
import { formatDocumentsAsString } from "langchain/util/document";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { BaseCallbackConfig } from "@langchain/core/callbacks/manager";
import { parsePartialJsonMarkdown } from "~/server/utils/parseJsonMarkdown";

interface Callbacks {
  onProgress: (progress: string) => Promise<void>;
  onSuccess: (questions: string[]) => Promise<void>;
}

export interface QuestionGeneratorService {
  generateQuestions(
    sampleTest: SampleTest,
    callbacks: Callbacks,
  ): Promise<void>;
}

const langchainQuestionGeneratorService = (
  vectorStore: VectorStoreService,
  llm: BaseLanguageModel,
): QuestionGeneratorService => {
  const generateQuestions = async (
    sampleTest: SampleTest,
    callbacks: Callbacks,
  ) => {
    const documents = await vectorStore.getDocuments(sampleTest.fileIds);

    // You must format your output in JSON. Output only a list of strings, each string should be a single SAQ.

    const summarizePrompt = ChatPromptTemplate.fromTemplate(
      "You are an assistant for generating exams for teachers. Use the\
 following piece of context to generate a personalised short answer\
 question (SAQ) exam. Output a list of SAQs.\n\
 \n\
 The context:\n\
 {context}",
    );

    const collapsePrompt = ChatPromptTemplate.fromTemplate(
      "Collapse this content:\n\n{context}",
    );

    const combinePrompt = ChatPromptTemplate.fromTemplate(
      'You are an assistant for generating exams for teachers. Use the\
 following questions to generate a personalised short answer\
 question (SAQ) exam with 20 questions. You must format your\
 output in JSON. Output only a list of objects. Each object should\
 represent a single SAQ and have the key "content".\n\
 \n\
 The context:\n\
 {context}',
    );

    // const summarizationChain = loadSummarizationChain(llm, {
    //   type: "map_reduce",
    //   combineMapPrompt,
    //   combinePrompt,
    //   combineLLM: llm,
    // });

    // const chain = summarizationChain
    //   .pipe(({ text }) => text)
    //   .pipe(new JsonOutputParser());

    // return chain.stream({
    //   input_documents: documents,
    // });

    // Define a function to get the number of tokens in a list of documents
    const getNumTokens = async (documents: Document[]): Promise<number> =>
      llm.getNumTokens(formatDocumentsAsString(documents));

    // Initialize the output parser
    const outputParser = new StringOutputParser();

    // Define the map chain to format, summarize, and parse the document
    const mapChain = RunnableSequence.from([
      { context: async (i: Document) => formatDocumentsAsString([i]) },
      summarizePrompt,
      llm,
      outputParser,
    ]);

    // Define the collapse chain to format, collapse, and parse a list of documents
    const collapseChain = RunnableSequence.from([
      {
        context: async (documents: Document[]) =>
          formatDocumentsAsString(documents),
      },
      collapsePrompt,
      llm,
      outputParser,
    ]);

    const collapse = async (
      documents: Document[],
      options?: {
        config?: BaseCallbackConfig;
      },
      tokenMax = 4000,
    ) => {
      let docs = documents;
      let collapseCount = 1;
      while ((await getNumTokens(docs)) > tokenMax) {
        const splitDocs = splitListOfDocs(docs, getNumTokens, tokenMax);
        docs = await Promise.all(
          splitDocs.map((doc) => collapseDocs(doc, collapseChain.invoke)),
        );
        collapseCount += 1;
      }
      return docs;
    };

    const reduceChain = RunnableSequence.from([
      { context: formatDocumentsAsString },
      combinePrompt,
      llm,
      outputParser,
    ]);

    const mapReduceChain = RunnableSequence.from([
      RunnableSequence.from([
        { doc: new RunnablePassthrough(), content: mapChain },
        (input) =>
          new Document({
            pageContent: input.content,
            metadata: input.doc.metadata,
          }),
      ]).map(),
      collapse,
      reduceChain,
    ]);

    const stream = await mapReduceChain.stream(documents);

    let completion = "";
    for await (const data of stream) {
      completion += data;
      await callbacks.onProgress(completion);
    }

    const results =
      parsePartialJsonMarkdown<Array<{ content: string }>>(completion);

    await callbacks.onSuccess(results?.map(({ content }) => content) ?? []);
  };

  return {
    generateQuestions,
  };
};

import { useVectorStoreService } from "~/server/services/vectorStoreService";
import { useChatModel } from "~/server/lib/langchain/chatModel";

export const useQuestionGeneratorService = () => {
  const vectorStoreService = useVectorStoreService();
  const llm = useChatModel();

  return langchainQuestionGeneratorService(vectorStoreService, llm);
};
