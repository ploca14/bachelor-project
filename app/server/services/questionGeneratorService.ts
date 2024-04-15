import type { SampleTest } from "~/server/domain/sampleTest";
import type { VectorStoreService } from "~/server/services/vectorStoreService";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnableSequence,
  RunnablePassthrough,
  RunnableLambda,
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
import { z } from "zod";

interface Callbacks {
  onProgress: (
    progress: DeepPartial<Array<{ content: string }>>,
  ) => Promise<void>;
  onSuccess: (questions: Array<{ content: string }>) => Promise<void>;
  onError: (error: Error) => Promise<void>;
}

export interface QuestionGeneratorService {
  generateQuestions(
    sampleTest: SampleTest,
    callbacks: Callbacks,
  ): Promise<void>;
}

const summarizePromptTemplate = `Given the following text excerpt from a larger document:

{context}

1. Identify and list the key concepts and facts (principles, dates, definitions, and any critical information relevant to the subject matter) presented in this excerpt.
2. For each key concept and fact, without any references to the excerpt, formulate a short answer question for a practice exam that effectively tests a student's understanding of the material.
3. Provide a brief explanation for why each question is relevant to the excerpt's content.

Present your answers in a structured format:
  
- [Key Concept/Fact]
  - Short Answer Question: [Corresponding Short Answer Question]
  - Relevance: [Explanation]
`;

const collapsePromptTemplate = `Given the following list of key contepts, short answer questions and explanations why a question is relevant:

{context}

Compress the list by removing duplicates, merging similar questions, and retaining only those that cover a broad range of the key concepts, ensuring a comprehensive yet concise set for a practice exam.

Present your answers in a structured format:
- [Key Concept/Fact]
  - Short Answer Question: [Corresponding Short Answer Question]
  - Relevance: [Explanation]
`;

const combinePromptTemplate = `Given the following sets of Short Answer Questions (SAQs) generated from multiple document chunks:

{context}

1. Organize these SAQs into a logically structured practice exam. Ensure the questions flow in a manner that reflects the structure of the original document, covering all its key concepts comprehensively.
2. Ensure no duplication and maintain clarity and focus in each question.
3. Do not number the questions; the final output should be a list of questions without any numbering.
4. Format the final output into a JSON list of objects where each object represents a single SAQ with a single key \`content\`.`;

const langchainQuestionGeneratorService = (
  vectorStore: VectorStoreService,
  llm: BaseLanguageModel,
): QuestionGeneratorService => {
  const generateQuestions = async (
    sampleTest: SampleTest,
    callbacks: Callbacks,
  ) => {
    const documents = await vectorStore.getDocuments(sampleTest.fileIds);

    const summarizePrompt = ChatPromptTemplate.fromTemplate(
      summarizePromptTemplate,
    );

    const collapsePrompt = ChatPromptTemplate.fromTemplate(
      collapsePromptTemplate,
    );

    const combinePrompt = ChatPromptTemplate.fromTemplate(
      combinePromptTemplate,
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
    // const getNumTokens = async (documents: Document[]): Promise<number> =>
    //   llm.getNumTokens(formatDocumentsAsString(documents));

    const getNumTokens = (documents: Document[]) => {
      return formatDocumentsAsString(documents).length / 4;
    };

    const batches = splitListOfDocs(documents, getNumTokens, 5000);

    const docs = await Promise.all(
      batches.map((batch) => {
        return collapseDocs(batch, async (docs) =>
          formatDocumentsAsString(docs),
        );
      }),
    );

    // Initialize the output parser
    const outputParser = new StringOutputParser();

    // Define the map chain to format, summarize, and parse the document
    const mapChain = RunnableSequence.from([
      { context: async (i: Document) => i.pageContent },
      summarizePrompt,
      llm,
      outputParser,
    ]);

    // Define the collapse chain to format, collapse, and parse a list of documents
    const collapseChain = RunnableSequence.from([
      {
        context: (documents: Document[]) => formatDocumentsAsString(documents),
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
      while (getNumTokens(docs) > tokenMax) {
        const splitDocs = splitListOfDocs(docs, getNumTokens, tokenMax);

        docs = await Promise.all(
          splitDocs.map((docs) =>
            collapseDocs(docs, (doc) => collapseChain.invoke(doc)),
          ),
        );
      }
      return docs;
    };

    // const collapse = RunnableLambda.from(
    //   async (documents: Document[], options) => {
    //     const tokenMax = 4000;
    //     let docs = documents;
    //     let collapseCount = 1;
    //     while ((await getNumTokens(docs)) > tokenMax) {
    //       const splitDocs = splitListOfDocs(docs, getNumTokens, tokenMax);
    //       docs = await Promise.all(
    //         splitDocs.map((doc) => collapseDocs(doc, collapseChain.invoke)),
    //       );
    //       collapseCount += 1;
    //     }
    //     return docs;
    //   },
    // );

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

    try {
      const stream = await mapReduceChain.stream(docs);
      let completion = "";
      for await (const data of stream) {
        completion += data;
        callbacks.onProgress(parsePartialJsonMarkdown(completion));
      }

      const parsedCompletion = parsePartialJsonMarkdown(completion);

      const schema = z.object({
        content: z.string(),
      });

      if (!Array.isArray(parsedCompletion)) {
        throw new Error("Invalid completion format");
      }

      const result = parsedCompletion
        .filter((c) => {
          return schema.safeParse(c).success;
        })
        .map((c) => schema.parse(c));

      await callbacks.onSuccess(result);
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        await callbacks.onError(error);
      }
    }
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
