import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  Runnable,
  RunnableLambda,
  RunnableSequence,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import type { BaseLanguageModel } from "@langchain/core/language_models/base";
import { Document } from "@langchain/core/documents";
import { formatDocumentsAsString } from "langchain/util/document";
import type { DocumentBatcher } from "~/server/tools/documentBatcher";
import { collapseDocs } from "langchain/chains/combine_documents/reduce";

export type GenerateQuestionsChain = Runnable<Document[], string>;

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

export const simpleGenerateQuestionsChain = (
  llm: BaseLanguageModel,
  documentBatcher: DocumentBatcher,
): GenerateQuestionsChain => {
  const summarizePrompt = ChatPromptTemplate.fromTemplate(
    summarizePromptTemplate,
  );

  const collapsePrompt = ChatPromptTemplate.fromTemplate(
    collapsePromptTemplate,
  );

  const combinePrompt = ChatPromptTemplate.fromTemplate(combinePromptTemplate);

  const outputParser = new StringOutputParser();

  const mapChain = RunnableSequence.from([
    { context: (docs: Document[]) => formatDocumentsAsString(docs) },
    summarizePrompt,
    llm,
    outputParser,
  ]);

  const collapseChain = RunnableSequence.from([
    {
      context: (documents: Document[]) => formatDocumentsAsString(documents),
    },
    collapsePrompt,
    llm,
    outputParser,
  ]);

  const collapse = RunnableLambda.from(async (docs: Document[]) => {
    let batches = await documentBatcher.invoke(docs);

    while (batches.length > 1) {
      const collapsedBatches = await Promise.all(
        batches.map((batch) => {
          return collapseDocs(batch, (docs) => collapseChain.invoke(docs));
        }),
      );
      batches = await documentBatcher.invoke(collapsedBatches);
    }

    return batches.flat();
  });

  const reduceChain = RunnableSequence.from([
    { context: formatDocumentsAsString },
    combinePrompt,
    llm,
    outputParser,
  ]);

  const chain = RunnableSequence.from([
    documentBatcher,
    RunnableLambda.from((batch: Document[]) => {
      return collapseDocs(batch, (docs) => mapChain.invoke(docs));
    }).map(),
    collapse,
    reduceChain,
  ]);

  return chain;
};

/* v8 ignore start */
import { useChatModel } from "~/server/lib/langchain/chatModel";
import { useDocumentBatcher } from "~/server/tools/documentBatcher";

export const useGenerateQuestionsChain = () => {
  const llm = useChatModel();
  const documentBatcher = useDocumentBatcher();

  return simpleGenerateQuestionsChain(llm, documentBatcher);
};
