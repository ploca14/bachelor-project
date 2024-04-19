import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import {
  langchainQuestionGeneratorService,
  type QuestionGeneratorService,
} from "~/server/services/questionGeneratorService";
import type { VectorStoreService } from "~/server/services/vectorStoreService";
import {
  simpleGenerateQuestionsChain,
  type GenerateQuestionsChain,
} from "~/server/lib/langchain/generateQuestionsChain";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { FakeListChatModel, FakeLLM } from "@langchain/core/utils/testing";
import { SampleTest } from "~/server/domain/sampleTest";
import type { Document } from "@langchain/core/documents";
import {
  simpleDocumentBatcher,
  type DocumentBatcher,
} from "~/server/lib/langchain/documentBatcher";

const fakeResponses = [`What is the capital of France?`];

describe("questionGeneratorService", () => {
  let service: QuestionGeneratorService;
  let vectorStoreMock: MockProxy<VectorStoreService>;
  let generateQuestionsChain: GenerateQuestionsChain;
  let documentBatcher: DocumentBatcher;
  let llm: BaseLanguageModel;
  let llmStartCallback = vi.fn();
  let docs: Document[];

  beforeEach(() => {
    llm = new FakeListChatModel({
      responses: fakeResponses,
      callbacks: [
        {
          handleLLMStart: async (_llm, prompts) => {
            console.log("====PROMPT====\n\n", prompts[0]);
            llmStartCallback(prompts);
          },
        },
      ],
    });
    documentBatcher = simpleDocumentBatcher({
      charsPerToken: 1,
      maxTokensPerBatch: 250,
    });

    generateQuestionsChain = simpleGenerateQuestionsChain(llm, documentBatcher);

    vectorStoreMock = mock<VectorStoreService>();
    docs = [
      { pageContent: "Paris is the capital of France", metadata: {} },
      { pageContent: "Leonardo da Vinci painted the Mona Lisa", metadata: {} },
      { pageContent: "H2O is the chemical symbol for water", metadata: {} },
    ];

    vectorStoreMock.getDocuments.mockResolvedValue(docs);

    service = langchainQuestionGeneratorService(
      vectorStoreMock,
      generateQuestionsChain,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call the vector store service with the correct file IDs", async () => {
    const sampleTest = new SampleTest(
      "Test Sample Test",
      "pending",
      ["file-id-1", "file-id-2"],
      "user-id-1",
      [],
      new Date(),
    );

    const callbacks = {
      onProgress: vi.fn(),
      onSuccess: vi.fn(),
      onError: vi.fn(),
    };

    await service.generateQuestions(sampleTest, callbacks);

    expect(vectorStoreMock.getDocuments).toHaveBeenCalledWith([
      "file-id-1",
      "file-id-2",
    ]);
  });

  it("should call the LLM with the correct prompts", async () => {
    const sampleTest = new SampleTest(
      "Test Sample Test",
      "pending",
      ["file-id-1", "file-id-2"],
      "user-id-1",
      [],
      new Date(),
    );

    const callbacks = {
      onProgress: vi.fn(),
      onSuccess: vi.fn(),
      onError: vi.fn(),
    };

    await service.generateQuestions(sampleTest, callbacks);

    expect(llmStartCallback).toHaveBeenCalledWith([
      expect.stringContaining("generate multiple flashcards"),
    ]);
  });

  // it("should call the llm for each document", async () => {
  //   const sampleTest = new SampleTest(
  //     "Test Sample Test",
  //     "pending",
  //     ["file-id-1", "file-id-2"],
  //     "user-id-1",
  //     [],
  //     new Date(),
  //   );

  //   const callbacks = {
  //     onProgress: vi.fn(),
  //     onSuccess: vi.fn(),
  //     onError: vi.fn(),
  //   };

  //   await service.generateQuestions(sampleTest, callbacks);

  //   for (const [idx, doc] of docs.entries()) {
  //     expect(llmStartCallback).toHaveBeenNthCalledWith(idx + 1, [
  //       expect.stringContaining(doc.pageContent),
  //     ]);
  //   }
  //   expect(llmStartCallback).toHaveBeenCalledTimes(docs.length);
  // });

  // it("should call the onSuccess callback with the generated flashcards", async () => {
  //   const sampleTest = new SampleTest(
  //     "Test Sample Test",
  //     "pending",
  //     ["file-id-1", "file-id-2"],
  //     "user-id-1",
  //     [],
  //     new Date(),
  //   );

  //   const callbacks = {
  //     onProgress: vi.fn(),
  //     onSuccess: vi.fn(),
  //     onError: vi.fn(),
  //   };

  //   await service.generateQuestions(sampleTest, callbacks);

  //   expect(callbacks.onSuccess).toHaveBeenCalledWith([
  //     { front: "What is the capital of France?", back: "Paris" },
  //     { front: "Who painted the Mona Lisa?", back: "Leonardo da Vinci" },
  //     { front: "What is the chemical symbol for water?", back: "H2O" },
  //   ]);
  //   expect(callbacks.onError).not.toHaveBeenCalled();
  // });

  // it("should call the onProgress callback with the updated progress", async () => {
  //   const sampleTest = new SampleTest(
  //     "Test Sample Test",
  //     "pending",
  //     ["file-id-1", "file-id-2"],
  //     "user-id-1",
  //     [],
  //     new Date(),
  //   );

  //   const callbacks = {
  //     onProgress: vi.fn(),
  //     onSuccess: vi.fn(),
  //     onError: vi.fn(),
  //   };

  //   await service.generateQuestions(sampleTest, callbacks);

  //   expect(callbacks.onProgress).toHaveBeenCalledWith([null, null, null]);

  //   expect(callbacks.onProgress).toHaveBeenCalledWith([
  //     { front: "What is the capital of Fra" },
  //     { front: "Who painted the Mona Lisa?" },
  //     { front: "What is the chemical symbo" },
  //   ]);

  //   expect(callbacks.onProgress).toHaveBeenCalledWith([
  //     { front: "What is the capital of France?", back: "Paris" },
  //     { front: "Who painted the Mona Lisa?", back: "Leonardo da Vinci" },
  //     { front: "What is the chemical symbol for water?", back: "H2O" },
  //   ]);

  //   expect(callbacks.onError).not.toHaveBeenCalled();
  // });

  // it("should call the onError callback if the vector store throws an error", async () => {
  //   vectorStoreMock.getDocuments.mockRejectedValue(new Error("Test error"));

  //   const sampleTest = new SampleTest(
  //     "Test Sample Test",
  //     "pending",
  //     ["file-id-1", "file-id-2"],
  //     "user-id-1",
  //     [],
  //     new Date(),
  //   );

  //   const callbacks = {
  //     onProgress: vi.fn(),
  //     onSuccess: vi.fn(),
  //     onError: vi.fn(),
  //   };

  //   await service.generateQuestions(sampleTest, callbacks);

  //   expect(callbacks.onProgress).not.toHaveBeenCalled();
  //   expect(callbacks.onSuccess).not.toHaveBeenCalled();
  //   expect(callbacks.onError).toHaveBeenCalledWith(new Error("Test error"));
  // });

  // it("should call the onError callback if the LLM throws an error", async () => {
  //   const sampleTest = new SampleTest(
  //     "Test Sample Test",
  //     "pending",
  //     ["file-id-1", "file-id-2"],
  //     "user-id-1",
  //     [],
  //     new Date(),
  //   );

  //   const callbacks = {
  //     onProgress: vi.fn(),
  //     onSuccess: vi.fn(),
  //     onError: vi.fn(),
  //   };

  //   llm = new FakeLLM({
  //     thrownErrorString: "Test error",
  //   });

  //   generateQuestionsChain = simpleGenerateQuestionsChain(llm, documentBatcher);

  //   service = langchainQuestionGeneratorService(
  //     vectorStoreMock,
  //     generateQuestionsChain,
  //   );

  //   await service.generateQuestions(sampleTest, callbacks);

  //   expect(callbacks.onProgress).not.toHaveBeenCalled();
  //   expect(callbacks.onSuccess).not.toHaveBeenCalled();
  //   expect(callbacks.onError).toHaveBeenCalledWith(new Error("Test error"));
  // });
});
