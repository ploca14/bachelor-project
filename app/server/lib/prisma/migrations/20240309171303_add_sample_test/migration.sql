-- CreateTable
CREATE TABLE "sample_tests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "sample_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "testId" UUID NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sample_tests_files" (
    "testId" UUID NOT NULL,
    "fileId" UUID NOT NULL,

    CONSTRAINT "sample_tests_files_pkey" PRIMARY KEY ("testId","fileId")
);

-- AddForeignKey
ALTER TABLE "sample_tests" ADD CONSTRAINT "sample_tests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_testId_fkey" FOREIGN KEY ("testId") REFERENCES "sample_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sample_tests_files" ADD CONSTRAINT "sample_tests_files_testId_fkey" FOREIGN KEY ("testId") REFERENCES "sample_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sample_tests_files" ADD CONSTRAINT "sample_tests_files_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
