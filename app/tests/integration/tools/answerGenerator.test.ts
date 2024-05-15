import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mockDeep, type DeepMockProxy } from "vitest-mock-extended";
import {
  langchainAnswerGenerator,
  type AnswerGenerator,
} from "~/server/tools/answerGenerator";
import {
  FakeListChatModel,
  FakeLLM,
  FakeEmbeddings,
} from "@langchain/core/utils/testing";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { type RetrieverFactory } from "~/server/lib/langchain/retrieverFactory";
import {
  bufferedWindowCondenseHistoryChain,
  type CondenseHistoryChain,
} from "~/server/tools/condenseHistoryChain";
import {
  historyAwareTransformQueryChain,
  type TransformQueryChain,
} from "~/server/tools/transformQueryChain";
import {
  historyAwareGenerateAnswerChain,
  type GenerateAnswerChain,
} from "~/server/tools/generateAnswerChain";
import { Conversation } from "~/server/domain/conversation";
import { Message } from "~/server/domain/message";
import {
  simpleConversationalRetrievalChain,
  type ConversationalRetrievalChain,
} from "~/server/tools/conversationalRetrievalChain";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import type { Document } from "@langchain/core/documents";

const fakeResponses = ["capital of France", "France"];

describe("answerGenerator", () => {
  let service: AnswerGenerator;
  let llm: BaseLanguageModel;
  let embeddings: FakeEmbeddings;
  let vectorStore: MemoryVectorStore;
  let retrieverFactory: RetrieverFactory;
  let condenseHistoryChain: CondenseHistoryChain;
  let transformQueryChain: TransformQueryChain;
  let generateAnswerChain: GenerateAnswerChain;
  let conversationalRetrievalChain: ConversationalRetrievalChain;
  let llmStartCallback = vi.fn();
  let retrieverStartCallback = vi.fn();
  let docs: Document[];

  beforeEach(async () => {
    llm = new FakeListChatModel({
      responses: fakeResponses,
      callbacks: [
        {
          handleLLMStart: async (_llm, prompts) => {
            llmStartCallback(prompts);
          },
        },
      ],
    });

    embeddings = new FakeEmbeddings();
    docs = [{ pageContent: "Paris is the capital of France", metadata: {} }];
    vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
    retrieverFactory = {
      createForConversation(_conversation, k) {
        const retriever = vectorStore.asRetriever({
          k,
        });

        return retriever.withConfig({
          callbacks: [
            {
              handleRetrieverStart: async (_retriever, query) => {
                retrieverStartCallback(query);
              },
            },
          ],
        }) as any;
      },
    };
    condenseHistoryChain = bufferedWindowCondenseHistoryChain();
    transformQueryChain = historyAwareTransformQueryChain(llm);
    generateAnswerChain = historyAwareGenerateAnswerChain(llm);

    conversationalRetrievalChain = simpleConversationalRetrievalChain(
      retrieverFactory,
      condenseHistoryChain,
      transformQueryChain,
      generateAnswerChain,
    );

    service = langchainAnswerGenerator(conversationalRetrievalChain);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call the retriever with the correct query", async () => {
    const conversation = new Conversation("test", ["file-1"], "user1", [
      new Message("human", "What is the capital of France?", "conversation1"),
    ]);

    const callbacks = {
      onProgress: vi.fn(),
      onSuccess: vi.fn(),
      onError: vi.fn(),
    };

    await service.generateAnswer(conversation, callbacks);

    expect(retrieverStartCallback).toHaveBeenCalledWith("capital of France");
  });

  it("should call llm with the correct prompts", async () => {
    const conversation = new Conversation("test", ["file-1"], "user1", [
      new Message("human", "What is the capital of France?", "conversation1"),
    ]);

    const callbacks = {
      onProgress: vi.fn(),
      onSuccess: vi.fn(),
      onError: vi.fn(),
    };

    await service.generateAnswer(conversation, callbacks);

    expect(llmStartCallback).toHaveBeenNthCalledWith(1, [
      expect.stringContaining("generate a search query"),
    ]);
    expect(llmStartCallback).toHaveBeenNthCalledWith(2, [
      expect.stringContaining("answer the question"),
    ]);
  });

  it("should include the chat history in the transform query prompt", async () => {
    const conversation = new Conversation("test", ["file-1"], "user1", [
      new Message("human", "What is the capital of France?", "conversation1"),
    ]);

    const callbacks = {
      onProgress: vi.fn(),
      onSuccess: vi.fn(),
      onError: vi.fn(),
    };

    await service.generateAnswer(conversation, callbacks);

    expect(llmStartCallback).toHaveBeenNthCalledWith(1, [
      expect.stringContaining("generate a search query"),
    ]);
    expect(llmStartCallback).toHaveBeenNthCalledWith(1, [
      expect.stringContaining("What is the capital of France?"),
    ]);
  });

  it("should include the chat history in the generate answer prompt", async () => {
    const conversation = new Conversation("test", ["file-1"], "user1", [
      new Message("human", "What is the capital of France?", "conversation1"),
    ]);

    const callbacks = {
      onProgress: vi.fn(),
      onSuccess: vi.fn(),
      onError: vi.fn(),
    };

    await service.generateAnswer(conversation, callbacks);

    expect(llmStartCallback).toHaveBeenNthCalledWith(2, [
      expect.stringContaining("answer the question"),
    ]);
    expect(llmStartCallback).toHaveBeenNthCalledWith(2, [
      expect.stringContaining("What is the capital of France?"),
    ]);
  });

  it("should include the relevant documents in the generate answer prompt", async () => {
    const conversation = new Conversation("test", ["file-1"], "user1", [
      new Message("human", "What is the capital of France?", "conversation1"),
    ]);

    const callbacks = {
      onProgress: vi.fn(),
      onSuccess: vi.fn(),
      onError: vi.fn(),
    };

    await service.generateAnswer(conversation, callbacks);

    expect(llmStartCallback).toHaveBeenNthCalledWith(2, [
      expect.stringContaining("answer the question"),
    ]);
    expect(llmStartCallback).toHaveBeenNthCalledWith(2, [
      expect.stringContaining("Paris is the capital of France"),
    ]);
  });

  it("should condense the chat history", async () => {
    const id = "conversation1";
    const conversation = new Conversation(
      "test",
      ["file-1"],
      "user1",
      [
        new Message("human", "An old question", id),
        new Message("ai", "An old answer", id),
        new Message("human", "Who invented the telephone?", id),
        new Message("ai", "Alexander Graham Bell", id),
        new Message("human", "What is the speed of light in a vacuum?", id),
        new Message("ai", "299,792,458 m/s", id),
        new Message("human", "What is the main ingredient in guacamole?", id),
        new Message("ai", "Avocado", id),
        new Message("human", "What is the chemical symbol for water?", id),
        new Message("ai", "H2O", id),
        new Message("human", "Who painted the Mona Lisa?", id),
        new Message("ai", "Leonardo da Vinci", id),
        new Message("human", "What is the capital of France?", id),
      ],
      new Date(),
      id,
    );

    const callbacks = {
      onProgress: vi.fn(),
      onSuccess: vi.fn(),
      onError: vi.fn(),
    };

    await service.generateAnswer(conversation, callbacks);

    expect(llmStartCallback).not.toHaveBeenCalledWith([
      expect.stringContaining("An old question"),
    ]);
  });

  it("should call the onSuccess callback with the correct answer", async () => {
    const conversation = new Conversation("test", ["file-1"], "user1", [
      new Message("human", "What is the capital of France?", "conversation1"),
    ]);

    const callbacks = {
      onProgress: vi.fn(),
      onSuccess: vi.fn(),
      onError: vi.fn(),
    };

    await service.generateAnswer(conversation, callbacks);

    expect(callbacks.onSuccess).toHaveBeenCalledWith("France");
  });

  it("should call the onProgress callback with the correct chunks", async () => {
    const conversation = new Conversation("test", ["file-1"], "user1", [
      new Message("human", "What is the capital of France?", "conversation1"),
    ]);

    const callbacks = {
      onProgress: vi.fn(),
      onSuccess: vi.fn(),
      onError: vi.fn(),
    };

    await service.generateAnswer(conversation, callbacks);

    for (const chunk of "France") {
      expect(callbacks.onProgress).toHaveBeenCalledWith(chunk);
    }
  });

  it("should call the onError callback if the LLM throws an error", async () => {
    const conversation = new Conversation("test", ["file-1"], "user1", [
      new Message("human", "What is the capital of France?", "conversation1"),
    ]);

    const callbacks = {
      onProgress: vi.fn(),
      onSuccess: vi.fn(),
      onError: vi.fn(),
    };

    llm = new FakeLLM({
      thrownErrorString: "Test error",
    });

    transformQueryChain = historyAwareTransformQueryChain(llm);
    generateAnswerChain = historyAwareGenerateAnswerChain(llm);

    conversationalRetrievalChain = simpleConversationalRetrievalChain(
      retrieverFactory,
      condenseHistoryChain,
      transformQueryChain,
      generateAnswerChain,
    );

    service = langchainAnswerGenerator(conversationalRetrievalChain);

    await service.generateAnswer(conversation, callbacks);

    expect(callbacks.onError).toHaveBeenCalledWith(new Error("Test error"));
  });
});
