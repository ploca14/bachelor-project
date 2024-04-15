import { describe, expect, it, beforeEach } from "vitest";
import { mockDeep, type DeepMockProxy } from "vitest-mock-extended";
import {
  prismaConversationRepository,
  type ConversationRepository,
} from "~/server/repositories/conversationRepository";
import type { ExtendedPrismaClient } from "~/server/lib/prisma/client";
import { Conversation } from "~/server/domain/conversation";
import { Message } from "~/server/domain/message";
import { NotFoundError } from "~/types/errors";

describe("prismaConversationRepository", () => {
  let prismaMock: DeepMockProxy<ExtendedPrismaClient>;
  let repository: ConversationRepository;

  beforeEach(() => {
    prismaMock = mockDeep<ExtendedPrismaClient>();
    repository = prismaConversationRepository(prismaMock);
  });

  it("should get conversation by id", async () => {
    const id = "test-id";
    const rawConversation = {
      id,
      name: "Test Conversation",
      userId: "test-user-id",
      files: [],
      messages: [],
      createdAt: new Date(),
    };
    const conversation = new Conversation(
      rawConversation.name,
      rawConversation.files,
      rawConversation.userId,
      rawConversation.messages,
      rawConversation.createdAt,
      rawConversation.id,
    );
    prismaMock.conversation.findUnique.mockResolvedValue(rawConversation);

    const result = await repository.getConversationById(id);

    expect(result).toEqual(conversation);
    expect(prismaMock.conversation.findUnique).toHaveBeenCalledWith({
      where: { id },
      include: {
        files: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  });

  it("should check if conversation exists", async () => {
    const id = "test-id";

    prismaMock.conversation.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({} as any);

    expect(await repository.exists(id)).toBe(false);
    expect(await repository.exists(id)).toBe(true);
    expect(prismaMock.conversation.findUnique).toHaveBeenNthCalledWith(2, {
      where: { id },
    });
  });

  it("should save conversation", async () => {
    const id = "test-id";
    const conversation = new Conversation(
      "Test Conversation",
      [],
      "test-user-id",
      [],
      new Date(),
      id,
    );
    const rawConversation = {
      id,
      name: conversation.name,
      userId: conversation.userId,
      createdAt: conversation.createdAt,
    };

    await repository.save(conversation);

    expect(prismaMock.conversation.upsert).toHaveBeenCalledWith({
      where: { id },
      create: rawConversation,
      update: rawConversation,
      include: {
        files: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  });

  it("should remove conversation", async () => {
    const id = "test-id";

    await repository.remove(id);

    expect(prismaMock.conversation.delete).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it("should throw NotFoundError when conversation not found", async () => {
    const id = "test-id";
    prismaMock.conversation.findUnique.mockResolvedValue(null);

    await expect(repository.getConversationById(id)).rejects.toThrow(
      NotFoundError,
    );
    expect(prismaMock.conversation.findUnique).toHaveBeenCalledWith({
      where: { id },
      include: {
        files: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  });

  it("should delete all associated conversation files and messages when saving conversation with no files and messages", async () => {
    const id = "test-id";
    const conversation = new Conversation(
      "Test Conversation",
      [],
      "test-user-id",
      [],
      new Date(),
      id,
    );
    const rawConversation = {
      id,
      name: conversation.name,
      userId: conversation.userId,
      createdAt: conversation.createdAt,
    };

    await repository.save(conversation);

    expect(prismaMock.conversation.upsert).toHaveBeenCalledWith({
      where: { id },
      create: rawConversation,
      update: rawConversation,
      include: {
        files: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
    expect(prismaMock.conversationFile.deleteMany).toHaveBeenCalledWith({
      where: { conversationId: id },
    });
    expect(prismaMock.conversationFile.createMany).not.toHaveBeenCalled();
    expect(prismaMock.message.deleteMany).toHaveBeenCalledWith({
      where: { conversationId: id },
    });
    expect(prismaMock.message.createMany).not.toHaveBeenCalled();
  });

  it("should save all associated conversation files and messages when saving conversation with files and messages", async () => {
    const id = "test-id";
    const messages = [
      new Message("human", "message1", id, new Date(), "message1"),
      new Message("ai", "message2", id, new Date(), "message2"),
    ];
    const conversation = new Conversation(
      "Test Conversation",
      ["file1", "file2"],
      "test-user-id",
      messages,
      new Date(),
      id,
    );
    const rawConversation = {
      id,
      name: conversation.name,
      userId: conversation.userId,
      createdAt: conversation.createdAt,
    };

    await repository.save(conversation);

    expect(prismaMock.conversation.upsert).toHaveBeenCalledWith({
      where: { id },
      create: rawConversation,
      update: rawConversation,
      include: {
        files: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
    expect(prismaMock.conversationFile.deleteMany).toHaveBeenCalledWith({
      where: { conversationId: id },
    });
    expect(prismaMock.conversationFile.createMany).toHaveBeenCalledWith({
      data: conversation.fileIds.map((fileId) => ({
        fileId,
        conversationId: conversation.id,
      })),
    });
    expect(prismaMock.message.deleteMany).toHaveBeenCalledWith({
      where: { conversationId: id },
    });
    expect(prismaMock.message.createMany).toHaveBeenCalledWith({
      data: messages.map((message) => ({
        id: message.id,
        content: message.content,
        role: message.role,
        conversationId: message.conversationId,
        createdAt: message.createdAt,
      })),
    });
  });
});
