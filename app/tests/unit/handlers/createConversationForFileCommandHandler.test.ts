import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { ConversationRepository } from "~/server/repositories/conversationRepository";
import type { Security } from "~/server/tools/security";
import type { FileService } from "~/server/services/fileService";
import {
  createConversationForFileCommandHandler,
  type CreateConversationForFileCommandHandler,
} from "~/server/handlers/command/createConversationForFileCommandHandler";
import { Conversation } from "~/server/domain/conversation";
import { File } from "~/server/domain/file";

describe("createConversationForFileCommandHandler", () => {
  let fileRepository: MockProxy<FileRepository>;
  let conversationRepository: MockProxy<ConversationRepository>;
  let security: MockProxy<Security>;
  let fileService: MockProxy<FileService>;
  let handler: CreateConversationForFileCommandHandler;

  vi.mock("uuid", () => ({ v4: () => "123456789" }));

  beforeEach(() => {
    vi.useFakeTimers();
    fileRepository = mock<FileRepository>();
    conversationRepository = mock<ConversationRepository>();
    security = mock<Security>();
    fileService = mock<FileService>();
    handler = createConversationForFileCommandHandler(
      fileRepository,
      conversationRepository,
      security,
      fileService,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a new conversation and save it", async () => {
    const user = { id: "user1", name: "Foo" };
    security.getUser.mockResolvedValue(user);
    const file = new File("file1", "file1", user.id, new Date(), "file1");
    const conversation = new Conversation(
      file.name,
      [file.id],
      user.id,
      [],
      new Date(),
      "123456789",
    );

    fileService.createConversation.mockReturnValue(conversation);
    fileRepository.getFileById.mockResolvedValue(file);

    await handler.execute("file1");

    expect(conversationRepository.save).toHaveBeenCalledWith(conversation);
  });

  it("should return the conversation id", async () => {
    const user = { id: "user1", name: "Foo" };
    security.getUser.mockResolvedValue(user);
    const file = new File("file1", "file1", user.id);

    fileService.createConversation.mockReturnValue({ id: "123456789" } as any);
    fileRepository.getFileById.mockResolvedValue(file);

    const result = await handler.execute("file1");

    expect(result).toBe("123456789");
  });
});
