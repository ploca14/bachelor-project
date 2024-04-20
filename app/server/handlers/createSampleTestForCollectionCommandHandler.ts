import { SampleTest } from "~/server/domain/sampleTest";
import type { SampleTestRepository } from "~/server/repositories/sampleTestRepository";
import type { CollectionRepository } from "~/server/repositories/collectionRepository";
import type { Security } from "~/server/tools/security";
import type { QuestionGenerator } from "~/server/tools/questionGenerator";
import type { EventBus } from "~/server/tools/eventBus";

export interface CreateSampleTestForCollectionCommandHandler {
  execute: (collectionId: string) => Promise<string>;
}

export const createSampleTestForCollectionCommandHandler = (
  collectionRepository: CollectionRepository,
  sampleTestRepository: SampleTestRepository,
  security: Security,
  questionGenerator: QuestionGenerator,
  eventBus: EventBus,
): CreateSampleTestForCollectionCommandHandler => {
  const execute = async (collectionId: string) => {
    const collection =
      await collectionRepository.getCollectionById(collectionId);

    const user = await security.getUser();
    const sampleTest = new SampleTest(
      collection.name,
      "pending",
      collection.fileIds,
      user.id,
    );

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
import { useCollectionRepository } from "~/server/repositories/collectionRepository";
import { useSecurity } from "~/server/tools/security";
import { useQuestionGenerator } from "~/server/tools/questionGenerator";
import { useEventBus } from "~/server/tools/eventBus";

export const useCreateSampleTestForCollectionCommandHandler = () => {
  const collectionRepository = useCollectionRepository();
  const sampleTestRepository = useSampleTestRepository();
  const security = useSecurity();
  const questionGenerator = useQuestionGenerator();
  const eventBus = useEventBus();

  return createSampleTestForCollectionCommandHandler(
    collectionRepository,
    sampleTestRepository,
    security,
    questionGenerator,
    eventBus,
  );
};
