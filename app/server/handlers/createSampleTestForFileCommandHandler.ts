import type { SampleTestRepository } from "~/server/repositories/sampleTestRepository";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { Security } from "~/server/tools/security";
import type { QuestionGenerator } from "~/server/tools/questionGenerator";
import type { EventBus } from "~/server/tools/eventBus";
import type { FileService } from "~/server/services/fileService";

export interface CreateSampleTestForFileCommandHandler {
  execute: (fileId: string) => Promise<string>;
}

export const createSampleTestForFileCommandHandler = (
  fileRepository: FileRepository,
  sampleTestRepository: SampleTestRepository,
  security: Security,
  questionGenerator: QuestionGenerator,
  eventBus: EventBus,
  fileService: FileService,
): CreateSampleTestForFileCommandHandler => {
  const execute = async (fileId: string) => {
    const file = await fileRepository.getFileById(fileId);

    const user = await security.getUser();
    const sampleTest = fileService.createSampleTest(file, user.id);

    await sampleTestRepository.save(sampleTest);

    questionGenerator.generateQuestions(sampleTest, {
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
import { useSecurity } from "~/server/tools/security";
import { useQuestionGenerator } from "~/server/tools/questionGenerator";
import { useEventBus } from "~/server/tools/eventBus";
import { useFileService } from "~/server/services/fileService";

export const useCreateSampleTestForFileCommandHandler = () => {
  const fileRepository = useFileRepository();
  const sampleTestRepository = useSampleTestRepository();
  const security = useSecurity();
  const questionGenerator = useQuestionGenerator();
  const eventBus = useEventBus();
  const fileService = useFileService();

  return createSampleTestForFileCommandHandler(
    fileRepository,
    sampleTestRepository,
    security,
    questionGenerator,
    eventBus,
    fileService,
  );
};
