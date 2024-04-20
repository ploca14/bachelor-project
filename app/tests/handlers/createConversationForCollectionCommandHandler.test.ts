import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import type { CollectionRepository } from "~/server/repositories/collectionRepository";
import type { ConversationRepository } from "~/server/repositories/conversationRepository";
import type { Security } from "~/server/tools/security";
import type { CollectionService } from "~/server/services/collectionService";
import {
  createConversationForCollectionCommandHandler,
  type CreateConversationForCollectionCommandHandler,
} from "~/server/handlers/createConversationForCollectionCommandHandler";
import { Conversation } from "~/server/domain/conversation";
import { Collection } from "~/server/domain/collection";

describe("createConversationForCollectionCommandHandler", () => {
  let collectionRepository: MockProxy<CollectionRepository>;
  let conversationRepository: MockProxy<ConversationRepository>;
  let security: MockProxy<Security>;
  let collectionService: MockProxy<CollectionService>;
  let handler: CreateConversationForCollectionCommandHandler;

  vi.mock("uuid", () => ({ v4: () => "123456789" }));

  beforeEach(() => {
    vi.useFakeTimers();
    collectionRepository = mock<CollectionRepository>();
    conversationRepository = mock<ConversationRepository>();
    security = mock<Security>();
    collectionService = mock<CollectionService>();
    handler = createConversationForCollectionCommandHandler(
      collectionRepository,
      conversationRepository,
      security,
      collectionService,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a new conversation and save it", async () => {
    const user = { id: "user1", name: "Foo" };
    security.getUser.mockResolvedValue(user);
    const collection = new Collection(
      "collection1",
      ["file1", "file2"],
      user.id,
    );
    const conversation = new Conversation(
      collection.name,
      collection.fileIds,
      user.id,
      [],
      new Date(),
      "123456789",
    );

    collectionService.createConversation.mockReturnValue(conversation);
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    await handler.execute("collection1");

    expect(conversationRepository.save).toHaveBeenCalledWith(conversation);
  });

  it("should return the conversation id", async () => {
    const user = { id: "user1", name: "Foo" };
    security.getUser.mockResolvedValue(user);
    const collection = new Collection(
      "collection1",
      ["file1", "file2"],
      "user1",
    );
    collectionService.createConversation.mockReturnValue({
      id: "123456789",
    } as any);
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    const result = await handler.execute("collection1");

    expect(result).toBe("123456789");
  });
});
