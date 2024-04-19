import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { ObjectRepository } from "~/server/repositories/objectRepository";
import { deleteFileCommandHandler } from "~/server/handlers/deleteFileCommandHandler";
import { File } from "~/server/domain/file";

describe("deleteFileCommandHandler", () => {
  let fileRepository: MockProxy<FileRepository>;
  let objectRepository: MockProxy<ObjectRepository>;
  let handler: any;

  beforeEach(() => {
    vi.useFakeTimers();
    fileRepository = mock<FileRepository>();
    objectRepository = mock<ObjectRepository>();

    handler = deleteFileCommandHandler(fileRepository, objectRepository);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should delete a file and its object", async () => {
    const file = new File("file1", "File1.txt", "user1", new Date(), "file1");
    fileRepository.getFileById.mockResolvedValue(file);

    await handler.execute(file.id);

    expect(fileRepository.remove).toHaveBeenCalledWith(file.id);
    expect(objectRepository.remove).toHaveBeenCalledWith(file.name);
  });
});
