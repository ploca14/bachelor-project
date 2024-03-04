import { v4 as uuidv4 } from "uuid";
import { Message } from "~/server/domain/message";
import { ConversationDisabledError, InvalidMessageError } from "~/types/errors";

export class Conversation {
  constructor(
    public readonly name: string,
    public readonly fileIds: string[],
    public readonly userId: string,
    public readonly messages: Message[] = [],
    public readonly createdAt: Date = new Date(),
    public readonly id: string = uuidv4(),
  ) {}

  public addHumanMessage(content: string) {
    // Do not allow to send a message if the conversation is disabled
    if (this.isDisabled) {
      throw new ConversationDisabledError("The conversation is disabled");
    }

    // Do not allow to send two messages in a row
    const lastMessage = this.getLastMessage();
    if (lastMessage?.role === "human") {
      throw new InvalidMessageError("You can't send two messages in a row");
    }

    const message = new Message("human", content, this.id);
    this.messages.push(message);
    return message;
  }

  public addAiMessage(content: string) {
    const message = new Message("ai", content, this.id);
    this.messages.push(message);
    return message;
  }

  public getLastMessage() {
    return this.messages.at(-1);
  }

  public getPreviousMessages() {
    return this.messages.slice(0, -1);
  }

  // Disable the conversation if all the conversation files are deleted
  public get isDisabled() {
    return this.fileIds.length === 0;
  }
}
