import { SampleTest } from "~/server/domain/sampleTest";
import type { SampleTestRepository } from "~/server/repositories/sampleTestRepository";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { SecurityService } from "~/server/services/securityService";
import type { QuestionGeneratorService } from "~/server/services/questionGeneratorService";

const createSampleTestForFileCommandHandler = (
  fileRepository: FileRepository,
  sampleTestRepository: SampleTestRepository,
  securityService: SecurityService,
  questionGeneratorService: QuestionGeneratorService,
) => {
  const execute = async (fileId: string) => {
    const file = await fileRepository.getFileById(fileId);

    const user = await securityService.getUser();
    const sampleTest = new SampleTest(file.originalName, [fileId], user.id);

    await sampleTestRepository.save(sampleTest);

    questionGeneratorService
      .generateQuestions(sampleTest)
      .then(async (questions) => {
        sampleTest.addQuestions(questions);
        await sampleTestRepository.save(sampleTest);
      });

    return sampleTest.id;
  };

  return { execute };
};

import { useSampleTestRepository } from "~/server/repositories/sampleTestRepository";
import { useFileRepository } from "~/server/repositories/fileRepository";
import { useSecurityService } from "~/server/services/securityService";
import { useQuestionGeneratorService } from "~/server/services/questionGeneratorService";

export const useCreateSampleTestForFileCommandHandler = () => {
  const fileRepository = useFileRepository();
  const sampleTestRepository = useSampleTestRepository();
  const securityService = useSecurityService();
  const questionGeneratorService = useQuestionGeneratorService();

  return createSampleTestForFileCommandHandler(
    fileRepository,
    sampleTestRepository,
    securityService,
    questionGeneratorService,
  );
};
