import { SampleTest } from "~/server/domain/sampleTest";
import type { SampleTestRepository } from "~/server/repositories/sampleTestRepository";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { SecurityService } from "~/server/services/securityService";

const createSampleTestForFileCommandHandler = (
  fileRepository: FileRepository,
  sampleTestRepository: SampleTestRepository,
  securityService: SecurityService,
) => {
  const execute = async (fileId: string) => {
    // TODO: Move to controller
    await securityService.checkFileOwnership(fileId);

    const file = await fileRepository.getFileById(fileId);

    const user = await securityService.getUser();
    const sampleTest = new SampleTest(file.originalName, [fileId], user.id);

    await sampleTestRepository.save(sampleTest);

    return sampleTest.id;
  };

  return { execute };
};

import { useSampleTestRepository } from "~/server/repositories/sampleTestRepository";
import { useFileRepository } from "~/server/repositories/fileRepository";
import { useSecurityService } from "~/server/services/securityService";

export const useCreateSampleTestForFileCommandHandler = () => {
  const fileRepository = useFileRepository();
  const sampleTestRepository = useSampleTestRepository();
  const securityService = useSecurityService();

  return createSampleTestForFileCommandHandler(
    fileRepository,
    sampleTestRepository,
    securityService,
  );
};
