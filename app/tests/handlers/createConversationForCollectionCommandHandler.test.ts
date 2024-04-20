import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import type { CollectionRepository } from "~/server/repositories/collectionRepository";
import type { ConversationRepository } from "~/server/repositories/conversationRepository";
import type { Security } from "~/server/tools/security";
import { createConversationForCollectionCommandHandler } from "~/server/handlers/createConversationForCollectionCommandHandler";
import { Conversation } from "~/server/domain/conversation";
import { Collection } from "~/server/domain/collection";

describe("createConversationForCollectionCommandHandler", () => {
  let collectionRepository: MockProxy<CollectionRepository>;
  let conversationRepository: MockProxy<ConversationRepository>;
  let security: MockProxy<Security>;
  let handler: ReturnType<typeof createConversationForCollectionCommandHandler>;

  vi.mock("uuid", () => ({ v4: () => "123456789" }));

  beforeEach(() => {
    vi.useFakeTimers();
    collectionRepository = mock<CollectionRepository>();
    conversationRepository = mock<ConversationRepository>();
    security = mock<Security>();
    handler = createConversationForCollectionCommandHandler(
      collectionRepository,
      conversationRepository,
      security,
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
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    const result = await handler.execute("collection1");

    expect(conversationRepository.save).toHaveBeenCalledWith(
      new Conversation(
        collection.name,
        collection.fileIds,
        user.id,
        [],
        new Date(),
        "123456789",
      ),
    );
  });

  it("should return the conversation id", async () => {
    const user = { id: "user1", name: "Foo" };
    security.getUser.mockResolvedValue(user);
    const collection = new Collection(
      "collection1",
      ["file1", "file2"],
      "user1",
    );
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    const result = await handler.execute("collection1");

    expect(result).toBe("123456789");
  });

  it("should throw an error if the collection is empty", async () => {
    const collection = new Collection("collection1", [], "user1");
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    await expect(handler.execute("collection1")).rejects.toThrowError(
      "Cannot create a conversation for empty collection.",
    );
  });
});
