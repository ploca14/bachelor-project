import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import type { ConversationRepository } from "~/server/repositories/conversationRepository";
import type { AnswerGenerator } from "~/server/tools/answerGenerator";
import { sendMessageToConversationCommandHandler } from "~/server/handlers/sendMessageToConversationCommandHandler";
import { Conversation } from "~/server/domain/conversation";

describe("sendMessageToConversationCommandHandler", () => {
  let conversationRepository: MockProxy<ConversationRepository>;
  let answerGenerator: MockProxy<AnswerGenerator>;
  let handler: ReturnType<typeof sendMessageToConversationCommandHandler>;

  beforeEach(() => {
    vi.useFakeTimers();
    conversationRepository = mock<ConversationRepository>();
    answerGenerator = mock<AnswerGenerator>();
    handler = sendMessageToConversationCommandHandler(
      conversationRepository,
      answerGenerator,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should add a human message to the conversation", async () => {
    const conversation = new Conversation(
      "conversation1",
      ["file1"],
      "user1",
      [],
      new Date(),
      "123456789",
    );
    const spy = vi.spyOn(conversation, "addHumanMessage");
    conversationRepository.getConversationById.mockResolvedValue(conversation);

    await handler.execute("conversation1", "Hello");

    expect(spy).toHaveBeenCalledWith("Hello");
  });

  it("should generate an answer and add it to the conversation", async () => {
    const conversation = new Conversation(
      "conversation1",
      ["file1"],
      "user1",
      [],
      new Date(),
      "123456789",
    );
    const spy = vi.spyOn(conversation, "addAiMessage");
    conversationRepository.getConversationById.mockResolvedValue(conversation);
    answerGenerator.generateAnswer.mockImplementation(async (_, callbacks) => {
      callbacks.onSuccess("Hello, human");
    });

    await handler.execute("conversation1", "Hello");

    expect(spy).toHaveBeenCalledWith("Hello, human");
  });

  it("should save the conversation", async () => {
    const conversation = new Conversation(
      "conversation1",
      ["file1"],
      "user1",
      [],
      new Date(),
      "123456789",
    );
    conversationRepository.getConversationById.mockResolvedValue(conversation);
    answerGenerator.generateAnswer.mockImplementation(async (_, callbacks) => {
      callbacks.onSuccess("Hello, human");
    });

    await handler.execute("conversation1", "Hello");

    expect(conversationRepository.save).toHaveBeenCalledWith(conversation);
  });

  it("should return a stream with the answer", async () => {
    const conversation = new Conversation(
      "conversation1",
      ["file1"],
      "user1",
      [],
      new Date(),
      "123456789",
    );
    conversationRepository.getConversationById.mockResolvedValue(conversation);
    answerGenerator.generateAnswer.mockImplementation(async (_, callbacks) => {
      callbacks.onProgress("Hello");
      callbacks.onProgress(", ");
      callbacks.onProgress("human");
      callbacks.onSuccess("Hello, human");
    });

    const stream = await handler.execute("conversation1", "Hello");

    const reader = stream.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    expect(chunks).toEqual(["Hello", ", ", "human"]);
  });
});
