import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { ObjectRepository } from "~/server/repositories/objectRepository";
import type { SecurityService } from "~/server/services/securityService";
import type { FileProcessorService } from "~/server/services/fileProcessorService";
import { processFileCommandHandler } from "~/server/handlers/processFileCommandHandler";
import { File } from "~/server/domain/file";

describe("processFileCommandHandler", () => {
  let fileRepository: MockProxy<FileRepository>;
  let objectRepository: MockProxy<ObjectRepository>;
  let securityService: MockProxy<SecurityService>;
  let fileProcessorService: MockProxy<FileProcessorService>;
  let handler: any;

  vi.mock("uuid", () => ({ v4: () => "123456789" }));

  beforeEach(() => {
    vi.useFakeTimers();
    fileRepository = mock<FileRepository>();
    objectRepository = mock<ObjectRepository>();
    securityService = mock<SecurityService>();
    fileProcessorService = mock<FileProcessorService>();

    handler = processFileCommandHandler(
      fileRepository,
      objectRepository,
      securityService,
      fileProcessorService,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should process a file and save it", async () => {
    const user = { id: "user1", name: "Foo" };
    securityService.getUser.mockResolvedValue(user);
    objectRepository.getObjectByName.mockResolvedValue(new Blob([]));

    await handler.execute("file1", "File1.txt");

    expect(fileProcessorService.processFile).toHaveBeenCalledWith(
      new File("file1", "File1.txt", "user1"),
      new Blob([]),
    );
    expect(fileRepository.save).toHaveBeenCalledWith(
      new File("file1", "File1.txt", "user1"),
    );
  });
});
