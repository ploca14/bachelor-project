import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { ObjectRepository } from "~/server/repositories/objectRepository";
import type { Security } from "~/server/tools/security";
import type { FileProcessor } from "~/server/tools/fileProcessor";
import { processFileCommandHandler } from "~/server/handlers/command/processFileCommandHandler";
import { File } from "~/server/domain/file";

describe("processFileCommandHandler", () => {
  let fileRepository: MockProxy<FileRepository>;
  let objectRepository: MockProxy<ObjectRepository>;
  let security: MockProxy<Security>;
  let fileProcessor: MockProxy<FileProcessor>;
  let handler: any;

  vi.mock("uuid", () => ({ v4: () => "123456789" }));

  beforeEach(() => {
    vi.useFakeTimers();
    fileRepository = mock<FileRepository>();
    objectRepository = mock<ObjectRepository>();
    security = mock<Security>();
    fileProcessor = mock<FileProcessor>();

    handler = processFileCommandHandler(
      fileRepository,
      objectRepository,
      security,
      fileProcessor,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should process a file and save it", async () => {
    const user = { id: "user1", name: "Foo" };
    security.getUser.mockResolvedValue(user);
    objectRepository.getObjectByName.mockResolvedValue(new Blob([]));

    await handler.execute("file1", "File1.txt");

    expect(fileProcessor.processFile).toHaveBeenCalledWith(
      new File("file1", "File1.txt", "user1"),
      new Blob([]),
    );
    expect(fileRepository.save).toHaveBeenCalledWith(
      new File("file1", "File1.txt", "user1"),
    );
  });
});
