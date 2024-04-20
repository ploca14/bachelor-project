import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import type { CollectionRepository } from "~/server/repositories/collectionRepository";
import {
  addFilesToCollectionCommandHandler,
  type AddFilesToCollectionCommandHandler,
} from "~/server/handlers/addFilesToCollectionCommandHandler";
import { Collection } from "~/server/domain/collection";

describe("addFilesToCollectionCommandHandler", () => {
  let collectionRepository: MockProxy<CollectionRepository>;
  let handler: AddFilesToCollectionCommandHandler;

  vi.mock("uuid", () => ({ v4: () => "123456789" }));

  beforeEach(() => {
    vi.useFakeTimers();
    collectionRepository = mock<CollectionRepository>();
    handler = addFilesToCollectionCommandHandler(collectionRepository);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should add files to empty collection", async () => {
    const collection = new Collection("collection1", [], "user1");
    const spy = vi.spyOn(collection, "addFile");
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    await handler.execute("collection1", ["file1", "file2"]);

    expect(spy).toHaveBeenCalledWith("file2");
    expect(spy).toHaveBeenCalledWith("file1");
    expect(collectionRepository.save).toHaveBeenCalledWith(collection);
  });

  it("should not add file to collection if already present", async () => {
    const collection = new Collection("collection1", ["file1"], "user1");
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    await handler.execute("collection1", ["file1"]);

    expect(collection.fileIds).toEqual(["file1"]);
    expect(collectionRepository.save).toHaveBeenCalledWith(collection);
  });

  it("should return the collection id", async () => {
    const collection = new Collection("collection1", ["file1"], "user1");
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    const result = await handler.execute("collection1", ["file1"]);

    expect(result).toBe("collection1");
  });
});
