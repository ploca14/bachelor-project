import { describe, expect, it, beforeEach, vi } from "vitest";
import { mockDeep, type DeepMockProxy } from "vitest-mock-extended";
import {
  supabaseObjectRepository,
  type ObjectRepository,
} from "~/server/repositories/objectRepository";
import type { Security } from "~/server/tools/security";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NotFoundError } from "~/types/errors";

describe("supabaseObjectRepository", () => {
  let security: DeepMockProxy<Security>;
  let supabase: DeepMockProxy<SupabaseClient>;
  let repository: ObjectRepository;

  beforeEach(() => {
    security = mockDeep<Security>();
    supabase = mockDeep<SupabaseClient>();

    repository = supabaseObjectRepository(security, supabase);
  });

  it("getObjectByName should download object from user's folder", async () => {
    const user = { id: "user1", name: "Foo" };
    const name = "test-file";
    const objectName = `${user.id}/${name}`;

    security.getUser.mockResolvedValue(user);
    const storageFileApi =
      mockDeep<ReturnType<SupabaseClient["storage"]["from"]>>();
    storageFileApi.download.mockResolvedValue({ data: {} } as any);
    supabase.storage.from.mockReturnValue(storageFileApi);

    await repository.getObjectByName(name);

    expect(supabase.storage.from).toHaveBeenCalledWith("files");
    expect(storageFileApi.download).toHaveBeenCalledWith(objectName);
  });

  it("getObjectByName should throw NotFoundError if file not found", async () => {
    const user = { id: "user1", name: "Foo" };
    const name = "test-file";

    security.getUser.mockResolvedValue(user);
    const storageFileApi =
      mockDeep<ReturnType<SupabaseClient["storage"]["from"]>>();
    storageFileApi.download.mockResolvedValue({ error: {} } as any);
    supabase.storage.from.mockReturnValue(storageFileApi);

    await expect(repository.getObjectByName(name)).rejects.toThrow(
      new NotFoundError("File not found"),
    );
  });

  it("getObjectByName should return data if file found", async () => {
    const user = { id: "user1", name: "Foo" };
    const name = "test-file";
    const data = new Blob();

    security.getUser.mockResolvedValue(user);
    const storageFileApi =
      mockDeep<ReturnType<SupabaseClient["storage"]["from"]>>();
    storageFileApi.download.mockResolvedValue({ data } as any);
    supabase.storage.from.mockReturnValue(storageFileApi);

    const result = await repository.getObjectByName(name);

    expect(result).toBe(data);
  });

  it("remove should remove object from user's folder", async () => {
    const user = { id: "user1", name: "Foo" };
    const name = "test-file";
    const objectName = `${user.id}/${name}`;

    security.getUser.mockResolvedValue(user);
    const storageFileApi =
      mockDeep<ReturnType<SupabaseClient["storage"]["from"]>>();
    storageFileApi.remove.mockResolvedValue({} as any);
    supabase.storage.from.mockReturnValue(storageFileApi);

    await repository.remove(name);

    expect(supabase.storage.from).toHaveBeenCalledWith("files");
    expect(storageFileApi.remove).toHaveBeenCalledWith([objectName]);
  });

  it("remove should throw NotFoundError if file not found", async () => {
    const user = { id: "user1", name: "Foo" };
    const name = "test-file";

    security.getUser.mockResolvedValue(user);
    const storageFileApi =
      mockDeep<ReturnType<SupabaseClient["storage"]["from"]>>();
    storageFileApi.remove.mockResolvedValue({ error: {} } as any);
    supabase.storage.from.mockReturnValue(storageFileApi);

    await expect(repository.remove(name)).rejects.toThrow(
      new NotFoundError("Failed to remove file"),
    );
  });
});
