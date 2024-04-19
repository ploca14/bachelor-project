import { SampleTest } from "~/server/domain/sampleTest";
import type { SampleTestRepository } from "~/server/repositories/sampleTestRepository";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { SecurityService } from "~/server/services/securityService";
import type { QuestionGeneratorService } from "~/server/services/questionGeneratorService";
import type { EventBus } from "~/server/services/eventBus";

export const createSampleTestForFileCommandHandler = (
  fileRepository: FileRepository,
  sampleTestRepository: SampleTestRepository,
  securityService: SecurityService,
  questionGeneratorService: QuestionGeneratorService,
  eventBus: EventBus,
) => {
  const execute = async (fileId: string) => {
    const file = await fileRepository.getFileById(fileId);

    const user = await securityService.getUser();
    const sampleTest = new SampleTest(
      file.originalName,
      "pending",
      [fileId],
      user.id,
    );

    await sampleTestRepository.save(sampleTest);

    questionGeneratorService.generateQuestions(sampleTest, {
      async onProgress(progress) {
        await eventBus.publish(
          `sampleTest:${sampleTest.id}:progress`,
          progress,
        );
      },
      async onSuccess(questions) {
        sampleTest.addQuestions(questions.map((q) => q.content));
        sampleTest.status = "complete";
        await sampleTestRepository.save(sampleTest);
        await eventBus.publish(`sampleTest:${sampleTest.id}:complete`);
      },
      async onError(error) {
        sampleTest.status = "error";
        await sampleTestRepository.save(sampleTest);
        await eventBus.publish(
          `sampleTest:${sampleTest.id}:error`,
          error.message,
        );
      },
    });

    return sampleTest.id;
  };

  return { execute };
};

import { useSampleTestRepository } from "~/server/repositories/sampleTestRepository";
import { useFileRepository } from "~/server/repositories/fileRepository";
import { useSecurityService } from "~/server/services/securityService";
import { useQuestionGeneratorService } from "~/server/services/questionGeneratorService";
import { useEventBus } from "~/server/services/eventBus";

export const useCreateSampleTestForFileCommandHandler = () => {
  const fileRepository = useFileRepository();
  const sampleTestRepository = useSampleTestRepository();
  const securityService = useSecurityService();
  const questionGeneratorService = useQuestionGeneratorService();
  const eventBus = useEventBus();

  return createSampleTestForFileCommandHandler(
    fileRepository,
    sampleTestRepository,
    securityService,
    questionGeneratorService,
    eventBus,
  );
};
