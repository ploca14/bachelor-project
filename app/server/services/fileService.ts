import { File } from "~/server/domain/file";
import { Conversation } from "~/server/domain/conversation";
import { FlashcardDeck } from "~/server/domain/flashcardDeck";
import { SampleTest } from "~/server/domain/sampleTest";

export interface FileService {
  createConversation: (file: File, userId: string) => Conversation;
  createFlashcardDeck: (file: File, userId: string) => FlashcardDeck;
  createSampleTest: (file: File, userId: string) => SampleTest;
}

const fileService = (): FileService => {
  const createConversation = (file: File, userId: string) => {
    return new Conversation(file.originalName, [file.id], userId);
  };

  const createFlashcardDeck = (file: File, userId: string) => {
    return new FlashcardDeck(file.originalName, "pending", [file.id], userId);
  };

  const createSampleTest = (file: File, userId: string) => {
    return new SampleTest(file.originalName, "pending", [file.id], userId);
  };

  return {
    createConversation,
    createFlashcardDeck,
    createSampleTest,
  };
};

/* v8 ignore start */
export const useFileService = () => {
  return fileService();
};
