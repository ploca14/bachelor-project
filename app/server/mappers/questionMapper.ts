import { Question } from "~/server/domain/question";

export const questionMapper = {
  toDomain: (raw: any) => {
    return new Question(raw.content, raw.testId, raw.createdAt, raw.id);
  },
  toPersistence: (question: Question) => {
    return {
      id: question.id,
      content: question.content,
      createdAt: question.createdAt,
      testId: question.testId,
    };
  },
};
