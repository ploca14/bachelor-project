import { FlashcardDTO } from "./flashcardDto";

export interface FlashcardDeckDTO {
  id: string;
  flashcards: Array<FlashcardDTO>;
}
