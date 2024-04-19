import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import type { CollectionRepository } from "~/server/repositories/collectionRepository";
import { removeFilesFromCollectionCommandHandler } from "~/server/handlers/removeFilesFromCollectionCommandHandler";
import { Collection } from "~/server/domain/collection";

describe("removeFilesFromCollectionCommandHandler", () => {
  let collectionRepository: MockProxy<CollectionRepository>;
  let handler: any;

  vi.mock("uuid", () => ({ v4: () => "123456789" }));

  beforeEach(() => {
    vi.useFakeTimers();
    collectionRepository = mock<CollectionRepository>();
    handler = removeFilesFromCollectionCommandHandler(collectionRepository);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should remove files from collection", async () => {
    const collection = new Collection("collection1", [], "user1");
    const spy = vi.spyOn(collection, "removeFile");
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    await handler.execute("collection1", ["file1", "file2"]);

    expect(spy).toHaveBeenCalledWith("file2");
    expect(spy).toHaveBeenCalledWith("file1");
    expect(collectionRepository.save).toHaveBeenCalledWith(collection);
  });

  it("should return the collection id", async () => {
    const collection = new Collection("collection1", ["file1"], "user1");
    collectionRepository.getCollectionById.mockResolvedValue(collection);

    const result = await handler.execute("collection1", ["file1"]);

    expect(result).toBe("collection1");
  });
});
