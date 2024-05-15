import type { QuestionDTO } from "./questionDto";

export interface SampleTestDTO {
  id: string;
  name: string;
  status: "complete" | "error" | "pending";
  questions: Array<QuestionDTO>;
}
