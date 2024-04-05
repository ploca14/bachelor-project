import type { SampleTestRepository } from "~/server/repositories/sampleTestRepository";

const deleteSampleTestCommandHandler = (
  sampleTestRepository: SampleTestRepository,
) => {
  const execute = async (testId: string) => {
    await sampleTestRepository.remove(testId);
  };

  return { execute };
};

import { useSampleTestRepository } from "~/server/repositories/sampleTestRepository";

export const useDeleteSampleTestCommandHandler = () => {
  const sampleTestRepository = useSampleTestRepository();

  return deleteSampleTestCommandHandler(sampleTestRepository);
};
