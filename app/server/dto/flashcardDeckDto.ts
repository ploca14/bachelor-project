import type { FlashcardDTO } from "./flashcardDto";

export interface FlashcardDeckDTO {
  id: string;
  name: string;
  status: "complete" | "error" | "pending";
  flashcards: Array<FlashcardDTO>;
}
