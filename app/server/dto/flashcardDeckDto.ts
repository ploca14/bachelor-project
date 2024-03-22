import { FlashcardDTO } from "./flashcardDto";

export interface FlashcardDeckDTO {
  id: string;
  name: string;
  flashcards: Array<FlashcardDTO>;
}
