/*
  Warnings:

  - The `status` column on the `flashcard_decks` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `sample_tests` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "generation_status" AS ENUM ('pending', 'complete', 'error');

-- AlterTable
ALTER TABLE "flashcard_decks" DROP COLUMN "status",
ADD COLUMN     "status" "generation_status" NOT NULL DEFAULT 'complete';

-- AlterTable
ALTER TABLE "sample_tests" DROP COLUMN "status",
ADD COLUMN     "status" "generation_status" NOT NULL DEFAULT 'complete';
