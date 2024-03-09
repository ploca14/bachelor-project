import { v4 as uuidv4 } from "uuid";

export class Flashcard {
  constructor(
    public front: string,
    public back: string,
    public readonly deckId: string,
    private readonly _createdAt: Date = new Date(),
    public readonly id: string = uuidv4(),
  ) {}

  get createdAt() {
    return new Date(this._createdAt);
  }
}
