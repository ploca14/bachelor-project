import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import type { CollectionRepository } from "~/server/repositories/collectionRepository";
import type { SecurityService } from "~/server/services/securityService";
import { createCollectionCommandHandler } from "~/server/handlers/createCollectionCommandHandler";
import { Collection } from "~/server/domain/collection";

describe("createCollectionCommandHandler", () => {
  let collectionRepository: MockProxy<CollectionRepository>;
  let securityService: MockProxy<SecurityService>;
  let handler: any;

  vi.mock("uuid", () => ({ v4: () => "123456789" }));

  beforeEach(() => {
    vi.useFakeTimers();
    collectionRepository = mock<CollectionRepository>();
    securityService = mock<SecurityService>();
    handler = createCollectionCommandHandler(
      collectionRepository,
      securityService,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a new collection and save it", async () => {
    const user = { id: "user1", name: "Foo" };
    securityService.getUser.mockResolvedValue(user);

    const result = await handler.execute("collection1", ["file1", "file2"]);

    expect(collectionRepository.save).toHaveBeenCalledWith(
      new Collection(
        "collection1",
        ["file1", "file2"],
        user.id,
        new Date(),
        "123456789",
      ),
    );
  });

  it("should return the collection id", async () => {
    const user = { id: "user1", name: "Foo" };
    securityService.getUser.mockResolvedValue(user);

    const result = await handler.execute("collection1", ["file1", "file2"]);

    expect(result).toBe("123456789");
  });
});
