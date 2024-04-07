-- AlterTable
ALTER TABLE "flashcard_decks" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'complete';

-- AlterTable
ALTER TABLE "sample_tests" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'complete';
