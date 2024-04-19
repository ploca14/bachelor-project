import { SampleTest } from "~/server/domain/sampleTest";
import { questionMapper } from "~/server/mappers/questionMapper";

export const sampleTestMapper = {
  toDomain: (raw: any) => {
    return new SampleTest(
      raw.name,
      raw.status,
      raw.files.map(({ fileId }: any) => fileId),
      raw.userId,
      raw.questions.map((question: any) => questionMapper.toDomain(question)),
      raw.createdAt,
      raw.id,
    );
  },
  toPersistence: (sampleTest: SampleTest) => {
    return {
      id: sampleTest.id,
      name: sampleTest.name,
      status: sampleTest.status,
      userId: sampleTest.userId,
      createdAt: sampleTest.createdAt,
    };
  },
};
