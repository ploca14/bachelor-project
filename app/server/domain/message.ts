import { v4 as uuidv4 } from "uuid";

export class Message {
  constructor(
    readonly role: "human" | "ai",
    readonly content: string,
    readonly conversationId: string,
    readonly createdAt: Date = new Date(),
    readonly id: string = uuidv4(),
  ) {}
}
