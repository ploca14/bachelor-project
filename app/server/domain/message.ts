import { v4 as uuidv4 } from "uuid";

export class Message {
  constructor(
    public readonly role: "human" | "ai",
    public readonly content: string,
    public readonly conversationId: string,
    private readonly _createdAt: Date = new Date(),
    public readonly id: string = uuidv4(),
  ) {}

  get createdAt() {
    return new Date(this._createdAt);
  }
}
