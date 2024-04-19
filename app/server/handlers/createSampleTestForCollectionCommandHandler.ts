import { SampleTest } from "~/server/domain/sampleTest";
import type { SampleTestRepository } from "~/server/repositories/sampleTestRepository";
import type { CollectionRepository } from "~/server/repositories/collectionRepository";
import type { SecurityService } from "~/server/services/securityService";
import type { QuestionGeneratorService } from "~/server/services/questionGeneratorService";
import type { EventBus } from "~/server/services/eventBus";

export const createSampleTestForCollectionCommandHandler = (
  collectionRepository: CollectionRepository,
  sampleTestRepository: SampleTestRepository,
  securityService: SecurityService,
  questionGeneratorService: QuestionGeneratorService,
  eventBus: EventBus,
) => {
  const execute = async (collectionId: string) => {
    const collection =
      await collectionRepository.getCollectionById(collectionId);

    const user = await securityService.getUser();
    const sampleTest = new SampleTest(
      collection.name,
      "pending",
      collection.fileIds,
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
import { useCollectionRepository } from "~/server/repositories/collectionRepository";
import { useSecurityService } from "~/server/services/securityService";
import { useQuestionGeneratorService } from "~/server/services/questionGeneratorService";
import { useEventBus } from "~/server/services/eventBus";

export const useCreateSampleTestForCollectionCommandHandler = () => {
  const collectionRepository = useCollectionRepository();
  const sampleTestRepository = useSampleTestRepository();
  const securityService = useSecurityService();
  const questionGeneratorService = useQuestionGeneratorService();
  const eventBus = useEventBus();

  return createSampleTestForCollectionCommandHandler(
    collectionRepository,
    sampleTestRepository,
    securityService,
    questionGeneratorService,
    eventBus,
  );
};
