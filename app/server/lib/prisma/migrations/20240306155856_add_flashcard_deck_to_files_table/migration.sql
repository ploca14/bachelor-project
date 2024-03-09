-- CreateTable
CREATE TABLE "flashcard_decks_files" (
    "deckId" UUID NOT NULL,
    "fileId" UUID NOT NULL,

    CONSTRAINT "flashcard_decks_files_pkey" PRIMARY KEY ("deckId","fileId")
);

-- AddForeignKey
ALTER TABLE "flashcard_decks_files" ADD CONSTRAINT "flashcard_decks_files_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "flashcard_decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_decks_files" ADD CONSTRAINT "flashcard_decks_files_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
