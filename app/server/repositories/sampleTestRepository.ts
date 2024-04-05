import { sampleTestMapper } from "~/server/mappers/sampleTestMapper";
import { questionMapper } from "~/server/mappers/questionMapper";
import { transactional } from "~/server/utils/transactional";
import type { Prisma } from "@prisma/client";
import type { ExtendedPrismaClient } from "~/server/lib/prisma/client";
import type { SampleTest } from "~/server/domain/sampleTest";
import type { Question } from "~/server/domain/question";
import { NotFoundError } from "~/types/errors";

export interface SampleTestRepository {
  getSampleTestById: (id: string) => Promise<SampleTest>;
  exists: (id: string) => Promise<boolean>;
  save: (sampleTest: SampleTest) => Promise<SampleTest>;
  remove: (id: string) => Promise<void>;
}

const prismaSampleTestRepository = (
  prisma: ExtendedPrismaClient,
): SampleTestRepository => {
  const BASE_QUERY_OPTIONS = {
    include: { files: true, questions: true },
  } satisfies Prisma.SampleTestDefaultArgs;

  const getSampleTestById = async (id: string) => {
    const result = await prisma.sampleTest.findUnique({
      where: { id },
      ...BASE_QUERY_OPTIONS,
    });

    if (!result) {
      throw new NotFoundError("Sample test not found");
    }

    return sampleTestMapper.toDomain(result);
  };

  const exists = async (id: string) => {
    const result = await prisma.sampleTest.findUnique({ where: { id } });

    return result !== null;
  };

  const setSampleTestFiles = transactional(
    async (testId: string, fileIds: string[]) => {
      // Disassociate all files from the sampleTest
      await prisma.sampleTestFile.deleteMany({
        where: {
          testId,
        },
      });

      // Associate the new files to the sampleTest
      await prisma.sampleTestFile.createMany({
        data: fileIds.map((fileId) => ({
          fileId,
          testId,
        })),
      });
    },
  );

  const saveSampleTestQuestions = transactional(
    async (testId: string, questions: Question[]) => {
      // Delete all questions from the sampleTest
      await prisma.question.deleteMany({
        where: {
          testId,
        },
      });

      // Recreate the questions
      await prisma.question.createMany({
        data: questions.map((question) =>
          questionMapper.toPersistence(question),
        ),
      });
    },
  );

  const save = transactional(async (sampleTest: SampleTest) => {
    const rawSampleTest = sampleTestMapper.toPersistence(sampleTest);

    // If the sampleTest already exists, update it. Otherwise, create it.
    await prisma.sampleTest.upsert({
      where: { id: sampleTest.id },
      create: rawSampleTest,
      update: rawSampleTest,
      ...BASE_QUERY_OPTIONS,
    });

    // Associate the files to the sampleTest
    await setSampleTestFiles(sampleTest.id, sampleTest.fileIds);

    // Save the questions
    await saveSampleTestQuestions(sampleTest.id, sampleTest.questions);

    return sampleTest;
  });

  const remove = async (id: string) => {
    await prisma.sampleTest.delete({ where: { id } });
  };

  return {
    getSampleTestById,
    exists,
    save,
    remove,
  };
};

import { usePrismaClient } from "~/server/lib/prisma/client";

export const useSampleTestRepository = () => {
  const prisma = usePrismaClient();
  return prismaSampleTestRepository(prisma);
};
