import type { SampleTestRepository } from "~/server/repositories/sampleTestRepository";

export interface DeleteSampleTestCommandHandler {
  execute: (testId: string) => Promise<void>;
}

const deleteSampleTestCommandHandler = (
  sampleTestRepository: SampleTestRepository,
): DeleteSampleTestCommandHandler => {
  const execute = async (testId: string) => {
    await sampleTestRepository.remove(testId);
  };

  return { execute };
};

/* v8 ignore start */
import { useSampleTestRepository } from "~/server/repositories/sampleTestRepository";

export const useDeleteSampleTestCommandHandler = () => {
  const sampleTestRepository = useSampleTestRepository();

  return deleteSampleTestCommandHandler(sampleTestRepository);
};
