import { QuestionDTO } from "./questionDto";

export interface SampleTestDTO {
  id: string;
  name: string;
  questions: Array<QuestionDTO>;
}
