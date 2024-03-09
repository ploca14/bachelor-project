import { v4 as uuidv4 } from "uuid";
import { Flashcard } from "~/server/domain/flashcard";

export class FlashcardDeck {
  constructor(
    public name: string,
    private readonly _fileIds: string[],
    public readonly userId: string,
    private readonly _flashcards: Flashcard[] = [],
    private readonly _createdAt: Date = new Date(),
    public readonly id: string = uuidv4(),
  ) {}

  public addFlashcards(flashcards: Array<{ front: string; back: string }>) {
    const newFlashcards = flashcards.map(
      ({ front, back }) => new Flashcard(front, back, this.id),
    );

    this._flashcards.push(...newFlashcards);
    return this.flashcards;
  }

  get fileIds() {
    return Array.from(this._fileIds);
  }

  get flashcards() {
    return Array.from(this._flashcards);
  }

  get createdAt() {
    return new Date(this._createdAt);
  }
}
