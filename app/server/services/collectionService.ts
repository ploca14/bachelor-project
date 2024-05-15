import { Collection } from "~/server/domain/collection";
import { Conversation } from "~/server/domain/conversation";
import { FlashcardDeck } from "~/server/domain/flashcardDeck";
import { SampleTest } from "~/server/domain/sampleTest";
import { NoFilesError } from "~/types/errors";

export interface CollectionService {
  createConversation: (collection: Collection, userId: string) => Conversation;
  createFlashcardDeck: (
    collection: Collection,
    userId: string,
  ) => FlashcardDeck;
  createSampleTest: (collection: Collection, userId: string) => SampleTest;
}

const collectionService = (): CollectionService => {
  const createConversation = (collection: Collection, userId: string) => {
    if (collection.fileIds.length === 0) {
      throw new NoFilesError(
        "Cannot create a conversation for empty collection.",
      );
    }

    return new Conversation(collection.name, collection.fileIds, userId);
  };

  const createFlashcardDeck = (collection: Collection, userId: string) => {
    return new FlashcardDeck(
      collection.name,
      "pending",
      collection.fileIds,
      userId,
    );
  };

  const createSampleTest = (collection: Collection, userId: string) => {
    return new SampleTest(
      collection.name,
      "pending",
      collection.fileIds,
      userId,
    );
  };

  return {
    createConversation,
    createFlashcardDeck,
    createSampleTest,
  };
};

/* v8 ignore start */
export const useCollectionService = () => {
  return collectionService();
};
