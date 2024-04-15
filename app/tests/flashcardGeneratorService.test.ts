import { describe, expect, it, beforeEach, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import {
  langchainFlashcardGeneratorService,
  type FlashcardGeneratorService,
} from "~/server/services/flashcardGeneratorService";
import type { VectorStoreService } from "~/server/services/vectorStoreService";
import {
  simpleGenerateFlashcardsChain,
  type GenerateFlashcardsChain,
} from "~/server/lib/langchain/generateFlashcardsChain";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { FakeListChatModel, FakeLLM } from "@langchain/core/utils/testing";
import { FlashcardDeck } from "~/server/domain/flashcardDeck";
// import { generateFlashcardsPrompt } from "~/server/lib/langchain/generateFlashcardsChain";
import type { Document } from "@langchain/core/documents";

const fakeResponses = [
  `\`\`\`json
  [
    {"front": "What is the capital of France?", "back": "Paris"}
  ]
  \`\`\``,
  `\`\`\`json
  [
    {"front": "Who painted the Mona Lisa?", "back": "Leonardo da Vinci"}
  ]
  \`\`\``,
  `\`\`\`json
  [
    {"front": "What is the chemical symbol for water?", "back": "H2O"}
  ]
  \`\`\``,
];

describe("flashcardGeneratorService", () => {
  let service: FlashcardGeneratorService;
  let vectorStoreMock: MockProxy<VectorStoreService>;
  let generateFlashcardsChain: GenerateFlashcardsChain;
  let llm: BaseLanguageModel;
  let llmStartCallback = vi.fn();
  let docs: Document[];

  beforeEach(() => {
    vectorStoreMock = mock<VectorStoreService>();
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

    docs = [
      { pageContent: "Paris is the capital of France", metadata: {} },
      { pageContent: "Leonardo da Vinci painted the Mona Lisa", metadata: {} },
      { pageContent: "H2O is the chemical symbol for water", metadata: {} },
    ];

    generateFlashcardsChain = simpleGenerateFlashcardsChain(llm);

    service = langchainFlashcardGeneratorService(
      vectorStoreMock,
      generateFlashcardsChain,
    );
  });

  it("should call the LLM with the correct prompts", async () => {
    vectorStoreMock.getDocuments.mockResolvedValue(docs);

    const flashcardDeck = new FlashcardDeck(
      "Test Flashcard Deck",
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

    await service.generateFlashcards(flashcardDeck, callbacks);

    expect(vectorStoreMock.getDocuments).toHaveBeenCalledWith(
      flashcardDeck.fileIds,
    );

    for (const doc of docs) {
      expect(llmStartCallback).toHaveBeenCalledWith([
        `Human: You are an assistant for generating flashcards. Use the following piece of context to generate multiple flashcards. You must format your output in JSON format. Output only a list of objects. Each object should have the key "front" and "back".\n\nThe context:\n${doc.pageContent}`,
      ]);
    }
  });

  it("should call the onSuccess callback with the generated flashcards", async () => {
    vectorStoreMock.getDocuments.mockResolvedValue(docs);

    const flashcardDeck = new FlashcardDeck(
      "Test Flashcard Deck",
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

    await service.generateFlashcards(flashcardDeck, callbacks);

    expect(vectorStoreMock.getDocuments).toHaveBeenCalledWith(
      flashcardDeck.fileIds,
    );

    expect(callbacks.onSuccess).toHaveBeenCalledWith([
      { front: "What is the capital of France?", back: "Paris" },
      { front: "Who painted the Mona Lisa?", back: "Leonardo da Vinci" },
      { front: "What is the chemical symbol for water?", back: "H2O" },
    ]);
    expect(callbacks.onError).not.toHaveBeenCalled();
  });

  it("should call the onProgress callback with the updated progress", async () => {
    vectorStoreMock.getDocuments.mockResolvedValue(docs);

    const flashcardDeck = new FlashcardDeck(
      "Test Flashcard Deck",
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

    await service.generateFlashcards(flashcardDeck, callbacks);

    expect(vectorStoreMock.getDocuments).toHaveBeenCalledWith(
      flashcardDeck.fileIds,
    );

    expect(callbacks.onProgress).toHaveBeenCalledWith([null, null, null]);

    expect(callbacks.onProgress).toHaveBeenCalledWith([
      { front: "What is the capital of Fra" },
      { front: "Who painted the Mona Lisa?" },
      { front: "What is the chemical symbo" },
    ]);

    expect(callbacks.onProgress).toHaveBeenCalledWith([
      { front: "What is the capital of France?", back: "Paris" },
      { front: "Who painted the Mona Lisa?", back: "Leonardo da Vinci" },
      { front: "What is the chemical symbol for water?", back: "H2O" },
    ]);

    expect(callbacks.onError).not.toHaveBeenCalled();
  });

  it("should call the onError callback if the vector store throws an error", async () => {
    vectorStoreMock.getDocuments.mockRejectedValue(new Error("Test error"));

    const flashcardDeck = new FlashcardDeck(
      "Test Flashcard Deck",
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

    await service.generateFlashcards(flashcardDeck, callbacks);

    expect(vectorStoreMock.getDocuments).toHaveBeenCalledWith(
      flashcardDeck.fileIds,
    );

    expect(callbacks.onProgress).not.toHaveBeenCalled();
    expect(callbacks.onSuccess).not.toHaveBeenCalled();
    expect(callbacks.onError).toHaveBeenCalledWith(new Error("Test error"));
  });

  it("should call the onError callback if the LLM throws an error", async () => {
    vectorStoreMock.getDocuments.mockResolvedValue(docs);

    const flashcardDeck = new FlashcardDeck(
      "Test Flashcard Deck",
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

    llm = new FakeLLM({
      thrownErrorString: "Test error",
    });

    generateFlashcardsChain = simpleGenerateFlashcardsChain(llm);

    service = langchainFlashcardGeneratorService(
      vectorStoreMock,
      generateFlashcardsChain,
    );

    await service.generateFlashcards(flashcardDeck, callbacks);

    expect(vectorStoreMock.getDocuments).toHaveBeenCalledWith(
      flashcardDeck.fileIds,
    );

    expect(callbacks.onProgress).not.toHaveBeenCalled();
    expect(callbacks.onSuccess).not.toHaveBeenCalled();
    expect(callbacks.onError).toHaveBeenCalledWith(new Error("Test error"));
  });
});
