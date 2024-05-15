import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { mockDeep, type DeepMockProxy } from "vitest-mock-extended";
import {
  langchainFileProcessor,
  type FileProcessor,
} from "~/server/tools/fileProcessor";
import { type LoaderFactory } from "~/server/lib/langchain/loaderFactory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { TextLoader } from "langchain/document_loaders/fs/text";
import type { TextSplitter } from "langchain/text_splitter";
import type { VectorStore } from "@langchain/core/vectorstores";
import type { File } from "~/server/domain/file";

describe("langchainFileProcessor", () => {
  let loaderFactory: DeepMockProxy<LoaderFactory>;
  let splitter: TextSplitter;
  let store: DeepMockProxy<VectorStore>;
  let service: FileProcessor;

  beforeEach(() => {
    loaderFactory = mockDeep<LoaderFactory>();
    loaderFactory.createForBlob.mockImplementation((blob) => {
      return new TextLoader(blob);
    });
    splitter = new RecursiveCharacterTextSplitter();
    store = mockDeep<VectorStore>();

    service = langchainFileProcessor(loaderFactory, splitter, store);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should load the text from the blob", async () => {
    const file = {} as File;
    const blob = new Blob();
    const loader = new TextLoader(blob);

    const spy = vi.spyOn(loader, "load");
    loaderFactory.createForBlob.mockImplementation((blob) => {
      return loader;
    });

    await service.processFile(file, blob);

    expect(loaderFactory.createForBlob).toHaveBeenCalledWith(blob);
    expect(spy).toHaveBeenCalled();
  });

  it("should split the text into chunks", async () => {
    const file = {} as File;
    const blob = new Blob();

    const spy = vi.spyOn(splitter, "splitDocuments");

    await service.processFile(file, blob);

    expect(spy).toHaveBeenCalled();
  });

  it("should add the metadata to the documents", async () => {
    const file = { ownerId: "user1", id: "file1" } as File;
    const blob = new Blob(["content"]);

    await service.processFile(file, blob);

    expect(store.addDocuments).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          metadata: expect.objectContaining({
            user_id: "user1",
            file_id: "file1",
          }),
        }),
      ]),
    );
  });

  it("should add the documents to the store", async () => {
    const file = {} as File;
    const blob = new Blob(["content"]);

    await service.processFile(file, blob);

    expect(store.addDocuments).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          pageContent: "content",
        }),
      ]),
    );
  });
});
