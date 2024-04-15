import { describe, expect, it, beforeEach, vi } from "vitest";
import { mockDeep, type DeepMockProxy } from "vitest-mock-extended";
import {
  langchainAnswerGeneratorService,
  type AnswerGeneratorService,
} from "~/server/services/answerGeneratorService";
import {
  FakeListChatModel,
  FakeLLM,
  FakeEmbeddings,
} from "@langchain/core/utils/testing";
import type { VectorStore } from "@langchain/core/vectorstores";
import type { Embeddings } from "@langchain/core/embeddings";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseVectorStore } from "~/server/lib/langchain/vectorStore";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import {
  supabaseRetrieverFilterFactory,
  type RetrieverFilterFactory,
} from "~/server/lib/langchain/retrieverFilterFactory";
import {
  bufferedWindowCondenseHistoryChain,
  type CondenseHistoryChain,
} from "~/server/lib/langchain/condenseHistoryChain";
import {
  historyAwareTransformQueryChain,
  type TransformQueryChain,
} from "~/server/lib/langchain/transformQueryChain";
import {
  historyAwareGenerateAnswerChain,
  type GenerateAnswerChain,
} from "~/server/lib/langchain/generateAnswerChain";

const fakeResponses = [];

describe("answerGeneratorService", () => {
  let service: AnswerGeneratorService;
  let embeddings: Embeddings;
  let client: DeepMockProxy<SupabaseClient>;
  let vectorStore: VectorStore;
  let llm: BaseChatModel;
  let retrieverFilterFactory: RetrieverFilterFactory;
  let condenseHistoryChain: CondenseHistoryChain;
  let transformQueryChain: TransformQueryChain;
  let generateAnswerChain: GenerateAnswerChain;

  beforeEach(() => {
    embeddings = new FakeEmbeddings();
    client = mockDeep<SupabaseClient>();
    vectorStore = supabaseVectorStore(embeddings, client);

    llm = new FakeListChatModel({
      responses: ["Test response"],
    });

    retrieverFilterFactory = supabaseRetrieverFilterFactory();
    condenseHistoryChain = bufferedWindowCondenseHistoryChain();
    transformQueryChain = historyAwareTransformQueryChain(llm);
    generateAnswerChain = historyAwareGenerateAnswerChain(llm);

    service = langchainAnswerGeneratorService(
      vectorStore,
      retrieverFilterFactory,
      condenseHistoryChain,
      transformQueryChain,
      generateAnswerChain,
    );
  });

  it("should call the LLM with the correct prompts", async () => {
    throw new Error("Not implemented");
  });

  it("should call the onSuccess callback with the correct answer", async () => {
    throw new Error("Not implemented");
  });

  it("should call the onProgress callback with updated progress", async () => {
    throw new Error("Not implemented");
  });

  it("should call the onError callback if the LLM throws an error", async () => {
    throw new Error("Not implemented");
  });

  it("should call the onError callback if the retriever throws an error", async () => {
    throw new Error("Not implemented");
  });
});
