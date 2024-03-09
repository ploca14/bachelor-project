import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const MessageRole = {
    human: "human",
    ai: "ai"
} as const;
export type MessageRole = (typeof MessageRole)[keyof typeof MessageRole];
export type Collection = {
    id: Generated<string>;
    createdAt: Generated<Timestamp>;
    userId: string;
    name: string;
};
export type CollectionFile = {
    collectionId: string;
    fileId: string;
};
export type Conversation = {
    id: Generated<string>;
    createdAt: Generated<Timestamp>;
    userId: string;
    name: string;
};
export type ConversationFile = {
    conversationId: string;
    fileId: string;
};
export type Documents = {
    id: Generated<string>;
    content: string | null;
    metadata: unknown | null;
};
export type File = {
    id: Generated<string>;
    createdAt: Generated<Timestamp>;
    name: string;
    originalName: string;
    userId: string;
};
export type Flashcard = {
    id: Generated<string>;
    createdAt: Generated<Timestamp>;
    deckId: string;
    front: string;
    back: string;
};
export type FlashcardDeck = {
    id: Generated<string>;
    createdAt: Generated<Timestamp>;
    userId: string;
    name: string;
};
export type FlashcardDeckFile = {
    deckId: string;
    fileId: string;
};
export type Message = {
    id: Generated<string>;
    createdAt: Generated<Timestamp>;
    conversationId: string;
    content: string;
    role: MessageRole;
};
export type Question = {
    id: Generated<string>;
    createdAt: Generated<Timestamp>;
    testId: string;
    content: string;
};
export type SampleTest = {
    id: Generated<string>;
    createdAt: Generated<Timestamp>;
    userId: string;
    name: string;
};
export type SampleTestFile = {
    testId: string;
    fileId: string;
};
export type User = {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
};
export type DB = {
    collections: Collection;
    collections_files: CollectionFile;
    conversations: Conversation;
    conversations_files: ConversationFile;
    documents: Documents;
    files: File;
    flashcard_decks: FlashcardDeck;
    flashcard_decks_files: FlashcardDeckFile;
    flashcards: Flashcard;
    messages: Message;
    questions: Question;
    sample_tests: SampleTest;
    sample_tests_files: SampleTestFile;
    users: User;
};
