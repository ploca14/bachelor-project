import { v4 as uuidv4 } from "uuid";

export class Question {
  constructor(
    public content: string,
    public readonly testId: string,
    private readonly _createdAt: Date = new Date(),
    public readonly id: string = uuidv4(),
  ) {}

  get createdAt() {
    return new Date(this._createdAt);
  }
}
